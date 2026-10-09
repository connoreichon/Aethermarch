import { useEffect, useId, useRef } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { T } from '../config/textos'
import { BotonIcono } from './Boton'

const FOCUSABLES =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

interface Props {
  titulo: string
  abierto: boolean
  alCerrar: () => void
  children: ReactNode
  pie?: ReactNode
  ancho?: number
}

/** En escritorio es un dialogo centrado; en movil, una hoja que
 *  sube desde abajo (mismo componente, lo decide el CSS).
 *  Escape cierra, el foco queda dentro y al cerrar vuelve a quien
 *  lo abrio. */
export const Dialogo = ({ titulo, abierto, alCerrar, children, pie, ancho }: Props) => {
  const caja = useRef<HTMLDivElement>(null)
  const quienAbrio = useRef<HTMLElement | null>(null)
  const idTitulo = useId()

  useEffect(() => {
    if (!abierto) return
    quienAbrio.current = document.activeElement as HTMLElement | null

    const primero = caja.current?.querySelector<HTMLElement>(FOCUSABLES)
    ;(primero ?? caja.current)?.focus()

    const alPulsar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        alCerrar()
        return
      }
      if (e.key !== 'Tab' || !caja.current) return
      const focos = Array.from(caja.current.querySelectorAll<HTMLElement>(FOCUSABLES)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      )
      if (focos.length === 0) return
      const primera = focos[0]
      const ultima = focos[focos.length - 1]
      if (e.shiftKey && document.activeElement === primera) {
        e.preventDefault()
        ultima.focus()
      } else if (!e.shiftKey && document.activeElement === ultima) {
        e.preventDefault()
        primera.focus()
      }
    }

    document.addEventListener('keydown', alPulsar, true)
    const scrollPrevio = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', alPulsar, true)
      document.body.style.overflow = scrollPrevio
      quienAbrio.current?.focus?.()
    }
  }, [abierto, alCerrar])

  if (!abierto) return null

  return createPortal(
    <div
      className="velo"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) alCerrar()
      }}
    >
      <div
        className="dialogo hoja"
        role="dialog"
        aria-modal="true"
        aria-labelledby={idTitulo}
        ref={caja}
        tabIndex={-1}
        style={ancho ? { width: `min(${ancho}px, 100%)` } : undefined}
      >
        <div className="hoja__asa" aria-hidden="true" />
        <div className="dialogo__cabeza">
          <h2 id={idTitulo}>{titulo}</h2>
          <BotonIcono icono="cruz" etiqueta={T.comun.cerrar} onClick={alCerrar} />
        </div>
        <div className="dialogo__cuerpo">{children}</div>
        {pie && <div className="dialogo__pie">{pie}</div>}
      </div>
    </div>,
    document.body,
  )
}
