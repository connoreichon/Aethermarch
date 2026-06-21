import { useState, useEffect, useRef } from 'react'
import { ARCHETYPES, CREATURES, EXPEDITION_MODES, RESOURCES, BIOMES, ENEMIES, POIS } from '../data/gameData.js'
import { canUsePoiAction, getPoiActionLabel, getPoiFlavorText } from '../systems/poiSystem.js'
import { getAvailableContracts, canStartContract, isSectorContractCompleted, getContractSuccessChance, getContractRewardText } from '../systems/contractSystem.js'
import { getPlayerRank, getNextRankRequirement, canUseMercenaryContracts } from '../systems/rankSystem.js'
import { getAvailableEchoSteps } from '../systems/stepSourceSystem.js'
import { getAvailableStances } from '../systems/combatSystem.js'
import { getExpeditionPreparation, getRiskLevel, getPreparationWarnings } from '../systems/preparationSystem.js'
import ArchetypeToken from '../components/tokens/ArchetypeToken.jsx'
import CreatureToken  from '../components/tokens/CreatureToken.jsx'
import EnemyToken     from '../components/tokens/EnemyToken.jsx'
import ResourceNode   from '../components/tokens/ResourceNode.jsx'
import StatBar        from '../components/StatBar.jsx'

const DANGER_RANK_LABELS = { low: 'bajo', medium: 'medio', high: 'alto', extreme: 'extremo' }
const DANGER_RANK_COLORS = { low: 'var(--color-xp)', medium: 'var(--color-ember)', high: 'var(--color-hp)', extreme: 'var(--color-hp)' }

const MODE_LABELS = {
  free_march: 'Marcha Libre',
  hunt:       'Caza',
  gather:     'Recolección',
  explore:    'Exploración',
}

const MODE_SHORT = {
  free_march: 'Riesgo equilibrado · recursos y sendas',
  hunt:       'Más amenazas y XP de combate',
  gather:     'Más recursos · menos combates',
  explore:    'Más rutas y secretos',
}

const EVT_LABEL = {
  resource:    'Hallazgo',
  exploration: 'Senda',
  creature:    'Criatura',
  threat:      'Amenaza',
  microevent:  'Atmósfera',
}

const THREAT_LABEL  = { low: 'Amenaza baja', medium: 'Amenaza media', high: 'Amenaza alta' }
const MASTERY_LABEL = ['Sin rastro', 'Conocido', 'Familiar', 'Dominado', 'Legendario']

// ── Biome backdrops ──────────────────────────────────────────────────────────

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

// ── Lantern ──────────────────────────────────────────────────────────────────

function LanternSVG() {
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

// ── Event visual en escena ────────────────────────────────────────────────────

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

// ── Icono de evento (log) ────────────────────────────────────────────────────

function MarchEventIcon({ type }) {
  const s = { flexShrink:0, marginTop:1 }
  if (type === 'resource') return (
    <svg width="13" height="13" viewBox="0 0 14 14" style={s}>
      <circle cx="7" cy="7" r="5.5" fill="none" stroke="rgba(184,148,74,0.65)" strokeWidth="1"/>
      <path d="M7 3.5 L8.2 6.5 L11.5 7 L9 9.4 L9.5 13 L7 11.5 L4.5 13 L5 9.4 L2.5 7 L5.8 6.5 Z" fill="rgba(184,148,74,0.42)"/>
    </svg>
  )
  if (type === 'exploration') return (
    <svg width="13" height="13" viewBox="0 0 14 14" style={s}>
      <circle cx="7" cy="7" r="5.5" fill="none" stroke="rgba(63,163,77,0.65)" strokeWidth="1"/>
      <path d="M4 10 L7 4 L10 10 M5.5 8 L8.5 8" stroke="rgba(63,163,77,0.7)" strokeWidth="1" fill="none" strokeLinecap="round"/>
    </svg>
  )
  if (type === 'creature') return (
    <svg width="13" height="13" viewBox="0 0 14 14" style={s}>
      <circle cx="7" cy="7" r="5.5" fill="none" stroke="rgba(79,143,149,0.65)" strokeWidth="1"/>
      <path d="M4.5 9 Q7 5.5 9.5 9" stroke="rgba(79,143,149,0.7)" strokeWidth="1" fill="none" strokeLinecap="round"/>
      <circle cx="5" cy="6.5" r="1" fill="rgba(79,143,149,0.7)"/>
      <circle cx="9" cy="6.5" r="1" fill="rgba(79,143,149,0.7)"/>
    </svg>
  )
  if (type === 'threat') return (
    <svg width="13" height="13" viewBox="0 0 14 14" style={s}>
      <circle cx="7" cy="7" r="5.5" fill="none" stroke="rgba(214,104,40,0.65)" strokeWidth="1"/>
      <path d="M7 4 L7 8.5" stroke="rgba(214,104,40,0.8)" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="7" cy="11" r="0.9" fill="rgba(214,104,40,0.8)"/>
    </svg>
  )
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" style={s}>
      <circle cx="7" cy="7" r="5.5" fill="none" stroke="rgba(140,130,100,0.5)" strokeWidth="1"/>
      <path d="M3.5 7 Q5.5 5 7 7 Q9 9 11 7" stroke="rgba(140,130,100,0.6)" strokeWidth="1" fill="none" strokeLinecap="round"/>
    </svg>
  )
}

// ── Sello de resumen ─────────────────────────────────────────────────────────

function SummaryBanner({ tramoNumber }) {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" style={{ margin:'0 auto 10px', display:'block' }}>
      <circle cx="36" cy="36" r="33" fill="none" stroke="rgba(184,148,74,0.42)" strokeWidth="1"/>
      <circle cx="36" cy="36" r="28" fill="rgba(26,18,8,0.9)" stroke="rgba(184,148,74,0.22)" strokeWidth="0.5"/>
      <text x="36" y="30" textAnchor="middle" fontSize="7.5" fill="rgba(184,148,74,0.6)"
            fontFamily="Georgia,serif" letterSpacing="2">TRAMO</text>
      <text x="36" y="50" textAnchor="middle" fontSize="24" fill="rgba(184,148,74,0.85)"
            fontFamily="Georgia,serif">{tramoNumber}</text>
    </svg>
  )
}

// ── Tarjeta de sector destino ─────────────────────────────────────────────────

