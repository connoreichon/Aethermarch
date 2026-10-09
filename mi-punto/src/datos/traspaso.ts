import { LIMITE_IMPORTACION } from '../config/ajustes'
import { T } from '../config/textos'
import { sanear } from './almacen'
import type { Datos } from './tipos'

export const nombreArchivo = (d = new Date()): string => {
  const p = (n: number) => String(n).padStart(2, '0')
  return `mi-punto-${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}.json`
}

export const exportar = (datos: Datos): { ok: boolean; error?: string } => {
  try {
    const texto = JSON.stringify({ ...datos, exportado: new Date().toISOString() }, null, 2)
    const blob = new Blob([texto], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = nombreArchivo()
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    return { ok: true }
  } catch {
    return { ok: false, error: T.traspaso.errorExportar }
  }
}

export type Revision =
  | { ok: true; datos: Datos; descartados: number }
  | { ok: false; error: string }

const cuantos = (v: unknown): number => (Array.isArray(v) ? v.length : 0)

/**
 * Lee el archivo, lo valida y devuelve datos limpios para enseñar en
 * una vista previa. No sustituye nada por su cuenta: eso lo decide
 * quien está delante.
 *
 * El JSON se trata como dato no confiable: `sanear` comprueba
 * estructura, tipos y límites, y tira lo que no entiende —incluidas
 * las URLs que no sean http o https—. Nunca se ejecuta nada de lo
 * que venga dentro.
 */
export const revisarArchivo = async (archivo: File): Promise<Revision> => {
  if (archivo.size > LIMITE_IMPORTACION) return { ok: false, error: T.traspaso.errorTamano }

  let crudo: string
  try {
    crudo = await archivo.text()
  } catch {
    return { ok: false, error: T.traspaso.errorLectura }
  }

  let bruto: unknown
  try {
    bruto = JSON.parse(crudo)
  } catch {
    return { ok: false, error: T.traspaso.errorFormato }
  }

  const datos = sanear(bruto)
  if (!datos) return { ok: false, error: T.traspaso.errorFormato }

  const original = (bruto ?? {}) as Record<string, unknown>
  const entraron = datos.accesos.length + datos.retomar.length + datos.notas.length + datos.tareas.length
  const venian =
    cuantos(original.accesos) +
    cuantos(original.retomar) +
    cuantos(original.notas) +
    cuantos(original.tareas)

  return { ok: true, datos, descartados: Math.max(0, venian - entraron) }
}
