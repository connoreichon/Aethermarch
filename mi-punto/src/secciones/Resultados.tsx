import { useMemo } from 'react'
import { Casilla } from '../componentes/Casilla'
import { FichaSitio } from '../componentes/FichaSitio'
import type { Vista } from '../componentes/Marco'
import { T } from '../config/textos'
import type { Datos, Tarea } from '../datos/tipos'
import { dominio, sinAcentos } from '../datos/util'

interface Props {
  datos: Datos
  consulta: string
  alAbrirAcceso: (id: string) => void
  alAlternarTarea: (t: Tarea) => void
  alIrA: (v: Vista) => void
}

export const Resultados = ({ datos, consulta, alAbrirAcceso, alAlternarTarea, alIrA }: Props) => {
  const q = sinAcentos(consulta.trim())

  const hallazgos = useMemo(() => {
    const cab = (...campos: string[]) => campos.some((c) => sinAcentos(c).includes(q))
    return {
      accesos: datos.accesos.filter((a) => cab(a.nombre, a.url)),
      retomar: datos.retomar.filter((r) => cab(r.titulo, r.url, r.nota)),
      tareas: datos.tareas.filter((t) => cab(t.texto)),
      notas: datos.notas.filter((n) => cab(n.titulo, n.texto)),
    }
  }, [datos, q])

  const total =
    hallazgos.accesos.length + hallazgos.retomar.length + hallazgos.tareas.length + hallazgos.notas.length

  if (total === 0) {
    return (
      <div className="contexto contexto--unico">
        <section className="tarjeta">
          <div className="vacio" style={{ padding: 'var(--e5) var(--e2)' }}>
            <h3>{T.buscar.sinResultados(consulta.trim())}</h3>
            <p>{T.buscar.noEsInternet}</p>
            <p>{T.buscar.pista}</p>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="contexto contexto--unico" style={{ maxWidth: 'var(--ancho-buscar)' }}>
      <section className="tarjeta" aria-live="polite">
        <h2 className="tarjeta__titulo">{T.buscar.titulo(total)}</h2>

        {hallazgos.accesos.length > 0 && (
          <div className="tarjeta__lista">
            <p className="tarjeta__vacio">{T.buscar.enAccesos}</p>
            {hallazgos.accesos.slice(0, 6).map((a) => (
              <a
                key={a.id}
                className="tarjeta__fila"
                href={a.url}
                target="_blank"
                rel="noreferrer noopener"
                onClick={() => alAbrirAcceso(a.id)}
              >
                <span style={{ display: 'grid', placeItems: 'center', width: 20, height: 20, flex: 'none' }}>
                  <FichaSitio nombre={a.nombre} url={a.url} tamano={18} />
                </span>
                <strong>{a.nombre}</strong>
                <span className="tarjeta__dato">{dominio(a.url)}</span>
              </a>
            ))}
          </div>
        )}

        {hallazgos.retomar.length > 0 && (
          <div className="tarjeta__lista">
            <p className="tarjeta__vacio">{T.buscar.enRetomar}</p>
            {hallazgos.retomar.slice(0, 5).map((r) => (
              <a key={r.id} className="tarjeta__fila" href={r.url} target="_blank" rel="noreferrer noopener">
                <strong>{r.titulo}</strong>
                <span className="tarjeta__dato">{dominio(r.url)}</span>
              </a>
            ))}
          </div>
        )}

        {hallazgos.tareas.length > 0 && (
          <div className="tarjeta__lista">
            <p className="tarjeta__vacio">{T.buscar.enTareas}</p>
            {hallazgos.tareas.slice(0, 5).map((t) => (
              <div key={t.id} className="tarjeta__fila" style={{ alignItems: 'center' }}>
                <Casilla
                  marcada={t.hecha}
                  etiqueta={`${t.hecha ? T.tareas.reabrir : T.tareas.completar}: ${t.texto}`}
                  alCambiar={() => alAlternarTarea(t)}
                />
                <strong style={{ textDecoration: t.hecha ? 'line-through' : undefined }}>{t.texto}</strong>
              </div>
            ))}
          </div>
        )}

        {hallazgos.notas.length > 0 && (
          <div className="tarjeta__lista">
            <p className="tarjeta__vacio">{T.buscar.enNotas}</p>
            {hallazgos.notas.slice(0, 5).map((n) => (
              <button key={n.id} type="button" className="tarjeta__fila" onClick={() => alIrA('notas')}>
                <strong>{n.titulo.trim() || n.texto.split('\n')[0] || T.notas.sinTitulo}</strong>
              </button>
            ))}
          </div>
        )}

        <p className="tarjeta__vacio">{T.buscar.soloAqui}</p>
      </section>
    </div>
  )
}
