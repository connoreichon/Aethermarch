import { ENEMIES, RESOURCES } from '../data/gameData.js'

const DANGER_LABELS = { low: 'bajo', medium: 'medio', high: 'alto', extreme: 'extremo' }

// ── Riesgo base por modo ──────────────────────────────────────────────────────

const MODE_RISK = {
  free_march: {
    level:       'medio',
    label:       'Riesgo equilibrado',
    description: 'La senda mezcla hallazgos, rastros y amenazas con equilibrio.',
  },
  hunt: {
    level:       'alto',
    label:       'Riesgo alto',
    description: 'La caravana sigue señales hostiles. Más combates, más experiencia.',
  },
  gather: {
    level:       'bajo',
    label:       'Riesgo bajo',
    description: 'La marcha avanza despacio para recoger materiales. Menos enfrentamientos.',
  },
  explore: {
    level:       'incierto',
    label:       'Riesgo incierto',
    description: 'La niebla guarda rutas, secretos y peligros sin clasificar.',
  },
  custom: {
    level:       'incierto',
    label:       'Riesgo incierto',
    description: 'Modo personalizado aún en preparación.',
  },
}

export function getRiskLevel({ modeId, sector }) {
  const base            = MODE_RISK[modeId] ?? MODE_RISK.free_march
  const sectorHighThreat = sector?.threat === 'high'

  if (sectorHighThreat && base.level !== 'alto') {
    return {
      ...base,
      description: base.description + ' El sector es conocido por sus rastros hostiles.',
    }
  }
  return base
}

// ── Hallazgos esperados por modo ──────────────────────────────────────────────

const MODE_RESOURCE_FREQ = {
  gather:     'muy probable en Recolección',
  free_march: 'posible hallazgo',
  explore:    'secundario en Exploración',
  hunt:       'ocasional en Caza',
  custom:     'posible hallazgo',
}

const MODE_EVENTS = {
  hunt:       ['rastros hostiles', 'amenazas', 'combate', 'reacciones de criatura'],
  gather:     ['hallazgos de recursos', 'atmósfera', 'reacciones de criatura'],
  explore:    ['sendas reveladas', 'exploración', 'recursos', 'reacciones de criatura'],
  free_march: ['recursos', 'sendas', 'reacciones de criatura', 'posibles amenazas'],
  custom:     ['variado'],
}

const MODE_XP = {
  hunt:       'media a alta — combates frecuentes',
  gather:     'baja — pocos enfrentamientos',
  explore:    'baja a media — rutas y descubrimientos',
  free_march: 'baja a media — equilibrado',
  custom:     'variable',
}

export function getExpectedFinds({ sector, biome, modeId }) {
  const pool      = sector?.resources ?? biome?.resourceIds ?? []
  const freq      = MODE_RESOURCE_FREQ[modeId] ?? 'posible hallazgo'
  const resources = pool.map(id => ({ id, freq }))
  const events    = MODE_EVENTS[modeId] ?? MODE_EVENTS.free_march
  const xpLabel   = MODE_XP[modeId] ?? 'baja a media'

  return {
    resources,
    events,
    xpLabel,
    masteryLabel: 'progreso ligero de dominio',
  }
}

// ── Avisos de preparación ─────────────────────────────────────────────────────

export function getPreparationWarnings({ player, sector, modeId }) {
  const warnings = []
  const hpThreshold = Math.floor((player?.maxHp ?? 30) / 3)
  if ((player?.hp ?? 30) <= hpThreshold) {
    warnings.push('La caravana está muy debilitada. Considera esperar antes de partir.')
  }
  if (modeId === 'hunt' && sector?.threat === 'low') {
    warnings.push('En este sector tranquilo, la Caza puede dar pocos resultados.')
  }
  return warnings
}

// ── Pistas de criatura y arquetipo ────────────────────────────────────────────

const CREATURE_HINTS = {
  velthar: 'Velthar puede revelar rastros ocultos y sendas entre la niebla.',
  brontik: 'Brontik reducirá parte del daño si la marcha se tuerce.',
  lumora:  'Lúmora mejora la obtención de materiales durante la jornada.',
}

const ARCHETYPE_HINTS = {
  guardian:   'El Guardián del Camino resiste mejor los golpes si aparece una amenaza.',
  runario:    'El Runario Errante percibe señales antiguas que otros pasarían por alto.',
  rastreador: 'El Rastreador de Bruma puede abrir rutas que otros no ven.',
}

const MODE_LABELS_PREP = {
  free_march: 'Marcha Libre',
  hunt:       'Caza',
  gather:     'Recolección',
  explore:    'Exploración',
  custom:     'Personalizada',
}

// ── Función principal ─────────────────────────────────────────────────────────

export function getExpeditionPreparation({ modeId, sector, biome, creature, archetype }) {
  const risk     = getRiskLevel({ modeId, sector })
  const expected = getExpectedFinds({ sector, biome, modeId })

  const routeLabel = sector
    ? `${sector.name} · ${biome?.name ?? sector.biomeId}`
    : 'Destino desconocido'

  const enemyNames    = (sector?.enemyPool ?? []).map(id => ENEMIES[id]?.name).filter(Boolean)
  const resourceNames = (sector?.resources ?? biome?.resourceIds ?? []).map(id => RESOURCES[id]?.name).filter(Boolean)

  const stratumInfo = sector?.stratumName ? {
    stratumName:   sector.stratumName,
    depthMeters:   sector.depthMeters  ?? null,
    lootTier:      sector.lootTier     ?? 1,
    dangerRank:    sector.dangerRank   ?? 'low',
    dangerLabel:   DANGER_LABELS[sector.dangerRank] ?? 'bajo',
    enemyNames,
    resourceNames,
  } : null

  return {
    routeLabel,
    modeLabel:     MODE_LABELS_PREP[modeId] ?? 'Marcha Libre',
    risk,
    expected,
    creatureHint:  CREATURE_HINTS[creature?.id]   ?? creature?.passiveDescription ?? '',
    archetypeHint: ARCHETYPE_HINTS[archetype?.id] ?? archetype?.passiveDescription ?? '',
    stratumInfo,
  }
}
