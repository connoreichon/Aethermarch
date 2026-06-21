import { useState } from 'react'
import { BIOMES, POIS, RESOURCES } from '../data/gameData.js'

const THREAT_LABEL  = { low: 'Baja', medium: 'Media', high: 'Alta' }
const MASTERY_LABEL = ['Sin rastro', 'Conocido', 'Familiar', 'Dominado', 'Legendario']

const THREAT_COLOR = {
  low:    'var(--color-xp)',
  medium: 'var(--color-ember)',
  high:   'var(--color-hp)',
}

const NODE_POS = {
  sector_aethel_edge:    { x: 50, y: 12 },
  sector_mist_root:      { x: 15, y: 45 },
  sector_salt_beacon:    { x: 85, y: 45 },
  sector_sleeping_forge: { x: 12, y: 80 },
  sector_tide_rock:      { x: 88, y: 80 },
  sector_coal_bastion:   { x: 50, y: 83 },
}

const CONNECTIONS = [
  ['sector_aethel_edge',    'sector_mist_root'],
  ['sector_aethel_edge',    'sector_salt_beacon'],
  ['sector_mist_root',      'sector_sleeping_forge'],
  ['sector_salt_beacon',    'sector_tide_rock'],
  ['sector_sleeping_forge', 'sector_coal_bastion'],
  ['sector_tide_rock',      'sector_coal_bastion'],
]

function BiomeIcon({ biomeId }) {
  if (biomeId === 'coast') return (
    <svg width="16" height="16" viewBox="0 0 16 16">
      <path d="M2 7 Q5 4 8 7 Q11 10 14 7" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M2 11 Q5 8 8 11 Q11 14 14 11" stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.6"/>
    </svg>
  )
  if (biomeId === 'forge') return (
    <svg width="16" height="16" viewBox="0 0 16 16">
      <path d="M5 14 V8 L3 5 H13 L11 8 V14 Z" fill="currentColor" opacity="0.55"/>
      <path d="M8 4 Q7.5 2 8 0.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.75"/>
    </svg>
  )
  return (
    <svg width="16" height="16" viewBox="0 0 16 16">
      <path d="M8 2 L10.5 8 H9 L11.5 13 H4.5 L7 8 H5.5 Z" fill="currentColor" opacity="0.6"/>
    </svg>
  )
}

function NodeFogIcon() {
  return (
    <svg width="18" height="14" viewBox="0 0 18 14" style={{ opacity:0.45 }}>
      <path d="M1 4 Q5 1 9 4 Q13 7 17 4" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      <path d="M2 9 Q6 6 9 9 Q12 12 16 9"  stroke="currentColor" strokeWidth="0.8" fill="none" strokeLinecap="round"/>
    </svg>
  )
}

const BIOME_ICON_COLOR = {
  forest: 'var(--color-xp)',
  coast:  'var(--color-magic)',
  forge:  'var(--color-ember)',
}

