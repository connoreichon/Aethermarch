export const ROUTE_SEGMENT_TYPES = {
  APPROACH: 'approach',
  CROSSING: 'crossing',
  LANDMARK: 'landmark',
  DANGER:   'danger',
  REST:     'rest',
  SECRET:   'secret',
  DESCENT:  'descent',
  RETURN:   'return',
}

export function getRouteSegmentTypeLabel(type) {
  const LABELS = {
    approach: 'Aproximación',
    crossing: 'Cruce',
    landmark: 'Referencia',
    danger:   'Zona de peligro',
    rest:     'Zona de descanso',
    secret:   'Tramo secreto',
    descent:  'Descenso',
    return:   'Retorno',
  }
  return LABELS[type] ?? type
}

export function getSegmentsForRoute({ segments, routeId }) {
  return (segments ?? [])
    .filter(seg => seg.routeId === routeId)
    .sort((a, b) => a.order - b.order)
}

export function getVisibleSegmentsForRoute({ segments, route, destinationSectorDiscovered }) {
  if (route?.type === 'secret' && !destinationSectorDiscovered) return []
  return getSegmentsForRoute({ segments, routeId: route?.id })
}

export function getRouteSegmentStepRangeLabel(segment) {
  if (!segment?.stepMin || !segment?.stepMax) return '—'
  return `${segment.stepMin}–${segment.stepMax} pasos`
}

export function getRouteSegmentsTotalSteps(segments) {
  const min = (segments ?? []).reduce((s, seg) => s + (seg.stepMin ?? 0), 0)
  const max = (segments ?? []).reduce((s, seg) => s + (seg.stepMax ?? 0), 0)
  return { min, max }
}

export function getRouteSegmentSummary({ route, segments }) {
  const segs = getSegmentsForRoute({ segments, routeId: route?.id })
  const { min, max } = getRouteSegmentsTotalSteps(segs)
  return {
    count: segs.length,
    totalStepMin: min,
    totalStepMax: max,
    firstSegment: segs[0] ?? null,
  }
}

export function getRouteSegmentDangerLabel(segment) {
  const LABELS = { low: 'Riesgo bajo', medium: 'Riesgo medio', high: 'Riesgo alto' }
  return LABELS[segment?.danger] ?? '—'
}

export function getNextRouteSegment({ segments, routeId, completedSegmentIds }) {
  const ordered = getSegmentsForRoute({ segments, routeId })
  return ordered.find(seg => !(completedSegmentIds ?? []).includes(seg.id)) ?? null
}

export function getRouteProgress({ route, segments, completedSegmentIds }) {
  const ordered   = getSegmentsForRoute({ segments, routeId: route?.id })
  const completed = ordered.filter(seg => (completedSegmentIds ?? []).includes(seg.id))
  return {
    completedCount: completed.length,
    totalCount:     ordered.length,
    isComplete:     ordered.length > 0 && completed.length >= ordered.length,
  }
}

export function isRouteComplete({ route, segments, completedSegmentIds }) {
  return getRouteProgress({ route, segments, completedSegmentIds }).isComplete
}

export function getRouteDestinationSectorId({ route, currentSectorId }) {
  if (!route) return null
  if (route.fromSectorId === currentSectorId) return route.toSectorId
  if (route.toSectorId   === currentSectorId) return route.fromSectorId
  return route.toSectorId ?? null
}

export function getRouteOriginSectorId({ route, currentSectorId }) {
  if (!route) return null
  if (route.fromSectorId === currentSectorId) return route.fromSectorId
  if (route.toSectorId   === currentSectorId) return route.toSectorId
  return route.fromSectorId ?? null
}

export function buildRouteRunState({ route, segments, currentSectorId }) {
  const ordered = getSegmentsForRoute({ segments, routeId: route?.id })
  const first   = ordered[0] ?? null
  return {
    routeId:             route?.id ?? null,
    fromSectorId:        getRouteOriginSectorId({ route, currentSectorId }),
    toSectorId:          getRouteDestinationSectorId({ route, currentSectorId }),
    currentSegmentId:    first?.id ?? null,
    currentSegmentOrder: first?.order ?? 1,
    completedSegmentIds: [],
    totalSegments:       ordered.length,
    completed:           false,
    startedAt:           new Date().toISOString(),
  }
}

export function completeCurrentRouteSegment({ routeRun, route, segments }) {
  if (!routeRun?.currentSegmentId) return routeRun

  const completedSegmentIds = Array.from(new Set([
    ...(routeRun.completedSegmentIds ?? []),
    routeRun.currentSegmentId,
  ]))

  const next = getNextRouteSegment({
    segments,
    routeId: route?.id ?? routeRun.routeId,
    completedSegmentIds,
  })

  return {
    ...routeRun,
    completedSegmentIds,
    currentSegmentId:    next?.id ?? null,
    currentSegmentOrder: next?.order ?? routeRun.currentSegmentOrder,
    completed:           !next,
  }
}
