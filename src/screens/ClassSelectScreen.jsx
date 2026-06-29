import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ARCHETYPES } from '../data/gameData.js'

const BASE = import.meta.env.BASE_URL

const ARCHETYPE_ART = {
  heraldo: `${BASE}assets/generated/heraldo_redux_hq_s2010.png`,
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
// Ruido rosa (algoritmo Paul Kellet) + EQ de papel. Mucho más natural que ruido blanco.
// Para producción: usar un .mp3 real de Freesound.org o Pixabay.com/sound-effects
function playScrollSound(opening) {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (!Ctx) return
    const ctx = new Ctx()
    const dur = opening ? 0.90 : 0.60
    const sr  = ctx.sampleRate
    const len = Math.floor(sr * dur)
    const buf = ctx.createBuffer(1, len, sr)
    const dat = buf.getChannelData(0)
    let b0=0, b1=0, b2=0, b3=0, b4=0, b5=0, b6=0
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1
      b0 = 0.99886*b0 + w*0.0555179; b1 = 0.99332*b1 + w*0.0750759
      b2 = 0.96900*b2 + w*0.1538520; b3 = 0.86650*b3 + w*0.3104856
      b4 = 0.55000*b4 + w*0.5329522; b5 = -0.7616*b5 - w*0.0168980
      const pink = (b0+b1+b2+b3+b4+b5+b6+w*0.5362) / 7
      b6 = w * 0.115926
      const t = i / len
      const env = opening
        ? Math.pow(Math.sin(t * Math.PI), 0.5) * (1 - t * 0.25)
        : (1 - t) * (1 - t) * (1 + 0.35 * Math.sin(t * Math.PI * 5))
      dat[i] = pink * env * 0.32
    }
    const src = ctx.createBufferSource()
    src.buffer = buf
    const hpf = ctx.createBiquadFilter()
    hpf.type = 'highpass'; hpf.frequency.value = 180
    const pk1 = ctx.createBiquadFilter()
    pk1.type = 'peaking'; pk1.frequency.value = 700; pk1.Q.value = 0.6; pk1.gain.value = 5
    const pk2 = ctx.createBiquadFilter()
    pk2.type = 'peaking'; pk2.frequency.value = 2200; pk2.Q.value = 0.8; pk2.gain.value = 3
    const lpf = ctx.createBiquadFilter()
    lpf.type = 'lowpass'; lpf.frequency.value = 6500
    src.connect(hpf); hpf.connect(pk1); pk1.connect(pk2); pk2.connect(lpf)
    lpf.connect(ctx.destination)
    src.start()
    setTimeout(() => { try { ctx.close() } catch {} }, 2000)
  } catch {}
}

