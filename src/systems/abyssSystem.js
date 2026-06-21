import { ABYSS_STRATA } from '../data/gameData.js'

// Fallback para saves que no tienen campos de Abismo aún
const SECTOR_FALLBACK = {
  sector_aethel_edge:    { stratumId: 'stratum_01', stratumName: 'Estrato I · Linde de Raíz',    depth: 1, depthMeters: 120, abyssRing: 1, spiralOrder: 1, lootTier: 1, dangerRank: 'low'    },
  sector_mist_root:      { stratumId: 'stratum_01', stratumName: 'Estrato I · Linde de Raíz',    depth: 1, depthMeters: 180, abyssRing: 1, spiralOrder: 2, lootTier: 1, dangerRank: 'medium' },
  sector_salt_beacon:    { stratumId: 'stratum_02', stratumName: 'Estrato II · Cornisa Salina',   depth: 2, depthMeters: 340, abyssRing: 2, spiralOrder: 3, lootTier: 2, dangerRank: 'medium' },
  sector_tide_rock:      { stratumId: 'stratum_02', stratumName: 'Estrato II · Cornisa Salina',   depth: 2, depthMeters: 410, abyssRing: 2, spiralOrder: 4, lootTier: 2, dangerRank: 'high'   },
  sector_sleeping_forge: { stratumId: 'stratum_03', stratumName: 'Estrato III · Forjas Hundidas', depth: 3, depthMeters: 690, abyssRing: 3, spiralOrder: 5, lootTier: 3, dangerRank: 'high'   },
  sector_coal_bastion:   { stratumId: 'stratum_03', stratumName: 'Estrato III · Forjas Hundidas', depth: 3, depthMeters: 760, abyssRing: 3, spiralOrder: 6, lootTier: 3, dangerRank: 'medium' },
}

const DEFAULT_META = { stratumId: 'stratum_01', stratumName: 'Estrato I · Linde de Raíz', depth: 1, depthMeters: 120, abyssRing: 1, spiralOrder: 1, lootTier: 1, dangerRank: 'low' }

const DANGER_LABELS = { low: 'Bajo', medium: 'Medio', high: 'Alto', extreme: 'Extremo' }
const LOOT_TIER_LABELS = { 1: 'Tier I', 2: 'Tier II', 3: 'Tier III', 4: 'Tier IV', 5: 'Tier V' }

// Enriquece un sector con metadatos de Abismo si le faltan (fallback para saves antiguos)
export function getSectorAbyssInfo(sector) {
  if (!sector) return { ...DEFAULT_META }
  if (sector.stratumId) return sector
  const fb = SECTOR_FALLBACK[sector.id] ?? DEFAULT_META
  return { ...fb, ...sector }
}

export function getStratumById(stratumId) {
  return ABYSS_STRATA.find(s => s.id === stratumId) ?? ABYSS_STRATA[0]
}

export function getDepthLabel(depthMeters) {
  if (depthMeters == null) return '—'
  return `${depthMeters} m`
}

export function getLootTierLabel(lootTier) {
  return LOOT_TIER_LABELS[lootTier] ?? `Tier ${lootTier ?? 1}`
}

export function getDangerRankLabel(dangerRank) {
  return DANGER_LABELS[dangerRank] ?? 'Desconocido'
}

// Cuántos sectores de ese estrato están descubiertos sobre el total
export function getStratumProgress(sectors, stratumId) {
  const inStratum  = sectors.filter(s => (s.stratumId ?? 'stratum_01') === stratumId)
  const discovered = inStratum.filter(s => s.discovered)
  return { total: inStratum.length, discovered: discovered.length }
}

// Lista de estratos conocidos (al menos un sector descubierto)
export function getKnownStrata(sectors) {
  const ids = new Set(sectors.filter(s => s.discovered).map(s => s.stratumId ?? 'stratum_01'))
  return ABYSS_STRATA.filter(st => ids.has(st.id))
}

// Pool de enemigos del sector, con fallback al estrato y luego al default
export function getSectorEnemyPool(sector) {
  if (sector?.enemyPool?.length) return sector.enemyPool
  const meta    = getSectorAbyssInfo(sector)
  const stratum = getStratumById(meta.stratumId)
  return stratum?.enemyPool ?? ['runic_raider']
}

// Pool de recursos del sector, con fallback al estrato y luego al default
export function getSectorLootPool(sector) {
  if (sector?.resources?.length) return sector.resources
  const meta    = getSectorAbyssInfo(sector)
  const stratum = getStratumById(meta.stratumId)
  return stratum?.resourcePool ?? ['runic_wood']
}
