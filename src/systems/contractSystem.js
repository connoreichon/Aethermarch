import { RESOURCES } from '../data/gameData.js'

export const CONTRACT_STATUS = {
  AVAILABLE: 'available',
  ACTIVE:    'active',
  COMPLETED: 'completed',
}

export const CONTRACT_OUTCOMES = {
  SUCCESS: 'success',
  PARTIAL: 'partial',
  FAILURE: 'failure',
}

const RISK_LABELS = { low: 'Bajo', medium: 'Medio', high: 'Alto' }

const CONTRACT_TEMPLATES = {
  shelter: {
    id:             'shelter_repair_markers',
    title:          'Reparar marcas de farol',
    type:           'maintenance',
    contractorName: 'Mira de las Cornisas',
    durationLabel:  '45 min',
    risk:           'low',
    description:    'Mira revisa las marcas del sendero cercano para que otras caravanas no se pierdan entre raíces.',
    rewards:        { xp: 4, resources: { runic_wood: 1 } },
  },
  trader: {
    id:             'trader_courier',
    title:          'Recado del mercader',
    type:           'courier',
    contractorName: 'Tolk el Salinero',
    durationLabel:  '1 h',
    risk:           'low',
    description:    'Un mercader pide entregar un paquete sellado a otro grupo de paso. Dice que no pesa, pero no deja de mirarlo.',
    rewards:        { xp: 3, resources: { aethel_root: 1 } },
  },
  inn: {
    id:             'inn_scout_route',
    title:          'Guía hasta una senda segura',
    type:           'scout',
    contractorName: 'Mira de las Cornisas',
    durationLabel:  '2 h',
    risk:           'medium',
    description:    'Una guía acepta revisar una ruta lateral y marcar señales para futuras expediciones.',
    rewards:        { xp: 6, resources: { arcane_salt: 1 } },
  },
  tavern: {
    id:             'tavern_sealed_chamber',
    title:          'Rumor de cámara sellada',
    type:           'intel',
    contractorName: 'Dos el Silencioso',
    durationLabel:  '3 h',
    risk:           'medium',
    description:    'Entre murmullos, alguien menciona una cámara cerrada. Dos puede comprobar si la pista es real.',
    rewards:        { xp: 7, resources: { tide_crystal: 1 } },
  },
  forge: {
    id:             'forge_ember_survey',
    title:          'Inspección de brasas antiguas',
    type:           'forge_survey',
    contractorName: 'Sala la Herrera',
    durationLabel:  '2 h',
    risk:           'medium',
    description:    'Sala revisa restos de forja y busca metal aprovechable entre placas y carbón.',
    rewards:        { xp: 5, resources: { forge_mineral: 1 } },
  },
  supply: {
    id:             'supply_box_inventory',
    title:          'Inventario de cajas viejas',
    type:           'supply_check',
    contractorName: 'Tolk el Salinero',
    durationLabel:  '1 h',
    risk:           'low',
    description:    'Tolk revisa cajas antiguas del puesto y separa lo útil de lo podrido.',
    rewards:        { xp: 4, resources: { resonant_coal: 1 } },
  },
}

// ── Estado inicial ────────────────────────────────────────────────────────────

export function createInitialContractState() {
  return {
    activeContract:       null,
    completedContractIds: [],
    contractLog:          [],
  }
}

export function sanitizeContractState(raw) {
  if (!raw || typeof raw !== 'object') return createInitialContractState()
  return {
    activeContract:       (raw.activeContract && typeof raw.activeContract === 'object')
                            ? raw.activeContract
                            : null,
    completedContractIds: Array.isArray(raw.completedContractIds) ? raw.completedContractIds : [],
    contractLog:          Array.isArray(raw.contractLog) ? raw.contractLog : [],
  }
}

// ── Consultas ─────────────────────────────────────────────────────────────────

export function getAvailableContracts({ sector, contractState }) {
  if (!sector?.poiId) return []
  const template = CONTRACT_TEMPLATES[sector.poiId]
  if (!template) return []
  if (contractState?.activeContract) return []
  if ((contractState?.completedContractIds ?? []).includes(template.id)) return []
  return [{
    ...template,
    riskLabel:        RISK_LABELS[template.risk] ?? template.risk,
    sourcePoiId:      sector.poiId,
    sourceSectorId:   sector.id,
    sourceSectorName: sector.name,
  }]
}

export function isSectorContractCompleted(poiId, contractState) {
  const template = CONTRACT_TEMPLATES[poiId]
  if (!template) return false
  return (contractState?.completedContractIds ?? []).includes(template.id)
}

export function canStartContract({ contractState, expedition, combat }) {
  if (contractState?.activeContract)
    return { ok: false, reason: 'Ya hay un contrato activo.' }
  if (expedition?.status === 'marching')
    return { ok: false, reason: 'No puedes aceptar contratos mientras la caravana está en marcha.' }
  if (expedition?.status === 'combat' || combat?.status === 'awaiting_choice')
    return { ok: false, reason: 'No puedes aceptar contratos durante un combate.' }
  return { ok: true }
}

