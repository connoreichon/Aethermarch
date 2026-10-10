/**
 * Catálogo de servicios y sus acciones.
 *
 * Esto es DATOS, no funciones. Añadir un servicio nuevo es añadir una
 * fila: no hay que escribir código, ni pedir permisos, ni registrar
 * ninguna aplicación. Por eso escala a «todo lo que usa la gente» en
 * vez de a tres integraciones.
 *
 * Cada acción es una plantilla de dirección. `{q}` es lo que la
 * persona escribe en la barra; si la plantilla no lleva `{q}`, la
 * acción se ejecuta tal cual (por ejemplo «documento nuevo»).
 *
 * Lo que esto NO es: no lee tu correo ni entra en tu cuenta. Te deja
 * el servicio abierto en el punto exacto, que es la diferencia entre
 * cuatro clics y uno.
 */

/** Qué clase de dato admite una acción. Sin esto la barra ofrece
 *  «Escribir un correo a factura», que no significa nada. */
export type TipoArgumento = 'texto' | 'correo' | 'telefono' | 'direccion' | 'ninguno'

export interface Accion {
  id: string
  etiqueta: string
  /** Dirección con `{q}` opcional donde va lo escrito. */
  plantilla: string
  /** Por defecto `texto`; `ninguno` si la acción no lleva argumento. */
  tipo?: TipoArgumento
  /** Texto de ejemplo para la barra. */
  pista?: string
}

export interface Servicio {
  id: string
  nombre: string
  /** Dominios que lo identifican al añadir un acceso. */
  dominios: string[]
  acciones: Accion[]
}

