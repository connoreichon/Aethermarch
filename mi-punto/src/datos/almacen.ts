import {
  CLAVE_ALMACEN,
  CLAVE_ALMACEN_V1,
  VERSION_DATOS,
  MAX_PRIORIDADES,
  COLORES_GRUPO,
} from '../config/ajustes'
import { PROPIETARIO_INVITADO } from './tipos'
import type { Acceso, AccionGuardada, Datos, Grupo, Nota, Retomar, Tarea } from './tipos'
import { nuevoId, normalizarUrl } from './util'

export const datosVacios = (): Datos => ({
  version: VERSION_DATOS,
  propietario: PROPIETARIO_INVITADO,
  actualizado: Date.now(),
  perfil: { nombre: '' },
  preferencias: { fondo: 'costa', efectos: 'normales', presentado: false },
  grupos: [
    { id: nuevoId(), nombre: 'Cada día', color: 'mar' },
    { id: nuevoId(), nombre: 'Trabajo', color: 'mandarina' },
    { id: nuevoId(), nombre: 'Ocio', color: 'verde' },
  ],
  accesos: [],
  retomar: [],
  notas: [],
  tareas: [],
})

/* -------------------------------------------------------------------
   Validación. Todo lo que entra de fuera —localStorage o un archivo
   importado— pasa por aquí: se queda con lo que entiende, recorta lo
   que se pasa de largo y descarta el resto. Nunca se ejecuta nada de
   lo que venga en el archivo.
   ------------------------------------------------------------------- */

const esObjeto = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v)

const texto = (v: unknown, max: number, pordefecto = ''): string =>
  typeof v === 'string' ? v.slice(0, max) : pordefecto

const marcaTiempo = (v: unknown): number =>
  typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : Date.now()

const colorValido = (v: unknown): string => {
  const c = typeof v === 'string' ? v : ''
  return COLORES_GRUPO.some((g) => g.clave === c) ? c : COLORES_GRUPO[0].clave
}

const lista = (v: unknown): unknown[] => (Array.isArray(v) ? v : [])

/** Las plantillas de accion son direcciones que vienen de fuera: se
 *  comprueban igual que cualquier otra, con {q} sustituido por algo
 *  inocuo para poder validarlas. */
const saneaAcciones = (v: unknown): AccionGuardada[] =>
  lista(v)
    .filter(esObjeto)
    .map((a): AccionGuardada | null => {
      const etiqueta = texto(a.etiqueta, 60).trim()
      const plantilla = texto(a.plantilla, 2048).trim()
      if (!etiqueta || !plantilla) return null
      if (!normalizarUrl(plantilla.replace('{q}', 'x'))) return null
      return { id: texto(a.id, 64) || nuevoId(), etiqueta, plantilla }
    })
    .filter((a): a is AccionGuardada => a !== null)
    .slice(0, 12)

/** v1 guardaba una sola nota como cadena suelta. */
const migrarNotaUnica = (bruto: Record<string, unknown>): Nota[] => {
  const suelta = texto(bruto.nota, 20000).trim()
  if (!suelta) return []
  return [
    {
      id: nuevoId(),
      titulo: '',
      texto: suelta,
      creada: marcaTiempo(bruto.actualizado),
      actualizada: marcaTiempo(bruto.actualizado),
    },
  ]
}

