/**
 * textCleaner — limpieza de texto pegado o extraido de un PDF.
 *
 * Funciones puras, sin DOM y sin red. Cada paso de la tuberia es
 * independiente y testeable por separado; `cleanText()` solo los encadena.
 *
 * Filosofia: es preferible dejar un salto de linea de mas que destruir
 * estructura legitima (listas, titulos, citas, codigo).
 */

/** Categorias de arreglos que se muestran al usuario. */
export const CLEAN_STAT_KEYS = [
  'lineBreaksFixed',
  'brokenWordsJoined',
  'spacingIssuesRemoved',
  'strangeCharsRemoved',
];

function emptyStats() {
  return {
    lineBreaksFixed: 0,
    brokenWordsJoined: 0,
    spacingIssuesRemoved: 0,
    strangeCharsRemoved: 0,
  };
}

/* ------------------------------------------------------------------ *
 *  1. Saltos de linea
 * ------------------------------------------------------------------ */

export function normalizeNewlines(text) {
  return text.replace(/\r\n?/g, '\n').replace(/[\u2028\u2029]/g, '\n');
}

/* ------------------------------------------------------------------ *
 *  2. Caracteres invisibles y de control.
 *     Se conservan acentos, enies, emojis, alfabetos no latinos y simbolos.
 * ------------------------------------------------------------------ */

/** Espacios duros: pasan a espacio normal. */
const NBSP = /[\u00A0\u2007\u202F\u2060]/g;
/** Espacios tipograficos de ancho variable. */
const THIN_SPACES = /[\u2000-\u200A\u205F\u3000]/g;
/** Guion blando, anchos cero y BOM: se eliminan. */
const INVISIBLE = /[\u00AD\u200B-\u200D\uFEFF\u180E]/g;
/** Controles C0/C1 salvo salto de linea y tabulador. */
const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g;

export function normalizeChars(text, stats = emptyStats()) {
  let out = text;
  out = out.replace(NBSP, (m) => {
    stats.strangeCharsRemoved += m.length;
    return ' ';
  });
  out = out.replace(THIN_SPACES, (m) => {
    stats.strangeCharsRemoved += m.length;
    return ' ';
  });
  out = out.replace(INVISIBLE, (m) => {
    stats.strangeCharsRemoved += m.length;
    return '';
  });
  out = out.replace(CONTROL, (m) => {
    stats.strangeCharsRemoved += m.length;
    return '';
  });
  // Tabulaciones: una sola separacion visual, nunca un muro de espacios.
  out = out.replace(/\t+/g, () => {
    stats.spacingIssuesRemoved += 1;
    return ' ';
  });
  return out;
}

/* ------------------------------------------------------------------ *
 *  3. Zonas protegidas: URLs, emails, rutas y codigo inline.
 *     Se enmascaran antes de tocar espacios y puntuacion, y se
 *     restauran intactas al final.
 * ------------------------------------------------------------------ */

