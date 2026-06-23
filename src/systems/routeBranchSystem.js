export const ROUTE_BRANCH_STATUS = {
  UNKNOWN:  'unknown',
  KNOWN:    'known',
  MASTERED: 'mastered',
}

export const ROUTE_BRANCH_RISK = {
  LOW:    'low',
  MEDIUM: 'medium',
  HIGH:   'high',
}

export const ROUTE_BRANCH_REWARD_STYLE = {
  SAFE:     'safe',
  RESOURCE: 'resource',
  SECRET:   'secret',
  COMBAT:   'combat',
  REST:     'rest',
  SHORTCUT: 'shortcut',
}

// ── Helpers de conocimiento ───────────────────────────────────────────────────
// Knowledge is keyed by optionId so each arm of a fork is tracked independently.

export function createInitialBranchKnowledge() {
  return {}
}

export function sanitizeBranchKnowledge(raw) {
  if (!raw || typeof raw !== 'object') return {}
  const out = {}
  for (const [id, entry] of Object.entries(raw)) {
    if (!entry || typeof entry !== 'object') continue
    out[id] = {
      optionId:      entry.optionId ?? id,
      branchId:      entry.branchId ?? null,
      chosenCount:   Number(entry.chosenCount) || 0,
      firstChosenAt: entry.firstChosenAt ?? null,
      lastChosenAt:  entry.lastChosenAt ?? null,
      knownRisk:     entry.knownRisk ?? null,
      knownRewards:  Array.isArray(entry.knownRewards) ? entry.knownRewards : [],
      eventsSeen:    Array.isArray(entry.eventsSeen)   ? entry.eventsSeen   : [],
      mastered:      entry.mastered ?? false,
      mastery:       Number(entry.mastery) || 0,
    }
  }
  return out
}

export function getBranchKnowledge(branchKnowledge, optionId) {
  return branchKnowledge?.[optionId] ?? null
}

export function getBranchVisitCount(branchKnowledge, optionId) {
  return branchKnowledge?.[optionId]?.chosenCount ?? 0
}

export function isBranchKnown(branchKnowledge, optionId) {
  return (branchKnowledge?.[optionId]?.chosenCount ?? 0) >= 1
}

export function isBranchMastered(branchKnowledge, optionId) {
  return branchKnowledge?.[optionId]?.mastered === true
}

// Returns negative modifier (threat reduction) based on familiarity with this arm.
export function getFamiliarityThreatReduction(knowledge) {
  if (!knowledge?.chosenCount) return 0
  if (knowledge.mastered)            return -0.12
  if (knowledge.chosenCount >= 3)    return -0.08
  return -0.05
}

export function getBranchRiskModifier(option, knowledge) {
  return (option?.threatModifier ?? 0) + getFamiliarityThreatReduction(knowledge)
}

// Applies a single branch choice and returns the updated branchKnowledge object.
export function applyBranchChoice({ branchKnowledge, branchId, optionId, option, now }) {
  const existing = branchKnowledge[optionId] ?? {
    optionId,
    branchId,
    chosenCount:   0,
    firstChosenAt: null,
    lastChosenAt:  null,
    knownRisk:     null,
    knownRewards:  [],
    eventsSeen:    [],
    mastered:      false,
    mastery:       0,
  }
  const masteryGain     = option?.risk === 'high' ? 35 : option?.risk === 'medium' ? 25 : 20
  const newChosenCount  = existing.chosenCount + 1
  const newMastery      = Math.min(100, existing.mastery + masteryGain)
  return {
    ...branchKnowledge,
    [optionId]: {
      ...existing,
      optionId,
      branchId,
      chosenCount:   newChosenCount,
      firstChosenAt: existing.firstChosenAt ?? new Date(now).toISOString(),
      lastChosenAt:  new Date(now).toISOString(),
      knownRisk:     option?.risk ?? existing.knownRisk,
      mastered:      newMastery >= 100 || newChosenCount >= 5,
      mastery:       newMastery,
    },
  }
}

// Returns UI summary for one option based on its knowledge entry.
export function getBranchChoiceSummary({ knowledge }) {
  if (!knowledge || knowledge.chosenCount === 0) {
    return {
      status:      'unknown',
      label:       'No cartografiada',
      description: 'Riesgo estimado: incierto',
    }
  }
  const visits = knowledge.chosenCount
  if (knowledge.mastered) {
    return {
      status:      'mastered',
      label:       `Dominada · ${visits} visita${visits !== 1 ? 's' : ''}`,
      description: 'Paso familiar: amenaza muy reducida',
    }
  }
  const riskLabel = knowledge.knownRisk === 'high' ? 'alto'
    : knowledge.knownRisk === 'medium' ? 'medio'
    : knowledge.knownRisk === 'low' ? 'bajo'
    : '?'
  return {
    status:      'known',
    label:       `Conocida · ${visits} visita${visits !== 1 ? 's' : ''}`,
    description: `Riesgo aprendido: ${riskLabel}`,
  }
}

// Returns the enriched branch choice ready for display, or null if none pending.
export function getAvailableBranchChoice({ expedition, routeBranches, branchKnowledge }) {
  if (expedition?.status !== 'branch_choice' || !expedition.pendingBranchChoice) return null
  const choice = expedition.pendingBranchChoice
  const branch = (routeBranches ?? []).find(b => b.id === choice.branchId)
  if (!branch) return null
  return {
    ...choice,
    options: branch.options.map(opt => ({
      ...opt,
      knowledge: branchKnowledge[opt.id] ?? null,
      summary:   getBranchChoiceSummary({ knowledge: branchKnowledge[opt.id] ?? null }),
    })),
  }
}
