import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { DURACION_DESHACER } from '../config/ajustes'
import { T } from '../config/textos'
import { Boton } from './Boton'

export interface Mensaje {
  id: number
  texto: string
  deshacer?: () => void
}

/** Un aviso cada vez, abajo, con la opcion de deshacer cuando la
 *  accion se puede deshacer. Sin confeti y sin sonido. */
export const useAviso = () => {
  const [mensaje, setMensaje] = useState<Mensaje | null>(null)
  const reloj = useRef<number | null>(null)

  const limpiar = useCallback(() => {
    if (reloj.current) window.clearTimeout(reloj.current)
    reloj.current = null
  }, [])

  const avisar = useCallback(
    (texto: string, deshacer?: () => void) => {
      limpiar()
      const id = Date.now()
      setMensaje({ id, texto, deshacer })
      reloj.current = window.setTimeout(
        () => setMensaje((m) => (m?.id === id ? null : m)),
        DURACION_DESHACER,
      )
    },
    [limpiar],
  )

  const cerrar = useCallback(() => {
    limpiar()
    setMensaje(null)
  }, [limpiar])

  useEffect(() => limpiar, [limpiar])

  return { mensaje, avisar, cerrar }
}

interface Props {
  mensaje: Mensaje | null
  alCerrar: () => void
}

export const Aviso = ({ mensaje, alCerrar }: Props) => {
  if (!mensaje) return null
  return createPortal(
    <div className="aviso" role="status" aria-live="polite" key={mensaje.id}>
      <span>{mensaje.texto}</span>
      {mensaje.deshacer && (
        <Boton
          tono="discreto"
          compacto
          icono="volver"
          onClick={() => {
            mensaje.deshacer?.()
            alCerrar()
          }}
        >
          {T.comun.deshacer}
        </Boton>
      )}
    </div>,
    document.body,
  )
}
