import { useEffect, useRef, useState } from 'react'
import { Boton, BotonIcono } from '../componentes/Boton'
import { Icono } from '../componentes/Iconos'
import { Panel, Vista } from '../componentes/Marco'
import { ESPERA_GUARDADO_NOTA } from '../config/ajustes'
import { T } from '../config/textos'
import type { Datos, EstadoGuardado, Nota } from '../datos/tipos'
import { fechaCorta, nuevoId, sinAcentos } from '../datos/util'

interface Props {
  datos: Datos
  aplicar: (c: (d: Datos) => Datos) => void
  avisar: (texto: string, deshacer?: () => void) => void
  discoOk: boolean
}

const resumen = (n: Nota) => n.titulo.trim() || n.texto.split('\n')[0]?.trim() || T.notas.sinTitulo

export const Notas = ({ datos, aplicar, avisar, discoOk }: Props) => {
  const [activa, setActiva] = useState<string | null>(datos.notas[0]?.id ?? null)
  const [filtro, setFiltro] = useState('')

  const q = sinAcentos(filtro.trim())
  const listadas = q
    ? datos.notas.filter((n) => sinAcentos(`${n.titulo} ${n.texto}`).includes(q))
    : datos.notas

  const nota = datos.notas.find((n) => n.id === activa) ?? null

  const crear = () => {
    const nueva: Nota = { id: nuevoId(), titulo: '', texto: '', creada: Date.now(), actualizada: Date.now() }
    aplicar((d) => ({ ...d, notas: [nueva, ...d.notas] }))
    setActiva(nueva.id)
    setFiltro('')
  }

  const borrar = (n: Nota) => {
    const i = datos.notas.findIndex((x) => x.id === n.id)
    aplicar((d) => ({ ...d, notas: d.notas.filter((x) => x.id !== n.id) }))
    if (activa === n.id) setActiva(datos.notas.find((x) => x.id !== n.id)?.id ?? null)
    avisar(T.notas.borrada, () =>
      aplicar((d) => {
        const copia = [...d.notas]
        copia.splice(Math.min(i, copia.length), 0, n)
        return { ...d, notas: copia }
      }),
    )
  }

  return (
    <Vista
      titulo={T.notas.titulo}
      descripcion={T.notas.subtitulo}
      acciones={
        <Boton icono="mas" onClick={crear}>
          {T.notas.nueva}
        </Boton>
      }
    >
      {datos.notas.length === 0 ? (
        <Panel>
          <div className="vacio">
            <h3>{T.notas.vacioTitulo}</h3>
            <p>{T.notas.vacioTexto}</p>
            <Boton icono="mas" onClick={crear}>
              {T.notas.nueva}
            </Boton>
          </div>
        </Panel>
      ) : (
        <div className="dos-columnas">
          <Panel titulo={T.notas.lista} id="t-lista-notas">
            <div className="campo__caja" style={{ marginBottom: 'var(--e3)' }}>
              <Icono nombre="buscar" />
              <input
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                placeholder={T.notas.buscar}
                aria-label={T.notas.buscar}
                autoComplete="off"
              />
            </div>
            <div className="filas">
              {listadas.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  className="fila"
                  aria-current={activa === n.id}
                  style={{
                    textAlign: 'left',
                    border: 0,
                    width: '100%',
                    background: activa === n.id ? 'var(--sup-hundida)' : 'none',
                  }}
                  onClick={() => setActiva(n.id)}
                >
                  <span className="fila__cuerpo">
                    <span className="fila__titulo">{resumen(n)}</span>
                    <span className="fila__meta">
                      <span className="fila__dominio">{fechaCorta(n.actualizada)}</span>
                    </span>
                  </span>
                </button>
              ))}
              {listadas.length === 0 && <p className="menor suave">{T.buscar.sinResultados(filtro.trim())}</p>}
            </div>
          </Panel>

          {nota ? (
            <Editor
              key={nota.id}
              nota={nota}
              discoOk={discoOk}
              aplicar={aplicar}
              alBorrar={() => borrar(nota)}
            />
          ) : (
            <Panel>
              <div className="vacio">
                <p>{T.notas.elige}</p>
              </div>
            </Panel>
          )}
        </div>
      )}
    </Vista>
  )
}

