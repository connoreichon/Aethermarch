import { useState, useRef, useEffect } from 'react'
import { ABYSS_STRATA } from '../data/gameData.js'
import { getSegmentsForRoute } from '../systems/routeSegmentSystem.js'

// ── Constants ────────────────────────────────────────────────────────────────

const SAFETY_COLOR = {
  safe:      'var(--color-xp)',
  guarded:   'var(--color-gold)',
  unstable:  'var(--color-mist)',
  dangerous: 'var(--color-ember)',
  hostile:   'var(--color-hp)',
  mythic:    'var(--color-magic)',
}

// Positions for strata in ABYSS view
const STRATUM_BLOCKS = {
  stratum_01: { x: 36, y: 44,  w: 408, h: 106, fillColor: 'rgba(20,36,14,0.62)', borderColor: 'rgba(63,163,77,0.35)' },
  stratum_02: { x: 36, y: 192, w: 408, h: 106, fillColor: 'rgba(8,20,34,0.62)',  borderColor: 'rgba(79,143,149,0.35)' },
  stratum_03: { x: 36, y: 340, w: 408, h: 106, fillColor: 'rgba(30,14,6,0.66)',  borderColor: 'rgba(180,80,40,0.35)' },
}

// Settlement positions in LAYER view (stratum_01 canvas 480×480)
const SETTLEMENT_POS = {
  settlement_aethel_linde:           { x: 76,  y: 205 },
  settlement_root_lantern_market:    { x: 238, y: 112 },
  settlement_fogbreak_fort:          { x: 398, y: 148 },
  settlement_blind_lake_dock:        { x: 408, y: 322 },
  settlement_dust_gate_caravanserai: { x: 232, y: 362 },
}

// Sector fallback positions for strata 2 & 3 layer views
const SECTOR_POS = {
  stratum_02: {
    sector_salt_beacon: { x: 148, y: 210 },
    sector_tide_rock:   { x: 332, y: 270 },
  },
  stratum_03: {
    sector_sleeping_forge: { x: 155, y: 220 },
    sector_coal_bastion:   { x: 325, y: 220 },
  },
}

