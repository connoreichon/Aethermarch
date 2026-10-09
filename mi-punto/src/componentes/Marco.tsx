import type { ReactNode } from 'react'
import { T } from '../config/textos'
import { Icono } from './Iconos'

export type Vista = 'inicio' | 'colecciones' | 'notas' | 'tareas' | 'herramientas' | 'ajustes' | 'ayuda'

/** Los cuatro destinos de la barra inferior en movil. */
export const DESTINOS: Array<{ clave: Vista; etiqueta: string; icono: string }> = [
  { clave: 'inicio', etiqueta: T.nav.inicio, icono: 'casa' },
  { clave: 'colecciones', etiqueta: T.nav.colecciones, icono: 'carpeta' },
  { clave: 'notas', etiqueta: T.nav.notas, icono: 'documento' },
  { clave: 'tareas', etiqueta: T.nav.tareas, icono: 'check' },
]

/** En escritorio cabe tambien Herramientas; en movil llega por el
    boton de la cabecera, que esta en todos los tamanos. */
const NAV_ESCRITORIO: Vista[] = ['colecciones', 'notas', 'tareas', 'herramientas']

interface PropsCabecera {
  vista: Vista
  alIrA: (v: Vista) => void
}

export const Cabecera = ({ vista, alIrA }: PropsCabecera) => (
  <header className="cabecera sobre-fondo">
    <button type="button" className="marca" onClick={() => alIrA('inicio')}>
      <span className="marca__punto" aria-hidden="true" />
      {T.marca}
      <span className="oculto-visual">— {T.nav.volverAlInicio}</span>
    </button>

    <nav className="nav" aria-label={T.nav.inicio}>
      {NAV_ESCRITORIO.map((clave) => (
        <button
          key={clave}
          type="button"
          className="nav__enlace"
          aria-current={vista === clave ? 'page' : undefined}
          onClick={() => alIrA(clave)}
        >
          {T.nav[clave]}
        </button>
      ))}
    </nav>

    <div className="cabecera__fin">
      <button
        type="button"
        className="icono-claro solo-movil"
        title={T.nav.herramientas}
        aria-label={T.nav.herramientas}
        aria-current={vista === 'herramientas' ? 'page' : undefined}
        onClick={() => alIrA('herramientas')}
      >
        <Icono nombre="calculadora" tamano={19} />
      </button>
      <button
        type="button"
        className="icono-claro"
        title={T.nav.ayuda}
        aria-label={T.nav.ayuda}
        aria-current={vista === 'ayuda' ? 'page' : undefined}
        onClick={() => alIrA('ayuda')}
      >
        <Icono nombre="ayuda" tamano={19} />
      </button>
      <button
        type="button"
        className="icono-claro"
        title={T.nav.ajustes}
        aria-label={T.nav.ajustes}
        aria-current={vista === 'ajustes' ? 'page' : undefined}
        onClick={() => alIrA('ajustes')}
      >
        <Icono nombre="ajustes" tamano={19} />
      </button>
    </div>
  </header>
)

export const BarraMovil = ({ vista, alIrA }: PropsCabecera) => (
  <nav className="barra-movil" aria-label={T.nav.inicio}>
    {DESTINOS.map((d) => (
      <button
        key={d.clave}
        type="button"
        className="barra-movil__boton"
        aria-current={vista === d.clave ? 'page' : undefined}
        onClick={() => alIrA(d.clave)}
      >
        <Icono nombre={d.icono} tamano={20} />
        <span>{d.etiqueta}</span>
      </button>
    ))}
  </nav>
)

interface PropsVista {
  titulo: string
  descripcion?: string
  acciones?: ReactNode
  children: ReactNode
}

export const Vista = ({ titulo, descripcion, acciones, children }: PropsVista) => (
  <main className="vista" id="contenido" tabIndex={-1}>
    <div className="vista__cabeza sobre-fondo">
      <h1>{titulo}</h1>
      {descripcion && <p>{descripcion}</p>}
      {acciones}
    </div>
    {children}
  </main>
)

interface PropsPanel {
  titulo?: string
  nota?: ReactNode
  acciones?: ReactNode
  children: ReactNode
  id?: string
}

export const Panel = ({ titulo, nota, acciones, children, id }: PropsPanel) => (
  <section className="panel" aria-labelledby={id}>
    {titulo && (
      <header className="panel__cabeza">
        <h2 id={id}>{titulo}</h2>
        {nota && <p className="suave">{nota}</p>}
        {acciones && <div className="panel__acciones">{acciones}</div>}
      </header>
    )}
    {children}
  </section>
)
