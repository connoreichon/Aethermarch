import { useState, useRef } from 'react'
import { ARCHETYPES } from '../data/gameData.js'

const BASE = import.meta.env.BASE_URL

const ARCHETYPE_ART = {
  heraldo: `${BASE}assets/generated/heraldo_s2014_nobg.png`,
}
const ARCHETYPE_PANELS = {}
const ARCHETYPE_FRAMES = {
  heraldo: `${BASE}assets/generated/marco_v3_s9902.png`,
}


/* Marco SVG — perfectamente simétrico, construido en código */
function CardFrame() {
  const G  = 'rgba(178,140,48,0.88)'
  const Gd = 'rgba(155,120,38,0.55)'
  const Gb = 'rgba(215,175,58,1)'
  // Separador al 75% del viewBox (330/440) — info section sin espacio vacío
  const SEP = 330
  const sideYs = [76, 113, 150, 187, 224, 261, 298, 316]

  return (
    <svg
      className="cs-frame"
      viewBox="0 0 300 440"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        {/* Halo dorado detrás de la cruz */}
        <radialGradient id="cg" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="rgba(195,150,40,0.32)"/>
          <stop offset="100%" stopColor="rgba(195,150,40,0)"/>
        </radialGradient>
      </defs>

      {/* ── BORDE EXTERIOR ──────────────────────────────────── */}
      <rect x="3" y="3" width="294" height="434"
            fill="none" stroke={G} strokeWidth="1.5"/>
      {/* Borde interior sutil */}
      <rect x="8" y="8" width="284" height="424"
            fill="none" stroke="rgba(165,128,42,0.18)" strokeWidth="0.6"/>

      {/* ── CRUZ GÓTICA EN LA CIMA ──────────────────────────── */}
      {/* Halo */}
      <ellipse cx="150" cy="33" rx="54" ry="38" fill="url(#cg)"/>

      {/* Eje vertical */}
      <rect x="147" y="9" width="6" height="44" rx="1.5" fill={G}/>
      {/* Travesaño horizontal */}
      <rect x="124" y="24" width="52" height="6" rx="1.5" fill={G}/>

      {/* Serifas góticas en las puntas de los brazos (simétricas) */}
      {/* Punta superior — dos diagonales abiertas */}
      <line x1="147" y1="12" x2="143" y2="7"  stroke={G} strokeWidth="1.3" strokeLinecap="round"/>
      <line x1="153" y1="12" x2="157" y2="7"  stroke={G} strokeWidth="1.3" strokeLinecap="round"/>
      {/* Punta izquierda */}
      <line x1="124" y1="27" x2="119" y2="23" stroke={G} strokeWidth="1.3" strokeLinecap="round"/>
      <line x1="124" y1="33" x2="119" y2="37" stroke={G} strokeWidth="1.3" strokeLinecap="round"/>
      {/* Punta derecha (espejo exacto) */}
      <line x1="176" y1="27" x2="181" y2="23" stroke={G} strokeWidth="1.3" strokeLinecap="round"/>
      <line x1="176" y1="33" x2="181" y2="37" stroke={G} strokeWidth="1.3" strokeLinecap="round"/>

      {/* Gemas: arriba, abajo, izq, der, centro */}
      <polygon points="150,9  154,13 150,17 146,13" fill={Gb}/>
      <polygon points="150,49 154,53 150,57 146,53" fill={Gb}/>
      <polygon points="124,27 120,30 124,33 128,30" fill={Gb}/>
      <polygon points="176,27 172,30 176,33 180,30" fill={Gb}/>
      <polygon points="150,24 154,27 150,30 146,27" fill="rgba(240,205,78,1)"/>
      {/* Puntos flanqueantes */}
      <circle cx="95"  cy="27" r="2.2" fill={Gd}/>
      <circle cx="205" cy="27" r="2.2" fill={Gd}/>

      {/* ── ESQUINAS EN L ───────────────────────────────────── */}
      <path d="M3 56 L3 3 L56 3"
            fill="none" stroke={G} strokeWidth="2" strokeLinecap="round"/>
      <path d="M244 3 L297 3 L297 56"
            fill="none" stroke={G} strokeWidth="2" strokeLinecap="round"/>
      <path d="M3 384 L3 437 L56 437"
            fill="none" stroke={G} strokeWidth="2" strokeLinecap="round"/>
      <path d="M244 437 L297 437 L297 384"
            fill="none" stroke={G} strokeWidth="2" strokeLinecap="round"/>
      {/* Puntos en las esquinas */}
      <circle cx="3"   cy="3"   r="2.2" fill={Gd}/>
      <circle cx="297" cy="3"   r="2.2" fill={Gd}/>
      <circle cx="3"   cy="437" r="2.2" fill={Gd}/>
      <circle cx="297" cy="437" r="2.2" fill={Gd}/>

      {/* ── LÍNEA DE COLUMNA IZQUIERDA ──────────────────────── */}
      <line x1="40" y1="60" x2="40" y2={SEP}
            stroke={Gd} strokeWidth="0.8"/>
      {sideYs.map(y => (
        <path key={`l${y}`}
              d={`M40,${y - 5} L46,${y} L40,${y + 5}`}
              fill="none" stroke={Gd} strokeWidth="1.1" strokeLinecap="round"/>
      ))}

      {/* ── LÍNEA DE COLUMNA DERECHA (espejo exacto) ─────────── */}
      <line x1="260" y1="60" x2="260" y2={SEP}
            stroke={Gd} strokeWidth="0.8"/>
      {sideYs.map(y => (
        <path key={`r${y}`}
              d={`M260,${y - 5} L254,${y} L260,${y + 5}`}
              fill="none" stroke={Gd} strokeWidth="1.1" strokeLinecap="round"/>
      ))}

      {/* ── SEPARADOR HORIZONTAL al 75% ─────────────────────── */}
      <line x1="8"   y1={SEP} x2="136" y2={SEP} stroke={G} strokeWidth="0.8"/>
      <line x1="164" y1={SEP} x2="292" y2={SEP} stroke={G} strokeWidth="0.8"/>
      <polygon points={`150,${SEP-4} 155,${SEP} 150,${SEP+4} 145,${SEP}`} fill={G}/>
    </svg>
  )
}