// ── Emblema SVG por clase ─────────────────────────────────────────────────────
// Diseño vectorial propio — no necesita ComfyUI.
// Añadir nuevos 'case' para futuras clases.
function ClassEmblem({ type = 'default', color = '#B8944A', size = 34 }) {
  if (type === 'herald_lantern') {
    return (
      <svg
        viewBox="0 0 40 60"
        width={size}
        height={size * 60 / 40}
        fill="none"
        aria-hidden="true"
        style={{ display: 'block' }}
      >
        {/* Cimera de lanza — punta con base escalonada */}
        <polygon points="20,0 24,8 20,6 16,8"
          fill={color} stroke="rgba(0,0,0,0.30)" strokeWidth="0.6" />
        <line x1="20" y1="6" x2="20" y2="11"
          stroke={color} strokeWidth="2.2" strokeLinecap="round" />

        {/* Travesaño con remates en bola */}
        <rect x="5.5" y="10" width="29" height="3" rx="1.5"
          fill={color} stroke="rgba(0,0,0,0.18)" strokeWidth="0.5" />
        <circle cx="5.5"  cy="11.5" r="2.6" fill={color} />
        <circle cx="34.5" cy="11.5" r="2.6" fill={color} />
        <circle cx="5.5"  cy="11.5" r="1.5" fill="rgba(255,255,255,0.14)" />
        <circle cx="34.5" cy="11.5" r="1.5" fill="rgba(255,255,255,0.14)" />

        {/* Ala izquierda — doble arco heráldico */}
        <path d="M8.5 13 C1.5 15.5 -0.5 25 5 31"
          stroke={color} strokeWidth="1.9" strokeLinecap="round" />
        <path d="M10.5 15.5 C5.5 17.5 4 25 8 30"
          stroke={color} strokeWidth="0.9" strokeLinecap="round" opacity="0.50" />

        {/* Ala derecha — doble arco heráldico */}
        <path d="M31.5 13 C38.5 15.5 40.5 25 35 31"
          stroke={color} strokeWidth="1.9" strokeLinecap="round" />
        <path d="M29.5 15.5 C34.5 17.5 36 25 32 30"
          stroke={color} strokeWidth="0.9" strokeLinecap="round" opacity="0.50" />

        {/* Marco del farol */}
        <rect x="12" y="13" width="16" height="28" rx="2"
          fill={color} fillOpacity="0.10" stroke={color} strokeWidth="1.6" />
        {/* Montura de esquinas */}
        <circle cx="12" cy="13" r="1.5" fill={color} />
        <circle cx="28" cy="13" r="1.5" fill={color} />
        <circle cx="12" cy="41" r="1.5" fill={color} />
        <circle cx="28" cy="41" r="1.5" fill={color} />

        {/* Cruceta interior */}
        <line x1="20" y1="13" x2="20" y2="41"
          stroke={color} strokeWidth="0.8" opacity="0.45" />
        <line x1="12" y1="27" x2="28" y2="27"
          stroke={color} strokeWidth="0.8" opacity="0.45" />

        {/* Llama — gota orgánica que trepa hacia arriba */}
        <path d="M20 40 C15.5 36 14 29 17.5 21 C18.5 18 19.2 16.5 20 14.5 C20.8 16.5 21.5 18 22.5 21 C26 29 24.5 36 20 40 Z"
          fill={color} opacity="0.95" />
        {/* Reflex especular en la llama */}
        <ellipse cx="17.8" cy="24" rx="1.8" ry="3"
          fill="rgba(255,240,150,0.50)" transform="rotate(-15 17.8 24)" />

        {/* Mango inferior */}
        <rect x="18.5" y="41" width="3" height="5" rx="1" fill={color} />

        {/* Trípode heráldico */}
        <line x1="20" y1="46" x2="13" y2="55"
          stroke={color} strokeWidth="1.7" strokeLinecap="round" />
        <line x1="20" y1="46" x2="27" y2="55"
          stroke={color} strokeWidth="1.7" strokeLinecap="round" />
        <line x1="11" y1="55" x2="29" y2="55"
          stroke={color} strokeWidth="1.7" strokeLinecap="round" />
        <circle cx="11" cy="55" r="2.3" fill={color} />
        <circle cx="29" cy="55" r="2.3" fill={color} />
        <circle cx="20" cy="46" r="1.4" fill={color} opacity="0.65" />
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

// ── Ornamento divisor de pergamino ───────────────────────────────────────────
function ScrollOrnament({ color = 'rgba(90, 54, 12, 0.30)' }) {
  return (
    <svg viewBox="0 0 200 16" width="100%" height="12"
      aria-hidden="true" preserveAspectRatio="xMidYMid meet"
      style={{ display: 'block', margin: '4px 0' }}>
      <line x1="0"   y1="8" x2="78"  y2="8" stroke={color} strokeWidth="0.8" />
      <line x1="122" y1="8" x2="200" y2="8" stroke={color} strokeWidth="0.8" />
      <circle cx="82"  cy="8" r="1.5" fill={color} opacity="0.65" />
      <circle cx="118" cy="8" r="1.5" fill={color} opacity="0.65" />
      <path d="M88 8 L94 3 L100 8 L94 13 Z" fill={color} />
      <path d="M100 8 L106 3 L112 8 L106 13 Z" fill={color} fillOpacity="0.42" />
    </svg>
  )
}

// ── CharacterScrollPanel ──────────────────────────────────────────────────────
// Componente principal del pergamino. Reutilizable por clase futura.
function CharacterScrollPanel({ arch, onSelect }) {
  const [open, setOpen] = useState(false)

  const scrollRef   = useRef(null)
  const rolledRef   = useRef(null)
  const sealRef     = useRef(null)
  const paperRef    = useRef(null)
  const rollEdgeRef   = useRef(null)
  const shadowBandRef = useRef(null)
  const nameRef       = useRef(null)
  const divRef      = useRef(null)
  const bodyRef     = useRef(null)
  const ctaRef      = useRef(null)
  const tlRef       = useRef(null)

  const classDef = CLASS_DEFS[arch.id] || CLASS_DEFS.heraldo
  const { primaryColor, sealColor, accentColor } = classDef

  useEffect(() => {
    const s = scrollRef.current, p = paperRef.current,
          r = rolledRef.current, seal = sealRef.current,
          e = rollEdgeRef.current, sb = shadowBandRef.current
    if (!s || !p || !r || !seal || !e || !sb) return
    gsap.set(s, { height: 70 })
    gsap.set(p, {
      opacity: 0, pointerEvents: 'none',
      scaleY: 0.01, transformOrigin: 'top center',
    })
    gsap.set(r, { opacity: 1 })
    gsap.set(seal, { y: 0, scale: 1, opacity: 1, rotation: 0 })
    gsap.set(e, { top: 75, opacity: 0 })
    gsap.set(sb, { y: -100, opacity: 0 })
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
        // ① Sello: vibración → destello → fragmentación
        .to(sealRef.current, {
          keyframes: [
            { scale: 1.12, rotation:  7, duration: 0.11, ease: 'power1.out'   },
            { scale: 1.05, rotation: -6, duration: 0.08, ease: 'power1.inOut' },
            { scale: 1.16, rotation:  4, duration: 0.07, ease: 'power1.inOut' },
            { scale: 0, rotation: 22, opacity: 0, y: -18, duration: 0.22, ease: 'power3.in' },
          ],
        })

        // ② Rollo desaparece
        .to(rolledRef.current, {
          opacity: 0, duration: 0.20, ease: 'power2.in',
        }, 0.30)

        // ③ Contenedor crece
        .to(scrollRef.current, {
          height: '62%', duration: 1.10, ease: 'power3.out',
        }, 0.26)
        .to(scrollRef.current, {
          height: '57%', duration: 0.36, ease: 'power2.inOut',
        }, 1.36)

        // ④ Papel se despliega: scaleY 0 → 1 desde el borde superior (efecto rollo)
        .set(paperRef.current, {
          scaleY: 0.01, opacity: 1, pointerEvents: 'auto',
        }, 0.32)
        .to(paperRef.current, {
          scaleY: 1, duration: 0.84, ease: 'power3.out',
        }, 0.34)

        // ⑤ Banda de sombra cilíndrica barre de arriba a abajo
        .set(shadowBandRef.current, { y: -100, opacity: 0.88 }, 0.34)
        .to(shadowBandRef.current, {
          y: 620, duration: 0.80, ease: 'power2.out',
        }, 0.36)
        .to(shadowBandRef.current, {
          opacity: 0, duration: 0.22, ease: 'power1.in',
        }, 0.84)

        // ⑥ Contenido en cascada
        .fromTo(nameRef.current,
          { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.28, ease: 'power2.out' },
          0.98)
        .fromTo(divRef.current,
          { opacity: 0, scaleX: 0 }, { opacity: 1, scaleX: 1, duration: 0.22, ease: 'power2.out' },
          1.14)
        .fromTo(rows,
          { opacity: 0, y: 6 }, { opacity: 1, y: 0, stagger: 0.07, duration: 0.24, ease: 'power2.out' },
          1.20)
        .fromTo(ctaRef.current,
          { opacity: 0, y: 5 }, { opacity: 1, y: 0, duration: 0.22, ease: 'power2.out' },
          '-=0.04')

    } else {
      const rows = Array.from(bodyRef.current?.querySelectorAll('.cs-parch-row') ?? [])
      tl
        // ① Contenido desaparece
        .to([nameRef.current, divRef.current, ...rows, ctaRef.current], {
          opacity: 0, duration: 0.11, ease: 'power2.in',
        })

        // ② Papel se re-enrolla: scaleY 1 → 0 desde el borde superior
        .to(paperRef.current, {
          scaleY: 0.01, duration: 0.32, ease: 'power3.in',
        }, 0.08)
        .set(paperRef.current, { opacity: 0, pointerEvents: 'none' }, 0.40)

        // ③ Scroll se contrae con undershoot + snap
        .to(scrollRef.current, {
          height: 44, duration: 0.40, ease: 'power3.in',
        }, 0.08)
        .to(scrollRef.current, {
          height: 70, duration: 0.32, ease: 'back.out(2.8)',
        }, 0.48)

        // ④ Estado enrollado reaparece
        .set(rolledRef.current, { opacity: 0 }, 0.08)
        .to(rolledRef.current, { opacity: 1, duration: 0.20 }, 0.38)

        // ⑤ Sello aparece: caída + doble rebote (back.out → ligero squeeze)
        .fromTo(sealRef.current,
          { scale: 0, opacity: 0, rotation: -16, y: -22 },
          { scale: 1.28, opacity: 1, rotation: 0, y: 0, duration: 0.28, ease: 'back.out(5)' },
          0.50)
        .to(sealRef.current, {
          scale: 0.90, duration: 0.10, ease: 'power2.in',
        }, 0.78)
        .to(sealRef.current, {
          scale: 1, duration: 0.16, ease: 'back.out(3)',
        }, 0.88)

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

        {/* Sello de cera — GSAP controla scale/opacity/y */}
        <div ref={sealRef} className="cs-seal-wrap">
          <svg viewBox="0 0 80 80" className="cs-seal-svg" aria-hidden="true">
            {/* Blob de cera — forma irregular orgánica */}
            <path d="M40 3 L49 6 L58 3 L67 10 L74 21 L76 33 L73 44 L77 55 L70 65 L60 72 L48 77 L37 76 L25 78 L14 71 L6 61 L4 48 L7 37 L3 26 L10 15 L22 8 L32 4 Z"
              fill={sealColor} />
            {/* Borde de estampa — le da definición al blob */}
            <path d="M40 3 L49 6 L58 3 L67 10 L74 21 L76 33 L73 44 L77 55 L70 65 L60 72 L48 77 L37 76 L25 78 L14 71 L6 61 L4 48 L7 37 L3 26 L10 15 L22 8 L32 4 Z"
              fill="none" stroke="rgba(0,0,0,0.40)" strokeWidth="1.5" />
            {/* Área central elevada */}
            <circle cx="40" cy="40" r="28" fill={primaryColor} opacity="0.50" />
            {/* Anillo ornamental exterior */}
            <circle cx="40" cy="40" r="27" stroke={accentColor} strokeWidth="1.0" fill="none" opacity="0.58" />
            {/* Anillo ornamental interior */}
            <circle cx="40" cy="40" r="23" stroke={accentColor} strokeWidth="0.6" fill="none" opacity="0.38" />
            {/* Emblema centrado — nueva escala para viewBox 0 0 40 60 */}
            <g transform="translate(26, 19) scale(0.82)">
              <ClassEmblem type={classDef.emblem} color={accentColor} size={34}/>
            </g>
            {/* Brillo especular — sensación de relieve céreo */}
            <ellipse cx="28" cy="24" rx="11" ry="6.5"
              fill="rgba(255,255,255,0.14)" transform="rotate(-28 28 24)" />
            {/* Segundo reflex más sutil */}
            <ellipse cx="55" cy="53" rx="4" ry="2.5"
              fill="rgba(255,255,255,0.07)" transform="rotate(-28 55 53)" />
          </svg>
        </div>
      </div>

      {/* Banda de sombra cilíndrica — simula el interior del rollo al abrirse */}
      <div ref={shadowBandRef} className="cs-shadow-band" />

      {/* Borde de enrollamiento — fuera del paper para no heredar su opacity */}
      <div ref={rollEdgeRef} className="cs-roll-edge" />

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
          {arch.role && (
            <p className="cs-scroll-role" style={{ color: primaryColor }}>{arch.role}</p>
          )}

          <div className="cs-scroll-divider" ref={divRef}>
            <div className="cs-scroll-gem" style={{ background: accentColor }} />
          </div>

          <div className="cs-parch-row cs-passive-row">
            <span className="cs-passive-name">— {arch.passiveName} —</span>
            <p className="cs-passive-desc">{arch.passiveDescription}</p>
          </div>

          <div className="cs-parch-row cs-ornament-row">
            <ScrollOrnament />
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
            style={{ color: accentColor, borderColor: `${accentColor}60` }}
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
        ? <img className="cs-character" src={art} alt={arch.name} draggable="false"
            style={{ mixBlendMode: 'screen' }} />
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
