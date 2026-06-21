export const ECHO_MAX_STEPS   = 2000
export const ECHO_MIN_STEPS   = 300
export const ECHO_COOLDOWN_MS = 60_000  // 60s anti-spam for prototype

// ── Validación de pasos ───────────────────────────────────────────────────────

export function clampEchoSteps(rawSteps) {
  const n = Number(rawSteps)
  if (isNaN(n) || n < 0) return 0
  return Math.min(Math.floor(n), ECHO_MAX_STEPS)
}

// ── ¿Se puede reclamar Eco? ───────────────────────────────────────────────────

export function canClaimEcho({ rawSteps, expedition, combat, lastEchoClaimAt }) {
  if (rawSteps === '' || rawSteps === null || rawSteps === undefined) {
    return { ok: false, steps: 0, reason: 'Introduce los pasos que quieres reconstruir.' }
  }

  const n = Number(rawSteps)
  if (isNaN(n) || n < 0) {
    return { ok: false, steps: 0, reason: 'Introduce un valor válido de pasos.' }
  }

  if (expedition?.status === 'marching') {
    return { ok: false, steps: 0, reason: 'No puedes reconstruir el eco mientras la caravana está en marcha.' }
  }

  if (expedition?.status === 'combat' || combat?.status === 'awaiting_choice' || combat?.status === 'resolved') {
    return { ok: false, steps: 0, reason: 'No puedes reconstruir el eco durante un combate.' }
  }

  const steps = clampEchoSteps(rawSteps)

  if (steps < ECHO_MIN_STEPS) {
    return { ok: false, steps, reason: 'El eco es demasiado débil para reconstruir una marcha.' }
  }

  if (lastEchoClaimAt) {
    const elapsed = Date.now() - new Date(lastEchoClaimAt).getTime()
    if (elapsed < ECHO_COOLDOWN_MS) {
      return { ok: false, steps, reason: 'La caravana aún está interpretando el eco anterior.' }
    }
  }

  return { ok: true, steps, reason: null }
}

// ── Resolver recompensas del Eco ──────────────────────────────────────────────

export function resolveMarchEcho({ steps, sector, biome, creatureId }) {
  // XP
  let xpGain = 2
  if (steps >= 1500)     xpGain = 6
  else if (steps >= 800) xpGain = 4

  // Recursos del sector (comunes)
  const pool = sector?.resources ?? biome?.resourceIds ?? []
  const resources = {}

  if (steps >= 1500 && pool.length > 0) {
    resources[pool[0]] = (resources[pool[0]] ?? 0) + 1
    const second = pool.length > 1 ? pool[1] : pool[0]
    resources[second] = (resources[second] ?? 0) + 1
  } else if (steps >= 800 && pool.length > 0) {
    resources[pool[0]] = 1
  }
  // 300–799: sin recursos

  // Dominio
  let masteryGain = 0
  if (steps >= 1500)     masteryGain = 2
  else if (steps >= 800) masteryGain = 1

  // Textos atmosféricos
  const flavors = [
    'La caravana reconstruyó huellas recientes sobre el barro.',
    'El farol recuperó un tramo breve de la senda.',
    'La bruma devolvió el recuerdo de unos pasos olvidados.',
  ]
  const creatureFlavors = {
    velthar: 'Velthar reconoce un rastro reciente en la niebla.',
    brontik: 'Brontik conserva el ritmo de una marcha interrumpida.',
    lumora:  'Lúmora encuentra un pequeño brillo entre los pasos olvidados.',
  }

  const events = [flavors[steps % flavors.length]]
  if (creatureId && creatureFlavors[creatureId]) {
    events.push(creatureFlavors[creatureId])
  }

  const sectorName  = sector?.name ?? 'la senda'
  const summaryText = `La caravana reconstruyó ${steps} pasos recientes en ${sectorName}. No fue una marcha completa, pero dejó un pequeño rastro de recursos y experiencia.`

  return {
    type:        'march_echo',
    steps,
    xpGain,
    resources,
    masteryGain,
    title:       'Eco de Marcha',
    summaryText,
    events,
  }
}
