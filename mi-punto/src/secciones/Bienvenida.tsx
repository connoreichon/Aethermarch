import { useState } from 'react'
import { Boton } from '../componentes/Boton'
import { Campo } from '../componentes/Campo'
import { FichaSitio } from '../componentes/FichaSitio'
import { Icono } from '../componentes/Iconos'
import { SUGERENCIAS } from '../config/ajustes'
import { T } from '../config/textos'
import type { Acceso } from '../datos/tipos'
import { dominio, mismaUrl, normalizarUrl, nuevoId } from '../datos/util'

interface Props {
  alTerminar: (elegidos: Array<Pick<Acceso, 'id' | 'nombre' | 'url' | 'favorito'>>, nombre: string) => void
  alSaltar: () => void
}

/**
 * Primera visita. Son propuestas que la persona marca, no servicios
 * detectados ni cuentas conectadas: eso se dice en pantalla.
 */
export const Bienvenida = ({ alTerminar, alSaltar }: Props) => {
  const [marcados, setMarcados] = useState<string[]>([])
  const [propias, setPropias] = useState<Array<{ nombre: string; url: string }>>([])
  const [urlPropia, setUrlPropia] = useState('')
  const [error, setError] = useState<string>()
  const [nombre, setNombre] = useState('')

  const total = marcados.length + propias.length

  const alternar = (url: string) =>
    setMarcados((m) => (m.includes(url) ? m.filter((x) => x !== url) : [...m, url]))

  const anadirPropia = () => {
    const destino = normalizarUrl(urlPropia)
    if (!destino) {
      setError(T.accesos.errorUrl)
      return
    }
    if (propias.some((p) => mismaUrl(p.url, destino)) || marcados.some((m) => mismaUrl(m, destino))) {
      setError(T.accesos.duplicado)
      return
    }
    setPropias((p) => [...p, { nombre: dominio(destino), url: destino }])
    setUrlPropia('')
    setError(undefined)
  }

  const entrar = () => {
    const deSugerencias = SUGERENCIAS.filter((s) => marcados.includes(s.url)).map((s) => ({
      id: nuevoId(),
      nombre: s.nombre,
      url: s.url,
      favorito: true,
    }))
    const mias = propias.map((p) => ({ id: nuevoId(), nombre: p.nombre, url: p.url, favorito: true }))
    alTerminar([...deSugerencias, ...mias].slice(0, 8), nombre.trim())
  }

  return (
    <main className="inicio sobre-fondo" id="contenido" tabIndex={-1}>
      <div className="reloj">
        <h1 style={{ marginTop: 0 }}>{T.bienvenida.titulo}</h1>
        <p className="reloj__fecha" style={{ fontSize: 'var(--t-cuerpo)', maxWidth: '46ch', margin: '10px auto 0' }}>
          {T.bienvenida.texto}
        </p>
      </div>

      <div className="contexto contexto--unico" style={{ maxWidth: 640 }}>
        <section className="tarjeta" style={{ padding: 'var(--e6)', gap: 'var(--e4)' }}>
          <div className="favoritos favoritos--elegir">
            {SUGERENCIAS.map((s) => {
              const activo = marcados.includes(s.url)
              return (
                <button
                  key={s.url}
                  type="button"
                  className="favorito"
                  aria-pressed={activo}
                  onClick={() => alternar(s.url)}
                  style={{
                    background: activo ? 'var(--sup-hundida)' : undefined,
                    borderColor: activo ? 'var(--accion)' : undefined,
                  }}
                >
                  <span
                    className="favorito__ficha"
                    style={{ boxShadow: activo ? '0 0 0 2px var(--accion)' : undefined, background: 'var(--sup-hundida)' }}
                  >
                    <FichaSitio nombre={s.nombre} url={s.url} />
                  </span>
                  <span className="favorito__nombre" style={{ color: 'var(--txt)', textShadow: 'none' }}>
                    {s.nombre}
                  </span>
                </button>
              )
            })}
            {propias.map((p) => (
              <span key={p.url} className="favorito" style={{ background: 'var(--sup-hundida)' }}>
                <span className="favorito__ficha" style={{ background: 'var(--sup-alta)' }}>
                  <FichaSitio nombre={p.nombre} url={p.url} />
                </span>
                <span className="favorito__nombre" style={{ color: 'var(--txt)', textShadow: 'none' }}>
                  {p.nombre}
                </span>
              </span>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              anadirPropia()
            }}
            style={{ display: 'flex', gap: 'var(--e2)', alignItems: 'flex-end' }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <Campo
                etiqueta={T.bienvenida.tuyas}
                placeholder={T.bienvenida.marcadorUrl}
                value={urlPropia}
                onChange={(e) => setUrlPropia(e.target.value)}
                error={error}
                inputMode="url"
                autoComplete="off"
              />
            </div>
            <Boton tono="secundario" type="submit" disabled={!urlPropia.trim()}>
              {T.bienvenida.anadir}
            </Boton>
          </form>

          <Campo
            etiqueta={T.bienvenida.nombre}
            ayuda={T.bienvenida.nombreAyuda}
            placeholder={T.bienvenida.marcadorNombre}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            maxLength={40}
            autoComplete="off"
          />

          <p className="menor suave" style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
            <Icono nombre="info" tamano={16} />
            {T.bienvenida.aviso}
          </p>

          <div style={{ display: 'flex', gap: 'var(--e2)', alignItems: 'center', flexWrap: 'wrap' }}>
            <Boton onClick={entrar}>{T.bienvenida.entrar}</Boton>
            <Boton tono="discreto" onClick={alSaltar}>
              {T.bienvenida.saltar}
            </Boton>
            <span className="menor suave" style={{ marginLeft: 'auto' }}>
              {T.bienvenida.elegidos(total)}
            </span>
          </div>
        </section>
      </div>
    </main>
  )
}
