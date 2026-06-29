import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import Lottie from 'lottie-react'
import { ARCHETYPES } from '../data/gameData.js'
import { SEAL_ANIM } from '../anim/sealAnim.js'

const BASE = import.meta.env.BASE_URL

const ARCHETYPE_ART = {
  heraldo: `${BASE}assets/generated/heraldo_s2014_nobg.png`,
}
const ARCHETYPE_BG = {
  heraldo: `${BASE}assets/generated/fondo_heraldo_s5501.png`,
}
const PARCHMENT = `${BASE}assets/generated/parch_anime_s8103.png`

// ── Definiciones de clase — sistema extensible ────────────────────────────────
// Cada clase futura añade su entrada aquí con sus colores y emblema.
const CLASS_DEFS = {
  heraldo: {
    primaryColor:   '#B63A2E',
    sealColor:      '#8E211A',
    secondaryColor: '#D46A2D',
    accentColor:    '#B8944A',
    emblem:         'herald_lantern',
  },
  guardian: {
    primaryColor:   '#3a6e96',
    sealColor:      '#1e4a6e',
    secondaryColor: '#5a8eb6',
    accentColor:    '#B8944A',
    emblem:         'default',
  },
  runario: {
    primaryColor:   '#6a3a9a',
    sealColor:      '#3d1a6e',
    secondaryColor: '#8a5aba',
    accentColor:    '#B8944A',
    emblem:         'default',
  },
  rastreador: {
    primaryColor:   '#2d7048',
    sealColor:      '#1a4a2e',
    secondaryColor: '#4a9068',
    accentColor:    '#B8944A',
    emblem:         'default',
  },
}

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
        : Math.pow(1 - t / dur, 2.5)
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
    src.connect(bpf); bpf.connect(lpf); lpf.connect(ctx.destination)
    src.start()
    setTimeout(() => { try { ctx.close() } catch {} }, 1500)
  } catch {}
}

// ── Emblema SVG por clase ─────────────────────────────────────────────────────
// Diseño vectorial propio — no necesita ComfyUI.
// Añadir nuevos 'case' para futuras clases.
function ClassEmblem({ type = 'default', color = '#B8944A', size = 34 }) {
  if (type === 'herald_lantern') {
    return (
      <svg
        viewBox="0 0 40 54"
        width={size}
        height={size * 54 / 40}
        fill="none"
        aria-hidden="true"
        style={{ display: 'block' }}
      >
        {/* Punta de lanza / estandarte */}
        <path
          d="M20 1 L26.5 11 L20 9 L13.5 11 Z"
          fill={color}
          stroke="rgba(0,0,0,0.35)"
          strokeWidth="0.8"
        />
        {/* Barra transversal */}
        <rect x="8" y="11" width="24" height="2.5" rx="1.25"
          fill={color} stroke="rgba(0,0,0,0.25)" strokeWidth="0.6" />

        {/* Ala izquierda — llama lateral */}
        <path d="M9 12.5 C3 14 1 21 5 24" stroke={color} strokeWidth="1.8"
          strokeLinecap="round" fill="none" opacity="0.9" />
        {/* Ala derecha — llama lateral */}
        <path d="M31 12.5 C37 14 39 21 35 24" stroke={color} strokeWidth="1.8"
          strokeLinecap="round" fill="none" opacity="0.9" />

        {/* Cuerpo del farol — exterior */}
        <rect x="13" y="13.5" width="14" height="24" rx="2.5"
          fill={color} opacity="0.18"
          stroke={color} strokeWidth="1.4" />

        {/* Panes del farol — cruceta interior */}
        <line x1="20" y1="13.5" x2="20" y2="37.5"
          stroke={color} strokeWidth="0.9" opacity="0.55" />
        <line x1="13" y1="25.5" x2="27" y2="25.5"
          stroke={color} strokeWidth="0.9" opacity="0.55" />

        {/* Llama interior */}
        <path
          d="M20 34 C16.5 31 16.5 26.5 20 21 C23.5 26.5 23.5 31 20 34 Z"
          fill={color} opacity="0.95"
        />
        {/* Punto de brillo en la llama */}
        <ellipse cx="18.5" cy="24.5" rx="1.8" ry="2.8"
          fill="rgba(255,230,160,0.45)" transform="rotate(-10 18.5 24.5)" />

        {/* Cadena / mango inferior */}
        <rect x="18.5" y="37.5" width="3" height="4" rx="0.8" fill={color} />
        {/* Pie del farol — horquilla */}
        <path d="M20 41.5 L16 48 M20 41.5 L24 48"
          stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        <line x1="15" y1="48" x2="25" y2="48"
          stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    )
  }
  // Emblema genérico para clases sin diseño propio todavía
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden="true" style={{ display: 'block' }}>
      <circle cx="20" cy="20" r="14" stroke={color} strokeWidth="1.6" fill="none" opacity="0.7" />
      <path d="M20 10 L23 17 L31 17 L24.5 22 L27 29 L20 24.5 L13 29 L15.5 22 L9 17 L17 17 Z"
        fill={color} opacity="0.8" />
    </svg>
  )
}

