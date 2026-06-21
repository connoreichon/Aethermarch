export const CONTRACT_STATUS = {
  AVAILABLE: 'available',
  ACTIVE:    'active',
  COMPLETED: 'completed',
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

// ── Acciones ──────────────────────────────────────────────────────────────────

export function startContract({ contract, now }) {
  return {
    ...contract,
    startedAt: now ?? new Date().toISOString(),
    status:    CONTRACT_STATUS.ACTIVE,
  }
}

export function resolveContract({ activeContract }) {
  if (!activeContract) return null
  const rewards = activeContract.rewards ?? { xp: 0, resources: {} }
  return {
    ...activeContract,
    resolvedAt:  new Date().toISOString(),
    status:      CONTRACT_STATUS.COMPLETED,
    rewards,
    summaryText: `${activeContract.contractorName} completó "${activeContract.title}". La caravana recibe la recompensa acordada.`,
  }
}

export function getContractRewardText(rewards) {
  const parts = []
  if ((rewards?.xp ?? 0) > 0) parts.push(`+${rewards.xp} XP`)
  for (const [id, qty] of Object.entries(rewards?.resources ?? {})) {
    parts.push(`${id.replace(/_/g, ' ')} ×${qty}`)
  }
  return parts.join(' · ')
}
