import { getResourceBuyPrice } from './economySystem.js'

export const ROUTE_STOPS = {
  stop_old_bark_refuge: {
    id:          'stop_old_bark_refuge',
    name:        'Refugio del Tronco Antiguo',
    type:        'refuge',
    description: 'Las raíces curvadas forman una cámara natural. Huele a resina y tierra húmeda. Hay marcas de paradas anteriores talladas en la madera.',
    services:    ['basic_rest', 'rumors'],
    rumors: [
      'Alguien dejó aquí una cantimplora vacía. No hay marcas de a quién pertenecía.',
      'Las raíces chirrían cuando llueve en las capas superiores. Significa que el agua baja.',
      'Una caravana pasó hace dos días con prisa. No pararon.',
    ],
  },
  stop_broken_lantern_post: {
    id:          'stop_broken_lantern_post',
    name:        'Puesto del Farol Roto',
    type:        'supply_post',
    description: 'Un farol oxidado cuelga de un clavo en la roca. Alguien instaló una repisa de madera para dejar provisiones de paso.',
    services:    ['trader', 'route_info'],
    rumors: [
      'La grieta que hay más abajo huele a aceite quemado. Nadie sabe por qué.',
      'Las caravanas que toman el paso este llegan más rápido, pero con más bajas.',
    ],
  },
  stop_three_nails_camp: {
    id:          'stop_three_nails_camp',
    name:        'Campamento de los Tres Clavos',
    type:        'camp',
    description: 'Tres clavos enormes están clavados en la roca a modo de marcadores. Entre ellos hay restos de un campamento viejo: ceniza fría, una lona rasgada.',
    services:    ['basic_rest', 'trader'],
    rumors: [
      'Los clavos son de una expedición que no regresó. Nadie los ha quitado.',
      'El viento aquí viene de abajo. Viene del nivel cuatro.',
    ],
  },
}

const ROUTE_STOP_CATALOG = {
  stop_broken_lantern_post: ['runic_wood', 'lumi_leaf', 'arcane_salt'],
  stop_three_nails_camp:    ['aethel_root', 'runic_wood'],
}

export const BASIC_REST_STOP_HP = 10

export function getRouteStopById(id) {
  return ROUTE_STOPS[id] ?? null
}

export function getRouteStopForSegment(segment) {
  return segment?.routeStopId ? getRouteStopById(segment.routeStopId) : null
}

export function hasRouteStop(segment) {
  return Boolean(segment?.routeStopId)
}

export function canUseRouteStopService(stop, service) {
  return (stop?.services ?? []).includes(service)
}

export function resolveRouteStopRest(player, stop) {
  if (!canUseRouteStopService(stop, 'basic_rest') && !canUseRouteStopService(stop, 'rest')) {
    return { ok: false, reason: 'Sin servicio de descanso aquí' }
  }
  if ((player?.hp ?? 0) >= (player?.maxHp ?? 1)) {
    return { ok: false, reason: 'La caravana ya está en plena forma' }
  }
  const hpGain = Math.min(BASIC_REST_STOP_HP, (player?.maxHp ?? 0) - (player?.hp ?? 0))
  return { ok: true, hpGain, cost: 0 }
}

export function buildRouteStopShopStock(stopId) {
  const catalog = ROUTE_STOP_CATALOG[stopId] ?? []
  return catalog.map(id => ({
    resourceId: id,
    qty:        3,
    buyPrice:   getResourceBuyPrice(id),
  }))
}

export function getRouteStopRumor(stop) {
  const rumors = stop?.rumors ?? []
  if (!rumors.length) return null
  return rumors[Math.floor(Math.random() * rumors.length)]
}