export const SERVICIOS: Servicio[] = [
  {
    id: 'gmail',
    nombre: 'Gmail',
    dominios: ['mail.google.com', 'gmail.com'],
    acciones: [
      { id: 'redactar', etiqueta: 'Escribir un correo a', plantilla: 'https://mail.google.com/mail/?view=cm&fs=1&to={q}', tipo: 'correo', pista: 'ana@ejemplo.com' },
      { id: 'buscar', etiqueta: 'Buscar en el correo', plantilla: 'https://mail.google.com/mail/u/0/#search/{q}', pista: 'factura' },
      { id: 'sinleer', etiqueta: 'Ver el correo sin leer', plantilla: 'https://mail.google.com/mail/u/0/#search/is:unread', tipo: 'ninguno' },
    ],
  },
  {
    id: 'outlook',
    nombre: 'Outlook',
    dominios: ['outlook.com', 'outlook.live.com', 'outlook.office.com'],
    acciones: [
      { id: 'redactar', etiqueta: 'Escribir un correo a', plantilla: 'https://outlook.live.com/mail/0/deeplink/compose?to={q}', tipo: 'correo', pista: 'ana@ejemplo.com' },
      { id: 'buscar', etiqueta: 'Buscar en el correo', plantilla: 'https://outlook.live.com/mail/0/search/id/{q}', pista: 'factura' },
    ],
  },
  {
    id: 'drive',
    nombre: 'Drive',
    dominios: ['drive.google.com', 'docs.google.com'],
    acciones: [
      { id: 'buscar', etiqueta: 'Buscar en Drive', plantilla: 'https://drive.google.com/drive/search?q={q}', pista: 'presupuesto' },
      { id: 'doc', etiqueta: 'Documento nuevo', plantilla: 'https://docs.new', tipo: 'ninguno' },
      { id: 'hoja', etiqueta: 'Hoja de cálculo nueva', plantilla: 'https://sheets.new', tipo: 'ninguno' },
      { id: 'presentacion', etiqueta: 'Presentación nueva', plantilla: 'https://slides.new', tipo: 'ninguno' },
    ],
  },
  {
    id: 'calendario',
    nombre: 'Calendario',
    dominios: ['calendar.google.com'],
    acciones: [
      { id: 'evento', etiqueta: 'Apuntar en el calendario', plantilla: 'https://calendar.google.com/calendar/u/0/r/eventedit?text={q}', pista: 'Comida con Nuria' },
      { id: 'hoy', etiqueta: 'Ver el día de hoy', plantilla: 'https://calendar.google.com/calendar/u/0/r/day', tipo: 'ninguno' },
      { id: 'semana', etiqueta: 'Ver la semana', plantilla: 'https://calendar.google.com/calendar/u/0/r/week', tipo: 'ninguno' },
    ],
  },
  {
    id: 'youtube',
    nombre: 'YouTube',
    dominios: ['youtube.com', 'youtu.be'],
    acciones: [
      { id: 'buscar', etiqueta: 'Buscar en YouTube', plantilla: 'https://www.youtube.com/results?search_query={q}', pista: 'cómo cambiar un grifo' },
      { id: 'suscripciones', etiqueta: 'Ver mis suscripciones', plantilla: 'https://www.youtube.com/feed/subscriptions', tipo: 'ninguno' },
    ],
  },
  {
    id: 'spotify',
    nombre: 'Spotify',
    dominios: ['spotify.com', 'open.spotify.com'],
    acciones: [
      { id: 'buscar', etiqueta: 'Buscar en Spotify', plantilla: 'https://open.spotify.com/search/{q}', pista: 'Rosalía' },
    ],
  },
  {
    id: 'whatsapp',
    nombre: 'WhatsApp',
    dominios: ['whatsapp.com', 'web.whatsapp.com', 'wa.me'],
    acciones: [
      { id: 'mensaje', etiqueta: 'Mandar un WhatsApp al número', plantilla: 'https://wa.me/{q}', tipo: 'telefono', pista: '34600111222' },
      { id: 'abrir', etiqueta: 'Abrir WhatsApp Web', plantilla: 'https://web.whatsapp.com/', tipo: 'ninguno' },
    ],
  },
  {
    id: 'maps',
    nombre: 'Maps',
    dominios: ['maps.google.com', 'google.com/maps'],
    acciones: [
      { id: 'ir', etiqueta: 'Cómo llegar a', plantilla: 'https://www.google.com/maps/dir/?api=1&destination={q}', pista: 'Atocha' },
      { id: 'buscar', etiqueta: 'Buscar un sitio', plantilla: 'https://www.google.com/maps/search/{q}', pista: 'farmacia' },
    ],
  },
  {
    id: 'traductor',
    nombre: 'Traductor',
    dominios: ['translate.google.com', 'deepl.com'],
    acciones: [
      { id: 'traducir', etiqueta: 'Traducir', plantilla: 'https://translate.google.com/?sl=auto&tl=es&text={q}&op=translate', pista: 'a text to translate' },
    ],
  },
  {
    id: 'amazon',
    nombre: 'Amazon',
    dominios: ['amazon.es', 'amazon.com'],
    acciones: [
      { id: 'buscar', etiqueta: 'Buscar en Amazon', plantilla: 'https://www.amazon.es/s?k={q}', pista: 'cargador usb c' },
      { id: 'pedidos', etiqueta: 'Ver mis pedidos', plantilla: 'https://www.amazon.es/gp/css/order-history', tipo: 'ninguno' },
    ],
  },
  {
    id: 'wallapop',
    nombre: 'Wallapop',
    dominios: ['wallapop.com'],
    acciones: [{ id: 'buscar', etiqueta: 'Buscar en Wallapop', plantilla: 'https://es.wallapop.com/app/search?keywords={q}', pista: 'bicicleta' }],
  },
  {
    id: 'idealista',
    nombre: 'Idealista',
    dominios: ['idealista.com'],
    acciones: [{ id: 'buscar', etiqueta: 'Buscar vivienda en', plantilla: 'https://www.idealista.com/buscar/alquiler-viviendas/{q}/', pista: 'malaga-malaga' }],
  },
  {
    id: 'wikipedia',
    nombre: 'Wikipedia',
    dominios: ['wikipedia.org'],
    acciones: [{ id: 'buscar', etiqueta: 'Buscar en Wikipedia', plantilla: 'https://es.wikipedia.org/w/index.php?search={q}', pista: 'Guerra de Sucesión' }],
  },
  {
    id: 'chatgpt',
    nombre: 'ChatGPT',
    dominios: ['chatgpt.com', 'chat.openai.com'],
    acciones: [{ id: 'preguntar', etiqueta: 'Preguntar a ChatGPT', plantilla: 'https://chatgpt.com/?q={q}', pista: 'resúmeme esto' }],
  },
  {
    id: 'netflix',
    nombre: 'Netflix',
    dominios: ['netflix.com'],
    acciones: [{ id: 'buscar', etiqueta: 'Buscar en Netflix', plantilla: 'https://www.netflix.com/search?q={q}', pista: 'documentales' }],
  },
  {
    id: 'github',
    nombre: 'GitHub',
    dominios: ['github.com'],
    acciones: [
      { id: 'buscar', etiqueta: 'Buscar en GitHub', plantilla: 'https://github.com/search?q={q}', pista: 'react hooks' },
      { id: 'nuevo', etiqueta: 'Repositorio nuevo', plantilla: 'https://github.com/new', tipo: 'ninguno' },
    ],
  },
  {
    id: 'linkedin',
    nombre: 'LinkedIn',
    dominios: ['linkedin.com'],
    acciones: [{ id: 'buscar', etiqueta: 'Buscar en LinkedIn', plantilla: 'https://www.linkedin.com/search/results/all/?keywords={q}', pista: 'diseñador web' }],
  },
  {
    id: 'correos',
    nombre: 'Correos',
    dominios: ['correos.es'],
    acciones: [{ id: 'seguir', etiqueta: 'Seguir un envío', plantilla: 'https://www.correos.es/es/es/herramientas/localizador/envios/detalle?tracking-number={q}', pista: 'PQ123456789ES' }],
  },
  {
    id: 'aemet',
    nombre: 'AEMET',
    dominios: ['aemet.es'],
    acciones: [{ id: 'abrir', etiqueta: 'Ver el tiempo', plantilla: 'https://www.aemet.es/es/eltiempo/prediccion/municipios', tipo: 'ninguno' }],
  },
  {
    id: 'notion',
    nombre: 'Notion',
    dominios: ['notion.so'],
    acciones: [
      { id: 'buscar', etiqueta: 'Buscar en Notion', plantilla: 'https://www.notion.so/search?q={q}', pista: 'reunión' },
      { id: 'nueva', etiqueta: 'Página nueva', plantilla: 'https://www.notion.new', tipo: 'ninguno' },
    ],
  },
]

