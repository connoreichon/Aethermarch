import { useState } from 'react'
import { ABYSS_STRATA, WORLD_ROUTES, WORLD_ROUTE_SEGMENTS, ABYSS_SETTLEMENTS } from '../data/gameData.js'
import VisualMapCanvas from '../components/VisualMapCanvas.jsx'

const CENTER_LABEL = { abyss: 'Volver al inicio', layer: 'Centrar capa', route: 'Centrar ruta' }
const MAP_HINT     = {
  abyss: 'Desliza para descender · Toca una capa para acercarte',
  layer: 'Toca una ciudad o una ruta',
  route: 'Toca un tramo para ver detalle',
}

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

export default function MapScreen({
  sectors,
  expedition,
  discoveredSegmentIds = [],
  currentLocation,
  routeBranches = [],
  branchKnowledge = {},
  cameraState,
  onCameraChange,
  onGoToCaravan,
  onGoToCaravanForChoice,
  onSelectSettlement,
}) {
  // centerTrigger is purely local — only fires on explicit "Centrar" press
  const [centerTrigger, setCenterTrigger] = useState(0)
  const [mapViewKey,    setMapViewKey]    = useState(0) // for enter-transition

  const { viewLevel, selectedLayerId, selectedRouteId, panByView } = cameraState

  const discoveredCount = sectors.filter(s => s.discovered).length

  function handleSelectLayer(id) {
    setMapViewKey(k => k + 1)
    onCameraChange(prev => ({
      ...prev,
      viewLevel:       'layer',
      selectedLayerId: id,
      selectedRouteId: null,
    }))
  }

  function handleSelectRoute(id) {
    setMapViewKey(k => k + 1)
    onCameraChange(prev => ({
      ...prev,
      viewLevel:       'route',
      selectedRouteId: id,
    }))
  }

  function handleBack() {
    setMapViewKey(k => k + 1)
    if (viewLevel === 'route') {
      onCameraChange(prev => ({ ...prev, viewLevel: 'layer' }))
    } else if (viewLevel === 'layer') {
      onCameraChange(prev => ({
        ...prev,
        viewLevel:       'abyss',
        selectedLayerId: null,
      }))
    }
  }

  function handleCenter() {
    setCenterTrigger(t => t + 1)
  }

  function handlePanChange(vl, pan) {
    onCameraChange(prev => ({
      ...prev,
      panByView: { ...prev.panByView, [vl]: pan },
    }))
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
        <button className="visual-map-center" onClick={handleCenter}>
          {CENTER_LABEL[viewLevel] ?? 'Centrar'}
        </button>
      </div>

      {/* Visual map canvas */}
      <div key={mapViewKey} className="visual-map-viewport map-view-entering">
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
          currentLocation={currentLocation}
          routeBranches={routeBranches}
          branchKnowledge={branchKnowledge}
          onSelectLayer={handleSelectLayer}
          onSelectSettlement={onSelectSettlement ?? (() => {})}
          onSelectRoute={handleSelectRoute}
          centerTrigger={centerTrigger}
          panByView={panByView}
          onPanChange={handlePanChange}
        />
      </div>

      {/* Decisión de ruta pendiente */}
      {expedition?.status === 'branch_choice' && (
        <div className="map-branch-pending-chip">
          <span>⑂ Bifurcación pendiente — elige camino</span>
          {onGoToCaravanForChoice && (
            <button className="btn btn-primary map-branch-decide-btn" onClick={onGoToCaravanForChoice}>
              Decidir →
            </button>
          )}
        </div>
      )}

      {/* Seguir caravana — solo si expedición activa */}
      {(expedition?.status === 'marching' || expedition?.status === 'segment_transition') && onGoToCaravan && (
        <div style={{ padding: '6px 14px 0' }}>
          <button className="btn btn-primary map-follow-caravan-btn" onClick={onGoToCaravan}>
            Seguir caravana →
          </button>
        </div>
      )}

      {/* Microhint */}
      <div className="visual-map-hint">{MAP_HINT[viewLevel]}</div>
    </div>
  )
}
