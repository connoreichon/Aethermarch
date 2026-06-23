import { useState, useEffect } from 'react'
import { getBranchChoiceSummary, getFamiliarityThreatReduction } from '../systems/routeBranchSystem.js'

const RISK_LABEL = { low: 'bajo', medium: 'medio', high: 'alto' }
const RISK_COLOR = {
  low:    'var(--color-xp)',
  medium: 'var(--color-gold)',
  high:   'var(--color-hp)',
}

function ProsCons({ pros, cons }) {
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

function BranchOption({ option, knowledge, onChoose }) {
  const summary       = getBranchChoiceSummary({ knowledge })
  const riskColor     = RISK_COLOR[option.risk] ?? 'var(--color-stone-light)'
  const familiar      = getFamiliarityThreatReduction(knowledge)
  const effectiveThreat = (option.threatModifier ?? 0) + familiar

  return (
    <div className={`route-choice-option ${summary.status}`}>
      <div className="route-choice-option-header">
        <span className="route-choice-option-side">{option.label}</span>
        <span className="route-choice-option-name">{option.name}</span>
        <span className="route-choice-option-risk" style={{ color: riskColor }}>
          Riesgo {RISK_LABEL[option.risk] ?? '?'}
        </span>
      </div>

      {summary.status !== 'unknown' && (
        <div className={`route-choice-option-memory ${summary.status}`}>
          {summary.label}
          {familiar < 0 && (
            <span className="route-choice-option-familiar">
              {' · '}Amenaza {Math.abs(Math.round(effectiveThreat * 100)) < Math.abs(Math.round((option.threatModifier ?? 0) * 100))
                ? 'reducida por familiaridad'
                : 'conocida'}
            </span>
          )}
        </div>
      )}

      <ProsCons pros={option.pros} cons={option.cons} />

      <button
        className={`route-choice-option-button ${option.risk === 'high' ? '' : 'primary'}`}
        onClick={() => onChoose(option.id)}
      >
        {option.label === 'Izquierda' ? '← ' : option.label === 'Derecha' ? '→ ' : ''}
        Tomar {option.shortName ?? option.name}
      </button>
    </div>
  )
}

export default function RouteChoiceDock({
  pendingBranchChoice,
  branchKnowledge,
  onChooseBranch,
  onGoToMap,
}) {
  const [minimized, setMinimized] = useState(false)

  // Auto-expand when a new branch choice arrives
  useEffect(() => {
    if (pendingBranchChoice?.branchId) setMinimized(false)
  }, [pendingBranchChoice?.branchId])

  if (!pendingBranchChoice) return null

  const { name, description, options = [] } = pendingBranchChoice

  if (minimized) {
    return (
      <div className="route-choice-layer">
        <div className="route-choice-dock minimized">
          <div className="route-choice-minimized-bar" role="button" onClick={() => setMinimized(false)}>
            <span className="route-choice-minimized-icon">⑂</span>
            <span className="route-choice-minimized-title">Bifurcación — {name}</span>
            <span className="route-choice-minimized-hint">Decisión pendiente</span>
            <button
              className="route-choice-expand-btn"
              aria-label="Expandir elección de ruta"
              onClick={e => { e.stopPropagation(); setMinimized(false) }}
            >▲</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="route-choice-layer">
      <div className="route-choice-dock">
        <div className="route-choice-header">
          <span className="route-choice-fork-icon">⑂</span>
          <div className="route-choice-titles">
            <div className="route-choice-title">Bifurcación encontrada</div>
            <div className="route-choice-subtitle">{name}</div>
          </div>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            {onGoToMap && (
              <button className="route-choice-map-btn" onClick={onGoToMap}>
                Ver mapa
              </button>
            )}
            <button
              className="route-choice-minimize-btn"
              aria-label="Minimizar elección de ruta"
              onClick={() => setMinimized(true)}
            >—</button>
          </div>
        </div>

        {description && (
          <div className="route-choice-description">{description}</div>
        )}

        <div className="route-choice-options">
          {options.map(opt => (
            <BranchOption
              key={opt.id}
              option={opt}
              knowledge={branchKnowledge?.[opt.id] ?? null}
              onChoose={onChooseBranch}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
