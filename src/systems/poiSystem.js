import { POIS } from '../data/gameData.js'

export function getCurrentSectorPoi(sector) {
  if (!sector?.poiId) return null
  return POIS[sector.poiId] ?? null
}

export function getPoiActionLabel(poiId) {
  switch (poiId) {
    case 'shelter': return 'Descansar (+8 HP)'
    case 'inn':     return 'Reposar (HP completo)'
    case 'trader':  return 'Escuchar rumores'
    case 'forge':   return 'Inspeccionar la forja'
    case 'tavern':  return 'Preguntar en la taberna'
    case 'supply':  return 'Revisar suministros'
    default:        return 'Interactuar'
  }
}

export function getPoiFlavorText(poiId, sector) {
  const sectorName = sector?.name ?? 'el sector'
  switch (poiId) {
    case 'shelter':
      return `Un refugio rudimentario en ${sectorName}. Las paredes absorben el frío del abismo.`
    case 'inn':
      return `La posada de ${sectorName} acoge a caravanas exhaustas. El olor a caldo caliente llega desde dentro.`
    case 'trader':
      return `Un mercader solitario en ${sectorName}. Observa con ojo calculador el estado de vuestra carga.`
    case 'forge':
      return `La fragua de ${sectorName} lleva años apagada. Aún conserva el calor del metal viejo.`
    case 'tavern':
      return `La taberna de ${sectorName} guarda más secretos que bebida. Los parroquianos murmuran sin parar.`
    case 'supply':
      return `El puesto de suministros en ${sectorName} tiene filas de cajas polvorientas y poco más.`
    default:
      return `Un lugar notable en ${sectorName}.`
  }
}

export function canUsePoiAction({ poiId, player, expedition, combat }) {
  if (!poiId) return { ok: false, reason: 'No hay lugar seguro disponible.' }
  if (expedition?.status === 'marching')    return { ok: false, reason: 'La caravana está en marcha.' }
  if (expedition?.status === 'combat')      return { ok: false, reason: 'La caravana está en combate.' }
  if (combat?.status === 'awaiting_choice') return { ok: false, reason: 'La caravana está en combate.' }

  if ((poiId === 'shelter' || poiId === 'inn') && player) {
    if (player.hp >= player.maxHp)
      return { ok: false, reason: 'La caravana ya está al máximo de salud.' }
  }

  return { ok: true }
}

const TRADER_RUMORS = [
  'El mercader menciona una ruta alternativa que evita los focos de fracturas.',
  '"He visto tres caravanas descender por aquí. Sólo una regresó." El comerciante sonríe sin humor.',
  'El mercader tiene noticias del Estrato II: hay ecos de pasos extraños en la Cornisa Salina.',
  '"No vendáis resina del abismo a precio bajo — hay quien pagaría mucho más en los estratos superiores."',
]

const TAVERN_RUMORS = [
  'Un viajero jura haber visto una criatura luminosa en el Estrato III.',
  '"El último grupo que bajó a las Forjas Hundidas no llevaba suficiente agua. No la necesitaron."',
  'La taberna zumba con un rumor: alguien encontró una cámara sellada en la Cornisa Salina.',
  '"Los Cartógrafos Hundidos dejaron marcas en las paredes del siguiente tramo. Seguid las marcas amarillas."',
]

export function resolvePoiAction({ poiId, player, sector }) {
  const poi = POIS[poiId]
  if (!poi) return null

  const sectorName = sector?.name ?? 'el sector'

  switch (poiId) {
    case 'shelter': {
      const heal = Math.min(8, player.maxHp - player.hp)
      return {
        poiId, poiName: poi.name,
        sectorId: sector?.id, sectorName,
        hpGain: heal,
        summaryText: heal > 0
          ? `La caravana descansó en el refugio de ${sectorName}. Recuperaste ${heal} HP entre las sombras del abismo.`
          : 'La caravana descansó, pero la salud ya era plena.',
        type: 'rest',
      }
    }
    case 'inn': {
      const heal = player.maxHp - player.hp
      return {
        poiId, poiName: poi.name,
        sectorId: sector?.id, sectorName,
        hpGain: heal,
        summaryText: heal > 0
          ? `La posada de ${sectorName} ofreció caldo y cama. Recuperaste ${heal} HP. La caravana se levanta renovada.`
          : 'La caravana ya estaba en plena forma. La posada sirvió de reposo sin necesidad de cura.',
        type: 'rest',
      }
    }
    case 'trader': {
      const rumor = TRADER_RUMORS[Math.floor(Math.random() * TRADER_RUMORS.length)]
      return {
        poiId, poiName: poi.name,
        sectorId: sector?.id, sectorName,
        hpGain: 0,
        summaryText: rumor,
        type: 'rumor',
      }
    }
    case 'tavern': {
      const rumor = TAVERN_RUMORS[Math.floor(Math.random() * TAVERN_RUMORS.length)]
      return {
        poiId, poiName: poi.name,
        sectorId: sector?.id, sectorName,
        hpGain: 0,
        summaryText: rumor,
        type: 'rumor',
      }
    }
    case 'forge': {
      return {
        poiId, poiName: poi.name,
        sectorId: sector?.id, sectorName,
        hpGain: 0,
        summaryText: `La Fragua Dormida de ${sectorName} conserva sus secretos. El sistema de forja no está disponible aún en esta expedición.`,
        type: 'future',
      }
    }
    case 'supply': {
      return {
        poiId, poiName: poi.name,
        sectorId: sector?.id, sectorName,
        hpGain: 0,
        summaryText: `El puesto de suministros en ${sectorName} tiene cajas de expediciones anteriores. Los consumibles no están disponibles aún.`,
        type: 'future',
      }
    }
    default:
      return null
  }
}
