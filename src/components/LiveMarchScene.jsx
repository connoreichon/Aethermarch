import { RESOURCES } from '../data/gameData.js'
import ArchetypeToken from './tokens/ArchetypeToken.jsx'
import CreatureToken  from './tokens/CreatureToken.jsx'
import ResourceNode   from './tokens/ResourceNode.jsx'

// ── SVG Biome Backdrops ───────────────────────────────────────────────────────

function ForestBackdrop() {
  return (
    <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%' }}
         viewBox="0 0 360 290" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="fs-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#030604"/><stop offset="100%" stopColor="#091009"/>
        </linearGradient>
        <linearGradient id="fs-rd" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#120F07" stopOpacity="0"/><stop offset="100%" stopColor="#1A1309"/>
        </linearGradient>
        <linearGradient id="fs-gnd" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#080F08"/><stop offset="100%" stopColor="#040904"/>
        </linearGradient>
        <linearGradient id="fs-mst" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0D1A0D" stopOpacity="0"/><stop offset="100%" stopColor="#0D1A0D" stopOpacity="0.82"/>
        </linearGradient>
      </defs>
      <rect width="360" height="290" fill="url(#fs-sky)"/>
      <ellipse cx="18"  cy="155" rx="24" ry="52" fill="#040A04"/>
      <ellipse cx="58"  cy="140" rx="20" ry="56" fill="#030903"/>
      <ellipse cx="98"  cy="150" rx="22" ry="44" fill="#050B05"/>
      <ellipse cx="143" cy="136" rx="18" ry="52" fill="#030903"/>
      <ellipse cx="216" cy="138" rx="20" ry="50" fill="#040A04"/>
      <ellipse cx="258" cy="148" rx="22" ry="44" fill="#030903"/>
      <ellipse cx="304" cy="134" rx="20" ry="56" fill="#050B05"/>
      <ellipse cx="346" cy="150" rx="18" ry="42" fill="#040A04"/>
      <rect x="0"  y="118" width="14" height="172" fill="#030703" rx="2"/>
      <rect x="22" y="144" width="9"  height="146" fill="#030703" rx="1"/>
      <rect x="40" y="160" width="6"  height="130" fill="#030803" rx="1"/>
      <rect x="346" y="114" width="14" height="176" fill="#030703" rx="2"/>
      <rect x="328" y="142" width="9"  height="148" fill="#030803" rx="1"/>
      <rect x="312" y="162" width="6"  height="128" fill="#030803" rx="1"/>
      <ellipse cx="7"   cy="108" rx="33" ry="60" fill="#020902"/>
      <ellipse cx="30"  cy="130" rx="24" ry="44" fill="#020A02"/>
      <ellipse cx="353" cy="104" rx="34" ry="64" fill="#020902"/>
      <ellipse cx="330" cy="134" rx="24" ry="46" fill="#020A02"/>
      <rect x="0" y="226" width="360" height="64" fill="url(#fs-gnd)"/>
      <path d="M132 192 L228 192 L310 290 L50 290 Z" fill="url(#fs-rd)"/>
      <path d="M132 192 L228 192 L310 290 L50 290 Z" fill="#14100A" fillOpacity="0.5"/>
      <rect x="174" y="218" width="12" height="1.5" fill="#1C1609" rx="1"/>
      <rect x="163" y="244" width="34" height="1.5" fill="#1C1609" rx="1"/>
      <rect x="148" y="272" width="64" height="1.5" fill="#1C1609" rx="1"/>
      <rect x="264" y="206" width="9" height="22" fill="#0C1510" rx="1"/>
      <rect x="264" y="210" width="9" height="2"  fill="#3FA34D" fillOpacity="0.38"/>
      <rect x="264" y="214" width="9" height="1"  fill="#3FA34D" fillOpacity="0.2"/>
      <path d="M42 290 Q58 264 48 240 Q53 226 66 232 Q75 240 68 260" stroke="#040904" strokeWidth="4" fill="none"/>
      <rect x="0" y="212" width="360" height="78" fill="url(#fs-mst)"/>
      <ellipse cx="180" cy="222" rx="172" ry="26" fill="#0C180C" fillOpacity="0.38"/>
    </svg>
  )
}

