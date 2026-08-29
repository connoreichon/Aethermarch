/**
 * tokenizer — una sola pasada de tokenizacion compartida por todos los
 * analisis (terminos clave, repeticiones, muletillas, estadisticas).
 *
 * Sin DOM. Sin dependencias.
 */

/**
 * Palabra: letra o numero, con apostrofes/guiones internos permitidos.
 * "co-working", "d'accord" y "covid19" cuentan como un token.
 */
const WORD_RE = /[\p{L}\p{N}](?:[\p{L}\p{N}'’·-]*[\p{L}\p{N}])?/gu;

/** Scripts sin separacion por espacios: ahi si compensa Intl.Segmenter. */
const CJK_RE = /[぀-ヿ㐀-䶿一-鿿가-힯]/;

const hasSegmenter = typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function';

/**
 * @typedef {{value: string, lower: string, start: number, end: number}} Token
 */

/**
 * @param {string} text
 * @returns {Token[]}
 */
export function tokenize(text) {
  if (!text) return [];
  if (hasSegmenter && CJK_RE.test(text)) return segmentTokens(text);
  return regexTokens(text);
}

function regexTokens(text) {
  const tokens = [];
  WORD_RE.lastIndex = 0;
  let match = WORD_RE.exec(text);
  while (match !== null) {
    const value = match[0];
    tokens.push({
      value,
      lower: value.toLowerCase(),
      start: match.index,
      end: match.index + value.length,
    });
    match = WORD_RE.exec(text);
  }
  return tokens;
}

function segmentTokens(text) {
  const segmenter = new Intl.Segmenter(undefined, { granularity: 'word' });
  const tokens = [];
  for (const part of segmenter.segment(text)) {
    if (!part.isWordLike) continue;
    tokens.push({
      value: part.segment,
      lower: part.segment.toLowerCase(),
      start: part.index,
      end: part.index + part.segment.length,
    });
  }
  return tokens;
}

/** Solo cuenta como termino candidato si tiene al menos 3 letras reales. */
export function isWordy(token) {
  const letters = token.value.replace(/[^\p{L}]/gu, '');
  return letters.length >= 3;
}

/** Divide el texto limpio en bloques (parrafos, listas, titulos). */
export function splitBlocks(text) {
  if (!text) return [];
  return text
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter((block) => block.length > 0);
}

export default tokenize;
