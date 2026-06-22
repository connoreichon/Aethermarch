import { useState, useRef, useEffect } from 'react'
import { ABYSS_STRATA } from '../data/gameData.js'
import { getSegmentsForRoute } from '../systems/routeSegmentSystem.js'

// ── 20 capas visuales del Abismo ─────────────────────────────────────────────

const ABYSS_VISUAL_LAYERS = [
  { id: 'stratum_01', number: 1,  name: 'Linde de las Raíces Ciegas',      shortName: 'Raíces Ciegas',    depthLabel: '0–250 m',       real: true  },
  { id: 'stratum_02', number: 2,  name: 'Cornisa de la Sal Negra',          shortName: 'Sal Negra',        depthLabel: '250–500 m',     real: true  },
  { id: 'stratum_03', number: 3,  name: 'Hornacinas de Ceniza',             shortName: 'Hornacinas',       depthLabel: '500–800 m',     real: true  },
  { id: 'stratum_04', number: 4,  name: 'Cámara de la Colmena Roja',        shortName: 'Colmena Roja',     depthLabel: '800–1100 m',    real: false },
  { id: 'stratum_05', number: 5,  name: 'Galerías de Espora Muerta',        shortName: 'Galerías',         depthLabel: '1100–1450 m',   real: false },
  { id: 'stratum_06', number: 6,  name: 'Acueductos Hundidos',              shortName: 'Acueductos',       depthLabel: '1450–1800 m',   real: false },
  { id: 'stratum_07', number: 7,  name: 'Jardines sin Sol',                 shortName: 'Jardines',         depthLabel: '1800–2200 m',   real: false },
  { id: 'stratum_08', number: 8,  name: 'Foso de Resina Negra',             shortName: 'Resina Negra',     depthLabel: '2200–2700 m',   real: false },
  { id: 'stratum_09', number: 9,  name: 'Bastiones del Hueso Antiguo',      shortName: 'Hueso Antiguo',    depthLabel: '2700–3300 m',   real: false },
  { id: 'stratum_10', number: 10, name: 'Desierto de Hielo Bajo',           shortName: 'Hielo Bajo',       depthLabel: '3300–4000 m',   real: false },
  { id: 'stratum_11', number: 11, name: 'Claustros de Vidrio',              shortName: 'Vidrio',           depthLabel: '4000–4800 m',   real: false },
  { id: 'stratum_12', number: 12, name: 'Umbral de las Campanas Rotas',     shortName: 'Campanas Rotas',   depthLabel: '4800–5700 m',   real: false },
  { id: 'stratum_13', number: 13, name: 'Forjas del Hierro Vivo',           shortName: 'Hierro Vivo',      depthLabel: '5700–6700 m',   real: false },
  { id: 'stratum_14', number: 14, name: 'Caverna de los Titanes Dormidos',  shortName: 'Titanes',          depthLabel: '6700–7900 m',   real: false },
  { id: 'stratum_15', number: 15, name: 'Mar Interior de Piedra',           shortName: 'Mar de Piedra',    depthLabel: '7900–9200 m',   real: false },
  { id: 'stratum_16', number: 16, name: 'Campo del Cristal Vivo',           shortName: 'Cristal Vivo',     depthLabel: '9200–10800 m',  real: false },
  { id: 'stratum_17', number: 17, name: 'Catedral de Raíz Fósil',           shortName: 'Raíz Fósil',       depthLabel: '10800–12600 m', real: false },
  { id: 'stratum_18', number: 18, name: 'Cámara de los Nombres Perdidos',   shortName: 'Nombres Perdidos', depthLabel: '12600–14600 m', real: false },
  { id: 'stratum_19', number: 19, name: 'Garganta del Primer Farol',        shortName: 'Primer Farol',     depthLabel: '14600–17000 m', real: false },
  { id: 'stratum_20', number: 20, name: 'Fondo sin Cielo',                  shortName: 'Fondo sin Cielo',  depthLabel: '∞',             real: false },
]

// Geometría de la espiral
const SPIRAL = { leftX: 128, rightX: 352, startY: 30, nodeStartY: 118, spacing: 76 }

// Pan limits para la vista Abismo (coordenadas SVG)
const ABYSS_PAN = { minY: -1210, maxY: 48 }

// ── Colores de seguridad ──────────────────────────────────────────────────────

const SAFETY_COLOR = {
  safe:      'var(--color-xp)',
  guarded:   'var(--color-gold)',
  unstable:  'var(--color-mist)',
  dangerous: 'var(--color-ember)',
  hostile:   'var(--color-hp)',
  mythic:    'var(--color-magic)',
}

