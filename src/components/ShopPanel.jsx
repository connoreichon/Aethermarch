import { RESOURCES } from '../data/gameData.js'
import {
  getPlayerCurrency, CURRENCY_SYMBOL,
  buildShopStock, getResourceSellPrice,
} from '../systems/economySystem.js'
import ResourceNode from './tokens/ResourceNode.jsx'

export default function ShopPanel({ settlement, player, inventory, canShop, onBuy, onSell }) {
  const stock    = buildShopStock(settlement.id)
  const currency = getPlayerCurrency(player)

  const hasInventory = Object.values(inventory ?? {}).some(q => q > 0)

  return (
    <div className="shop-panel">
      <div className="shop-panel-currency">
        <span className="shop-currency-symbol">{CURRENCY_SYMBOL}</span>
        <span className="shop-currency-amount">{currency}</span>
        <span className="shop-currency-name">Marcas de Farol</span>
      </div>

      <div className="shop-section">
        <div className="shop-section-title">Comprar</div>
        {stock.map(({ resourceId, buyPrice }) => {
          const res    = RESOURCES[resourceId]
          const canBuy = canShop && currency >= buyPrice
          if (!res) return null
          return (
            <div key={resourceId} className="shop-item-row">
              <ResourceNode resourceId={resourceId} size={28} />
              <div className="shop-item-info">
                <div className="shop-item-name">{res.name}</div>
                <div className="shop-item-price">{CURRENCY_SYMBOL} {buyPrice}</div>
              </div>
              <button
                className="btn btn-secondary shop-item-btn"
                disabled={!canBuy}
                onClick={() => onBuy({ resourceId, qty: 1 })}
              >
                Comprar
              </button>
            </div>
          )
        })}
      </div>

      <div className="shop-section">
        <div className="shop-section-title">Vender</div>
        {hasInventory ? (
          Object.entries(inventory ?? {}).map(([resourceId, qty]) => {
            if (qty === 0) return null
            const res       = RESOURCES[resourceId]
            const sellPrice = getResourceSellPrice(resourceId)
            if (!res) return null
            return (
              <div key={resourceId} className="shop-item-row">
                <ResourceNode resourceId={resourceId} size={28} />
                <div className="shop-item-info">
                  <div className="shop-item-name">
                    {res.name} <span style={{ opacity: 0.55 }}>×{qty}</span>
                  </div>
                  <div className="shop-item-price" style={{ color: 'var(--color-gold)' }}>
                    {CURRENCY_SYMBOL} {sellPrice}
                  </div>
                </div>
                <button
                  className="btn btn-secondary shop-item-btn"
                  disabled={!canShop}
                  style={{ borderColor: 'var(--color-gold)', color: 'var(--color-gold)' }}
                  onClick={() => onSell({ resourceId, qty: 1 })}
                >
                  Vender
                </button>
              </div>
            )
          })
        ) : (
          <div className="empty-state" style={{ fontSize: '0.72rem' }}>
            Sin materiales para vender.
          </div>
        )}
      </div>
    </div>
  )
}
