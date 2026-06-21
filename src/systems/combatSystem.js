// ── Constante de decisión ──────────────────────────────────────────────────────
export const COMBAT_DECISION_SECONDS = 5

// ── Posturas disponibles ──────────────────────────────────────────────────────
export const STANCES = [
  { id: 'prudente',    name: 'Prudente',    description: 'Cubrirse y leer el ataque.' },
  { id: 'equilibrada', name: 'Equilibrada', description: 'Mantener posición y repartir.' },
  { id: 'audaz',       name: 'Audaz',       description: 'Romper el ritmo del enemigo.' },
]

export function getAvailableStances() {
  return STANCES
}

// ── Crear combate desde evento de amenaza ─────────────────────────────────────
export function createCombatFromThreat({ event, enemies }) {
  if (!event?.enemyId) return null
  const enemy = enemies[event.enemyId]
  if (!enemy || !enemy.attacks?.length) return null

  const attackIdx = Math.floor((event.threshold ?? 20) / 40) % enemy.attacks.length
  const attack    = enemy.attacks[attackIdx]

  return {
    status:          'awaiting_choice',
    enemyId:         event.enemyId,
    attackId:        attack.id,
    attack,
    selectedStance:  null,
    result:          null,
    sourceEventId:   event.id,
    decisionSeconds: COMBAT_DECISION_SECONDS,
    autoResolved:    false,
    log: [
      'La amenaza se revela en el camino.',
      `${enemy.name} prepara ${attack?.name ?? 'un ataque'}.`,
    ],
  }
}

// ── Resolver turno de combate ─────────────────────────────────────────────────
export function resolveCombatTurn({ combat, stanceId, player, enemies, auto = false }) {
  const attack = combat.attack
  if (!attack) return null

  let damage = attack.baseDamage

  if (stanceId === attack.bestStance) {
    damage = 0
  } else if (stanceId === 'equilibrada') {
    damage = Math.ceil(attack.baseDamage / 2)
  }

  if (player?.archetypeId === 'guardian') damage = Math.max(0, damage - 2)
  if (player?.creatureId  === 'brontik')  damage = Math.max(0, damage - 1)

  const wasCorrect = stanceId === attack.bestStance
  const xpGain     = damage === 0 ? 8 : 5

  let text = auto ? 'La caravana mantiene una postura equilibrada por instinto. ' : ''

  if (wasCorrect) {
    text += 'La postura elegida evita el golpe. La caravana sale ilesa.'
  } else if (damage === 0) {
    text += 'El golpe es absorbido. La guardia aguanta sin daño.'
  } else {
    text += `El impacto alcanza la guardia. La caravana recibe ${damage} de daño.`
  }

  const currentHp = player?.hp ?? 30
  if (damage > 0 && damage >= currentHp) {
    text += ' La caravana queda maltrecha, pero consigue seguir adelante.'
  }

  return {
    stanceId,
    wasCorrect,
    baseDamage:   attack.baseDamage,
    finalDamage:  damage,
    xpGain,
    text,
    autoResolved: auto,
  }
}
