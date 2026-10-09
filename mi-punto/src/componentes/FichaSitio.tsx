import { useState } from 'react'
import { inicialDe } from '../datos/util'

/**
 * Icono de un sitio.
 *
 * Se pide al propio dominio, no a un servicio de favicons: un
 * agregador recibiría de golpe la lista entera de sitios que tienes
 * guardados, mientras que así cada sitio solo se entera de lo suyo
 * —y es una web que ya visitas—. Aun así son peticiones a internet:
 * la primera vez que se pinta un acceso, ese dominio sabe que lo
 * tienes guardado. Está dicho en Ayuda y en Privacidad.
 *
 * Orden: apple-touch-icon (suele ser el de más resolución), luego
 * favicon.ico y, si ninguno responde, la inicial.
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

const origenDe = (url: string): string | null => {
  try {
    return new URL(url).origin
  } catch {
    return null
  }
}

interface Props {
  nombre: string
  url: string
  tamano?: number
}

export const FichaSitio = ({ nombre, url, tamano = 30 }: Props) => {
  const origen = origenDe(url)
  const fuentes =
    origen && !sinIcono.has(origen)
      ? [`${origen}/apple-touch-icon.png`, `${origen}/favicon.ico`]
      : []
  const [intento, setIntento] = useState(0)
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
        if (intento + 1 >= fuentes.length && origen) recordarSinIcono(origen)
        setIntento(intento + 1)
      }}
    />
  )
}
