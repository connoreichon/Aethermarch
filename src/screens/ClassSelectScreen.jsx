import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ARCHETYPES } from '../data/gameData.js'
// Rive instalado: úsalo así cuando tengas un .riv:
//   import { useRive } from '@rive-app/react-canvas'

const BASE = import.meta.env.BASE_URL

const ARCHETYPE_ART = {
  heraldo: `${BASE}assets/generated/heraldo_s2014_nobg.png`,
}
const ARCHETYPE_BG = {
  heraldo: `${BASE}assets/generated/fondo_heraldo_s5501.png`,
}
const PARCHMENT = `${BASE}assets/generated/parch_anime_s8103.png`

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

// ── Lazo SVG ilustración 2D anime ────────────────────────────────────────────
// Cel-shading: fill plano + highlight blanco semitransparente + sombra oscura.
// El color viene del personaje. Pintado como arte de game UI JRPG.
function RibbonBow({ color }) {
  const hi  = 'rgba(255,255,255,0.30)'  // highlight (luz)
  const sh  = 'rgba(0,0,0,0.20)'        // shadow (sombra inferior)
  const ink = 'rgba(20,6,0,0.55)'       // contorno tipo tinta

  return (
    <svg
      viewBox="0 0 200 88"
      aria-hidden="true"
      style={{
        display: 'block',
        width: '90%',
        maxWidth: 240,
        filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.55))',
      }}
    >
      {/* ── Colas del lazo (detrás de todo) ──────────── */}
      {/* contorno */}
      <line x1="93" y1="51" x2="69" y2="87" stroke={ink}   strokeWidth="13" strokeLinecap="round"/>
      <line x1="107" y1="51" x2="131" y2="87" stroke={ink} strokeWidth="13" strokeLinecap="round"/>
      {/* color */}
      <line x1="93" y1="51" x2="69" y2="87" stroke={color}   strokeWidth="10" strokeLinecap="round"/>
      <line x1="107" y1="51" x2="131" y2="87" stroke={color} strokeWidth="10" strokeLinecap="round"/>
      {/* highlight cola */}
      <line x1="91" y1="51" x2="67" y2="87" stroke={hi}   strokeWidth="3" strokeLinecap="round"/>
      <line x1="109" y1="51" x2="133" y2="87" stroke={hi} strokeWidth="3" strokeLinecap="round"/>

      {/* ── Banda horizontal ──────────────────────────── */}
      <rect x="0" y="37" width="200" height="13" rx="6.5"
        fill={color} stroke={ink} strokeWidth="1.6"
        style={{ paintOrder: 'stroke fill' }}
      />
      {/* highlight banda */}
      <rect x="5" y="37" width="190" height="4.5" rx="2.25" fill={hi}/>
      {/* sombra inferior banda */}
      <rect x="5" y="46" width="190" height="3.5" rx="1.75" fill={sh}/>

      {/* ── Lazo izquierdo (forma almendra) ──────────── */}
      <path
        d="M 97 44 C 82 27, 7 11, 7 39 C 7 60, 79 62, 97 48 Z"
        fill={color} stroke={ink} strokeWidth="1.6"
        style={{ paintOrder: 'stroke fill' }}
      />
      {/* highlight superior izquierdo */}
      <path
        d="M 97 44 C 84 29, 24 15, 16 36 C 23 25, 83 23, 97 40 Z"
        fill={hi}
      />
      {/* sombra inferior izquierdo */}
      <path
        d="M 7 39 C 7 60, 79 62, 97 48 C 79 57, 9 55, 7 39 Z"
        fill={sh}
      />

      {/* ── Lazo derecho (espejo) ─────────────────────── */}
      <path
        d="M 103 44 C 118 27, 193 11, 193 39 C 193 60, 121 62, 103 48 Z"
        fill={color} stroke={ink} strokeWidth="1.6"
        style={{ paintOrder: 'stroke fill' }}
      />
      {/* highlight superior derecho */}
      <path
        d="M 103 44 C 116 29, 176 15, 184 36 C 177 25, 117 23, 103 40 Z"
        fill={hi}
      />
      {/* sombra inferior derecho */}
      <path
        d="M 193 39 C 193 60, 121 62, 103 48 C 121 57, 191 55, 193 39 Z"
        fill={sh}
      />

      {/* ── Nudo central ──────────────────────────────── */}
      <ellipse cx="100" cy="45" rx="12" ry="10"
        fill={color} stroke={ink} strokeWidth="1.6"
        style={{ paintOrder: 'stroke fill' }}
      />
      {/* líneas de pliegue en el nudo (look de tela recogida) */}
      <line x1="92" y1="40" x2="108" y2="40" stroke={ink} strokeWidth="0.8" opacity="0.4"/>
      <line x1="90" y1="45" x2="110" y2="45" stroke={ink} strokeWidth="0.8" opacity="0.4"/>
      <line x1="92" y1="50" x2="108" y2="50" stroke={ink} strokeWidth="0.8" opacity="0.4"/>
      {/* highlight nudo */}
      <ellipse cx="98" cy="41" rx="7" ry="4.5" fill={hi}/>
    </svg>
  )
}

