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
