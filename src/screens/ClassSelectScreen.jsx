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
const RIBBON    = `${BASE}assets/generated/scroll_ribbon_s7002.png`

// ── Sonido sintetizado de pergamino ───────────────────────────────────────────
function playScrollSound(opening) {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (!Ctx) return
    const ctx = new Ctx()
    const dur = opening ? 0.50 : 0.32
    const sr  = ctx.sampleRate
    const buf = ctx.createBuffer(1, Math.floor(sr * dur), sr)
    const dat = buf.getChannelData(0)
    for (let i = 0; i < dat.length; i++) {
      const t   = i / sr
      const env = opening
        ? Math.pow(t / dur, 0.06) * Math.pow(1 - t / dur, 1.8)
        : Math.pow(1 - t / dur, 2.5) * (1 - Math.pow(t / dur, 0.1) * 0.3)
      dat[i] = (Math.random() * 2 - 1) * env * 0.22
    }
    const src = ctx.createBufferSource()
    src.buffer = buf
    const bpf = ctx.createBiquadFilter()
    bpf.type = 'bandpass'
    bpf.frequency.value = opening ? 3200 : 1800
    bpf.Q.value = 0.6
    const lpf = ctx.createBiquadFilter()
    lpf.type = 'lowpass'
    lpf.frequency.value = 8000
    src.connect(bpf)
    bpf.connect(lpf)
    lpf.connect(ctx.destination)
    src.start()
    setTimeout(() => { try { ctx.close() } catch {} }, 1500)
  } catch {}
}

