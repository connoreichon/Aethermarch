import { useState, useRef } from 'react'
import { ARCHETYPES } from '../data/gameData.js'

const BASE = import.meta.env.BASE_URL

const ARCHETYPE_ART = {
  heraldo: `${BASE}assets/generated/heraldo_botharms_s2014.png`,
}
const ARCHETYPE_PANELS = {
  heraldo: `${BASE}assets/generated/heraldo_panel.png`,
}

function ClassCard({ arch, animClass }) {
  const art   = ARCHETYPE_ART[arch.id]
  const panel = ARCHETYPE_PANELS[arch.id]

  return (
    <div className={`cs-card ${animClass}`}>
      {panel
        ? <img className="cs-panel" src={panel} alt="" aria-hidden="true" draggable="false" />
        : <div className="cs-panel cs-panel--default" />}

      {art
        ? <img className="cs-character" src={art} alt={arch.name} draggable="false" />
        : <div className="cs-character-empty"><span>⚔</span></div>}

      <div className="cs-info">
        <div className="cs-role">{arch.role}</div>
        <div className="cs-name">{arch.name}</div>
        <div className="cs-sep" />
        <span className="cs-passive-name">— {arch.passiveName}</span>
        <p className="cs-passive-desc">{arch.passiveDescription}</p>
      </div>
    </div>
  )
}

export default function ClassSelectScreen({ onSelect }) {
  const [index,  setIndex]  = useState(0)
  const [fading, setFading] = useState(false)
  const busy    = useRef(false)
  const touchX  = useRef(null)
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

  const arch     = ARCHETYPES[index]
  const exitDir  = slideDir.current === 1 ? 'cs-exit-l' : 'cs-exit-r'
  const enterDir = slideDir.current === 1 ? 'cs-enter-r' : 'cs-enter-l'
  const animClass = fading ? exitDir : enterDir

  return (
    <div className="cs-screen">

      <div className="cs-header">
        <span className="cs-eyebrow">· Aethermarch ·</span>
        <h2 className="cs-title">
          <span className="cs-word" style={{ animationDelay: '0.4s' }}>Elige</span>
          {' '}
          <span className="cs-word" style={{ animationDelay: '0.75s' }}>a tu</span>
          {' '}
          <span className="cs-word" style={{ animationDelay: '1.1s' }}>Aventurero</span>
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
          <button className="cs-arrow cs-arrow--l" onClick={() => goTo(index - 1)}>‹</button>
        )}
        {index < ARCHETYPES.length - 1 && (
          <button className="cs-arrow cs-arrow--r" onClick={() => goTo(index + 1)}>›</button>
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
