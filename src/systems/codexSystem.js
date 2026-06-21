import { ABYSS_STRATA, RESOURCES, ENEMIES, CREATURES, POIS } from '../data/gameData.js'

const DANGER_LABELS  = { low: 'Bajo', medium: 'Medio', high: 'Alto', extreme: 'Extremo' }
const BIOME_NAMES    = { forest: 'Bosque Rúnico', coast: 'Costa Arcana', forge: 'Forja Arcanista' }
const THREAT_LABELS  = { low: 'Baja', medium: 'Media', high: 'Alta' }
const RARITY_LABELS  = { comun: 'Común', poco_comun: 'Poco común', raro: 'Raro' }
const MASTERY_LABELS = ['Sin rastro', 'Conocido', 'Familiar', 'Dominado', 'Legendario']

const FOG_DESC   = 'La expedición no ha registrado datos suficientes.'
const FOG_SECTOR = 'La expedición no ha cartografiado esta zona.'
const FOG_ENEMY  = 'La expedición no ha registrado datos de esta amenaza.'
const FOG_RES    = 'Aún no hay datos suficientes en el códice.'
const FOG_POI    = 'La expedición no ha registrado este lugar.'
const FOG_CREATURE = 'Esta criatura aún no ha sido observada.'

// ── Helper de inventario ──────────────────────────────────────────────────────
// Soporta inventario plano { runic_wood: 2 } e inventario con items { items: { runic_wood: 2 } }

function getInventoryQty(inventory, resourceId) {
  if (!inventory) return 0
  if (typeof inventory[resourceId] === 'number') return inventory[resourceId]
  if (typeof inventory.items?.[resourceId] === 'number') return inventory.items[resourceId]
  return 0
}

// ── Predicados de descubrimiento ─────────────────────────────────────────────

export function isStratumDiscovered(stratumId, sectors) {
  return (sectors ?? []).some(s => (s.stratumId ?? 'stratum_01') === stratumId && s.discovered)
}

export function isSectorDiscovered(sectorId, sectors) {
  return (sectors ?? []).some(s => s.id === sectorId && s.discovered)
}

export function isResourceDiscovered(resourceId, inventory, diary) {
  if (getInventoryQty(inventory, resourceId) > 0) return true
  for (const entry of (diary ?? [])) {
    if (entry.rewards?.resources?.[resourceId]) return true
    for (const ev of (entry.events ?? [])) {
      if (ev.resourceId === resourceId) return true
    }
  }
  return false
}

export function isEnemyDiscovered(enemyId, diary) {
  for (const entry of (diary ?? [])) {
    if ((entry.combatResults ?? []).some(c => c.enemyId === enemyId)) return true
    if ((entry.events ?? []).some(e => e.type === 'threat' && e.enemyId === enemyId)) return true
  }
  return false
}

// ── Estado inicial del Códice ─────────────────────────────────────────────────
// El Códice se deriva del estado del juego — no necesita guardarse por separado.
// createCodexState / sanitizeCodexState existen para compatibilidad futura.

export function createCodexState() {
  return { version: 1 }
}

export function sanitizeCodexState(raw) {
  if (!raw || typeof raw !== 'object') return createCodexState()
  return { version: 1 }
}

// ── Constructor de entradas ───────────────────────────────────────────────────

