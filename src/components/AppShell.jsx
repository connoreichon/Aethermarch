import BottomNav from './BottomNav.jsx'

export default function AppShell({ currentTab, onChangeTab, children }) {
  return (
    <div className="app-root">
      <header className="app-header">
        <h1>Aethermarch</h1>
        <p>El camino te espera</p>
      </header>
      <main className="app-content">
        {children}
      </main>
      <BottomNav currentTab={currentTab} onChangeTab={onChangeTab} />
    </div>
  )
}
