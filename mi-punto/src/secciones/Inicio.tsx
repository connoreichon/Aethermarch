import { useEffect, useMemo, useRef, useState } from 'react'
import { BotonIcono } from '../componentes/Boton'
import { FichaSitio } from '../componentes/FichaSitio'
import { Icono } from '../componentes/Iconos'
import type { Vista } from '../componentes/Marco'
import { MAX_FAVORITOS } from '../config/ajustes'
import { T } from '../config/textos'
import type { Datos, Tarea } from '../datos/tipos'
import { dominio, fechaLarga, horaCorta, saludoDeLaHora, sinAcentos } from '../datos/util'
import { Resultados } from './Resultados'

interface Props {
  datos: Datos
  alIrA: (v: Vista) => void
  alAbrirAcceso: (id: string) => void
  alNuevoAcceso: () => void
  alNuevoRetomar: () => void
  alAlternarTarea: (t: Tarea) => void
}

const useReloj = () => {
  const [ahora, setAhora] = useState(() => new Date())
  useEffect(() => {
    // Se sincroniza con el cambio de minuto, no cada segundo
    let id: number
    const programar = () => {
      const faltan = 60000 - (Date.now() % 60000)
      id = window.setTimeout(() => {
        setAhora(new Date())
        programar()
      }, faltan + 50)
    }
    programar()
    return () => window.clearTimeout(id)
  }, [])
  return ahora
}