// ── Sello de cera SVG ─────────────────────────────────────────────────────────
// Forma irregular tipo "gota de cera estampada".
// El sealColor y accentColor vienen de CLASS_DEFS.
function ClassSeal({ classDef, arch, innerRef }) {
  const { sealColor, primaryColor, accentColor, emblem } = classDef
  return (
    <div
      ref={innerRef}
      className="cs-seal-wrap"
      style={{ filter: `drop-shadow(0 4px 10px rgba(0,0,0,0.65))` }}
    >
      <svg
        viewBox="0 0 80 80"
        className="cs-seal-svg"
        aria-hidden="true"
      >
        {/* Forma de cera irregular — no es un círculo perfecto */}
        <path
          d="M40 4 L50 7 L60 4 L68 12 L74 22 L75 34 L72 44 L76 54 L69 65 L59 73 L47 77 L36 76 L24 77 L14 70 L7 60 L5 48 L8 37 L4 26 L11 16 L22 8 L33 5 Z"
          fill={sealColor}
        />
        {/* Relieve central más claro */}
        <circle cx="40" cy="40" r="27" fill={primaryColor} opacity="0.55" />
        {/* Borde del sello */}
        <circle cx="40" cy="40" r="26" stroke="rgba(0,0,0,0.30)" strokeWidth="1" fill="none" />
        <circle cx="40" cy="40" r="23" stroke={accentColor} strokeWidth="0.7" fill="none" opacity="0.45" />

        {/* Emblema centrado — escalado al interior del sello */}
        <g transform="translate(14, 10) scale(0.65)">
          <ClassEmblem type={emblem} color={accentColor} size={34} />
        </g>

        {/* Brillo especular — sensación de relieve céreo */}
        <ellipse
          cx="30" cy="26" rx="9" ry="5.5"
          fill="rgba(255,255,255,0.13)"
          transform="rotate(-25 30 26)"
        />
      </svg>
    </div>
  )
}

