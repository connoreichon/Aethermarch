// ── Consultas básicas ─────────────────────────────────────────────────────────

export function getDiscoveredSectors(sectors) {
  return sectors.filter(s => s.discovered)
}

export function getHiddenConnectedSectors(sectors, currentSectorId) {
  const current = sectors.find(s => s.id === currentSectorId)
  if (!current) return []
  return sectors.filter(s => !s.discovered && (current.connections ?? []).includes(s.id))
}

export function calculateMasteryLevel(mastery) {
  if (mastery >= 100) return 4
  if (mastery >= 50)  return 3
  if (mastery >= 25)  return 2
  if (mastery >= 10)  return 1
  return 0
}

export function revealSector(sectors, sectorId) {
  return sectors.map(s =>
    s.id === sectorId ? { ...s, discovered: true, recentlyDiscovered: true } : s
  )
}

// ── Textos de descubrimiento ──────────────────────────────────────────────────

const DISCOVERY_TEXTS = {
  explore:    name => `La niebla cedió al final del tramo. La caravana encontró el acceso a ${name}.`,
  free_march: name => `Un hallazgo de senda reveló el camino hacia ${name}. La bruma retrocedió.`,
  gather:     name => `Entre los senderos de recolección, la caravana encontró un paso hacia ${name}.`,
  hunt:       name => `La persecución de rastros llevó a la caravana hasta ${name}.`,
}

// ── Resolver descubrimiento ───────────────────────────────────────────────────

export function resolveSectorDiscovery({ sectors, currentSectorId, modeId, events, masteryGain }) {
  const currentSector = sectors.find(s => s.id === currentSectorId)
  if (!currentSector) return { sectors, discovery: null }

  const hidden = getHiddenConnectedSectors(sectors, currentSectorId)
  if (!hidden.length) return { sectors, discovery: null }

  const explorationCount = events.filter(e => e.type === 'exploration').length
  const oldMastery       = currentSector.mastery ?? 0
  const crossedMastery   = oldMastery < 25 && (oldMastery + (masteryGain ?? 0)) >= 25

  let shouldDiscover = false

  if (modeId === 'explore'    && explorationCount >= 1) shouldDiscover = true
  if (modeId === 'free_march' && explorationCount >= 2) shouldDiscover = true
  if (modeId === 'gather'     && explorationCount >= 2) shouldDiscover = true
  if (modeId === 'hunt'       && explorationCount >= 3) shouldDiscover = true
  if (crossedMastery)                                   shouldDiscover = true

  if (!shouldDiscover) return { sectors, discovery: null }

  const target     = hidden[0]
  const newSectors = revealSector(sectors, target.id)

  const textFn = DISCOVERY_TEXTS[modeId] ?? (name => `La caravana encontró el acceso a ${name} al final del tramo.`)
  const text   = crossedMastery && !DISCOVERY_TEXTS[modeId]
    ? `El dominio acumulado en la zona abrió el camino hacia ${target.name}.`
    : textFn(target.name)

  const reason = crossedMastery ? 'Dominio acumulado'
    : modeId === 'explore'       ? 'Modo Exploración'
    :                              'Sendas descubiertas'

  return {
    sectors: newSectors,
    discovery: {
      sectorId:   target.id,
      sectorName: target.name,
      biomeId:    target.biomeId,
      reason,
      text,
    },
  }
}

// ── Limpiar marcas recientes ──────────────────────────────────────────────────

export function clearRecentDiscoveries(sectors) {
  return sectors.map(s => s.recentlyDiscovered ? { ...s, recentlyDiscovered: false } : s)
}
