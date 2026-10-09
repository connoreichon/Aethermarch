import { useCallback, useEffect, useRef, useState } from 'react'
import { datosVacios } from '../datos/almacen'
import { almacenLocal } from '../datos/almacenes/local'
import type { AlmacenDatos } from '../datos/almacenes/puerto'
import { datosEjemplo } from '../datos/ejemplo'
import type { Datos } from '../datos/tipos'

/**
 * Único punto del programa que escribe datos.
 *
 * Los componentes reciben `datos` y `aplicar` y no saben si detrás
 * hay localStorage, una cuenta o nada. Para cambiar de medio solo
 * hay que pasarle otro almacén: no se toca ni un componente.
 *
 * `discoOk` se pone a false si la escritura falla (ventana privada,
 * cuota llena) y la interfaz deja de prometer que ha guardado.
 */
export const useDatos = (almacen: AlmacenDatos = almacenLocal) => {
  const [datos, setDatos] = useState<Datos>(() => almacen.cargarYa?.() ?? datosVacios())
  const [cargando, setCargando] = useState(!almacen.cargarYa)
  const [modoEjemplo, setModoEjemplo] = useState(false)
  const [discoOk, setDiscoOk] = useState(true)
  const guardadoReal = useRef<Datos | null>(null)

  // Almacenes sin lectura sincrona (los que vendran): se carga aparte
  useEffect(() => {
    if (almacen.cargarYa) return
    let vigente = true
    void almacen.cargar().then((cargados) => {
      if (!vigente) return
      setDatos(cargados ?? datosVacios())
      setCargando(false)
    })
    return () => {
      vigente = false
    }
  }, [almacen])

  const persistir = useCallback(
    (siguiente: Datos) => {
      void almacen.guardar(siguiente).then((ok) => setDiscoOk(ok))
    },
    [almacen],
  )

  const aplicar = useCallback(
    (cambio: (d: Datos) => Datos) => {
      setDatos((previo) => {
        const siguiente = { ...cambio(previo), actualizado: Date.now() }
        if (!modoEjemplo) persistir(siguiente)
        return siguiente
      })
    },
    [modoEjemplo, persistir],
  )

  const entrarEjemplo = useCallback(() => {
    setDatos((previo) => {
      guardadoReal.current = previo
      return datosEjemplo()
    })
    setModoEjemplo(true)
  }, [])

  const salirEjemplo = useCallback(() => {
    const previo = guardadoReal.current
    guardadoReal.current = null
    setModoEjemplo(false)
    if (previo) {
      setDatos(previo)
      return
    }
    const recuperado = almacen.cargarYa?.()
    if (recuperado) setDatos(recuperado)
    else void almacen.cargar().then((d) => setDatos(d ?? datosVacios()))
  }, [almacen])

  /** Sustituye todo (importación confirmada). */
  const reemplazar = useCallback(
    (nuevos: Datos) => {
      guardadoReal.current = null
      setModoEjemplo(false)
      const sellados = { ...nuevos, actualizado: Date.now() }
      setDatos(sellados)
      persistir(sellados)
    },
    [persistir],
  )

  const restablecer = useCallback(() => {
    guardadoReal.current = null
    setModoEjemplo(false)
    const limpio = datosVacios()
    void almacen.limpiar().then(() => {
      setDatos(limpio)
      persistir(limpio)
    })
  }, [almacen, persistir])

  return {
    datos,
    cargando,
    modoEjemplo,
    discoOk,
    aplicar,
    entrarEjemplo,
    salirEjemplo,
    reemplazar,
    restablecer,
  }
}
