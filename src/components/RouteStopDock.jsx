import { useState } from 'react'
import {
  getResourceBuyPrice, getResourceSellPrice, CURRENCY_SYMBOL, canAfford,
} from '../systems/economySystem.js'
import {
  buildRouteStopShopStock, canUseRouteStopService, getRouteStopRumor,
} from '../systems/routeStopSystem.js'
import { RESOURCES } from '../data/gameData.js'

const TYPE_LABEL = {
  refuge:      'Refugio',
  supply_post: 'Puesto de suministros',
  camp:        'Campamento',
  wandering:   'Mercader ambulante',
}

export default function RouteStopDock({
  routeStop,
  player,
  inventory,
  onRest,
  onBuy,
  onSell,
  onContinue,
  onDismiss,
}) {
  const [minimized,  setMinimized]  = useState(false)
  const [activeTab,  setActiveTab]  = useState('info')
  const [restMsg,    setRestMsg]    = useState(null)
  const [tradeMsg,   setTradeMsg]   = useState(null)
  const [shownRumor, setShownRumor] = useState(null)

  if (!routeStop) return null

  const services  = routeStop.services ?? []
  const hasRest   = canUseRouteStopService(routeStop, 'basic_rest') || canUseRouteStopService(routeStop, 'rest')
  const hasTrader = canUseRouteStopService(routeStop, 'trader') || canUseRouteStopService(routeStop, 'supply')
  const hasRumors = canUseRouteStopService(routeStop, 'rumors') || canUseRouteStopService(routeStop, 'route_info')
  const shopStock = hasTrader ? buildRouteStopShopStock(routeStop.id) : []
  const hpFull    = (player?.hp ?? 0) >= (player?.maxHp ?? 1)
  const currency  = player?.lanternMarks ?? 0

  const tabs = [
    { id: 'info',   label: 'Parada' },
    hasRest   && { id: 'rest',   label: 'Descanso' },
    hasTrader && { id: 'trader', label: 'Mercader' },
    hasRumors && { id: 'rumors', label: 'Rumores' },
  ].filter(Boolean)

  function handleRest() {
    const result = onRest()
    if (!result.ok) {
      setRestMsg({ ok: false, text: result.reason })
      setTimeout(() => setRestMsg(null), 3000)
      return
    }
    setRestMsg({ ok: true, text: `+${result.hpGain} HP` })
    setTimeout(() => setRestMsg(null), 3000)
  }

  function handleBuy(resourceId) {
    const msg = onBuy(resourceId)
    if (msg) { setTradeMsg(msg); setTimeout(() => setTradeMsg(null), 2500) }
  }

  function handleSell(resourceId) {
    const msg = onSell(resourceId)
    if (msg) { setTradeMsg(msg); setTimeout(() => setTradeMsg(null), 2500) }
  }

  function handleShowRumor() {
    setShownRumor(getRouteStopRumor(routeStop))
  }

  if (minimized) {
    return (
      <div className="route-stop-layer route-stop-layer-minimized" onClick={() => setMinimized(false)}>
        <div className="route-stop-minimized-bar">
          <span className="route-stop-minimized-icon">⛺</span>
          <span className="route-stop-minimized-name">{routeStop.name}</span>
          <span className="route-stop-minimized-hint">Toca para ver</span>
        </div>
      </div>
    )
  }

  return (
    <div className="route-stop-layer">
      <div className="route-stop-dock">

        {/* Header */}
        <div className="route-stop-header">
          <div className="route-stop-header-left">
            <span className="route-stop-header-icon">⛺</span>
            <div>
              <div className="route-stop-title">{routeStop.name}</div>
              <div className="route-stop-type-label">{TYPE_LABEL[routeStop.type] ?? routeStop.type}</div>
            </div>
          </div>
          <button className="route-stop-minimize-btn" onClick={() => setMinimized(true)}>—</button>
        </div>

        {/* Tabs */}
        {tabs.length > 1 && (
          <div className="route-stop-tabs">
            {tabs.map(t => (
              <button
                key={t.id}
                className={`route-stop-tab${activeTab === t.id ? ' active' : ''}`}
                onClick={() => setActiveTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="route-stop-content">

          {activeTab === 'info' && (
            <p className="route-stop-description">{routeStop.description}</p>
          )}

          {activeTab === 'rest' && (
            <div>
              {hpFull ? (
                <p className="route-stop-note">La caravana ya está en plena forma.</p>
              ) : (
                <button className="btn btn-secondary route-stop-action-btn" onClick={handleRest}>
                  Descansar (+10 HP)
                </button>
              )}
              {restMsg && (
                <div className={`route-stop-feedback ${restMsg.ok ? 'rs-ok' : 'rs-err'}`}>
                  {restMsg.text}
                </div>
              )}
            </div>
          )}

          {activeTab === 'trader' && (
            <div>
              {tradeMsg && (
                <div className={`route-stop-feedback ${tradeMsg.ok ? 'rs-ok' : 'rs-err'}`}>
                  {tradeMsg.text}
                </div>
              )}
              <div className="route-stop-currency-row">
                <span className="rs-currency-symbol">{CURRENCY_SYMBOL}</span>
                <span className="rs-currency-amount">{currency}</span>
              </div>
              {shopStock.length > 0 && (
                <>
                  <div className="route-stop-section-title">Comprar</div>
                  {shopStock.map(item => {
                    const res = RESOURCES?.find?.(r => r.id === item.resourceId)
                    return (
                      <div key={item.resourceId} className="route-stop-item-row">
                        <span className="route-stop-item-name">{res?.name ?? item.resourceId}</span>
                        <span className="route-stop-item-price">{CURRENCY_SYMBOL} {item.buyPrice}</span>
                        <button
                          className="btn route-stop-item-btn"
                          disabled={!canAfford(player, item.buyPrice)}
                          onClick={() => handleBuy(item.resourceId)}
                        >
                          Comprar
                        </button>
                      </div>
                    )
                  })}
                </>
              )}
              <div className="route-stop-section-title" style={{ marginTop: 10 }}>Vender</div>
              {Object.entries(inventory ?? {}).filter(([, qty]) => qty > 0).length === 0 ? (
                <p className="route-stop-note">No llevas nada que vender.</p>
              ) : (
                Object.entries(inventory ?? {})
                  .filter(([, qty]) => qty > 0)
                  .map(([resId, qty]) => {
                    const res   = RESOURCES?.find?.(r => r.id === resId)
                    const price = getResourceSellPrice(resId)
                    return (
                      <div key={resId} className="route-stop-item-row">
                        <span className="route-stop-item-name">{res?.name ?? resId} ×{qty}</span>
                        <span className="route-stop-item-price">{CURRENCY_SYMBOL} {price}</span>
                        <button className="btn route-stop-item-btn" onClick={() => handleSell(resId)}>
                          Vender
                        </button>
                      </div>
                    )
                  })
              )}
            </div>
          )}

          {activeTab === 'rumors' && (
            <div>
              {!shownRumor ? (
                <button className="btn btn-secondary route-stop-action-btn" onClick={handleShowRumor}>
                  Preguntar a los viajeros
                </button>
              ) : (
                <div className="route-stop-rumor">
                  <span className="rumor-bullet">◆</span>
                  <span>{shownRumor}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="route-stop-actions">
          <button className="btn btn-primary route-stop-continue-btn" onClick={onContinue}>
            Continuar marcha
          </button>
          <button className="btn btn-ghost route-stop-dismiss-btn" onClick={onDismiss}>
            Ignorar parada
          </button>
        </div>

      </div>
    </div>
  )
}