function ClassCard({ arch, animClass }) {
  const art   = ARCHETYPE_ART[arch.id]
  const frame = ARCHETYPE_FRAMES[arch.id]

  return (
    <div className={`cs-card ${animClass}`}>
      {/* Personaje — z-index 1, queda bajo el marco */}
      {art
        ? <img className="cs-character" src={art} alt={arch.name} draggable="false" />
        : <div className="cs-character-empty"><span>⚔</span></div>}

      {/* Marco IA — PNG transparente en el centro */}
      {frame && (
        <img className="cs-frame-img" src={frame} alt="" aria-hidden="true" draggable="false" />
      )}

      {/* Nombre de clase superpuesto en la banda superior del marco */}
      <div className="cs-class-banner">
        <span className="cs-banner-role">{arch.role}</span>
        <span className="cs-banner-name">{arch.name}</span>
      </div>

      {/* Ficha de personaje — solo habilidad pasiva y stats */}
      <div className="cs-info">
        <span className="cs-passive-name">— {arch.passiveName} —</span>
        <p className="cs-passive-desc">{arch.passiveDescription}</p>
        {arch.hpBonus != null && (
          <div className="cs-stat-row">
            <span className="cs-stat-badge">&#9829; +{arch.hpBonus} vitalidad</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ClassSelectScreen({ onSelect }) {
  const [index,   setIndex]   = useState(0)
  const [fading,  setFading]  = useState(false)
  const busy     = useRef(false)
  const touchX   = useRef(null)
  const slideDir = useRef(1)

  function goTo(newIdx) {
    if (newIdx === index || busy.current) return
    if (newIdx < 0 || newIdx >= ARCHETYPES.length) return
    slideDir.current = newIdx > index ? 1 : -1
    busy.current = true
    setFading(true)
    setTimeout(() => {
      setIndex(newIdx)
      setFading(false)
      setTimeout(() => { busy.current = false }, 320)
    }, 200)
  }

  function onTouchStart(e) { touchX.current = e.touches[0].clientX }
  function onTouchEnd(e) {
    if (touchX.current === null) return
    const dx = e.changedTouches[0].clientX - touchX.current
    touchX.current = null
    if (dx < -60) goTo(index + 1)
    else if (dx > 60) goTo(index - 1)
  }

  const mouseX = useRef(null)
  function onMouseDown(e) { mouseX.current = e.clientX }
  function onMouseUp(e) {
    if (mouseX.current === null) return
    const dx = e.clientX - mouseX.current
    mouseX.current = null
    if (Math.abs(dx) < 8) return
    if (dx < -60) goTo(index + 1)
    else if (dx > 60) goTo(index - 1)
  }

  const arch      = ARCHETYPES[index]
  const exitDir   = slideDir.current === 1 ? 'cs-exit-l' : 'cs-exit-r'
  const enterDir  = slideDir.current === 1 ? 'cs-enter-r' : 'cs-enter-l'
  const animClass = fading ? exitDir : enterDir

  return (
    <div className="cs-screen">

      <div
        className="cs-viewport"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
      >
        <ClassCard arch={arch} animClass={animClass} />

        {index > 0 && (
          <button className="cs-arrow cs-arrow--l" onClick={() => goTo(index - 1)}>&#8249;</button>
        )}
        {index < ARCHETYPES.length - 1 && (
          <button className="cs-arrow cs-arrow--r" onClick={() => goTo(index + 1)}>&#8250;</button>
        )}
      </div>

      <div className="cs-dots">
        {ARCHETYPES.map((a, i) => (
          <button
            key={a.id}
            className={`cs-dot${i === index ? ' cs-dot--active' : ''}`}
            onClick={() => goTo(i)}
            aria-label={a.name}
          />
        ))}
      </div>

      <button className="btn btn-primary cs-cta" onClick={() => onSelect(arch.id)}>
        Elegir — {arch.name}
      </button>

    </div>
  )
}
