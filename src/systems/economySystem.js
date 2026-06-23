export const CURRENCY_ID     = 'lanternMarks'
export const CURRENCY_NAME   = 'Marcas de Farol'
export const CURRENCY_SYMBOL = '◈'

const BUY_PRICES = {
  runic_wood:    4,
  aethel_root:   6,
  lumi_leaf:     5,
  arcane_salt:   4,
  tide_crystal:  9,
  nacre_scale:   8,
  forge_mineral: 5,
  resonant_coal: 5,
  ancient_plate: 14,
}

const SHOP_CATALOGS = {
  settlement_aethel_linde:           ['runic_wood', 'aethel_root', 'lumi_leaf'],
  settlement_root_lantern_market:    ['runic_wood', 'aethel_root', 'lumi_leaf', 'arcane_salt', 'tide_crystal'],
  settlement_fogbreak_fort:          ['forge_mineral', 'resonant_coal', 'ancient_plate'],
  settlement_blind_lake_dock:        ['arcane_salt', 'tide_crystal', 'nacre_scale'],
  settlement_dust_gate_caravanserai: ['runic_wood', 'forge_mineral', 'resonant_coal'],
}

export const INN_REST_COST  = 3
export const BASIC_REST_HP  = 10

export function sanitizeLanternMarks(raw) {
  return Math.max(0, Math.floor(typeof raw === 'number' ? raw : 0))
}

export function getPlayerCurrency(player) {
  return sanitizeLanternMarks(player?.lanternMarks)
}

export function canAfford(player, cost) {
  return getPlayerCurrency(player) >= cost
}

export function addCurrency(player, amount) {
  return { ...player, lanternMarks: getPlayerCurrency(player) + Math.max(0, Math.floor(amount)) }
}

export function spendCurrency(player, amount) {
  const current = getPlayerCurrency(player)
  if (current < amount) return null
  return { ...player, lanternMarks: current - amount }
}

export function getResourceBuyPrice(resourceId) {
  return BUY_PRICES[resourceId] ?? 5
}

export function getResourceSellPrice(resourceId) {
  return Math.max(1, Math.floor(getResourceBuyPrice(resourceId) * 0.6))
}

export function buildShopStock(settlementId) {
  const catalog = SHOP_CATALOGS[settlementId] ?? ['runic_wood', 'aethel_root']
  return catalog.map(id => ({
    resourceId: id,
    qty:        5,
    buyPrice:   getResourceBuyPrice(id),
    sellPrice:  getResourceSellPrice(id),
  }))
}

export function buyShopItem({ player, inventory, resourceId, qty = 1 }) {
  const price     = getResourceBuyPrice(resourceId) * qty
  const newPlayer = spendCurrency(player, price)
  if (!newPlayer) return { ok: false, reason: 'Fondos insuficientes' }
  return {
    ok:        true,
    player:    newPlayer,
    inventory: { ...inventory, [resourceId]: (inventory[resourceId] ?? 0) + qty },
  }
}

export function sellInventoryItem({ player, inventory, resourceId, qty = 1 }) {
  const current = inventory[resourceId] ?? 0
  if (current < qty) return { ok: false, reason: 'No tienes suficiente' }
  const price = getResourceSellPrice(resourceId) * qty
  return {
    ok:        true,
    player:    addCurrency(player, price),
    inventory: { ...inventory, [resourceId]: current - qty },
  }
}

export function resolveSettlementRest({ player, settlement }) {
  const services = settlement?.services ?? []
  const hasInn   = services.includes('inn') || services.includes('rest')
  const hasBasic = services.includes('basic_rest') || services.includes('rest_limited') || services.includes('refuge')

  if (!hasInn && !hasBasic) return { ok: false, reason: 'No hay servicio de descanso' }
  if (player.hp >= player.maxHp) return { ok: false, reason: 'La caravana ya está en plena forma' }

  if (hasInn) {
    const hpGain = player.maxHp - player.hp
    if (!canAfford(player, INN_REST_COST)) {
      return { ok: false, reason: `Necesitas ${INN_REST_COST} ◈ para descansar en posada` }
    }
    return { ok: true, hpGain, cost: INN_REST_COST }
  }

  return { ok: true, hpGain: Math.min(BASIC_REST_HP, player.maxHp - player.hp), cost: 0 }
}
