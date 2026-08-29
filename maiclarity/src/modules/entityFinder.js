/**
 * entityFinder — lo importante que aparece UNA sola vez.
 *
 * El recuento de frecuencia nunca vera una fecha de entrega, un importe o
 * el nombre de un cliente si solo salen una vez, y suelen ser justo lo que
 * hay que localizar de un vistazo. Aqui se detectan por su forma, no por
 * cuantas veces aparecen.
 *
 * Todo son expresiones regulares y listas locales: sin modelo, sin API y
 * sin ninguna llamada a ningun sitio. Determinista: el mismo texto da
 * siempre el mismo resultado.
 */
import { getStopwords } from './language.js';

/** Orden de importancia cuando hay que recortar. */
export const ENTITY_KINDS = ['date', 'deadline', 'amount', 'acronym', 'name'];

const MAX_ENTITIES = 26;
const MAX_NAMES = 10;

const MONTHS_ES =
  'enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|setiembre|octubre|noviembre|diciembre';
const MONTHS_EN =
  'january|february|march|april|june|july|august|september|october|november|december';
const MONTHS_EN_SHORT = 'jan|feb|apr|jun|jul|aug|sept?|oct|nov|dec';
const DAYS_ES = 'lunes|martes|miercoles|miércoles|jueves|viernes|sabado|sábado|domingo';
const DAYS_EN = 'monday|tuesday|wednesday|thursday|friday|saturday|sunday';

const UNITS_ES =
  'segundos?|minutos?|horas?|dias?|días?|semanas?|meses|mes|años?|anos?|trimestres?|km|kg|m2|m²|unidades?|personas?|clientes?|usuarios?|paginas?|páginas?|palabras?';
const UNITS_EN =
  'seconds?|minutes?|hours?|days?|weeks?|months?|years?|quarters?|km|kg|units?|people|users?|customers?|clients?|pages?|words?';

const DEADLINE_ES = [
  'fecha limite',
  'fecha límite',
  'fecha de entrega',
  'plazo',
  'plazos',
  'vencimiento',
  'a mas tardar',
  'a más tardar',
  'como muy tarde',
  'urgente',
  'prioritario',
  'obligatorio',
  'imprescindible',
  'improrrogable',
];

const DEADLINE_EN = [
  'deadline',
  'due date',
  'due by',
  'no later than',
  'as soon as possible',
  'asap',
  'urgent',
  'mandatory',
  'required',
  'must have',
  'top priority',
];

/** Siglas que no aportan nada como dato. */
const ACRONYM_NOISE = new Set(['OK', 'TV', 'PC', 'ID', 'AM', 'PM', 'CV', 'IT', 'NO', 'SI', 'SÍ']);

function patternsFor(lang) {
  const months = lang === 'es' ? MONTHS_ES : `${MONTHS_EN}|${MONTHS_EN_SHORT}`;
  const bareMonths = lang === 'es' ? MONTHS_ES : MONTHS_EN; // sin abreviaturas ambiguas
  const days = lang === 'es' ? DAYS_ES : DAYS_EN;
  const units = lang === 'es' ? UNITS_ES : UNITS_EN;

  return [
    // --- Fechas ---
    { kind: 'date', re: /\b\d{4}-\d{2}-\d{2}\b/g },
    { kind: 'date', re: /\b\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4}\b/g },
    { kind: 'date', re: new RegExp(`\\b\\d{1,2}\\s+de\\s+(?:${months})(?:\\s+de\\s+\\d{4})?\\b`, 'gi') },
    { kind: 'date', re: new RegExp(`\\b(?:${months})\\s+de\\s+\\d{4}\\b`, 'gi') },
    { kind: 'date', re: new RegExp(`\\b(?:${months})\\s+\\d{1,2}(?:,\\s*\\d{4})?\\b`, 'gi') },
    { kind: 'date', re: new RegExp(`\\b\\d{1,2}\\s+(?:${months})(?:\\s+\\d{4})?\\b`, 'gi') },
    { kind: 'date', re: new RegExp(`\\b(?:${bareMonths})\\b`, 'gi') },
    { kind: 'date', re: new RegExp(`\\b(?:${days})\\b`, 'gi') },
    { kind: 'date', re: /\b(?:19|20)\d{2}\b/g },

    // --- Importes y cifras ---
    { kind: 'amount', re: /[€$£]\s?\d[\d.,]*/g },
    {
      kind: 'amount',
      // El \b solo vale detras de letras: tras un simbolo como € nunca casa.
      re: /\b\d[\d.,]*\s*(?:[€$£]|(?:euros?|d[oó]lares?|libras?|usd|eur|gbp)\b)/gi,
    },
    { kind: 'amount', re: /\b\d[\d.,]*\s*%/g },
    { kind: 'amount', re: new RegExp(`\\b\\d[\\d.,]*\\s+(?:${units})\\b`, 'gi') },
    { kind: 'amount', re: /\b\d{1,3}(?:[.,]\d{3})+\b/g },
  ];
}

