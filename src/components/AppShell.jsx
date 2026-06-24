import BottomNav from './BottomNav.jsx'

export default function AppShell({ currentTab, onChangeTab, children, flowClass }) {
  return (
    <div className={['app-root', flowClass].filter(Boolean).join(' ')}>
      <header className="app-header">
        <h1 style={{ fontFamily: "'Pirata One', serif" }}>Aethermarch</h1>
        <p>El camino te espera</p>
      </header>
      <main className="app-content">
        {children}
      </main>
      <BottomNav currentTab={currentTab} onChangeTab={onChangeTab} />
    </div>
  )
}
