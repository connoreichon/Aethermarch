import { ACCIONES_GENERALES, resolver, servicioDe } from '../config/servicios'
import type { Accion, TipoArgumento } from '../config/servicios'
import type { Datos } from './tipos'
import { normalizarUrl, sinAcentos } from './util'

export interface AccionOfrecida {
  clave: string
  /** «Buscar en el correo» */
  etiqueta: string
  /** «Gmail» */
  servicio: string
  /** El texto que se usa como argumento, si lo lleva. */
  argumento: string
  url: string
}

/* ------------------------------------------------- qué es lo escrito */

const ES_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const ES_TELEFONO = /^\+?[\d][\d\s.-]{6,}$/
const ES_DIRECCION = /^(https?:\/\/)?[\w-]+(\.[\w-]+)+(\/\S*)?$/i

interface Pinta {
  correo: boolean
  telefono: boolean
  direccion: boolean
}

const quePinta = (texto: string): Pinta => ({
  correo: ES_CORREO.test(texto),
  // Un correo tambien casa el patron de direccion por el punto: se descarta
  telefono: ES_TELEFONO.test(texto.replace(/\s/g, '')),
  direccion: !texto.includes('@') && !texto.includes(' ') && ES_DIRECCION.test(texto),
})

/** Si la acción pide un tipo concreto, solo se ofrece cuando lo
 *  escrito tiene esa pinta. Sin esto salía «Escribir un correo a
 *  factura», que no significa nada. */
const admite = (tipo: TipoArgumento, pinta: Pinta): boolean => {
  switch (tipo) {
    case 'correo': return pinta.correo
    case 'telefono': return pinta.telefono
    case 'direccion': return pinta.direccion
    case 'ninguno': return false // solo por coincidencia de nombre
    default: return true
  }
}

/* ------------------------------------------------------- qué ofrecer */

/**
 * Qué puede HACER la persona con lo que acaba de escribir.
 *
 * Solo se ofrecen acciones de servicios que tiene guardados —no vale
 * ofrecer Spotify a quien no lo usa— más las generales. Se ordenan
 * por: tipo que encaja, coincidencia con el nombre de la acción, y
 * cuánto abre ese acceso.
 */
export const accionesPara = (datos: Datos, consulta: string, limite = 5): AccionOfrecida[] => {
  const texto = consulta.trim()
  if (!texto) return []
  const q = sinAcentos(texto)
  const pinta = quePinta(texto)
  const ofrecidas: Array<AccionOfrecida & { peso: number }> = []
  const puestas = new Set<string>()

  const anadir = (accion: Accion, servicio: string, usos: number, base: number) => {
    const tipo: TipoArgumento = accion.tipo ?? 'texto'
    const porNombre =
      sinAcentos(accion.etiqueta).includes(q) || (!!servicio && sinAcentos(servicio).includes(q))
    if (!admite(tipo, pinta) && !porNombre) return

    const url = resolver(accion.plantilla, texto)
    if (!url) return

    const clave = `${servicio}-${accion.id}`
    if (puestas.has(clave)) return
    puestas.add(clave)

    const encaja = tipo !== 'texto' && tipo !== 'ninguno' && admite(tipo, pinta)
    ofrecidas.push({
      clave,
      etiqueta: accion.etiqueta,
      servicio,
      argumento: accion.plantilla.includes('{q}') ? texto : '',
      url,
      peso: base + usos + (encaja ? 4000 : 0) + (porNombre ? 2000 : 0),
    })
  }

  for (const acceso of [...datos.accesos].sort((a, b) => b.usos - a.usos)) {
    for (const propia of acceso.acciones ?? []) anadir(propia, acceso.nombre, acceso.usos, 300)
    const servicio = servicioDe(acceso.url)
    if (servicio) for (const accion of servicio.acciones) anadir(accion, servicio.nombre, acceso.usos, 0)
  }

  // Las generales valen siempre. «Buscarlo en Google» es la salida
  // honesta cuando lo que quieres no está en tus cosas.
  for (const general of ACCIONES_GENERALES) {
    if (general.id === 'abrir-web') {
      if (!pinta.direccion) continue
      const url = normalizarUrl(texto)
      if (!url) continue
      ofrecidas.push({
        clave: 'abrir-web',
        etiqueta: general.etiqueta,
        servicio: '',
        argumento: texto,
        url,
        peso: 9000,
      })
      continue
    }
    anadir(general, '', 0, 120)
  }

  return ofrecidas
    .sort((a, b) => b.peso - a.peso)
    .slice(0, limite)
    .map(({ peso: _peso, ...resto }) => resto)
}
