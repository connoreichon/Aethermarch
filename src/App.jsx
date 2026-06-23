import { useState, useEffect, useRef } from 'react'
import { ARCHETYPES, BIOMES, ENEMIES, INITIAL_SECTORS, WORLD_ROUTES, WORLD_ROUTE_SEGMENTS } from './data/gameData.js'
import CombatAlertModal from './components/CombatAlertModal.jsx'
import { emptyInventory, addResources } from './systems/inventorySystem.js'
import { generateEvent, calculateRewards, buildDiaryEntry } from './systems/expeditionSystem.js'
import { createCombatFromThreat, resolveCombatTurn } from './systems/combatSystem.js'
import { canClaimEcho, resolveMarchEcho } from './systems/echoSystem.js'
import { resolveSectorDiscovery, clearRecentDiscoveries } from './systems/mapSystem.js'
import {
  loadSave, writeSave, clearSave,
  createSaveSnapshot, sanitizeLoadedSave,
} from './systems/saveSystem.js'
import {
  createInitialStepSource, sanitizeStepSource,
  addPrototypeSteps, addPedometerSteps, consumeRecentSteps, getAvailableEchoSteps,
} from './systems/stepSourceSystem.js'
import {
  isMotionSupported, needsMotionPermission, requestMotionPermission,
  createPedometerState, processMotionSample,
} from './systems/pedometerSystem.js'
import { canUsePoiAction, resolvePoiAction } from './systems/poiSystem.js'
import {
  buildRouteRunState,
  completeCurrentRouteSegment,
  getSegmentsForRoute,
} from './systems/routeSegmentSystem.js'
import {
  createInitialLocation, sanitizeLocation,
  buildLocationFromSector, buildLocationFromRouteDestination,
} from './systems/locationSystem.js'
import {
  createInitialContractState, sanitizeContractState,
  canStartContract, startContract, resolveContract, getContractSuccessChance,
} from './systems/contractSystem.js'
import AppShell              from './components/AppShell.jsx'
import ExpeditionNoticeDock  from './components/ExpeditionNoticeDock.jsx'
import StartScreen     from './screens/StartScreen.jsx'
import CaravanScreen   from './screens/CaravanScreen.jsx'
import MapScreen       from './screens/MapScreen.jsx'
import DiaryScreen     from './screens/DiaryScreen.jsx'
import InventoryScreen from './screens/InventoryScreen.jsx'
import CreatureScreen  from './screens/CreatureScreen.jsx'
import CodexScreen    from './screens/CodexScreen.jsx'

const THRESHOLDS = [20, 40, 60, 80]

const COMBAT_DECISION_SECONDS = 6

const DEFAULT_MAP_CAMERA = {
  viewLevel:       'abyss',
  selectedLayerId: null,
  selectedRouteId: null,
  panByView: {
    abyss: { x: 0, y: 0 },
    layer: { x: 0, y: 0 },
    route: { x: 0, y: 0 },
  },
}

function loadMapCamera() {
  try {
    const raw = JSON.parse(localStorage.getItem('aethermarch_map_camera_v1') ?? 'null')
    if (!raw || typeof raw !== 'object') return DEFAULT_MAP_CAMERA
    const views = ['abyss', 'layer', 'route']
    return {
      viewLevel:       views.includes(raw.viewLevel) ? raw.viewLevel : 'abyss',
      selectedLayerId: raw.selectedLayerId ?? null,
      selectedRouteId: raw.selectedRouteId ?? null,
      panByView: {
        abyss: { x: Number(raw.panByView?.abyss?.x) || 0, y: Number(raw.panByView?.abyss?.y) || 0 },
        layer: { x: Number(raw.panByView?.layer?.x) || 0, y: Number(raw.panByView?.layer?.y) || 0 },
        route: { x: Number(raw.panByView?.route?.x) || 0, y: Number(raw.panByView?.route?.y) || 0 },
      },
    }
  } catch { return DEFAULT_MAP_CAMERA }
}

const INITIAL_EXPEDITION = {
  status:        'resting',
  currentTramo:  1,
  modeId:        'free_march',
  sectorId:      'sector_aethel_edge',
  biomeId:       'forest',
  targetSteps:   1200,
  currentSteps:  0,
  progress:      0,
  events:        [],
  rewards:       {},
  combatResults: [],
}

const INITIAL_COMBAT = {
  status:         'none',
  enemyId:        null,
  attackId:       null,
  attack:         null,
  selectedStance: null,
  result:         null,
  log:            [],
  sourceEventId:  null,
}

function buildInitialPlayer(archetypeId, creatureId) {
  const archetype = ARCHETYPES.find(a => a.id === archetypeId)
  const hpBonus   = archetype?.hpBonus ?? 0
  return {
    level:    1,
    xp:       0,
    xpToNext: 100,
    hp:       30 + hpBonus,
    maxHp:    30 + hpBonus,
    archetypeId,
    creatureId,
  }
}

function masteryLevelFromValue(v) {
  if (v >= 100) return 4
  if (v >= 50)  return 3
  if (v >= 25)  return 2
  if (v >= 10)  return 1
  return 0
}

// Check for valid save at module init (runs once, avoids extra useEffect)
function checkInitialSave() {
  const raw  = loadSave()
  const save = sanitizeLoadedSave(raw)
  return save !== null
}

