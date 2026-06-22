export const ROUTE_TYPES = {
  MAIN:      'main',
  SAFE:      'safe',
  DANGEROUS: 'dangerous',
  SECRET:    'secret',
  LOCKED:    'locked',
  DESCENT:   'descent',
  RETURN:    'return',
  SHORTCUT:  'shortcut',
}

export const ROUTE_STATUS = {
  OPEN:       'open',
  HIDDEN:     'hidden',
  LOCKED:     'locked',
  DISCOVERED: 'discovered',
}

export function getRouteTypeLabel(type) {
  const LABELS = {
    main:      'Ruta principal',
    safe:      'Ruta segura',
    dangerous: 'Ruta peligrosa',
    secret:    'Ruta secreta',
    locked:    'Ruta bloqueada',
    descent:   'Ruta de descenso',
    return:    'Ruta de retorno',
    shortcut:  'Atajo',
  }
  return LABELS[type] ?? type
}

export function getRouteStatusLabel(status) {
  const LABELS = {
    open:       'Abierta',
    hidden:     'Oculta',
    locked:     'Bloqueada',
    discovered: 'Descubierta',
  }
  return LABELS[status] ?? status
}

export function getRouteDangerLabel(route) {
  const LABELS = { low: 'Riesgo bajo', medium: 'Riesgo medio', high: 'Riesgo alto' }
  return LABELS[route?.danger] ?? '—'
}

export function getRouteStepRangeLabel(route) {
  if (!route?.stepMin || !route?.stepMax) return '—'
  return `${route.stepMin}–${route.stepMax} pasos`
}

export function getRoutesFromSector({ routes, sectorId }) {
  return (routes ?? []).filter(
    r => r.fromSectorId === sectorId || r.toSectorId === sectorId
  )
}

export function getVisibleRoutesFromSector({ routes, sectorId, player, sectors, contractState }) {
  const all = getRoutesFromSector({ routes, sectorId })
  return all.filter(r =>
    r.status === ROUTE_STATUS.OPEN ||
    r.status === ROUTE_STATUS.DISCOVERED
  )
}

export function canUseRoute({ route, player, sectors, contractState }) {
  if (!route) return false
  if (route.status === ROUTE_STATUS.LOCKED) return false
  if (route.status === ROUTE_STATUS.HIDDEN) return false
  return true
}

export function getWorldScaleSummary({ sectors, routes, zones, strata }) {
  const discoveredSectorCount = (sectors ?? []).filter(s => s.discovered).length
  const visibleRouteCount = (routes ?? []).filter(
    r => r.status === ROUTE_STATUS.OPEN || r.status === ROUTE_STATUS.DISCOVERED
  ).length
  const maxDepthMeters = Math.max(0, ...(sectors ?? []).map(s => s.depthMeters ?? 0))

  return {
    knownStrataCount:     (strata ?? []).length,
    zoneCount:            (zones ?? []).length,
    routeCount:           (routes ?? []).length,
    visibleRouteCount,
    sectorCount:          (sectors ?? []).length,
    discoveredSectorCount,
    maxDepthMeters,
  }
}