// ── CharacterScrollPanel ──────────────────────────────────────────────────────
// Componente principal del pergamino. Reutilizable por clase futura.
function CharacterScrollPanel({ arch, onSelect }) {
  const [open, setOpen]           = useState(false)
  const [sealState, setSealState] = useState('idle') // 'idle' | 'opening' | 'closing'

  const scrollRef   = useRef(null)
  const rolledRef   = useRef(null)
  const paperRef    = useRef(null)
  const rollEdgeRef = useRef(null)
  const nameRef     = useRef(null)
  const divRef      = useRef(null)
  const bodyRef     = useRef(null)
  const ctaRef      = useRef(null)
  const tlRef       = useRef(null)
  const lottieRef   = useRef(null)

  const classDef = CLASS_DEFS[arch.id] || CLASS_DEFS.heraldo
  const { primaryColor, sealColor, accentColor } = classDef

  useEffect(() => {
    const s = scrollRef.current, p = paperRef.current,
          r = rolledRef.current, e = rollEdgeRef.current
    if (!s || !p || !r || !e) return
    gsap.set(s, { height: 54 })
    gsap.set(p, {
      opacity: 0, pointerEvents: 'none',
      clipPath: 'inset(100% 0% 0% 0%)',
      rotateX: 0,
      transformPerspective: 1200,
      transformOrigin: 'top center',
    })
    gsap.set(r, { opacity: 1 })
    gsap.set(e, { top: '110%', opacity: 1 })
    return () => { if (tlRef.current) tlRef.current.kill() }
  }, [])

  // Dispara la animación Lottie del sello cuando cambia el estado
  useEffect(() => {
    if (!lottieRef.current) return
    if (sealState === 'opening') lottieRef.current.playSegments([0, 40], true)
    else if (sealState === 'closing') lottieRef.current.playSegments([50, 90], true)
  }, [sealState])

  function toggle() {
    const opening = !open
    setOpen(opening)
    playScrollSound(opening)
    if (tlRef.current) tlRef.current.kill()

    const tl = gsap.timeline()
    tlRef.current = tl

    if (opening) {
      setSealState('opening')
      const rows = Array.from(bodyRef.current?.querySelectorAll('.cs-parch-row') ?? [])
      tl
        // ① OVERSHOOT: scroll se despliega con tensión
        .to(scrollRef.current, {
          height: '63%', duration: 0.32, ease: 'power4.out',
        }, 0.18)
        .to(scrollRef.current, {
          height: '57%', duration: 0.26, ease: 'power2.inOut',
        }, 0.50)

        // ④ Estado enrollado se disuelve
        .to(rolledRef.current, {
          opacity: 0, duration: 0.12, ease: 'power2.in',
        }, 0.22)

        // ⑤ Papel emerge con clipPath + perspectiva 3D
        .set(paperRef.current, {
          clipPath: 'inset(100% 0% 0% 0%)',
          rotateX: -18,
          opacity: 1, pointerEvents: 'auto',
        }, 0.26)
        .to(paperRef.current, {
          clipPath: 'inset(0% 0% 0% 0%)',
          rotateX: 3,
          duration: 0.52, ease: 'power3.out',
        }, 0.26)
        .to(paperRef.current, {
          rotateX: 0,
          duration: 0.20, ease: 'power2.inOut',
        }, 0.78)

        // ⑥ Borde de enrollamiento sube y se esfuma
        .to(rollEdgeRef.current, {
          top: 0, duration: 0.54, ease: 'power3.out',
        }, 0.26)
        .to(rollEdgeRef.current, {
          opacity: 0, duration: 0.22, ease: 'power2.in',
        }, 0.66)

        // ⑦ Contenido en cascada
        .fromTo(nameRef.current,
          { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.24, ease: 'power2.out' },
          0.60)
        .fromTo(divRef.current,
          { opacity: 0, scaleX: 0 }, { opacity: 1, scaleX: 1, duration: 0.18, ease: 'power2.out' },
          0.74)
        .fromTo(rows,
          { opacity: 0, y: 7 }, { opacity: 1, y: 0, stagger: 0.06, duration: 0.22, ease: 'power2.out' },
          0.80)
        .fromTo(ctaRef.current,
          { opacity: 0, y: 5 }, { opacity: 1, y: 0, duration: 0.20, ease: 'power2.out' },
          '-=0.04')

    } else {
      setSealState('closing')
      const rows = Array.from(bodyRef.current?.querySelectorAll('.cs-parch-row') ?? [])
      tl
        // ① Contenido desaparece
        .to([nameRef.current, divRef.current, ...rows, ctaRef.current], {
          opacity: 0, duration: 0.08, ease: 'power2.in',
        })

        // ② Papel resiste brevemente
        .to(paperRef.current, {
          rotateX: 4, duration: 0.08, ease: 'power1.inOut',
        }, 0.06)

        // ③ Borde de enrollamiento baja
        .set(rollEdgeRef.current, { top: 0, opacity: 1 }, 0.12)
        .to(rollEdgeRef.current, {
          top: '110%', duration: 0.28, ease: 'power3.in',
        }, 0.12)

        // ④ Papel se enrolla hacia arriba
        .to(paperRef.current, {
          clipPath: 'inset(0% 0% 100% 0%)',
          rotateX: -14,
          duration: 0.32, ease: 'power3.in',
        }, 0.14)
        .set(paperRef.current, { pointerEvents: 'none', opacity: 0 }, 0.44)

        // ⑤ UNDERSHOOT + SNAP
        .to(scrollRef.current, {
          height: 42, duration: 0.26, ease: 'power4.in',
        }, 0.14)
        .to(scrollRef.current, {
          height: 54, duration: 0.18, ease: 'power2.out',
        }, 0.40)

        // ⑥ Estado enrollado reaparece
        .set(rolledRef.current, { opacity: 0 }, 0.10)
        .to(rolledRef.current, { opacity: 1, duration: 0.12 }, 0.34)

    }
  }

  return (
    <div
      className="cs-scroll"
      ref={scrollRef}
      onTouchStart={e => e.stopPropagation()}
      onTouchEnd={e => e.stopPropagation()}
      onMouseDown={e => e.stopPropagation()}
      onMouseUp={e => e.stopPropagation()}
    >
      {/* ── Estado cerrado: pergamino enrollado + sello ── */}
      <div
        className="cs-scroll-rolled"
        ref={rolledRef}
        onClick={toggle}
        style={{ backgroundImage: `url(${PARCHMENT})` }}
      >
        {/* Extremos enrollados — simulan los bordes del cilindro */}
        <div className="cs-scroll-end cs-scroll-end--left" />
        <div className="cs-scroll-end cs-scroll-end--right" />

        {/* Sello de cera: SVG estático en reposo, Lottie al animar */}
        <div
          className="cs-seal-wrap"
          style={{
            filter: sealState === 'idle' ? 'drop-shadow(0 4px 10px rgba(0,0,0,0.65))' : 'none',
            animation: sealState !== 'idle' ? 'none' : undefined,
          }}
        >
          {/* SVG estático — visible solo en reposo */}
          <svg
            viewBox="0 0 80 80"
            className="cs-seal-svg"
            aria-hidden="true"
            style={{ display: sealState === 'idle' ? 'block' : 'none' }}
          >
            <path d="M40 4 L50 7 L60 4 L68 12 L74 22 L75 34 L72 44 L76 54 L69 65 L59 73 L47 77 L36 76 L24 77 L14 70 L7 60 L5 48 L8 37 L4 26 L11 16 L22 8 L33 5 Z" fill={sealColor}/>
            <circle cx="40" cy="40" r="27" fill={primaryColor} opacity="0.55"/>
            <circle cx="40" cy="40" r="26" stroke="rgba(0,0,0,0.30)" strokeWidth="1" fill="none"/>
            <circle cx="40" cy="40" r="23" stroke={accentColor} strokeWidth="0.7" fill="none" opacity="0.45"/>
            <g transform="translate(14, 10) scale(0.65)">
              <ClassEmblem type={classDef.emblem} color={accentColor} size={34}/>
            </g>
            <ellipse cx="30" cy="26" rx="9" ry="5.5" fill="rgba(255,255,255,0.13)" transform="rotate(-25 30 26)"/>
          </svg>

          {/* Lottie — siempre montado, visible al animar */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            display: sealState !== 'idle' ? 'block' : 'none',
            pointerEvents: 'none',
          }}>
            <Lottie
              lottieRef={lottieRef}
              animationData={SEAL_ANIM}
              autoplay={false}
              loop={false}
              onComplete={() => setSealState('idle')}
              style={{ width: 80, height: 80 }}
            />
          </div>
        </div>
      </div>

      {/* ── Estado abierto: pergamino desplegado ── */}
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
        {/* Borde de enrollamiento */}
        <div ref={rollEdgeRef} className="cs-roll-edge" />

        {/* Borde superior — simula el borde doblado del rollo */}
        <div className="cs-scroll-top-curl" />

        {/* Asa de cierre */}
        <div className="cs-scroll-handle" onClick={toggle}>
          <div className="cs-scroll-drag-bar" style={{ background: accentColor }} />
        </div>

        <div className="cs-scroll-body" ref={bodyRef}>
          {/* Emblema pequeño de clase como cabecera decorativa */}
          <div className="cs-scroll-emblem-header">
            <ClassEmblem type={classDef.emblem} color={accentColor} size={22} />
          </div>

          <h2 className="cs-scroll-name" ref={nameRef} style={{ color: primaryColor }}>
            {arch.name}
          </h2>

          <div className="cs-scroll-divider" ref={divRef}>
            <div className="cs-scroll-gem" style={{ background: accentColor }} />
          </div>

          <div className="cs-parch-row cs-passive-row">
            <span className="cs-passive-name">— {arch.passiveName} —</span>
            <p className="cs-passive-desc">{arch.passiveDescription}</p>
          </div>

          {arch.abilities?.map(ab => (
            <div key={ab.id} className="cs-parch-row cs-ability-row">
              <span
                className="cs-ability-tag"
                style={{ color: primaryColor, borderColor: `${primaryColor}66`, background: `${primaryColor}12` }}
              >
                {ab.tag}
              </span>
              <div className="cs-ability-body">
                <span className="cs-ability-name" style={{ color: primaryColor }}>{ab.name}</span>
                <span className="cs-ability-desc">{ab.description}</span>
              </div>
            </div>
          ))}

          {arch.hpBonus > 0 && (
            <div className="cs-parch-row cs-stat-row">
              <span className="cs-stat-badge" style={{ color: accentColor }}>
                &#9829; +{arch.hpBonus} vitalidad
              </span>
            </div>
          )}

          <button
            ref={ctaRef}
            className="cs-scroll-cta"
            style={{ color: accentColor, borderColor: `${accentColor}88` }}
            onClick={e => { e.stopPropagation(); onSelect(arch.id) }}
          >
            Elegir — {arch.name}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── ClassCard ─────────────────────────────────────────────────────────────────
function ClassCard({ arch, animClass, onSelect }) {
  const art = ARCHETYPE_ART[arch.id]
  const bg  = ARCHETYPE_BG[arch.id]

  return (
    <div className={`cs-card ${animClass}`}>
      {bg && (
        <img className="cs-bg-img" src={bg} alt="" aria-hidden="true" draggable="false" />
      )}
      {art
        ? <img className="cs-character" src={art} alt={arch.name} draggable="false" />
        : <div className="cs-character-empty"><span>⚔</span></div>}

      <CharacterScrollPanel arch={arch} onSelect={onSelect} />
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
