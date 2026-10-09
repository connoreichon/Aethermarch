import { PROTOCOLOS_VALIDOS } from '../config/ajustes'

export const nuevoId = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`

/** Acepta lo que escribe una persona («correo.google.com») y devuelve
 *  una URL utilizable, o null si no hay manera. Solo http y https:
 *  nunca javascript:, data: ni file:. */
export const normalizarUrl = (entrada: string): string | null => {
  const limpio = entrada.trim()
  if (!limpio) return null
  const conEsquema = /^[a-z][a-z0-9+.-]*:/i.test(limpio) ? limpio : `https://${limpio}`
  let url: URL
  try {
    url = new URL(conEsquema)
  } catch {
    return null
  }
  if (!PROTOCOLOS_VALIDOS.includes(url.protocol)) return null
  if (!url.hostname.includes('.') && url.hostname !== 'localhost') return null
  return url.toString()
}

export const dominio = (url: string): string => {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

/** Una letra para cuando el sitio no sirve icono. */
export const inicialDe = (nombre: string, url: string): string => {
  const base = nombre.trim() || dominio(url)
  return base.replace(/[^\p{L}\p{N}]/gu, '').slice(0, 1).toUpperCase() || '·'
}

export const saludoDeLaHora = (hora: number): 'manana' | 'tarde' | 'noche' =>
  hora < 6 ? 'noche' : hora < 14 ? 'manana' : hora < 21 ? 'tarde' : 'noche'

export const fechaLarga = (d: Date): string =>
  d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })

export const fechaCorta = (ms: number): string =>
  new Date(ms).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })

export const horaCorta = (d: Date): string =>
  d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })

export const sinAcentos = (s: string): string =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

/**
 * Dos direcciones apuntan al mismo sitio.
 *
 * Para una lista de accesos, `boe.es` y `www.boe.es` son lo mismo, y
 * también lo son con o sin barra final o en http frente a https. Si
 * esto solo comparase las cadenas, la persona acabaria con el mismo
 * sitio repetido tres veces sin entender por que.
 */
export const huellaUrl = (url: string): string => {
  try {
    const u = new URL(url)
    const host = u.hostname.toLowerCase().replace(/^www\./, '')
    const ruta = u.pathname.replace(/\/+$/, '')
    return `${host}${ruta}${u.search}`
  } catch {
    return url.trim().toLowerCase()
  }
}

export const mismaUrl = (a: string, b: string): boolean => huellaUrl(a) === huellaUrl(b)
