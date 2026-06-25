import { useState, useRef } from 'react'
import { ARCHETYPES } from '../data/gameData.js'

const BASE = import.meta.env.BASE_URL

const ARCHETYPE_ART = {
  heraldo: `${BASE}assets/generated/heraldo_botharms_s2014.png`,
}
const ARCHETYPE_PANELS = {
  heraldo: `${BASE}assets/generated/heraldo_panel.png`,
}

// Marco SVG: esquinas en L doradas, borde fino, separador con diamante
function CardFrame() {
  return (
    <svg
      className="cs-frame"
      viewBox="0 0 200 300"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Borde exterior fino */}
      <rect x="2" y="2" width="196" height="296" fill="none"
            stroke="rgba(155,115,38,0.48)" strokeWidth="0.8"/>
      {/* Borde interior offset */}
      <rect x="6" y="6" width="188" height="288" fill="none"
            stroke="rgba(155,115,38,0.15)" strokeWidth="0.4"/>

      {/* Esquinas en L — top-left */}
      <path d="M2 34 L2 2 L34 2" fill="none"
            stroke="rgba(165,125,45,0.82)" strokeWidth="1.6" strokeLinecap="round"/>
      {/* top-right */}
      <path d="M166 2 L198 2 L198 34" fill="none"
            stroke="rgba(165,125,45,0.82)" strokeWidth="1.6" strokeLinecap="round"/>
      {/* bottom-left */}
      <path d="M2 266 L2 298 L34 298" fill="none"
            stroke="rgba(165,125,45,0.82)" strokeWidth="1.6" strokeLinecap="round"/>
      {/* bottom-right */}
      <path d="M166 298 L198 298 L198 266" fill="none"
            stroke="rgba(165,125,45,0.82)" strokeWidth="1.6" strokeLinecap="round"/>

      {/* Puntos en las cuatro esquinas */}
      <circle cx="2"   cy="2"   r="2.2" fill="rgba(148,108,25,0.75)"/>
      <circle cx="198" cy="2"   r="2.2" fill="rgba(148,108,25,0.75)"/>
      <circle cx="2"   cy="298" r="2.2" fill="rgba(148,108,25,0.75)"/>
      <circle cx="198" cy="298" r="2.2" fill="rgba(148,108,25,0.75)"/>

      {/* Separador a ~68% de altura (204/300) */}
      <line x1="8"   y1="204" x2="88"  y2="204"
            stroke="rgba(140,105,25,0.5)" strokeWidth="0.7"/>
      <line x1="112" y1="204" x2="192" y2="204"
            stroke="rgba(140,105,25,0.5)" strokeWidth="0.7"/>
      {/* Diamante central en el separador */}
      <polygon points="100,200.5 104.5,204 100,207.5 95.5,204"
               fill="rgba(155,115,38,0.7)"/>
    </svg>
  )
}

function ClassCard({ arch, animClass }) {
  const art   = ARCHETYPE_ART[arch.id]
  const panel = ARCHETYPE_PANELS[arch.id]

  return (
    <div className={`cs-card ${animClass}`}>
      {/* Fondo decorativo */}
      {panel
        ? <img className="cs-panel" src={panel} alt="" aria-hidden="true" draggable="false" />
        : <div className="cs-panel cs-panel--default" />}

      {/* Personaje */}
      {art
        ? <img className="cs-character" src={art} alt={arch.name} draggable="false" />
        : <div className="cs-character-empty"><span>⚔</span></div>}

      {/* Marco decorativo encima de todo */}
      <CardFrame />

      {/* Ficha de personaje */}
      <div className="cs-info">
        <div className="cs-info-header">
          <div className="cs-role">{arch.role}</div>
          <div className="cs-name">{arch.name}</div>
        </div>
        <div className="cs-sep" />
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

      <div className="cs-header">
        <span className="cs-eyebrow">· Aethermarch ·</span>
        <h2 className="cs-title">
          <span className="cs-word" style={{ animationDelay: '0.4s'  }}>Elige</span>
          {' '}
          <span className="cs-word" style={{ animationDelay: '0.75s' }}>a tu</span>
          {' '}
          <span className="cs-word" style={{ animationDelay: '1.1s'  }}>Aventurero</span>
        </h2>
      </div>

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
