/**
 * keywordAnalyzer — terminos clave del documento.
 *
 * Puntuacion determinista, sin IA y sin corpus externo. Combina:
 *   - frecuencia (con logaritmo, para que 40 apariciones no aplasten al resto)
 *   - longitud de la palabra (las muy cortas suelen aportar menos)
 *   - dispersion a lo largo del documento (un termino presente de principio
 *     a fin describe el texto mejor que uno concentrado en un parrafo)
 *   - penalizacion de terminos omnipresentes (ruido)
 *
 * No es TF-IDF: no hay corpus contra el que comparar, y llamarlo asi seria
 * mentir. En la interfaz se llama simplemente "terminos clave".
 */
import { isWordy } from './tokenizer.js';
import { getStopwords } from './language.js';
import { getVagueWords } from '../data/vague.js';

/** Cuantos terminos proponer segun tamano del documento y preferencia. */
export const AMOUNT_MULTIPLIER = { low: 0.6, medium: 1, high: 1.5 };

const BUCKETS = 10;

/** Marcas tras las que una mayuscula inicial no significa nada. */
const SENTENCE_EDGE = /[.!?:;\n\u2022\u00b7)\]-]/;
const LEADING_NOISE = /[\s"'\u00ab\u00bb(\u00a1\u00bf]/;

/** True si el token abre frase, parrafo o punto de lista. */
function startsSentence(text, index) {
  if (!text) return false;
  let cursor = index - 1;
  while (cursor >= 0 && LEADING_NOISE.test(text[cursor])) cursor -= 1;
  if (cursor < 0) return true;
  return SENTENCE_EDGE.test(text[cursor]);
}

export function targetKeywordCount(wordCount, amount = 'medium') {
  let base;
  if (wordCount < 60) base = 4;
  else if (wordCount < 150) base = 6;
  else if (wordCount < 500) base = 10;
  else if (wordCount < 1500) base = 14;
  else base = 18;
  const multiplier = AMOUNT_MULTIPLIER[amount] ?? 1;
  return Math.max(3, Math.min(24, Math.round(base * multiplier)));
}

/**
 * @param {import('./tokenizer.js').Token[]} tokens
 * @param {{lang: string, amount?: string}} options
 * @returns {{term: string, display: string, count: number, score: number, weight: number}[]}
 */
export function analyzeKeywords(tokens, { lang = 'en', amount = 'medium', leadEnd = 0, text = '' } = {}) {
  if (!tokens || tokens.length === 0) return [];
  const stopwords = getStopwords(lang);
  const vague = getVagueWords(lang);
  const total = tokens.length;
  const bucketSize = Math.max(1, Math.ceil(total / BUCKETS));

  /** @type {Map<string, {count:number, surfaces:Map<string,number>, buckets:Set<number>}>} */
  const entries = new Map();

  for (let i = 0; i < total; i += 1) {
    const token = tokens[i];
    const key = token.lower;
    if (stopwords.has(key)) continue;
    if (!isWordy(token)) continue;
    if (/^\d+$/.test(key)) continue;

    let entry = entries.get(key);
    if (!entry) {
      entry = { count: 0, surfaces: new Map(), buckets: new Set(), lead: false, caps: 0 };
      entries.set(key, entry);
    }
    entry.count += 1;
    // Lo que aparece en el titulo o la entradilla describe el documento.
    if (leadEnd > 0 && token.start < leadEnd) entry.lead = true;
    // Escrito con mayuscula inicial a media frase: suele ser un nombre.
    // Mayuscula a media frase: probablemente un nombre propio. La
    // primera palabra de una frase o de un punto de lista tambien va en
    // mayuscula y no dice nada, asi que no cuenta.
    if (i > 0 && /^\p{Lu}/u.test(token.value) && !startsSentence(text, token.start)) {
      entry.caps += 1;
    }
    entry.surfaces.set(token.value, (entry.surfaces.get(token.value) || 0) + 1);
    entry.buckets.add(Math.floor(i / bucketSize));
  }

  const usableBuckets = Math.min(BUCKETS, Math.ceil(total / bucketSize));
  const minCount = total > 120 ? 2 : 1;
  const results = [];

  for (const [term, entry] of entries) {
    if (entry.count < minCount) continue;

    const letters = term.replace(/[^\p{L}\p{N}]/gu, '').length;
    const lengthFactor = letters >= 4 ? Math.min(1.4, 0.85 + (letters - 4) * 0.06) : 0.78;
    const spread = entry.buckets.size / usableBuckets;
    const spreadFactor = 0.65 + 0.35 * spread;
    const density = entry.count / total;
    // Un termino que ocupa mas del 5% del texto describe poco: es relleno.
    const noisePenalty = density > 0.05 ? 0.55 : 1;

    // Palabras comodin ("cosa", "linea", "tema"): suben en cualquier
    // recuento y no dicen nada del documento.
    const vaguePenalty = vague.has(term) ? 0.35 : 1;
    const leadBoost = entry.lead ? 1.25 : 1;
    const properBoost = entry.count > 0 && entry.caps / entry.count > 0.6 ? 1.22 : 1;

    const score =
      (1 + Math.log(entry.count)) *
      lengthFactor *
      spreadFactor *
      noisePenalty *
      vaguePenalty *
      leadBoost *
      properBoost;

    let display = term;
    let best = 0;
    for (const [surface, times] of entry.surfaces) {
      if (times > best) {
        best = times;
        display = surface;
      }
    }

    results.push({ term, display, count: entry.count, score, spread, lead: entry.lead });
  }

  results.sort((a, b) => b.score - a.score || b.count - a.count || a.term.localeCompare(b.term));

  const limit = targetKeywordCount(total, amount);
  const top = results.slice(0, limit);
  const maxScore = top.length > 0 ? top[0].score : 1;
  return top.map((item) => ({ ...item, weight: maxScore > 0 ? item.score / maxScore : 0 }));
}

export default analyzeKeywords;
