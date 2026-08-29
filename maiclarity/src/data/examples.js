/**
 * Ejemplos de demostracion.
 *
 * Estan escritos como listas de lineas para reproducir con exactitud los
 * defectos tipicos de un PDF: corte al final de cada linea visual, una
 * palabra partida por guion, espacios dobles, listas y muletillas.
 */

const EXAMPLE_ES = [
  'Propuesta de campana para el cliente',
  '',
  'Este documento ha sido extraido desde un PDF y por eso',
  'contiene saltos de linea automaticos al final de cada',
  'linea visual, ademas de algun espacio  doble suelto y',
  'palabras cortadas por un guion como este presu-',
  'puesto que en realidad era una sola palabra.',
  '',
  'El cliente nos pide una propuesta de marketing cerrada',
  'antes de octubre. Basicamente hay tres frentes: la',
  'campana de captacion, el presupuesto de medios y el',
  'calendario de publicacion. El cliente ya nos avanzo que',
  'el presupuesto es el punto mas sensible de todos.',
  '',
  'Objetivos del trimestre:',
  '1. Duplicar las solicitudes de presupuesto entrantes.',
  '2. Reducir el coste por contacto de marketing.',
  '3. Cerrar el calendario de campana con el cliente.',
  '',
  'Puntos abiertos',
  '- Confirmar el presupuesto definitivo de medios.',
  '- Revisar si el cliente aporta fotografia propia.',
  '- Decidir el canal principal de la campana.',
  '',
  'Realmente el mayor riesgo es la fecha: obviamente si el',
  'cliente tarda en aprobar el presupuesto, el calendario',
  'de marketing se comprime y la campana pierde fuerza.',
  'Simplemente por eso conviene cerrar el presupuesto esta',
  'misma semana y avisar al cliente de la fecha limite.',
].join('\n');

const EXAMPLE_EN = [
  'Campaign proposal for the client',
  '',
  'This document was extracted from a PDF, which is why it',
  'still carries an automatic line break at the end of every',
  'visual line, the odd double  space and words cut by a',
  'hyphen such as this bud-',
  'get that was really a single word.',
  '',
  'The client wants a closed marketing proposal before',
  'October. Basically there are three fronts: the acquisition',
  'campaign, the media budget and the publishing calendar.',
  'The client already told us that the budget is by far the',
  'most sensitive point of the whole marketing plan.',
  '',
  'Goals for the quarter:',
  '1. Double the number of incoming budget requests.',
  '2. Bring down the marketing cost per contact.',
  '3. Close the campaign calendar with the client.',
  '',
  'Open points',
  '- Confirm the final media budget.',
  '- Check whether the client provides their own photography.',
  '- Decide the main channel for the campaign.',
  '',
  'Actually the biggest risk is the date: obviously if the',
  'client takes too long to approve the budget, the marketing',
  'calendar gets compressed and the campaign loses strength.',
  'Simply for that reason the budget should be closed this',
  'week and the client warned about the deadline.',
].join('\n');

/**
 * Fragmento corto para la demostracion "antes y despues" de la pagina.
 * No es una captura: la propia herramienta lo limpia al cargar, asi que
 * lo que se ve es siempre el resultado real.
 */
const DEMO_ES = [
  'Este documento ha sido extraido desde un PDF y por eso',
  'contiene saltos de linea automaticos al final de cada',
  'linea visual, ademas de algun espacio  doble suelto y',
  'palabras cortadas por un guion como este presu-',
  'puesto que en realidad era una sola palabra.',
].join('\n');

const DEMO_EN = [
  'This document was extracted from a PDF, which is why it',
  'still carries an automatic line break at the end of every',
  'visual line, the odd double  space and words cut by a',
  'hyphen such as this bud-',
  'get that was really a single word.',
].join('\n');

export const DEMOS = { es: DEMO_ES, en: DEMO_EN };

export const EXAMPLES = { es: EXAMPLE_ES, en: EXAMPLE_EN };

export function getExample(lang) {
  return EXAMPLES[lang] || EXAMPLES.en;
}

export function getDemoSnippet(lang) {
  return DEMOS[lang] || DEMOS.en;
}

export default EXAMPLES;
