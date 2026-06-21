import { useState } from 'react'
import { BIOMES, POIS, RESOURCES, ENEMIES, ABYSS_STRATA } from '../data/gameData.js'
import { getStratumProgress } from '../systems/abyssSystem.js'

const THREAT_LABEL  = { low: 'Baja', medium: 'Media', high: 'Alta' }
const MASTERY_LABEL = ['Sin rastro', 'Conocido', 'Familiar', 'Dominado', 'Legendario']
const THREAT_COLOR  = { low: 'var(--color-xp)', medium: 'var(--color-ember)', high: 'var(--color-hp)' }

// Posiciones en espiral descendente (x%, y%)
const ABYSS_NODE_POS = {
  sector_aethel_edge:         { x: 50, y: 10 },
  sector_mist_root:           { x: 26, y: 26 },
  sector_runic_guard_ruins:   { x: 20, y: 31 },
  sector_hollow_mushroom_cave:{ x: 44, y: 35 },
  sector_salt_beacon:         { x: 74, y: 39 },
  sector_tide_rock:           { x: 28, y: 54 },
  sector_sleeping_forge:      { x: 72, y: 69 },
  sector_coal_bastion:        { x: 50, y: 83 },
}

const CONNECTIONS = [
  ['sector_aethel_edge',        'sector_mist_root'],
  ['sector_aethel_edge',        'sector_salt_beacon'],
  ['sector_mist_root',          'sector_runic_guard_ruins'],
  ['sector_mist_root',          'sector_sleeping_forge'],
  ['sector_runic_guard_ruins',  'sector_hollow_mushroom_cave'],
  ['sector_salt_beacon',        'sector_tide_rock'],
  ['sector_sleeping_forge',     'sector_coal_bastion'],
  ['sector_tide_rock',          'sector_coal_bastion'],
]

// Bandas de estrato: y% de inicio/fin y metadatos
const STRATA_BANDS = [
  { id: 'stratum_01', cssClass: 'stratum-1', label: 'Estrato I',   depth: '120 m',  yMid: 18 },
  { id: 'stratum_02', cssClass: 'stratum-2', label: 'Estrato II',  depth: '340 m',  yMid: 50 },
  { id: 'stratum_03', cssClass: 'stratum-3', label: 'Estrato III', depth: '690 m',  yMid: 82 },
]

// Fallback para saves sin campos de Abismo (merge en handleContinue lo resuelve,
// pero se mantiene por seguridad en renderizado).
const STRATUM_FALLBACK = {
  sector_aethel_edge:          { stratumId: 'stratum_01', stratumName: 'Estrato I · Linde de Raíz',    depth: 1, depthMeters: 120, lootTier: 1 },
  sector_mist_root:            { stratumId: 'stratum_01', stratumName: 'Estrato I · Linde de Raíz',    depth: 1, depthMeters: 180, lootTier: 1 },
  sector_runic_guard_ruins:    { stratumId: 'stratum_01', stratumName: 'Estrato I · Linde de Raíz',    depth: 1, depthMeters: 210, lootTier: 1 },
  sector_hollow_mushroom_cave: { stratumId: 'stratum_01', stratumName: 'Estrato I · Linde de Raíz',    depth: 1, depthMeters: 235, lootTier: 1 },
  sector_salt_beacon:          { stratumId: 'stratum_02', stratumName: 'Estrato II · Cornisa Salina',   depth: 2, depthMeters: 340, lootTier: 2 },
  sector_tide_rock:            { stratumId: 'stratum_02', stratumName: 'Estrato II · Cornisa Salina',   depth: 2, depthMeters: 410, lootTier: 2 },
  sector_sleeping_forge:       { stratumId: 'stratum_03', stratumName: 'Estrato III · Forjas Hundidas', depth: 3, depthMeters: 690, lootTier: 3 },
  sector_coal_bastion:         { stratumId: 'stratum_03', stratumName: 'Estrato III · Forjas Hundidas', depth: 3, depthMeters: 760, lootTier: 3 },
}

function withAbyssMeta(sector) {
  if (sector.stratumId) return sector
  return { ...sector, ...(STRATUM_FALLBACK[sector.id] ?? { stratumId: 'stratum_01', stratumName: 'Estrato I · Linde de Raíz', depth: 1, depthMeters: 120, lootTier: 1 }) }
}

