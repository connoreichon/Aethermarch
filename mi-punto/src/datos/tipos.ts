export interface Grupo {
  id: string
  nombre: string
  color: string
}

export interface Acceso {
  id: string
  nombre: string
  url: string
  grupoId: string
  favorito: boolean
  usos: number
  ultimoUso: number | null
}

export interface Retomar {
  id: string
  titulo: string
  url: string
  nota: string
  creado: number
  terminado: boolean
}

export interface Nota {
  id: string
  titulo: string
  texto: string
  creada: number
  actualizada: number
}

export interface Tarea {
  id: string
  texto: string
  hecha: boolean
  prioridad: boolean
  creada: number
  completada: number | null
}

export type ClaveFondo = 'costa' | 'alba' | 'liso'
export type NivelEfectos = 'normales' | 'pocos'

export interface Preferencias {
  fondo: ClaveFondo
  efectos: NivelEfectos
  /** Falso hasta que la persona termina (o salta) la primera visita. */
  presentado: boolean
}

/** Dueño de los datos mientras no hay cuenta. Cuando exista inicio de
 *  sesión llevará el identificador del usuario, y sirve para no
 *  mezclar escritorios en un dispositivo compartido. */
export const PROPIETARIO_INVITADO = 'invitado'

export interface Datos {
  /** Versión del esquema. Cambiarla obliga a escribir la migración. */
  version: number
  propietario: string
  actualizado: number
  perfil: { nombre: string }
  preferencias: Preferencias
  grupos: Grupo[]
  accesos: Acceso[]
  retomar: Retomar[]
  notas: Nota[]
  tareas: Tarea[]
}

export type EstadoGuardado = 'quieto' | 'guardando' | 'guardado' | 'fallo'
