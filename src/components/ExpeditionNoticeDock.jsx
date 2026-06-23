import { useEffect } from 'react'

const NOTICE_PRIORITY = {
  route_complete: 0, route_discovery: 1, segment_complete: 2,
  major_reward: 3, rest_stop: 4, danger_passed: 5, branch_chosen: 6,
}

function getTopNotice(notices) {
  const now    = Date.now()
  const active = notices.filter(n => !n.expiresAt || n.expiresAt > now)
  if (!active.length) return null
  return [...active].sort((a, b) =>
    (NOTICE_PRIORITY[a.type] ?? 99) - (NOTICE_PRIORITY[b.type] ?? 99)
  )[0]
}

function formatRewards(rewards) {
  if (!rewards) return null
  const parts = []
  if (rewards.resources) {
    Object.entries(rewards.resources).forEach(([k, v]) => {
      if (v > 0) parts.push(`${k.replace(/_/g, ' ')} ×${v}`)
    })
  }
  if ((rewards.xp ?? 0) > 0) parts.push(`+${rewards.xp} XP`)
  return parts.length ? parts.join(' · ') : null
}

function NoticeIcon({ type }) {
  const icons = {
    route_complete:  '✦',
    route_discovery: '◈',
    major_reward:    '◇',
    segment_complete: '›',
    rest_stop:       '○',
    danger_passed:   '△',
  }
  return (
    <span className={`expedition-notice-icon expedition-notice-icon-${type}`}>
      {icons[type] ?? '·'}
    </span>
  )
}

export default function ExpeditionNoticeDock({
  notices,
  combat,
  currentTab,
  branchChoiceActive,
  routeStopActive,
  onDismiss,
  onMinimize,
  onGoToMap,
  onGoToCaravan,
  onGoToInventory,
}) {
  const active = getTopNotice(notices)

  // Auto-dismiss expired notices
  useEffect(() => {
    if (!active?.autoDismiss || !active?.expiresAt) return
    const remaining = Math.max(0, active.expiresAt - Date.now())
    if (remaining <= 0) { onDismiss(active.id); return }
    const t = setTimeout(() => onDismiss(active.id), remaining)
    return () => clearTimeout(t)
  }, [active?.id, active?.expiresAt])

  if (!active) return null

  const combatActive = combat?.status === 'awaiting_choice' || combat?.status === 'resolved'
  const inCaravan    = currentTab === 'caravana'

  // Suppress segment_complete entirely when caravan handles it visually
  // or when combat is demanding full attention
  // Suppress when branch choice is pending (RouteChoiceDock takes visual priority)
  // Exception: route_complete and branch_chosen still show
  const suppress =
    (inCaravan && active.type === 'segment_complete') ||
    (combatActive && active.type !== 'route_complete') ||
    (branchChoiceActive && active.type !== 'route_complete' && active.type !== 'branch_chosen') ||
    (routeStopActive && active.type === 'segment_complete')

  if (suppress) return null

  const shouldMinimize = active.minimized

  const dockClass = [
    'expedition-notice-dock',
    active.type.replace('_', '-'),
    shouldMinimize ? 'minimized' : '',
  ].filter(Boolean).join(' ')

  // Push notice above combat dock when both are visible
  const bottomOffset = (combatActive && active.type === 'route_complete') ? 236 : 64

  const rewardText = formatRewards(active.rewards)

  return (
    <div className="expedition-notice-layer" style={{ bottom: bottomOffset }}>
      <div className={dockClass}>

        {shouldMinimize ? (
          /* ── Minimizada ── */
          <div className="expedition-notice-minimized-bar"
               onClick={() => onMinimize(active.id)}
               role="button">
            <NoticeIcon type={active.type}/>
            <span className="expedition-notice-minimized-title">{active.title}</span>
            {active.subtitle && (
              <span className="expedition-notice-minimized-sub">{active.subtitle}</span>
            )}
            <button
              className="expedition-notice-close"
              onClick={e => { e.stopPropagation(); onDismiss(active.id) }}
              aria-label="Cerrar aviso">×</button>
          </div>
        ) : (
          /* ── Expandida ── */
          <>
            <div className="expedition-notice-header">
              <NoticeIcon type={active.type}/>
              <div className="expedition-notice-titles">
                <div className="expedition-notice-title">{active.title}</div>
                {active.subtitle && (
                  <div className="expedition-notice-subtitle">{active.subtitle}</div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button
                  className="expedition-notice-close"
                  onClick={() => onMinimize(active.id)}
                  aria-label="Minimizar aviso"
                  style={{ fontSize: '0.7rem', opacity: 0.6 }}>—</button>
                <button
                  className="expedition-notice-close"
                  onClick={() => onDismiss(active.id)}
                  aria-label="Cerrar aviso">×</button>
              </div>
            </div>

            {active.body && (
              <div className="expedition-notice-body">{active.body}</div>
            )}

            {active.type === 'segment_complete' && active.nextSegmentName && (
              <div className="expedition-notice-next">
                Siguiente: <strong>{active.nextSegmentName}</strong>
              </div>
            )}

            {rewardText && (
              <div className="expedition-notice-rewards">{rewardText}</div>
            )}

            <div className="expedition-notice-actions">
              {active.type === 'segment_complete' && (
                <>
                  <button className="expedition-notice-action"
                          onClick={() => { onGoToMap(); onDismiss(active.id) }}>
                    Ver ruta
                  </button>
                  <button className="expedition-notice-action primary"
                          onClick={() => { onGoToCaravan(); onDismiss(active.id) }}>
                    Ver caravana
                  </button>
                </>
              )}

              {active.type === 'route_complete' && (
                <>
                  <button className="expedition-notice-action"
                          onClick={() => { onGoToMap(); onDismiss(active.id) }}>
                    Ver mapa
                  </button>
                  <button className="expedition-notice-action primary"
                          onClick={() => { onGoToCaravan(); onDismiss(active.id) }}>
                    Ver resumen
                  </button>
                </>
              )}

              {active.type === 'route_discovery' && (
                <button className="expedition-notice-action primary"
                        onClick={() => { onGoToMap(); onDismiss(active.id) }}>
                  Ver en mapa
                </button>
              )}

              {active.type === 'major_reward' && (
                <button className="expedition-notice-action primary"
                        onClick={() => { onGoToInventory(); onDismiss(active.id) }}>
                  Ver inventario
                </button>
              )}

              {active.type === 'rest_stop' && (
                <button className="expedition-notice-action primary"
                        onClick={() => { onGoToCaravan(); onDismiss(active.id) }}>
                  Ver caravana
                </button>
              )}
            </div>

            {active.autoDismiss && active.expiresAt && active.createdAt && (
              <div className="expedition-notice-progress">
                <div
                  className="expedition-notice-progress-fill"
                  style={{
                    animationDuration: `${active.expiresAt - active.createdAt}ms`,
                  }}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
