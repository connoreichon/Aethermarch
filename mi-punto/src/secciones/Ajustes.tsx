import { useRef, useState } from 'react'
import { Boton } from '../componentes/Boton'
import { Campo } from '../componentes/Campo'
import { Icono } from '../componentes/Iconos'
import { Panel, Vista } from '../componentes/Marco'
import { FONDOS } from '../config/ajustes'
import { T } from '../config/textos'
import { exportar, revisarArchivo } from '../datos/traspaso'
import type { ClaveFondo, Datos, NivelEfectos } from '../datos/tipos'

interface Props {
  datos: Datos
  modoEjemplo: boolean
  aplicar: (c: (d: Datos) => Datos) => void
  reemplazar: (d: Datos) => void
  restablecer: () => void
  entrarEjemplo: () => void
  salirEjemplo: () => void
  avisar: (texto: string) => void
}

export const Ajustes = ({
  datos,
  modoEjemplo,
  aplicar,
  reemplazar,
  restablecer,
  entrarEjemplo,
  salirEjemplo,
  avisar,
}: Props) => {
  const [confirmar, setConfirmar] = useState(false)
  const [pendiente, setPendiente] = useState<{ datos: Datos; descartados: number } | null>(null)
  const [errorArchivo, setErrorArchivo] = useState<string>()
  const archivo = useRef<HTMLInputElement>(null)

  const prefs = datos.preferencias

  const elegirArchivo = async (f: File | undefined) => {
    setErrorArchivo(undefined)
    setPendiente(null)
    if (!f) return
    const r = await revisarArchivo(f)
    if (!r.ok) {
      setErrorArchivo(r.error)
      return
    }
    setPendiente({ datos: r.datos, descartados: r.descartados })
  }

  const fondos: Array<{ clave: ClaveFondo; nombre: string; muestra?: string }> = [
    { clave: 'costa', nombre: FONDOS.costa.nombre, muestra: FONDOS.costa.escritorio },
    { clave: 'alba', nombre: FONDOS.alba.nombre, muestra: FONDOS.alba.escritorio },
    { clave: 'liso', nombre: T.ajustes.fondoLiso },
  ]

  return (
    <Vista titulo={T.ajustes.titulo} descripcion={T.ajustes.subtitulo}>
      {modoEjemplo && (
        <p className="alerta alerta--info" style={{ marginBottom: 'var(--e4)' }}>
          <Icono nombre="info" />
          <span style={{ flex: 1 }}>{T.ajustes.enEjemplo}</span>
          <Boton tono="secundario" compacto icono="volver" onClick={salirEjemplo}>
            {T.ajustes.salirEjemplo}
          </Boton>
        </p>
      )}

      <Panel titulo={T.ajustes.tuNombre} id="t-nombre">
        <div style={{ maxWidth: 360 }}>
          <Campo
            etiqueta={T.ajustes.tuNombre}
            etiquetaOculta
            ayuda={T.ajustes.tuNombreAyuda}
            value={datos.perfil.nombre}
            maxLength={40}
            autoComplete="off"
            onChange={(e) => aplicar((d) => ({ ...d, perfil: { ...d.perfil, nombre: e.target.value } }))}
          />
        </div>
      </Panel>

      <Panel titulo={T.ajustes.fondo} nota={T.ajustes.fondoAyuda} id="t-fondo">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--e3)' }}>
          {fondos.map((f) => {
            const activo = prefs.fondo === f.clave
            return (
              <button
                key={f.clave}
                type="button"
                aria-pressed={activo}
                onClick={() => aplicar((d) => ({ ...d, preferencias: { ...d.preferencias, fondo: f.clave } }))}
                style={{
                  display: 'grid',
                  gap: 8,
                  padding: 8,
                  border: `2px solid ${activo ? 'var(--accion)' : 'var(--sep)'}`,
                  borderRadius: 14,
                  background: 'var(--sup-alta)',
                  textAlign: 'left',
                }}
              >
                <span
                  style={{
                    display: 'block',
                    height: 74,
                    borderRadius: 9,
                    background: f.muestra ? `center/cover url(${f.muestra})` : 'var(--fondo-liso)',
                  }}
                  aria-hidden="true"
                />
                <span style={{ fontSize: 'var(--t-menor)', fontWeight: 700 }}>
                  {f.nombre}
                  {activo && ' ✓'}
                </span>
              </button>
            )
          })}
        </div>
      </Panel>

      <Panel titulo={T.ajustes.efectos} nota={T.ajustes.efectosAyuda} id="t-efectos">
        <div style={{ display: 'flex', gap: 'var(--e2)', flexWrap: 'wrap' }}>
          {(
            [
              ['normales', T.ajustes.efectosNormales],
              ['pocos', T.ajustes.efectosPocos],
            ] as Array<[NivelEfectos, string]>
          ).map(([clave, etiqueta]) => (
            <Boton
              key={clave}
              tono={prefs.efectos === clave ? 'principal' : 'secundario'}
              aria-pressed={prefs.efectos === clave}
              onClick={() => aplicar((d) => ({ ...d, preferencias: { ...d.preferencias, efectos: clave } }))}
            >
              {etiqueta}
            </Boton>
          ))}
        </div>
      </Panel>

      <Panel titulo={T.ajustes.datos} nota={T.disco.aviso} id="t-datos">
        <div style={{ display: 'flex', gap: 'var(--e2)', flexWrap: 'wrap' }}>
          <Boton
            tono="secundario"
            icono="descargar"
            onClick={() => {
              const r = exportar(datos)
              avisar(r.ok ? T.traspaso.exportado : T.traspaso.errorExportar)
            }}
          >
            {T.ajustes.exportar}
          </Boton>
          <Boton tono="secundario" icono="subir" onClick={() => archivo.current?.click()}>
            {T.ajustes.importar}
          </Boton>
          <input
            ref={archivo}
            type="file"
            accept="application/json,.json"
            className="oculto-visual"
            onChange={(e) => {
              void elegirArchivo(e.target.files?.[0])
              e.target.value = ''
            }}
          />
        </div>

        {errorArchivo && (
          <p className="alerta alerta--mal" style={{ marginTop: 'var(--e3)' }} role="alert">
            <Icono nombre="aviso" />
            {errorArchivo}
          </p>
        )}

        {pendiente && (
          <div className="alerta alerta--info" style={{ marginTop: 'var(--e3)', display: 'grid', gap: 'var(--e2)' }}>
            <strong>{T.traspaso.tituloImportar}</strong>
            <span>
              {T.traspaso.resumen(
                pendiente.datos.accesos.length,
                pendiente.datos.retomar.length,
                pendiente.datos.notas.length,
                pendiente.datos.tareas.length,
              )}
              {pendiente.descartados > 0 && ` ${T.traspaso.descartados(pendiente.descartados)}`}
            </span>
            <span style={{ fontWeight: 700 }}>{T.traspaso.avisoSustituye}</span>
            <span style={{ display: 'flex', gap: 'var(--e2)', flexWrap: 'wrap' }}>
              <Boton
                onClick={() => {
                  reemplazar(pendiente.datos)
                  setPendiente(null)
                  avisar(T.traspaso.hecho)
                }}
              >
                {T.traspaso.confirmar}
              </Boton>
              <Boton tono="secundario" onClick={() => setPendiente(null)}>
                {T.comun.cancelar}
              </Boton>
            </span>
          </div>
        )}
      </Panel>

      <Panel titulo={T.ajustes.verEjemplo} nota={T.ajustes.verEjemploAyuda} id="t-ejemplo">
        <Boton tono="secundario" onClick={modoEjemplo ? salirEjemplo : entrarEjemplo}>
          {modoEjemplo ? T.ajustes.salirEjemplo : T.ajustes.verEjemplo}
        </Boton>
      </Panel>

      <Panel titulo={T.ajustes.restablecer} id="t-restablecer">
        {confirmar ? (
          <div className="alerta alerta--mal" style={{ display: 'grid', gap: 'var(--e2)' }}>
            <span>{T.ajustes.restablecerAviso}</span>
            <span style={{ display: 'flex', gap: 'var(--e2)', flexWrap: 'wrap' }}>
              <Boton
                tono="secundario"
                peligro
                icono="papelera"
                onClick={() => {
                  restablecer()
                  setConfirmar(false)
                }}
              >
                {T.ajustes.restablecerConfirmar}
              </Boton>
              <Boton tono="secundario" onClick={() => setConfirmar(false)}>
                {T.comun.cancelar}
              </Boton>
            </span>
          </div>
        ) : (
          <Boton tono="discreto" peligro icono="papelera" onClick={() => setConfirmar(true)}>
            {T.ajustes.restablecer}
          </Boton>
        )}
      </Panel>
    </Vista>
  )
}