// ── ClassCard ─────────────────────────────────────────────────────────────────
function ClassCard({ arch, animClass, onSelect }) {
  const [open, setOpen] = useState(false)

  const scrollRef   = useRef(null)
  const rolledRef   = useRef(null)
  const ribbonRef   = useRef(null)
  const paperRef    = useRef(null)
  const rollEdgeRef = useRef(null)  // borde de enrollamiento que sube al abrir
  const nameRef     = useRef(null)
  const divRef      = useRef(null)
  const bodyRef     = useRef(null)
  const ctaRef      = useRef(null)
  const tlRef       = useRef(null)

  const art   = ARCHETYPE_ART[arch.id]
  const bg    = ARCHETYPE_BG[arch.id]
  const color = arch.color || '#a01e1e'

  useEffect(() => {
    const s = scrollRef.current, p = paperRef.current,
          r = rolledRef.current, b = ribbonRef.current, e = rollEdgeRef.current
    if (!s || !p || !r || !b || !e) return
    gsap.set(s, { height: 84 })
    gsap.set(p, {
      opacity: 0, pointerEvents: 'none',
      clipPath: 'inset(100% 0% 0% 0%)',
      rotateX: 0,
      transformPerspective: 1000,
      transformOrigin: 'top center',
    })
    gsap.set(r, { opacity: 1 })
    gsap.set(b, { y: 0, x: 0, rotation: 0, scale: 1, opacity: 1 })
    gsap.set(e, { top: '110%', opacity: 1 })
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
        // ① Lazo se desata: sale disparado con giro y deriva lateral
        .to(ribbonRef.current, {
          y: -52, x: 20, rotation: 32, scale: 0.30, opacity: 0,
          duration: 0.26, ease: 'power2.in',
        })

        // ② OVERSHOOT: scroll se abre de golpe más allá del objetivo (tensión liberada)
        .to(scrollRef.current, {
          height: '62%', duration: 0.30, ease: 'power4.out',
        }, 0.08)
        // Settle: vuelve suavemente al tamaño correcto
        .to(scrollRef.current, {
          height: '55%', duration: 0.28, ease: 'power2.inOut',
        }, 0.38)

        // ③ Estado enrollado se disuelve
        .to(rolledRef.current, {
          opacity: 0, duration: 0.14, ease: 'power2.in',
        }, 0.16)

        // ④ Papel emerge con clipPath + perspectiva 3D + overshoot rotación
        .set(paperRef.current, {
          clipPath: 'inset(100% 0% 0% 0%)',
          rotateX: -20,
          opacity: 1, pointerEvents: 'auto',
        }, 0.22)
        .to(paperRef.current, {
          clipPath: 'inset(0% 0% 0% 0%)',
          rotateX: 4,          // overshoot: papel se "vence" levemente
          duration: 0.50, ease: 'power3.out',
        }, 0.22)
        // Corrección del overshoot — papel se aplana
        .to(paperRef.current, {
          rotateX: 0,
          duration: 0.22, ease: 'power2.inOut',
        }, 0.72)

        // ⑤ Borde de enrollamiento sube de abajo hasta arriba, luego se esfuma
        .to(rollEdgeRef.current, {
          top: 0, duration: 0.52, ease: 'power3.out',
        }, 0.22)
        .to(rollEdgeRef.current, {
          opacity: 0, duration: 0.24, ease: 'power2.in',
        }, 0.62)

        // ⑥ Contenido en cascada
        .fromTo(nameRef.current,
          { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.26, ease: 'power2.out' },
          0.56)
        .fromTo(divRef.current,
          { opacity: 0, scaleX: 0 }, { opacity: 1, scaleX: 1, duration: 0.20, ease: 'power2.out' },
          0.70)
        .fromTo(rows,
          { opacity: 0, y: 8 }, { opacity: 1, y: 0, stagger: 0.065, duration: 0.24, ease: 'power2.out' },
          0.78)
        .fromTo(ctaRef.current,
          { opacity: 0, y: 5 }, { opacity: 1, y: 0, duration: 0.20, ease: 'power2.out' },
          '-=0.05')

    } else {
      const rows = Array.from(bodyRef.current?.querySelectorAll('.cs-parch-row') ?? [])
      tl
        // ① Contenido desaparece
        .to([nameRef.current, divRef.current, ...rows, ctaRef.current], {
          opacity: 0, duration: 0.10, ease: 'power2.in',
        })

        // ② Papel "se resiste" brevemente antes de enrollarse
        .to(paperRef.current, {
          rotateX: 5, duration: 0.08, ease: 'power1.inOut',
        }, 0.06)

        // ③ Borde de enrollamiento aparece arriba y baja (papel volviendo al rollo)
        .set(rollEdgeRef.current, { top: 0, opacity: 1 }, 0.12)
        .to(rollEdgeRef.current, {
          top: '110%', duration: 0.30, ease: 'power3.in',
        }, 0.12)

        // ④ Papel se enrolla hacia arriba (clip desde abajo)
        .to(paperRef.current, {
          clipPath: 'inset(0% 0% 100% 0%)',
          rotateX: -16,
          duration: 0.34, ease: 'power3.in',
        }, 0.14)
        .set(paperRef.current, { pointerEvents: 'none', opacity: 0 }, 0.46)

        // ⑤ UNDERSHOOT + SNAP: container se cierra con energía, rebota levemente
        .to(scrollRef.current, {
          height: 74, duration: 0.28, ease: 'power4.in',
        }, 0.14)
        .to(scrollRef.current, {
          height: 84, duration: 0.18, ease: 'power2.out',
        }, 0.42)

        // ⑥ Estado enrollado reaparece
        .set(rolledRef.current, { opacity: 0 }, 0.10)
        .to(rolledRef.current, { opacity: 1, duration: 0.14 }, 0.36)

        // ⑦ Lazo vuelve de golpe con muelle potente
        .fromTo(ribbonRef.current,
          { y: -52, x: 20, rotation: -24, scale: 0.30, opacity: 0 },
          { y: 0, x: 0, rotation: 0, scale: 1, opacity: 1, duration: 0.44, ease: 'back.out(4)' },
          0.34)
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

      {/* ── SCROLL ───────────────────────────────── */}
      <div
        className="cs-scroll"
        ref={scrollRef}
        onTouchStart={e => e.stopPropagation()}
        onTouchEnd={e => e.stopPropagation()}
        onMouseDown={e => e.stopPropagation()}
        onMouseUp={e => e.stopPropagation()}
      >
        {/* Estado enrollado: pergamino + lazo SVG */}
        <div
          className="cs-scroll-rolled"
          ref={rolledRef}
          onClick={toggle}
          style={{ backgroundImage: `url(${PARCHMENT})` }}
        >
          <div ref={ribbonRef} className="cs-ribbon-wrap">
            <RibbonBow color={color} />
          </div>
        </div>

        {/* Estado desplegado */}
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
          {/* Borde de enrollamiento — sube al abrir, baja al cerrar */}
          <div ref={rollEdgeRef} className="cs-roll-edge" />

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
