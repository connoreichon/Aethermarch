import { useId } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'
import { Icono } from './Iconos'

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  etiqueta: string
  ayuda?: string
  error?: string
  icono?: string
  accesorio?: ReactNode
  etiquetaOculta?: boolean
}

export const Campo = ({
  etiqueta,
  ayuda,
  error,
  icono,
  accesorio,
  etiquetaOculta,
  ...resto
}: Props) => {
  const id = useId()
  const idAyuda = `${id}-ayuda`
  const idError = `${id}-error`
  const descrito = [ayuda ? idAyuda : '', error ? idError : ''].filter(Boolean).join(' ')

  return (
    <div className="campo">
      <label className={etiquetaOculta ? 'oculto-visual' : 'campo__etiqueta'} htmlFor={id}>
        {etiqueta}
      </label>
      <div className={`campo__caja${error ? ' campo__caja--error' : ''}`}>
        {icono && <Icono nombre={icono} />}
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={descrito || undefined}
          {...resto}
        />
        {accesorio}
      </div>
      {ayuda && !error && (
        <p className="campo__ayuda" id={idAyuda}>
          {ayuda}
        </p>
      )}
      {error && (
        <p className="campo__error" id={idError}>
          <Icono nombre="aviso" tamano={16} />
          {error}
        </p>
      )}
    </div>
  )
}
