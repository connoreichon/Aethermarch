import { BIOMES, RESOURCES } from '../data/gameData.js'

// ── Pesos por modo ────────────────────────────────────────────────────────────
const MODE_WEIGHTS = {
  free_march: { resource: 30, exploration: 25, creature: 20, threat: 15, microevent: 10 },
  hunt:       { threat: 45,   creature: 15,    exploration: 15, resource: 15, microevent: 10 },
  gather:     { resource: 55, creature: 15,    exploration: 15, microevent: 10, threat: 5  },
  explore:    { exploration: 45, creature: 20, resource: 15,    threat: 10,  microevent: 10 },
}

// ── Texto por tipo y bioma ────────────────────────────────────────────────────
const RESOURCE_TEXTS = {
  forest: [
    'Madera Rúnica asoma entre las raíces marcadas del camino.',
    'Una raíz de Aethel crece entre las piedras de la senda.',
    'Una hoja luminaria cae al paso de la caravana.',
    'La tierra revela materiales entre las raíces del bosque.',
  ],
  coast: [
    'Sal arcana cristalizada en una roca de la orilla.',
    'Un cristal de marea emerge entre las piedras costeras.',
    'Escama nácar bajo una roca a la orilla del camino.',
    'La bruma costera deja al descubierto materiales valiosos.',
  ],
  forge: [
    'Mineral de forja entre los escombros de la senda.',
    'Una placa antigua asoma bajo el polvo del camino.',
    'Carbón resonante junto a las brasas olvidadas.',
    'Los restos de la forja guardan materiales todavía útiles.',
  ],
  default: ['Un recurso oculto al borde de la senda.'],
}

const EXPLORATION_TEXTS = [
  'La niebla se abre y deja ver una senda estrecha entre las raíces.',
  'Una piedra rúnica marca el borde del camino con signos antiguos.',
  'La bruma baja y revela huellas antiguas grabadas en el barro.',
  'Un claro entre los árboles muestra rastros de paso antiguo.',
  'La caravana detecta una desviación oculta al margen del camino.',
  'Una bifurcación no cartografiada aparece entre la niebla.',
]

const CREATURE_TEXTS = {
  velthar: [
    'Velthar olfatea una senda oculta entre la niebla.',
    'Velthar se detiene un instante y señala algo entre los árboles.',
    'El instinto de Velthar guía a la caravana por un paso más seguro.',
  ],
  brontik: [
    'Brontik pisa firme y estabiliza el paso de la caravana.',
    'Brontik marca el territorio con un gruñido suave y protector.',
    'La presencia de Brontik mantiene a la caravana unida.',
  ],
  lumora: [
    'Lúmora señala un brillo enterrado junto al camino.',
    'La luz de Lúmora revela una marca oculta en la corteza.',
    'Lúmora vibra suavemente, alertando de algo cercano.',
  ],
  default: ['La criatura reacciona a algo invisible en el aire.'],
}

const THREAT_TEXTS = {
  forest: [
    'Unas huellas profundas cruzan el camino. La caravana avanza con cautela.',
    'Un rastro hostil corta el barro entre las raíces.',
    'Algo se mueve entre los árboles. La caravana se detiene un instante.',
    'Las ramas de los costados aparecen partidas de forma reciente.',
  ],
  coast: [
    'Marcas en la roca de la costa indican paso reciente de algo grande.',
    'Un sonido sordo llega desde el mar. La caravana no se detiene.',
    'La bruma marina esconde algo que respira cerca del camino.',
  ],
  forge: [
    'Un ruido metálico resuena entre las ruinas. La caravana avanza alerta.',
    'Brasas removidas indican que algo despertó hace poco aquí.',
    'Una sombra pesada se mueve entre las columnas rotas.',
  ],
  default: ['Una presencia hostil ronda el camino.'],
}

const MICROEVENT_TEXTS = {
  forest: [
    'El farol tiembla con el viento bajo los árboles.',
    'La niebla sube y envuelve las botas de marcha.',
    'Un pájaro de noche cruza el camino en silencio.',
    'El bosque guarda silencio un instante extraño.',
  ],
  coast: [
    'El viento del mar apaga el farol un instante.',
    'La bruma costera espesa y el camino se vuelve resbaladizo.',
    'Un olor a sal y algas invade el tramo.',
  ],
  forge: [
    'Una brasa solitaria ilumina el paso por un momento.',
    'El suelo vibra levemente. El calor es notable.',
    'El humo antiguo de la forja envuelve la senda.',
  ],
  default: ['Un momento de silencio extraño cae sobre la caravana.'],
}

const EVENT_TITLES = {
  resource:    'Hallazgo',
  exploration: 'Senda revelada',
  creature:    'Reacción de criatura',
  threat:      'Rastro hostil',
  microevent:  'Atmósfera del camino',
}

// ── Auxiliares ────────────────────────────────────────────────────────────────
function pickEventType(modeId) {
  const weights = MODE_WEIGHTS[modeId] ?? MODE_WEIGHTS.free_march
  const total   = Object.values(weights).reduce((a, b) => a + b, 0)
  let r = Math.random() * total
  for (const [type, w] of Object.entries(weights)) {
    r -= w
    if (r <= 0) return type
  }
  return 'microevent'
}

function pickFromPool(pool, biomeId) {
  const list = pool[biomeId] ?? pool.default ?? pool.forest ?? ['...']
  return list[Math.floor(Math.random() * list.length)]
}

function pickFromList(list) {
  return list[Math.floor(Math.random() * list.length)]
}