function CoastBackdrop() {
  return (
    <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%' }}
         viewBox="0 0 360 290" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="cb-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#04060A"/><stop offset="100%" stopColor="#0B1020"/>
        </linearGradient>
        <linearGradient id="cb-wtr" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0A1525"/><stop offset="100%" stopColor="#060C18"/>
        </linearGradient>
        <linearGradient id="cb-rd" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10121A" stopOpacity="0"/><stop offset="100%" stopColor="#14161E"/>
        </linearGradient>
      </defs>
      <rect width="360" height="290" fill="url(#cb-sky)"/>
      <rect x="0" y="108" width="360" height="112" fill="url(#cb-wtr)"/>
      <path d="M0 126 Q60 120 120 128 Q180 136 240 124 Q300 114 360 128" stroke="#0E1E35" strokeWidth="1.5" fill="none" opacity="0.7"/>
      <path d="M0 144 Q80 136 160 146 Q240 154 320 142 Q344 138 360 146" stroke="#0E1E35" strokeWidth="1" fill="none" opacity="0.45"/>
      <path d="M0 162 Q70 154 140 162 Q220 170 300 156 Q330 152 360 162" stroke="#0E1E35" strokeWidth="1" fill="none" opacity="0.3"/>
      <ellipse cx="54"  cy="188" rx="28" ry="20" fill="#090B14"/>
      <ellipse cx="43"  cy="185" rx="16" ry="12" fill="#0C0E16"/>
      <ellipse cx="296" cy="190" rx="24" ry="17" fill="#090B14"/>
      <ellipse cx="310" cy="187" rx="14" ry="11" fill="#0C0E16"/>
      <polygon points="64,164 67,148 70,164" fill="#1A2535" opacity="0.55"/>
      <polygon points="57,167 60,152 63,167" fill="#1A2535" opacity="0.45"/>
      <polygon points="299,165 301,149 304,165" fill="#1A2535" opacity="0.45"/>
      <rect x="0" y="210" width="360" height="80" fill="#0A0C10"/>
      <path d="M134 188 L226 188 L302 290 L58 290 Z" fill="url(#cb-rd)"/>
      <path d="M134 188 L226 188 L302 290 L58 290 Z" fill="#121420" fillOpacity="0.5"/>
      <rect x="172" y="220" width="16" height="1.5" fill="#16182A" rx="1"/>
      <rect x="161" y="248" width="38" height="1.5" fill="#16182A" rx="1"/>
      <rect x="0" y="122" width="360" height="80" fill="#0A1A30" fillOpacity="0.28"/>
      <ellipse cx="180" cy="224" rx="180" ry="30" fill="#0A1530" fillOpacity="0.32"/>
    </svg>
  )
}

