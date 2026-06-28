import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ARCHETYPES } from '../data/gameData.js'

const BASE = import.meta.env.BASE_URL

const ARCHETYPE_ART = {
  heraldo: `${BASE}assets/generated/heraldo_s2014_nobg.png`,
}
const ARCHETYPE_BG = {
  heraldo: `${BASE}assets/generated/fondo_heraldo_s5501.png`,
}
const PARCHMENT = `${BASE}assets/generated/pergamino_s9102.png`

// ── Sonido sintetizado de pergamino ───────────────────────────────────────────
function playScrollSound(opening) {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (!Ctx) return
    const ctx = new Ctx()
    const dur = opening ? 0.45 : 0.30
    const sr  = ctx.sampleRate
    const buf = ctx.createBuffer(1, Math.floor(sr * dur), sr)
    const dat = buf.getChannelData(0)
    for (let i = 0; i < dat.length; i++) {
      const t = i / sr
      const env = opening
        ? Math.pow(t / dur, 0.08) * Math.pow(1 - t / dur, 1.6)
        : Math.pow(1 - t / dur, 2.2)
      dat[i] = (Math.random() * 2 - 1) * env * 0.20
    }
    const src = ctx.createBufferSource()
    src.buffer = buf
    const bpf = ctx.createBiquadFilter()
    bpf.type = 'bandpass'
    bpf.frequency.value = opening ? 2800 : 2000
    bpf.Q.value = 0.8
    const lpf = ctx.createBiquadFilter()
    lpf.type = 'lowpass'
    lpf.frequency.value = 7000
    src.connect(bpf)
    bpf.connect(lpf)
    lpf.connect(ctx.destination)
    src.start()
    setTimeout(() => { try { ctx.close() } catch {} }, 1500)
  } catch {}
}

// ── Lazo SVG ──────────────────────────────────────────────────────────────────
function RibbonBow({ color }) {
  return (
    <svg viewBox="0 0 80 46" width="76" height="44" aria-hidden="true" style={{ display: 'block' }}>
      <rect x="0" y="20" width="80" height="5.5" rx="2.75" fill={color} />
      <path d="M40 22.5 C32 15 6 4 6 16 C6 28 27 32 40 22.5 Z" fill={color} />
      <path d="M40 22.5 C48 15 74 4 74 16 C74 28 53 32 40 22.5 Z" fill={color} />
      <ellipse cx="40" cy="22.5" rx="6" ry="5.5" fill={color} />
      <line x1="37" y1="27" x2="25" y2="44" stroke={color} strokeWidth="4.5" strokeLinecap="round" />
      <line x1="43" y1="27" x2="55" y2="44" stroke={color} strokeWidth="4.5" strokeLinecap="round" />
    </svg>
  )
}

