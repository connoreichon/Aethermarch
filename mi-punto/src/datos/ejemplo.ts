import { VERSION_DATOS } from '../config/ajustes'
import { PROPIETARIO_INVITADO } from './tipos'
import type { Datos } from './tipos'

/** Escritorio de muestra para «Ver un ejemplo». Va aparte de los
 *  datos reales, se avisa en pantalla y no toca nada de lo tuyo. */
const ahora = Date.now()
const hace = (horas: number) => ahora - horas * 3600_000

export const datosEjemplo = (): Datos => {
  const g = { dia: 'eg-dia', trabajo: 'eg-trabajo', papeleo: 'eg-papeleo', ocio: 'eg-ocio' }
  return {
    version: VERSION_DATOS,
    propietario: PROPIETARIO_INVITADO,
    actualizado: ahora,
    perfil: { nombre: 'Marta' },
    preferencias: { fondo: 'costa', efectos: 'normales', presentado: true },
    grupos: [
      { id: g.dia, nombre: 'Cada día', color: 'mar' },
      { id: g.trabajo, nombre: 'Trabajo', color: 'mandarina' },
      { id: g.papeleo, nombre: 'Papeleo', color: 'piedra' },
      { id: g.ocio, nombre: 'Ratos libres', color: 'verde' },
    ],
    accesos: [
      { id: 'a1', nombre: 'Gmail', url: 'https://mail.google.com/', icono: '', acciones: [], grupoId: g.dia, favorito: true, usos: 142, ultimoUso: hace(1) },
      { id: 'a2', nombre: 'Calendario', url: 'https://calendar.google.com/', icono: '', acciones: [], grupoId: g.dia, favorito: true, usos: 96, ultimoUso: hace(2) },
      { id: 'a3', nombre: 'Drive', url: 'https://drive.google.com/', icono: '', acciones: [], grupoId: g.trabajo, favorito: true, usos: 88, ultimoUso: hace(3) },
      { id: 'a4', nombre: 'El País', url: 'https://elpais.com/', icono: '', acciones: [], grupoId: g.dia, favorito: true, usos: 61, ultimoUso: hace(5) },
      { id: 'a5', nombre: 'YouTube', url: 'https://www.youtube.com/', icono: '', acciones: [], grupoId: g.ocio, favorito: true, usos: 54, ultimoUso: hace(9) },
      { id: 'a6', nombre: 'Spotify', url: 'https://open.spotify.com/', icono: '', acciones: [], grupoId: g.ocio, favorito: true, usos: 45, ultimoUso: hace(14) },
      { id: 'a7', nombre: 'Wikipedia', url: 'https://es.wikipedia.org/', icono: '', acciones: [], grupoId: g.dia, favorito: true, usos: 40, ultimoUso: hace(26) },
      { id: 'a8', nombre: 'Notion', url: 'https://www.notion.so/', icono: '', acciones: [], grupoId: g.trabajo, favorito: true, usos: 34, ultimoUso: hace(30) },
      { id: 'a12', nombre: 'WhatsApp', url: 'https://web.whatsapp.com/', icono: '', acciones: [], grupoId: g.dia, favorito: false, usos: 70, ultimoUso: hace(2) },
      { id: 'a13', nombre: 'Maps', url: 'https://maps.google.com/', icono: '', acciones: [], grupoId: g.dia, favorito: false, usos: 22, ultimoUso: hace(40) },
      { id: 'a9', nombre: 'Agencia Tributaria', url: 'https://sede.agenciatributaria.gob.es/', icono: '', acciones: [], grupoId: g.papeleo, favorito: false, usos: 12, ultimoUso: hace(200) },
      { id: 'a10', nombre: 'Seguridad Social', url: 'https://www.seg-social.es/', icono: '', acciones: [], grupoId: g.papeleo, favorito: false, usos: 7, ultimoUso: hace(410) },
      { id: 'a11', nombre: 'DGT', url: 'https://sede.dgt.gob.es/', icono: '', acciones: [], grupoId: g.papeleo, favorito: false, usos: 3, ultimoUso: hace(900) },
    ],
    retomar: [
      {
        id: 'r1',
        titulo: 'Presupuesto del taller: comparativa',
        url: 'https://docs.google.com/spreadsheets/',
        nota: 'Faltan los precios del tercer proveedor. Mirar la columna F.',
        creado: hace(20),
        terminado: false,
      },
      {
        id: 'r2',
        titulo: 'Curso de hoja de cálculo, lección 4',
        url: 'https://www.coursera.org/',
        nota: 'Lo dejé en el minuto 12, cuando explica las tablas dinámicas.',
        creado: hace(50),
        terminado: false,
      },
      {
        id: 'r3',
        titulo: 'Artículo sobre contratos de alquiler',
        url: 'https://www.boe.es/',
        nota: '',
        creado: hace(74),
        terminado: false,
      },
      {
        id: 'r4',
        titulo: 'Comparar tarifas de luz',
        url: 'https://tarifaluzhora.es/',
        nota: 'Ya elegida la de discriminación horaria.',
        creado: hace(300),
        terminado: true,
      },
    ],
    notas: [
      {
        id: 'n1',
        titulo: 'Códigos y recordatorios',
        texto: 'Parking: 4417\nPortal: 2471\n\nRecoger el paquete antes del viernes.',
        creada: hace(120),
        actualizada: hace(6),
      },
      {
        id: 'n2',
        titulo: 'Ideas para el sábado',
        texto: '- Mercado de la plaza por la mañana\n- La peli que recomendó Nuria\n- Llamar a mis padres',
        creada: hace(60),
        actualizada: hace(40),
      },
    ],
    tareas: [
      { id: 't1', texto: 'Llamar al taller antes de las 13:00', hecha: false, prioridad: true, creada: hace(4), completada: null },
      { id: 't2', texto: 'Enviar la factura de septiembre', hecha: false, prioridad: true, creada: hace(6), completada: null },
      { id: 't3', texto: 'Reservar la sala para el jueves', hecha: false, prioridad: false, creada: hace(8), completada: null },
      { id: 't4', texto: 'Pedir cita para la revisión', hecha: false, prioridad: false, creada: hace(30), completada: null },
      { id: 't5', texto: 'Comprar el regalo de Clara', hecha: true, prioridad: false, creada: hace(48), completada: hace(5) },
    ],
  }
}
