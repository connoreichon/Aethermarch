import { useState, useEffect, useRef } from 'react'
import { ENEMIES } from '../data/gameData.js'
import { getAvailableStances } from '../systems/combatSystem.js'
import EnemyToken from './tokens/EnemyToken.jsx'

export default function CombatAlertModal({
  combat,
  player,
  onChooseStance,
  onGoToCaravan,
}) {
  const [minimized,        setMinimized]        = useState(false)
  const [remainingSeconds, setRemainingSeconds] = useState(0)
  const autoResolvedRef = useRef(false)
  const resolvedRef     = useRef(false)

  // Stable countdown based on absolute decisionEndsAt timestamp
  useEffect(() => {
    if (!combat || combat.status !== 'awaiting_choice') {
      autoResolvedRef.current = false
      return
    }
    autoResolvedRef.current = false

    function tick() {
      const ms   = combat.decisionEndsAt ? Math.max(0, combat.decisionEndsAt - Date.now()) : 0
      const secs = Math.ceil(ms / 1000)
      setRemainingSeconds(secs)
      if (ms <= 0 && !autoResolvedRef.current) {
        autoResolvedRef.current = true
        onChooseStance('equilibrada', { auto: true })
      }
    }

    tick()
    const id = setInterval(tick, 250)
    return () => clearInterval(id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [combat?.status, combat?.decisionEndsAt])

  // Reset resolved ref when new combat starts
  useEffect(() => {
    if (combat?.status === 'awaiting_choice') resolvedRef.current = false
  }, [combat?.status])

  if (!combat || (combat.status !== 'awaiting_choice' && combat.status !== 'resolved')) return null

  const isResolved = combat.status === 'resolved'
  const enemy      = ENEMIES[combat.enemyId]
  const stances    = getAvailableStances()
  const decSecs    = combat.decisionSeconds ?? 6
  const progress   = isResolved ? 0 : Math.max(0, (remainingSeconds / decSecs) * 100)

  return (
    <div className="combat-alert-layer">
      <div className={`combat-alert-dock${minimized ? ' minimized' : ''}`}>

        {/* Header — always visible */}
        <div className="combat-dock-header">
          <svg width="14" height="14" viewBox="0 0 18 18" style={{ flexShrink: 0 }}>
            <path d="M9 2 L16 15 H2 Z" fill="none" stroke="rgba(214,80,60,0.9)" strokeWidth="1.5"/>
            <rect x="8.2" y="7" width="1.6" height="5" fill="rgba(214,80,60,0.9)" rx="0.5"/>
            <circle cx="9" cy="13.5" r="0.9" fill="rgba(214,80,60,0.9)"/>
          </svg>
          <span style={{ fontSize: '0.66rem', color: 'var(--color-hp)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            {isResolved ? 'Combate resuelto' : `⚔ ${enemy?.name ?? '—'}`}
          </span>
          {!isResolved && (
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: remainingSeconds <= 2 ? 'var(--color-hp)' : 'var(--color-ember)', marginLeft: 4 }}>
              {remainingSeconds}s
            </span>
          )}
          <button className="combat-dock-min-btn" onClick={() => setMinimized(m => !m)}>
            {minimized ? '▲' : '▼'}
          </button>
        </div>

        {/* Countdown bar — only when awaiting choice */}
        {!isResolved && !minimized && (
          <div style={{ height: 2, background: 'rgba(98,107,111,0.2)' }}>
            <div style={{
              height: '100%',
              background: remainingSeconds <= 2 ? 'var(--color-hp)' : 'var(--color-ember)',
              width: `${progress}%`,
              transition: 'width 0.25s linear',
            }} />
          </div>
        )}

        {/* Expanded body */}
        {!minimized && !isResolved && (
          <div className="combat-dock-body">
            {/* Enemy + attack */}
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
              <EnemyToken enemyId={combat.enemyId} size={40} />
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-parchment)', fontWeight: 500 }}>
                  {enemy?.name ?? combat.enemyId}
                </div>
                <div style={{ fontSize: '0.58rem', color: 'var(--color-ember)', marginTop: 2 }}>
                  {combat.attack?.name ?? '—'}
                </div>
                {player && (
                  <div style={{ fontSize: '0.56rem', color: 'var(--color-stone-light)', marginTop: 2 }}>
                    HP: <span style={{ color: player.hp < player.maxHp * 0.3 ? 'var(--color-hp)' : 'var(--color-parchment)' }}>
                      {player.hp}/{player.maxHp}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Stance buttons */}
            <div style={{ fontSize: '0.52rem', color: 'var(--color-stone-light)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>
              Elige postura:
            </div>
            <div className="combat-dock-stances">
              {stances.map(stance => (
                <button
                  key={stance.id}
                  className="combat-dock-stance-btn"
                  onClick={() => onChooseStance(stance.id)}
                >
                  {stance.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Result when resolved */}
        {!minimized && isResolved && combat.result && (
          <div className="combat-dock-result">
            {combat.result.text ?? 'El combate queda atrás.'}
          </div>
        )}

        {/* Footer — go to caravana */}
        {!minimized && !isResolved && (
          <div className="combat-dock-footer">
            <button className="combat-dock-goto-btn" onClick={onGoToCaravan}>
              Ver en Caravana
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