export function buildCodexEntries({ player, sectors, inventory, diary }) {
  const entries = []

  // ─ Estratos ─────────────────────────────────────────────────────────────────
  for (const stratum of ABYSS_STRATA) {
    const discovered  = isStratumDiscovered(stratum.id, sectors)
    const inStratum   = (sectors ?? []).filter(s => (s.stratumId ?? 'stratum_01') === stratum.id)
    const found       = inStratum.filter(s => s.discovered).length
    entries.push({
      id:          `stratum_${stratum.id}`,
      category:    'strata',
      name:        discovered ? stratum.name : '????',
      discovered,
      subtitle:    discovered ? `${stratum.depthRange} · Loot T${stratum.lootTier}` : 'Estrato no cartografiado',
      description: discovered ? stratum.theme : FOG_DESC,
      meta:        discovered ? [
        `Peligro: ${DANGER_LABELS[stratum.dangerRank] ?? stratum.dangerRank}`,
        `Sectores cartografiados: ${found} / ${inStratum.length}`,
      ] : [],
    })
  }

  // ─ Sectores ──────────────────────────────────────────────────────────────────
  for (const sector of (sectors ?? [])) {
    const discovered = sector.discovered
    entries.push({
      id:          `sector_${sector.id}`,
      category:    'sectors',
      name:        discovered ? sector.name : '????',
      discovered,
      subtitle:    discovered ? (sector.stratumName ?? '—') : 'Zona en bruma',
      description: discovered
        ? (BIOME_NAMES[sector.biomeId] ?? sector.biomeId) + (sector.depthMeters ? ` · ${sector.depthMeters} m` : '')
        : FOG_SECTOR,
      meta: discovered ? [
        ...(sector.secret            ? ['Secreto descubierto']                                                               : []),
        ...(sector.threat            ? [`Amenaza: ${THREAT_LABELS[sector.threat]  ?? sector.threat}`]                     : []),
        ...(sector.visits > 0        ? [`Visitas: ${sector.visits}`]                                                        : []),
        ...(sector.masteryLevel != null ? [`Dominio: ${MASTERY_LABELS[sector.masteryLevel] ?? '—'}`]                      : []),
        ...(sector.poiId             ? [`Lugar: ${POIS[sector.poiId]?.name ?? sector.poiId}`]                               : []),
      ] : [],
    })
  }

  // ─ Recursos ──────────────────────────────────────────────────────────────────
  for (const [rid, res] of Object.entries(RESOURCES)) {
    const discovered = isResourceDiscovered(rid, inventory, diary)
    const qty        = getInventoryQty(inventory, rid)
    entries.push({
      id:          `resource_${rid}`,
      category:    'resources',
      name:        discovered ? res.name : '????',
      discovered,
      subtitle:    discovered ? `Material · ${BIOME_NAMES[res.biomeId] ?? res.biomeId}` : 'Recurso no registrado',
      description: discovered ? res.utility : FOG_RES,
      meta:        discovered ? [
        qty > 0 ? `En inventario: ${qty}` : 'No en inventario',
        `Rareza: ${RARITY_LABELS[res.rarity] ?? res.rarity}`,
      ] : [],
    })
  }

  // ─ Enemigos ───────────────────────────────────────────────────────────────────
  for (const [eid, enemy] of Object.entries(ENEMIES)) {
    const discovered = isEnemyDiscovered(eid, diary)
    const timesFound = (diary ?? []).reduce((acc, entry) =>
      acc + (entry.combatResults ?? []).filter(c => c.enemyId === eid).length, 0)
    entries.push({
      id:          `enemy_${eid}`,
      category:    'enemies',
      name:        discovered ? enemy.name : '????',
      discovered,
      subtitle:    discovered ? 'Amenaza conocida' : 'Amenaza no registrada',
      description: discovered ? enemy.concept : FOG_ENEMY,
      meta:        discovered ? [
        ...(timesFound > 0 ? [`Encuentros en combate: ${timesFound}`] : ['Observada, no derrotada']),
        ...(enemy.biomeIds?.length ? [`Biomas: ${enemy.biomeIds.map(b => BIOME_NAMES[b] ?? b).join(', ')}`] : []),
      ] : [],
    })
  }

  // ─ Criaturas ─────────────────────────────────────────────────────────────────
  for (const creature of CREATURES) {
    const isOwned    = creature.id === player?.creatureId
    const discovered = isOwned
    entries.push({
      id:          `creature_${creature.id}`,
      category:    'creatures',
      name:        discovered ? creature.name : '????',
      discovered,
      subtitle:    discovered ? creature.role : 'Criatura no registrada',
      description: discovered ? creature.description : FOG_CREATURE,
      meta:        discovered ? [
        `Pasiva: ${creature.passiveName}`,
        creature.passiveDescription,
        ...(isOwned ? ['Compañera actual de expedición'] : []),
      ] : [],
    })
  }

  // ─ Puntos de interés ─────────────────────────────────────────────────────────
  const discoveredPoiIds = new Set(
    (sectors ?? []).filter(s => s.discovered && s.poiId).map(s => s.poiId)
  )
  for (const [poiId, poi] of Object.entries(POIS)) {
    const discovered    = discoveredPoiIds.has(poiId)
    const sectorWithPoi = (sectors ?? []).find(s => s.poiId === poiId && s.discovered)
    entries.push({
      id:          `poi_${poiId}`,
      category:    'pois',
      name:        discovered ? poi.name : '????',
      discovered,
      subtitle:    discovered
        ? (sectorWithPoi ? `En ${sectorWithPoi.name}` : 'Localización conocida')
        : 'Lugar no cartografiado',
      description: discovered ? poi.description : FOG_POI,
      meta:        discovered && sectorWithPoi ? [
        sectorWithPoi.stratumName ?? '—',
      ] : [],
    })
  }

  return entries
}

// ── Progreso global ───────────────────────────────────────────────────────────

export function getCodexProgress(entries) {
  const total      = entries.length
  const discovered = entries.filter(e => e.discovered).length
  return { total, discovered }
}