// ── Posiciones de asentamientos en LAYER view (estilo cornisa de cueva) ──────

const SETTLEMENT_POS = {
  settlement_aethel_linde:           { x: 82,  y: 285 },
  settlement_root_lantern_market:    { x: 196, y: 148 },
  settlement_fogbreak_fort:          { x: 400, y: 116 },
  settlement_blind_lake_dock:        { x: 392, y: 330 },
  settlement_dust_gate_caravanserai: { x: 228, y: 388 },
}

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

function getLayerNodePos(i) {
  return {
    x: i % 2 === 0 ? SPIRAL.leftX : SPIRAL.rightX,
    y: SPIRAL.nodeStartY + i * SPIRAL.spacing,
  }
}

function buildAbyssSpiral() {
  const { leftX, rightX, startY, nodeStartY, spacing } = SPIRAL
  const cx = 240
  let d = `M ${cx} ${startY}`
  let prevX = cx
  let prevY = startY

  for (let i = 0; i < ABYSS_VISUAL_LAYERS.length; i++) {
    const nx = i % 2 === 0 ? leftX : rightX
    const ny = nodeStartY + i * spacing
    const goRight = nx > prevX
    const h = ny - prevY
    const cp1x = prevX + (goRight ? 50 : -50)
    const cp1y = prevY + h * 0.36
    const cp2x = nx  + (goRight ? -50 : 50)
    const cp2y = ny  - h * 0.25
    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${nx} ${ny}`
    prevX = nx; prevY = ny
  }
  return d
}

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
  const n = segs.length
  if (n === 0) return []
  if (n === 1) return [{ x: 240, y: 240 }]
  const pad     = n > 8 ? 48 : 72
  const spacing = (480 - pad * 2) / (n - 1)
  return segs.map((_, i) => ({
    x: pad + i * spacing,
    y: 235 + Math.sin(i * (n > 8 ? 0.65 : 0.85)) * (n > 8 ? 50 : 42),
  }))
}

// ── Icono de asentamiento ─────────────────────────────────────────────────────

function SettlementShape({ type, cx, cy, color, r = 11 }) {
  if (type === 'village') return (
    <g>
      <polygon points={`${cx},${cy - r} ${cx - r * 0.75},${cy - r * 0.1} ${cx + r * 0.75},${cy - r * 0.1}`}
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

// ── Componente principal ──────────────────────────────────────────────────────

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
  const isDownRef    = useRef(false)
  const didDragRef   = useRef(false)
  const dragStartRef = useRef(null)
  const [selectedNodeId,    setSelectedNodeId]    = useState(null)
  const [detailSettlement,  setDetailSettlement]  = useState(null)
  const [detailSegment,     setDetailSegment]     = useState(null)
  const [detailLockedLayer, setDetailLockedLayer] = useState(null)

  useEffect(() => { setPan({ x: 0, y: 0 }) }, [centerTrigger])

  useEffect(() => {
    setSelectedNodeId(null)
    setDetailSettlement(null)
    setDetailSegment(null)
    setDetailLockedLayer(null)
  }, [viewLevel, selectedLayerId, selectedRouteId])

  function onPointerDown(e) {
    isDownRef.current    = true
    didDragRef.current   = false
    dragStartRef.current = { panX: pan.x, panY: pan.y, originX: e.clientX, originY: e.clientY }
  }

  function onPointerMove(e) {
    if (!isDownRef.current || !dragStartRef.current) return
    const dx = e.clientX - dragStartRef.current.originX
    const dy = e.clientY - dragStartRef.current.originY
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) didDragRef.current = true
    let newX = dragStartRef.current.panX + dx
    let newY = dragStartRef.current.panY + dy
    if (viewLevel === 'abyss') {
      newX = 0
      newY = Math.min(ABYSS_PAN.maxY, Math.max(ABYSS_PAN.minY, newY))
    }
    setPan({ x: newX, y: newY })
  }

  function onPointerUp() {
    isDownRef.current    = false
    dragStartRef.current = null
  }

  function isSettlementVisible(s) {
    const sec = sectors.find(sec => sec.id === s.sectorId)
    return s.unlocked || (sec?.discovered ?? false)
  }

  function isLayerUnlocked(layer) {
    if (!layer.real) return false
    if (layer.id === 'stratum_01') return true
    if (layer.id === 'stratum_02') {
      return sectors.some(s => (s.id === 'sector_salt_beacon' || s.id === 'sector_tide_rock') && s.discovered)
    }
    if (layer.id === 'stratum_03') {
      return sectors.some(s => (s.id === 'sector_sleeping_forge' || s.id === 'sector_coal_bastion') && s.discovered)
    }
    return false
  }

  // ── VISTA ABISMO — espiral vertical ─────────────────────────────────────────

  function renderAbyssView() {
    const spiralPath = buildAbyssSpiral()
    const totalH     = SPIRAL.nodeStartY + (ABYSS_VISUAL_LAYERS.length - 1) * SPIRAL.spacing + 100

    // Depth markers: placed beside nodes at key depths
    const depthMarkers = [
      { y: 118,  label: '0 m',       side: 'left'  },
      { y: 270,  label: '250 m',     side: 'right' },
      { y: 422,  label: '500 m',     side: 'left'  },
      { y: 650,  label: '1100 m',    side: 'right' },
      { y: 878,  label: '2200 m',    side: 'left'  },
      { y: 1106, label: '4000 m',    side: 'right' },
      { y: 1334, label: '7900 m',    side: 'left'  },
      { y: 1562, label: '∞',         side: 'right' },
    ]

    return (
      <>
        {/* Fondo total del Abismo */}
        <rect x={-20} y={-60} width={520} height={totalH + 120}
              fill="rgba(3,5,2,0.99)"/>

        {/* Brillo ambiental tenue desde arriba */}
        <radialGradient id="abyssTopGlow" cx="0.5" cy="0" r="0.6">
          <stop offset="0%"   stopColor="rgba(184,148,74,0.07)"/>
          <stop offset="100%" stopColor="rgba(0,0,0,0)"/>
        </radialGradient>
        <ellipse cx={240} cy={-20} rx={260} ry={180}
                 fill="url(#abyssTopGlow)"/>

        {/* Paredes del Abismo — izquierda */}
        <path className="abyss-wall-left"
              d={`M 0 -60
                  C 14 80, 0 200, 18 320
                  C 34 440, 12 560, 26 680
                  C 40 800, 14 920, 28 1040
                  C 42 1160, 16 1280, 30 1400
                  C 44 1520, 18 1620, 32 ${totalH}
                  L 0 ${totalH} Z`}/>

        {/* Paredes del Abismo — derecha */}
        <path className="abyss-wall-right"
              d={`M 480 -60
                  C 466 80, 480 200, 462 320
                  C 446 440, 468 560, 454 680
                  C 440 800, 466 920, 452 1040
                  C 438 1160, 464 1280, 450 1400
                  C 436 1520, 462 1620, 448 ${totalH}
                  L 480 ${totalH} Z`}/>

        {/* Sombra central de la sima */}
        <linearGradient id="shaftFade" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="rgba(0,0,0,0.55)"/>
          <stop offset="22%"  stopColor="rgba(0,0,0,0)"/>
          <stop offset="78%"  stopColor="rgba(0,0,0,0)"/>
          <stop offset="100%" stopColor="rgba(0,0,0,0.55)"/>
        </linearGradient>
        <rect x={0} y={-60} width={480} height={totalH + 120}
              fill="url(#shaftFade)" style={{ pointerEvents: 'none' }}/>

        {/* Marcas de profundidad */}
        {depthMarkers.map(m => (
          <g key={m.y}>
            <line x1={70} y1={m.y} x2={410} y2={m.y}
                  stroke="rgba(98,107,111,0.08)" strokeWidth={0.6} strokeDasharray="2 8"/>
            <text
              x={m.side === 'left' ? 8 : 472}
              y={m.y + 4}
              fontSize={7}
              textAnchor={m.side === 'left' ? 'start' : 'end'}
              className="abyss-layer-depth">
              {m.label}
            </text>
          </g>
        ))}

        {/* Sombra de la espiral */}
        <path d={spiralPath} className="abyss-spiral-road-shadow"/>

        {/* Espiral principal */}
        <path d={spiralPath} className="abyss-spiral-road"/>

        {/* Nodos de capa */}
        {ABYSS_VISUAL_LAYERS.map((layer, i) => {
          const pos      = getLayerNodePos(i)
          const unlocked = isLayerUnlocked(layer)
          const isLeft   = i % 2 === 0
          const isSel    = selectedNodeId === layer.id

          // Cornisa bajo el nodo
          const corniceX1 = isLeft ? pos.x - 32 : pos.x - 52
          const corniceX2 = isLeft ? pos.x + 52 : pos.x + 32
          const corniceY  = pos.y + 16

          return (
            <g key={layer.id}
               className={`abyss-layer-node ${unlocked ? 'unlocked' : 'locked'}`}
               style={{ cursor: unlocked ? 'pointer' : 'default' }}
               onClick={() => {
                 if (didDragRef.current) return
                 if (unlocked) {
                   onSelectLayer(layer.id)
                 } else {
                   const same = selectedNodeId === layer.id
                   setSelectedNodeId(same ? null : layer.id)
                   setDetailLockedLayer(same ? null : layer)
                   setDetailSettlement(null)
                   setDetailSegment(null)
                 }
               }}>

              {/* Cornisa rocosa */}
              <path d={`M ${corniceX1} ${corniceY} C ${corniceX1 + 10} ${corniceY - 2}, ${corniceX2 - 10} ${corniceY - 2}, ${corniceX2} ${corniceY}`}
                    className="abyss-cornice"
                    stroke={unlocked ? 'rgba(100,80,40,0.45)' : 'rgba(60,55,50,0.25)'}
                    strokeWidth={2.5} fill="none"/>

              {/* Halo de selección */}
              {isSel && (
                <circle cx={pos.x} cy={pos.y} r={26}
                        fill="none" stroke="rgba(184,148,74,0.22)"
                        strokeWidth={8} style={{ pointerEvents: 'none' }}/>
              )}

              {/* Círculo nodo */}
              <circle cx={pos.x} cy={pos.y} r={18}
                      fill={unlocked ? 'rgba(14,10,5,0.95)' : 'rgba(7,7,6,0.9)'}
                      stroke={unlocked ? 'rgba(184,148,74,0.68)' : 'rgba(70,65,58,0.32)'}
                      strokeWidth={unlocked ? 1.5 : 0.8}/>

              {/* Número romano o ? */}
              <text x={pos.x} y={pos.y + 5} textAnchor="middle" fontSize={unlocked ? 11 : 9}
                    fontFamily="Georgia,serif"
                    fill={unlocked ? 'var(--color-gold)' : 'rgba(90,85,78,0.5)'}>
                {unlocked ? layer.number : '?'}
              </text>

              {/* Nombre de capa */}
              <text
                x={isLeft ? pos.x - 26 : pos.x + 26}
                y={pos.y - 6}
                textAnchor={isLeft ? 'end' : 'start'}
                fontSize={unlocked ? 8.5 : 7.5}
                fontFamily="Georgia,serif"
                className="abyss-layer-label"
                fill={unlocked ? 'var(--color-parchment)' : 'rgba(80,75,68,0.35)'}>
                {unlocked ? layer.shortName : (i < 3 ? '— — —' : '')}
              </text>

              {/* Profundidad */}
              {unlocked && (
                <text
                  x={isLeft ? pos.x - 26 : pos.x + 26}
                  y={pos.y + 6}
                  textAnchor={isLeft ? 'end' : 'start'}
                  fontSize={7}
                  fontFamily="Georgia,serif"
                  fill="rgba(140,125,90,0.55)">
                  {layer.depthLabel}
                </text>
              )}

              {/* Flecha "entrar" solo en desbloqueadas */}
              {unlocked && (
                <text x={pos.x} y={pos.y - 22} textAnchor="middle" fontSize={7}
                      fill="rgba(184,148,74,0.5)">▼</text>
              )}

              {/* Niebla en capas bloqueadas */}
              {!unlocked && (
                <rect x={pos.x - 50} y={pos.y - 22} width={100} height={50}
                      rx={4}
                      fill="rgba(6,6,5,0.45)"
                      className="abyss-locked-fog"
                      style={{ pointerEvents: 'none' }}/>
              )}
            </g>
          )
        })}

        {/* Texto final */}
        <text x={240} y={totalH - 10} textAnchor="middle" fontSize={8}
              fontFamily="Georgia,serif"
              fill="rgba(80,75,68,0.28)">
          ∞ profundidades sin cartografiar
        </text>
      </>
    )
  }

  // ── VISTA CAPA — cornisas de cueva ────────────────────────────────────────

  function renderLayerView() {
    const connections  = STRATUM_CONNECTIONS[selectedLayerId] ?? []
    const sectorPosMap = SECTOR_POS[selectedLayerId] ?? {}

    function getPos(nodeId) {
      if (SETTLEMENT_POS[nodeId]) return SETTLEMENT_POS[nodeId]
      return sectorPosMap[nodeId] ?? null
    }

    function routeStyle(conn) {
      const route    = routes.find(r => r.id === conn.routeId)
      const isActive = expedition?.routeRun?.routeId === conn.routeId || expedition?.routeId === conn.routeId
      const isSel    = selectedNodeId === `conn_${conn.routeId}`
      if (!conn.routeId || !route) {
        return { stroke: 'rgba(98,107,111,0.18)', dash: '3 6', width: 1.2, clickable: false }
      }
      let stroke = conn.danger === 'medium' ? 'rgba(214,104,40,0.42)' : 'rgba(184,148,74,0.42)'
      if (route.type === 'secret')    stroke = 'rgba(140,80,180,0.45)'
      if (route.type === 'dangerous') stroke = 'rgba(200,60,40,0.45)'
      if (isActive) stroke = 'rgba(79,143,149,0.75)'
      if (isSel)    stroke = 'var(--color-teal)'
      return {
        stroke, dash: route.type === 'secret' ? '4 5' : undefined,
        width: isSel ? 3 : isActive ? 2.5 : 1.8, clickable: true,
      }
    }

    const layerSettlements = settlements.filter(s => s.stratumId === selectedLayerId)

    return (
      <>
        {/* Fondo oscuro de cueva */}
        <rect x={0} y={0} width={480} height={480} fill="rgba(5,7,4,0.97)"/>

        {/* Pared izquierda de cueva */}
        <path d="M 0 0 C 22 60, 8 140, 20 220 C 30 300, 10 380, 18 480 L 0 480 Z"
              fill="rgba(18,14,8,0.9)"/>

        {/* Pared derecha de cueva */}
        <path d="M 480 0 C 458 60, 472 140, 460 220 C 448 300, 470 380, 462 480 L 480 480 Z"
              fill="rgba(18,14,8,0.9)"/>

        {/* Estalactitas superiores */}
        <path d="M 110 0 L 98 44 L 122 0" fill="rgba(16,13,8,0.8)"/>
        <path d="M 270 0 L 258 62 L 282 0" fill="rgba(16,13,8,0.75)"/>
        <path d="M 360 0 L 350 34 L 370 0" fill="rgba(16,13,8,0.8)"/>
        <path d="M 180 0 L 170 28 L 190 0" fill="rgba(16,13,8,0.65)"/>

        {/* Zona de agua oscura (fondo derecho, para el puerto) */}
        <ellipse cx={394} cy={362} rx={70} ry={22}
                 fill="rgba(12,22,35,0.65)"/>
        <ellipse cx={394} cy={362} rx={68} ry={4}
                 fill="rgba(20,40,62,0.5)"/>

        {/* Brillo cálido desde Aethel Linde (izquierda, asentamiento inicial) */}
        <radialGradient id="aethelGlow" cx="0.17" cy="0.59" r="0.45">
          <stop offset="0%"   stopColor="rgba(184,148,74,0.1)"/>
          <stop offset="100%" stopColor="rgba(0,0,0,0)"/>
        </radialGradient>
        <rect x={0} y={0} width={480} height={480} fill="url(#aethelGlow)"
              style={{ pointerEvents: 'none' }}/>

        {/* Rutas */}
        {connections.map((conn, i) => {
          const fromPos = getPos(conn.from)
          const toPos   = getPos(conn.to)
          if (!fromPos || !toPos) return null
          const st = routeStyle(conn)
          return (
            <path key={i}
                  d={createCurvedPath(fromPos, toPos, conn.bend ?? 0.22)}
                  stroke={st.stroke} strokeWidth={st.width}
                  strokeDasharray={st.dash} fill="none" strokeLinecap="round"
                  className={`abyss-route-curve${st.clickable ? '' : ' locked'}${selectedNodeId === `conn_${conn.routeId}` ? ' selected' : ''}`}
                  style={{ cursor: st.clickable ? 'pointer' : 'default' }}
                  onClick={() => {
                    if (didDragRef.current || !st.clickable) return
                    setSelectedNodeId(`conn_${conn.routeId}`)
                    setDetailSegment(null); setDetailSettlement(null)
                    onSelectRoute(conn.routeId)
                  }}/>
          )
        })}

        {/* Sectores (estrato 2 y 3) */}
        {Object.entries(sectorPosMap).map(([secId, pos]) => {
          const sec        = sectors.find(s => s.id === secId)
          const discovered = sec?.discovered ?? false
          return (
            <g key={secId}>
              <circle cx={pos.x} cy={pos.y} r={18}
                      fill="rgba(12,10,7,0.88)"
                      stroke={discovered ? 'rgba(184,148,74,0.55)' : 'rgba(98,107,111,0.3)'}
                      strokeWidth={1.2}/>
              <text x={pos.x} y={pos.y + 4} textAnchor="middle" fontSize={9}
                    fill={discovered ? 'var(--color-gold)' : 'rgba(98,107,111,0.45)'}>
                {discovered ? '⬡' : '?'}
              </text>
              <text x={pos.x} y={pos.y + 30} textAnchor="middle" fontSize={7.5}
                    fontFamily="Georgia,serif"
                    fill={discovered ? 'var(--color-parchment)' : 'rgba(98,107,111,0.4)'}>
                {discovered ? (sec?.name ?? secId) : '—'}
              </text>
            </g>
          )
        })}

        {/* Asentamientos sobre cornisas */}
        {layerSettlements.map(s => {
          const pos       = SETTLEMENT_POS[s.id]
          if (!pos) return null
          const visible   = isSettlementVisible(s)
          const isSel     = selectedNodeId === s.id
          const safeColor = SAFETY_COLOR[s.safetyLevel] ?? 'var(--color-stone-light)'
          const nodeColor = visible ? safeColor : 'rgba(98,107,111,0.28)'

          return (
            <g key={s.id} style={{ cursor: 'pointer' }}
               onClick={() => {
                 if (didDragRef.current) return
                 const next = selectedNodeId === s.id ? null : s.id
                 setSelectedNodeId(next)
                 setDetailSettlement(next ? s : null)
                 setDetailSegment(null)
                 onSelectSettlement(s.id)
               }}>
              {/* Cornisa / ledge bajo el asentamiento */}
              <path d={`M ${pos.x - 28} ${pos.y + 18} C ${pos.x - 10} ${pos.y + 15}, ${pos.x + 10} ${pos.y + 15}, ${pos.x + 28} ${pos.y + 18}`}
                    stroke={visible ? 'rgba(80,60,30,0.5)' : 'rgba(60,55,50,0.2)'}
                    strokeWidth={3} fill="none"/>

              {/* Halo de selección */}
              {isSel && (
                <circle cx={pos.x} cy={pos.y} r={27}
                        fill="none" stroke={safeColor} strokeWidth={1.2}
                        strokeOpacity={0.4} strokeDasharray="3 4"/>
              )}

              {/* Nodo */}
              <circle cx={pos.x} cy={pos.y} r={19}
                      fill={visible ? 'rgba(12,9,4,0.93)' : 'rgba(8,7,5,0.82)'}
                      stroke={nodeColor} strokeWidth={visible ? 1.6 : 0.7}
                      strokeOpacity={visible ? 1 : 0.35}/>

              {/* Icono */}
              <g opacity={visible ? 1 : 0.22}>
                <SettlementShape type={s.type} cx={pos.x} cy={pos.y} color={nodeColor} r={11}/>
              </g>
              {!visible && (
                <text x={pos.x} y={pos.y + 4} textAnchor="middle" fontSize={12}
                      fill="rgba(98,107,111,0.38)">?</text>
              )}

              {/* Etiqueta */}
              <text x={pos.x} y={pos.y + 34} textAnchor="middle" fontSize={7.5}
                    fontFamily="Georgia,serif"
                    fill={visible ? 'var(--color-parchment)' : 'rgba(98,107,111,0.35)'}>
                {visible ? s.name : '—'}
              </text>
            </g>
          )
        })}

        {layerSettlements.length === 0 && Object.keys(sectorPosMap).length === 0 && (
          <text x={240} y={240} textAnchor="middle" fontSize={11}
                fontStyle="italic" fontFamily="Georgia,serif"
                fill="var(--color-stone-light)">
            Esta capa no tiene datos visuales aún
          </text>
        )}
      </>
    )
  }

  // ── VISTA RUTA — muchos puntos sobre camino ───────────────────────────────

  function renderRouteView() {
    const route = routes.find(r => r.id === selectedRouteId)
    if (!route) return (
      <text x={240} y={240} textAnchor="middle" fontSize={11}
            fill="var(--color-stone-light)">Ruta no encontrada</text>
    )

    const segs         = getSegmentsForRoute({ segments: routeSegments, routeId: selectedRouteId })
                           .sort((a, b) => a.order - b.order)
    const positions    = getSegmentPositions(segs)
    const n            = segs.length
    const many         = n > 8
    const nodeR        = many ? 7 : 12
    const currentId    = expedition?.routeSegmentId
    const completedIds = expedition?.routeRun?.completedSegmentIds ?? []
    const fromSec      = sectors.find(s => s.id === route.fromSectorId)
    const toSec        = sectors.find(s => s.id === route.toSectorId)

    // Base path
    let basePath = ''
    if (positions.length >= 2) {
      basePath = `M ${positions[0].x} ${positions[0].y}`
      for (let i = 1; i < positions.length; i++) {
        const p = positions[i - 1], c = positions[i]
        basePath += ` Q ${(p.x + c.x) / 2} ${p.y}, ${c.x} ${c.y}`
      }
    }

    const lastDoneIdx = segs.reduce((best, seg, idx) =>
      (completedIds.includes(seg.id) || discoveredSegmentIds.includes(seg.id)) ? idx : best, -1)

    return (
      <>
        {/* Nombre de ruta */}
        <text x={240} y={50} textAnchor="middle" fontSize={11}
              fontFamily="Georgia,serif" fontWeight={600}
              fill="var(--color-gold)">{route.name}</text>
        <text x={240} y={66} textAnchor="middle" fontSize={8}
              fontFamily="Georgia,serif"
              fill="rgba(140,130,100,0.6)">
          {fromSec?.name ?? '—'} → {toSec?.name ?? '—'}
        </text>
        {many && (
          <text x={240} y={80} textAnchor="middle" fontSize={7.5}
                fill="rgba(140,130,100,0.45)">
            {n} tramos
          </text>
        )}

        {/* Camino base */}
        {basePath && (
          <path d={basePath} stroke="rgba(98,107,111,0.18)" strokeWidth={many ? 3 : 4}
                fill="none" strokeLinecap="round"/>
        )}

        {/* Nodos de tramo */}
        {segs.map((seg, idx) => {
          const pos        = positions[idx]
          if (!pos) return null
          const isDone     = completedIds.includes(seg.id) || discoveredSegmentIds.includes(seg.id)
          const isCurrent  = seg.id === currentId
          const firstHiddenIdx = segs.findIndex(s =>
            !completedIds.includes(s.id) && !discoveredSegmentIds.includes(s.id) && s.id !== currentId)
          const isNext     = !isDone && !isCurrent && idx === firstHiddenIdx
          const isHidden   = !isDone && !isCurrent && !isNext
          const isSel      = selectedNodeId === seg.id

          // Solo mostrar etiqueta en tramos relevantes
          const showLabel  = isCurrent || isSel || (isDone && idx === lastDoneIdx) || (isNext && !many) || (!many && !isHidden)

          let nodeStroke = 'rgba(70,65,58,0.3)'
          let labelFill  = 'rgba(98,107,111,0.45)'
          if (isDone)    { nodeStroke = 'rgba(184,148,74,0.8)'; labelFill = 'var(--color-gold)' }
          if (isCurrent) { nodeStroke = 'var(--color-teal)';    labelFill = 'var(--color-parchment)' }
          if (isNext)    { nodeStroke = 'rgba(79,143,149,0.4)'; labelFill = 'var(--color-mist)' }
          if (isSel)       nodeStroke = 'var(--color-gold)'

          const displayText = isHidden ? '?' : isCurrent ? seg.name : isNext ? 'Siguiente' : seg.name
          const maxLen      = many ? 10 : 13
          const shortText   = displayText.length > maxLen ? displayText.slice(0, maxLen - 1) + '…' : displayText

          return (
            <g key={seg.id} className={`abyss-segment-dot${isDone ? ' completed' : isCurrent ? ' current' : isHidden ? ' hidden' : ''}`}
               style={{ cursor: 'pointer' }}
               onClick={() => {
                 if (didDragRef.current) return
                 const next = selectedNodeId === seg.id ? null : seg.id
                 setSelectedNodeId(next)
                 setDetailSegment(next ? { seg, isDone, isCurrent, isHidden } : null)
                 setDetailSettlement(null)
               }}>

              {/* Línea al anterior */}
              {idx > 0 && positions[idx - 1] && (
                <line x1={positions[idx - 1].x} y1={positions[idx - 1].y}
                      x2={pos.x} y2={pos.y}
                      stroke={isDone ? 'rgba(184,148,74,0.3)' : 'rgba(98,107,111,0.15)'}
                      strokeWidth={many ? 2 : 2.5}
                      strokeDasharray={isDone ? undefined : '3 5'}/>
              )}

              {/* Pulso actual */}
              {isCurrent && (
                <circle cx={pos.x} cy={pos.y} r={nodeR + 7}
                        fill="none" stroke="rgba(79,143,149,0.18)" strokeWidth={3}/>
              )}

              {/* Nodo */}
              <circle cx={pos.x} cy={pos.y} r={nodeR}
                      fill="rgba(9,7,4,0.93)"
                      stroke={nodeStroke}
                      strokeWidth={isDone || isCurrent ? (many ? 1.5 : 1.8) : (many ? 0.9 : 1)}/>

              {/* Interior */}
              {isDone    && <circle cx={pos.x} cy={pos.y} r={many ? 3 : 4.5} fill="rgba(184,148,74,0.65)"/>}
              {isCurrent && <rect x={pos.x - (many ? 2.5 : 3.5)} y={pos.y - (many ? 2.5 : 3.5)}
                                  width={many ? 5 : 7} height={many ? 5 : 7}
                                  rx={1} fill="var(--color-teal)"/>}
              {isHidden && !many && (
                <text x={pos.x} y={pos.y + 4.5} textAnchor="middle" fontSize={10}
                      fill="rgba(98,107,111,0.4)">?</text>
              )}

              {/* Etiqueta */}
              {showLabel && (
                <text x={pos.x} y={pos.y + nodeR + (many ? 12 : 15)} textAnchor="middle"
                      fontSize={many ? 7 : 8} fontFamily="Georgia,serif"
                      fill={labelFill}>
                  {shortText}
                </text>
              )}

              {/* Marcador "actual" */}
              {isCurrent && (
                <text x={pos.x} y={pos.y - nodeR - 6} textAnchor="middle" fontSize={7}
                      fill="var(--color-teal)">← actual</text>
              )}
            </g>
          )
        })}

        {segs.length === 0 && (
          <text x={240} y={240} textAnchor="middle" fontSize={10}
                fontStyle="italic" fontFamily="Georgia,serif"
                fill="var(--color-stone-light)">Sin tramos conocidos</text>
        )}
      </>
    )
  }

  // ── Panel de detalle ─────────────────────────────────────────────────────────

  function renderDetail() {
    if (detailLockedLayer) {
      return (
        <div className="visual-map-detail-panel">
          <div style={{ fontSize: '0.68rem', color: 'rgba(90,83,70,0.65)', fontWeight: 600, marginBottom: 3, fontFamily: 'Georgia,serif' }}>
            {detailLockedLayer.name}
          </div>
          <div style={{ fontSize: '0.58rem', color: 'rgba(90,83,70,0.4)', fontStyle: 'italic', lineHeight: 1.45 }}>
            Profundidad no cartografiada — nadie que haya bajado hasta aquí ha vuelto con mapas completos.
          </div>
        </div>
      )
    }

    if (detailSettlement) {
      const s       = detailSettlement
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
          {seg.description && (
            <div style={{ fontSize: '0.58rem', color: 'var(--color-stone-light)', fontStyle: 'italic', lineHeight: 1.4 }}>
              {seg.description}
            </div>
          )}
          {isCurrent  && <div style={{ fontSize: '0.6rem', color: 'var(--color-teal)',   marginTop: 3 }}>Tramo en curso</div>}
          {isDone && !isCurrent && <div style={{ fontSize: '0.6rem', color: 'var(--color-xp)', marginTop: 3 }}>Tramo completado</div>}
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
        overflow="hidden"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{ touchAction: 'none', cursor: isDownRef.current ? 'grabbing' : 'grab' }}
      >
        <g transform={`translate(${pan.x}, ${pan.y})`}>
          {viewLevel === 'abyss' && renderAbyssView()}
          {viewLevel === 'layer' && renderLayerView()}
          {viewLevel === 'route' && renderRouteView()}
        </g>

        {/* Gradiente inferior fijo — indica que hay más contenido debajo */}
        {viewLevel === 'abyss' && pan.y > ABYSS_PAN.minY + 60 && (
          <>
            <defs>
              <linearGradient id="scrollFade" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="rgba(3,5,2,0)" stopOpacity="0"/>
                <stop offset="100%" stopColor="rgba(3,5,2,0.75)" stopOpacity="0.75"/>
              </linearGradient>
            </defs>
            <rect x={0} y={390} width={480} height={90}
                  fill="url(#scrollFade)" style={{ pointerEvents: 'none' }}/>
            <text x={240} y={472} textAnchor="middle" fontSize={7.5}
                  className="abyss-scroll-hint"
                  style={{ pointerEvents: 'none' }}>
              ↕ desliza para explorar el Abismo
            </text>
          </>
        )}
      </svg>

      {renderDetail()}
    </div>
  )
}