// ── Generador de eventos ──────────────────────────────────────────────────────
// sector es opcional — si se pasa, se usa su enemyPool y resources para mayor coherencia
export function generateEvent(modeId, creatureId, threshold, biomeId, sector) {
  const type  = pickEventType(modeId)
  const id    = `evt-${threshold}-${Date.now()}`
  const title = EVENT_TITLES[type] ?? type

  let text         = ''
  let resourceId   = null
  let resourceGain = null
  let enemyId      = null
  let xpGain       = 0
  let masteryGain  = 0
  let tone         = 'neutral'

  if (type === 'resource') {
    text = pickFromPool(RESOURCE_TEXTS, biomeId)
    const rids = sector?.resources?.length ? sector.resources : (BIOMES[biomeId]?.resourceIds ?? [])
    resourceId = rids.length ? rids[Math.floor(Math.random() * rids.length)] : null
    if (resourceId) resourceGain = { [resourceId]: 1 }
    xpGain      = 1
    masteryGain = 0
    tone        = 'discovery'

  } else if (type === 'exploration') {
    text        = pickFromList(EXPLORATION_TEXTS)
    xpGain      = 2
    masteryGain = 5
    tone        = 'discovery'

  } else if (type === 'creature') {
    const cPool = CREATURE_TEXTS[creatureId] ?? CREATURE_TEXTS.default
    text        = pickFromList(cPool)
    xpGain      = 3
    masteryGain = 1
    tone        = 'neutral'

  } else if (type === 'threat') {
    text = pickFromPool(THREAT_TEXTS, biomeId)
    const eids = sector?.enemyPool?.length ? sector.enemyPool : (BIOMES[biomeId]?.enemyIds ?? [])
    enemyId     = eids.length ? eids[Math.floor(Math.random() * eids.length)] : null
    xpGain      = 4
    masteryGain = 1
    tone        = 'danger'

  } else {
    text        = pickFromPool(MICROEVENT_TEXTS, biomeId)
    xpGain      = 1
    masteryGain = 0
    tone        = 'atmospheric'
  }

  return { id, type, title, text, threshold, resourceId, resourceGain, enemyId, xpGain, masteryGain, tone }
}

// ── Cálculo de recompensas ────────────────────────────────────────────────────
export function calculateRewards(events) {
  let xp          = 0
  let masteryGain = 2  // base por completar cualquier tramo
  const resources = {}
  let threatCount = 0, resourceCount = 0, explorationCount = 0, creatureCount = 0, microeventCount = 0

  for (const e of events) {
    xp          += e.xpGain ?? 0
    masteryGain += e.masteryGain ?? 0

    if (e.resourceGain) {
      for (const [id, qty] of Object.entries(e.resourceGain)) {
        resources[id] = (resources[id] ?? 0) + qty
      }
    }

    if      (e.type === 'resource')    resourceCount++
    else if (e.type === 'exploration') explorationCount++
    else if (e.type === 'creature')    creatureCount++
    else if (e.type === 'threat')      threatCount++
    else if (e.type === 'microevent')  microeventCount++
  }

  return { xp, resources, masteryGain, threatCount, resourceCount, explorationCount, creatureCount, microeventCount }
}

// ── Constructor de entrada del diario ─────────────────────────────────────────
// sector opcional — si se pasa, guarda metadatos de Abismo en la entrada
export function buildDiaryEntry(expedition, sectorName, discovery = null, sector = null) {
  const rewards       = expedition.rewards ?? {}
  const combatResults = expedition.combatResults ?? []
  const sName         = sectorName ?? expedition.sectorId ?? '—'
  const xp            = rewards.xp ?? 0
  const threats       = rewards.threatCount ?? 0
  const expls         = rewards.explorationCount ?? 0

  const resText = Object.entries(rewards.resources ?? {})
    .map(([id, qty]) => `${qty}× ${RESOURCES[id]?.name ?? id}`)
    .join(', ')

  const parts = []
  if (resText)     parts.push(`Materiales: ${resText}`)
  if (expls > 0)   parts.push(`${expls} hallazgo${expls > 1 ? 's' : ''} de senda`)
  if (threats > 0) parts.push(`${threats} rastro${threats > 1 ? 's' : ''} hostil${threats > 1 ? 'es' : ''}`)
  if (xp > 0)      parts.push(`+${xp} XP`)

  if (combatResults.length > 0) {
    const names = [...new Set(combatResults.map(c => c.enemyName).filter(Boolean))]
    parts.push(names.length ? `Repelido: ${names.join(', ')}` : `${combatResults.length} combate${combatResults.length > 1 ? 's' : ''}`)
  }

  if (discovery) {
    parts.push(`Al final de la jornada, la niebla cedió y reveló el acceso a ${discovery.sectorName}`)
  }

  const summaryText = parts.length
    ? parts.join('. ') + '.'
    : 'Tramo tranquilo sin hallazgos notables.'

  return {
    id:            `tramo-${expedition.currentTramo}-${Date.now()}`,
    title:         `Tramo ${expedition.currentTramo} · ${sName}`,
    tramoNumber:   expedition.currentTramo,
    modeId:        expedition.modeId,
    sectorId:      expedition.sectorId,
    sectorName:    sName,
    biomeId:       expedition.biomeId,
    completedAt:   new Date().toISOString(),
    steps:         expedition.currentSteps,
    events:        expedition.events,
    rewards,
    combatResults,
    summaryText,
    discovery:     discovery ?? null,
    stratumName:   sector?.stratumName  ?? null,
    depthMeters:   sector?.depthMeters  ?? null,
    lootTier:      sector?.lootTier     ?? null,
  }
}