export const Inicio = ({
  datos,
  alIrA,
  alAbrirAcceso,
  alNuevoAcceso,
  alNuevoRetomar,
  alAlternarTarea,
}: Props) => {
  const ahora = useReloj()
  const [consulta, setConsulta] = useState('')
  const buscador = useRef<HTMLInputElement>(null)
  const buscando = consulta.trim().length > 0

  useEffect(() => {
    const alPulsar = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return
      const a = document.activeElement
      if (
        a instanceof HTMLInputElement ||
        a instanceof HTMLTextAreaElement ||
        a instanceof HTMLSelectElement ||
        document.querySelector('[role="dialog"]')
      )
        return
      e.preventDefault()
      buscador.current?.focus()
    }
    window.addEventListener('keydown', alPulsar)
    return () => window.removeEventListener('keydown', alPulsar)
  }, [])

  const favoritos = useMemo(
    () => datos.accesos.filter((a) => a.favorito).slice(0, MAX_FAVORITOS),
    [datos.accesos],
  )
  const pendientes = datos.tareas.filter((t) => !t.hecha)
  const prioridades = pendientes.filter((t) => t.prioridad)
  const retomar = datos.retomar.filter((r) => !r.terminado).slice(0, 3)
  const nombre = datos.perfil.nombre.trim()
  const saludo = T.saludo[saludoDeLaHora(ahora.getHours())]

  const hayAlgo = retomar.length > 0 || pendientes.length > 0 || datos.notas.length > 0

  return (
    <main className="inicio sobre-fondo" id="contenido" tabIndex={-1}>
      <div className="reloj">
        <span className="reloj__hora">{horaCorta(ahora)}</span>
        <span className="reloj__fecha">{fechaLarga(ahora)}</span>
        <h1>{nombre ? `${saludo}, ${nombre}` : saludo}</h1>
      </div>

      {/* Los accesos van primero: abrir una web habitual es la
          primera acción del producto, y ponerlos encima del buscador
          es lo que evita que esto parezca una página de buscador. */}
      <div className="favoritos">
        {favoritos.map((a) => (
          <a
            key={a.id}
            className="favorito"
            href={a.url}
            target="_blank"
            rel="noreferrer noopener"
            onClick={() => alAbrirAcceso(a.id)}
          >
            <span className="favorito__ficha">
              <FichaSitio nombre={a.nombre} url={a.url} />
            </span>
            <span className="favorito__nombre">{a.nombre}</span>
          </a>
        ))}
        <button
          type="button"
          className="favorito favorito--anadir"
          onClick={alNuevoAcceso}
          title={T.inicio.anadirAccesoLargo}
          aria-label={T.inicio.anadirAccesoLargo}
        >
          <span className="favorito__ficha">
            <Icono nombre="mas" tamano={22} grosor={1.9} />
          </span>
          <span className="favorito__nombre">
            {favoritos.length === 0 ? T.inicio.primerAcceso : T.inicio.anadirAcceso}
          </span>
        </button>
      </div>

      <div className="buscador">
        <label className="oculto-visual" htmlFor="buscador">
          {T.buscar.etiqueta}
        </label>
        <div className="buscador__caja">
          <Icono nombre="buscar" tamano={20} />
          <span className="buscador__insignia" aria-hidden="true">
            {T.buscar.insignia}
          </span>
          <input
            id="buscador"
            ref={buscador}
            type="search"
            value={consulta}
            onChange={(e) => setConsulta(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && setConsulta('')}
            placeholder={T.buscar.marcador}
            autoComplete="off"
          />
          {buscando && (
            <BotonIcono
              icono="cruz"
              etiqueta={T.buscar.limpiar}
              className="icono-boton--mini"
              onClick={() => {
                setConsulta('')
                buscador.current?.focus()
              }}
            />
          )}
        </div>
      </div>

      {buscando ? (
        <Resultados
          datos={datos}
          consulta={consulta}
          alAbrirAcceso={alAbrirAcceso}
          alAlternarTarea={alAlternarTarea}
          alIrA={alIrA}
        />
      ) : (
        <>
          {hayAlgo ? (
            <div className="contexto">
              <section className="tarjeta">
                <h2 className="tarjeta__titulo">
                  <Icono nombre="reloj" tamano={16} />
                  {T.inicio.retomar}
                  {datos.retomar.length > 0 && (
                    <button type="button" className="boton boton--discreto boton--compacto" onClick={() => alIrA('colecciones')}>
                      {T.inicio.verTodo}
                    </button>
                  )}
                </h2>
                {retomar.length > 0 ? (
                  <div className="tarjeta__lista">
                    {retomar.map((r) => (
                      <a
                        key={r.id}
                        className="tarjeta__fila"
                        href={r.url}
                        target="_blank"
                        rel="noreferrer noopener"
                      >
                        <strong>{r.titulo}</strong>
                        <span className="tarjeta__dato">{dominio(r.url)}</span>
                      </a>
                    ))}
                  </div>
                ) : (
                  <button type="button" className="boton boton--secundario boton--compacto" onClick={alNuevoRetomar}>
                    <Icono nombre="mas" />
                    {T.inicio.guardarAlgo}
                  </button>
                )}
              </section>

              <section className="tarjeta">
                <h2 className="tarjeta__titulo">
                  <Icono nombre="check" tamano={16} />
                  {T.inicio.tareas}
                </h2>
                {pendientes.length > 0 ? (
                  <>
                    <div className="tarjeta__lista">
                      {(prioridades.length > 0 ? prioridades : pendientes).slice(0, 3).map((t) => (
                        <label key={t.id} className="tarjeta__fila" style={{ cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            className="oculto-visual"
                            checked={t.hecha}
                            onChange={() => alAlternarTarea(t)}
                          />
                          <span className="casilla" aria-hidden="true" style={{ width: 18, height: 18, borderRadius: 6 }} />
                          <strong>{t.texto}</strong>
                        </label>
                      ))}
                    </div>
                    <button type="button" className="boton boton--discreto boton--compacto" onClick={() => alIrA('tareas')}>
                      {T.inicio.pendientes(pendientes.length)}
                    </button>
                  </>
                ) : (
                  <button type="button" className="boton boton--secundario boton--compacto" onClick={() => alIrA('tareas')}>
                    <Icono nombre="mas" />
                    {T.tareas.anadir}
                  </button>
                )}
              </section>

              <section className="tarjeta">
                <h2 className="tarjeta__titulo">
                  <Icono nombre="documento" tamano={16} />
                  {T.inicio.nota}
                </h2>
                {datos.notas.length > 0 ? (
                  <div className="tarjeta__lista">
                    {datos.notas.slice(0, 3).map((n) => (
                      <button key={n.id} type="button" className="tarjeta__fila" onClick={() => alIrA('notas')}>
                        <strong>{n.titulo.trim() || n.texto.split('\n')[0] || T.notas.sinTitulo}</strong>
                      </button>
                    ))}
                  </div>
                ) : (
                  <button type="button" className="boton boton--secundario boton--compacto" onClick={() => alIrA('notas')}>
                    <Icono nombre="mas" />
                    {T.inicio.apuntar}
                  </button>
                )}
              </section>
            </div>
          ) : (
            <div className="contexto contexto--unico">
              <section className="tarjeta">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--e2)', justifyContent: 'center' }}>
                  <button type="button" className="boton boton--secundario boton--compacto" onClick={alNuevoRetomar}>
                    <Icono nombre="mas" />
                    {T.inicio.guardarAlgo}
                  </button>
                  <button type="button" className="boton boton--secundario boton--compacto" onClick={() => alIrA('tareas')}>
                    <Icono nombre="mas" />
                    {T.tareas.anadir}
                  </button>
                  <button type="button" className="boton boton--secundario boton--compacto" onClick={() => alIrA('notas')}>
                    <Icono nombre="mas" />
                    {T.inicio.apuntar}
                  </button>
                </div>
              </section>
            </div>
          )}
        </>
      )}
    </main>
  )
}

/** Usado por Resultados para no repetir la normalización. */
export const coincide = (q: string, ...campos: string[]) =>
  campos.some((c) => sinAcentos(c).includes(q))
