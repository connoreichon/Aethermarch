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

/**
 * Lineas que van "a voces": titulos en MAYUSCULAS o en Mayusculas
 * Iniciales, como los titulares. Dentro de ellas una mayuscula no dice
 * nada, asi que no se sacan ni nombres propios ni siglas: si no, un titular
 * como "Gran Exito En El Teatro" produce cinco nombres inventados.
 */
function shoutyRanges(text) {
  const ranges = [];
  let offset = 0;
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    const words = trimmed.split(/\s+/).filter((word) => /\p{L}/u.test(word));
    if (words.length > 0 && trimmed.length <= 90) {
      const capitalised = words.filter((word) => /^\p{Lu}/u.test(word)).length;
      const letters = trimmed.replace(/[^\p{L}]/gu, '');
      const upper = letters.replace(/[^\p{Lu}]/gu, '');
      // Con menos palabras no hay muestra suficiente: "Contrato con
      // Vodafone" no es un titular, es una frase con un nombre dentro.
      const allCaps = words.length >= 2 && letters.length > 3 && upper.length / letters.length > 0.7;
      const titleCase = words.length >= 4 && capitalised / words.length > 0.6;
      if (allCaps || titleCase) ranges.push([offset, offset + line.length]);
    }
    offset += line.length + 1;
  }
  return ranges;
}

function inRanges(ranges, index) {
  return ranges.some(([start, end]) => index >= start && index < end);
}

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
    {
      kind: 'amount',
      re: /[€$£]\s?\d[\d.,]*/g,
      // "34.018 € 32,4 %" no contiene el importe "€ 32,4": ese simbolo
      // pertenece al numero de antes. Se descarta si viene detras de cifra.
      guard: (text, index) => {
        let cursor = index - 1;
        while (cursor >= 0 && /\s/.test(text[cursor])) cursor -= 1;
        return cursor < 0 || !/[\d%]/.test(text[cursor]);
      },
    },
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
function findNames(text, lang, found, seen, shouty) {
  const stopwords = getStopwords(lang);
  const pattern =
    /(\p{Lu}[\p{Ll}'’-]{1,}(?:[ \t]+(?:de|del|la|los|las|y|of|the|and)[ \t]+\p{Lu}[\p{Ll}'’-]+|[ \t]+\p{Lu}[\p{Ll}'’-]+)*)/gu;
  let match = pattern.exec(text);

  while (match !== null) {
    const start = match.index;
    const value = match[0];
    // Que hay antes: si es principio de frase, la mayuscula no dice nada.
    let cursor = start - 1;
    // El salto de linea NO se salta: empezar linea es empezar frase, y una
    // etiqueta suelta como 'Salario' no es un nombre propio.
    while (cursor >= 0 && /[ \t"'\u00ab\u00bb(\u00a1\u00bf]/.test(text[cursor])) cursor -= 1;
    const previous = cursor >= 0 ? text[cursor] : '';
    const sentenceStart = previous === '' || /[.!?:;\n•·-]/.test(previous);

    const firstWord = value.split(/\s+/)[0].toLowerCase();
    if (!sentenceStart && !stopwords.has(firstWord) && value.length > 2 && !inRanges(shouty, start)) {
      pushMatch(found, seen, 'name', value);
    }
    match = pattern.exec(text);
  }
}

/**
 * Siglas de verdad.
 *
 * Cuidado con \b: en JavaScript solo conoce letras ASCII, asi que dentro de
 * "ESCENICOS" con tilde o "DIPUTACION" con tilde la propia tilde crea una
 * frontera falsa y salen siglas inventadas ("ESCE", "ON"). Por eso los
 * limites se comprueban a mano contra letras y numeros Unicode.
 */
const WORD_CHAR = /[\p{L}\p{N}]/u;

function isWholeWord(text, start, end) {
  const before = start > 0 ? text[start - 1] : '';
  const after = end < text.length ? text[end] : '';
  return !(before && WORD_CHAR.test(before)) && !(after && WORD_CHAR.test(after));
}

/** Palabras que en algun sitio del texto van en minuscula: no son siglas. */
function lowercaseVocabulary(text) {
  const words = new Set();
  for (const match of text.matchAll(/\p{L}[\p{L}\p{N}]*/gu)) {
    const word = match[0];
    if (word !== word.toUpperCase()) words.add(word.toLowerCase());
  }
  return words;
}

/**
 * Proporcion de palabras que van enteras en mayusculas. En un pliego
 * tecnico o un cartel casi todo grita: ahi "estar en mayusculas" no
 * distingue una sigla de una palabra normal, asi que no se buscan siglas.
 */
function shoutyDocument(text) {
  const words = text.match(/\p{L}{2,}/gu) || [];
  if (words.length < 20) return false;
  const shouted = words.filter((word) => word === word.toUpperCase()).length;
  return shouted / words.length > 0.25;
}

function findAcronyms(text, found, seen, shouty, lang) {
  if (shoutyDocument(text)) return;
  const stopwords = getStopwords(lang);
  const lowercase = lowercaseVocabulary(text);
  const pattern = /\p{Lu}{2,6}/gu;
  let match = pattern.exec(text);

  while (match !== null) {
    const value = match[0];
    const start = match.index;
    const end = start + value.length;
    const lower = value.toLowerCase();

    const esSigla =
      isWholeWord(text, start, end) &&
      !ACRONYM_NOISE.has(value) &&
      // Un titulo en mayusculas no esta lleno de siglas, esta gritando.
      !inRanges(shouty, start) &&
      // "DE", "LOS", "ESTA": palabras vacias a voces, no siglas.
      !stopwords.has(lower) &&
      // Las siglas del castellano no llevan tilde (IVA, IRPF, SGAE, RGPD).
      !/[^\u0000-\u007F]/.test(value) &&
      // Si esa misma palabra aparece en minuscula en el texto, es una
      // palabra normal gritando, no una sigla.
      !lowercase.has(lower);

    if (esSigla) pushMatch(found, seen, 'acronym', value);
    pattern.lastIndex = end;
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

  for (const { kind, re, guard } of patternsFor(lang)) {
    re.lastIndex = 0;
    let match = re.exec(text);
    while (match !== null) {
      if (match[0].length === 0) {
        re.lastIndex += 1;
      } else {
        if (!guard || guard(text, match.index)) pushMatch(found, seen, kind, match[0]);
        re.lastIndex = match.index + match[0].length;
      }
      match = re.exec(text);
    }
  }

  const shouty = shoutyRanges(text);
  findDeadlines(text, lang, found, seen);
  findAcronyms(text, found, seen, shouty, lang);
  findNames(text, lang, found, seen, shouty);

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
