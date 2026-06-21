import { useState, useMemo } from 'react'
import { buildCodexEntries, getCodexProgress } from '../systems/codexSystem.js'

const CATEGORIES = [
  { id: 'strata',    label: 'Estratos'  },
  { id: 'sectors',   label: 'Sectores'  },
  { id: 'resources', label: 'Recursos'  },
  { id: 'enemies',   label: 'Amenazas'  },
  { id: 'creatures', label: 'Criaturas' },
  { id: 'pois',      label: 'Lugares'   },
]

function CodexEntry({ entry }) {
  const [expanded, setExpanded] = useState(false)
  const cls = `codex-entry${entry.discovered ? ' discovered' : ' hidden'}`

  return (
    <button className={cls} onClick={() => entry.discovered && setExpanded(p => !p)}>
      <div className="codex-entry-header">
        <div>
          <div className="codex-entry-title">{entry.name}</div>
          <div className="codex-entry-subtitle">{entry.subtitle}</div>
        </div>
        {entry.discovered && (
          <span className={`codex-entry-chevron${expanded ? ' open' : ''}`}>›</span>
        )}
        {!entry.discovered && (
          <span className="codex-hidden-mark">?</span>
        )}
      </div>

      {expanded && entry.discovered && (
        <div className="codex-entry-body">
          <div className="codex-entry-description">{entry.description}</div>
          {entry.meta.length > 0 && (
            <div className="codex-entry-meta">
              {entry.meta.map((m, i) => (
                <div key={i} className="codex-entry-meta-item">{m}</div>
              ))}
            </div>
          )}
        </div>
      )}

      {!entry.discovered && (
        <div className="codex-entry-body">
          <div className="codex-entry-description" style={{ fontStyle: 'italic', opacity: 0.45 }}>
            Aún no hay datos suficientes en el códice.
          </div>
        </div>
      )}
    </button>
  )
}

export default function CodexScreen({ player, sectors, inventory, diary }) {
  const [activeCategory, setActiveCategory] = useState('strata')

  const entries = useMemo(
    () => buildCodexEntries({ player, sectors, inventory, diary }),
    [player, sectors, inventory, diary]
  )

  const progress = useMemo(() => getCodexProgress(entries), [entries])

  const visible = entries.filter(e => e.category === activeCategory)

  return (
    <div className="codex-screen">

      {/* Cabecera */}
      <div className="codex-header">
        <div className="codex-title">Códice del Abismo</div>
        <div className="codex-subtitle">Registros de la expedición</div>

        <div className="codex-progress-card">
          <span className="codex-progress-number">{progress.discovered}</span>
          <span className="codex-progress-sep">/</span>
          <span className="codex-progress-total">{progress.total}</span>
          <span className="codex-progress-label">entradas registradas</span>
        </div>
      </div>

      {/* Pestañas de categoría */}
      <div className="codex-tabs">
        {CATEGORIES.map(cat => {
          const catEntries   = entries.filter(e => e.category === cat.id)
          const discovered   = catEntries.filter(e => e.discovered).length
          const isActive     = activeCategory === cat.id
          return (
            <button
              key={cat.id}
              className={`codex-tab${isActive ? ' active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              <span className="codex-tab-label">{cat.label}</span>
              <span className="codex-tab-count">{discovered}/{catEntries.length}</span>
            </button>
          )
        })}
      </div>

      {/* Lista de entradas */}
      <div className="codex-list">
        {visible.length === 0 && (
          <div className="codex-empty">No hay entradas en esta categoría.</div>
        )}
        {visible.map(entry => (
          <CodexEntry key={entry.id} entry={entry} />
        ))}
      </div>

    </div>
  )
}