/** Acciones que existen siempre, aunque no tengas ese acceso guardado.
 *  La barra busca en TUS cosas; si además quieres ir a internet, aquí
 *  lo dices tú explícitamente. */
export const ACCIONES_GENERALES: Accion[] = [
  { id: 'google', etiqueta: 'Buscarlo en Google', plantilla: 'https://www.google.com/search?q={q}' },
  { id: 'abrir-web', etiqueta: 'Abrir la dirección', plantilla: '{q}', tipo: 'direccion' },
]

const limpiaDominio = (d: string) => d.toLowerCase().replace(/^www\./, '')

/** Qué servicio es una dirección, si es alguno conocido. */
export const servicioDe = (url: string): Servicio | null => {
  let host: string
  try {
    host = limpiaDominio(new URL(url).hostname)
  } catch {
    return null
  }
  return (
    SERVICIOS.find((s) =>
      s.dominios.some((d) => {
        const dd = limpiaDominio(d.split('/')[0])
        return host === dd || host.endsWith('.' + dd)
      }),
    ) ?? null
  )
}

/** Rellena la plantilla. Devuelve null si no sale una URL admisible:
 *  lo que escribe la persona nunca entra crudo en una dirección. */
export const resolver = (plantilla: string, texto: string): string | null => {
  const destino = plantilla.includes('{q}')
    ? plantilla.replace('{q}', encodeURIComponent(texto.trim()))
    : plantilla
  try {
    const u = new URL(destino)
    return u.protocol === 'https:' || u.protocol === 'http:' ? u.toString() : null
  } catch {
    return null
  }
}