/* -------------------------------------------------------- editor --- */

const Editor = ({
  nota,
  discoOk,
  aplicar,
  alBorrar,
}: {
  nota: Nota
  discoOk: boolean
  aplicar: (c: (d: Datos) => Datos) => void
  alBorrar: () => void
}) => {
  const [titulo, setTitulo] = useState(nota.titulo)
  const [texto, setTexto] = useState(nota.texto)
  const [estado, setEstado] = useState<EstadoGuardado>('quieto')
  const reloj = useRef<number | null>(null)
  const limpieza = useRef<number | null>(null)
  const caja = useRef<HTMLTextAreaElement>(null)

  // La hoja crece con el texto: nada de leer una nota por una ventanita
  useEffect(() => {
    const el = caja.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [texto])

  useEffect(
    () => () => {
      if (reloj.current) window.clearTimeout(reloj.current)
      if (limpieza.current) window.clearTimeout(limpieza.current)
    },
    [],
  )

  const guardar = (campos: { titulo?: string; texto?: string }) => {
    setEstado('guardando')
    if (reloj.current) window.clearTimeout(reloj.current)
    reloj.current = window.setTimeout(() => {
      aplicar((d) => ({
        ...d,
        notas: d.notas.map((n) => (n.id === nota.id ? { ...n, ...campos, actualizada: Date.now() } : n)),
      }))
      setEstado(discoOk ? 'guardado' : 'fallo')
      if (limpieza.current) window.clearTimeout(limpieza.current)
      limpieza.current = window.setTimeout(() => setEstado((e) => (e === 'guardado' ? 'quieto' : e)), 2600)
    }, ESPERA_GUARDADO_NOTA)
  }

  const visible = !discoOk && estado !== 'quieto' ? 'fallo' : estado

  return (
    <Panel
      titulo={titulo.trim() || nota.titulo.trim() || T.notas.sinTitulo}
      id="t-editor"
      acciones={
        <BotonIcono icono="papelera" etiqueta={T.notas.borrar} peligro onClick={alBorrar} />
      }
    >
      <div className="hoja">
        <label className="oculto-visual" htmlFor="nota-titulo">
          {T.notas.marcadorTitulo}
        </label>
        <input
          id="nota-titulo"
          value={titulo}
          maxLength={120}
          placeholder={T.notas.marcadorTitulo}
          onChange={(e) => {
            setTitulo(e.target.value)
            guardar({ titulo: e.target.value, texto })
          }}
        />
        <div className="hoja__sep" />
        <label className="oculto-visual" htmlFor="nota-texto">
          {T.notas.titulo}
        </label>
        <textarea
          id="nota-texto"
          ref={caja}
          value={texto}
          placeholder={T.notas.marcadorTexto}
          spellCheck
          aria-describedby="estado-nota"
          onChange={(e) => {
            setTexto(e.target.value)
            guardar({ titulo, texto: e.target.value })
          }}
        />
      </div>
      <p
        id="estado-nota"
        role="status"
        aria-live="polite"
        className={`estado-guardado${visible === 'guardado' ? ' estado-guardado--ok' : ''}${visible === 'fallo' ? ' estado-guardado--mal' : ''}`}
      >
        {visible === 'guardando' && (
          <>
            <Icono nombre="reloj" tamano={14} /> {T.notas.guardando}
          </>
        )}
        {visible === 'guardado' && (
          <>
            <Icono nombre="check" tamano={14} /> {T.notas.guardado}
          </>
        )}
        {visible === 'fallo' && (
          <>
            <Icono nombre="aviso" tamano={14} /> {T.notas.fallo}
          </>
        )}
      </p>
    </Panel>
  )
}
