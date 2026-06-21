import { useState } from 'react'

export default function CollapsiblePanel({ title, defaultOpen = false, children, badge }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="collapsible-panel">
      <button className="collapsible-panel-header" onClick={() => setOpen(o => !o)}>
        <span className="collapsible-panel-title">{title}</span>
        <span style={{ display:'flex', alignItems:'center', gap:6 }}>
          {badge && <span className="collapsible-panel-badge">{badge}</span>}
          <span className="collapsible-panel-toggle">{open ? '▲' : '▼'}</span>
        </span>
      </button>
      {open && (
        <div className="collapsible-panel-body">
          {children}
        </div>
      )}
    </div>
  )
}
