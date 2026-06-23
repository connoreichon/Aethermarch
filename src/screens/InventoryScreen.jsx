import { RESOURCES, BIOMES } from '../data/gameData.js'
import { getPlayerCurrency, CURRENCY_SYMBOL, CURRENCY_NAME } from '../systems/economySystem.js'
import ResourceNode from '../components/tokens/ResourceNode.jsx'

const BIOME_TAG = {
  forest: 'tag-biome-forest',
  coast:  'tag-biome-coast',
  forge:  'tag-biome-forge',
}

const RARITY_LABEL = {
  comun:       'Común',
  poco_comun:  'Poco común',
  raro:        'Raro',
}

const RARITY_COLOR = {
  comun:       'var(--color-stone-light)',
  poco_comun:  'var(--color-xp)',
  raro:        'var(--color-gold)',
}

export default function InventoryScreen({ inventory, player }) {
  const hasItems = Object.values(inventory ?? {}).some(q => q > 0)

  // Catálogo ordenado: qty > 0 primero, luego qty = 0; dentro de cada grupo, por bioma
  const sorted = Object.values(RESOURCES).sort((a, b) => {
    const qa = inventory?.[a.id] ?? 0
    const qb = inventory?.[b.id] ?? 0
    if (qa > 0 && qb === 0) return -1
    if (qa === 0 && qb > 0) return  1
    if (a.biomeId < b.biomeId) return -1
    if (a.biomeId > b.biomeId) return  1
    return 0
  })

  return (
    <div className="screen-scroll">

      {/* Moneda */}
      {player && (
        <div className="inventory-currency-row">
          <span className="inventory-currency-symbol">{CURRENCY_SYMBOL}</span>
          <span className="inventory-currency-amount">{getPlayerCurrency(player)}</span>
          <span className="inventory-currency-name">{CURRENCY_NAME}</span>
        </div>
      )}

      {/* Botín actual */}
      <div className="panel">
        <div className="panel-title">Provisiones de la caravana</div>
        {!hasItems ? (
          <div className="empty-state">
            El inventario está vacío.<br />
            Completa expediciones para recolectar materiales.
          </div>
        ) : (
          <div className="inventory-grid">
            {Object.entries(inventory ?? {}).map(([id, qty]) => {
              if (qty === 0) return null
              const res   = RESOURCES[id]
              const biome = res ? BIOMES[res.biomeId] : null
              if (!res) return null
              return (
                <div key={id} className="resource-row">
                  <ResourceNode resourceId={id} size={40} />
                  <div className="resource-row-info">
                    <div className="resource-row-name">{res.name}</div>
                    <div className="resource-row-util">{res.utility}</div>
                    <div style={{ display:'flex', gap:5, marginTop:3, flexWrap:'wrap', alignItems:'center' }}>
                      {biome && (
                        <span className={`tag ${BIOME_TAG[res.biomeId] ?? ''}`}>
                          {biome.name}
                        </span>
                      )}
                      <span style={{ fontSize:'0.56rem', color: RARITY_COLOR[res.rarity] ?? 'var(--color-stone-light)' }}>
                        {RARITY_LABEL[res.rarity] ?? res.rarity}
                      </span>
                    </div>
                  </div>
                  <div className="resource-row-qty" style={{ color:'var(--color-gold)' }}>
                    ×{qty}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Catálogo completo */}
      <div className="panel">
        <div className="panel-title">Materiales conocidos</div>
        <div className="inventory-grid">
          {sorted.map(res => {
            const qty   = inventory?.[res.id] ?? 0
            const biome = BIOMES[res.biomeId]
            const hasIt = qty > 0
            return (
              <div
                key={res.id}
                className="resource-row"
                style={{ opacity: hasIt ? 1 : 0.42 }}
              >
                <ResourceNode resourceId={res.id} size={40} />
                <div className="resource-row-info">
                  <div className="resource-row-name" style={{ color: hasIt ? 'var(--color-parchment)' : 'var(--color-stone-light)' }}>
                    {res.name}
                  </div>
                  <div className="resource-row-util">{res.utility}</div>
                  <div style={{ display:'flex', gap:5, marginTop:3, flexWrap:'wrap', alignItems:'center' }}>
                    {biome && (
                      <span className={`tag ${BIOME_TAG[res.biomeId] ?? ''}`}>
                        {biome.name}
                      </span>
                    )}
                    <span style={{ fontSize:'0.56rem', color: hasIt ? RARITY_COLOR[res.rarity] : 'var(--color-stone-light)' }}>
                      {RARITY_LABEL[res.rarity] ?? res.rarity}
                    </span>
                  </div>
                </div>
                <div
                  className="resource-row-qty"
                  style={{ color: hasIt ? 'var(--color-gold)' : 'var(--color-stone-light)' }}
                >
                  ×{qty}
                </div>
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}
