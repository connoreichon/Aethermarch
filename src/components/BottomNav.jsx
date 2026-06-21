function CodexIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" style={{ display:'block' }}>
      <path d="M2 3 C2 2 3 2 4 2 L8 3 L12 2 C13 2 14 2 14 3 L14 12 C14 13 13 13 12 13 L8 12 L4 13 C3 13 2 13 2 12 Z"
            stroke="currentColor" strokeWidth="1.2"/>
      <line x1="8" y1="3" x2="8" y2="12" stroke="currentColor" strokeWidth="0.8"/>
    </svg>
  )
}

const TABS = [
  { id: 'caravana',   label: 'Caravana',  icon: '⛺' },
  { id: 'mapa',       label: 'Mapa',       icon: '🗺' },
  { id: 'diario',     label: 'Diario',     icon: '📜' },
  { id: 'inventario', label: 'Inventario', icon: '🎒' },
  { id: 'criatura',   label: 'Criatura',   icon: '🐾' },
  { id: 'codice',     label: 'Códice',     icon: null },
]

export default function BottomNav({ currentTab, onChangeTab }) {
  return (
    <nav className="bottom-nav">
      {TABS.map(t => (
        <button
          key={t.id}
          className={currentTab === t.id ? 'active' : ''}
          onClick={() => onChangeTab(t.id)}
        >
          <span className="nav-icon">
            {t.icon !== null ? t.icon : <CodexIcon />}
          </span>
          {t.label}
        </button>
      ))}
    </nav>
  )
}
