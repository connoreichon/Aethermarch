import { borrarDisco, leer, escribir } from '../almacen'
import type { Datos } from '../tipos'
import type { AlmacenDatos } from './puerto'

/** Almacén de este dispositivo. Única implementación por ahora. */
export const almacenLocal: AlmacenDatos = {
  id: 'local',
  esLocal: true,
  cargarYa: () => leer(),
  cargar: async () => leer(),
  guardar: async (datos: Datos) => escribir(datos),
  limpiar: async () => borrarDisco(),
}