export default function MapScreen({ sectors }) {
  const [selectedId, setSelectedId] = useState(null)

  const selected      = sectors.find(s => s.id === selectedId)
  const biome         = selected ? BIOMES[selected.biomeId] : null
  const poi           = selected ? POIS[selected.poiId]     : null
  const recentlyFound = sectors.filter(s => s.recentlyDiscovered)

  function handleSelect(id) {
    setSelectedId(prev => prev === id ? null : id)
  }

  return (
    <div className="atlas-screen">

      {recentlyFound.map(s => (
        <div key={s.id} className="atlas-discovery-banner">
          <div style={{ fontSize:'0.56rem', color:'var(--color-gold)', textTransform:'uppercase',
                        letterSpacing:'0.09em', marginBottom:2 }}>
            Nueva senda cartografiada
          </div>
          <div style={{ fontSize:'0.82rem', color:'var(--color-parchment)', fontWeight:500 }}>
            {s.name}
          </div>
          <div style={{ fontSize:'0.6rem', color:'var(--color-mist)', marginTop:2 }}>
            {BIOMES[s.biomeId]?.name ?? '—'}
          </div>
        </div>
      ))}

      <div className="atlas-wrapper">
        <div className="atlas-panel-title">Atlas de la senda</div>

        <div className="atlas-board">
          <svg className="atlas-connections" viewBox="0 0 100 100" preserveAspectRatio="none">
            {CONNECTIONS.map(([aId, bId]) => {
              const aPos = NODE_POS[aId]
              const bPos = NODE_POS[bId]
              if (!aPos || !bPos) return null
              const aSec = sectors.find(s => s.id === aId)
              const bSec = sectors.find(s => s.id === bId)
              const both = aSec?.discovered && bSec?.discovered
              return (
                <line
                  key={`${aId}-${bId}`}
                  x1={aPos.x} y1={aPos.y}
                  x2={bPos.x} y2={bPos.y}
                  stroke={both ? 'rgba(184,148,74,0.4)' : 'rgba(98,107,111,0.2)'}
                  strokeWidth="0.9"
                  strokeDasharray={both ? undefined : '2 2'}
                />
              )
            })}
          </svg>

          {sectors.map(s => {
            const pos = NODE_POS[s.id]
            if (!pos) return null
            const isSelected = s.id === selectedId
            const nodeClass = [
              'atlas-sector-node',
              s.discovered ? 'discovered' : 'hidden',
              isSelected            ? 'selected'            : '',
              s.recentlyDiscovered  ? 'recently-discovered' : '',
            ].filter(Boolean).join(' ')

            return (
              <button
                key={s.id}
                className={nodeClass}
                style={{ top: `calc(${pos.y}% - 23px)`, left: `calc(${pos.x}% - 23px)` }}
                onClick={() => handleSelect(s.id)}
              >
                <div className="atlas-node-circle">
                  {s.discovered ? (
                    <div className="atlas-node-icon" style={{ color: BIOME_ICON_COLOR[s.biomeId] ?? 'var(--color-parchment)' }}>
                      <BiomeIcon biomeId={s.biomeId} />
                    </div>
                  ) : (
                    <div className="atlas-node-fog"><NodeFogIcon /></div>
                  )}
                </div>
                {s.recentlyDiscovered && (
                  <div className="atlas-node-new-badge">Nuevo</div>
                )}
                <div className="atlas-node-label">
                  {s.discovered ? s.name : '???'}
                </div>
              </button>
            )
          })}
        </div>

        <div className="atlas-footer">
          {sectors.filter(s => s.discovered).length} / {sectors.length} sendas
          <span style={{ opacity:0.45, marginLeft:6 }}>· La bruma cede con cada tramo</span>
        </div>
      </div>

      {selected && (
        <div className="sector-detail">
          {selected.discovered ? (
            <>
              <div className="sector-detail-title">
                {selected.recentlyDiscovered && (
                  <span className="map-sector-new-badge" style={{ marginRight:8 }}>Nuevo</span>
                )}
                {selected.name}
              </div>
              <div className="sector-detail-row">
                <span className="sector-detail-key">Bioma</span>
                <span>{biome?.name}</span>
              </div>
              <div className="sector-detail-row">
                <span className="sector-detail-key">Visitas</span>
                <span>{selected.visits}</span>
              </div>
              <div className="sector-detail-row">
                <span className="sector-detail-key">Dominio</span>
                <span>{selected.mastery} · {MASTERY_LABEL[selected.masteryLevel ?? 0]}</span>
              </div>
              <div className="sector-detail-row">
                <span className="sector-detail-key">Amenaza</span>
                <span style={{ color: THREAT_COLOR[selected.threat] ?? 'var(--color-stone-light)' }}>
                  {THREAT_LABEL[selected.threat] ?? '—'}
                </span>
              </div>
              {poi && (
                <div className="sector-detail-row">
                  <span className="sector-detail-key">Lugar</span>
                  <span>{poi.name}</span>
                </div>
              )}
              <div className="sector-detail-row">
                <span className="sector-detail-key">Recursos</span>
                <span style={{ fontSize:'0.65rem' }}>
                  {(selected.resources ?? []).map(r => RESOURCES[r]?.name).filter(Boolean).join(', ')}
                </span>
              </div>
              {(selected.connections ?? []).length > 0 && (
                <div className="sector-detail-row">
                  <span className="sector-detail-key">Sendas hacia</span>
                  <span style={{ fontSize:'0.63rem' }}>
                    {(selected.connections ?? []).map(cid => {
                      const cs = sectors.find(s => s.id === cid)
                      return cs?.discovered ? cs.name : 'senda oculta'
                    }).join(', ')}
                  </span>
                </div>
              )}
              {biome?.description && (
                <div style={{ marginTop:8, fontSize:'0.63rem', color:'var(--color-stone-light)',
                              fontStyle:'italic', lineHeight:1.45 }}>
                  {biome.description}
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign:'center', padding:'10px 0' }}>
              <NodeFogIcon />
              <div style={{ marginTop:8, fontSize:'0.7rem', color:'var(--color-stone-light)',
                            fontStyle:'italic', lineHeight:1.5 }}>
                Este lugar no ha sido cartografiado.<br />
                Explora el camino para revelar su senda.
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  )
}
