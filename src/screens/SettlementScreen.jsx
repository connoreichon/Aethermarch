import { useState } from 'react'
import { getPlayerCurrency, canAfford, CURRENCY_SYMBOL, CURRENCY_NAME, INN_REST_COST, resolveSettlementRest } from '../systems/economySystem.js'
import { getPlayerRank, canUseMercenaryContracts } from '../systems/rankSystem.js'
import ShopPanel from '../components/ShopPanel.jsx'

const TYPE_LABEL = {
  village:      'Aldea',
  market:       'Mercado',
  fort:         'Fortín',
  harbor:       'Puerto',
  caravanserai: 'Caravasar',
}

const SAFETY_LABEL = {
  safe:     'Seguro',
  guarded:  'Vigilado',
  unstable: 'Inestable',
}

const SERVICE_LABEL = {
  refuge:           'Refugio',
  basic_rest:       'Descanso básico',
  rumors:           'Rumores',
  trader:           'Mercader',
  contracts:        'Contratos',
  inn:              'Posada',
  rest:             'Descanso',
  rest_limited:     'Descanso limitado',
  guard_post:       'Puesto de guardia',
  combat_contracts: 'Contratos de combate',
  supply:           'Suministros',
  supplies:         'Suministros',
  rare_rumors:      'Rumores raros',
  route_info:       'Info de rutas',
}

const RUMORS = {
  village:      [
    'Una caravana llegó hace dos días. Sólo regresó la mitad.',
    'Se oyen campanas en las Raíces más bajas. Nadie sabe de qué son.',
    'El camino al mercado huele a carbón quemado desde hace semanas.',
  ],
  market:       [
    'Hay un mapa de una ruta nueva circulando. El precio es alto.',
    'Un mercader vendió cristales de marea a precios de miseria. Algo está mal.',
    'Los contratos del nivel dos están pagando más. Investiga antes de firmar.',
  ],
  fort:         [
    'La guardia reportó una criatura nueva en el paso sur. Nadie la ha visto dos veces.',
    'Los turnos de guardia se han alargado. Algo pasa en la niebla.',
    'Un explorador volvió sin su compañero. No habla de ello.',
  ],
  harbor:       [
    'Las barcas del fondo no están atadas. Se mueven solas.',
    'Alguien encontró una moneda antigua en el lecho del lago. El símbolo no es de ninguna facción conocida.',
    'Dos guías salinos desaparecieron en el tramo norte la semana pasada.',
  ],
  caravanserai: [
    'Las rutas se están congestionando. Conviene salir temprano.',
    'Un grupo de exploradores pagó por información y nunca regresó a reclamarla.',
    'El precio del carbón resonante está subiendo. Alguien compra a granel.',
  ],
}

function hasShopServices(services) {
  return services.some(k => ['trader', 'supply', 'supplies'].includes(k))
}
function hasRestServices(services) {
  return services.some(k => ['inn', 'rest', 'basic_rest', 'rest_limited', 'refuge'].includes(k))
}
function hasRumorsServices(services) {
  return services.some(k => ['rumors', 'rare_rumors', 'tavern'].includes(k))
}
function hasContractServices(services) {
  return services.some(k => ['contracts', 'combat_contracts'].includes(k))
}