function SectorDestCard({ sector, isActive, onSelect }) {
  const biome = BIOMES[sector.biomeId]
  const poi   = POIS[sector.poiId]
  return (
    <div
      className={`sector-dest-card${isActive ? ' active' : ''}`}
      onClick={() => onSelect(sector.id)}
    >
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
        <span style={{ fontSize:'0.78rem', color: isActive ? 'var(--color-gold)' : 'var(--color-parchment)', fontWeight:500 }}>
          {sector.name}
        </span>
        <span style={{
          fontSize:'0.57rem',
          color: sector.threat === 'high' ? 'var(--color-hp)' : sector.threat === 'medium' ? 'var(--color-ember)' : 'var(--color-xp)',
        }}>
          {THREAT_LABEL[sector.threat] ?? ''}
        </span>
      </div>
      <div style={{ fontSize:'0.6rem', color:'var(--color-stone-light)', marginTop:2 }}>
        {biome?.name} · {sector.visits} visita{sector.visits !== 1 ? 's' : ''} · {MASTERY_LABEL[sector.masteryLevel ?? 0]}
      </div>
      {sector.depthMeters && (
        <div style={{ fontSize:'0.56rem', color:'var(--color-stone-light)', marginTop:1, opacity:0.68 }}>
          {sector.stratumName ? sector.stratumName.split('·')[0].trim() : `Estrato ${sector.depth ?? '?'}`}
          {' · '}{sector.depthMeters} m · Loot T{sector.lootTier ?? 1}
          {sector.dangerRank ? (
            <span style={{ color: DANGER_RANK_COLORS[sector.dangerRank] }}>
              {' · Peligro '}{DANGER_RANK_LABELS[sector.dangerRank]}
            </span>
          ) : null}
        </div>
      )}
      {isActive && (
        <div style={{ marginTop:5, fontSize:'0.58rem', color:'var(--color-stone-light)', lineHeight:1.55 }}>
          {poi && (
            <div style={{ marginBottom:2 }}>
              Refugio: <span style={{ color:'var(--color-parchment)' }}>{poi.name}</span>
            </div>
          )}
          <div>
            Recursos:{' '}
            <span style={{ color:'var(--color-parchment)' }}>
              {(sector.resources ?? []).map(r => RESOURCES[r]?.name).filter(Boolean).join(', ')}
            </span>
          </div>
          {biome?.description && (
            <div style={{ marginTop:3, fontStyle:'italic', color:'rgba(140,130,100,0.65)', lineHeight:1.4 }}>
              {biome.description}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Escena de combate ─────────────────────────────────────────────────────────

function CombatScene({ combat, player, expedition, sectors, onResolveCombat, onContinueMarch }) {
  const enemy     = ENEMIES[combat.enemyId]
  const sector    = sectors?.find(s => s.id === expedition.sectorId)
  const biome     = BIOMES[expedition.biomeId ?? 'forest']
  const archetype = ARCHETYPES.find(a => a.id === player?.archetypeId)
  const creature  = CREATURES.find(c => c.id === player?.creatureId)
  const stances   = getAvailableStances()
  const resolved  = combat.status === 'resolved'
  const result    = combat.result

  const decisionSeconds              = combat.decisionSeconds ?? 5
  const [remainingSeconds, setRemainingSeconds] = useState(
    combat.status === 'awaiting_choice' ? decisionSeconds : 0
  )
  const autoResolvedRef = useRef(false)

  // Countdown tick
  useEffect(() => {
    if (combat.status !== 'awaiting_choice') return
    autoResolvedRef.current = false
    setRemainingSeconds(decisionSeconds)
    const id = setInterval(() => {
      setRemainingSeconds(prev => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [combat.status])

  // Auto-resolve when countdown hits 0
  useEffect(() => {
    if (combat.status !== 'awaiting_choice') return
    if (remainingSeconds > 0) return
    if (autoResolvedRef.current) return
    autoResolvedRef.current = true
    onResolveCombat('equilibrada', { auto: true })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainingSeconds, combat.status])

  const bgTop = biome?.id === 'coast'
    ? 'linear-gradient(to bottom, #060810, #0A0F1A)'
    : biome?.id === 'forge'
    ? 'linear-gradient(to bottom, #0A0502, #130905)'
    : 'linear-gradient(to bottom, #050805, #080F08)'

  return (
    <div className="combat-scene">

      {/* Header */}
      <div className="combat-header">
        <span style={{ color:'var(--color-ember)' }}>Combate</span>
        <span style={{ color:'var(--color-stone-light)' }}>{sector?.name ?? '—'}</span>
        <span style={{ color:'var(--color-stone-light)', opacity:0.7 }}>{biome?.name}</span>
      </div>

      {/* Enemy zone */}
      <div className="combat-enemy-zone" style={{ background: bgTop }}>
        <EnemyToken enemyId={combat.enemyId} size={86} />
        <div className="combat-enemy-name">{enemy?.name ?? combat.enemyId}</div>
        <div className="combat-enemy-concept">{enemy?.concept}</div>
        {!resolved && combat.attack && (
          <div className="combat-attack-prep">
            Prepara: <strong>{combat.attack.name}</strong>
          </div>
        )}
        {resolved && combat.attack && (
          <div style={{ fontSize:'0.6rem', color:'var(--color-stone-light)', textAlign:'center', fontStyle:'italic' }}>
            Ataque: {combat.attack.name}
            {result?.wasCorrect && (
              <span style={{ color:'var(--color-xp)', marginLeft:6 }}>· Bloqueado</span>
            )}
          </div>
        )}
      </div>

      {/* Party zone */}
      <div className="combat-party-zone">
        <div style={{ textAlign:'center' }}>
          <ArchetypeToken archetypeId={player.archetypeId} size={46} />
          <div style={{ fontSize:'0.57rem', color:'var(--color-stone-light)', marginTop:2 }}>
            {archetype?.name}
          </div>
        </div>
        <div style={{ textAlign:'center' }}>
          <div className="combat-hp">
            {player.hp} <span style={{ fontSize:'0.6rem', opacity:0.5 }}>/ {player.maxHp} HP</span>
          </div>
          <div style={{ fontSize:'0.55rem', color:'var(--color-xp)', marginTop:2 }}>
            XP {player.xp} / {player.xpToNext}
          </div>
        </div>
        <div style={{ textAlign:'center' }}>
          <CreatureToken creatureId={player.creatureId} size={38} />
          <div style={{ fontSize:'0.57rem', color:'var(--color-stone-light)', marginTop:2 }}>
            {creature?.name}
          </div>
        </div>
      </div>

      {/* Timer + Stance buttons — antes de resolver */}
      {!resolved && (
        <>
          {/* Countdown */}
          <div className="combat-timer" style={{ margin:'10px 14px 0' }}>
            <div className="combat-timer-label">
              {remainingSeconds <= 2 && remainingSeconds > 0
                ? 'La caravana reaccionará por instinto si no decides.'
                : 'El enemigo mide la distancia. Elige una postura antes del impacto.'}
            </div>
            <div className="combat-timer-number">{remainingSeconds}</div>
            <div className="combat-timer-bar">
              <div
                className="combat-timer-fill"
                style={{ width: `${(remainingSeconds / decisionSeconds) * 100}%` }}
              />
            </div>
          </div>

          <div style={{ padding:'8px 14px 0', fontSize:'0.57rem', color:'var(--color-stone-light)',
                        textTransform:'uppercase', letterSpacing:'0.06em' }}>
            Elige postura de combate:
          </div>
          <div className="combat-stances">
            {stances.map(stance => (
              <button
                key={stance.id}
                className={`combat-stance-button ${stance.id}`}
                onClick={() => onResolveCombat(stance.id)}
              >
                <div className="stance-name">{stance.name}</div>
                <div className="stance-desc">{stance.description}</div>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Resultado tras resolución */}
      {resolved && result && (
        <div className="combat-result">
          <div className={result.finalDamage === 0 ? 'result-correct' : 'result-hit'}>
            {result.text}
          </div>
          {result.autoResolved && (
            <div className="combat-auto-note" style={{ marginTop:6 }}>
              Postura equilibrada · elegida por instinto
            </div>
          )}
          <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginTop: result.autoResolved ? 8 : 0 }}>
            <span style={{ fontSize:'0.62rem', color: result.finalDamage > 0 ? 'var(--color-hp)' : 'var(--color-xp)' }}>
              {result.finalDamage > 0 ? `-${result.finalDamage} HP` : 'Sin daño'}
            </span>
            <span style={{ fontSize:'0.62rem', color:'var(--color-xp)' }}>
              +{result.xpGain} XP de combate
            </span>
            <span style={{ fontSize:'0.62rem', color: result.autoResolved ? 'var(--color-mist)' : result.wasCorrect ? 'var(--color-xp)' : 'var(--color-stone-light)' }}>
              {result.autoResolved ? 'Elegida por instinto' : result.wasCorrect ? 'Postura correcta' : 'Postura incorrecta'}
            </span>
          </div>
        </div>
      )}

      {/* Log de combate */}
      <div className="combat-log">
        {combat.log.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>

      {/* Continuar */}
      {resolved && (
        <div className="combat-continue">
          <button className="btn btn-primary" onClick={onContinueMarch}>
            Continuar la marcha
          </button>
        </div>
      )}
    </div>
  )
}

// ── EchoPanel ─────────────────────────────────────────────────────────────────

const PEDOMETER_STATUS_TEXT = {
  idle:        'Podómetro detenido.',
  running:     'Escuchando pasos del móvil.',
  paused:      'Podómetro detenido.',
  denied:      'Permiso de movimiento denegado.',
  unsupported: 'Este navegador no permite leer movimiento del dispositivo.',
  insecure:    'El podómetro necesita abrirse desde una página segura.',
}

function EchoPanel({
  stepSource, pedometer,
  onClaimEcho, onStartPedometer, onStopPedometer, onAddPrototypeSteps,
  echoMessage, lastEchoResult,
}) {
  const available = getAvailableEchoSteps(stepSource)
  const isRunning = pedometer?.status === 'running'
  const canClaim  = available >= 300

  return (
    <div className="echo-panel">
      <div className="echo-title">Eco de Marcha</div>
      <div className="echo-desc">
        Pasos recientes registrados alimentan la reconstrucción del eco. Mín. 300 · Máx. 2000 · Una vez por minuto.
      </div>

      {/* Pasos disponibles */}
      <div className="echo-available-card">
        <div className="echo-available-number">{available}</div>
        <div className="echo-available-label">rastro reciente disponible</div>
      </div>

      {/* Botón reclamar */}
      <button
        className="btn btn-secondary"
        style={{ width:'100%', marginTop:8, marginBottom:4 }}
        onClick={onClaimEcho}
        disabled={!canClaim}
      >
        Reconstruir eco
      </button>

      {echoMessage?.type === 'error' && (
        <div className="echo-error">{echoMessage.text}</div>
      )}

      {lastEchoResult && (
        <div className="echo-result">
          <div style={{ color:'var(--color-gold)', fontWeight:500, marginBottom:5 }}>
            {lastEchoResult.title} · {lastEchoResult.steps} pasos
          </div>
          <div style={{ marginBottom:6 }}>{lastEchoResult.summaryText}</div>
          {lastEchoResult.events?.map((ev, i) => (
            <div key={i} style={{ fontSize:'0.65rem', color:'var(--color-mist)', fontStyle:'italic', marginBottom:2 }}>
              {ev}
            </div>
          ))}
          <div style={{ marginTop:6, display:'flex', flexWrap:'wrap', gap:6 }}>
            {(lastEchoResult.xpGain ?? 0) > 0 && (
              <span style={{ fontSize:'0.65rem', color:'var(--color-xp)' }}>+{lastEchoResult.xpGain} XP</span>
            )}
            {Object.entries(lastEchoResult.resources ?? {}).map(([id, qty]) => (
              <span key={id} style={{ fontSize:'0.65rem', color:'var(--color-gold)' }}>
                +{qty}× {RESOURCES[id]?.name ?? id}
              </span>
            ))}
            {(lastEchoResult.masteryGain ?? 0) > 0 && (
              <span style={{ fontSize:'0.65rem', color:'var(--color-magic)' }}>
                +{lastEchoResult.masteryGain} dominio en {lastEchoResult.sectorName}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Podómetro experimental */}
      <div className="pedometer-panel">
        <div className="pedometer-title">Podómetro experimental</div>
        <p className="pedometer-desc">
          Prueba pasos reales del móvil para alimentar el Eco de Marcha. Es una lectura provisional y puede no ser exacta.
        </p>
        <div className="pedometer-status">
          {PEDOMETER_STATUS_TEXT[pedometer?.status] ?? 'Podómetro detenido.'}
        </div>
        {isRunning && (
          <div style={{ fontSize:'0.62rem', color:'var(--color-mist)', marginBottom:7 }}>
            Pasos detectados esta sesión: {pedometer.steps}
          </div>
        )}
        <div className="pedometer-actions">
          {!isRunning ? (
            <button className="pedometer-button" onClick={onStartPedometer}>
              Activar podómetro
            </button>
          ) : (
            <button className="pedometer-button active" onClick={onStopPedometer}>
              Detener podómetro
            </button>
          )}
        </div>
      </div>

      {/* Simulador del prototipo */}
      <div className="echo-prototype-tools">
        <div className="echo-prototype-title">Simulador del prototipo</div>
        <p className="echo-prototype-desc">
          Añade pasos ficticios para probar el Eco de Marcha sin caminar.
        </p>
        <div className="echo-prototype-actions">
          <button className="echo-prototype-button" onClick={() => onAddPrototypeSteps(500)}>+500</button>
          <button className="echo-prototype-button" onClick={() => onAddPrototypeSteps(1500)}>+1500</button>
          <button className="echo-prototype-button" onClick={() => onAddPrototypeSteps(2000)}>Llenar 2000</button>
        </div>
      </div>
    </div>
  )
}

// ── Tarjeta de rango ─────────────────────────────────────────────────────────

function RankCard({ rank, nextReq }) {
  return (
    <div className="rank-card">
      <div className="rank-label">{rank.label}</div>
      <div style={{ fontSize:'0.6rem', color:'var(--color-stone-light)', fontStyle:'italic', marginTop:2, lineHeight:1.4 }}>
        {rank.description}
      </div>
      {nextReq && (
        <div className="rank-progress">
          Progreso a {nextReq.nextRank.name}: {nextReq.metCount}/{nextReq.totalRequired} requisitos
        </div>
      )}
    </div>
  )
}

// ── Puerta de mercenarios ─────────────────────────────────────────────────────

function MercenaryGateCard({ canUseMercenaries }) {
  return (
    <div className="panel mercenary-gate-card">
      <div className="panel-title">Exploradores contratables</div>
      {!canUseMercenaries ? (
        <div className="mercenary-locked">
          <div style={{ fontSize:'0.68rem', color:'var(--color-stone-light)' }}>
            Bloqueado hasta <span style={{ color:'var(--color-gold)' }}>Rango II · Caminante</span>.
          </div>
          <div style={{ fontSize:'0.6rem', color:'var(--color-stone-light)', marginTop:5, lineHeight:1.45, fontStyle:'italic' }}>
            Al principio la caravana desciende sola. Los exploradores aceptarán contratos cuando tu nombre pese más en el Abismo.
          </div>
          <button className="contract-action-button" style={{ marginTop:8 }} disabled>
            Enviar explorador · Bloqueado
          </button>
        </div>
      ) : (
        <div className="mercenary-available">
          <div style={{ fontSize:'0.65rem', color:'var(--color-stone-light)', lineHeight:1.45 }}>
            Disponible próximamente. Los exploradores podrán partir durante 2 h para revisar rutas conocidas y volver con informe, recursos o complicaciones.
          </div>
          <button className="contract-action-button" style={{ marginTop:8 }} disabled>
            Enviar explorador 2 h · Próximamente
          </button>
        </div>
      )}
    </div>
  )
}

// ── Panel de lugar seguro ─────────────────────────────────────────────────────

function PoiPanel({ sector, player, expedition, combat, lastPoiResult, onUsePoiAction }) {
  if (!sector) return null

  if (!sector.poiId) {
    return (
      <div className="panel">
        <div className="panel-title">Lugar del sector</div>
        <div className="poi-empty">No hay ningún lugar seguro registrado en este sector.</div>
      </div>
    )
  }

  const poi         = POIS[sector.poiId]
  const check       = canUsePoiAction({ poiId: sector.poiId, player, expedition, combat })
  const actionLabel = getPoiActionLabel(sector.poiId)
  const flavorText  = getPoiFlavorText(sector.poiId, sector)
  const showResult  = lastPoiResult?.sectorId === sector.id

  return (
    <div className="panel">
      <div className="panel-title">Lugar del sector</div>
      <div className="poi-panel">
        <div className="poi-panel-header">
          <span className="poi-type-label">{poi?.icon} {poi?.name}</span>
        </div>
        <div className="poi-meta">
          {sector.name}
          {sector.stratumName ? ` · ${sector.stratumName.split('·')[0].trim()}` : ''}
          {sector.depthMeters ? ` · ${sector.depthMeters} m` : ''}
        </div>
        <div className="poi-description">{flavorText}</div>
        {!check.ok && (
          <div className="poi-blocked-text">{check.reason}</div>
        )}
        <button
          className="poi-action-button"
          onClick={onUsePoiAction}
          disabled={!check.ok}
        >
          {actionLabel}
        </button>
        {showResult && (
          <div className="poi-result-box">
            <div className="poi-result-title">{lastPoiResult.poiName}</div>
            <div className="poi-result-text">{lastPoiResult.summaryText}</div>
            {lastPoiResult.hpGain > 0 && (
              <div style={{ fontSize:'0.6rem', color:'var(--color-xp)', marginTop:4 }}>
                +{lastPoiResult.hpGain} HP recuperados
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Panel de contratos ────────────────────────────────────────────────────────

function ContractsPanel({ sector, player, contractState, expedition, combat, lastContractResult, onStartContract, onResolveActiveContract }) {
  if (!sector) return null

  const available      = getAvailableContracts({ sector, contractState })
  const active         = contractState?.activeContract ?? null
  const completed      = isSectorContractCompleted(sector.poiId, contractState)
  const canAcceptCheck = canStartContract({ contractState, expedition, combat })
  const inCombat       = expedition?.status === 'combat' || combat?.status === 'awaiting_choice'
  const inMarch        = expedition?.status === 'marching'

  return (
    <div className="panel">
      <div className="panel-title">Encargos del lugar</div>
      <div className="contract-panel">

        {/* Sin POI */}
        {!sector.poiId && (
          <div className="contract-empty">No hay encargos disponibles en este sector.</div>
        )}

        {/* Contrato activo */}
        {sector.poiId && active && (
          <div className="contract-card">
            <div className="contract-active-badge">Contrato activo</div>
            <div className="contract-title">{active.title}</div>
            <div className="contract-contractor">{active.contractorName}</div>
            <div className="contract-meta">
              Riesgo: {active.riskLabel ?? active.risk}
              {active.successChance != null && (
                <> · <span className="contract-chance">Prob. éxito: {active.successChance}%</span></>
              )}
            </div>
            <div className="contract-description" style={{ marginTop:5 }}>
              En esta versión de prototipo puedes resolverlo manualmente.
            </div>
            {(inCombat || inMarch) && (
              <div className="contract-empty" style={{ marginBottom:5 }}>
                No puedes resolver contratos {inCombat ? 'durante un combate' : 'mientras la caravana está en marcha'}.
              </div>
            )}
            <button
              className="contract-action-button"
              onClick={onResolveActiveContract}
              disabled={inCombat || inMarch}
            >
              Resolver contrato
            </button>
          </div>
        )}

        {/* Contrato disponible */}
        {sector.poiId && !active && available.length > 0 && available.map(contract => {
          const chance = getContractSuccessChance({ contract, player, sector })
          return (
            <div key={contract.id} className="contract-card">
              <div className="contract-title">{contract.title}</div>
              <div className="contract-contractor">{contract.contractorName}</div>
              <div className="contract-meta">
                Riesgo: {contract.riskLabel} · Duración estimada: {contract.durationLabel}
              </div>
              <div className="contract-chance">Probabilidad estimada: {chance}%</div>
              <div className="contract-description">{contract.description}</div>
              <div className="contract-rewards">
                Recompensa base: {getContractRewardText(contract.rewards)}
              </div>
              {!canAcceptCheck.ok && (
                <div className="contract-empty" style={{ marginBottom:5 }}>
                  {canAcceptCheck.reason}
                </div>
              )}
              <button
                className="contract-action-button"
                onClick={() => onStartContract(contract)}
                disabled={!canAcceptCheck.ok}
              >
                Aceptar contrato
              </button>
            </div>
          )
        })}

        {/* Completado */}
        {sector.poiId && !active && available.length === 0 && completed && (
          <div>
            <div className="contract-empty" style={{ marginBottom: lastContractResult?.sourceSectorId === sector.id ? 8 : 0 }}>
              Contrato completado en este lugar.
            </div>
            {lastContractResult?.sourceSectorId === sector.id && (
              <div className="contract-result-box">
                <div className="contract-result-title">{lastContractResult.title}</div>
                {lastContractResult.outcomeLabel && (
                  <div className={`contract-outcome ${lastContractResult.outcome ?? ''}`}>
                    Resultado: {lastContractResult.outcomeLabel}
                  </div>
                )}
                <div className="contract-result-text" style={{ marginTop:4 }}>{lastContractResult.summaryText}</div>
                <div style={{ fontSize:'0.6rem', color:'var(--color-stone-light)', marginTop:5 }}>
                  Recompensa obtenida:{' '}
                  <span style={{ color:'var(--color-parchment)' }}>
                    {getContractRewardText(lastContractResult.rewardsGranted ?? lastContractResult.rewards)}
                  </span>
                </div>
                {lastContractResult.consequence && (
                  <div className="contract-consequence">{lastContractResult.consequence.text}</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Sin contrato para este POI */}
        {sector.poiId && !active && available.length === 0 && !completed && (
          <div className="contract-empty">Este lugar no ofrece encargos por ahora.</div>
        )}

      </div>
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function CaravanScreen({
  player, expedition, sectors, combat,
  lastSaved, recoveredFromInterruption,
  onAlzar, onSelectMode, onSelectSector,
  onResolveCombat, onContinueMarch, onPrepareNext,
  onResetGame,
  onClaimEcho, echoMessage, lastEchoResult,
  lastDiscovery,
  stepSource, pedometer,
  onStartPedometer, onStopPedometer, onAddPrototypeSteps,
  lastPoiResult, onUsePoiAction,
  contractState, lastContractResult, onStartContract, onResolveActiveContract,
}) {
  const archetype = ARCHETYPES.find(a => a.id === player?.archetypeId)
  const creature  = CREATURES.find(c => c.id === player?.creatureId)
  const sector    = sectors?.find(s => s.id === expedition?.sectorId)

  // ── COMBAT ────────────────────────────────────────────────────────────────
  if (expedition?.status === 'combat') {
    return (
      <CombatScene
        combat={combat}
        player={player}
        expedition={expedition}
        sectors={sectors}
        onResolveCombat={onResolveCombat}
        onContinueMarch={onContinueMarch}
      />
    )
  }

  // ── MARCHING ─────────────────────────────────────────────────────────────
  if (expedition?.status === 'marching') {
    const lastEvent = expedition.events[expedition.events.length - 1]
    const biomeId   = expedition.biomeId ?? 'forest'
    const mistColor = biomeId === 'coast'
      ? 'rgba(10,15,30,0.76)'
      : biomeId === 'forge'
      ? 'rgba(20,10,5,0.8)'
      : 'rgba(10,18,10,0.76)'

    return (
      <div style={{ display:'flex', flexDirection:'column', minHeight:'100%', background:'var(--color-bg)' }}>

        <div className="march-scene">
          <BiomeMarchBackdrop biomeId={biomeId} />
          <div className="march-road-wrap">
            <div className="march-road-surface" />
            <div className="march-road-marks" />
          </div>
          <div className="march-mist" style={{ background:`linear-gradient(to top, ${mistColor}, transparent)` }}/>
          <MarchEventVisual event={lastEvent} />
          <div className="march-party">
            <div className="march-creature"><CreatureToken creatureId={player.creatureId} size={62} /></div>
            <div className="march-lantern"><LanternSVG /></div>
            <div className="march-character"><ArchetypeToken archetypeId={player.archetypeId} size={70} /></div>
          </div>
          <div className="march-header-overlay">
            <span style={{ color:'var(--color-gold)' }}>Tramo {expedition.currentTramo}</span>
            <span style={{ color:'var(--color-parchment)' }}>{MODE_LABELS[expedition.modeId]}</span>
            <span style={{ color:'var(--color-stone-light)' }}>{sector?.name}</span>
            <span style={{ color:'var(--color-stone-light)' }}>
              {expedition.currentSteps}&thinsp;/&thinsp;{expedition.targetSteps}
            </span>
          </div>
        </div>

        <div className="march-progress-panel">
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.58rem',
                        color:'var(--color-stone-light)', textTransform:'uppercase', letterSpacing:'0.06em' }}>
            <span>Avance del tramo</span>
            <span style={{ color:'var(--color-xp)' }}>{expedition.progress}%</span>
          </div>
          <div className="march-progress-bar-track">
            <div className="march-progress-bar-fill" style={{ width:`${expedition.progress}%` }}/>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.56rem', color:'var(--color-stone-light)' }}>
            <span>{expedition.events.length} hallazgo{expedition.events.length !== 1 ? 's' : ''}</span>
            <span>{expedition.currentSteps} / {expedition.targetSteps} pasos</span>
          </div>
        </div>

        {lastEvent && (
          <div className={`march-current-event ${lastEvent.type}`}>
            <div style={{ flex:1 }}>
              <div className={`march-event-type-label ${lastEvent.type}`}>{lastEvent.title ?? EVT_LABEL[lastEvent.type]}</div>
              <div className="march-event-body">{lastEvent.text}</div>
              <div className="march-event-reward">
                {lastEvent.resourceGain && Object.entries(lastEvent.resourceGain).map(([id, qty]) => (
                  <span key={id} style={{ color:'var(--color-gold)' }}>+{qty} {RESOURCES[id]?.name ?? id}</span>
                ))}
                {(lastEvent.xpGain ?? 0) > 0 && <span style={{ color:'var(--color-xp)', marginLeft:4 }}>+{lastEvent.xpGain} XP</span>}
                {(lastEvent.masteryGain ?? 0) > 0 && <span style={{ color:'var(--color-magic)', marginLeft:4 }}>+{lastEvent.masteryGain} dom</span>}
              </div>
            </div>
          </div>
        )}

        {expedition.events.length > 0 && (
          <div className="march-event-log">
            {[...expedition.events].reverse().map((e, i) => (
              <div key={e.id} className={`march-event-entry${i === 0 ? ' march-event-latest' : ''}`}>
                <MarchEventIcon type={e.type} />
                <div style={{ flex:1, minWidth:0 }}>
                  <div>
                    <span style={{ color:'var(--color-stone-light)', fontSize:'0.57rem',
                                   textTransform:'uppercase', letterSpacing:'0.05em', marginRight:5 }}>
                      {EVT_LABEL[e.type]}
                    </span>
                    {e.text}
                  </div>
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginTop:2 }}>
                    {e.resourceGain && Object.entries(e.resourceGain).map(([id, qty]) => (
                      <span key={id} style={{ fontSize:'0.54rem', color:'var(--color-gold)', fontWeight:500 }}>
                        +{qty} {RESOURCES[id]?.name ?? id}
                      </span>
                    ))}
                    {(e.xpGain ?? 0) > 0 && (
                      <span style={{ fontSize:'0.54rem', color:'var(--color-xp)' }}>+{e.xpGain} XP</span>
                    )}
                    {(e.masteryGain ?? 0) > 0 && (
                      <span style={{ fontSize:'0.54rem', color:'var(--color-magic)' }}>+{e.masteryGain} dominio</span>
                    )}
                    {e.type === 'threat' && e.enemyId && ENEMIES[e.enemyId] && (
                      <span style={{ fontSize:'0.54rem', color:'var(--color-ember)' }}>
                        Rastro: {ENEMIES[e.enemyId].name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ padding:'10px 14px', borderTop:'1px solid var(--color-iron-dark)', marginTop:'auto' }}>
          <div className="stat-bar-wrap">
            <StatBar label="HP" value={player.hp} max={player.maxHp} type="hp" />
            <StatBar label="XP" value={player.xp} max={player.xpToNext} type="xp" />
          </div>
        </div>
      </div>
    )
  }

  // ── COMPLETED ─────────────────────────────────────────────────────────────
  if (expedition?.status === 'completed') {
    const rewards     = expedition.rewards ?? {}
    const xpGain      = rewards.xp ?? 0
    const resEntries  = Object.entries(rewards.resources ?? {})
    const masteryGain = rewards.masteryGain ?? 2
    const threatCount = rewards.threatCount ?? 0
    const resCount    = rewards.resourceCount ?? 0
    const explCount   = rewards.explorationCount ?? 0
    const combatResults = expedition.combatResults ?? []

    return (
      <div className="screen-scroll">
        {/* Cabecera */}
        <div className="panel" style={{ textAlign:'center' }}>
          <SummaryBanner tramoNumber={expedition.currentTramo} />
          <div style={{ fontSize:'1.05rem', color:'var(--color-gold)', textTransform:'uppercase',
                        letterSpacing:'0.12em', marginBottom:4 }}>
            Tramo {expedition.currentTramo} completado
          </div>
          <div style={{ fontSize:'0.65rem', color:'var(--color-stone-light)', lineHeight:1.6 }}>
            {MODE_LABELS[expedition.modeId]} · {sector?.name} · {expedition.currentSteps} pasos
          </div>
          <p className="tramo-narrative-phrase">
            {[
              'La caravana avanzó un tramo más en la oscuridad.',
              'El camino cedió. La crónica crece.',
              'Otro tramo grabado en pergamino y polvo.',
              'La bruma retrocedió ante la marcha.',
              'Un paso más hacia lo desconocido.',
            ][expedition.currentTramo % 5]}
          </p>
        </div>

        {/* Recompensas */}
        <div className="panel">
          <div className="panel-title">Botín del tramo</div>
          {xpGain > 0 && (
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
              <svg width="13" height="13" viewBox="0 0 14 14">
                <circle cx="7" cy="7" r="5.5" fill="none" stroke="rgba(63,163,77,0.6)" strokeWidth="1"/>
                <path d="M4 10 L7 4 L10 10 M5.5 8 L8.5 8" stroke="rgba(63,163,77,0.7)" strokeWidth="1" fill="none" strokeLinecap="round"/>
              </svg>
              <span style={{ fontSize:'0.82rem', color:'var(--color-xp)' }}>+{xpGain} XP</span>
            </div>
          )}
          {resEntries.length > 0 ? (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {resEntries.map(([id, qty]) => (
                <div key={id} style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <ResourceNode resourceId={id} size={30} />
                  <div>
                    <div style={{ fontSize:'0.76rem', color:'var(--color-parchment)' }}>
                      +{qty}× {RESOURCES[id]?.name ?? id.replace(/_/g,' ')}
                    </div>
                    <div style={{ fontSize:'0.58rem', color:'var(--color-stone-light)' }}>
                      {RESOURCES[id]?.utility ?? ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize:'0.68rem', color:'var(--color-stone-light)', fontStyle:'italic' }}>
              Sin materiales esta jornada.
            </div>
          )}

          <div style={{ marginTop:10, paddingTop:8, borderTop:'1px solid rgba(184,148,74,0.12)' }}>
            <div style={{ fontSize:'0.63rem', color:'var(--color-magic)', marginBottom:4 }}>
              +{masteryGain} dominio en {sector?.name ?? '—'}
            </div>
            <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
              {resCount > 0 && (
                <span style={{ fontSize:'0.6rem', color:'var(--color-stone-light)' }}>
                  {resCount} hallazgo{resCount !== 1 ? 's' : ''}
                </span>
              )}
              {explCount > 0 && (
                <span style={{ fontSize:'0.6rem', color:'var(--color-xp)' }}>
                  {explCount} senda{explCount !== 1 ? 's' : ''} revelada{explCount !== 1 ? 's' : ''}
                </span>
              )}
              {threatCount > 0 && (
                <span style={{ fontSize:'0.6rem', color:'var(--color-ember)' }}>
                  {threatCount} rastro{threatCount !== 1 ? 's' : ''} hostil{threatCount !== 1 ? 'es' : ''}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Combates del tramo */}
        {combatResults.length > 0 && (
          <div className="panel">
            <div className="panel-title">Combates del tramo</div>
            {combatResults.map((cr, i) => (
              <div key={i} style={{
                display:'flex', alignItems:'center', gap:10,
                paddingBottom: i < combatResults.length - 1 ? 10 : 0,
                marginBottom:  i < combatResults.length - 1 ? 10 : 0,
                borderBottom:  i < combatResults.length - 1 ? '1px solid rgba(98,107,111,0.14)' : 'none',
              }}>
                <EnemyToken enemyId={cr.enemyId} size={34} />
                <div>
                  <div style={{ fontSize:'0.76rem', color:'var(--color-parchment)' }}>
                    {cr.enemyName ?? cr.enemyId}
                  </div>
                  <div style={{ fontSize:'0.6rem', color:'var(--color-stone-light)', lineHeight:1.5 }}>
                    {cr.wasCorrect
                      ? <span style={{ color:'var(--color-xp)' }}>Postura correcta · sin daño</span>
                      : <span style={{ color: cr.finalDamage > 0 ? 'var(--color-hp)' : 'var(--color-stone-light)' }}>
                          {cr.finalDamage > 0 ? `-${cr.finalDamage} HP` : 'Sin daño'}
                        </span>
                    }
                    <span style={{ marginLeft:6 }}>· +{cr.xpGain} XP de combate</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Crónica */}
        {expedition.events.length > 0 && (
          <div className="panel">
            <div className="panel-title">Crónica del tramo</div>
            <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
              {expedition.events.map(e => (
                <div key={e.id} style={{ display:'flex', alignItems:'flex-start', gap:7,
                                         paddingBottom:6, borderBottom:'1px solid rgba(98,107,111,0.12)' }}>
                  <MarchEventIcon type={e.type} />
                  <div style={{ flex:1 }}>
                    <div style={{ marginBottom:2 }}>
                      <span style={{ fontSize:'0.57rem', color:'var(--color-stone-light)',
                                     textTransform:'uppercase', letterSpacing:'0.05em', marginRight:5 }}>
                        {e.title ?? EVT_LABEL[e.type]}
                      </span>
                      {e.type === 'threat' && e.enemyId && ENEMIES[e.enemyId] && (
                        <span style={{ fontSize:'0.6rem', color:'var(--color-ember)' }}>
                          · {ENEMIES[e.enemyId].name}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize:'0.68rem', color:'var(--color-parchment)', lineHeight:1.45 }}>
                      {e.text}
                    </div>
                    <div style={{ display:'flex', gap:6, marginTop:3, flexWrap:'wrap' }}>
                      {e.resourceGain && Object.entries(e.resourceGain).map(([id, qty]) => (
                        <span key={id} style={{ fontSize:'0.57rem', color:'var(--color-gold)' }}>
                          +{qty} {RESOURCES[id]?.name ?? id}
                        </span>
                      ))}
                      {(e.xpGain ?? 0) > 0 && (
                        <span style={{ fontSize:'0.57rem', color:'var(--color-xp)' }}>+{e.xpGain} XP</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Nueva senda descubierta */}
        {lastDiscovery && (
          <div className="tramo-discovery-highlight">
            <div className="tramo-discovery-headline">Nueva senda descubierta</div>
            <div className="tramo-discovery-name">{lastDiscovery.sectorName}</div>
            <div className="tramo-discovery-text">{lastDiscovery.text}</div>
            <div className="tramo-discovery-footer">
              {BIOMES[lastDiscovery.biomeId]?.name ?? ''} · {lastDiscovery.reason}
            </div>
          </div>
        )}

        {/* Siguiente tramo */}
        <div className="panel" style={{ textAlign:'center' }}>
          <button className="btn btn-primary" onClick={onPrepareNext}>
            Preparar Tramo {expedition.currentTramo + 1}
          </button>
          <p style={{ fontSize:'0.6rem', color:'var(--color-stone-light)', marginTop:8, fontStyle:'italic' }}>
            Jornada registrada en la crónica.
          </p>
        </div>
      </div>
    )
  }

  // ── RESTING ───────────────────────────────────────────────────────────────
  const discoveredSectors = (sectors ?? []).filter(s => s.discovered)
  const activeSector      = sectors?.find(s => s.id === expedition?.sectorId)
  const activeBiome       = BIOMES[activeSector?.biomeId ?? expedition?.biomeId ?? 'forest']
  const canAlzar          = !!activeSector

  const prep     = getExpeditionPreparation({
    modeId:    expedition?.modeId ?? 'free_march',
    sector:    activeSector,
    biome:     activeBiome,
    creature,
    archetype,
  })
  const warnings = getPreparationWarnings({
    player,
    sector:  activeSector,
    modeId:  expedition?.modeId ?? 'free_march',
  })

  const rank     = getPlayerRank({ player, sectors, contractState })
  const nextReq  = getNextRankRequirement({ player, sectors, contractState })
  const canMercs = canUseMercenaryContracts({ player, sectors, contractState })

  return (
    <div className="screen-scroll">

      {/* Escena de campamento */}
      <section className="camp-scene">
        <div className="camp-sky" />
        <div className="camp-moon" />
        <div className="camp-stars" />
        <div className="camp-trees-left" />
        <div className="camp-trees-right" />
        <div className="camp-ground" />
        <div className="camp-road-line" />
        <div className="camp-wagon"><div className="camp-wagon-body" /></div>
        <div className="camp-fire-wrap">
          <div className="camp-fire-glow" />
          <div className="camp-fire-flame" />
        </div>
        <div className="camp-party">
          <div style={{ textAlign:'center' }}>
            <ArchetypeToken archetypeId={player.archetypeId} size={68} />
          </div>
          <div className="camp-lantern-item"><LanternSVG /></div>
          <div style={{ textAlign:'center' }}>
            <CreatureToken creatureId={player.creatureId} size={58} />
          </div>
        </div>
        <div className="camp-mist" />
        <div className="camp-caption">
          <div className="camp-caption-label">Caravana en reposo · Tramo {expedition?.currentTramo}</div>
          <p className="camp-caption-rest">La caravana descansa junto al farol.</p>
        </div>
      </section>

      {/* Nota de reagrupación */}
      {recoveredFromInterruption && (
        <div className="panel">
          <div className="recovery-note">
            La caravana se ha reagrupado tras una interrupción.
          </div>
        </div>
      )}

      {/* Estado compacto */}
      <div className="panel">
        <div className="stat-bar-wrap">
          <StatBar label="HP" value={player.hp} max={player.maxHp} type="hp" />
          <StatBar label="XP" value={player.xp} max={player.xpToNext} type="xp" />
        </div>
        <div className="compact-info-grid">
          <span style={{ fontSize:'0.62rem', color:'var(--color-stone-light)' }}>
            Nv. <span style={{ color:'var(--color-gold)' }}>{player.level}</span>
          </span>
          <span style={{ fontSize:'0.62rem', color:'var(--color-parchment)' }}>{archetype?.name}</span>
          <span style={{ fontSize:'0.62rem', color:'var(--color-magic)' }}>{archetype?.passiveName}</span>
        </div>
      </div>

      {/* Rango de expedición */}
      <RankCard rank={rank} nextReq={nextReq} />

      {/* Destino del tramo */}
      <div className="panel prep-section">
        <div className="panel-title">Destino del tramo</div>
        {discoveredSectors.length === 0 ? (
          <div className="empty-state">La caravana no encuentra una senda segura.</div>
        ) : (
          discoveredSectors.map(s => (
            <SectorDestCard
              key={s.id}
              sector={s}
              isActive={expedition?.sectorId === s.id}
              onSelect={onSelectSector}
            />
          ))
        )}
      </div>

      {/* Modo de marcha compacto */}
      <div className="panel prep-section">
        <div className="panel-title">Modo de marcha</div>
        <div className="prep-modes-compact">
          {EXPEDITION_MODES.map(m => {
            const mRisk    = getRiskLevel({ modeId: m.id, sector: activeSector })
            const isActive = expedition?.modeId === m.id
            return (
              <div
                key={m.id}
                className={`mode-compact-card${isActive ? ' selected' : ''}${m.locked ? ' locked' : ''}`}
                onClick={() => !m.locked && onSelectMode(m.id)}
              >
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span className="mode-compact-name">{m.name}</span>
                  {m.locked
                    ? <span style={{ fontSize:'0.52rem', color:'var(--color-stone-light)', opacity:0.45 }}>Próximamente</span>
                    : <span className={`prep-risk ${mRisk.level}`}>{mRisk.label}</span>
                  }
                </div>
                <div className="mode-compact-desc">
                  {MODE_SHORT[m.id] ?? m.description}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Iniciar la marcha */}
      <div className="alzar-caravana-panel">
        <button
          className="march-primary-button"
          onClick={canAlzar ? onAlzar : undefined}
          disabled={!canAlzar}
        >
          {canAlzar ? 'Iniciar la marcha' : 'No se puede iniciar ahora'}
        </button>
        {canAlzar ? (
          <p className="alzar-caravana-summary">
            Tramo {expedition?.currentTramo} · {MODE_LABELS[expedition?.modeId] ?? ''} · <strong>{activeSector?.name ?? '—'}</strong>
          </p>
        ) : (
          <p className="alzar-caravana-summary" style={{ color:'var(--color-ember)' }}>
            Elige un destino antes de partir.
          </p>
        )}
        {lastSaved && (
          <div className="save-status">Crónica guardada</div>
        )}
      </div>

      {/* Previsión compacta */}
      {activeSector && (
        <div className="panel preparation-compact">
          <div className="panel-title">Previsión del tramo</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:7 }}>
            <span className={`compact-chip risk-${prep.risk.level}`}>{prep.risk.label}</span>
            {prep.expected.events.map((ev, i) => (
              <span key={i} className="compact-chip">{ev}</span>
            ))}
          </div>
          {prep.stratumInfo && (
            <div style={{ display:'flex', flexWrap:'wrap', gap:14, marginBottom:5 }}>
              {prep.stratumInfo.resourceNames.length > 0 && (
                <div style={{ fontSize:'0.6rem', color:'var(--color-stone-light)' }}>
                  Recursos:{' '}
                  <span style={{ color:'var(--color-parchment)' }}>
                    {prep.stratumInfo.resourceNames.join(', ')}
                  </span>
                </div>
              )}
              {prep.stratumInfo.enemyNames.length > 0 && (
                <div style={{ fontSize:'0.6rem', color:'var(--color-stone-light)' }}>
                  Amenazas:{' '}
                  <span style={{ color:'var(--color-ember)' }}>
                    {prep.stratumInfo.enemyNames.join(', ')}
                  </span>
                </div>
              )}
            </div>
          )}
          {prep.creatureHint && (
            <div style={{ fontSize:'0.6rem', color:'var(--color-mist)', fontStyle:'italic', marginBottom:3 }}>
              {creature?.name}: {prep.creatureHint}
            </div>
          )}
          {prep.archetypeHint && (
            <div style={{ fontSize:'0.6rem', color:'var(--color-stone-light)', fontStyle:'italic', marginBottom:3 }}>
              {prep.archetypeHint}
            </div>
          )}
          {warnings.map((w, i) => (
            <div key={i} className="prep-warning">{w}</div>
          ))}
        </div>
      )}

      {/* Lugar del sector */}
      {activeSector && (
        <PoiPanel
          sector={activeSector}
          player={player}
          expedition={expedition}
          combat={combat}
          lastPoiResult={lastPoiResult}
          onUsePoiAction={onUsePoiAction}
        />
      )}

      {/* Encargos del lugar */}
      {activeSector && (
        <ContractsPanel
          sector={activeSector}
          player={player}
          contractState={contractState}
          expedition={expedition}
          combat={combat}
          lastContractResult={lastContractResult}
          onStartContract={onStartContract}
          onResolveActiveContract={onResolveActiveContract}
        />
      )}

      {/* Exploradores contratables */}
      <MercenaryGateCard canUseMercenaries={canMercs} />

      {/* Eco de Marcha */}
      <div className="echo-panel-secondary">
        <EchoPanel
          stepSource={stepSource}
          pedometer={pedometer}
          onClaimEcho={onClaimEcho}
          onStartPedometer={onStartPedometer}
          onStopPedometer={onStopPedometer}
          onAddPrototypeSteps={onAddPrototypeSteps}
          echoMessage={echoMessage}
          lastEchoResult={lastEchoResult}
        />
      </div>

      {/* Criatura compañera */}
      <div className="panel">
        <div className="panel-title">Criatura compañera</div>
        <div style={{ display:'flex', gap:12, alignItems:'center' }}>
          <CreatureToken creatureId={player.creatureId} size={56} />
          <div>
            <div style={{ fontSize:'0.85rem', color:'var(--color-parchment)', marginBottom:2 }}>
              {creature?.name}
            </div>
            <div style={{ fontSize:'0.65rem', color:'var(--color-ember)', textTransform:'uppercase',
                          letterSpacing:'0.06em', marginBottom:4 }}>
              {creature?.role}
            </div>
            <div style={{ fontSize:'0.65rem', color:'var(--color-magic)', marginBottom:2 }}>
              {creature?.passiveName}
            </div>
            <div style={{ fontSize:'0.65rem', color:'var(--color-stone-light)' }}>
              {creature?.passiveDescription}
            </div>
          </div>
        </div>
      </div>

      {/* Borrar partida */}
      <div style={{ textAlign: 'center', padding: '4px 14px 16px' }}>
        <button
          className="danger-link-button"
          onClick={() => {
            const confirmed = window.confirm(
              'Esto borrará la caravana guardada y empezará una nueva partida. ¿Continuar?'
            )
            if (confirmed) onResetGame()
          }}
        >
          Borrar partida
        </button>
      </div>
    </div>
  )
}