// Calcula el filtro hue-rotate para el lazo según el color del personaje.
// El lazo base es carmesí (~0° de matiz). Para otros personajes se rota.
function ribbonFilter(hexColor) {
  if (!hexColor || hexColor.length < 7) return ''
  const r = parseInt(hexColor.slice(1, 3), 16) / 255
  const g = parseInt(hexColor.slice(3, 5), 16) / 255
  const b = parseInt(hexColor.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  if (max === min) return ''
  const d = max - min
  let h = max === r ? (g - b) / d + (g < b ? 6 : 0)
         : max === g ? (b - r) / d + 2
                     : (r - g) / d + 4
  const hue = Math.round(h * 60) % 360
  if (hue < 15) return '' // ya es carmesí, sin filtro
  return `hue-rotate(${hue}deg) saturate(1.45)`
}

// ── ClassCard ─────────────────────────────────────────────────────────────────
function ClassCard({ arch, animClass, onSelect }) {
  const [open, setOpen] = useState(false)

  const scrollRef  = useRef(null)
  const rolledRef  = useRef(null)
  const ribbonRef  = useRef(null)
  const paperRef   = useRef(null)
  const nameRef    = useRef(null)
  const divRef     = useRef(null)
  const bodyRef    = useRef(null)
  const ctaRef     = useRef(null)
  const tlRef      = useRef(null)

  const art    = ARCHETYPE_ART[arch.id]
  const bg     = ARCHETYPE_BG[arch.id]
  const color  = arch.color || '#a01e1e'
  const rbFilt = ribbonFilter(color)

  // Estado inicial: todo cerrado, paper invisible con clip-path y perspectiva listos
  useEffect(() => {
    if (!scrollRef.current || !paperRef.current || !rolledRef.current || !ribbonRef.current) return
    gsap.set(scrollRef.current, { height: 84 })
    gsap.set(paperRef.current, {
      opacity: 0,
      pointerEvents: 'none',
      clipPath: 'inset(100% 0% 0% 0%)',
      rotateX: 0,
      transformPerspective: 900,
      transformOrigin: 'top center',
    })
    gsap.set(rolledRef.current, { opacity: 1 })
    gsap.set(ribbonRef.current, { y: 0, rotation: 0, scale: 1, opacity: 1 })
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
      const rows = Array.from(bodyRef.current?.querySelectorAll('.cs-parch-row') ?? [])

      tl
        // ① Lazo se desata y sale volando (0-280ms)
        .to(ribbonRef.current, {
          y: -42, rotation: 22, scale: 0.40, opacity: 0,
          duration: 0.28, ease: 'power2.in',
        })
        // ② Container empieza a expandirse (100ms)
        .to(scrollRef.current, {
          height: '55%', duration: 0.65, ease: 'expo.out',
        }, 0.10)
        // ③ Estado enrollado se disuelve (200-350ms)
        .to(rolledRef.current, {
          opacity: 0, duration: 0.15, ease: 'power2.in',
        }, 0.20)
        // ④ Papel arranca con clip-path + perspectiva 3D (280ms)
        .set(paperRef.current, {
          clipPath: 'inset(100% 0% 0% 0%)',
          rotateX: -14,
          opacity: 1,
          pointerEvents: 'auto',
        }, 0.28)
        .to(paperRef.current, {
          clipPath: 'inset(0% 0% 0% 0%)',
          rotateX: 0,
          duration: 0.60, ease: 'power3.out',
        }, 0.28)
        // ⑤ Contenido entra en cascada (530ms+)
        .fromTo(nameRef.current,
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.28, ease: 'power2.out' },
          0.54)
        .fromTo(divRef.current,
          { opacity: 0, scaleX: 0 },
          { opacity: 1, scaleX: 1, duration: 0.22, ease: 'power2.out' },
          0.70)
        .fromTo(rows,
          { opacity: 0, y: 9 },
          { opacity: 1, y: 0, stagger: 0.07, duration: 0.26, ease: 'power2.out' },
          0.80)
        .fromTo(ctaRef.current,
          { opacity: 0, y: 6 },
          { opacity: 1, y: 0, duration: 0.22, ease: 'power2.out' },
          '-=0.06')
    } else {
      const rows = Array.from(bodyRef.current?.querySelectorAll('.cs-parch-row') ?? [])

      tl
        // ① Contenido desaparece rápido
        .to([nameRef.current, divRef.current, ...rows, ctaRef.current], {
          opacity: 0, duration: 0.12, ease: 'power2.in',
        })
        // ② Papel se enrolla hacia arriba (clip desde abajo)
        .to(paperRef.current, {
          clipPath: 'inset(0% 0% 100% 0%)',
          rotateX: -12,
          duration: 0.38, ease: 'power3.in',
        }, 0.08)
        .set(paperRef.current, { pointerEvents: 'none', opacity: 0 }, 0.44)
        // ③ Container se contrae
        .to(scrollRef.current, {
          height: 84, duration: 0.44, ease: 'power3.in',
        }, 0.10)
        // ④ Estado enrollado reaparece
        .set(rolledRef.current, { opacity: 0 }, 0.08)
        .to(rolledRef.current, { opacity: 1, duration: 0.12 }, 0.38)
        // ⑤ Lazo vuelve de un golpe con muelle
        .fromTo(ribbonRef.current,
          { y: -42, rotation: -14, scale: 0.40, opacity: 0 },
          { y: 0, rotation: 0, scale: 1, opacity: 1, duration: 0.38, ease: 'back.out(3.2)' },
          0.36)
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

      {/* ── SCROLL ───────────────────────────────────────── */}
      <div
        className="cs-scroll"
        ref={scrollRef}
        onTouchStart={e => e.stopPropagation()}
        onTouchEnd={e => e.stopPropagation()}
        onMouseDown={e => e.stopPropagation()}
        onMouseUp={e => e.stopPropagation()}
      >
        {/* Estado enrollado: pergamino con lazo */}
        <div
          className="cs-scroll-rolled"
          ref={rolledRef}
          onClick={toggle}
          style={{ backgroundImage: `url(${PARCHMENT})` }}
        >
          <img
            ref={ribbonRef}
            className="cs-ribbon-img"
            src={RIBBON}
            alt=""
            aria-hidden="true"
            draggable="false"
            style={rbFilt ? { filter: rbFilt } : undefined}
          />
        </div>

        {/* Estado desplegado: pergamino con contenido */}
        <div
          className="cs-scroll-paper"
          ref={paperRef}
          style={{
            backgroundImage: `url(${PARCHMENT})`,
            '--parchment-url': `url(${PARCHMENT})`,
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
      </div>
    </div>
  )
}

// ── ClassSelectScreen ─────────────────────────────────────────────────────────
export default function ClassSelectScreen({ onSelect }) {
  const [index, setIndex]   = useState(0)
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
