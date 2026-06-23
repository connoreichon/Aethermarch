// Scoring heuristic for choosing the best branch option automatically.
// Higher score = better choice for the caravan given its current state.

export function chooseRecommendedBranchOption({ options, branchKnowledge, player }) {
  if (!options?.length) return null
  if (options.length === 1) return options[0]

  const hp    = player?.hp    ?? 30
  const maxHp = player?.maxHp ?? 30
  const hpPct = maxHp > 0 ? hp / maxHp : 1
  const hpLow = hpPct < 0.40   // critical
  const hpMed = hpPct < 0.65   // wounded

  const scored = options.map(opt => {
    let score = 0
    const know = branchKnowledge?.[opt.id] ?? null

    // ── Base safety score
    // low risk = +20, medium = +5, high = -20
    if      (opt.risk === 'low')    score += 20
    else if (opt.risk === 'medium') score += 5
    else if (opt.risk === 'high')   score -= 20

    // ── HP penalties: when low, heavily penalize risky paths
    if (hpLow) {
      if (opt.risk === 'high')   score -= 40
      if (opt.risk === 'medium') score -= 12
      // Bonus for rest potential when HP critical
      if ((opt.restChanceModifier ?? 0) > 0) score += 18
      if ((opt.threatModifier ?? 0) > 0.1)   score -= 20
    } else if (hpMed) {
      if (opt.risk === 'high') score -= 15
    }

    // ── Rest signal from pros text (e.g. "Posible descanso")
    if (hpLow && opt.pros?.some(p => /descans/i.test(p))) score += 10

    // ── Familiarity bonuses (mastered > known multiple > known once)
    if (know?.mastered)              score += 22
    else if (know?.chosenCount >= 3) score += 14
    else if (know?.chosenCount >= 1) score += 8

    // ── Threat modifier: positive = more danger = penalty
    // scaled so +0.30 threat ≈ -15 score
    score -= (opt.threatModifier ?? 0) * 50

    return { ...opt, _score: score }
  })

  // Sort descending by score; break ties with lower risk index
  const RISK_ORDER = { low: 0, medium: 1, high: 2 }
  scored.sort((a, b) => {
    const diff = b._score - a._score
    if (diff !== 0) return diff
    return (RISK_ORDER[a.risk] ?? 1) - (RISK_ORDER[b.risk] ?? 1)
  })

  return scored[0] ?? options[0]
}

export function getRecommendationReason({ recommended, player }) {
  const hp    = player?.hp    ?? 30
  const maxHp = player?.maxHp ?? 30
  const hpPct = maxHp > 0 ? hp / maxHp : 1

  if (hpPct < 0.40) return 'HP crítico — prioridad: supervivencia'
  if (hpPct < 0.65 && recommended?.risk === 'low') return 'HP reducido — ruta más segura'
  if (recommended?.risk === 'low')  return 'Menor riesgo disponible'
  return 'Mejor equilibrio para la caravana'
}
