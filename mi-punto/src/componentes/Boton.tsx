import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Icono } from './Iconos'

type Tono = 'principal' | 'secundario' | 'discreto'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  tono?: Tono
  icono?: string
  bloque?: boolean
  compacto?: boolean
  peligro?: boolean
  children?: ReactNode
}

export const Boton = ({
  tono = 'principal',
  icono,
  bloque,
  compacto,
  peligro,
  className = '',
  children,
  type = 'button',
  ...resto
}: Props) => {
  const clases = [
    'boton',
    tono !== 'principal' ? `boton--${tono}` : '',
    bloque ? 'boton--bloque' : '',
    compacto ? 'boton--compacto' : '',
    peligro ? 'boton--peligro' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')
  return (
    <button type={type} className={clases} {...resto}>
      {icono && <Icono nombre={icono} />}
      {children}
    </button>
  )
}

interface PropsIcono extends ButtonHTMLAttributes<HTMLButtonElement> {
  icono: string
  etiqueta: string
  activo?: boolean
  peligro?: boolean
}

/** Boton de accion secundaria con solo icono. Siempre lleva
 *  etiqueta accesible: nunca se queda sin nombre. */
export const BotonIcono = ({
  icono,
  etiqueta,
  activo,
  peligro,
  className = '',
  type = 'button',
  ...resto
}: PropsIcono) => (
  <button
    type={type}
    className={[
      'icono-boton',
      activo ? 'icono-boton--activo' : '',
      peligro ? 'icono-boton--peligro' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ')}
    title={etiqueta}
    aria-label={etiqueta}
    {...resto}
  >
    <Icono nombre={icono} />
  </button>
)
