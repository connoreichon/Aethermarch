import { useState, useEffect } from 'react'
import { getBranchChoiceSummary, getFamiliarityThreatReduction } from '../systems/routeBranchSystem.js'
import { chooseRecommendedBranchOption, getRecommendationReason } from '../systems/routeDecisionSystem.js'

export const BRANCH_CHOICE_SECONDS = 20

const RISK_LABEL = { low: 'bajo', medium: 'medio', high: 'alto' }
const RISK_COLOR = {
  low:    'var(--color-xp)',
  medium: 'var(--color-gold)',
  high:   'var(--color-hp)',
}

function ProsCons({ pros, cons }) {
  if (!pros?.length && !cons?.length) return null
  return (
    <div className="route-choice-option-proscons">
      {(pros ?? []).map((p, i) => (
        <div key={i} className="route-choice-proscon pro">+ {p}</div>
      ))}
      {(cons ?? []).map((c, i) => (
        <div key={i} className="route-choice-proscon con">— {c}</div>
      ))}
    </div>
  )
}

function BranchOption({ option, knowledge, isRecommended, onChoose }) {
  const summary         = getBranchChoiceSummary({ knowledge })
  const riskColor       = RISK_COLOR[option.risk] ?? 'var(--color-stone-light)'
  const familiar        = getFamiliarityThreatReduction(knowledge)
  const effectiveThreat = (option.threatModifier ?? 0) + familiar
  const arrowDir        = option.label === 'Izquierda' ? '← ' : option.label === 'Derecha' ? '→ ' : ''

  return (
    <div className={`route-choice-option ${summary.status}${isRecommended ? ' recommended' : ''}`}>

      <div className="route-choice-option-header">
        <span className="route-choice-option-side">{option.label}</span>
        <span className="route-choice-option-name">{option.name}</span>
        <div className="route-choice-option-badges">
          {isRecommended && (
            <span className="route-choice-recommended-badge">Recomendada</span>
          )}
          <span className="route-choice-option-risk" style={{ color: riskColor }}>
            ● {RISK_LABEL[option.risk] ?? '?'}
          </span>
        </div>
      </div>

      {summary.status !== 'unknown' && (
        <div className={`route-choice-option-memory ${summary.status}`}>
          {summary.label}
          {familiar < 0 && effectiveThreat < (option.threatModifier ?? 0) && (
            <span className="route-choice-option-familiar"> · Amenaza reducida por familiaridad</span>
          )}
        </div>
      )}

      <ProsCons pros={option.pros} cons={option.cons} />

      <button
        className={`route-choice-option-button${isRecommended ? ' primary' : option.risk !== 'high' ? ' primary' : ''}`}
        onClick={() => onChoose(option.id)}
      >
        {arrowDir}{option.shortName ?? option.name}
      </button>
    </div>
  )
}

export default function RouteChoiceDock({
  pendingBranchChoice,
  branchKnowledge,
  player,
  onChooseBranch,
  onGoToMap,
}) {
  const [minimized, setMinimized] = useState(false)
  const [timeLeft,  setTimeLeft]  = useState(BRANCH_CHOICE_SECONDS)
  const [chose,     setChose]     = useState(false)

  // Reset when a new branch arrives
  useEffect(() => {
    if (pendingBranchChoice?.branchId) {
      setMinimized(false)
      setTimeLeft(BRANCH_CHOICE_SECONDS)
      setChose(false)
    }
  }, [pendingBranchChoice?.branchId])

  // Countdown — auto-choose on 0
  useEffect(() => {
    if (!pendingBranchChoice || chose) return
    if (timeLeft <= 0) {
      const rec = chooseRecommendedBranchOption({
        options:        pendingBranchChoice.options ?? [],
        branchKnowledge,
        player,
      })
      if (rec) {
        setChose(true)
        onChooseBranch(rec.id)
      }
      return
    }
    const id = setTimeout(() => setTimeLeft(t => t - 1), 1000)
    return () => clearTimeout(id)
  }, [timeLeft, pendingBranchChoice?.branchId, chose])

  if (!pendingBranchChoice) return null

  const { name, description, options = [] } = pendingBranchChoice

  const recommended = chooseRecommendedBranchOption({ options, branchKnowledge, player })
  const reason      = getRecommendationReason({ recommended, player })
  const timerPct    = Math.max(0, (timeLeft / BRANCH_CHOICE_SECONDS) * 100)

  function handleChoose(optionId) {
    setChose(true)
    onChooseBranch(optionId)
  }

  if (minimized) {
    return (
      <div className="route-choice-layer">
        <div className="route-choice-dock minimized">
          <div className="route-choice-minimized-bar" role="button" onClick={() => setMinimized(false)}>
            <span className="route-choice-minimized-icon">⑂</span>
            <span className="route-choice-minimized-title">Bifurcación — {name}</span>
            <span className="route-choice-minimized-hint">{timeLeft}s</span>
            <button
              className="route-choice-expand-btn"
              aria-label="Expandir elección de ruta"
              onClick={e => { e.stopPropagation(); setMinimized(false) }}
            >▲</button>
          </div>
          <div className="route-choice-timer-bar-wrap">
            <div className="route-choice-timer-bar" style={{ width: `${timerPct}%` }}/>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="route-choice-layer">
      <div className="route-choice-dock">

        {/* Timer bar at top edge */}
        <div className="route-choice-timer-bar-wrap">
          <div className="route-choice-timer-bar" style={{ width: `${timerPct}%` }}/>
        </div>

        {/* Header */}
        <div className="route-choice-header">
          <span className="route-choice-fork-icon">⑂</span>
          <div className="route-choice-titles">
            <div className="route-choice-title">Bifurcación encontrada</div>
            <div className="route-choice-subtitle">{name}</div>
          </div>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <span className="route-choice-timer-label">{timeLeft}s</span>
            {onGoToMap && (
              <button className="route-choice-map-btn" onClick={onGoToMap}>
                Ver mapa
              </button>
            )}
            <button
              className="route-choice-minimize-btn"
              aria-label="Minimizar"
              onClick={() => setMinimized(true)}
            >—</button>
          </div>
        </div>

        {/* Auto-choice notice */}
        {recommended && (
          <div className="route-choice-auto-notice">
            Si no eliges, la caravana tomará <strong>{recommended.shortName ?? recommended.name}</strong>
            <span className="route-choice-auto-reason"> · {reason}</span>
          </div>
        )}

        {description && (
          <div className="route-choice-description">{description}</div>
        )}

        {/* Options */}
        <div className="route-choice-options">
          {options.map(opt => (
            <BranchOption
              key={opt.id}
              option={opt}
              knowledge={branchKnowledge?.[opt.id] ?? null}
              isRecommended={opt.id === recommended?.id}
              onChoose={handleChoose}
            />
          ))}
        </div>

      </div>
    </div>
  )
}
