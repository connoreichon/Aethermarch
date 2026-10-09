import { useEffect, useState } from 'react'
import { inicialDe } from '../datos/util'

/**
 * Icono de un sitio.
 *
 * Se pide al propio dominio, no a un servicio de favicons: un
 * agregador recibiría de golpe la lista entera de sitios que tienes
 * guardados, mientras que así cada sitio solo se entera de lo suyo
 * —y es una web que ya visitas—. Aun así son peticiones a internet:
 * la primera vez que se pinta un acceso, ese dominio puede deducir
 * que lo tienes guardado. Está dicho en Ayuda y en Privacidad.
 *
 * Se prueban varias rutas estándar porque cada sitio publica la suya
 * en un lado, y además el dominio raíz: muchos subdominios (correo,
 * sede, app…) no sirven icono pero su dominio principal sí. Si nada
 * responde queda la inicial, y el dominio se recuerda para no volver
 * a intentarlo en cada carga.
 */
const CLAVE_SIN_ICONO = 'mi-punto.sin-icono'

const sinIcono = new Set<string>(
  (() => {
    try {
      const crudo = window.localStorage.getItem(CLAVE_SIN_ICONO)
      const lista: unknown = crudo ? JSON.parse(crudo) : []
      return Array.isArray(lista) ? lista.filter((x): x is string => typeof x === 'string') : []
    } catch {
      return []
    }
  })(),
)

const recordarSinIcono = (origen: string) => {
  if (sinIcono.has(origen)) return
  sinIcono.add(origen)
  try {
    window.localStorage.setItem(CLAVE_SIN_ICONO, JSON.stringify([...sinIcono].slice(-400)))
  } catch {
    /* sin sitio donde recordarlo: se reintentará, no pasa nada */
  }
}

/** Olvida los dominios marcados como sin icono: lo usa Ajustes para
 *  que se pueda reintentar sin trucos ni borrar nada a mano. */
export const olvidarIconosFallidos = (): number => {
  const cuantos = sinIcono.size
  sinIcono.clear()
  try {
    window.localStorage.removeItem(CLAVE_SIN_ICONO)
  } catch {
    /* da igual: la lista en memoria ya está vacía */
  }
  return cuantos
}

/** `mail.google.com` -> `google.com`. Ingenuo a propósito: si falla,
 *  el peor caso es una petición que no responde y la inicial. */
const dominioRaiz = (host: string): string | null => {
  const partes = host.split('.')
  if (partes.length < 3) return null
  return partes.slice(-2).join('.')
}

const fuentesDe = (url: string, propio: string): string[] => {
  if (propio) return [propio]
  let u: URL
  try {
    u = new URL(url)
  } catch {
    return []
  }
  if (sinIcono.has(u.origin)) return []

  const rutas = ['/apple-touch-icon.png', '/favicon.svg', '/favicon.ico']
  const fuentes = rutas.map((r) => u.origin + r)
  const raiz = dominioRaiz(u.hostname)
  if (raiz) fuentes.push(`https://${raiz}/favicon.ico`, `https://www.${raiz}/favicon.ico`)
  return fuentes
}

interface Props {
  nombre: string
  url: string
  /** Icono puesto a mano desde el formulario del acceso. */
  icono?: string
  tamano?: number
}

export const FichaSitio = ({ nombre, url, icono = '', tamano = 30 }: Props) => {
  const fuentes = fuentesDe(url, icono)
  const [intento, setIntento] = useState(0)

  // Si cambian la dirección o el icono, se vuelve a empezar
  useEffect(() => setIntento(0), [url, icono])

  const src = fuentes[intento]
  if (!src) return <span className="favorito__inicial">{inicialDe(nombre, url)}</span>

  return (
    <img
      src={src}
      alt=""
      width={tamano}
      height={tamano}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      style={{ width: tamano, height: tamano }}
      onError={() => {
        if (intento + 1 >= fuentes.length && !icono) {
          try {
            recordarSinIcono(new URL(url).origin)
          } catch {
            /* url rara: no hay nada que recordar */
          }
        }
        setIntento(intento + 1)
      }}
    />
  )
}
