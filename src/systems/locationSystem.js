// Mapeo sector → asentamiento principal (usado para posicionar el marcador en el mapa)
const SECTOR_SETTLEMENT_MAP = {
  'sector_aethel_edge':       'settlement_aethel_linde',
  'sector_mist_root':         'settlement_root_lantern_market',
  'sector_runic_guard_ruins': 'settlement_fogbreak_fort',
  'sector_salt_beacon':       'settlement_blind_lake_dock',
}

export function createInitialLocation() {
  return {
    type:         'sector',
    sectorId:     'sector_aethel_edge',
    settlementId: 'settlement_aethel_linde',
    routeId:      null,
    segmentId:    null,
    label:        'Linde de Aethel',
    updatedAt:    new Date().toISOString(),
  }
}

export function getLocationLabel(location) {
  if (!location) return 'Ubicación desconocida'
  return location.label ?? 'Ubicación desconocida'
}

export function buildLocationFromSector(sector) {
  if (!sector) return createInitialLocation()
  return {
    type:         'sector',
    sectorId:     sector.id,
    settlementId: SECTOR_SETTLEMENT_MAP[sector.id] ?? null,
    routeId:      null,
    segmentId:    null,
    label:        sector.name,
    updatedAt:    new Date().toISOString(),
  }
}

export function buildLocationFromRouteDestination({ routeRun, sectors }) {
  if (!routeRun?.toSectorId) return createInitialLocation()
  const sector = sectors?.find(s => s.id === routeRun.toSectorId)
  return {
    type:         'sector',
    sectorId:     routeRun.toSectorId,
    settlementId: SECTOR_SETTLEMENT_MAP[routeRun.toSectorId] ?? null,
    routeId:      null,
    segmentId:    null,
    label:        sector?.name ?? routeRun.toSectorId,
    updatedAt:    new Date().toISOString(),
  }
}

export function sanitizeLocation(raw, sectors) {
  if (!raw || typeof raw !== 'object') return null
  if (!raw.sectorId) return null
  const sector = sectors?.find(s => s.id === raw.sectorId)
  return {
    type:         raw.type ?? 'sector',
    sectorId:     raw.sectorId,
    settlementId: raw.settlementId ?? SECTOR_SETTLEMENT_MAP[raw.sectorId] ?? null,
    routeId:      raw.routeId ?? null,
    segmentId:    raw.segmentId ?? null,
    label:        raw.label ?? sector?.name ?? raw.sectorId,
    updatedAt:    raw.updatedAt ?? new Date().toISOString(),
  }
}
