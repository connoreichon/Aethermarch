import { useState } from 'react'
import { BIOMES, POIS, RESOURCES, ENEMIES, ABYSS_STRATA, WORLD_ROUTES, ABYSS_ZONES, WORLD_ROUTE_SEGMENTS, ABYSS_SETTLEMENTS } from '../data/gameData.js'
import { getStratumProgress } from '../systems/abyssSystem.js'
import {
  getWorldScaleSummary,
  getRoutesFromSector,
  getRouteTypeLabel,
  getRouteDangerLabel,
  getRouteStepRangeLabel,
} from '../systems/worldScaleSystem.js'
import {
  getSegmentsForRoute,
  getRouteSegmentsTotalSteps,
  getRouteSegmentDangerLabel,
} from '../systems/routeSegmentSystem.js'

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
  sector_aethel_edge:          { stratumId: 'stratum_01', stratumName: 'I · Linde de las Raíces Ciegas',    depth: 1, depthMeters: 120, lootTier: 1 },
  sector_mist_root:            { stratumId: 'stratum_01', stratumName: 'I · Linde de las Raíces Ciegas',    depth: 1, depthMeters: 180, lootTier: 1 },
  sector_runic_guard_ruins:    { stratumId: 'stratum_01', stratumName: 'I · Linde de las Raíces Ciegas',    depth: 1, depthMeters: 210, lootTier: 1 },
  sector_hollow_mushroom_cave: { stratumId: 'stratum_01', stratumName: 'I · Linde de las Raíces Ciegas',    depth: 1, depthMeters: 235, lootTier: 1 },
  sector_salt_beacon:          { stratumId: 'stratum_02', stratumName: 'II · Cornisa de la Sal Negra',   depth: 2, depthMeters: 340, lootTier: 2 },
  sector_tide_rock:            { stratumId: 'stratum_02', stratumName: 'II · Cornisa de la Sal Negra',   depth: 2, depthMeters: 410, lootTier: 2 },
  sector_sleeping_forge:       { stratumId: 'stratum_03', stratumName: 'III · Hornacinas de Ceniza', depth: 3, depthMeters: 690, lootTier: 3 },
  sector_coal_bastion:         { stratumId: 'stratum_03', stratumName: 'III · Hornacinas de Ceniza', depth: 3, depthMeters: 760, lootTier: 3 },
}

function withAbyssMeta(sector) {
  if (sector.stratumId) return sector
  return { ...sector, ...(STRATUM_FALLBACK[sector.id] ?? { stratumId: 'stratum_01', stratumName: 'I · Linde de las Raíces Ciegas', depth: 1, depthMeters: 120, lootTier: 1 }) }
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
  coast:  'var(--color-mist)',
  forge:  'var(--color-ember)',
}

const SAFETY_COLOR = {
  safe:      'var(--color-xp)',
  guarded:   'var(--color-gold)',
  unstable:  'var(--color-mist)',
  dangerous: 'var(--color-ember)',
  hostile:   'var(--color-hp)',
  mythic:    'var(--color-magic)',
}

const SETTLEMENT_TYPE_ICON = {
  village:      '⌂',
  market:       '⊞',
  fort:         '▣',
  harbor:       '⊕',
  caravanserai: '⌀',
  camp:         '△',
  inn_town:     '⌂',
  sanctuary:    '✦',
  ruin_settlement: '◈',
}

// Positions for settlements (same sector = same pos as sector node but offset)
const SETTLEMENT_POS = {
  settlement_aethel_linde:         { x: 50, y: 10 },
  settlement_root_lantern_market:  { x: 26, y: 26 },
  settlement_fogbreak_fort:        { x: 20, y: 31 },
  settlement_blind_lake_dock:      { x: 74, y: 39 },
  settlement_dust_gate_caravanserai: { x: 30, y: 22 },
}