function ForgeBackdrop() {
  return (
    <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%' }}
         viewBox="0 0 360 290" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="fk-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#070402"/><stop offset="100%" stopColor="#130905"/>
        </linearGradient>
        <radialGradient id="fk-glow" cx="50%" cy="92%" r="46%">
          <stop offset="0%" stopColor="#8B3A0A" stopOpacity="0.38"/>
          <stop offset="100%" stopColor="#130905" stopOpacity="0"/>
        </radialGradient>
        <linearGradient id="fk-rd" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1C1109" stopOpacity="0"/><stop offset="100%" stopColor="#1C1109"/>
        </linearGradient>
      </defs>
      <rect width="360" height="290" fill="url(#fk-sky)"/>
      <rect x="0"   y="54" width="126" height="236" fill="#0D0805"/>
      <rect x="234" y="67" width="126" height="223" fill="#0D0805"/>
      <rect x="142" y="96"  width="76" height="106" fill="#090604"/>
      <path d="M142 96 Q180 64 218 96" fill="#090604"/>
      <rect x="144" y="96"  width="72" height="104" fill="#060403"/>
      <rect x="108" y="108" width="20" height="132" fill="#100A06" rx="1"/>
      <rect x="105" y="106" width="26" height="10"  fill="#130C07" rx="1"/>
      <rect x="105" y="236" width="26" height="4"   fill="#130C07" rx="1"/>
      <path d="M105 180 L131 176" stroke="#080504" strokeWidth="4"/>
      <rect x="103" y="178" width="30" height="5"   fill="#0F0905" fillOpacity="0.6"/>
      <rect x="232" y="120" width="16" height="120" fill="#100A06" rx="1"/>
      <rect x="229" y="118" width="22" height="8"   fill="#130C07" rx="1"/>
      <rect x="0" y="240" width="360" height="50" fill="url(#fk-glow)"/>
      <rect x="0" y="240" width="360" height="50" fill="#110806"/>
      <path d="M134 188 L226 188 L300 290 L60 290 Z" fill="url(#fk-rd)"/>
      <path d="M134 188 L226 188 L300 290 L60 290 Z" fill="#1C1109" fillOpacity="0.5"/>
      <line x1="88"  y1="246" x2="272" y2="246" stroke="#100905" strokeWidth="1"/>
      <line x1="72"  y1="272" x2="288" y2="272" stroke="#100905" strokeWidth="1"/>
      <line x1="180" y1="195" x2="180" y2="290" stroke="#100905" strokeWidth="1"/>
      <circle cx="148" cy="178" r="1.5" fill="#D46A2D" fillOpacity="0.75"/>
      <circle cx="218" cy="192" r="1"   fill="#D46A2D" fillOpacity="0.55"/>
      <circle cx="175" cy="163" r="1.2" fill="#D46A2D" fillOpacity="0.45"/>
      <circle cx="202" cy="172" r="1.5" fill="#D46A2D" fillOpacity="0.65"/>
      <path d="M180 136 Q175 118 184 98 Q189 82 178 66"  stroke="#1C1208" strokeWidth="3" fill="none" opacity="0.35"/>
      <path d="M186 140 Q193 122 185 105 Q178 92 191 78" stroke="#1C1208" strokeWidth="2" fill="none" opacity="0.25"/>
    </svg>
  )
}

function BiomeMarchBackdrop({ biomeId }) {
  if (biomeId === 'coast') return <CoastBackdrop />
  if (biomeId === 'forge') return <ForgeBackdrop />
  return <ForestBackdrop />
}

// ── Lantern (exported so CaravanScreen can reuse it in camp scene) ─────────────

export function LanternSVG() {
  return (
    <svg width="26" height="34" viewBox="0 0 26 34">
      <rect x="11" y="0" width="4" height="5" fill="#3A2618" rx="1"/>
      <rect x="5"  y="5" width="16" height="22" fill="#1A1208" rx="2"/>
      <rect x="7"  y="7" width="12" height="18" fill="rgba(184,148,74,0.07)" rx="1"/>
      <rect x="7"  y="7" width="3"  height="18" fill="rgba(184,148,74,0.05)"/>
      <rect x="16" y="7" width="3"  height="18" fill="rgba(184,148,74,0.05)"/>
      <ellipse cx="13" cy="17" rx="3"   ry="4"   fill="rgba(212,106,45,0.32)"/>
      <ellipse cx="13" cy="18" rx="1.8" ry="2.5" fill="rgba(212,106,45,0.52)"/>
      <rect x="4" y="27" width="18" height="3" fill="#3A2618" rx="1"/>
      <ellipse cx="13" cy="17" rx="9" ry="9" fill="rgba(184,148,74,0.07)"/>
    </svg>
  )
}

// ── Event visual floating inside the scene canvas ────────────────────────────

