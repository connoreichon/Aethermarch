import { useState } from 'react'
import { ABYSS_STRATA, WORLD_ROUTES, WORLD_ROUTE_SEGMENTS, ABYSS_SETTLEMENTS } from '../data/gameData.js'
import VisualMapCanvas from '../components/VisualMapCanvas.jsx'

function getBreadcrumb(viewLevel, layerId, routeId) {
  const stratum = layerId ? ABYSS_STRATA.find(s => s.id === layerId) : null
  const route   = routeId ? WORLD_ROUTES.find(r => r.id === routeId) : null
  if (viewLevel === 'route') {
    return `El Abismo / ${stratum?.shortName ?? '—'} / ${route?.name ?? '—'}`
  }
  if (viewLevel === 'layer') {
    return `El Abismo / ${stratum?.shortName ?? '—'}`
  }
  return 'El Abismo'
}

export default function MapScreen({ sectors, expedition, discoveredSegmentIds = [] }) {
  const [viewLevel,       setViewLevel]       = useState('abyss')
  const [selectedLayerId, setSelectedLayerId] = useState(null)
  const [selectedRouteId, setSelectedRouteId] = useState(null)
  const [centerTrigger,   setCenterTrigger]   = useState(0)

  const discoveredCount = sectors.filter(s => s.discovered).length

  function handleSelectLayer(id) {
    setSelectedLayerId(id)
    setSelectedRouteId(null)
    setViewLevel('layer')
    setCenterTrigger(t => t + 1)
  }

  function handleSelectRoute(id) {
    setSelectedRouteId(id)
    setViewLevel('route')
    setCenterTrigger(t => t + 1)
  }

  function handleBack() {
    if (viewLevel === 'route') {
      setViewLevel('layer')
    } else if (viewLevel === 'layer') {
      setViewLevel('abyss')
      setSelectedLayerId(null)
    }
    setCenterTrigger(t => t + 1)
  }

  return (
    <div className="abyss-map-screen" style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>

      {/* Header */}
      <div className="abyss-header">
        <div className="abyss-title">El Abismo</div>
        <div className="abyss-subtitle">
          {discoveredCount} / {sectors.length} zonas · {ABYSS_STRATA.length} capas
        </div>
      </div>

      {/* Toolbar: breadcrumb + back + center */}
      <div className="visual-map-toolbar">
        <div className="visual-map-breadcrumb">
          {getBreadcrumb(viewLevel, selectedLayerId, selectedRouteId)}
        </div>
        {viewLevel !== 'abyss' && (
          <button className="visual-map-back" onClick={handleBack}>← Volver</button>
        )}
        <button className="visual-map-center" onClick={() => setCenterTrigger(t => t + 1)}>
          Centrar
        </button>
      </div>

      {/* Visual map canvas */}
      <div className="visual-map-viewport">
        <VisualMapCanvas
          viewLevel={viewLevel}
          selectedLayerId={selectedLayerId}
          selectedRouteId={selectedRouteId}
          sectors={sectors}
          routes={WORLD_ROUTES}
          routeSegments={WORLD_ROUTE_SEGMENTS}
          settlements={ABYSS_SETTLEMENTS}
          discoveredSegmentIds={discoveredSegmentIds}
          expedition={expedition}
          onSelectLayer={handleSelectLayer}
          onSelectSettlement={() => {}}
          onSelectRoute={handleSelectRoute}
          centerTrigger={centerTrigger}
        />
      </div>
    </div>
  )
}