const PROTECT_PATTERNS = [
  /`[^`\n]{1,200}`/g, // codigo inline
  /(?:https?:\/\/|www\.)[^\s<>"')\]]+/gi, // urls
  /[\w.%+-]+@[\w-]+\.[a-z]{2,}\b/gi, // emails
  /\b[a-zA-Z]:\\[^\s"'<>|]+/g, // rutas windows
  /(?:\.{1,2}\/|\/)[\w.@-]+(?:\/[\w.@-]+)+\/?/g, // rutas unix (2+ segmentos)
];

const MASK_OPEN = '\u0001';
const MASK_CLOSE = '\u0002';

export function maskProtected(text) {
  const store = [];
  let out = text;
  for (const pattern of PROTECT_PATTERNS) {
    out = out.replace(pattern, (match) => {
      const id = store.push(match) - 1;
      return MASK_OPEN + id + MASK_CLOSE;
    });
  }
  return { text: out, store };
}

export function unmaskProtected(text, store) {
  const pattern = new RegExp(MASK_OPEN + '(\\d+)' + MASK_CLOSE, 'g');
  return text.replace(pattern, (match, id) => {
    const value = store[Number(id)];
    return value === undefined ? match : value;
  });
}

/* ------------------------------------------------------------------ *
 *  4. Espacios sobrantes por linea
 * ------------------------------------------------------------------ */

const STRUCTURAL_LINE =
  /^\s*(?:[-*+•·▪◦‣]\s+|[–—]\s+|\d+[.)]\s+|\(\d+\)\s+|[a-zA-Z][.)]\s+|[IVXLCDM]{1,6}[.)]\s+|#{1,6}\s+|>\s?|\|)/;

/** Linea que actua como elemento de lista, cita, tabla o encabezado markdown. */
export function isStructuralLine(line) {
  return STRUCTURAL_LINE.test(line);
}

/** Linea que se comporta como titulo: no debe fundirse con la siguiente. */
export function isHeadingLine(line) {
  const trimmed = line.trim();
  if (!trimmed) return false;
  if (/^#{1,6}\s+/.test(trimmed)) return true;
  if (trimmed.length <= 70 && /\p{L}/u.test(trimmed) && trimmed === trimmed.toUpperCase()) {
    return true;
  }
  return false;
}

export function trimLineEdges(text, stats = emptyStats()) {
  return text
    .split('\n')
    .map((line) => {
      const trimmedEnd = line.replace(/ +$/, '');
      if (trimmedEnd !== line) stats.spacingIssuesRemoved += 1;
      const leading = trimmedEnd.match(/^ +/);
      if (!leading) return trimmedEnd;
      // La sangria solo se conserva (y se acota) en lineas de lista o cita.
      if (isStructuralLine(trimmedEnd)) {
        const keep = Math.min(leading[0].length, 8);
        const rebuilt = ' '.repeat(keep) + trimmedEnd.slice(leading[0].length);
        if (rebuilt !== trimmedEnd) stats.spacingIssuesRemoved += 1;
        return rebuilt;
      }
      stats.spacingIssuesRemoved += 1;
      return trimmedEnd.slice(leading[0].length);
    })
    .join('\n');
}

/* ------------------------------------------------------------------ *
 *  5. Palabras partidas por guion al final de linea
 * ------------------------------------------------------------------ */

const HYPHEN_BREAK = /(\p{L}{2,})[-‐‑][ \t]*\n[ \t]*(\p{Ll}{2,})/gu;

export function joinBrokenWords(text, stats = emptyStats()) {
  return text.replace(HYPHEN_BREAK, (match, head, tail) => {
    // Un acronimo en mayusculas ("PDF-\nlector") suele ser compuesto real.
    if (head === head.toUpperCase() && head.length > 1) return match;
    // Palabras absurdamente largas: probablemente no era una particion.
    if (head.length + tail.length > 40) return match;
    stats.brokenWordsJoined += 1;
    return head + tail;
  });
}

/* ------------------------------------------------------------------ *
 *  6. Saltos de linea automaticos del PDF
 * ------------------------------------------------------------------ */

/** Por debajo de este ancho no se aplica la heuristica de "linea llena". */
const MIN_WRAP_WIDTH = 40;
const FULL_LINE_RATIO = 0.62;
const PARAGRAPH_END_RATIO = 0.85;

const ENDS_SENTENCE = /[.!?…]["'»”’)\]]?$/;

export function shouldJoinLines(rawA, rawB, wrapWidth) {
  const a = rawA.trim();
  const b = rawB.trim();
  if (!a || !b) return false;
  if (isStructuralLine(b)) return false;
  if (isHeadingLine(a)) return false;
  if (/:$/.test(a)) return false; // dos puntos: casi siempre introducen algo
  if (/[-–—]$/.test(a)) return false;

  const endsSentence = ENDS_SENTENCE.test(a);
  const startsLower = /^[\p{Ll}\d,;)]/u.test(b);
  const startsSentence = /^[\p{Lu}¿¡"«]/u.test(b);

  // Frase cerrada y lo siguiente empieza como frase nueva: no se tocan.
  // Aqui es donde antes se pegaba la etiqueta de la ficha o de la tarjeta
  // al final del parrafo anterior ("...Seguridad Social. Salario bruto").
  // Lo peor que puede pasar ahora es dejar un salto de mas dentro de un
  // parrafo, que se lee igual; lo otro cambiaba el sentido.
  if (endsSentence && startsSentence) return false;

  // "Etiqueta: valor" en la linea siguiente: es un campo, no una
  // continuacion de la frase anterior.
  if (/^[^:\n]{1,40}:(\s|$)/.test(b)) return false;

  if (wrapWidth >= MIN_WRAP_WIDTH) {
    // Linea corta terminada en punto: final de parrafo real.
    if (endsSentence && a.length < wrapWidth * PARAGRAPH_END_RATIO) return false;
    if (a.length >= wrapWidth * FULL_LINE_RATIO) return true;
    return startsLower && !endsSentence;
  }
  return startsLower && !endsSentence;
}

function joinBlock(block, stats) {
  if (block.length < 2) return block.slice();
  const wrapWidth = Math.max(...block.map((l) => l.trim().length));
  const out = [block[0]];
  let lastRaw = block[0];
  for (let i = 1; i < block.length; i += 1) {
    const current = block[i];
    if (shouldJoinLines(lastRaw, current, wrapWidth)) {
      const merged = out[out.length - 1].replace(/\s+$/, '');
      out[out.length - 1] = merged + ' ' + current.replace(/^\s+/, '');
      stats.lineBreaksFixed += 1;
    } else {
      out.push(current);
    }
    lastRaw = current;
  }
  return out;
}

export function joinWrappedLines(text, stats = emptyStats()) {
  const lines = text.split('\n');
  const out = [];
  let i = 0;
  while (i < lines.length) {
    if (lines[i].trim() === '') {
      out.push(lines[i]);
      i += 1;
      continue;
    }
    let j = i;
    while (j < lines.length && lines[j].trim() !== '') j += 1;
    out.push(...joinBlock(lines.slice(i, j), stats));
    i = j;
  }
  return out.join('\n');
}

/* ------------------------------------------------------------------ *
 *  7. Espacios y puntuacion
 * ------------------------------------------------------------------ */

export function collapseSpaces(text, stats = emptyStats()) {
  return text.replace(/ {2,}/g, () => {
    stats.spacingIssuesRemoved += 1;
    return ' ';
  });
}

const PUNCTUATION_RULES = [
  // "hola , mundo" -> "hola, mundo"   |   "mundo ." -> "mundo."
  // El % se queda fuera a proposito: "32,4 %" es la forma correcta en
  // espanol y quitarle el espacio seria empeorar el original.
  [/ +([,;:.!?])/g, '$1'],
  // "( texto )" -> "(texto)"
  [/\( +/g, '('],
  [/ +\)/g, ')'],
  // signos de apertura del espanol
  [/([¿¡]) +/g, '$1'],
  // coma o punto y coma sin espacio detras (no toca 1,000 ni 10:30)
  [/([,;])(?=[^\s\d])/g, '$1 '],
  // "final.Otra" -> "final. Otra"
  [/(\p{Ll})\.(\p{Lu})/gu, '$1. $2'],
  // comillas latinas
  [/ +»/g, '»'],
  [/« +/g, '«'],
];

export function fixPunctuationSpacing(text, stats = emptyStats()) {
  let out = text;
  for (const [pattern, replacement] of PUNCTUATION_RULES) {
    out = out.replace(pattern, (...args) => {
      stats.spacingIssuesRemoved += 1;
      const groups = args.slice(1, -2);
      return replacement.replace(/\$(\d)/g, (_, n) => {
        const value = groups[Number(n) - 1];
        return value === undefined ? '' : value;
      });
    });
  }
  return out;
}

export function collapseBlankLines(text, stats = emptyStats()) {
  return text.replace(/\n{3,}/g, () => {
    stats.lineBreaksFixed += 1;
    return '\n\n';
  });
}

/* ------------------------------------------------------------------ *
 *  Tuberia completa
 * ------------------------------------------------------------------ */

/**
 * @param {string} raw texto tal cual lo pego o cargo el usuario
 * @returns {{text: string, stats: object, totalFixes: number}}
 */
export function cleanText(raw) {
  const stats = emptyStats();
  if (typeof raw !== 'string' || raw.trim() === '') {
    return { text: '', stats, totalFixes: 0 };
  }

  let text = normalizeNewlines(raw);
  text = normalizeChars(text, stats);

  const masked = maskProtected(text);
  text = masked.text;

  text = trimLineEdges(text, stats);
  text = joinBrokenWords(text, stats);
  text = joinWrappedLines(text, stats);
  text = collapseSpaces(text, stats);
  text = fixPunctuationSpacing(text, stats);
  text = collapseBlankLines(text, stats);

  text = unmaskProtected(text, masked.store);
  text = text.replace(/^\n+/, '').replace(/\s+$/, '');

  const totalFixes = CLEAN_STAT_KEYS.reduce((sum, key) => sum + stats[key], 0);
  return { text, stats, totalFixes };
}

export default cleanText;