export default function App() {
  const [hasStarted,              setHasStarted]              = useState(false)
  const [currentTab,              setCurrentTab]              = useState('caravana')
  const [player,                  setPlayer]                  = useState(null)
  const [selectedArchetypeId,     setSelectedArchetypeId]     = useState(null)
  const [selectedCreatureId,      setSelectedCreatureId]      = useState(null)
  const [inventory,               setInventory]               = useState(emptyInventory())
  const [diary,                   setDiary]                   = useState([])
  const [sectors,                 setSectors]                 = useState(INITIAL_SECTORS)
  const [expedition,              setExpedition]              = useState(INITIAL_EXPEDITION)
  const [combat,                  setCombat]                  = useState(INITIAL_COMBAT)
  const [hasSaveFlag,             setHasSaveFlag]             = useState(checkInitialSave)
  const [lastSaved,               setLastSaved]               = useState(null)
  const [recoveredFromInterruption, setRecoveredFromInterruption] = useState(false)
  const [lastEchoClaimAt,           setLastEchoClaimAt]           = useState(null)
  const [echoMessage,               setEchoMessage]               = useState(null)
  const [lastEchoResult,            setLastEchoResult]            = useState(null)
  const [lastDiscovery,             setLastDiscovery]             = useState(null)
  const [stepSource,                setStepSource]                = useState(createInitialStepSource)
  const [pedometer,                 setPedometer]                 = useState(createPedometerState)
  const [lastPoiResult,             setLastPoiResult]             = useState(null)
  const [contractState,             setContractState]             = useState(createInitialContractState)
  const [lastContractResult,        setLastContractResult]        = useState(null)
  const [discoveredSegmentIds,      setDiscoveredSegmentIds]      = useState([])
  const [mapCameraState,            setMapCameraState]            = useState(loadMapCamera)
  const [expeditionNotices,         setExpeditionNotices]         = useState([])
  const [currentLocation,           setCurrentLocation]           = useState(createInitialLocation)

  const completionDone      = useRef(false)
  const combatTriggered     = useRef(new Set())
  const segNoticeFiredRef   = useRef(new Set())
  const combatAutoResumeRef = useRef(false)
  const pedStateRef         = useRef(createPedometerState())
  const motionHandlerRef    = useRef(null)

  // ── Nueva partida ────────────────────────────────────────────────────────────
  function handleStart({ archetypeId, creatureId }) {
    setPlayer(buildInitialPlayer(archetypeId, creatureId))
    setSelectedArchetypeId(archetypeId)
    setSelectedCreatureId(creatureId)
    setHasStarted(true)
  }

  // ── Continuar partida guardada ────────────────────────────────────────────────
  function handleContinue() {
    const raw  = loadSave()
    const save = sanitizeLoadedSave(raw)
    if (!save) { setHasSaveFlag(false); return }

    // Merge dynamic progress (discovered, visits, mastery) onto current INITIAL_SECTORS
    // so static fields (connections, resources, etc.) are always up to date.
    const mergedSectors = INITIAL_SECTORS.map(init => {
      const saved = (save.sectors ?? []).find(s => s.id === init.id)
      if (!saved) return init
      return {
        ...init,
        discovered:         saved.discovered         ?? init.discovered,
        recentlyDiscovered: saved.recentlyDiscovered ?? false,
        visits:             saved.visits             ?? init.visits,
        mastery:            saved.mastery            ?? init.mastery,
        masteryLevel:       saved.masteryLevel       ?? init.masteryLevel,
      }
    })

    setPlayer(save.player)
    setSelectedArchetypeId(save.selectedArchetypeId)
    setSelectedCreatureId(save.selectedCreatureId)
    setInventory(save.inventory)
    setDiary(save.diary)
    setSectors(mergedSectors)
    setExpedition({ ...INITIAL_EXPEDITION, ...(save.expedition ?? {}) })

    if (save.meta?.recoveredFromInterruptedRun) {
      setRecoveredFromInterruption(true)
    }
    setLastEchoClaimAt(save.lastEchoClaimAt ?? null)
    setStepSource(sanitizeStepSource(save.stepSource))
    setContractState(sanitizeContractState(save.contractState ?? null))
    setDiscoveredSegmentIds(save.discoveredSegmentIds ?? [])
    setCurrentLocation(
      sanitizeLocation(save.currentLocation, mergedSectors) ??
      buildLocationFromSector(mergedSectors.find(s => s.id === (save.expedition?.sectorId ?? 'sector_aethel_edge')))
    )
    setPedometer(createPedometerState())  // pedometer always starts idle after reload

    completionDone.current  = false
    combatTriggered.current = new Set()
    setHasSaveFlag(false)
    setHasStarted(true)
  }

  // ── Persistir cámara del mapa en localStorage ────────────────────────────────
  useEffect(() => {
    localStorage.setItem('aethermarch_map_camera_v1', JSON.stringify(mapCameraState))
  }, [mapCameraState])

  // ── Reinicio completo ─────────────────────────────────────────────────────────
  function resetGame() {
    clearSave()
    setCombat(INITIAL_COMBAT)
    setExpedition(INITIAL_EXPEDITION)
    setSectors(INITIAL_SECTORS)
    setInventory(emptyInventory())
    setDiary([])
    setPlayer(null)
    setSelectedArchetypeId(null)
    setSelectedCreatureId(null)
    setLastSaved(null)
    setRecoveredFromInterruption(false)
    setLastEchoClaimAt(null)
    setEchoMessage(null)
    setLastEchoResult(null)
    setLastDiscovery(null)
    setLastPoiResult(null)
    setContractState(createInitialContractState())
    setLastContractResult(null)
    setDiscoveredSegmentIds([])
    setCurrentLocation(createInitialLocation())
    setMapCameraState(DEFAULT_MAP_CAMERA)
    setStepSource(createInitialStepSource())
    setPedometer(createPedometerState())
    if (motionHandlerRef.current) {
      window.removeEventListener('devicemotion', motionHandlerRef.current)
      motionHandlerRef.current = null
    }
    pedStateRef.current = createPedometerState()
    setHasSaveFlag(false)
    completionDone.current  = false
    combatTriggered.current = new Set()
    setHasStarted(false)
  }

  // ── Podómetro experimental ───────────────────────────────────────────────────
  async function handleStartPedometer() {
    if (motionHandlerRef.current) return  // ya running

    if (!isMotionSupported()) {
      setPedometer(prev => ({ ...prev, status: 'unsupported' }))
      return
    }
    if (!window.isSecureContext) {
      setPedometer(prev => ({ ...prev, status: 'insecure' }))
      return
    }
    if (needsMotionPermission()) {
      const granted = await requestMotionPermission()
      if (!granted) {
        setPedometer(prev => ({ ...prev, status: 'denied' }))
        return
      }
    }
    if (motionHandlerRef.current) return  // por si se llamó dos veces durante el await

    const fresh = { ...createPedometerState(), status: 'running' }
    pedStateRef.current = fresh
    setPedometer(fresh)

    const handler = (event) => {
      const prev = pedStateRef.current
      const next = processMotionSample(prev, event)
      pedStateRef.current = next
      if (next.steps !== prev.steps) {
        const gained = next.steps - prev.steps
        setPedometer({ ...next, status: 'running' })
        setStepSource(s => addPedometerSteps(s, gained))
      }
    }

    window.addEventListener('devicemotion', handler)
    motionHandlerRef.current = handler
  }

  function handleStopPedometer() {
    if (motionHandlerRef.current) {
      window.removeEventListener('devicemotion', motionHandlerRef.current)
      motionHandlerRef.current = null
    }
    pedStateRef.current = { ...pedStateRef.current, status: 'paused' }
    setPedometer(prev => ({ ...prev, status: 'paused' }))
  }

  function handleAddPrototypeSteps(amount) {
    setStepSource(prev => addPrototypeSteps(prev, amount))
  }

  // ── Handlers de caravana ─────────────────────────────────────────────────────
  function handleAlzar(selectedRouteId) {
    completionDone.current  = false
    combatTriggered.current = new Set()
    setCombat(INITIAL_COMBAT)
    setRecoveredFromInterruption(false)

    const currentSectorId = currentLocation?.sectorId ?? expedition.sectorId
    const currentSector   = sectors.find(s => s.id === currentSectorId)

    const selectedRoute =
      WORLD_ROUTES.find(r => r.id === selectedRouteId) ??
      WORLD_ROUTES.find(
        r => (r.fromSectorId === currentSectorId || r.toSectorId === currentSectorId) &&
             (r.status === 'open' || r.status === 'discovered') &&
             r.type !== 'secret'
      )

    const routeSegs     = selectedRoute
      ? getSegmentsForRoute({ segments: WORLD_ROUTE_SEGMENTS, routeId: selectedRoute.id })
      : []
    const hasValidRoute = selectedRoute && routeSegs.length > 0

    if (hasValidRoute) {
      const routeRun     = buildRouteRunState({
        route:           selectedRoute,
        segments:        WORLD_ROUTE_SEGMENTS,
        currentSectorId: currentSector?.id ?? currentSectorId,
      })
      const firstSegment = WORLD_ROUTE_SEGMENTS.find(s => s.id === routeRun.currentSegmentId)

      setExpedition(prev => ({
        ...prev,
        status:                   'marching',
        currentSteps:             0,
        progress:                 0,
        events:                   [],
        rewards:                  {},
        combatResults:            [],
        routeId:                  selectedRoute.id,
        routeName:                selectedRoute.name,
        routeRun,
        routeSegmentId:           firstSegment?.id    ?? null,
        routeSegmentName:         firstSegment?.name  ?? null,
        routeSegmentOrder:        firstSegment?.order ?? 1,
        routeSegmentCount:        routeRun.totalSegments,
        routeDestinationSectorId: routeRun.toSectorId,
        targetSteps:              firstSegment?.stepMax ?? prev.targetSteps,
        lockedModeId:             prev.modeId,
        segmentTransition:        null,
      }))
    } else {
      setExpedition(prev => ({
        ...prev,
        status:        'marching',
        currentSteps:  0,
        progress:      0,
        events:        [],
        rewards:       {},
        combatResults: [],
        routeId:       null,
        routeName:     null,
        routeRun:      null,
        routeSegmentId:    null,
        routeSegmentName:  null,
        routeSegmentOrder: null,
        routeSegmentCount: null,
        routeDestinationSectorId: null,
        lockedModeId:  null,
        segmentTransition: null,
      }))
    }
  }

  function handleSelectMode(modeId) {
    setExpedition(prev => ({ ...prev, modeId }))
  }

  function handleSelectSector(sectorId) {
    const sector = sectors.find(s => s.id === sectorId && s.discovered)
    if (!sector) return
    setExpedition(prev => ({ ...prev, sectorId, biomeId: sector.biomeId }))
  }

  function handlePrepareNext() {
    combatTriggered.current = new Set()
    setCombat(INITIAL_COMBAT)
    const locSector = sectors.find(s => s.id === (currentLocation?.sectorId ?? expedition.sectorId))
    setExpedition(prev => ({
      ...INITIAL_EXPEDITION,
      currentTramo: prev.currentTramo + 1,
      modeId:       prev.modeId,
      sectorId:     locSector?.id ?? prev.sectorId,
      biomeId:      locSector?.biomeId ?? prev.biomeId,
    }))
    setLastDiscovery(null)
    setLastContractResult(null)
    setSectors(prev => clearRecentDiscoveries(prev))
  }

  function handleResolveCombat(stanceId, options = {}) {
    // Guard against double-resolution (timer + manual click race)
    if (combat.status !== 'awaiting_choice') return
    if (combat.result !== null) return
    if (combat.selectedStance !== null) return
    if (!player) return

    const auto   = options.auto === true
    const result = resolveCombatTurn({ combat, stanceId, player, enemies: ENEMIES, auto })
    if (!result) return

    setPlayer(prev => ({
      ...prev,
      hp: Math.max(1, prev.hp - result.finalDamage),
      xp: Math.min(prev.xpToNext, prev.xp + result.xpGain),
    }))

    setCombat(prev => ({
      ...prev,
      status:         'resolved',
      selectedStance: stanceId,
      result,
      log: [...prev.log, result.text],
    }))

    setExpedition(prev => ({
      ...prev,
      combatResults: [
        ...(prev.combatResults ?? []),
        {
          eventId:      combat.sourceEventId,
          enemyId:      combat.enemyId,
          enemyName:    ENEMIES[combat.enemyId]?.name ?? combat.enemyId,
          attackId:     combat.attackId,
          stanceId,
          finalDamage:  result.finalDamage,
          xpGain:       result.xpGain,
          wasCorrect:   result.wasCorrect,
          autoResolved: result.autoResolved,
        },
      ],
    }))
  }

  function handleContinueMarch() {
    setCombat(INITIAL_COMBAT)
    setExpedition(prev => ({ ...prev, status: 'marching' }))
  }

  function handleContinueToNextSegment() {
    setExpedition(prev => {
      const t = prev.segmentTransition
      if (!t) return prev
      return {
        ...prev,
        status:            'marching',
        currentSteps:      0,
        progress:          0,
        events:            [],
        rewards:           {},
        combatResults:     [],
        routeSegmentId:    t.nextSegmentId,
        routeSegmentName:  t.nextSegmentName,
        routeSegmentOrder: t.nextSegmentOrder,
        targetSteps:       t.nextTargetSteps,
        segmentTransition: null,
      }
    })
    combatTriggered.current = new Set()
  }

  function handleAbandonExpedition() {
    const routeName = expedition.routeName ?? expedition.routeId ?? 'ruta desconocida'
    const confirmed = window.confirm(
      `Abandonar la expedición?\nConservarás lo ya obtenido en tramos completados, pero no completarás la ruta ni descubrirás el destino.`
    )
    if (!confirmed) return

    const entry = {
      id:          `abandon-${Date.now()}`,
      type:        'expedition_abandoned',
      title:       `Expedición abandonada · ${routeName}`,
      completedAt: new Date().toISOString(),
      steps:       expedition.currentSteps ?? 0,
      sectorId:    expedition.sectorId,
      rewards:     { xp: 0, resources: {} },
      events:      [],
      summaryText: `La caravana abandonó la expedición tras ${expedition.routeRun?.completedSegmentIds?.length ?? 0} tramo(s) completado(s).`,
    }
    setDiary(prev => [...prev, entry])
    setCombat(INITIAL_COMBAT)
    setExpedition(prev => ({
      ...INITIAL_EXPEDITION,
      currentTramo: prev.currentTramo,
      modeId:       prev.lockedModeId ?? prev.modeId,
      sectorId:     prev.sectorId,
      biomeId:      prev.biomeId,
    }))
    combatTriggered.current = new Set()
    completionDone.current  = false
  }

  // ── Eco de Marcha ────────────────────────────────────────────────────────────
  function handleClaimMarchEcho() {
    if (!player || !selectedArchetypeId || !selectedCreatureId) return

    const availableSteps = getAvailableEchoSteps(stepSource)
    const validation = canClaimEcho({ rawSteps: availableSteps, expedition, combat, lastEchoClaimAt })

    if (!validation.ok) {
      setEchoMessage({ type: 'error', text: validation.reason })
      setLastEchoResult(null)
      return
    }

    const { steps } = validation

    const sector = sectors.find(s => s.id === expedition.sectorId)
      ?? sectors.find(s => s.discovered)
    const biome = BIOMES[sector?.biomeId ?? expedition.biomeId ?? 'forest']

    const echo = resolveMarchEcho({ steps, sector, biome, creatureId: selectedCreatureId })

    if (echo.xpGain > 0) {
      setPlayer(prev => ({ ...prev, xp: Math.min(prev.xpToNext, prev.xp + echo.xpGain) }))
    }
    if (Object.keys(echo.resources).length > 0) {
      setInventory(prev => addResources(prev, echo.resources))
    }
    if (echo.masteryGain > 0 && sector) {
      setSectors(prev => prev.map(s => {
        if (s.id !== sector.id) return s
        const newMastery = s.mastery + echo.masteryGain
        return { ...s, mastery: newMastery, masteryLevel: masteryLevelFromValue(newMastery) }
      }))
    }

    const diaryEntry = {
      id:          `echo-${Date.now()}`,
      type:        'march_echo',
      title:       echo.title,
      completedAt: new Date().toISOString(),
      steps:       echo.steps,
      sectorId:    sector?.id ?? expedition.sectorId,
      biomeId:     sector?.biomeId ?? expedition.biomeId ?? 'forest',
      rewards: {
        xp:          echo.xpGain,
        resources:   echo.resources,
        masteryGain: echo.masteryGain,
      },
      events:      echo.events,
      summaryText: echo.summaryText,
    }
    setDiary(prev => [...prev, diaryEntry])
    setStepSource(prev => consumeRecentSteps(prev, validation.steps))

    const now = new Date().toISOString()
    setLastEchoClaimAt(now)
    setLastEchoResult({ ...echo, sectorName: sector?.name ?? '—' })
    setEchoMessage(null)
  }

  // ── Contratos ────────────────────────────────────────────────────────────────
  function handleStartContract(contract) {
    const check = canStartContract({ contractState, expedition, combat })
    if (!check.ok) return
    const sector        = sectors.find(s => s.id === expedition?.sectorId)
    const successChance = getContractSuccessChance({ contract, player, sector })
    const active        = startContract({ contract: { ...contract, successChance }, now: new Date().toISOString() })
    setContractState(prev => ({ ...prev, activeContract: active }))
    setLastContractResult(null)
  }

  function handleResolveActiveContract() {
    if (!contractState.activeContract) return
    if (expedition?.status === 'combat' || combat?.status === 'awaiting_choice') return
    if (expedition?.status === 'marching') return

    const sector   = sectors.find(s => s.id === expedition?.sectorId)
    const resolved = resolveContract({ activeContract: contractState.activeContract, player, sector })
    if (!resolved) return

    const { xp = 0, resources = {} } = resolved.rewardsGranted ?? {}

    if (xp > 0) {
      setPlayer(prev => ({ ...prev, xp: Math.min(prev.xpToNext, prev.xp + xp) }))
    }
    if (Object.keys(resources).length > 0) {
      setInventory(prev => addResources(prev, resources))
    }

    const logEntry = {
      id:               resolved.id,
      title:            resolved.title,
      contractorName:   resolved.contractorName,
      sourcePoiId:      resolved.sourcePoiId,
      sourceSectorId:   resolved.sourceSectorId,
      sourceSectorName: resolved.sourceSectorName,
      risk:             resolved.risk,
      successChance:    resolved.successChance,
      outcome:          resolved.outcome,
      outcomeLabel:     resolved.outcomeLabel,
      startedAt:        resolved.startedAt,
      resolvedAt:       resolved.resolvedAt,
      rewardsGranted:   resolved.rewardsGranted,
      baseRewards:      resolved.baseRewards,
      summaryText:      resolved.summaryText,
      consequence:      resolved.consequence,
    }

    setContractState(prev => ({
      ...prev,
      activeContract:       null,
      completedContractIds: [...prev.completedContractIds, resolved.id],
      contractLog:          [...prev.contractLog, logEntry].slice(-50),
    }))

    const entry = {
      id:             `contract-${Date.now()}`,
      type:           'contract',
      title:          'Contrato completado',
      contractTitle:  resolved.title,
      contractorName: resolved.contractorName,
      sectorId:       resolved.sourceSectorId,
      sectorName:     resolved.sourceSectorName,
      poiId:          resolved.sourcePoiId,
      outcome:        resolved.outcome,
      outcomeLabel:   resolved.outcomeLabel,
      successChance:  resolved.successChance,
      summaryText:    resolved.summaryText,
      rewards:        { xp, resources },
      baseRewards:    resolved.baseRewards,
      consequence:    resolved.consequence,
      completedAt:    new Date().toISOString(),
      steps:          0,
    }
    setDiary(prev => [...prev, entry])
    setLastContractResult(resolved)
  }

  // ── Acción de lugar seguro ───────────────────────────────────────────────────
  function handleUsePoiAction() {
    const sector = sectors.find(s => s.id === expedition?.sectorId)
    if (!sector?.poiId) return
    const check = canUsePoiAction({ poiId: sector.poiId, player, expedition, combat })
    if (!check.ok) return
    const result = resolvePoiAction({ poiId: sector.poiId, player, sector })
    if (!result) return

    if (result.hpGain > 0) {
      setPlayer(prev => ({ ...prev, hp: Math.min(prev.maxHp, prev.hp + result.hpGain) }))
    }

    const entry = {
      id:          `poi-${Date.now()}`,
      type:        'poi',
      title:       `${result.poiName} · ${result.sectorName}`,
      sectorId:    result.sectorId,
      sectorName:  result.sectorName,
      poiId:       result.poiId,
      poiName:     result.poiName,
      hpGain:      result.hpGain,
      summaryText: result.summaryText,
      completedAt: new Date().toISOString(),
      steps:       0,
      rewards:     { xp: 0, resources: {} },
    }
    setDiary(prev => [...prev, entry])
    setLastPoiResult(result)
  }

  // ── Cleanup del listener de movimiento al desmontar ─────────────────────────
  useEffect(() => {
    return () => {
      if (motionHandlerRef.current) {
        window.removeEventListener('devicemotion', motionHandlerRef.current)
        motionHandlerRef.current = null
      }
    }
  }, [])

  // ── Simulación de marcha ─────────────────────────────────────────────────────
  useEffect(() => {
    if (expedition.status !== 'marching' || !player) return

    const interval = setInterval(() => {
      setExpedition(prev => {
        if (prev.status !== 'marching') return prev

        const newSteps     = Math.min(prev.currentSteps + 80, prev.targetSteps)
        const newProgress  = Math.round((newSteps / prev.targetSteps) * 100)
        const prevProgress = prev.progress

        const triggered     = THRESHOLDS.filter(t => prevProgress < t && newProgress >= t)
        const newEvents     = [...prev.events]
        const currentSector = sectors.find(s => s.id === prev.sectorId)
        for (const t of triggered) {
          newEvents.push(generateEvent(prev.modeId, player.creatureId, t, prev.biomeId, currentSector))
        }

        if (newSteps >= prev.targetSteps) {
          const rewards = calculateRewards(newEvents)

          if (prev.routeRun && !prev.routeRun.completed) {
            const route       = WORLD_ROUTES.find(r => r.id === prev.routeRun.routeId)
            const nextRouteRun = completeCurrentRouteSegment({
              routeRun: prev.routeRun,
              route,
              segments: WORLD_ROUTE_SEGMENTS,
            })

            if (!nextRouteRun.completed) {
              const nextSeg = WORLD_ROUTE_SEGMENTS.find(s => s.id === nextRouteRun.currentSegmentId)
              return {
                ...prev,
                currentSteps:  newSteps,
                progress:      100,
                events:        newEvents,
                rewards,
                routeRun:      nextRouteRun,
                status:        'segment_transition',
                segmentTransition: {
                  completedSegmentId:   prev.routeRun.currentSegmentId,
                  completedSegmentName: prev.routeSegmentName ?? '—',
                  nextSegmentId:        nextRouteRun.currentSegmentId,
                  nextSegmentName:      nextSeg?.name ?? '—',
                  nextSegmentOrder:     nextRouteRun.currentSegmentOrder,
                  nextTargetSteps:      nextSeg?.stepMax ?? prev.targetSteps,
                  secondsRemaining:     20,
                  startedAt:            new Date().toISOString(),
                },
              }
            }

            // All segments done — land at destination
            const destId     = nextRouteRun.toSectorId ?? prev.routeDestinationSectorId
            const destSector = INITIAL_SECTORS.find(s => s.id === destId)
            return {
              ...prev,
              currentSteps: newSteps,
              progress:     100,
              events:       newEvents,
              status:       'completed',
              rewards,
              routeRun:     nextRouteRun,
              sectorId:     destId  ?? prev.sectorId,
              biomeId:      destSector?.biomeId ?? prev.biomeId,
            }
          }

          return { ...prev, currentSteps: newSteps, progress: 100, events: newEvents, status: 'completed', rewards }
        }

        return { ...prev, currentSteps: newSteps, progress: newProgress, events: newEvents }
      })
    }, 800)

    return () => clearInterval(interval)
  }, [expedition.status, player])

  // ── Disparar combate cuando aparece una amenaza nueva ───────────────────────
  useEffect(() => {
    if (expedition.status !== 'marching') return
    if (combat.status !== 'none') return
    if ((expedition.combatResults?.length ?? 0) >= 1) return

    const threat = expedition.events.find(
      e => e.type === 'threat' && e.enemyId && !combatTriggered.current.has(e.id)
    )
    if (!threat) return

    combatTriggered.current.add(threat.id)
    const newCombat = createCombatFromThreat({ event: threat, enemies: ENEMIES })
    if (!newCombat) return

    newCombat.decisionSeconds  = COMBAT_DECISION_SECONDS
    newCombat.decisionEndsAt   = Date.now() + COMBAT_DECISION_SECONDS * 1000
    combatAutoResumeRef.current = false
    setCombat(newCombat)
    setExpedition(prev => prev.status === 'marching' ? { ...prev, status: 'combat' } : prev)
  }, [expedition.events, expedition.status, combat.status, expedition.combatResults])

  // ── Countdown y auto-avance de transición entre segmentos ───────────────────
  useEffect(() => {
    if (expedition.status !== 'segment_transition') return
    if (!expedition.segmentTransition) return

    // Tick every second, auto-advance at 0
    const id = setInterval(() => {
      setExpedition(prev => {
        if (prev.status !== 'segment_transition' || !prev.segmentTransition) return prev
        const next = prev.segmentTransition.secondsRemaining - 1
        if (next <= 0) {
          // Auto-advance to next segment
          const t = prev.segmentTransition
          return {
            ...prev,
            status:            'marching',
            currentSteps:      0,
            progress:          0,
            events:            [],
            rewards:           {},
            combatResults:     [],
            routeSegmentId:    t.nextSegmentId,
            routeSegmentName:  t.nextSegmentName,
            routeSegmentOrder: t.nextSegmentOrder,
            targetSteps:       t.nextTargetSteps,
            segmentTransition: null,
          }
        }
        return { ...prev, segmentTransition: { ...prev.segmentTransition, secondsRemaining: next } }
      })
    }, 1000)

    return () => clearInterval(id)
  }, [expedition.status, expedition.segmentTransition?.startedAt])

  // ── Añadir tramo completado a discoveredSegmentIds ───────────────────────────
  useEffect(() => {
    if (expedition.status !== 'segment_transition') return
    const segId = expedition.segmentTransition?.completedSegmentId
    if (!segId) return
    setDiscoveredSegmentIds(prev =>
      prev.includes(segId) ? prev : [...prev, segId]
    )
  }, [expedition.status, expedition.segmentTransition?.completedSegmentId])

  // ── Aviso global de tramo completado ────────────────────────────────────────
  useEffect(() => {
    if (expedition.status !== 'segment_transition') return
    const st = expedition.segmentTransition
    if (!st?.completedSegmentId) return
    const key = `${expedition.routeId ?? 'free'}_${st.completedSegmentId}`
    if (segNoticeFiredRef.current.has(key)) return
    segNoticeFiredRef.current.add(key)
    const completedSeg = WORLD_ROUTE_SEGMENTS.find(s => s.id === st.completedSegmentId)
    const route        = WORLD_ROUTES.find(r => r.id === expedition.routeId)
    const body         = completedSeg?.completion?.text
      ?? `La caravana dejó atrás ${st.completedSegmentName}.`
    setExpeditionNotices(prev => {
      const filtered = prev.filter(n => n.type !== 'segment_complete')
      return [...filtered, {
        id:              `notice-seg-${Date.now()}`,
        type:            'segment_complete',
        title:           'Tramo completado',
        subtitle:        st.completedSegmentName,
        body,
        routeId:         expedition.routeId ?? null,
        routeName:       route?.name ?? null,
        segmentId:       st.completedSegmentId,
        segmentName:     st.completedSegmentName,
        nextSegmentId:   st.nextSegmentId,
        nextSegmentName: st.nextSegmentName,
        rewards:         null,
        autoDismiss:     true,
        expiresAt:       Date.now() + 7000,
        createdAt:       Date.now(),
        minimized:       false,
      }]
    })
  }, [expedition.status, expedition.segmentTransition?.completedSegmentId])

  // ── Efectos de completado ────────────────────────────────────────────────────
  useEffect(() => {
    if (expedition.status !== 'completed' || completionDone.current || !player) return
    completionDone.current = true

    // Mark the last segment as discovered (the one that finished the route)
    if (expedition.routeRun?.completed && expedition.routeRun.currentSegmentId === null) {
      const lastCompletedId = expedition.routeRun.completedSegmentIds?.at(-1)
      if (lastCompletedId) {
        setDiscoveredSegmentIds(prev =>
          prev.includes(lastCompletedId) ? prev : [...prev, lastCompletedId]
        )
      }
    }

    const completedSector = sectors.find(s => s.id === expedition.sectorId)
    const sectorName      = completedSector?.name
    const masteryGain = expedition.rewards?.masteryGain ?? 2

    // Resolve discovery (uses sectors before mastery update)
    const { sectors: sectorsWithDiscovery, discovery } = resolveSectorDiscovery({
      sectors,
      currentSectorId: expedition.sectorId,
      modeId:          expedition.modeId,
      events:          expedition.events,
      masteryGain,
      player,
    })

    // Apply mastery/visits update on top of any discovery update
    const masteryUpdated = sectorsWithDiscovery.map(s => {
      if (s.id !== expedition.sectorId) return s
      const newMastery = s.mastery + masteryGain
      return { ...s, visits: s.visits + 1, mastery: newMastery, masteryLevel: masteryLevelFromValue(newMastery) }
    })

    // When completing a route, mark the destination sector as discovered
    let finalSectors = masteryUpdated
    if (expedition.routeRun?.completed) {
      const destId = expedition.sectorId
      const wasDiscovered = sectors.find(s => s.id === destId)?.discovered ?? false
      if (!wasDiscovered) {
        finalSectors = masteryUpdated.map(s =>
          s.id === destId ? { ...s, discovered: true, recentlyDiscovered: true } : s
        )
      }
    }
    setSectors(finalSectors)

    // Actualizar ubicación real de la caravana al destino de la ruta
    if (expedition.routeRun?.completed) {
      setCurrentLocation(buildLocationFromRouteDestination({
        routeRun: expedition.routeRun,
        sectors:  finalSectors,
      }))
    }

    const rawEntry = buildDiaryEntry(expedition, sectorName, discovery, completedSector)
    const fromSector = expedition.routeRun?.fromSectorId
      ? sectors.find(s => s.id === expedition.routeRun.fromSectorId)
      : null
    const entry = expedition.routeRun?.completed
      ? {
          ...rawEntry,
          title:       `Ruta completada · ${expedition.routeName ?? expedition.routeId ?? sectorName}`,
          summaryText: `La caravana recorrió ${expedition.routeRun.totalSegments} tramos internos entre ${fromSector?.name ?? '—'} y ${sectorName ?? '—'}. ${rawEntry.summaryText}`,
        }
      : rawEntry
    setDiary(prev => [...prev, entry])

    // Aviso global de ruta completada
    if (expedition.routeRun?.completed) {
      const noticeRoute    = WORLD_ROUTES.find(r => r.id === expedition.routeRun?.routeId)
      const noticeDest     = INITIAL_SECTORS.find(s => s.id === (expedition.routeRun?.toSectorId ?? expedition.sectorId))
      const noticeCount    = expedition.routeRun.completedSegmentIds?.length ?? 0
      const noticePlural   = noticeCount !== 1
      setExpeditionNotices(prev => {
        const filtered = prev.filter(n => n.type !== 'route_complete' && n.type !== 'segment_complete')
        return [...filtered, {
          id:          `notice-route-${Date.now()}`,
          type:        'route_complete',
          title:       'Ruta completada',
          subtitle:    noticeRoute?.name ?? expedition.routeId ?? '—',
          body:        `La caravana alcanzó ${noticeDest?.name ?? '—'}. ${noticeCount} tramo${noticePlural ? 's' : ''} cartografiado${noticePlural ? 's' : ''}.`,
          routeId:     expedition.routeRun?.routeId ?? null,
          routeName:   noticeRoute?.name ?? null,
          segmentId:   null,
          segmentName: null,
          nextSegmentId:   null,
          nextSegmentName: null,
          rewards:     expedition.rewards ?? null,
          autoDismiss: false,
          expiresAt:   null,
          createdAt:   Date.now(),
          minimized:   false,
        }]
      })
    }

    if (expedition.rewards?.resources) {
      setInventory(prev => addResources(prev, expedition.rewards.resources))
    }

    const xpGain = expedition.rewards?.xp ?? 0
    if (xpGain > 0) {
      setPlayer(prev => ({ ...prev, xp: Math.min(prev.xp + xpGain, prev.xpToNext) }))
    }

    if (discovery) {
      setLastDiscovery(discovery)
    } else if (expedition.routeRun?.completed) {
      const destId = expedition.sectorId
      const destSector = sectors.find(s => s.id === destId)
      if (destSector && !destSector.discovered) {
        setLastDiscovery({ sectorId: destId, sectorName: destSector.name, biomeId: destSector.biomeId, reason: 'Ruta completada' })
      }
    }
  }, [expedition, player])

  // ── Autoguardado ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!hasStarted || !player || !selectedArchetypeId || !selectedCreatureId) return

    const snapshot = createSaveSnapshot({
      player,
      selectedArchetypeId,
      selectedCreatureId,
      inventory,
      diary,
      sectors,
      expedition,
      lastEchoClaimAt,
      stepSource,
      contractState,
      discoveredSegmentIds,
      currentLocation,
    })
    writeSave(snapshot)
    setLastSaved(new Date())
  }, [
    // eslint-disable-next-line react-hooks/exhaustive-deps
    player,
    selectedArchetypeId,
    selectedCreatureId,
    inventory,
    diary,
    sectors,
    expedition.currentTramo,
    expedition.modeId,
    expedition.sectorId,
    expedition.status,   // captures marching/combat start for recovery note
    contractState,
  ])

  // ── Auto-resume tras combate resuelto (activo en cualquier pestaña) ──────────
  useEffect(() => {
    if (combat.status !== 'resolved') { combatAutoResumeRef.current = false; return }
    if (combatAutoResumeRef.current) return
    combatAutoResumeRef.current = true
    const id = setTimeout(handleContinueMarch, 1200)
    return () => clearTimeout(id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [combat.status])

  // ── Render ───────────────────────────────────────────────────────────────────
  function renderTab() {
    switch (currentTab) {
      case 'caravana':
        return (
          <CaravanScreen
            player={player}
            expedition={expedition}
            sectors={sectors}
            combat={combat}
            currentLocation={currentLocation}
            lastSaved={lastSaved}
            recoveredFromInterruption={recoveredFromInterruption}
            onAlzar={handleAlzar}
            onSelectMode={handleSelectMode}
            onSelectSector={handleSelectSector}
            onResolveCombat={handleResolveCombat}
            onContinueMarch={handleContinueMarch}
            onContinueToNextSegment={handleContinueToNextSegment}
            onAbandonExpedition={handleAbandonExpedition}
            onPrepareNext={handlePrepareNext}
            onResetGame={resetGame}
            onGoToMap={() => setCurrentTab('mapa')}
            onClaimEcho={handleClaimMarchEcho}
            echoMessage={echoMessage}
            lastEchoResult={lastEchoResult}
            lastDiscovery={lastDiscovery}
            stepSource={stepSource}
            pedometer={pedometer}
            onStartPedometer={handleStartPedometer}
            onStopPedometer={handleStopPedometer}
            onAddPrototypeSteps={handleAddPrototypeSteps}
            lastPoiResult={lastPoiResult}
            onUsePoiAction={handleUsePoiAction}
            contractState={contractState}
            lastContractResult={lastContractResult}
            onStartContract={handleStartContract}
            onResolveActiveContract={handleResolveActiveContract}
          />
        )
      case 'mapa':       return (
        <MapScreen
          sectors={sectors}
          expedition={expedition}
          discoveredSegmentIds={discoveredSegmentIds}
          currentLocation={currentLocation}
          cameraState={mapCameraState}
          onCameraChange={setMapCameraState}
          onGoToCaravan={() => setCurrentTab('caravana')}
        />
      )
      case 'diario':     return <DiaryScreen      diary={diary} />
      case 'inventario': return <InventoryScreen  inventory={inventory} />
      case 'criatura':   return <CreatureScreen   player={player} />
      case 'codice':     return (
        <CodexScreen
          player={player}
          sectors={sectors}
          inventory={inventory}
          diary={diary}
        />
      )
      default:           return null
    }
  }

  if (!hasStarted) {
    return (
      <div className="app-root" style={{ overflow: 'auto' }}>
        <StartScreen
          onStart={handleStart}
          hasSave={hasSaveFlag}
          onContinue={handleContinue}
          onNewGame={resetGame}
        />
      </div>
    )
  }

  const appFlowClass = [
    combat?.status === 'awaiting_choice'   ? 'flow-combat-alert'       : '',
    expedition?.status === 'segment_transition' ? 'flow-segment-transition' : '',
    mapCameraState?.viewLevel ? `map-view-${mapCameraState.viewLevel}` : '',
  ].filter(Boolean).join(' ')

  return (
    <AppShell currentTab={currentTab} onChangeTab={setCurrentTab} flowClass={appFlowClass}>
      {renderTab()}
      {(combat.status === 'awaiting_choice' || combat.status === 'resolved') && currentTab !== 'caravana' && (
        <CombatAlertModal
          combat={combat}
          player={player}
          onChooseStance={handleResolveCombat}
          onGoToCaravan={() => setCurrentTab('caravana')}
        />
      )}
      <ExpeditionNoticeDock
        notices={expeditionNotices}
        combat={combat}
        currentTab={currentTab}
        onDismiss={id => setExpeditionNotices(prev => prev.filter(n => n.id !== id))}
        onMinimize={id => setExpeditionNotices(prev => prev.map(n => n.id === id ? { ...n, minimized: !n.minimized } : n))}
        onGoToMap={() => setCurrentTab('mapa')}
        onGoToCaravan={() => setCurrentTab('caravana')}
        onGoToInventory={() => setCurrentTab('inventario')}
      />
    </AppShell>
  )
}
