export function isSecretSector(sector) {
  return sector?.secret === true
}

export function canRevealSecretSector({ sector, currentSector, player, expeditionModeId }) {
  if (!isSecretSector(sector)) return false

  if (sector.id === 'sector_hollow_mushroom_cave') {
    if (currentSector?.id !== 'sector_runic_guard_ruins') return false
    const conditionA = player?.creatureId === 'velthar' && expeditionModeId === 'explore'
    const conditionB = (currentSector?.masteryLevel ?? 0) >= 2
    const conditionC = (currentSector?.mastery ?? 0) >= 25
    return conditionA || conditionB || conditionC
  }

  return false
}

export function getSecretRevealReason({ sector, player, expeditionModeId }) {
  if (sector.id === 'sector_hollow_mushroom_cave') {
    if (player?.creatureId === 'velthar' && expeditionModeId === 'explore') {
      return 'Velthar se detuvo ante una pared de raíces. Algo respiraba detrás.'
    }
    return 'Tras recorrer varias veces la ruina, la caravana encontró una grieta oculta entre las raíces.'
  }
  return 'La expedición encontró una entrada oculta.'
}