// Visual route connections per stratum
const STRATUM_CONNECTIONS = {
  stratum_01: [
    { from: 'settlement_aethel_linde',           to: 'settlement_root_lantern_market',   routeId: 'route_aethel_to_mist',  bend:  0.22, danger: 'low' },
    { from: 'settlement_root_lantern_market',    to: 'settlement_fogbreak_fort',          routeId: 'route_mist_to_ruins',   bend: -0.18, danger: 'medium' },
    { from: 'settlement_aethel_linde',           to: 'settlement_blind_lake_dock',        routeId: 'route_aethel_to_salt',  bend: -0.2,  danger: 'medium' },
    { from: 'settlement_aethel_linde',           to: 'settlement_dust_gate_caravanserai', routeId: null,                    bend:  0.15, danger: 'low' },
    { from: 'settlement_dust_gate_caravanserai', to: 'settlement_blind_lake_dock',        routeId: null,                    bend:  0.2,  danger: 'low' },
  ],
  stratum_02: [
    { from: 'sector_salt_beacon', to: 'sector_tide_rock', routeId: 'route_salt_to_tide', bend: 0.2, danger: 'medium', nodeType: 'sector' },
  ],
  stratum_03: [
    { from: 'sector_sleeping_forge', to: 'sector_coal_bastion', routeId: 'route_forge_to_coal', bend: -0.18, danger: 'medium', nodeType: 'sector' },
  ],
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function createCurvedPath(from, to, bend = 0.25) {
  const mx = (from.x + to.x) / 2
  const my = (from.y + to.y) / 2
  const dx = to.x - from.x
  const dy = to.y - from.y
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  const px = -dy / len
  const py =  dx / len
  return `M ${from.x} ${from.y} Q ${mx + px * len * bend} ${my + py * len * bend}, ${to.x} ${to.y}`
}

function getSegmentPositions(segs) {
  if (segs.length === 0) return []
  const padding = 72
  const spacing = segs.length === 1 ? 0 : (480 - padding * 2) / (segs.length - 1)
  return segs.map((_, i) => ({
    x: padding + i * spacing,
    y: 230 + Math.sin(i * 0.85) * 42,
  }))
}

// ── Settlement icon (inline SVG shapes, no external assets) ─────────────────

function SettlementShape({ type, cx, cy, color, r = 11 }) {
  if (type === 'village') return (
    <g>
      <polygon
        points={`${cx},${cy - r} ${cx - r * 0.75},${cy - r * 0.1} ${cx + r * 0.75},${cy - r * 0.1}`}
        fill={color} fillOpacity={0.8}/>
      <rect x={cx - r * 0.5} y={cy - r * 0.15} width={r} height={r * 0.72}
            fill={color} fillOpacity={0.65} rx={1}/>
    </g>
  )
  if (type === 'market') return (
    <g>
      <path d={`M ${cx - r * 0.85} ${cy - r * 0.2} Q ${cx} ${cy - r} ${cx + r * 0.85} ${cy - r * 0.2}`}
            fill={color} fillOpacity={0.5} stroke={color} strokeWidth={1.2}/>
      <rect x={cx - r * 0.85} y={cy - r * 0.2} width={r * 1.7} height={r * 0.65}
            fill={color} fillOpacity={0.55} rx={1}/>
    </g>
  )
  if (type === 'fort') return (
    <g>
      <rect x={cx - r * 0.72} y={cy - r * 0.85} width={r * 1.44} height={r * 1.15}
            fill={color} fillOpacity={0.55} rx={1}/>
      <rect x={cx - r * 0.9}  y={cy - r}    width={r * 0.42} height={r * 0.38} fill={color} fillOpacity={0.8}/>
      <rect x={cx + r * 0.48} y={cy - r}    width={r * 0.42} height={r * 0.38} fill={color} fillOpacity={0.8}/>
    </g>
  )
  if (type === 'harbor') return (
    <g>
      <line x1={cx} y1={cy - r * 0.82} x2={cx} y2={cy + r * 0.42}
            stroke={color} strokeWidth={1.5} strokeLinecap="round"/>
      <line x1={cx - r * 0.6} y1={cy - r * 0.3} x2={cx + r * 0.6} y2={cy - r * 0.3}
            stroke={color} strokeWidth={1.2} strokeLinecap="round"/>
      <path d={`M ${cx - r * 0.82} ${cy + r * 0.1} Q ${cx} ${cy + r} ${cx + r * 0.82} ${cy + r * 0.1}`}
            stroke={color} strokeWidth={1.2} fill={color} fillOpacity={0.22}/>
    </g>
  )
  if (type === 'caravanserai') return (
    <g>
      <circle cx={cx} cy={cy} r={r * 0.72} stroke={color} strokeWidth={1.4} fill={color} fillOpacity={0.18}/>
      <circle cx={cx} cy={cy} r={r * 0.28} fill={color} fillOpacity={0.72}/>
    </g>
  )
  return <circle cx={cx} cy={cy} r={r * 0.5} fill={color} fillOpacity={0.6}/>
}

// ── Main component ───────────────────────────────────────────────────────────

export default function VisualMapCanvas({
  viewLevel,
  selectedLayerId,
  selectedRouteId,
  sectors,
  routes,
  routeSegments,
  settlements,
  discoveredSegmentIds,
  expedition,
  onSelectLayer,
  onSelectSettlement,
  onSelectRoute,
  centerTrigger,
}) {
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const isDownRef      = useRef(false)
  const didDragRef     = useRef(false)
  const dragStartRef   = useRef(null)
  const [selectedNodeId, setSelectedNodeId]   = useState(null)
  const [detailSettlement, setDetailSettlement] = useState(null)
  const [detailSegment, setDetailSegment]       = useState(null)

  // Reset pan when centerTrigger changes
  useEffect(() => {
    setPan({ x: 0, y: 0 })
  }, [centerTrigger])

  // Reset selection when view changes
  useEffect(() => {
    setSelectedNodeId(null)
    setDetailSettlement(null)
    setDetailSegment(null)
  }, [viewLevel, selectedLayerId, selectedRouteId])

  function onPointerDown(e) {
    isDownRef.current  = true
    didDragRef.current = false
    dragStartRef.current = { panX: pan.x, panY: pan.y, originX: e.clientX, originY: e.clientY }
  }

  function onPointerMove(e) {
    if (!isDownRef.current || !dragStartRef.current) return
    const dx = e.clientX - dragStartRef.current.originX
    const dy = e.clientY - dragStartRef.current.originY
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) didDragRef.current = true
    setPan({ x: dragStartRef.current.panX + dx, y: dragStartRef.current.panY + dy })
  }

  function onPointerUp() {
    isDownRef.current  = false
    dragStartRef.current = null
  }

  function isSettlementVisible(s) {
    const sec = sectors.find(sec => sec.id === s.sectorId)
    return s.unlocked || (sec?.discovered ?? false)
  }

  // ── ABYSS render ────────────────────────────────────────────────────────────

  function renderAbyssView() {
    return (
      <>
        {/* Depth shaft */}
        <path d="M 240 0 C 236 130,244 300,240 480"
              stroke="rgba(6,4,2,0.92)" strokeWidth={10} fill="none"/>
        <path d="M 240 20 C 238 140,242 290,240 470"
              stroke="rgba(30,22,10,0.5)" strokeWidth={1.5} fill="none"
              strokeDasharray="5 10"/>

        {/* Depth markers */}
        {[{ y: 97, label: '0 m' }, { y: 245, label: '250 m' }, { y: 393, label: '500 m' }].map(m => (
          <g key={m.y}>
            <line x1={206} y1={m.y} x2={274} y2={m.y}
                  stroke="rgba(98,107,111,0.28)" strokeWidth={0.6}/>
            <text x={210} y={m.y - 4} fontSize={8}
                  style={{ fill: 'rgba(140,130,100,0.45)', fontFamily: 'Georgia,serif' }}>
              {m.label}
            </text>
          </g>
        ))}

        {/* Stratum blocks */}
        {ABYSS_STRATA.map(stratum => {
          const b = STRATUM_BLOCKS[stratum.id]
          if (!b) return null
          const knownCount = settlements.filter(s =>
            s.stratumId === stratum.id && isSettlementVisible(s)
          ).length
          const openRoutes = routes.filter(r =>
            (r.status === 'open' || r.status === 'discovered') &&
            (sectors.find(s => s.id === r.fromSectorId)?.discovered ||
             sectors.find(s => s.id === r.toSectorId)?.discovered)
          ).length

          return (
            <g key={stratum.id}
               onClick={() => { if (!didDragRef.current) onSelectLayer(stratum.id) }}
               style={{ cursor: 'pointer' }}>
              {/* Hit area */}
              <rect x={b.x - 4} y={b.y - 4} width={b.w + 8} height={b.h + 8}
                    rx={14} fill="transparent"/>
              {/* Block */}
              <rect x={b.x} y={b.y} width={b.w} height={b.h}
                    rx={10} fill={b.fillColor} stroke={b.borderColor} strokeWidth={1}/>
              {/* Roman numeral */}
              <text x={b.x + 22} y={b.y + 40} fontSize={24}
                    style={{ fill: b.borderColor, fontFamily: 'Georgia,serif', opacity: 0.75 }}>
                {stratum.number}
              </text>
              {/* Name */}
              <text x={b.x + 60} y={b.y + 32} fontSize={14}
                    style={{ fill: 'var(--color-parchment)', fontFamily: 'Georgia,serif', fontWeight: 600 }}>
                {stratum.shortName}
              </text>
              {/* Depth */}
              <text x={b.x + 60} y={b.y + 48} fontSize={9}
                    style={{ fill: 'rgba(140,130,100,0.7)', fontFamily: 'Georgia,serif' }}>
                {stratum.depthRange}
              </text>
              {/* Stats */}
              <text x={b.x + 60} y={b.y + 66} fontSize={8}
                    style={{ fill: 'rgba(140,130,100,0.5)' }}>
                {knownCount > 0 ? `${knownCount} asentamiento${knownCount !== 1 ? 's' : ''}` : 'Sin explorar'}
                {' · '}{openRoutes > 0 ? `${openRoutes} ruta${openRoutes !== 1 ? 's' : ''}` : 'rutas desconocidas'}
              </text>
              {/* Arrow cue */}
              <text x={b.x + b.w - 20} y={b.y + b.h / 2 + 6} fontSize={14}
                    style={{ fill: b.borderColor, opacity: 0.8 }}>
                ›
              </text>
            </g>
          )
        })}

        <text x={240} y={468} fontSize={8} textAnchor="middle"
              style={{ fill: 'rgba(98,107,111,0.3)', fontFamily: 'Georgia,serif' }}>
          ∞ profundidades sin cartografiar
        </text>
      </>
    )
  }

  // ── LAYER render ────────────────────────────────────────────────────────────

  function renderLayerView() {
    const connections = STRATUM_CONNECTIONS[selectedLayerId] ?? []

    // Get node position (settlement or sector fallback)
    function getPos(nodeId) {
      if (SETTLEMENT_POS[nodeId]) return SETTLEMENT_POS[nodeId]
      const sectorPosMap = SECTOR_POS[selectedLayerId] ?? {}
      return sectorPosMap[nodeId] ?? null
    }

    // Resolve route status for styling
    function routeStyle(conn) {
      const route = routes.find(r => r.id === conn.routeId)
      const isActive = expedition?.routeRun?.routeId === conn.routeId ||
                       expedition?.routeId === conn.routeId
      const isSelected = selectedNodeId === `conn_${conn.routeId}`
      if (!conn.routeId || !route) {
        return { stroke: 'rgba(98,107,111,0.22)', dash: '3 6', width: 1.2, clickable: false }
      }
      let stroke = conn.danger === 'medium' ? 'rgba(214,104,40,0.42)' : 'rgba(184,148,74,0.42)'
      if (route.type === 'secret')    stroke = 'rgba(140,80,180,0.45)'
      if (route.type === 'dangerous') stroke = 'rgba(200,60,40,0.45)'
      if (isActive)   stroke = 'rgba(79,143,149,0.75)'
      if (isSelected) stroke = 'var(--color-teal)'
      return {
        stroke,
        dash: route.type === 'secret' ? '4 5' : undefined,
        width: isSelected ? 3 : isActive ? 2.5 : 1.8,
        clickable: true,
      }
    }

    // Settlements for this layer
    const layerSettlements = settlements.filter(s => s.stratumId === selectedLayerId)
    // Sector nodes (for strata without explicit settlement positions)
    const sectorPosMap = SECTOR_POS[selectedLayerId] ?? {}

    return (
      <>
        {/* Background grid lines */}
        {[80, 160, 240, 320, 400].map(x => (
          <line key={x} x1={x} y1={0} x2={x} y2={480}
                stroke="rgba(98,107,111,0.04)" strokeWidth={1}/>
        ))}

        {/* Route connections */}
        {connections.map((conn, i) => {
          const fromPos = getPos(conn.from)
          const toPos   = getPos(conn.to)
          if (!fromPos || !toPos) return null
          const st = routeStyle(conn)
          return (
            <path
              key={i}
              d={createCurvedPath(fromPos, toPos, conn.bend ?? 0.22)}
              stroke={st.stroke}
              strokeWidth={st.width}
              strokeDasharray={st.dash}
              fill="none"
              strokeLinecap="round"
              style={{ cursor: st.clickable ? 'pointer' : 'default' }}
              onClick={() => {
                if (didDragRef.current || !st.clickable) return
                setSelectedNodeId(`conn_${conn.routeId}`)
                setDetailSegment(null)
                setDetailSettlement(null)
                onSelectRoute(conn.routeId)
              }}
            />
          )
        })}

        {/* Sector nodes (for strata 2 & 3) */}
        {Object.entries(sectorPosMap).map(([secId, pos]) => {
          const sec = sectors.find(s => s.id === secId)
          const discovered = sec?.discovered ?? false
          return (
            <g key={secId}>
              <circle cx={pos.x} cy={pos.y} r={18}
                      fill="rgba(12,10,7,0.88)"
                      stroke={discovered ? 'rgba(184,148,74,0.55)' : 'rgba(98,107,111,0.3)'}
                      strokeWidth={1.2}/>
              <text x={pos.x} y={pos.y + 4} textAnchor="middle" fontSize={9}
                    style={{ fill: discovered ? 'var(--color-gold)' : 'rgba(98,107,111,0.45)' }}>
                {discovered ? '⬡' : '?'}
              </text>
              <text x={pos.x} y={pos.y + 30} textAnchor="middle" fontSize={7.5}
                    style={{ fill: discovered ? 'var(--color-parchment)' : 'rgba(98,107,111,0.4)', fontFamily: 'Georgia,serif' }}>
                {discovered ? (sec?.name ?? secId) : '—'}
              </text>
            </g>
          )
        })}

        {/* Settlement nodes */}
        {layerSettlements.map(s => {
          const pos = SETTLEMENT_POS[s.id]
          if (!pos) return null
          const visible   = isSettlementVisible(s)
          const isSelected = selectedNodeId === s.id
          const safeColor  = SAFETY_COLOR[s.safetyLevel] ?? 'var(--color-stone-light)'
          const nodeColor  = visible ? safeColor : 'rgba(98,107,111,0.3)'

          return (
            <g key={s.id}
               style={{ cursor: 'pointer' }}
               onClick={() => {
                 if (didDragRef.current) return
                 const next = selectedNodeId === s.id ? null : s.id
                 setSelectedNodeId(next)
                 setDetailSettlement(next ? s : null)
                 setDetailSegment(null)
                 onSelectSettlement(s.id)
               }}>
              {/* Selection ring */}
              {isSelected && (
                <circle cx={pos.x} cy={pos.y} r={28}
                        fill="none" stroke={safeColor} strokeWidth={1.2}
                        strokeOpacity={0.45} strokeDasharray="3 4"/>
              )}
              {/* Outer circle */}
              <circle cx={pos.x} cy={pos.y} r={20}
                      fill={visible ? 'rgba(12,9,4,0.92)' : 'rgba(8,7,5,0.82)'}
                      stroke={nodeColor}
                      strokeWidth={visible ? 1.6 : 0.7}
                      strokeOpacity={visible ? 1 : 0.35}/>
              {/* Icon */}
              <g opacity={visible ? 1 : 0.25}>
                <SettlementShape type={s.type} cx={pos.x} cy={pos.y} color={nodeColor} r={11}/>
              </g>
              {/* Fog */}
              {!visible && (
                <text x={pos.x} y={pos.y + 4} textAnchor="middle" fontSize={12}
                      style={{ fill: 'rgba(98,107,111,0.4)' }}>?</text>
              )}
              {/* Label */}
              <text x={pos.x} y={pos.y + 35} textAnchor="middle" fontSize={7.5}
                    style={{
                      fill: visible ? 'var(--color-parchment)' : 'rgba(98,107,111,0.38)',
                      fontFamily: 'Georgia,serif',
                    }}>
                {visible ? s.name : '—'}
              </text>
            </g>
          )
        })}

        {/* Empty state for strata without data */}
        {layerSettlements.length === 0 && Object.keys(sectorPosMap).length === 0 && (
          <text x={240} y={240} textAnchor="middle" fontSize={11}
                style={{ fill: 'var(--color-stone-light)', fontStyle: 'italic', fontFamily: 'Georgia,serif' }}>
            Esta capa no tiene datos visuales aún
          </text>
        )}
      </>
    )
  }

  // ── ROUTE render ────────────────────────────────────────────────────────────

  function renderRouteView() {
    const route = routes.find(r => r.id === selectedRouteId)
    if (!route) return (
      <text x={240} y={240} textAnchor="middle" fontSize={11}
            style={{ fill: 'var(--color-stone-light)' }}>
        Ruta no encontrada
      </text>
    )

    const segs        = getSegmentsForRoute({ segments: routeSegments, routeId: selectedRouteId })
                          .sort((a, b) => a.order - b.order)
    const positions   = getSegmentPositions(segs)
    const currentId   = expedition?.routeSegmentId
    const completedIds = expedition?.routeRun?.completedSegmentIds ?? []

    // Base path through positions
    let basePath = ''
    if (positions.length >= 2) {
      basePath = `M ${positions[0].x} ${positions[0].y}`
      for (let i = 1; i < positions.length; i++) {
        const p = positions[i - 1], c = positions[i]
        basePath += ` Q ${(p.x + c.x) / 2} ${p.y}, ${c.x} ${c.y}`
      }
    }

    // From/To sector names
    const fromSec = sectors.find(s => s.id === route.fromSectorId)
    const toSec   = sectors.find(s => s.id === route.toSectorId)

    return (
      <>
        {/* Route name */}
        <text x={240} y={50} textAnchor="middle" fontSize={11}
              style={{ fill: 'var(--color-gold)', fontFamily: 'Georgia,serif', fontWeight: 600 }}>
          {route.name}
        </text>
        <text x={240} y={66} textAnchor="middle" fontSize={8}
              style={{ fill: 'rgba(140,130,100,0.6)', fontFamily: 'Georgia,serif' }}>
          {fromSec?.name ?? '—'} → {toSec?.name ?? '—'}
        </text>

        {/* Base path */}
        {basePath && (
          <path d={basePath} stroke="rgba(98,107,111,0.22)" strokeWidth={4}
                fill="none" strokeLinecap="round"/>
        )}

        {/* Segment nodes */}
        {segs.map((seg, idx) => {
          const pos       = positions[idx]
          if (!pos) return null

          const isDone    = completedIds.includes(seg.id) || discoveredSegmentIds.includes(seg.id)
          const isCurrent = seg.id === currentId
          const firstHiddenIdx = segs.findIndex(s => !completedIds.includes(s.id) && s.id !== currentId)
          const isNext    = !isDone && !isCurrent && idx === firstHiddenIdx
          const isHidden  = !isDone && !isCurrent && !isNext
          const isSelected = selectedNodeId === seg.id

          let nodeStroke = 'rgba(98,107,111,0.3)'
          let labelFill  = 'rgba(98,107,111,0.5)'
          let nodeR      = 12
          if (isDone)    { nodeStroke = 'rgba(184,148,74,0.8)'; labelFill = 'var(--color-gold)' }
          if (isCurrent) { nodeStroke = 'var(--color-teal)';    labelFill = 'var(--color-parchment)'; nodeR = 15 }
          if (isNext)    { nodeStroke = 'rgba(79,143,149,0.4)'; labelFill = 'var(--color-mist)' }
          if (isSelected) nodeStroke = 'var(--color-gold)'

          const displayText = isHidden ? '?' : isCurrent ? seg.name : isNext ? 'Siguiente' : seg.name
          const shortText   = displayText.length > 13 ? displayText.slice(0, 11) + '…' : displayText

          return (
            <g key={seg.id}
               style={{ cursor: 'pointer' }}
               onClick={() => {
                 if (didDragRef.current) return
                 const next = selectedNodeId === seg.id ? null : seg.id
                 setSelectedNodeId(next)
                 setDetailSegment(next ? { seg, isDone, isCurrent, isHidden } : null)
                 setDetailSettlement(null)
               }}>
              {/* Connector line from previous */}
              {idx > 0 && positions[idx - 1] && (
                <line x1={positions[idx - 1].x} y1={positions[idx - 1].y}
                      x2={pos.x} y2={pos.y}
                      stroke={isDone ? 'rgba(184,148,74,0.35)' : 'rgba(98,107,111,0.18)'}
                      strokeWidth={2}
                      strokeDasharray={isDone ? undefined : '3 5'}/>
              )}

              {/* Pulse ring for current segment */}
              {isCurrent && (
                <circle cx={pos.x} cy={pos.y} r={nodeR + 7}
                        fill="none" stroke="rgba(79,143,149,0.2)" strokeWidth={2}/>
              )}

              {/* Node */}
              <circle cx={pos.x} cy={pos.y} r={nodeR}
                      fill="rgba(10,8,5,0.92)"
                      stroke={nodeStroke}
                      strokeWidth={isDone || isCurrent ? 1.8 : 1}/>

              {/* Interior dot */}
              {isDone    && <circle cx={pos.x} cy={pos.y} r={4.5} fill="rgba(184,148,74,0.65)"/>}
              {isCurrent && <rect x={pos.x - 3.5} y={pos.y - 3.5} width={7} height={7} rx={1.5}
                                  fill="var(--color-teal)"/>}
              {isHidden  && (
                <text x={pos.x} y={pos.y + 4.5} textAnchor="middle" fontSize={12}
                      style={{ fill: 'rgba(98,107,111,0.45)' }}>?</text>
              )}

              {/* Label below */}
              <text x={pos.x} y={pos.y + nodeR + 14} textAnchor="middle" fontSize={8}
                    style={{ fill: labelFill, fontFamily: 'Georgia,serif' }}>
                {shortText}
              </text>

              {/* "← actual" marker */}
              {isCurrent && (
                <text x={pos.x} y={pos.y - nodeR - 6} textAnchor="middle" fontSize={7}
                      style={{ fill: 'var(--color-teal)' }}>
                  ← actual
                </text>
              )}
            </g>
          )
        })}

        {segs.length === 0 && (
          <text x={240} y={240} textAnchor="middle" fontSize={10}
                style={{ fill: 'var(--color-stone-light)', fontStyle: 'italic', fontFamily: 'Georgia,serif' }}>
            Sin tramos conocidos en esta ruta
          </text>
        )}
      </>
    )
  }

  // ── Detail panel ─────────────────────────────────────────────────────────────

  function renderDetail() {
    if (detailSettlement) {
      const s = detailSettlement
      const visible = isSettlementVisible(s)
      if (!visible) return (
        <div className="visual-map-detail-panel">
          <span style={{ fontSize: '0.62rem', color: 'var(--color-stone-light)', fontStyle: 'italic' }}>
            Lugar en niebla — explora el sector para revelar este asentamiento.
          </span>
        </div>
      )
      return (
        <div className="visual-map-detail-panel">
          <div style={{ fontSize: '0.72rem', color: 'var(--color-gold)', fontWeight: 600, marginBottom: 2 }}>
            {s.name}
          </div>
          <div style={{ fontSize: '0.58rem', color: 'var(--color-stone-light)', textTransform: 'capitalize', marginBottom: 2 }}>
            {s.type.replace(/_/g, ' ')} · {s.layerName}
          </div>
          <div style={{ fontSize: '0.6rem', color: SAFETY_COLOR[s.safetyLevel] ?? 'var(--color-stone-light)', marginBottom: 3, textTransform: 'capitalize' }}>
            Seguridad: {s.safetyLevel}
          </div>
          {s.description && (
            <div style={{ fontSize: '0.58rem', color: 'var(--color-stone-light)', fontStyle: 'italic', lineHeight: 1.45 }}>
              {s.description}
            </div>
          )}
          {s.services?.length > 0 && (
            <div style={{ fontSize: '0.55rem', color: 'var(--color-mist)', marginTop: 4 }}>
              {s.services.map(sv => sv.replace(/_/g, ' ')).join(' · ')}
            </div>
          )}
        </div>
      )
    }

    if (detailSegment) {
      const { seg, isDone, isCurrent, isHidden } = detailSegment
      if (isHidden) return (
        <div className="visual-map-detail-panel">
          <span style={{ fontSize: '0.62rem', color: 'var(--color-stone-light)', fontStyle: 'italic' }}>
            Tramo desconocido — completa los anteriores para revelar este camino.
          </span>
        </div>
      )
      return (
        <div className="visual-map-detail-panel">
          <div style={{ fontSize: '0.72rem', color: isCurrent ? 'var(--color-teal)' : 'var(--color-gold)', fontWeight: 600, marginBottom: 2 }}>
            {seg.name}
          </div>
          <div style={{ fontSize: '0.58rem', color: 'var(--color-stone-light)', marginBottom: 3 }}>
            {seg.stepMin}–{seg.stepMax} pasos · {seg.type}
          </div>
          {isCurrent && <div style={{ fontSize: '0.6rem', color: 'var(--color-teal)' }}>Tramo en curso</div>}
          {isDone && !isCurrent && <div style={{ fontSize: '0.6rem', color: 'var(--color-xp)' }}>Tramo completado</div>}
        </div>
      )
    }

    return (
      <div className="visual-map-empty-detail">
        {viewLevel === 'abyss' && 'Toca una capa para explorar el Abismo'}
        {viewLevel === 'layer' && 'Toca un asentamiento o una ruta'}
        {viewLevel === 'route' && 'Toca un tramo para ver su detalle'}
      </div>
    )
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="visual-map-shell">
      <svg
        className="visual-map-svg"
        viewBox="0 0 480 480"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{ touchAction: 'none', cursor: dragStartRef.current ? 'grabbing' : 'grab' }}
      >
        <g transform={`translate(${pan.x}, ${pan.y})`}>
          {viewLevel === 'abyss'  && renderAbyssView()}
          {viewLevel === 'layer'  && renderLayerView()}
          {viewLevel === 'route'  && renderRouteView()}
        </g>
      </svg>

      {renderDetail()}
    </div>
  )
}
