export default function StatBar({ label, value, max, type = 'hp' }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div className="stat-bar-row">
      <span className="stat-bar-label">{label}</span>
      <div className="stat-bar-track">
        <div className={`stat-bar-fill ${type}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="stat-bar-value">{value}/{max}</span>
    </div>
  )
}
