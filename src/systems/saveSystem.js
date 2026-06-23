export const SAVE_KEY     = 'aethermarch_save_v1'
export const SAVE_VERSION = 1

// Statuses that indicate an active session (march / combat in progress)
const ACTIVE_STATUSES = ['marching', 'combat']
// Statuses that must be sanitized to 'resting' before writing
// branch_choice is intentionally excluded — it must survive a reload
const UNSAFE_STATUSES = ['marching', 'combat', 'awaiting_choice', 'resolved', 'completed', 'segment_transition']

// ── Acceso a localStorage ─────────────────────────────────────────────────────

export function hasSave() {
  try { return !!localStorage.getItem(SAVE_KEY) } catch { return false }
}

export function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export function writeSave(saveData) {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(saveData)) } catch { /* quota / privacy */ }
}

export function clearSave() {
  try { localStorage.removeItem(SAVE_KEY) } catch { /* ignore */ }
}

// ── Crear snapshot serializable desde el estado de App ────────────────────────

export function createSaveSnapshot({
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
  branchKnowledge,
}) {
  // Track whether the save was created while a run was active
  const wasActive = ACTIVE_STATUSES.includes(expedition?.status)

  const safeExp = { ...(expedition ?? {}) }
  if (UNSAFE_STATUSES.includes(safeExp.status)) {
    safeExp.status        = 'resting'
    safeExp.currentSteps  = 0
    safeExp.progress      = 0
    safeExp.events        = []
    safeExp.rewards       = {}
    safeExp.combatResults = []
  }

  return {
    version:             SAVE_VERSION,
    savedAt:             new Date().toISOString(),
    player,
    selectedArchetypeId,
    selectedCreatureId,
    inventory,
    diary,
    sectors,
    expedition:            safeExp,
    lastEchoClaimAt:       lastEchoClaimAt ?? null,
    stepSource:            stepSource ?? null,
    contractState:         contractState ?? null,
    discoveredSegmentIds:  Array.isArray(discoveredSegmentIds) ? discoveredSegmentIds : [],
    currentLocation:       currentLocation ?? null,
    branchKnowledge:       branchKnowledge ?? {},
    meta: {
      recoveredFromInterruptedRun: wasActive,
    },
  }
}

// ── Validar y sanear partida cargada ──────────────────────────────────────────

export function sanitizeLoadedSave(rawSave) {
  if (!rawSave || rawSave.version !== SAVE_VERSION) return null
  if (!rawSave.player || typeof rawSave.player !== 'object') return null
  if (!rawSave.selectedArchetypeId || !rawSave.selectedCreatureId) return null
  if (!rawSave.inventory || typeof rawSave.inventory !== 'object') return null
  if (!Array.isArray(rawSave.diary)) return null
  if (!Array.isArray(rawSave.sectors) || rawSave.sectors.length === 0) return null

  const save = JSON.parse(JSON.stringify(rawSave))  // deep clone

  // Safety net: sanitize dangerous statuses that should not have been saved
  const exp            = save.expedition ?? {}
  const wasInterrupted = ACTIVE_STATUSES.includes(exp.status)
  const needsSanitize  = UNSAFE_STATUSES.includes(exp.status)

  if (needsSanitize) {
    save.expedition = {
      ...exp,
      status:        'resting',
      currentSteps:  0,
      progress:      0,
      events:        [],
      rewards:       {},
      combatResults: [],
    }
  }
  if (wasInterrupted) {
    save.meta = { ...(save.meta ?? {}), recoveredFromInterruptedRun: true }
  }

  save.discoveredSegmentIds = Array.isArray(save.discoveredSegmentIds)
    ? save.discoveredSegmentIds
    : []

  // If branch_choice was saved but pendingBranchChoice is missing, reset safely
  if (save.expedition?.status === 'branch_choice' && !save.expedition?.pendingBranchChoice) {
    save.expedition = { ...save.expedition, status: 'resting', pendingBranchChoice: null }
  }

  save.branchKnowledge = (save.branchKnowledge && typeof save.branchKnowledge === 'object')
    ? save.branchKnowledge
    : {}

  return save
}