function MarchEventVisual({ event }) {
  if (!event) return null
  const base = { position:'absolute', zIndex:6, animation:'eventAppear 0.5s ease-out' }

  if (event.type === 'resource') {
    return (
      <div style={{ ...base, top:'14%', right:'10%' }}>
        <div style={{
          background:'rgba(7,8,7,0.88)', border:'1px solid rgba(184,148,74,0.45)',
          borderRadius:6, padding:'6px 8px', textAlign:'center',
          animation:'resourceGlow 2.2s ease-in-out infinite',
        }}>
          <ResourceNode resourceId={event.resourceId} size={30} />
          {event.resourceId && (
            <div style={{ fontSize:'0.5rem', color:'var(--color-gold)', marginTop:2, letterSpacing:'0.04em', maxWidth:56 }}>
              {RESOURCES[event.resourceId]?.name ?? ''}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (event.type === 'exploration') {
    return (
      <div style={{ ...base, top:'20%', left:'8%' }}>
        <svg width="50" height="60" viewBox="0 0 50 60">
          <ellipse cx="25" cy="30" rx="20" ry="26" fill="rgba(30,55,30,0.32)"/>
          <path d="M8 30 Q25 8 42 30" stroke="rgba(63,163,77,0.22)" strokeWidth="1.5" fill="none"/>
          <rect x="23" y="14" width="4" height="36" fill="#0A1309" rx="1"/>
          <rect x="21" y="20" width="8" height="2"  fill="#0A1309" rx="1"/>
          <rect x="23" y="16" width="4" height="1"  fill="#3FA34D" fillOpacity="0.42"/>
          <rect x="23" y="20" width="4" height="1"  fill="#3FA34D" fillOpacity="0.22"/>
        </svg>
      </div>
    )
  }

  if (event.type === 'creature') {
    return (
      <div style={{ ...base, top:'32%', left:'8%' }}>
        <div style={{
          width:54, height:54, borderRadius:'50%',
          border:'1px solid rgba(79,143,149,0.3)',
          boxShadow:'0 0 14px rgba(79,143,149,0.12)',
          display:'flex', alignItems:'center', justifyContent:'center',
        }}>
          <div style={{ width:34, height:34, borderRadius:'50%', border:'1px solid rgba(79,143,149,0.18)' }}/>
        </div>
      </div>
    )
  }

  if (event.type === 'threat') {
    return (
      <div style={{ ...base, top:'28%', left:'5%' }}>
        <svg width="50" height="54" viewBox="0 0 50 54">
          <ellipse cx="25" cy="40" rx="13" ry="7"  fill="rgba(180,40,40,0.14)"/>
          <ellipse cx="16" cy="26" rx="5"   ry="7" fill="rgba(180,40,40,0.1)"/>
          <ellipse cx="26" cy="24" rx="5"   ry="7" fill="rgba(180,40,40,0.1)"/>
          <ellipse cx="34" cy="28" rx="4.5" ry="6" fill="rgba(180,40,40,0.09)"/>
          <ellipse cx="8"  cy="12" rx="3.5" ry="2.2" fill="rgba(214,60,60,0.38)"/>
          <ellipse cx="18" cy="10" rx="3.5" ry="2.2" fill="rgba(214,60,60,0.38)"/>
        </svg>
      </div>
    )
  }

  if (event.type === 'microevent') {
    return (
      <div style={{ ...base, top:'18%', left:'36%' }}>
        <svg width="46" height="44" viewBox="0 0 46 44">
          <path d="M3 22  Q13 16 23 22 Q33 28 46 20" stroke="rgba(184,148,74,0.28)" strokeWidth="1.5" fill="none"/>
          <path d="M3 28  Q11 22 21 28 Q31 34 46 26" stroke="rgba(184,148,74,0.18)" strokeWidth="1"   fill="none"/>
          <circle cx="23" cy="10" r="5"   fill="rgba(184,148,74,0.1)"/>
          <circle cx="23" cy="10" r="2.5" fill="rgba(184,148,74,0.26)"/>
        </svg>
      </div>
    )
  }

  return null
}

// ── Event toast card (below the scene) ───────────────────────────────────────

const TOAST_LABEL = {
  resource:    'Hallazgo',
  exploration: 'Senda',
  creature:    'Criatura',
  threat:      'Amenaza',
  microevent:  'Atmósfera',
}

function MarchEventToast({ event }) {
  if (!event) return null
  return (
    <div className={`live-march-event-toast ${event.type ?? ''}`}>
      <div className="live-march-event-toast-type">
        {TOAST_LABEL[event.type] ?? event.type}
      </div>
      <div className="live-march-event-toast-text">{event.text}</div>
      {event.resourceGain && Object.entries(event.resourceGain).length > 0 && (
        <div className="live-march-event-toast-rewards">
          {Object.entries(event.resourceGain).map(([id, qty]) => (
            <div key={id} className="live-march-event-toast-reward">
              <ResourceNode resourceId={id} size={16} />
              <span>+{qty} {RESOURCES[id]?.name ?? id}</span>
            </div>
          ))}
        </div>
      )}
      {(event.xpGain ?? 0) > 0 && (
        <div className="live-march-event-toast-reward" style={{ color:'var(--color-xp)' }}>
          +{event.xpGain} XP
        </div>
      )}
    </div>
  )
}

// ── Scene core (stable component — not nested inside LiveMarchScene) ───────────

function MarchSceneCore({ expedition, player, isTransition }) {
  const biomeId   = expedition.biomeId ?? 'forest'
  const latestEvt = expedition.events?.[expedition.events.length - 1] ?? null
  const mistColor = biomeId === 'coast'
    ? 'rgba(10,15,30,0.76)'
    : biomeId === 'forge'
    ? 'rgba(20,10,5,0.8)'
    : 'rgba(10,18,10,0.76)'

  return (
    <div className={`live-march-scene ${biomeId}`}>
      <div className="live-march-background">
        <BiomeMarchBackdrop biomeId={biomeId} />
      </div>
      <div className="march-road-wrap">
        <div className="march-road-surface" />
        <div className="march-road-marks" />
      </div>
      <div className="march-mist" style={{ background:`linear-gradient(to top, ${mistColor}, transparent)` }}/>
      {!isTransition && <MarchEventVisual event={latestEvt} />}
      <div className="live-march-party">
        <div className="live-march-creature"><CreatureToken creatureId={player.creatureId} size={62} /></div>
        <div className="live-march-lantern"><LanternSVG /></div>
        <div className="live-march-character"><ArchetypeToken archetypeId={player.archetypeId} size={70} /></div>
      </div>
      <div className="march-header-overlay">
        <span style={{ color:'var(--color-gold)' }}>Tramo {expedition.currentTramo}</span>
        {expedition.routeName ? (
          <span style={{ color:'var(--color-parchment)', fontSize:'0.6rem' }}>{expedition.routeName}</span>
        ) : (
          <span style={{ color:'var(--color-parchment)' }}>Marcha Libre</span>
        )}
        {expedition.routeSegmentName ? (
          <span style={{ color:'var(--color-mist)', fontSize:'0.58rem' }}>
            {isTransition ? (
              <>Tramo {expedition.routeSegmentOrder}/{expedition.routeSegmentCount} completado</>
            ) : (
              <>Tramo {expedition.routeSegmentOrder}/{expedition.routeSegmentCount} · {expedition.routeSegmentName}</>
            )}
          </span>
        ) : null}
        {!isTransition && (
          <span style={{ color:'var(--color-stone-light)' }}>
            {expedition.currentSteps}&thinsp;/&thinsp;{expedition.targetSteps}
          </span>
        )}
      </div>
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function LiveMarchScene({
  expedition,
  player,
  onContinueToNextSegment,
  onAbandonExpedition,
  onGoToMap,
  activeRouteStop,
}) {
  const isTransition   = expedition.status === 'segment_transition'
  const isBranchChoice = expedition.status === 'branch_choice'
  const t              = expedition.segmentTransition ?? null
  const latestEvt      = expedition.events?.[expedition.events.length - 1] ?? null

  // ── Branch choice waiting state ───────────────────────────────────────────
  if (isBranchChoice) {
    const bc = expedition.pendingBranchChoice
    return (
      <div style={{ display:'flex', flexDirection:'column', minHeight:'100%', background:'var(--color-bg)' }}>
        <MarchSceneCore expedition={expedition} player={player} isTransition />
        <div className="live-march-branch-waiting">
          <div className="live-march-segment-label">Bifurcación en el camino</div>
          {bc?.name && (
            <div className="live-march-segment-name">{bc.name}</div>
          )}
          <div style={{ height:1, background:'rgba(184,148,74,0.18)', margin:'8px 0' }}/>
          <div style={{ fontSize:'0.68rem', color:'var(--color-stone-light)', marginBottom:14, fontStyle:'italic', lineHeight:1.45 }}>
            La caravana espera una decisión de camino.
          </div>
          {onGoToMap && (
            <button className="btn btn-primary" onClick={onGoToMap}>
              Ver opciones en el mapa →
            </button>
          )}
        </div>
      </div>
    )
  }

  // ── Segment transition ────────────────────────────────────────────────────
  if (isTransition && t) {
    return (
      <div style={{ display:'flex', flexDirection:'column', minHeight:'100%', background:'var(--color-bg)' }}>
        <MarchSceneCore expedition={expedition} player={player} isTransition />
        <div className="live-march-segment-transition">
          <div className="live-march-segment-label">Tramo completado</div>
          <div className="live-march-segment-name">{t.completedSegmentName}</div>
          <div style={{ height:1, background:'rgba(184,148,74,0.18)', margin:'8px 0' }}/>
          <div className="live-march-segment-label" style={{ marginBottom:4, opacity:0.7 }}>Siguiente tramo</div>
          <div className="live-march-segment-next">{t.nextSegmentName}</div>
          {activeRouteStop && (
            <div className="live-march-route-stop-signal">
              <span className="live-march-route-stop-icon">⛺</span>
              <span className="live-march-route-stop-name">{activeRouteStop.name}</span>
            </div>
          )}
          <div className="live-march-segment-timer">
            {activeRouteStop
              ? 'La marcha se ha pausado por la parada.'
              : <>La caravana retomará la marcha en{' '}<span style={{ color:'var(--color-parchment)', fontWeight:600 }}>{t.secondsRemaining} s</span></>
            }
          </div>
          <div style={{ height:3, background:'rgba(98,107,111,0.2)', borderRadius:2, margin:'0 0 14px', overflow:'hidden' }}>
            <div style={{
              height:'100%', borderRadius:2, background:'var(--color-teal)',
              width:`${(t.secondsRemaining / 20) * 100}%`, transition:'width 1s linear',
            }}/>
          </div>
          <button className="btn btn-primary" style={{ marginBottom:8 }} onClick={onContinueToNextSegment}>
            Siguiente tramo
          </button>
          <button
            className="btn btn-secondary"
            style={{ fontSize:'0.6rem', opacity:0.65 }}
            onClick={onAbandonExpedition}
          >
            Abandonar expedición
          </button>
        </div>
      </div>
    )
  }

  // ── Marching ─────────────────────────────────────────────────────────────
  return (
    <>
      <MarchSceneCore expedition={expedition} player={player} isTransition={false} />

      <div className="live-march-progress">
        <div className="live-march-progress-meta">
          <span>{expedition.routeSegmentName ?? expedition.routeName ?? '—'}</span>
          <span style={{ color:'var(--color-xp)' }}>{expedition.progress}%</span>
        </div>
        <div className="live-march-progress-track">
          <div className="live-march-progress-fill" style={{ width:`${expedition.progress}%` }}/>
        </div>
        <div className="live-march-progress-meta" style={{ opacity:0.7, marginTop:2 }}>
          <span>{expedition.events.length} hallazgo{expedition.events.length !== 1 ? 's' : ''}</span>
          <span>{expedition.currentSteps} / {expedition.targetSteps} pasos</span>
        </div>
      </div>

      {latestEvt && <MarchEventToast event={latestEvt} />}
    </>
  )
}
