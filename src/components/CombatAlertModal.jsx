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
  const decisionSeconds = combat?.decisionSeconds ?? 6
  const [remainingSeconds, setRemainingSeconds] = useState(decisionSeconds)
  const autoResolvedRef = useRef(false)

  useEffect(() => {
    if (!combat || combat.status !== 'awaiting_choice') return
    autoResolvedRef.current = false
    setRemainingSeconds(decisionSeconds)
    const id = setInterval(() => {
      setRemainingSeconds(prev => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [combat?.status])

  useEffect(() => {
    if (!combat || combat.status !== 'awaiting_choice') return
    if (remainingSeconds > 0) return
    if (autoResolvedRef.current) return
    autoResolvedRef.current = true
    onChooseStance('equilibrada', { auto: true })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingSeconds, combat?.status])

  if (!combat || combat.status !== 'awaiting_choice') return null

  const enemy   = ENEMIES[combat.enemyId]
  const stances = getAvailableStances()
  const resolved = combat.status === 'resolved'

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9000,
      background: 'rgba(0,0,0,0.82)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '0 16px',
    }}>
      <div style={{
        width: '100%', maxWidth: 340,
        background: '#0D0A07',
        border: '1px solid rgba(180,40,40,0.55)',
        borderRadius: 8,
        boxShadow: '0 0 32px rgba(180,40,40,0.22)',
        overflow: 'hidden',
      }}>
        {/* Cabecera */}
        <div style={{
          background: 'rgba(180,40,40,0.18)',
          borderBottom: '1px solid rgba(180,40,40,0.3)',
          padding: '10px 14px',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <svg width="18" height="18" viewBox="0 0 18 18" style={{ flexShrink: 0 }}>
            <path d="M9 2 L16 15 H2 Z" fill="none" stroke="rgba(214,80,60,0.9)" strokeWidth="1.5"/>
            <rect x="8.2" y="7" width="1.6" height="5" fill="rgba(214,80,60,0.9)" rx="0.5"/>
            <circle cx="9" cy="13.5" r="0.9" fill="rgba(214,80,60,0.9)"/>
          </svg>
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: '0.72rem', color: 'var(--color-hp)',
              textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600,
            }}>
              Combate en la ruta
            </div>
            <div style={{ fontSize: '0.58rem', color: 'var(--color-stone-light)', marginTop: 1 }}>
              Estás fuera de la Caravana
            </div>
          </div>
        </div>

        {/* Enemigo */}
        <div style={{
          padding: '12px 14px 8px',
          display: 'flex', gap: 12, alignItems: 'center',
        }}>
          <EnemyToken enemyId={combat.enemyId} size={44} />
          <div>
            <div style={{ fontSize: '0.82rem', color: 'var(--color-parchment)', fontWeight: 500 }}>
              {enemy?.name ?? combat.enemyId}
            </div>
            <div style={{ fontSize: '0.6rem', color: 'var(--color-ember)', marginTop: 2 }}>
              {combat.attack?.name ?? '—'}
            </div>
            {player && (
              <div style={{ fontSize: '0.58rem', color: 'var(--color-stone-light)', marginTop: 3 }}>
                HP: <span style={{ color: player.hp < player.maxHp * 0.3 ? 'var(--color-hp)' : 'var(--color-parchment)' }}>
                  {player.hp} / {player.maxHp}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Cuenta atrás */}
        <div style={{ padding: '4px 14px 8px' }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            fontSize: '0.58rem', color: 'var(--color-stone-light)',
            marginBottom: 5,
          }}>
            <span>Reacción automática en {remainingSeconds} s</span>
            <span style={{
              fontSize: '0.72rem', fontWeight: 700,
              color: remainingSeconds <= 2 ? 'var(--color-hp)' : 'var(--color-ember)',
            }}>
              {remainingSeconds}
            </span>
          </div>
          <div style={{
            height: 3, background: 'rgba(98,107,111,0.25)', borderRadius: 2,
          }}>
            <div style={{
              height: '100%', borderRadius: 2,
              background: remainingSeconds <= 2 ? 'var(--color-hp)' : 'var(--color-ember)',
              width: `${(remainingSeconds / decisionSeconds) * 100}%`,
              transition: 'width 1s linear',
            }} />
          </div>
        </div>

        {/* Posturas */}
        <div style={{ padding: '4px 14px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{
            fontSize: '0.54rem', color: 'var(--color-stone-light)',
            textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2,
          }}>
            Elige postura:
          </div>
          {stances.map(stance => (
            <button
              key={stance.id}
              onClick={() => onChooseStance(stance.id)}
              style={{
                background: 'rgba(98,107,111,0.12)',
                border: '1px solid rgba(98,107,111,0.28)',
                borderRadius: 5,
                padding: '7px 10px',
                textAlign: 'left',
                cursor: 'pointer',
                color: 'var(--color-parchment)',
              }}
            >
              <div style={{ fontSize: '0.7rem', fontWeight: 500 }}>{stance.name}</div>
              <div style={{ fontSize: '0.57rem', color: 'var(--color-stone-light)', marginTop: 1 }}>
                {stance.description}
              </div>
            </button>
          ))}
        </div>

        {/* Ir a Caravana */}
        <div style={{
          borderTop: '1px solid rgba(98,107,111,0.18)',
          padding: '8px 14px',
          textAlign: 'center',
        }}>
          <button
            onClick={onGoToCaravan}
            style={{
              background: 'none',
              border: '1px solid rgba(98,107,111,0.28)',
              borderRadius: 4,
              padding: '5px 14px',
              fontSize: '0.6rem',
              color: 'var(--color-mist)',
              cursor: 'pointer',
            }}
          >
            Ver en Caravana
          </button>
        </div>
      </div>
    </div>
  )
}