export default function MapScreen({ sectors, expedition, discoveredSegmentIds = [] }) {
  const [selectedId, setSelectedId] = useState(null)
  const [expandedRouteId, setExpandedRouteId] = useState(null)
  const [mapZoomLevel, setMapZoomLevel] = useState('layers')
  const [selectedSettlementId, setSelectedSettlementId] = useState(null)

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

  // Escala del mundo
  const scaleSummary = getWorldScaleSummary({
    sectors,
    routes: WORLD_ROUTES,
    zones: ABYSS_ZONES,
    strata: ABYSS_STRATA,
  })

  // Rutas desde el sector seleccionado
  const selectedRoutes = selectedId
    ? getRoutesFromSector({ routes: WORLD_ROUTES, sectorId: selectedId }).filter(
        r => r.status === 'open' || r.status === 'discovered' || r.type === 'secret'
      )
    : []

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
        <div className="abyss-scale-summary">
          {scaleSummary.knownStrataCount} capas · {scaleSummary.zoneCount} zonas · {scaleSummary.sectorCount} sectores · {scaleSummary.routeCount} rutas
          {' · '}{scaleSummary.maxDepthMeters} m máx.
        </div>
      </div>

      {/* Selector de zoom */}
      <div style={{
        display: 'flex', gap: 4, padding: '6px 12px',
        borderBottom: '1px solid rgba(98,107,111,0.15)',
        background: 'rgba(0,0,0,0.2)',
      }}>
        {[
          { id: 'layers',   label: 'Capas' },
          { id: 'routes',   label: 'Rutas' },
          { id: 'segments', label: 'Tramos' },
        ].map(z => (
          <button
            key={z.id}
            onClick={() => { setMapZoomLevel(z.id); setSelectedId(null); setSelectedSettlementId(null) }}
            style={{
              flex: 1, padding: '5px 0', fontSize: '0.62rem',
              background: mapZoomLevel === z.id ? 'rgba(79,143,149,0.2)' : 'transparent',
              border: `1px solid ${mapZoomLevel === z.id ? 'var(--color-teal)' : 'rgba(98,107,111,0.25)'}`,
              borderRadius: 4, color: mapZoomLevel === z.id ? 'var(--color-teal)' : 'var(--color-stone-light)',
              cursor: 'pointer', letterSpacing: '0.04em',
            }}
          >
            {z.label}
          </button>
        ))}
      </div>

      {/* ── VISTA: CAPAS ─────────────────────────────────────────────────────── */}
      {mapZoomLevel === 'layers' && (
        <div>
          <div className="abyss-board" style={{ minHeight: 280 }}>
            {STRATA_BANDS.map(st => (
              <div key={st.id} className={`abyss-stratum-band ${st.cssClass}`} />
            ))}
            {STRATA_BANDS.map(st => (
              <div key={st.id + '-label'} className="abyss-stratum-label" style={{ top: `${st.yMid}%` }}>
                <div className="abyss-stratum-label-name">{st.label}</div>
                <div className="abyss-stratum-label-depth">{st.depth}</div>
              </div>
            ))}
            <div className="abyss-core" />
            <div className="abyss-depth-line" />

            {/* Asentamientos */}
            {ABYSS_SETTLEMENTS.map(s => {
              const pos = SETTLEMENT_POS[s.id]
              if (!pos) return null
              const sectorDisc = sectors.find(sec => sec.id === s.sectorId)?.discovered ?? false
              const visible    = s.unlocked || sectorDisc
              const icon       = SETTLEMENT_TYPE_ICON[s.type] ?? '◆'
              const isSelected = selectedSettlementId === s.id
              return (
                <button
                  key={s.id}
                  onClick={() => setSelectedSettlementId(prev => prev === s.id ? null : s.id)}
                  style={{
                    position: 'absolute',
                    top:  `calc(${pos.y}% - 26px)`,
                    left: `${pos.x}%`,
                    transform: 'translateX(-50%)',
                    background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                    opacity: visible ? 1 : 0.35,
                    zIndex: 5,
                  }}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: 4,
                    background: isSelected ? 'rgba(30,20,10,0.95)' : 'rgba(15,10,5,0.85)',
                    border: `1.5px solid ${isSelected ? 'var(--color-gold)' : SAFETY_COLOR[s.safetyLevel] ?? 'var(--color-stone-light)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.78rem',
                    boxShadow: isSelected ? `0 0 8px ${SAFETY_COLOR[s.safetyLevel]}44` : 'none',
                    filter: visible ? 'none' : 'blur(0.5px) grayscale(0.8)',
                  }}>
                    {visible ? icon : '?'}
                  </div>
                  <div style={{
                    fontSize: '0.48rem', color: visible ? 'var(--color-parchment)' : 'var(--color-stone-light)',
                    textAlign: 'center', maxWidth: 54, lineHeight: 1.2,
                  }}>
                    {visible ? s.name : '—'}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Panel de detalle de asentamiento */}
          {selectedSettlementId && (() => {
            const s = ABYSS_SETTLEMENTS.find(x => x.id === selectedSettlementId)
            if (!s) return null
            const sectorDisc = sectors.find(sec => sec.id === s.sectorId)?.discovered ?? false
            const visible    = s.unlocked || sectorDisc
            return (
              <div className="abyss-selected-panel">
                {visible ? (
                  <>
                    <div className="abyss-detail-title" style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ fontSize:'1.1rem' }}>{SETTLEMENT_TYPE_ICON[s.type] ?? '◆'}</span>
                      <span>{s.name}</span>
                    </div>
                    <div className="abyss-detail-row">
                      <span className="abyss-detail-key">Tipo</span>
                      <span style={{ textTransform:'capitalize' }}>{s.type.replace(/_/g,' ')}</span>
                    </div>
                    <div className="abyss-detail-row">
                      <span className="abyss-detail-key">Seguridad</span>
                      <span style={{ color: SAFETY_COLOR[s.safetyLevel] ?? 'var(--color-stone-light)', textTransform:'capitalize' }}>
                        {s.safetyLevel}
                      </span>
                    </div>
                    <div className="abyss-detail-row">
                      <span className="abyss-detail-key">Estrato</span>
                      <span>{s.layerName ?? s.stratumId}</span>
                    </div>
                    {s.description && (
                      <div style={{ fontSize:'0.6rem', color:'var(--color-stone-light)', fontStyle:'italic',
                                    lineHeight:1.45, marginTop:6, opacity:0.85 }}>
                        {s.description}
                      </div>
                    )}
                    {s.services?.length > 0 && (
                      <div className="abyss-detail-row" style={{ marginTop:4 }}>
                        <span className="abyss-detail-key">Servicios</span>
                        <span style={{ fontSize:'0.58rem' }}>
                          {s.services.map(sv => sv.replace(/_/g,' ')).join(', ')}
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="abyss-fog-text">
                    <div>Asentamiento no descubierto.</div>
                    <div style={{ fontSize:'0.58rem', marginTop:4, opacity:0.7 }}>
                      Descubre el sector {s.sectorId.replace('sector_','').replace(/_/g,' ')} para revelar este lugar.
                    </div>
                  </div>
                )}
              </div>
            )
          })()}
        </div>
      )}

      {/* ── VISTA: TRAMOS ────────────────────────────────────────────────────── */}
      {mapZoomLevel === 'segments' && (() => {
        const activeRouteId = expedition?.routeRun?.routeId ?? expedition?.routeId ?? null
        const activeRoute   = WORLD_ROUTES.find(r => r.id === activeRouteId)
        const segs          = activeRoute
          ? WORLD_ROUTE_SEGMENTS
              .filter(s => s.routeId === activeRouteId)
              .sort((a, b) => a.order - b.order)
          : []
        const currentSegId  = expedition?.routeSegmentId
        const completedIds  = expedition?.routeRun?.completedSegmentIds ?? []

        if (!activeRoute || segs.length === 0) {
          return (
            <div style={{ padding:'20px 14px', textAlign:'center' }}>
              <div style={{ fontSize:'0.65rem', color:'var(--color-stone-light)', fontStyle:'italic' }}>
                No hay expedición activa.
              </div>
              <div style={{ fontSize:'0.58rem', color:'var(--color-stone-light)', marginTop:8, opacity:0.6 }}>
                Inicia una marcha con ruta para ver los tramos internos.
              </div>
            </div>
          )
        }

        const fromSector = sectors.find(s => s.id === expedition?.routeRun?.fromSectorId)
        const toSector   = sectors.find(s => s.id === expedition?.routeRun?.toSectorId)

        return (
          <div style={{ padding:'10px 12px' }}>
            <div style={{
              fontSize:'0.68rem', color:'var(--color-gold)', fontWeight:600, marginBottom:4,
            }}>
              {activeRoute.name}
            </div>
            <div style={{
              fontSize:'0.56rem', color:'var(--color-stone-light)', marginBottom:10,
            }}>
              {fromSector?.name ?? '—'} → {toSector?.name ?? '—'}
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
              {segs.map((seg, idx) => {
                const isDone    = completedIds.includes(seg.id) || discoveredSegmentIds.includes(seg.id)
                const isCurrent = seg.id === currentSegId
                const isNext    = !isDone && !isCurrent && idx === segs.findIndex(s => !completedIds.includes(s.id) && s.id !== currentSegId)
                const isHidden  = !isDone && !isCurrent

                let nodeColor = 'rgba(98,107,111,0.3)'
                let textColor = 'var(--color-stone-light)'
                if (isDone)    { nodeColor = 'rgba(184,148,74,0.7)';  textColor = 'var(--color-gold)' }
                if (isCurrent) { nodeColor = 'var(--color-teal)';     textColor = 'var(--color-parchment)' }

                return (
                  <div key={seg.id} style={{ display:'flex', alignItems:'stretch', gap:8 }}>
                    {/* Línea vertical + nodo */}
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', width:18, flexShrink:0 }}>
                      {idx > 0 && (
                        <div style={{
                          width: 1.5, flex:'0 0 8px',
                          background: isDone ? 'rgba(184,148,74,0.5)' : 'rgba(98,107,111,0.2)',
                          borderLeft: isDone ? 'none' : '1.5px dashed rgba(98,107,111,0.25)',
                        }} />
                      )}
                      <div style={{
                        width: 14, height: 14, borderRadius: isCurrent ? 3 : 7,
                        border: `1.5px solid ${nodeColor}`,
                        background: isDone ? 'rgba(184,148,74,0.18)' : isCurrent ? 'rgba(79,143,149,0.22)' : 'transparent',
                        display:'flex', alignItems:'center', justifyContent:'center',
                        flexShrink: 0,
                      }}>
                        {isDone && (
                          <div style={{ width:4, height:4, borderRadius:'50%', background:'rgba(184,148,74,0.8)' }} />
                        )}
                        {isCurrent && (
                          <div style={{ width:4, height:4, borderRadius:1, background:'var(--color-teal)' }} />
                        )}
                      </div>
                      {idx < segs.length - 1 && (
                        <div style={{
                          width: 1.5, flex:'0 0 20px',
                          background: isDone ? 'rgba(184,148,74,0.35)' : 'rgba(98,107,111,0.15)',
                          borderLeft: isDone ? 'none' : '1.5px dashed rgba(98,107,111,0.2)',
                        }} />
                      )}
                    </div>

                    {/* Texto del segmento */}
                    <div style={{ flex:1, paddingBottom:idx < segs.length - 1 ? 0 : 2, paddingTop: idx === 0 ? 0 : 8 }}>
                      <div style={{ fontSize:'0.68rem', color:textColor, fontWeight:isCurrent ? 600 : 400 }}>
                        {isHidden && !isNext
                          ? 'Tramo desconocido'
                          : isNext
                          ? `Siguiente tramo · ${seg.name}`
                          : `${seg.order}. ${seg.name}`
                        }
                        {isCurrent && <span style={{ marginLeft:6, fontSize:'0.52rem', color:'var(--color-teal)' }}>← actual</span>}
                      </div>
                      {(isDone || isCurrent) && (
                        <div style={{ fontSize:'0.55rem', color:'var(--color-stone-light)', marginTop:1, opacity:0.75 }}>
                          {seg.stepMin}–{seg.stepMax} pasos · {seg.type}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })()}

      {/* ── VISTA: RUTAS — usa el tablero original ───────────────────────────── */}
      {mapZoomLevel === 'routes' && (<>

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
                stroke={both ? 'rgba(79,143,149,0.42)' : 'rgba(52,58,61,0.22)'}
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
              {/* Rutas desde aquí */}
              {selectedRoutes.length > 0 && (
                <div className="world-routes-section">
                  <div className="world-routes-label">Rutas desde aquí</div>
                  {selectedRoutes.map(r => {
                    const isSecretHidden = r.type === 'secret' && r.status === 'hidden'
                    const routeSegs  = getSegmentsForRoute({ segments: WORLD_ROUTE_SEGMENTS, routeId: r.id })
                    const segTotal   = getRouteSegmentsTotalSteps(routeSegs)
                    const isExpanded = expandedRouteId === r.id

                    return isSecretHidden ? (
                      <div key={r.id} className="world-route-item world-route-hidden">
                        <div className="world-route-name">Ruta oculta</div>
                        <div className="world-route-meta">Condición desconocida</div>
                        {routeSegs.length > 0 && (
                          <div className="world-route-segment-count route-segment-hidden">
                            {routeSegs.length} tramos desconocidos
                          </div>
                        )}
                      </div>
                    ) : (
                      <div
                        key={r.id}
                        className="world-route-item"
                        style={{ cursor: routeSegs.length > 0 ? 'pointer' : 'default' }}
                        onClick={() => routeSegs.length > 0 && setExpandedRouteId(prev => prev === r.id ? null : r.id)}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                          <div className="world-route-name">{r.name}</div>
                          {routeSegs.length > 0 && (
                            <span style={{ fontSize: '0.48rem', color: 'var(--color-stone-light)', opacity: 0.7 }}>
                              {isExpanded ? '▲' : '▼'}
                            </span>
                          )}
                        </div>
                        <div className="world-route-meta">
                          {getRouteTypeLabel(r.type)} · {getRouteStepRangeLabel(r)} · {getRouteDangerLabel(r)}
                        </div>
                        {routeSegs.length > 0 && (
                          <div className="world-route-segment-count">
                            {routeSegs.length} tramos · {segTotal.min}–{segTotal.max} pasos
                          </div>
                        )}
                        {isExpanded && (
                          <div className="route-segment-list">
                            {routeSegs.map(seg => (
                              <div key={seg.id} className={`route-segment-row route-segment-danger-${seg.danger}`}>
                                <span className="route-segment-index">{seg.order}.</span>
                                <div>
                                  <span className="route-segment-name">{seg.name}</span>
                                  <span className="route-segment-meta">
                                    {' · '}{seg.stepMin}–{seg.stepMax} pasos · {getRouteSegmentDangerLabel(seg)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
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

      </>)}

    </div>
  )
}