function BiomeIcon({ biomeId }) {
  if (biomeId === 'coast') return (
    <svg width="14" height="14" viewBox="0 0 16 16">
      <path d="M2 7 Q5 4 8 7 Q11 10 14 7" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M2 11 Q5 8 8 11 Q11 14 14 11" stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.6"/>
    </svg>
  )
  if (biomeId === 'forge') return (
    <svg width="14" height="14" viewBox="0 0 16 16">
      <path d="M5 14 V8 L3 5 H13 L11 8 V14 Z" fill="currentColor" opacity="0.55"/>
      <path d="M8 4 Q7.5 2 8 0.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.75"/>
    </svg>
  )
  return (
    <svg width="14" height="14" viewBox="0 0 16 16">
      <path d="M8 2 L10.5 8 H9 L11.5 13 H4.5 L7 8 H5.5 Z" fill="currentColor" opacity="0.6"/>
    </svg>
  )
}

function FogIcon() {
  return (
    <svg width="16" height="12" viewBox="0 0 18 14" style={{ opacity: 0.4 }}>
      <path d="M1 4 Q5 1 9 4 Q13 7 17 4" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      <path d="M2 9 Q6 6 9 9 Q12 12 16 9" stroke="currentColor" strokeWidth="0.8" fill="none" strokeLinecap="round"/>
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

  const rawSelected   = sectors.find(s => s.id === selectedId)
  const selected      = rawSelected ? withAbyssMeta(rawSelected) : null
  const biome         = selected ? BIOMES[selected.biomeId] : null
  const poi           = selected ? POIS[selected.poiId]     : null
  const recentlyFound = sectors.filter(s => s.recentlyDiscovered)
  const discoveredCount = sectors.filter(s => s.discovered).length

  // Progreso por estrato para el subtítulo
  const strataProgress = ABYSS_STRATA.map(st => {
    const prog = getStratumProgress(sectors, st.id)
    return `${st.shortName} ${prog.discovered}/${prog.total}`
  }).join(' · ')

  function handleSelect(id) {
    setSelectedId(prev => prev === id ? null : id)
  }

  return (
    <div className="abyss-map-screen">

      {/* Banners de descubrimiento */}
      {recentlyFound.map(s => {
        const meta = withAbyssMeta(s)
        return (
          <div key={s.id} className="abyss-discovery-banner">
            <div className="abyss-discovery-label">Nueva senda cartografiada</div>
            <div className="abyss-discovery-name">{s.name}</div>
            <div className="abyss-discovery-meta">{meta.stratumName} · {meta.depthMeters} m</div>
          </div>
        )
      })}

      {/* Cabecera */}
      <div className="abyss-header">
        <div className="abyss-title">El Abismo</div>
        <div className="abyss-subtitle">
          {discoveredCount} / {sectors.length} zonas · {strataProgress}
        </div>
      </div>

      {/* Tablero */}
      <div className="abyss-board">

        {/* Bandas de estrato */}
        {STRATA_BANDS.map(st => (
          <div key={st.id} className={`abyss-stratum-band ${st.cssClass}`} />
        ))}

        {/* Etiquetas de estrato (derecha) */}
        {STRATA_BANDS.map(st => (
          <div key={st.id + '-label'} className="abyss-stratum-label" style={{ top: `${st.yMid}%` }}>
            <div className="abyss-stratum-label-name">{st.label}</div>
            <div className="abyss-stratum-label-depth">{st.depth}</div>
          </div>
        ))}

        {/* Núcleo central (glow sutil) */}
        <div className="abyss-core" />

        {/* Línea de profundidad */}
        <div className="abyss-depth-line" />

        {/* Conexiones SVG */}
        <svg className="abyss-connections" viewBox="0 0 100 100" preserveAspectRatio="none">
          {CONNECTIONS.map(([aId, bId]) => {
            const aPos = ABYSS_NODE_POS[aId]
            const bPos = ABYSS_NODE_POS[bId]
            if (!aPos || !bPos) return null
            const aSec = sectors.find(s => s.id === aId)
            const bSec = sectors.find(s => s.id === bId)
            const both = aSec?.discovered && bSec?.discovered
            return (
              <line
                key={`${aId}-${bId}`}
                x1={aPos.x} y1={aPos.y}
                x2={bPos.x} y2={bPos.y}
                stroke={both ? 'rgba(184,148,74,0.38)' : 'rgba(98,107,111,0.18)'}
                strokeWidth="0.75"
                strokeDasharray={both ? undefined : '1.8 2.2'}
              />
            )
          })}
        </svg>

        {/* Nodos */}
        {sectors.map(s => {
          const pos = ABYSS_NODE_POS[s.id]
          if (!pos) return null
          const meta = withAbyssMeta(s)
          const isSelected = s.id === selectedId
          const nodeClass = [
            'abyss-node',
            s.discovered         ? 'discovered'          : 'hidden',
            isSelected           ? 'selected'            : '',
            s.recentlyDiscovered ? 'recently-discovered' : '',
            (s.discovered && s.secret) ? 'secret-discovered' : '',
          ].filter(Boolean).join(' ')

          return (
            <button
              key={s.id}
              className={nodeClass}
              style={{
                top:  `calc(${pos.y}% - 22px)`,
                left: `${pos.x}%`,
                transform: 'translateX(-50%)',
              }}
              onClick={() => handleSelect(s.id)}
            >
              {s.recentlyDiscovered && <div className="abyss-new-badge">Nuevo</div>}
              {s.discovered && s.secret && <div className="abyss-node-secret-badge">Secreto</div>}
              <div className="abyss-node-circle">
                {s.discovered ? (
                  <div className="abyss-node-icon" style={{ color: BIOME_ICON_COLOR[s.biomeId] ?? 'var(--color-parchment)' }}>
                    <BiomeIcon biomeId={s.biomeId} />
                  </div>
                ) : (
                  <div className="abyss-node-fog"><FogIcon /></div>
                )}
              </div>
              <div className="abyss-node-name">
                {s.discovered ? s.name : '???'}
              </div>
              {s.discovered && (
                <div className="abyss-node-depth">{meta.depthMeters} m</div>
              )}
            </button>
          )
        })}
      </div>

      {/* Panel de detalle */}
      {selected && (
        <div className="abyss-selected-panel">
          {selected.discovered ? (
            <>
              <div className="abyss-detail-title">
                {selected.recentlyDiscovered && (
                  <span className="abyss-new-badge" style={{ position: 'static', transform: 'none', marginRight: 8, fontSize: '0.48rem' }}>Nuevo</span>
                )}
                {selected.name}
              </div>

              <div className="abyss-detail-row">
                <span className="abyss-detail-key">Estrato</span>
                <span>{selected.stratumName ?? '—'}</span>
              </div>
              <div className="abyss-detail-row">
                <span className="abyss-detail-key">Profundidad</span>
                <span>{selected.depthMeters ?? '—'} m</span>
              </div>
              <div className="abyss-detail-row">
                <span className="abyss-detail-key">Loot</span>
                <span>Tier {selected.lootTier ?? 1}</span>
              </div>
              <div className="abyss-detail-row">
                <span className="abyss-detail-key">Bioma</span>
                <span>{biome?.name ?? '—'}</span>
              </div>
              <div className="abyss-detail-row">
                <span className="abyss-detail-key">Amenaza</span>
                <span style={{ color: THREAT_COLOR[selected.threat] ?? 'var(--color-stone-light)' }}>
                  {THREAT_LABEL[selected.threat] ?? '—'}
                </span>
              </div>
              <div className="abyss-detail-row">
                <span className="abyss-detail-key">Dominio</span>
                <span>{MASTERY_LABEL[selected.masteryLevel ?? 0]}</span>
              </div>
              <div className="abyss-detail-row">
                <span className="abyss-detail-key">Visitas</span>
                <span>{selected.visits}</span>
              </div>
              {poi && (
                <div className="abyss-detail-row">
                  <span className="abyss-detail-key">Lugar</span>
                  <span>{poi.name}</span>
                </div>
              )}
              {(selected.resources ?? []).length > 0 && (
                <div className="abyss-detail-row">
                  <span className="abyss-detail-key">Recursos</span>
                  <span style={{ fontSize: '0.62rem' }}>
                    {(selected.resources ?? []).map(r => RESOURCES[r]?.name).filter(Boolean).join(', ')}
                  </span>
                </div>
              )}
              {(selected.enemyPool ?? []).length > 0 && (
                <div className="abyss-detail-row">
                  <span className="abyss-detail-key">Amenazas</span>
                  <span style={{ fontSize: '0.62rem', color: 'var(--color-ember)' }}>
                    {(selected.enemyPool ?? []).map(id => ENEMIES[id]?.name).filter(Boolean).join(', ')}
                  </span>
                </div>
              )}
              {(selected.connections ?? []).length > 0 && (
                <div className="abyss-detail-row">
                  <span className="abyss-detail-key">Sendas</span>
                  <span style={{ fontSize: '0.62rem' }}>
                    {(selected.connections ?? []).map(cid => {
                      const cs = sectors.find(s => s.id === cid)
                      return cs?.discovered ? cs.name : 'senda en bruma'
                    }).join(', ')}
                  </span>
                </div>
              )}
              {selected.secret && (
                <div className="secret-discovery-note">
                  Zona secreta · acceso por senda oculta
                </div>
              )}
              {biome?.description && (
                <div style={{ marginTop: 8, fontSize: '0.6rem', color: 'var(--color-stone-light)', fontStyle: 'italic', lineHeight: 1.45, opacity: 0.75 }}>
                  {biome.description}
                </div>
              )}
            </>
          ) : (
            <div className="abyss-fog-text">
              <FogIcon />
              <div style={{ marginTop: 8 }}>
                Senda cubierta por la bruma.<br />
                Desciende y explora estratos conectados para revelar este lugar.
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  )
}
