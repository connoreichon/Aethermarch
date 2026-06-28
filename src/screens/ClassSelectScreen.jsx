import { useState, useRef } from 'react'
import { ARCHETYPES } from '../data/gameData.js'

const BASE = import.meta.env.BASE_URL

const ARCHETYPE_ART = {
  heraldo: `${BASE}assets/generated/heraldo_s2014_nobg.png`,
}
const ARCHETYPE_BG = {
  heraldo: `${BASE}assets/generated/fondo_heraldo_s5501.png`,
}
const ARCHETYPE_PANEL = {
  heraldo: `${BASE}assets/generated/pergamino_s9102.png`,
}

function ClassCard({ arch, animClass }) {
  const [panelOpen, setPanelOpen] = useState(false)
  const handleDragY = useRef(null)
  const art   = ARCHETYPE_ART[arch.id]
  const bg    = ARCHETYPE_BG[arch.id]
  const panel = ARCHETYPE_PANEL[arch.id]

  function onHandleTouchStart(e) {
    e.stopPropagation()
    handleDragY.current = e.touches[0].clientY
  }
  function onHandleTouchEnd(e) {
    e.stopPropagation()
    if (handleDragY.current === null) return
    const dy = e.changedTouches[0].clientY - handleDragY.current
    handleDragY.current = null
    if (dy > 30) setPanelOpen(false)
    else setPanelOpen(p => !p)
  }

  return (
    <div className={`cs-card ${animClass}`}>
      {bg && (
        <img className="cs-bg-img" src={bg} alt="" aria-hidden="true" draggable="false" />
      )}
      {art
        ? <img className="cs-character" src={art} alt={arch.name} draggable="false" />
        : <div className="cs-character-empty"><span>⚔</span></div>}

      {/* Indicador visible solo cuando el panel está cerrado */}
      {!panelOpen && (
        <div className="cs-panel-trigger" onClick={() => setPanelOpen(true)}>
          <span className="cs-panel-trigger-icon">◆</span>
        </div>
      )}

      <div
        className={`cs-info${panelOpen ? ' cs-info--open' : ''}`}
        onTouchStart={e => panelOpen && e.stopPropagation()}
        onTouchEnd={e => panelOpen && e.stopPropagation()}
        onMouseDown={e => panelOpen && e.stopPropagation()}
        onMouseUp={e => panelOpen && e.stopPropagation()}
      >
        {panel && <img className="cs-parchment-bg" src={panel} alt="" aria-hidden="true" draggable="false" />}
        <div
          className="cs-info-handle"
          onClick={() => setPanelOpen(false)}
          onTouchStart={onHandleTouchStart}
          onTouchEnd={onHandleTouchEnd}
        >
          <div className="cs-info-drag-bar" />
          <span className="cs-card-name-text">{arch.name}</span>
        </div>
        <div className="cs-info-content">
          {/* Pasiva */}
          <div className="cs-passive-row">
            <span className="cs-passive-name">— {arch.passiveName} —</span>
            <p className="cs-passive-desc">{arch.passiveDescription}</p>
          </div>
          {/* Habilidades funcionales */}
          {arch.abilities?.map(ab => (
            <div key={ab.id} className="cs-ability-row">
              <span className="cs-ability-tag">{ab.tag}</span>
              <div className="cs-ability-body">
                <span className="cs-ability-name">{ab.name}</span>
                <span className="cs-ability-desc">{ab.description}</span>
              </div>
            </div>
          ))}
          {/* Stat */}
          {arch.hpBonus > 0 && (
            <div className="cs-stat-row">
              <span className="cs-stat-badge">&#9829; +{arch.hpBonus} vitalidad</span>
            </div>
          )}
        </div>
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
