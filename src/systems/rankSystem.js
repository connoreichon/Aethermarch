export const PLAYER_RANKS = [
  {
    id: 'rank_1',
    number: 1,
    name: 'Iniciado',
    label: 'Rango I · Iniciado',
    description: 'Primeras bajadas al Abismo. La caravana aún depende de sus propios pasos.',
  },
  {
    id: 'rank_2',
    number: 2,
    name: 'Caminante',
    label: 'Rango II · Caminante',
    description: 'El Abismo empieza a reconocer tu ruta. Algunos exploradores aceptarían encargos menores.',
  },
  {
    id: 'rank_3',
    number: 3,
    name: 'Explorador',
    label: 'Rango III · Explorador',
    description: 'Tu nombre circula entre posadas, refugios y guías del descenso.',
  },
]

// ── Calcular rango del jugador ────────────────────────────────────────────────
// Derivado del estado actual — no necesita guardarse por separado.

export function getPlayerRank({ player, sectors, contractState }) {
  const xp           = player?.xp ?? 0
  const discovered   = (sectors ?? []).filter(s => s.discovered).length
  const completed    = (contractState?.completedContractIds ?? []).length

  const r3 = [xp >= 75, discovered >= 5, completed >= 5].filter(Boolean).length
  if (r3 >= 2) return PLAYER_RANKS[2]

  const r2 = [xp >= 25, discovered >= 3, completed >= 2].filter(Boolean).length
  if (r2 >= 2) return PLAYER_RANKS[1]

  return PLAYER_RANKS[0]
}

// ── Progreso hacia el siguiente rango ─────────────────────────────────────────

export function getNextRankRequirement({ player, sectors, contractState }) {
  const current    = getPlayerRank({ player, sectors, contractState })
  if (current.number >= PLAYER_RANKS.length) return null

  const xp         = player?.xp ?? 0
  const discovered = (sectors ?? []).filter(s => s.discovered).length
  const completed  = (contractState?.completedContractIds ?? []).length

  if (current.number === 1) {
    const conditions = [
      { label: 'XP ≥ 25',               met: xp >= 25 },
      { label: '3 sectores descubiertos', met: discovered >= 3 },
      { label: '2 contratos completados', met: completed >= 2 },
    ]
    return {
      nextRank:     PLAYER_RANKS[1],
      metCount:     conditions.filter(c => c.met).length,
      totalRequired: 2,
      conditions,
    }
  }

  if (current.number === 2) {
    const conditions = [
      { label: 'XP ≥ 75',               met: xp >= 75 },
      { label: '5 sectores descubiertos', met: discovered >= 5 },
      { label: '5 contratos completados', met: completed >= 5 },
    ]
    return {
      nextRank:     PLAYER_RANKS[2],
      metCount:     conditions.filter(c => c.met).length,
      totalRequired: 2,
      conditions,
    }
  }

  return null
}

// ── Acceso a mercenarios ──────────────────────────────────────────────────────
// Los exploradores contratables solo están disponibles desde Rango II.

export function canUseMercenaryContracts({ player, sectors, contractState }) {
  return getPlayerRank({ player, sectors, contractState }).number >= 2
}
