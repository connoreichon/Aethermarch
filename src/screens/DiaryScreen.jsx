import { RESOURCES, BIOMES } from '../data/gameData.js'

const MODE_LABELS = {
  free_march: 'Marcha Libre',
  hunt:       'Caza',
  gather:     'Recolección',
  explore:    'Exploración',
}

const BIOME_TAG = {
  forest: { label: 'Bosque Rúnico',   color: 'var(--color-xp)'    },
  coast:  { label: 'Costa Arcana',    color: 'var(--color-magic)'  },
  forge:  { label: 'Forja Arcanista', color: 'var(--color-ember)'  },
}

export default function DiaryScreen({ diary }) {
  const hasEntries = diary && diary.length > 0

  if (!hasEntries) {
    return (
      <div className="screen-scroll">
        <div className="panel">
          <div className="panel-title">Crónica de marcha</div>
          <div className="diary-empty">
            <div className="diary-empty-icon">📜</div>
            <div className="diary-empty-title">La caravana aún no ha registrado ningún tramo.</div>
            <div className="diary-empty-desc">
              Cuando completes tu primera jornada, aquí quedará el rastro de todo lo vivido.
            </div>
            <ul className="diary-coming-list">
              <li>Tramos completados y pasos recorridos</li>
              <li>Hallazgos y sendas reveladas</li>
              <li>Rastros hostiles detectados</li>
              <li>Recursos recolectados</li>
              <li>Palabras de tu criatura compañera</li>
            </ul>
          </div>
        </div>
        <div className="panel">
          <div className="panel-title">Próximas crónicas</div>
          <p style={{ fontSize:'0.72rem', color:'var(--color-stone-light)', lineHeight:1.6, fontStyle:'italic' }}>
            Cada tramo dejará una entrada. La crónica recordará los caminos recorridos,
            los rastros cruzados y los materiales encontrados.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="screen-scroll">
      <div className="panel">
        <div className="panel-title">Crónica de marcha</div>
        <div className="diary-chronicle-list">
          {[...diary].reverse().map((entry, idx) => {
            const resEntries = Object.entries(entry.rewards?.resources ?? {})
            const xp         = entry.rewards?.xp ?? 0
            const biomeTag   = BIOME_TAG[entry.biomeId]
            const isEcho     = entry.type === 'march_echo'
            const isPoi      = entry.type === 'poi'
            const isContract = entry.type === 'contract'

            return (
              <div key={entry.id} className={`diary-entry-card${idx === 0 ? ' latest' : ''}`}>

                {/* Título */}
                <div className="diary-entry-title">
                  {isEcho     && <span className="diary-echo-badge">Eco</span>}
                  {isPoi      && <span className="diary-poi-badge">Lugar</span>}
                  {isContract && <span className="diary-contract-badge">Contrato</span>}
                  {entry.title ?? `Tramo ${entry.tramoNumber}`}
                </div>

                {/* Nombre del contrato */}
                {isContract && entry.contractTitle && (
                  <div style={{ fontSize:'0.65rem', color:'var(--color-parchment)', fontStyle:'italic', marginBottom:3 }}>
                    {entry.contractTitle}
                  </div>
                )}

                {/* Resultado del contrato */}
                {isContract && entry.outcomeLabel && (
                  <div className={`diary-contract-outcome ${entry.outcome ?? ''}`}>
                    {entry.outcomeLabel}
                    {entry.successChance != null && (
                      <span style={{ fontSize:'0.54rem', color:'var(--color-stone-light)', marginLeft:6, fontWeight:400 }}>
                        Prob. estimada: {entry.successChance}%
                      </span>
                    )}
                  </div>
                )}

                {/* Meta */}
                <div className="diary-entry-meta">
                  {!isEcho && !isPoi && !isContract && (
                    <>
                      <span>{MODE_LABELS[entry.modeId] ?? entry.modeId}</span>
                      <span className="diary-entry-meta-sep">·</span>
                    </>
                  )}
                  {isContract ? (
                    <>
                      <span>{entry.contractorName ?? '—'}</span>
                      {entry.sectorName && (
                        <>
                          <span className="diary-entry-meta-sep">·</span>
                          <span>{entry.sectorName}</span>
                        </>
                      )}
                    </>
                  ) : isPoi ? (
                    <span>{entry.sectorName ?? '—'}</span>
                  ) : (
                    <span>{entry.steps} pasos</span>
                  )}
                  {!isPoi && !isContract && biomeTag && (
                    <>
                      <span className="diary-entry-meta-sep">·</span>
                      <span style={{ color: biomeTag.color }}>{biomeTag.label}</span>
                    </>
                  )}
                </div>
                {/* Estrato y profundidad */}
                {entry.stratumName && !isPoi && !isContract && (
                  <div style={{ fontSize:'0.54rem', color:'var(--color-stone-light)', marginTop:2, opacity:0.62 }}>
                    {entry.stratumName.split('·')[0].trim()}
                    {entry.depthMeters ? ` · ${entry.depthMeters} m` : ''}
                  </div>
                )}

                {/* Resumen narrativo */}
                <p className="diary-entry-summary">{entry.summaryText}</p>

                {/* Consecuencia de contrato fallido */}
                {isContract && entry.consequence && (
                  <div style={{ fontSize:'0.58rem', color:'var(--color-stone-light)', fontStyle:'italic',
                                marginTop:4, paddingTop:4, borderTop:'1px solid rgba(98,107,111,0.18)' }}>
                    {entry.consequence.text}
                  </div>
                )}

                {/* HP recuperado en POI */}
                {isPoi && (entry.hpGain ?? 0) > 0 && (
                  <div style={{ fontSize:'0.6rem', color:'var(--color-xp)', marginBottom:5 }}>
                    +{entry.hpGain} HP recuperados
                  </div>
                )}

                {/* Flavor de eco */}
                {isEcho && entry.events?.length > 0 && (
                  <div className="diary-echo-events">
                    {entry.events.map((ev, i) => (
                      <div key={i} className="diary-echo-event-line">{ev}</div>
                    ))}
                  </div>
                )}

                {/* Combates */}
                {!isEcho && !isPoi && !isContract && entry.combatResults?.length > 0 && (
                  <div className="diary-entry-combat">
                    {entry.combatResults.map((cr, ci) => (
                      <span key={ci}>
                        ⚔ {cr.enemyName ?? cr.enemyId}
                        {cr.finalDamage > 0 ? ` −${cr.finalDamage}HP` : ' (ileso)'}
                      </span>
                    ))}
                  </div>
                )}

                {/* Recompensas */}
                {(xp > 0 || resEntries.length > 0) && (
                  <div className="diary-entry-rewards">
                    {xp > 0 && (
                      <span style={{ color:'var(--color-xp)' }}>+{xp} XP</span>
                    )}
                    {resEntries.map(([id, qty]) => (
                      <span key={id} style={{ color:'var(--color-gold)' }}>
                        +{qty}× {RESOURCES[id]?.name ?? id.replace(/_/g,' ')}
                      </span>
                    ))}
                  </div>
                )}

                {/* Senda descubierta */}
                {entry.discovery && (
                  <div className="diary-entry-discovery">
                    Nueva senda: {entry.discovery.sectorName}
                  </div>
                )}

                {/* Fecha */}
                <div className="diary-entry-date">
                  {new Date(entry.completedAt).toLocaleDateString('es-ES', {
                    day: '2-digit', month: 'short', year: 'numeric',
                  })}
                </div>

              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
