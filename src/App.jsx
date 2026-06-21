import { useState, useEffect, useRef } from 'react'
import { ARCHETYPES, BIOMES, ENEMIES, INITIAL_SECTORS } from './data/gameData.js'
import { emptyInventory, addResources } from './systems/inventorySystem.js'
import { generateEvent, calculateRewards, buildDiaryEntry } from './systems/expeditionSystem.js'
import { createCombatFromThreat, resolveCombatTurn } from './systems/combatSystem.js'
import { canClaimEcho, resolveMarchEcho } from './systems/echoSystem.js'
import { resolveSectorDiscovery, clearRecentDiscoveries } from './systems/mapSystem.js'
import {
  loadSave, writeSave, clearSave,
  createSaveSnapshot, sanitizeLoadedSave,
} from './systems/saveSystem.js'
import AppShell        from './components/AppShell.jsx'
import StartScreen     from './screens/StartScreen.jsx'
import CaravanScreen   from './screens/CaravanScreen.jsx'
import MapScreen       from './screens/MapScreen.jsx'
import DiaryScreen     from './screens/DiaryScreen.jsx'
import InventoryScreen from './screens/InventoryScreen.jsx'
import CreatureScreen  from './screens/CreatureScreen.jsx'

const THRESHOLDS = [20, 40, 60, 80]

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

  const completionDone  = useRef(false)
  const combatTriggered = useRef(new Set())

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

    completionDone.current  = false
    combatTriggered.current = new Set()
    setHasSaveFlag(false)
    setHasStarted(true)
  }

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
    setHasSaveFlag(false)
    completionDone.current  = false
    combatTriggered.current = new Set()
    setHasStarted(false)
  }

  // ── Handlers de caravana ─────────────────────────────────────────────────────
  function handleAlzar() {
    completionDone.current  = false
    combatTriggered.current = new Set()
    setCombat(INITIAL_COMBAT)
    setRecoveredFromInterruption(false)
    setExpedition(prev => ({
      ...prev,
      status:        'marching',
      currentSteps:  0,
      progress:      0,
      events:        [],
      rewards:       {},
      combatResults: [],
    }))
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
    setExpedition(prev => ({
      ...INITIAL_EXPEDITION,
      currentTramo: prev.currentTramo + 1,
      modeId:       prev.modeId,
      sectorId:     prev.sectorId,
      biomeId:      prev.biomeId,
    }))
    setLastDiscovery(null)
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

  // ── Eco de Marcha ────────────────────────────────────────────────────────────
  function handleClaimMarchEcho(rawSteps) {
    if (!player || !selectedArchetypeId || !selectedCreatureId) return

    const validation = canClaimEcho({ rawSteps, expedition, combat, lastEchoClaimAt })

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

    const now = new Date().toISOString()
    setLastEchoClaimAt(now)
    setLastEchoResult({ ...echo, sectorName: sector?.name ?? '—' })
    setEchoMessage(null)
  }

  // ── Simulación de marcha ─────────────────────────────────────────────────────
  useEffect(() => {
    if (expedition.status !== 'marching' || !player) return

    const interval = setInterval(() => {
      setExpedition(prev => {
        if (prev.status !== 'marching') return prev

        const newSteps     = Math.min(prev.currentSteps + 80, prev.targetSteps)
        const newProgress  = Math.round((newSteps / prev.targetSteps) * 100)
        const prevProgress = prev.progress

        const triggered = THRESHOLDS.filter(t => prevProgress < t && newProgress >= t)
        const newEvents  = [...prev.events]
        for (const t of triggered) {
          newEvents.push(generateEvent(prev.modeId, player.creatureId, t, prev.biomeId))
        }

        if (newSteps >= prev.targetSteps) {
          const rewards = calculateRewards(newEvents)
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

    setCombat(newCombat)
    setExpedition(prev => prev.status === 'marching' ? { ...prev, status: 'combat' } : prev)
  }, [expedition.events, expedition.status, combat.status, expedition.combatResults])

  // ── Efectos de completado ────────────────────────────────────────────────────
  useEffect(() => {
    if (expedition.status !== 'completed' || completionDone.current || !player) return
    completionDone.current = true

    const sectorName  = sectors.find(s => s.id === expedition.sectorId)?.name
    const masteryGain = expedition.rewards?.masteryGain ?? 2

    // Resolve discovery (uses sectors before mastery update)
    const { sectors: sectorsWithDiscovery, discovery } = resolveSectorDiscovery({
      sectors,
      currentSectorId: expedition.sectorId,
      modeId:          expedition.modeId,
      events:          expedition.events,
      masteryGain,
    })

    // Apply mastery/visits update on top of any discovery update
    const finalSectors = sectorsWithDiscovery.map(s => {
      if (s.id !== expedition.sectorId) return s
      const newMastery = s.mastery + masteryGain
      return { ...s, visits: s.visits + 1, mastery: newMastery, masteryLevel: masteryLevelFromValue(newMastery) }
    })
    setSectors(finalSectors)

    const entry = buildDiaryEntry(expedition, sectorName, discovery)
    setDiary(prev => [...prev, entry])

    if (expedition.rewards?.resources) {
      setInventory(prev => addResources(prev, expedition.rewards.resources))
    }

    const xpGain = expedition.rewards?.xp ?? 0
    if (xpGain > 0) {
      setPlayer(prev => ({ ...prev, xp: Math.min(prev.xp + xpGain, prev.xpToNext) }))
    }

    if (discovery) setLastDiscovery(discovery)
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
  ])

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
            lastSaved={lastSaved}
            recoveredFromInterruption={recoveredFromInterruption}
            onAlzar={handleAlzar}
            onSelectMode={handleSelectMode}
            onSelectSector={handleSelectSector}
            onResolveCombat={handleResolveCombat}
            onContinueMarch={handleContinueMarch}
            onPrepareNext={handlePrepareNext}
            onResetGame={resetGame}
            onClaimEcho={handleClaimMarchEcho}
            echoMessage={echoMessage}
            lastEchoResult={lastEchoResult}
            lastDiscovery={lastDiscovery}
          />
        )
      case 'mapa':       return <MapScreen       sectors={sectors} />
      case 'diario':     return <DiaryScreen      diary={diary} />
      case 'inventario': return <InventoryScreen  inventory={inventory} />
      case 'criatura':   return <CreatureScreen   player={player} />
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

  return (
    <AppShell currentTab={currentTab} onChangeTab={setCurrentTab}>
      {renderTab()}
    </AppShell>
  )
}