function pushMatch(found, seen, kind, raw) {
  const text = raw.trim().replace(/\s+/g, ' ');
  if (!text) return;
  const key = `${kind}:${text.toLowerCase()}`;
  if (seen.has(key)) {
    seen.get(key).count += 1;
    return;
  }
  const entry = { text, kind, count: 1 };
  seen.set(key, entry);
  found.push(entry);
}

/** Nombres propios: mayuscula inicial sin ser principio de frase. */
function findNames(text, lang, found, seen) {
  const stopwords = getStopwords(lang);
  const pattern =
    /(\p{Lu}[\p{Ll}'’-]{1,}(?:[ \t]+(?:de|del|la|los|las|y|of|the|and)[ \t]+\p{Lu}[\p{Ll}'’-]+|[ \t]+\p{Lu}[\p{Ll}'’-]+)*)/gu;
  let match = pattern.exec(text);

  while (match !== null) {
    const start = match.index;
    const value = match[0];
    // Que hay antes: si es principio de frase, la mayuscula no dice nada.
    let cursor = start - 1;
    while (cursor >= 0 && /[\s"'«»(¡¿]/.test(text[cursor])) cursor -= 1;
    const previous = cursor >= 0 ? text[cursor] : '';
    const sentenceStart = previous === '' || /[.!?:;\n•·-]/.test(previous);

    const firstWord = value.split(/\s+/)[0].toLowerCase();
    if (!sentenceStart && !stopwords.has(firstWord) && value.length > 2) {
      pushMatch(found, seen, 'name', value);
    }
    match = pattern.exec(text);
  }
}

function findAcronyms(text, found, seen) {
  const pattern = /\b[\p{Lu}]{2,6}\b/gu;
  let match = pattern.exec(text);
  while (match !== null) {
    const value = match[0];
    if (!ACRONYM_NOISE.has(value)) pushMatch(found, seen, 'acronym', value);
    match = pattern.exec(text);
  }
}

function findDeadlines(text, lang, found, seen) {
  const list = lang === 'es' ? DEADLINE_ES : DEADLINE_EN;
  for (const phrase of list) {
    const source = phrase
      .split(/\s+/)
      .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('\\s+');
    const pattern = new RegExp(`(?:^|[^\\p{L}\\p{N}])(${source})(?![\\p{L}\\p{N}])`, 'giu');
    let match = pattern.exec(text);
    while (match !== null) {
      pushMatch(found, seen, 'deadline', match[1]);
      pattern.lastIndex = match.index + Math.max(1, match[0].length - 1);
      match = pattern.exec(text);
    }
  }
}

/**
 * @param {string} text texto limpio
 * @param {string} lang 'es' | 'en'
 * @returns {{text: string, kind: string, count: number}[]}
 */
export function findEntities(text, lang = 'es') {
  if (!text || text.length < 12) return [];

  const found = [];
  const seen = new Map();

  for (const { kind, re } of patternsFor(lang)) {
    re.lastIndex = 0;
    let match = re.exec(text);
    while (match !== null) {
      if (match[0].length === 0) {
        re.lastIndex += 1;
      } else {
        pushMatch(found, seen, kind, match[0]);
        re.lastIndex = match.index + match[0].length;
      }
      match = re.exec(text);
    }
  }

  findDeadlines(text, lang, found, seen);
  findAcronyms(text, found, seen);
  findNames(text, lang, found, seen);

  return prioritise(found);
}

/**
 * Recorta y ordena: primero lo que marca una decision (fechas y plazos),
 * al final los nombres, que son los mas numerosos y los menos criticos.
 */
export function prioritise(entities) {
  const byKind = new Map(ENTITY_KINDS.map((kind) => [kind, []]));
  for (const entity of entities) {
    const bucket = byKind.get(entity.kind);
    if (bucket) bucket.push(entity);
  }

  for (const [kind, bucket] of byKind) {
    bucket.sort((a, b) => b.count - a.count || b.text.length - a.text.length);
    if (kind === 'name') bucket.splice(MAX_NAMES);
  }

  const ordered = [];
  for (const kind of ENTITY_KINDS) {
    ordered.push(...byKind.get(kind));
  }

  // Si una entidad esta contenida en otra mas larga y del mismo tipo,
  // sobra: "octubre" dentro de "12 de octubre de 2025".
  const kept = [];
  for (const entity of ordered) {
    const lower = entity.text.toLowerCase();
    const covered = kept.some(
      (other) => other.kind === entity.kind && other.text.toLowerCase().includes(lower)
    );
    if (!covered) kept.push(entity);
  }

  return kept.slice(0, MAX_ENTITIES);
}

export default findEntities;