// ── ClassCard ─────────────────────────────────────────────────────────────────
function ClassCard({ arch, animClass, onSelect }) {
  const [open, setOpen]   = useState(false)
  const scrollRef   = useRef(null)
  const rolledRef   = useRef(null)
  const paperRef    = useRef(null)
  const nameRef     = useRef(null)
  const divRef      = useRef(null)
  const bodyRef     = useRef(null)
  const ctaRef      = useRef(null)
  const tlRef       = useRef(null)

  const art   = ARCHETYPE_ART[arch.id]
  const bg    = ARCHETYPE_BG[arch.id]
  const color = arch.color || '#a01e1e'

  useEffect(() => {
    if (!scrollRef.current || !paperRef.current) return
    gsap.set(scrollRef.current, { height: 84 })
    return () => { if (tlRef.current) tlRef.current.kill() }
  }, [])

  function toggle() {
    const opening = !open
    setOpen(opening)
    playScrollSound(opening)
    if (tlRef.current) tlRef.current.kill()

    const tl = gsap.timeline()
    tlRef.current = tl

    if (opening) {
      const rows = bodyRef.current?.querySelectorAll('.cs-parch-row') ?? []
      tl
        .to(rolledRef.current, {
          opacity: 0, scaleY: 0.35, duration: 0.16, ease: 'power2.in',
        })
        .to(scrollRef.current, {
          height: '55%', duration: 0.54, ease: 'power3.out',
        }, '-=0.06')
        .set(paperRef.current, { pointerEvents: 'auto' })
        .to(paperRef.current, { opacity: 1, duration: 0.08 }, '-=0.42')
        .from(nameRef.current, {
          opacity: 0, y: 10, duration: 0.26, ease: 'power2.out',
        }, '-=0.32')
        .from(divRef.current, {
          opacity: 0, scaleX: 0, duration: 0.22, ease: 'power2.out',
        }, '-=0.18')
        .from(rows, {
          opacity: 0, y: 7, stagger: 0.08, duration: 0.24, ease: 'power2.out',
        }, '-=0.14')
        .from(ctaRef.current, {
          opacity: 0, y: 6, duration: 0.20, ease: 'power2.out',
        }, '-=0.08')
    } else {
      tl
        .to(paperRef.current, { opacity: 0, duration: 0.14, ease: 'power2.in' })
        .set(paperRef.current, { pointerEvents: 'none' })
        .to(scrollRef.current, { height: 84, duration: 0.42, ease: 'power3.in' }, '-=0.06')
        .to(rolledRef.current, {
          opacity: 1, scaleY: 1, duration: 0.24, ease: 'back.out(1.7)',
        }, '-=0.16')
    }
  }

  return (
    <div className={`cs-card ${animClass}`}>
      {bg && (
        <img className="cs-bg-img" src={bg} alt="" aria-hidden="true" draggable="false" />
      )}
      {art
        ? <img className="cs-character" src={art} alt={arch.name} draggable="false" />
        : <div className="cs-character-empty"><span>⚔</span></div>}

      {/* ── SCROLL ENROLLADO ──────────────────────────── */}
      <div
        className="cs-scroll"
        ref={scrollRef}
        onTouchStart={e => e.stopPropagation()}
        onTouchEnd={e => e.stopPropagation()}
        onMouseDown={e => e.stopPropagation()}
        onMouseUp={e => e.stopPropagation()}
      >
        <div className="cs-cap cs-cap--top" />

        {/* Estado enrollado (lazo visible) */}
        <div
          className="cs-scroll-rolled"
          ref={rolledRef}
          onClick={toggle}
          style={{ backgroundImage: `url(${PARCHMENT})` }}
        >
          <RibbonBow color={color} />
        </div>

        {/* Estado desplegado (pergamino con contenido) */}
        <div
          className="cs-scroll-paper"
          ref={paperRef}
          style={{
            backgroundImage: `url(${PARCHMENT})`,
            opacity: 0,
            pointerEvents: 'none',
          }}
        >
          <div className="cs-scroll-handle" onClick={toggle}>
            <div className="cs-scroll-drag-bar" style={{ background: color }} />
          </div>

          <div className="cs-scroll-body" ref={bodyRef}>
            <h2 className="cs-scroll-name" ref={nameRef} style={{ color }}>
              {arch.name}
            </h2>

            <div className="cs-scroll-divider" ref={divRef}>
              <div className="cs-scroll-gem" style={{ background: color }} />
            </div>

            <div className="cs-parch-row cs-passive-row">
              <span className="cs-passive-name">— {arch.passiveName} —</span>
              <p className="cs-passive-desc">{arch.passiveDescription}</p>
            </div>

            {arch.abilities?.map(ab => (
              <div key={ab.id} className="cs-parch-row cs-ability-row">
                <span
                  className="cs-ability-tag"
                  style={{ color, borderColor: `${color}66`, background: `${color}12` }}
                >
                  {ab.tag}
                </span>
                <div className="cs-ability-body">
                  <span className="cs-ability-name" style={{ color }}>{ab.name}</span>
                  <span className="cs-ability-desc">{ab.description}</span>
                </div>
              </div>
            ))}

            {arch.hpBonus > 0 && (
              <div className="cs-parch-row cs-stat-row">
                <span className="cs-stat-badge" style={{ color }}>
                  &#9829; +{arch.hpBonus} vitalidad
                </span>
              </div>
            )}

            <button
              ref={ctaRef}
              className="cs-scroll-cta"
              style={{ color, borderColor: color }}
              onClick={e => { e.stopPropagation(); onSelect(arch.id) }}
            >
              Elegir — {arch.name}
            </button>
          </div>
        </div>

        <div className="cs-cap cs-cap--bottom" />
      </div>
    </div>
  )
}

// ── ClassSelectScreen ─────────────────────────────────────────────────────────
export default function ClassSelectScreen({ onSelect }) {
  const [index, setIndex]   = useState(0)
  const [fading, setFading] = useState(false)
  const busy      = useRef(false)
  const touchX    = useRef(null)
  const slideDir  = useRef(1)

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
        <ClassCard arch={arch} animClass={animClass} onSelect={onSelect} />

        {index > 0 && (
          <button className="cs-arrow cs-arrow--l" onClick={() => goTo(index - 1)}>&#8249;</button>
        )}
        {index < ARCHETYPES.length - 1 && (
          <button className="cs-arrow cs-arrow--r" onClick={() => goTo(index + 1)}>&#8250;</button>
        )}

        <div
          className="cs-dots"
          onTouchStart={e => e.stopPropagation()}
          onMouseDown={e => e.stopPropagation()}
        >
          {ARCHETYPES.map((a, i) => (
            <button
              key={a.id}
              className={`cs-dot${i === index ? ' cs-dot--active' : ''}`}
              onClick={() => goTo(i)}
              aria-label={a.name}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
