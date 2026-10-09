import costaEscritorio from '../assets/fondos/costa-escritorio.webp'
import costaMovil from '../assets/fondos/costa-movil.webp'
import albaEscritorio from '../assets/fondos/alba-escritorio.webp'
import albaMovil from '../assets/fondos/alba-movil.webp'
import type { ClaveFondo } from '../datos/tipos'

/** Clave actual y clave antigua, para poder migrar sin perder nada. */
export const CLAVE_ALMACEN = 'mi-punto.datos'
export const CLAVE_ALMACEN_V1 = 'mi-punto.datos.v1'
export const VERSION_DATOS = 2

export const MAX_PRIORIDADES = 3
export const MAX_FAVORITOS = 8
export const ESPERA_GUARDADO_NOTA = 600
export const DURACION_DESHACER = 7000
export const LIMITE_IMPORTACION = 4 * 1024 * 1024

/** Fondos ambientales. Generados por `python scripts/generar_fondo.py`:
 *  son originales, no fotografias ni material de terceros. */
export const FONDOS: Record<
  Exclude<ClaveFondo, 'liso'>,
  { nombre: string; escritorio: string; movil: string }
> = {
  costa: { nombre: 'Costa', escritorio: costaEscritorio, movil: costaMovil },
  alba: { nombre: 'Alba', escritorio: albaEscritorio, movil: albaMovil },
}

/** Colores de grupo. Viven dentro de la familia de la paleta: ninguno
 *  es un color suelto traido de fuera. */
export const COLORES_GRUPO = [
  { clave: 'mar', nombre: 'Mar', valor: '#3A5670' },
  { clave: 'mandarina', nombre: 'Mandarina', valor: '#F66A38' },
  { clave: 'verde', nombre: 'Verde', valor: '#27654C' },
  { clave: 'azul', nombre: 'Azul', valor: '#3559D8' },
  { clave: 'piedra', nombre: 'Piedra', valor: '#7E8C9B' },
  { clave: 'ciruela', nombre: 'Ciruela', valor: '#6B4A7A' },
] as const

export const colorDeGrupo = (clave: string): string =>
  COLORES_GRUPO.find((c) => c.clave === clave)?.valor ?? COLORES_GRUPO[0].valor

/** Solo http y https. Nada de javascript:, data: ni file: */
export const PROTOCOLOS_VALIDOS = ['http:', 'https:']

/** Sugerencias de la primera visita. Son propuestas que la persona
 *  marca si quiere: no son servicios conectados ni datos detectados.
 *  URLs comprobadas una a una. */
export const SUGERENCIAS: Array<{ nombre: string; url: string }> = [
  { nombre: 'Gmail', url: 'https://mail.google.com/' },
  { nombre: 'Outlook', url: 'https://outlook.com/' },
  { nombre: 'Drive', url: 'https://drive.google.com/' },
  { nombre: 'YouTube', url: 'https://www.youtube.com/' },
  { nombre: 'Spotify', url: 'https://open.spotify.com/' },
  { nombre: 'Wikipedia', url: 'https://es.wikipedia.org/' },
  { nombre: 'Notion', url: 'https://www.notion.so/' },
]