export default function SettlementScreen({
  settlement,
  player,
  inventory,
  currentLocation,
  contractState,
  sectors,
  onExit,
  onBuy,
  onSell,
  onRest,
}) {
  const [activeTab,  setActiveTab]  = useState('info')
  const [restResult, setRestResult] = useState(null)
  const [tradeMsg,   setTradeMsg]   = useState(null)

  if (!settlement) return null

  const isHere      = currentLocation?.settlementId === settlement.id
  const services    = settlement.services ?? []
  const hasShop     = hasShopServices(services)
  const hasRest     = hasRestServices(services)
  const hasRumors   = hasRumorsServices(services)
  const hasContracts = hasContractServices(services)

  const rank         = getPlayerRank({ player, sectors: sectors ?? [], contractState })
  const canContracts = canUseMercenaryContracts({ player, sectors: sectors ?? [], contractState })

  const rumors = RUMORS[settlement.type] ?? RUMORS.village

  const tabs = [
    { id: 'info',      label: 'Info' },
    hasShop      && { id: 'shop',      label: 'Tienda' },
    hasRest      && { id: 'rest',      label: 'Descanso' },
    hasRumors    && { id: 'rumors',    label: 'Rumores' },
    hasContracts && { id: 'contratos', label: 'Contratos' },
  ].filter(Boolean)

  function handleRest() {
    const result = resolveSettlementRest({ player, settlement })
    if (!result.ok) {
      setRestResult({ ok: false, msg: result.reason })
      return
    }
    onRest(result)
    const hpText  = `+${result.hpGain} HP`
    const costText = result.cost > 0 ? ` · -${result.cost} ${CURRENCY_SYMBOL}` : ''
    setRestResult({ ok: true, msg: `${hpText}${costText}` })
    setTimeout(() => setRestResult(null), 3000)
  }

  function handleBuy(args) {
    const msg = onBuy(args)
    if (msg) { setTradeMsg(msg); setTimeout(() => setTradeMsg(null), 2500) }
  }

  function handleSell(args) {
    const msg = onSell(args)
    if (msg) { setTradeMsg(msg); setTimeout(() => setTradeMsg(null), 2500) }
  }

  const currency  = getPlayerCurrency(player)
  const hpFull    = (player?.hp ?? 0) >= (player?.maxHp ?? 1)
  const hpPct     = Math.round(((player?.hp ?? 0) / (player?.maxHp ?? 1)) * 100)
  const hasInn    = services.includes('inn') || services.includes('rest')

  return (
    <div className="settlement-screen">

      {/* Header */}
      <div className="settlement-header">
        <button className="settlement-back-btn" onClick={onExit}>← Salir</button>
        <div className="settlement-header-content">
          <div className="settlement-name">{settlement.name}</div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'center', marginTop: 3 }}>
            <span className="settlement-type-badge">
              {TYPE_LABEL[settlement.type] ?? settlement.type}
            </span>
            <span className={`settlement-safety-badge safety-${settlement.safetyLevel}`}>
              {SAFETY_LABEL[settlement.safetyLevel] ?? settlement.safetyLevel}
            </span>
            {isHere
              ? <span className="settlement-here-badge">Estás aquí</span>
              : <span className="settlement-away-badge">Explorando el mapa</span>
            }
          </div>
        </div>
      </div>

      {/* Currency strip */}
      <div className="settlement-currency-strip">
        <span className="s-currency-symbol">{CURRENCY_SYMBOL}</span>
        <span className="s-currency-amount">{currency}</span>
        <span className="s-currency-label">{CURRENCY_NAME}</span>
        {!isHere && (
          <span className="settlement-locked-note">Servicios solo disponibles en persona</span>
        )}
      </div>

      {/* Tabs */}
      {tabs.length > 1 && (
        <div className="settlement-tabs">
          {tabs.map(t => (
            <button
              key={t.id}
              className={`settlement-tab${activeTab === t.id ? ' active' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="settlement-content">

        {/* ── Info ───────────────────────────────────────────────── */}
        {activeTab === 'info' && (
          <>
            <div className="panel">
              <div className="panel-title">Sobre este lugar</div>
              <p className="settlement-description">{settlement.description}</p>
              {settlement.populationTone && (
                <p className="settlement-population">{settlement.populationTone}</p>
              )}
            </div>
            <div className="panel">
              <div className="panel-title">Servicios</div>
              <div className="settlement-services-list">
                {services.map(s => (
                  <span key={s} className="settlement-service-tag">
                    {SERVICE_LABEL[s] ?? s}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── Tienda ─────────────────────────────────────────────── */}
        {activeTab === 'shop' && (
          <>
            {tradeMsg && (
              <div className={`settlement-feedback ${tradeMsg.ok ? 'feedback-ok' : 'feedback-err'}`}>
                {tradeMsg.text}
              </div>
            )}
            {!isHere && (
              <div className="settlement-locked-panel">
                Debes estar en {settlement.name} para comerciar.
              </div>
            )}
            <ShopPanel
              settlement={settlement}
              player={player}
              inventory={inventory}
              canShop={isHere}
              onBuy={handleBuy}
              onSell={handleSell}
            />
          </>
        )}

        {/* ── Descanso ───────────────────────────────────────────── */}
        {activeTab === 'rest' && (
          <div className="panel">
            <div className="panel-title">Descanso</div>
            {!isHere ? (
              <div className="settlement-locked-panel">
                Debes estar en {settlement.name} para descansar.
              </div>
            ) : (
              <>
                <div className="rest-hp-bar">
                  <div className="rest-hp-label">HP {player?.hp ?? 0} / {player?.maxHp ?? 0}</div>
                  <div className="rest-hp-track">
                    <div className="rest-hp-fill" style={{ width: `${hpPct}%` }} />
                  </div>
                </div>
                {hpFull && (
                  <div className="settlement-locked-panel" style={{ marginTop: 10 }}>
                    La caravana ya está en plena forma.
                  </div>
                )}
                {!hpFull && hasInn && (
                  <div style={{ marginTop: 12 }}>
                    <p className="rest-desc">Descanso completo en posada. Recupera todos los HP.</p>
                    <p className="rest-cost">Coste: {CURRENCY_SYMBOL} {INN_REST_COST}</p>
                    <button
                      className="btn btn-primary"
                      style={{ marginTop: 8, width: '100%' }}
                      disabled={!canAfford(player, INN_REST_COST)}
                      onClick={handleRest}
                    >
                      Descansar en posada ({INN_REST_COST} ◈)
                    </button>
                    {!canAfford(player, INN_REST_COST) && (
                      <p style={{ fontSize: '0.58rem', color: 'var(--color-hp)', marginTop: 4, textAlign: 'center' }}>
                        Fondos insuficientes.
                      </p>
                    )}
                  </div>
                )}
                {!hpFull && !hasInn && (
                  <div style={{ marginTop: 12 }}>
                    <p className="rest-desc">Descanso básico. Recupera 10 HP. Gratuito.</p>
                    <button
                      className="btn btn-secondary"
                      style={{ marginTop: 8, width: '100%' }}
                      onClick={handleRest}
                    >
                      Descansar (+10 HP)
                    </button>
                  </div>
                )}
                {restResult && (
                  <div className={`settlement-feedback ${restResult.ok ? 'feedback-ok' : 'feedback-err'}`}
                       style={{ marginTop: 8 }}>
                    {restResult.msg}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── Rumores ────────────────────────────────────────────── */}
        {activeTab === 'rumors' && (
          <div className="panel">
            <div className="panel-title">Rumores</div>
            {rumors.map((r, i) => (
              <div key={i} className="rumor-entry">
                <span className="rumor-bullet">◆</span>
                <span>{r}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── Contratos ──────────────────────────────────────────── */}
        {activeTab === 'contratos' && (
          <div className="panel">
            <div className="panel-title">Contratos mercenarios</div>
            {!isHere ? (
              <div className="settlement-locked-panel">
                Debes estar en {settlement.name} para acceder a contratos.
              </div>
            ) : !canContracts ? (
              <div className="settlement-locked-panel">
                Requiere Rango II (Caminante) para usar contratos mercenarios.<br />
                Rango actual: {rank.label}
              </div>
            ) : (
              <div className="settlement-locked-panel">
                Los contratos de zona se gestionan desde la pantalla Caravana.
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}

