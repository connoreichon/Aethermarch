import { useMemo, useState } from 'react'
import { Boton, BotonIcono } from '../componentes/Boton'
import { Casilla } from '../componentes/Casilla'
import { Icono } from '../componentes/Iconos'
import { Panel, Vista } from '../componentes/Marco'
import { MAX_PRIORIDADES } from '../config/ajustes'
import { T } from '../config/textos'
import type { Datos, Tarea } from '../datos/tipos'
import { nuevoId } from '../datos/util'

interface Props {
  datos: Datos
  aplicar: (c: (d: Datos) => Datos) => void
  avisar: (texto: string, deshacer?: () => void) => void
}

export const Tareas = ({ datos, aplicar, avisar }: Props) => {
  const [texto, setTexto] = useState('')
  const [verHechas, setVerHechas] = useState(false)
  const [limite, setLimite] = useState(false)

  const { pendientes, hechas, prioridades } = useMemo(() => {
    const pend = datos.tareas.filter((t) => !t.hecha)
    return {
      pendientes: [...pend].sort((a, b) => Number(b.prioridad) - Number(a.prioridad) || a.creada - b.creada),
      hechas: datos.tareas.filter((t) => t.hecha).sort((a, b) => (b.completada ?? 0) - (a.completada ?? 0)),
      prioridades: pend.filter((t) => t.prioridad).length,
    }
  }, [datos.tareas])

  const anadir = () => {
    const limpio = texto.trim()
    if (!limpio) return
    aplicar((d) => ({
      ...d,
      tareas: [
        ...d.tareas,
        {
          id: nuevoId(),
          texto: limpio,
          hecha: false,
          prioridad: prioridades < MAX_PRIORIDADES,
          creada: Date.now(),
          completada: null,
        },
      ],
    }))
    setTexto('')
    setLimite(false)
  }

  const alternar = (t: Tarea) => {
    aplicar((d) => ({
      ...d,
      tareas: d.tareas.map((x) =>
        x.id === t.id
          ? { ...x, hecha: !x.hecha, completada: x.hecha ? null : Date.now(), prioridad: x.hecha ? x.prioridad : false }
          : x,
      ),
    }))
    if (!t.hecha) {
      avisar(T.tareas.completada, () =>
        aplicar((d) => ({
          ...d,
          tareas: d.tareas.map((x) =>
            x.id === t.id ? { ...x, hecha: false, completada: null, prioridad: t.prioridad } : x,
          ),
        })),
      )
    }
  }

  const alternarPrioridad = (t: Tarea) => {
    if (!t.prioridad && prioridades >= MAX_PRIORIDADES) {
      setLimite(true)
      return
    }
    setLimite(false)
    aplicar((d) => ({
      ...d,
      tareas: d.tareas.map((x) => (x.id === t.id ? { ...x, prioridad: !x.prioridad } : x)),
    }))
  }

  const borrar = (t: Tarea) => {
    const i = datos.tareas.findIndex((x) => x.id === t.id)
    aplicar((d) => ({ ...d, tareas: d.tareas.filter((x) => x.id !== t.id) }))
    avisar(T.tareas.borrada, () =>
      aplicar((d) => {
        const copia = [...d.tareas]
        copia.splice(Math.min(i, copia.length), 0, t)
        return { ...d, tareas: copia }
      }),
    )
  }

  const vaciar = () => {
    const previas = datos.tareas
    aplicar((d) => ({ ...d, tareas: d.tareas.filter((t) => !t.hecha) }))
    avisar(T.tareas.vaciadas(hechas.length), () => aplicar((d) => ({ ...d, tareas: previas })))
  }

  return (
    <Vista titulo={T.tareas.titulo} descripcion={T.tareas.subtitulo(prioridades, MAX_PRIORIDADES)}>
      <Panel>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            anadir()
          }}
          style={{ display: 'flex', gap: 'var(--e2)', marginBottom: 'var(--e4)' }}
        >
          <label className="oculto-visual" htmlFor="nueva-tarea">
            {T.tareas.anadir}
          </label>
          <div className="campo__caja" style={{ flex: 1 }}>
            <input
              id="nueva-tarea"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder={T.tareas.marcador}
              maxLength={280}
              autoComplete="off"
            />
          </div>
          <Boton type="submit" icono="mas" disabled={!texto.trim()}>
            <span className="oculto-visual">{T.tareas.anadir}</span>
          </Boton>
        </form>

        {limite && (
          <p className="alerta alerta--info" role="status" style={{ marginBottom: 'var(--e3)' }}>
            <Icono nombre="info" />
            {T.tareas.limite(MAX_PRIORIDADES)}
          </p>
        )}

        {pendientes.length === 0 && hechas.length === 0 ? (
          <div className="vacio">
            <h3>{T.tareas.vacioTitulo}</h3>
            <p>{T.tareas.vacioTexto}</p>
          </div>
        ) : (
          <div className="tareas">
            {pendientes.map((t) => (
              <Fila key={t.id} tarea={t} alAlternar={() => alternar(t)} alPriorizar={() => alternarPrioridad(t)} alBorrar={() => borrar(t)} />
            ))}
            {pendientes.length === 0 && <p className="menor suave">{T.tareas.vacioTitulo}</p>}
          </div>
        )}

        {hechas.length > 0 && (
          <div style={{ marginTop: 'var(--e4)' }}>
            <div style={{ display: 'flex', gap: 'var(--e2)', flexWrap: 'wrap' }}>
              <Boton tono="discreto" compacto icono={verHechas ? 'arriba' : 'abajo'} aria-expanded={verHechas} onClick={() => setVerHechas(!verHechas)}>
                {T.tareas.hechas(hechas.length)}
              </Boton>
              {verHechas && (
                <Boton tono="discreto" compacto peligro icono="papelera" onClick={vaciar}>
                  {T.tareas.vaciarHechas}
                </Boton>
              )}
            </div>
            {verHechas && (
              <div className="tareas" style={{ marginTop: 'var(--e2)' }}>
                {hechas.map((t) => (
                  <Fila key={t.id} tarea={t} alAlternar={() => alternar(t)} alBorrar={() => borrar(t)} />
                ))}
              </div>
            )}
          </div>
        )}
      </Panel>
    </Vista>
  )
}

const Fila = ({
  tarea,
  alAlternar,
  alPriorizar,
  alBorrar,
}: {
  tarea: Tarea
  alAlternar: () => void
  alPriorizar?: () => void
  alBorrar: () => void
}) => (
  <div className={`tarea${tarea.hecha ? ' tarea--hecha' : ''}`}>
    <Casilla
      marcada={tarea.hecha}
      etiqueta={`${tarea.hecha ? T.tareas.reabrir : T.tareas.completar}: ${tarea.texto}`}
      alCambiar={alAlternar}
    />
    <span className="tarea__texto">{tarea.texto}</span>
    <div className="fila__acciones">
      {alPriorizar && (
        <BotonIcono
          className="icono-boton--mini"
          icono="estrella"
          etiqueta={`${tarea.prioridad ? T.tareas.quitarPrioridad : T.tareas.prioridad}: ${tarea.texto}`}
          activo={tarea.prioridad}
          aria-pressed={tarea.prioridad}
          onClick={alPriorizar}
        />
      )}
      <BotonIcono className="icono-boton--mini" icono="papelera" etiqueta={`${T.tareas.borrar}: ${tarea.texto}`} peligro onClick={alBorrar} />
    </div>
  </div>
)
