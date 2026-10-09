import { useEffect, useMemo, useState } from 'react'
import { Boton, BotonIcono } from '../componentes/Boton'
import { Campo } from '../componentes/Campo'
import { Dialogo } from '../componentes/Dialogo'
import { FichaSitio } from '../componentes/FichaSitio'
import { Icono } from '../componentes/Iconos'
import { Panel, Vista } from '../componentes/Marco'
import { COLORES_GRUPO, MAX_FAVORITOS, colorDeGrupo } from '../config/ajustes'
import { T } from '../config/textos'
import type { Acceso, Datos, Grupo, Retomar as Enlace } from '../datos/tipos'
import { dominio, fechaCorta, mismaUrl, normalizarUrl, nuevoId } from '../datos/util'

interface Props {
  datos: Datos
  aplicar: (c: (d: Datos) => Datos) => void
  avisar: (texto: string, deshacer?: () => void) => void
  pedir: 'acceso' | 'retomar' | null
  alAtender: () => void
}

export const Colecciones = ({ datos, aplicar, avisar, pedir, alAtender }: Props) => {
  const [grupoActivo, setGrupoActivo] = useState('todos')
  const [formAcceso, setFormAcceso] = useState<Acceso | 'nuevo' | null>(null)
  const [formEnlace, setFormEnlace] = useState<Enlace | 'nuevo' | null>(null)
  const [verTerminados, setVerTerminados] = useState(false)
  const [avisoFav, setAvisoFav] = useState(false)

  useEffect(() => {
    if (pedir === 'acceso') setFormAcceso('nuevo')
    if (pedir === 'retomar') setFormEnlace('nuevo')
    if (pedir) alAtender()
  }, [pedir, alAtender])

  const favoritos = datos.accesos.filter((a) => a.favorito).length
  const visibles = useMemo(
    () => (grupoActivo === 'todos' ? datos.accesos : datos.accesos.filter((a) => a.grupoId === grupoActivo)),
    [datos.accesos, grupoActivo],
  )
  const pendientes = datos.retomar.filter((r) => !r.terminado)
  const terminados = datos.retomar.filter((r) => r.terminado)

  /* --------------------------------------------------- accesos --- */
  const mover = (id: string, paso: -1 | 1) =>
    aplicar((d) => {
      const copia = [...d.accesos]
      const i = copia.findIndex((a) => a.id === id)
      const vecinos = copia
        .map((a, idx) => ({ a, idx }))
        .filter(({ a }) => grupoActivo === 'todos' || a.grupoId === grupoActivo)
      const pos = vecinos.findIndex(({ a }) => a.id === id)
      const destino = vecinos[pos + paso]
      if (i < 0 || !destino) return d
      ;[copia[i], copia[destino.idx]] = [copia[destino.idx], copia[i]]
      return { ...d, accesos: copia }
    })

  const alternarFavorito = (a: Acceso) => {
    if (!a.favorito && favoritos >= MAX_FAVORITOS) {
      setAvisoFav(true)
      return
    }
    setAvisoFav(false)
    aplicar((d) => ({
      ...d,
      accesos: d.accesos.map((x) => (x.id === a.id ? { ...x, favorito: !x.favorito } : x)),
    }))
  }

  const borrarAcceso = (a: Acceso) => {
    const i = datos.accesos.findIndex((x) => x.id === a.id)
    aplicar((d) => ({ ...d, accesos: d.accesos.filter((x) => x.id !== a.id) }))
    avisar(T.accesos.borrado(a.nombre), () =>
      aplicar((d) => {
        const copia = [...d.accesos]
        copia.splice(Math.min(i, copia.length), 0, a)
        return { ...d, accesos: copia }
      }),
    )
  }

  /* ---------------------------------------------------- grupos --- */
  const anadirGrupo = () =>
    aplicar((d) => ({
      ...d,
      grupos: [
        ...d.grupos,
        {
          id: nuevoId(),
          nombre: `${T.grupos.nuevo} ${d.grupos.length + 1}`,
          color: COLORES_GRUPO[d.grupos.length % COLORES_GRUPO.length].clave,
        },
      ],
    }))

  const moverGrupo = (id: string, paso: -1 | 1) =>
    aplicar((d) => {
      const copia = [...d.grupos]
      const i = copia.findIndex((g) => g.id === id)
      const j = i + paso
      if (i < 0 || j < 0 || j >= copia.length) return d
      ;[copia[i], copia[j]] = [copia[j], copia[i]]
      return { ...d, grupos: copia }
    })

  const borrarGrupo = (g: Grupo) =>
    aplicar((d) => {
      if (d.grupos.length <= 1) return d
      const destino = d.grupos.find((x) => x.id !== g.id)!.id
      if (grupoActivo === g.id) setGrupoActivo('todos')
      return {
        ...d,
        grupos: d.grupos.filter((x) => x.id !== g.id),
        accesos: d.accesos.map((a) => (a.grupoId === g.id ? { ...a, grupoId: destino } : a)),
      }
    })

  /* -------------------------------------------------- retomar --- */
  const quitarEnlace = (e: Enlace) => {
    const i = datos.retomar.findIndex((x) => x.id === e.id)
    aplicar((d) => ({ ...d, retomar: d.retomar.filter((x) => x.id !== e.id) }))
    avisar(T.retomar.quitado, () =>
      aplicar((d) => {
        const copia = [...d.retomar]
        copia.splice(Math.min(i, copia.length), 0, e)
        return { ...d, retomar: copia }
      }),
    )
  }

  const alternarTerminado = (e: Enlace) => {
    aplicar((d) => ({
      ...d,
      retomar: d.retomar.map((x) => (x.id === e.id ? { ...x, terminado: !x.terminado } : x)),
    }))
    if (!e.terminado) avisar(T.retomar.hecho, () => alternarTerminado({ ...e, terminado: true }))
  }

  return (
    <Vista
      titulo={T.accesos.titulo}
      descripcion={T.accesos.subtitulo}
      acciones={
        <Boton icono="mas" onClick={() => setFormAcceso('nuevo')}>
          {T.accesos.anadir}
        </Boton>
      }
    >
      <div className="dos-columnas">
        <Panel titulo={T.grupos.titulo} id="t-grupos">
          <div className="filas">
            <button
              type="button"
              className="fila"
              aria-current={grupoActivo === 'todos'}
              style={{ textAlign: 'left', border: 0, background: grupoActivo === 'todos' ? 'var(--sup-hundida)' : 'none', width: '100%' }}
              onClick={() => setGrupoActivo('todos')}
            >
              <span className="fila__cuerpo">
                <span className="fila__titulo">{T.accesos.todos}</span>
              </span>
              <span className="suave menor">{datos.accesos.length}</span>
            </button>
            {datos.grupos.map((g, i) => {
              const cuantos = datos.accesos.filter((a) => a.grupoId === g.id).length
              return (
                <div key={g.id} className="fila" style={{ alignItems: 'center', background: grupoActivo === g.id ? 'var(--sup-hundida)' : undefined }}>
                  <span className="punto-color" style={{ background: colorDeGrupo(g.color) }} aria-hidden="true" />
                  <label className="oculto-visual" htmlFor={`g-${g.id}`}>
                    {T.grupos.renombrar(g.nombre)}
                  </label>
                  <input
                    id={`g-${g.id}`}
                    value={g.nombre}
                    maxLength={60}
                    onChange={(e) =>
                      aplicar((d) => ({
                        ...d,
                        grupos: d.grupos.map((x) => (x.id === g.id ? { ...x, nombre: e.target.value } : x)),
                      }))
                    }
                    onFocus={() => setGrupoActivo(g.id)}
                    style={{ flex: 1, minWidth: 0, border: 0, background: 'none', outline: 'none', fontWeight: 700, fontSize: 'var(--t-menor)' }}
                  />
                  <span className="suave menor">{cuantos}</span>
                  <span className="fila__acciones">
                    <BotonIcono className="icono-boton--mini" icono="arriba" etiqueta={T.grupos.subir(g.nombre)} disabled={i === 0} onClick={() => moverGrupo(g.id, -1)} />
                    <BotonIcono className="icono-boton--mini" icono="abajo" etiqueta={T.grupos.bajar(g.nombre)} disabled={i === datos.grupos.length - 1} onClick={() => moverGrupo(g.id, 1)} />
                    <BotonIcono
                      className="icono-boton--mini"
                      icono="papelera"
                      etiqueta={`${T.grupos.borrar}: ${g.nombre}`}
                      title={T.grupos.borrarAviso(cuantos)}
                      peligro
                      disabled={datos.grupos.length <= 1}
                      onClick={() => borrarGrupo(g)}
                    />
                  </span>
                </div>
              )
            })}
          </div>
          <Boton tono="secundario" compacto icono="mas" onClick={anadirGrupo} bloque className="boton--bloque" style={{ marginTop: 'var(--e3)' }}>
            {T.grupos.nuevo}
          </Boton>
        </Panel>

        <div>
          <Panel
            titulo={grupoActivo === 'todos' ? T.accesos.todos : datos.grupos.find((g) => g.id === grupoActivo)?.nombre ?? ''}
            nota={T.grupos.cuenta(visibles.length)}
            id="t-accesos"
          >
            {avisoFav && (
              <p className="alerta alerta--info" style={{ marginBottom: 'var(--e3)' }} role="status">
                <Icono nombre="info" />
                {T.accesos.limiteFavoritos(MAX_FAVORITOS)}
              </p>
            )}
            {visibles.length === 0 ? (
              <div className="vacio">
                <h3>{T.accesos.vacioTitulo}</h3>
                <p>{T.accesos.vacioTexto}</p>
                <Boton icono="mas" onClick={() => setFormAcceso('nuevo')}>
                  {T.accesos.anadir}
                </Boton>
              </div>
            ) : (
              <div className="filas">
                {visibles.map((a, i) => (
                  <div className="fila" key={a.id}>
                    <span className="favorito__ficha" style={{ width: 38, height: 38, borderRadius: 11, boxShadow: 'none', background: 'var(--sup-hundida)' }}>
                      <FichaSitio nombre={a.nombre} url={a.url} tamano={22} />
                    </span>
                    <div className="fila__cuerpo">
                      <a className="fila__titulo" href={a.url} target="_blank" rel="noreferrer noopener">
                        {a.nombre}
                      </a>
                      <div className="fila__meta">
                        <span className="fila__dominio">{dominio(a.url)}</span>
                      </div>
                    </div>
                    <div className="fila__acciones">
                      <BotonIcono
                        className="icono-boton--mini"
                        icono="estrella"
                        etiqueta={`${a.favorito ? T.accesos.favorito : T.accesos.noFavorito}: ${a.nombre}`}
                        activo={a.favorito}
                        aria-pressed={a.favorito}
                        onClick={() => alternarFavorito(a)}
                      />
                      <BotonIcono className="icono-boton--mini" icono="arriba" etiqueta={`${T.accesos.subir}: ${a.nombre}`} disabled={i === 0} onClick={() => mover(a.id, -1)} />
                      <BotonIcono className="icono-boton--mini" icono="abajo" etiqueta={`${T.accesos.bajar}: ${a.nombre}`} disabled={i === visibles.length - 1} onClick={() => mover(a.id, 1)} />
                      <BotonIcono className="icono-boton--mini" icono="lapiz" etiqueta={`${T.accesos.editar}: ${a.nombre}`} onClick={() => setFormAcceso(a)} />
                      <BotonIcono className="icono-boton--mini" icono="papelera" etiqueta={`${T.accesos.borrar}: ${a.nombre}`} peligro onClick={() => borrarAcceso(a)} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          <Panel
            titulo={T.retomar.titulo}
            nota={T.retomar.subtitulo}
            id="t-retomar"
            acciones={
              <Boton tono="secundario" compacto icono="mas" onClick={() => setFormEnlace('nuevo')}>
                {T.retomar.anadir}
              </Boton>
            }
          >
            {pendientes.length === 0 && terminados.length === 0 ? (
              <div className="vacio">
                <h3>{T.retomar.vacioTitulo}</h3>
                <p>{T.retomar.vacioTexto}</p>
              </div>
            ) : (
              <>
                <div className="filas">
                  {pendientes.map((e) => (
                    <FilaEnlace key={e.id} enlace={e} alTerminar={() => alternarTerminado(e)} alEditar={() => setFormEnlace(e)} alQuitar={() => quitarEnlace(e)} />
                  ))}
                </div>
                {terminados.length > 0 && (
                  <div style={{ marginTop: 'var(--e3)' }}>
                    <Boton tono="discreto" compacto icono={verTerminados ? 'arriba' : 'abajo'} aria-expanded={verTerminados} onClick={() => setVerTerminados(!verTerminados)}>
                      {T.retomar.terminados(terminados.length)}
                    </Boton>
                    {verTerminados && (
                      <div className="filas" style={{ marginTop: 'var(--e2)' }}>
                        {terminados.map((e) => (
                          <FilaEnlace key={e.id} enlace={e} alTerminar={() => alternarTerminado(e)} alEditar={() => setFormEnlace(e)} alQuitar={() => quitarEnlace(e)} />
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <p className="menor suave" style={{ marginTop: 'var(--e3)' }}>
                  {T.retomar.nota}
                </p>
              </>
            )}
          </Panel>
        </div>
      </div>

      <FormularioAcceso
        abierto={formAcceso !== null}
        acceso={formAcceso === 'nuevo' ? null : formAcceso}
        datos={datos}
        grupoSugerido={grupoActivo === 'todos' ? datos.grupos[0]?.id : grupoActivo}
        puedeFavorito={favoritos < MAX_FAVORITOS}
        alCerrar={() => setFormAcceso(null)}
        alGuardar={(campos) => {
          if (formAcceso === 'nuevo') {
            aplicar((d) => ({ ...d, accesos: [...d.accesos, { id: nuevoId(), usos: 0, ultimoUso: null, ...campos }] }))
          } else if (formAcceso) {
            aplicar((d) => ({ ...d, accesos: d.accesos.map((a) => (a.id === formAcceso.id ? { ...a, ...campos } : a)) }))
          }
          setFormAcceso(null)
        }}
      />

      <FormularioEnlace
        abierto={formEnlace !== null}
        enlace={formEnlace === 'nuevo' ? null : formEnlace}
        alCerrar={() => setFormEnlace(null)}
        alGuardar={(campos) => {
          if (formEnlace === 'nuevo') {
            aplicar((d) => ({
              ...d,
              retomar: [{ id: nuevoId(), creado: Date.now(), terminado: false, ...campos }, ...d.retomar],
            }))
          } else if (formEnlace) {
            aplicar((d) => ({ ...d, retomar: d.retomar.map((r) => (r.id === formEnlace.id ? { ...r, ...campos } : r)) }))
          }
          setFormEnlace(null)
        }}
      />
    </Vista>
  )
}

/* ------------------------------------------------------------ filas */

const FilaEnlace = ({
  enlace,
  alTerminar,
  alEditar,
  alQuitar,
}: {
  enlace: Enlace
  alTerminar: () => void
  alEditar: () => void
  alQuitar: () => void
}) => (
  <article className={`fila${enlace.terminado ? ' fila--hecha' : ''}`}>
    <div className="fila__cuerpo">
      <a className="fila__titulo" href={enlace.url} target="_blank" rel="noreferrer noopener">
        {enlace.titulo}
      </a>
      <div className="fila__meta">
        <span className="fila__dominio">
          {dominio(enlace.url)} · {T.retomar.guardadoEl(fechaCorta(enlace.creado))}
        </span>
        {enlace.nota && <span>{enlace.nota}</span>}
      </div>
    </div>
    <div className="fila__acciones">
      <BotonIcono
        className="icono-boton--mini"
        icono="check"
        etiqueta={`${enlace.terminado ? T.retomar.reabrir : T.retomar.terminar}: ${enlace.titulo}`}
        activo={enlace.terminado}
        aria-pressed={enlace.terminado}
        onClick={alTerminar}
      />
      <BotonIcono className="icono-boton--mini" icono="lapiz" etiqueta={`${T.retomar.editar}: ${enlace.titulo}`} onClick={alEditar} />
      <BotonIcono className="icono-boton--mini" icono="papelera" etiqueta={`${T.retomar.quitar}: ${enlace.titulo}`} peligro onClick={alQuitar} />
    </div>
  </article>
)

/* ------------------------------------------------------ formularios */

type CamposAcceso = { nombre: string; url: string; grupoId: string; favorito: boolean }

const FormularioAcceso = ({
  abierto,
  acceso,
  datos,
  grupoSugerido,
  puedeFavorito,
  alCerrar,
  alGuardar,
}: {
  abierto: boolean
  acceso: Acceso | null
  datos: Datos
  grupoSugerido?: string
  puedeFavorito: boolean
  alCerrar: () => void
  alGuardar: (c: CamposAcceso) => void
}) => {
  const [nombre, setNombre] = useState('')
  const [url, setUrl] = useState('')
  const [grupoId, setGrupoId] = useState('')
  const [favorito, setFavorito] = useState(true)
  const [errores, setErrores] = useState<{ nombre?: string; url?: string }>({})
  const esperado = acceso?.id ?? 'nuevo'
  const [visto, setVisto] = useState(esperado)

  if (abierto && visto !== esperado) {
    setVisto(esperado)
    setNombre(acceso?.nombre ?? '')
    setUrl(acceso?.url ?? '')
    setGrupoId(acceso?.grupoId ?? grupoSugerido ?? datos.grupos[0]?.id ?? '')
    setFavorito(acceso ? acceso.favorito : puedeFavorito)
    setErrores({})
  }

  const enviar = () => {
    const limpio = nombre.trim()
    const destino = normalizarUrl(url)
    const fallos: typeof errores = {}
    if (!limpio) fallos.nombre = T.accesos.errorNombre
    if (!destino) fallos.url = T.accesos.errorUrl
    else if (datos.accesos.some((a) => a.id !== acceso?.id && mismaUrl(a.url, destino)))
      fallos.url = T.accesos.duplicado
    setErrores(fallos)
    if (Object.keys(fallos).length > 0 || !destino) return
    alGuardar({ nombre: limpio, url: destino, grupoId: grupoId || datos.grupos[0].id, favorito })
  }

  return (
    <Dialogo
      titulo={acceso ? T.accesos.editarTitulo : T.accesos.nuevoTitulo}
      abierto={abierto}
      alCerrar={alCerrar}
      pie={
        <>
          <Boton tono="secundario" onClick={alCerrar}>
            {T.comun.cancelar}
          </Boton>
          <Boton onClick={enviar}>{T.accesos.guardar}</Boton>
        </>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
          enviar()
        }}
        style={{ display: 'grid', gap: 'var(--e4)' }}
      >
        <Campo etiqueta={T.accesos.campoUrl} placeholder="correo.google.com" value={url} onChange={(e) => setUrl(e.target.value)} error={errores.url} inputMode="url" maxLength={2048} autoComplete="off" />
        <Campo etiqueta={T.accesos.campoNombre} ayuda={T.accesos.campoNombreAyuda} value={nombre} onChange={(e) => setNombre(e.target.value)} error={errores.nombre} maxLength={80} autoComplete="off" />
        <div className="campo">
          <label className="campo__etiqueta" htmlFor="grupo-acceso">
            {T.accesos.campoGrupo}
          </label>
          <select id="grupo-acceso" className="select" value={grupoId} onChange={(e) => setGrupoId(e.target.value)}>
            {datos.grupos.map((g) => (
              <option key={g.id} value={g.id}>
                {g.nombre}
              </option>
            ))}
          </select>
        </div>
        <label style={{ display: 'flex', gap: 'var(--e3)', alignItems: 'center', cursor: 'pointer' }}>
          <input type="checkbox" checked={favorito} disabled={!favorito && !puedeFavorito} onChange={(e) => setFavorito(e.target.checked)} style={{ width: 20, height: 20, accentColor: 'var(--accion)' }} />
          <span>
            {T.accesos.campoFavorito}
            {!favorito && !puedeFavorito && <span className="menor suave"> — {T.accesos.limiteFavoritos(MAX_FAVORITOS)}</span>}
          </span>
        </label>
        <button type="submit" className="oculto-visual">
          {T.accesos.guardar}
        </button>
      </form>
    </Dialogo>
  )
}

type CamposEnlace = { titulo: string; url: string; nota: string }

const FormularioEnlace = ({
  abierto,
  enlace,
  alCerrar,
  alGuardar,
}: {
  abierto: boolean
  enlace: Enlace | null
  alCerrar: () => void
  alGuardar: (c: CamposEnlace) => void
}) => {
  const [titulo, setTitulo] = useState('')
  const [url, setUrl] = useState('')
  const [nota, setNota] = useState('')
  const [error, setError] = useState<string>()
  const esperado = enlace?.id ?? 'nuevo'
  const [visto, setVisto] = useState(esperado)

  if (abierto && visto !== esperado) {
    setVisto(esperado)
    setTitulo(enlace?.titulo ?? '')
    setUrl(enlace?.url ?? '')
    setNota(enlace?.nota ?? '')
    setError(undefined)
  }

  const enviar = () => {
    const destino = normalizarUrl(url)
    if (!destino) {
      setError(T.accesos.errorUrl)
      return
    }
    alGuardar({ titulo: titulo.trim() || dominio(destino), url: destino, nota: nota.trim() })
  }

  return (
    <Dialogo
      titulo={enlace ? T.retomar.editarTitulo : T.retomar.nuevoTitulo}
      abierto={abierto}
      alCerrar={alCerrar}
      pie={
        <>
          <Boton tono="secundario" onClick={alCerrar}>
            {T.comun.cancelar}
          </Boton>
          <Boton onClick={enviar}>{T.retomar.guardar}</Boton>
        </>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
          enviar()
        }}
        style={{ display: 'grid', gap: 'var(--e4)' }}
      >
        <Campo etiqueta={T.retomar.campoUrl} placeholder="docs.google.com/..." value={url} onChange={(e) => setUrl(e.target.value)} error={error} inputMode="url" maxLength={2048} autoComplete="off" />
        <Campo etiqueta={T.retomar.campoTitulo} value={titulo} onChange={(e) => setTitulo(e.target.value)} maxLength={160} autoComplete="off" />
        <Campo etiqueta={T.retomar.campoNota} ayuda={T.retomar.campoNotaAyuda} value={nota} onChange={(e) => setNota(e.target.value)} maxLength={400} autoComplete="off" />
        <button type="submit" className="oculto-visual">
          {T.retomar.guardar}
        </button>
      </form>
    </Dialogo>
  )
}