export const sanear = (bruto: unknown): Datos | null => {
  if (!esObjeto(bruto)) return null
  if (!Array.isArray(bruto.grupos) || !Array.isArray(bruto.accesos)) return null

  const grupos: Grupo[] = lista(bruto.grupos)
    .filter(esObjeto)
    .map((g) => ({
      id: texto(g.id, 64) || nuevoId(),
      nombre: texto(g.nombre, 60).trim() || 'Grupo',
      color: colorValido(g.color),
    }))
    .slice(0, 40)
  if (grupos.length === 0) grupos.push({ id: nuevoId(), nombre: 'Cada día', color: 'mar' })
  const idsGrupo = new Set(grupos.map((g) => g.id))

  const accesos: Acceso[] = lista(bruto.accesos)
    .filter(esObjeto)
    .map((a): Acceso | null => {
      const url = normalizarUrl(texto(a.url, 2048))
      const nombre = texto(a.nombre, 80).trim()
      if (!url || !nombre) return null
      const grupoId = texto(a.grupoId, 64)
      return {
        id: texto(a.id, 64) || nuevoId(),
        nombre,
        url,
        // El icono propio tambien es una URL que viene de fuera
        icono: normalizarUrl(texto(a.icono, 2048)) ?? '',
        acciones: saneaAcciones(a.acciones),
        grupoId: idsGrupo.has(grupoId) ? grupoId : grupos[0].id,
        favorito: a.favorito === true,
        usos: typeof a.usos === 'number' && a.usos >= 0 ? Math.min(a.usos, 1e6) : 0,
        ultimoUso: typeof a.ultimoUso === 'number' ? a.ultimoUso : null,
      }
    })
    .filter((a): a is Acceso => a !== null)
    .slice(0, 500)

  const retomar: Retomar[] = lista(bruto.retomar)
    .filter(esObjeto)
    .map((r): Retomar | null => {
      const url = normalizarUrl(texto(r.url, 2048))
      if (!url) return null
      return {
        id: texto(r.id, 64) || nuevoId(),
        titulo: texto(r.titulo, 160).trim() || url,
        url,
        nota: texto(r.nota, 400).trim(),
        creado: marcaTiempo(r.creado),
        terminado: r.terminado === true,
      }
    })
    .filter((r): r is Retomar => r !== null)
    .slice(0, 300)

  const notasBrutas = lista(bruto.notas)
  const notas: Nota[] = (
    notasBrutas.length > 0
      ? notasBrutas
          .filter(esObjeto)
          .map((n): Nota | null => {
            const cuerpo = texto(n.texto, 20000)
            const titulo = texto(n.titulo, 120).trim()
            if (!cuerpo.trim() && !titulo) return null
            return {
              id: texto(n.id, 64) || nuevoId(),
              titulo,
              texto: cuerpo,
              creada: marcaTiempo(n.creada),
              actualizada: marcaTiempo(n.actualizada),
            }
          })
          .filter((n): n is Nota => n !== null)
      : migrarNotaUnica(bruto)
  ).slice(0, 300)

  let prioridades = 0
  const tareas: Tarea[] = lista(bruto.tareas)
    .filter(esObjeto)
    .map((t): Tarea | null => {
      const cuerpo = texto(t.texto, 280).trim()
      if (!cuerpo) return null
      const hecha = t.hecha === true
      const quiere = t.prioridad === true && !hecha
      const prioridad = quiere && prioridades < MAX_PRIORIDADES
      if (prioridad) prioridades += 1
      return {
        id: texto(t.id, 64) || nuevoId(),
        texto: cuerpo,
        hecha,
        prioridad,
        creada: marcaTiempo(t.creada),
        completada: hecha ? marcaTiempo(t.completada) : null,
      }
    })
    .filter((t): t is Tarea => t !== null)
    .slice(0, 500)

  const perfil = esObjeto(bruto.perfil) ? bruto.perfil : {}
  const prefs = esObjeto(bruto.preferencias) ? bruto.preferencias : {}
  const fondo = texto(prefs.fondo, 16)
  const efectos = texto(prefs.efectos, 16)

  return {
    version: VERSION_DATOS,
    propietario: texto(bruto.propietario, 128).trim() || PROPIETARIO_INVITADO,
    actualizado: marcaTiempo(bruto.actualizado),
    perfil: { nombre: texto(perfil.nombre, 40).trim() },
    preferencias: {
      fondo: fondo === 'alba' || fondo === 'liso' ? fondo : 'costa',
      efectos: efectos === 'pocos' ? 'pocos' : 'normales',
      // Si vienen datos de verdad, la primera visita ya sobra
      presentado:
        prefs.presentado === true || accesos.length > 0 || notas.length > 0 || tareas.length > 0,
    },
    grupos,
    accesos,
    retomar,
    notas,
    tareas,
  }
}

/* --------------------------------------------------------- disco --- */

export const leer = (): Datos => {
  try {
    const crudo = window.localStorage.getItem(CLAVE_ALMACEN)
    if (crudo) return sanear(JSON.parse(crudo)) ?? datosVacios()

    // Migración desde el esquema v1: se lee la clave antigua, se
    // sanea (que es donde la nota suelta se convierte en lista) y se
    // guarda ya en la clave nueva. La vieja se deja intacta por si
    // hiciera falta volver atrás.
    const viejo = window.localStorage.getItem(CLAVE_ALMACEN_V1)
    if (!viejo) return datosVacios()
    const migrado = sanear(JSON.parse(viejo))
    if (!migrado) return datosVacios()
    escribir(migrado)
    return migrado
  } catch {
    return datosVacios()
  }
}

/** Devuelve si de verdad se ha escrito: la interfaz no dice
 *  «Guardado» cuando esto da false. */
export const escribir = (datos: Datos): boolean => {
  try {
    window.localStorage.setItem(CLAVE_ALMACEN, JSON.stringify(datos))
    return true
  } catch {
    return false
  }
}

export const borrarDisco = (): boolean => {
  try {
    window.localStorage.removeItem(CLAVE_ALMACEN)
    return true
  } catch {
    return false
  }
}