// ── Probabilidad ──────────────────────────────────────────────────────────────

export function getContractSuccessChance({ contract, player, sector }) {
  const BASE = { low: 85, medium: 65, high: 45 }
  let chance = BASE[contract.risk] ?? 65

  if (player?.archetypeId === 'rastreador' && (contract.type === 'scout' || contract.type === 'intel')) chance += 10
  if (player?.archetypeId === 'guardian'   && (contract.type === 'maintenance' || contract.type === 'courier')) chance += 5
  if (player?.archetypeId === 'runario'    && (contract.type === 'intel' || contract.type === 'forge_survey')) chance += 8

  if (player?.creatureId === 'velthar' && (contract.type === 'scout' || contract.type === 'intel')) chance += 8
  if (player?.creatureId === 'brontik' && (contract.risk === 'medium' || contract.risk === 'high')) chance += 5
  if (player?.creatureId === 'lumora'  && Object.keys(contract.rewards?.resources ?? {}).length > 0) chance += 5

  if (sector?.threat === 'high')        chance -= 10
  else if (sector?.threat === 'medium') chance -= 5
  if (sector?.masteryLevel >= 3)        chance += 10
  else if (sector?.masteryLevel >= 2)   chance += 5

  return Math.min(95, Math.max(5, Math.round(chance)))
}

export function getContractOutcomeLabel(outcome) {
  if (outcome === CONTRACT_OUTCOMES.SUCCESS) return 'Éxito'
  if (outcome === CONTRACT_OUTCOMES.PARTIAL) return 'Éxito parcial'
  if (outcome === CONTRACT_OUTCOMES.FAILURE) return 'Fracaso'
  return '—'
}

const OUTCOME_TEXTS = {
  [CONTRACT_OUTCOMES.SUCCESS]: 'El encargo se completó sin incidentes. La recompensa llega íntegra a la caravana.',
  [CONTRACT_OUTCOMES.PARTIAL]: 'El encargo se completó con complicaciones. Parte del botín se perdió durante el regreso.',
  [CONTRACT_OUTCOMES.FAILURE]: 'El encargo salió mal. No hubo pérdidas graves, pero el contratista volvió sin materiales útiles.',
}

// ── Acciones ──────────────────────────────────────────────────────────────────

export function startContract({ contract, now }) {
  return {
    ...contract,
    startedAt: now ?? new Date().toISOString(),
    status:    CONTRACT_STATUS.ACTIVE,
  }
}

export function resolveContract({ activeContract, player, sector, now, randomValue }) {
  if (!activeContract) return null

  const successChance = getContractSuccessChance({ contract: activeContract, player, sector })
  const roll          = Math.round((randomValue !== undefined ? randomValue : Math.random()) * 100)

  let outcome
  if (roll <= successChance) {
    outcome = CONTRACT_OUTCOMES.SUCCESS
  } else if (roll - successChance <= 20) {
    outcome = CONTRACT_OUTCOMES.PARTIAL
  } else {
    outcome = CONTRACT_OUTCOMES.FAILURE
  }

  const baseRewards = activeContract.rewards ?? { xp: 0, resources: {} }
  let rewardsGranted

  if (outcome === CONTRACT_OUTCOMES.SUCCESS) {
    rewardsGranted = { xp: baseRewards.xp ?? 0, resources: { ...baseRewards.resources } }
  } else if (outcome === CONTRACT_OUTCOMES.PARTIAL) {
    const xp        = Math.ceil((baseRewards.xp ?? 0) / 2)
    const resources = {}
    for (const [id, qty] of Object.entries(baseRewards.resources ?? {})) {
      resources[id] = Math.max(1, Math.ceil(qty / 2))
    }
    rewardsGranted = { xp, resources }
  } else {
    rewardsGranted = { xp: 1, resources: {} }
  }

  const consequence = outcome === CONTRACT_OUTCOMES.FAILURE
    ? { type: 'delay', text: 'El encargo no salió bien. La caravana gana experiencia, pero no obtiene materiales.' }
    : null

  return {
    ...activeContract,
    resolvedAt:    now ?? new Date().toISOString(),
    status:        CONTRACT_STATUS.COMPLETED,
    successChance,
    roll,
    outcome,
    outcomeLabel:  getContractOutcomeLabel(outcome),
    baseRewards,
    rewardsGranted,
    summaryText:   OUTCOME_TEXTS[outcome],
    consequence,
  }
}

export function getContractRewardText(rewards) {
  const parts = []
  if ((rewards?.xp ?? 0) > 0) parts.push(`+${rewards.xp} XP`)
  for (const [id, qty] of Object.entries(rewards?.resources ?? {})) {
    const name = RESOURCES[id]?.name ?? id.replace(/_/g, ' ')
    parts.push(`${name} ×${qty}`)
  }
  return parts.join(' · ')
}
