const TABS = [
  { id: 'caravana',   label: 'Caravana',   icon: '⛺' },
  { id: 'mapa',       label: 'Mapa',        icon: '🗺' },
  { id: 'diario',     label: 'Diario',      icon: '📜' },
  { id: 'inventario', label: 'Inventario',  icon: '🎒' },
  { id: 'criatura',   label: 'Criatura',    icon: '🐾' },
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
          <span className="nav-icon">{t.icon}</span>
          {t.label}
        </button>
      ))}
    </nav>
  )
}
