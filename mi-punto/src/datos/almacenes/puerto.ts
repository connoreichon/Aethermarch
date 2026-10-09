import type { Datos } from '../tipos'

/**
 * Puerto de almacenamiento.
 *
 * La interfaz no sabe dónde viven los datos. Hoy hay una sola
 * implementación (localStorage); mañana puede haber otra contra una
 * cuenta en la nube sin tocar ni un componente: basta con pasarle
 * otro almacén a `useDatos`.
 *
 * Todo es asíncrono porque un almacén remoto lo será. El almacén
 * local implementa además `cargarYa()`, que permite pintar la
 * primera pantalla sin un parpadeo en blanco; un almacén remoto
 * simplemente no lo tendrá y la interfaz mostrará su estado de
 * carga.
 */
export interface AlmacenDatos {
  /** Identificador corto para depurar y para los avisos. */
  readonly id: string
  /** Si el almacén es de este dispositivo y no sale de aquí. */
  readonly esLocal: boolean
  /** Lectura síncrona opcional, solo si el medio la permite. */
  cargarYa?(): Datos | null
  cargar(): Promise<Datos | null>
  /** Devuelve si de verdad se ha escrito. La interfaz no dice
   *  "Guardado" cuando esto es false. */
  guardar(datos: Datos): Promise<boolean>
  limpiar(): Promise<boolean>
}
