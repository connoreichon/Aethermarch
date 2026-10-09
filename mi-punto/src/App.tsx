import { useCallback, useEffect, useState } from 'react'
import { Aviso, useAviso } from './componentes/Aviso'
import { Icono } from './componentes/Iconos'
import { BarraMovil, Cabecera } from './componentes/Marco'
import type { Vista } from './componentes/Marco'
import { FONDOS } from './config/ajustes'
import { T } from './config/textos'
import type { Acceso, Tarea } from './datos/tipos'
import { useDatos } from './hooks/useDatos'
import { Ajustes } from './secciones/Ajustes'
import { Ayuda } from './secciones/Ayuda'
import { Bienvenida } from './secciones/Bienvenida'
import { Colecciones } from './secciones/Colecciones'
import { Herramientas } from './secciones/Herramientas'
import { Inicio } from './secciones/Inicio'
import { Notas } from './secciones/Notas'
import { Tareas } from './secciones/Tareas'

export const App = () => {
  const {
    datos,
    modoEjemplo,
    discoOk,
    aplicar,
    entrarEjemplo,
    salirEjemplo,
    reemplazar,
    restablecer,
  } = useDatos()
  const { mensaje, avisar, cerrar } = useAviso()

  const [vista, setVista] = useState<Vista>('inicio')
  const [pedir, setPedir] = useState<'acceso' | 'retomar' | null>(null)

  const prefs = datos.preferencias

  /* El fondo y el nivel de efectos viven en el <html>: así el CSS los
     ve sin que ningún componente tenga que saber de ellos. */
  useEffect(() => {
    const raiz = document.documentElement
    raiz.dataset.fondo = prefs.fondo
    raiz.dataset.efectos = prefs.efectos
  }, [prefs.fondo, prefs.efectos])

  const irA = useCallback((v: Vista) => {
    setVista(v)
    window.scrollTo({ top: 0 })
  }, [])

  const abrirAcceso = useCallback(
    (id: string) =>
      aplicar((d) => ({
        ...d,
        accesos: d.accesos.map((a) =>
          a.id === id ? { ...a, usos: a.usos + 1, ultimoUso: Date.now() } : a,
        ),
      })),
    [aplicar],
  )

  const alternarTarea = useCallback(
    (t: Tarea) =>
      aplicar((d) => ({
        ...d,
        tareas: d.tareas.map((x) =>
          x.id === t.id ? { ...x, hecha: !x.hecha, completada: x.hecha ? null : Date.now() } : x,
        ),
      })),
    [aplicar],
  )

  const pedirEnColecciones = (que: 'acceso' | 'retomar') => {
    setPedir(que)
    irA('colecciones')
  }

  const terminarBienvenida = (
    elegidos: Array<Pick<Acceso, 'id' | 'nombre' | 'url' | 'favorito'>>,
    nombre: string,
  ) =>
    aplicar((d) => ({
      ...d,
      perfil: { nombre },
      preferencias: { ...d.preferencias, presentado: true },
      accesos: [
        ...d.accesos,
        ...elegidos.map((e) => ({ ...e, icono: '', grupoId: d.grupos[0].id, usos: 0, ultimoUso: null })),
      ],
    }))

  const fondoEnUso = prefs.fondo === 'liso' ? null : FONDOS[prefs.fondo]

  return (
    <div className="marco">
      {/* El fondo va en su propia capa: si la imagen falla queda el
          degradado liso y la interfaz sigue funcionando igual. */}
      <div
        className="ambiente"
        aria-hidden="true"
        style={
          fondoEnUso && prefs.efectos === 'normales'
            ? ({
                '--img-escritorio': `url(${fondoEnUso.escritorio})`,
                '--img-movil': `url(${fondoEnUso.movil})`,
              } as React.CSSProperties)
            : undefined
        }
        data-con-imagen={fondoEnUso && prefs.efectos === 'normales' ? 'si' : undefined}
      />

      <a className="saltar" href="#contenido">
        {T.nav.irAlContenido}
      </a>

      {!prefs.presentado && !modoEjemplo ? (
        <Bienvenida
          alTerminar={terminarBienvenida}
          alSaltar={() => aplicar((d) => ({ ...d, preferencias: { ...d.preferencias, presentado: true } }))}
        />
      ) : (
        <>
          <Cabecera vista={vista} alIrA={irA} />

          {!discoOk && (
            <div style={{ padding: '0 var(--margen)' }}>
              <p className="alerta alerta--mal" role="alert">
                <Icono nombre="aviso" />
                {T.disco.falloGuardado}
              </p>
            </div>
          )}

          {vista === 'inicio' && (
            <Inicio
              datos={datos}
              alIrA={irA}
              alAbrirAcceso={abrirAcceso}
              alNuevoAcceso={() => pedirEnColecciones('acceso')}
              alNuevoRetomar={() => pedirEnColecciones('retomar')}
              alAlternarTarea={alternarTarea}
            />
          )}
          {vista === 'colecciones' && (
            <Colecciones
              datos={datos}
              aplicar={aplicar}
              avisar={avisar}
              pedir={pedir}
              alAtender={() => setPedir(null)}
            />
          )}
          {vista === 'notas' && (
            <Notas datos={datos} aplicar={aplicar} avisar={avisar} discoOk={discoOk} />
          )}
          {vista === 'tareas' && <Tareas datos={datos} aplicar={aplicar} avisar={avisar} />}
          {vista === 'herramientas' && <Herramientas />}
          {vista === 'ajustes' && (
            <Ajustes
              datos={datos}
              modoEjemplo={modoEjemplo}
              aplicar={aplicar}
              reemplazar={reemplazar}
              restablecer={restablecer}
              entrarEjemplo={entrarEjemplo}
              salirEjemplo={salirEjemplo}
              avisar={avisar}
            />
          )}
          {vista === 'ayuda' && <Ayuda />}

          <BarraMovil vista={vista} alIrA={irA} />

          {modoEjemplo && (
            <button type="button" className="pastilla-ejemplo" onClick={salirEjemplo}>
              <Icono nombre="info" tamano={16} />
              <span className="pastilla-ejemplo__texto">{T.ajustes.enEjemplo}</span>
              <strong>{T.ajustes.salirEjemplo}</strong>
            </button>
          )}
        </>
      )}

      <Aviso mensaje={mensaje} alCerrar={cerrar} />
    </div>
  )
}
