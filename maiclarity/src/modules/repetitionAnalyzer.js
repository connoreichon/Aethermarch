/**
 * repetitionAnalyzer — repeticiones y posibles muletillas.
 *
 * Solo avisa. Nunca reescribe el texto.
 */
import { isWordy, splitBlocks } from './tokenizer.js';
import { getStopwords, getFillers } from './language.js';

const PHRASE_SIZE = 3;
const MIN_PHRASE_HITS = 3;
const MIN_START_HITS = 3;

/**
 * Palabras repetidas por encima de lo razonable para la longitud del texto.
 */
export function findOverusedWords(tokens, lang, limit = 8) {
  const stopwords = getStopwords(lang);
  const total = tokens.length;
  if (total < 40) return [];
  const threshold = Math.max(4, Math.round(total * 0.008));
  const counts = new Map();

  for (const token of tokens) {
    if (stopwords.has(token.lower) || !isWordy(token)) continue;
    const entry = counts.get(token.lower) || { count: 0, display: token.value };
    entry.count += 1;
    counts.set(token.lower, entry);
  }

  return [...counts.entries()]
    .filter(([, entry]) => entry.count >= threshold)
    .map(([term, entry]) => ({
      term,
      display: entry.display,
      count: entry.count,
      density: entry.count / total,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/** Secuencias cortas repetidas (3 palabras) que no sean solo palabras vacias. */
export function findRepeatedPhrases(tokens, lang, limit = 6) {
  const stopwords = getStopwords(lang);
  if (tokens.length < PHRASE_SIZE * MIN_PHRASE_HITS) return [];
  const counts = new Map();

  for (let i = 0; i + PHRASE_SIZE <= tokens.length; i += 1) {
    const slice = tokens.slice(i, i + PHRASE_SIZE);
    if (slice.every((t) => stopwords.has(t.lower))) continue;
    const key = slice.map((t) => t.lower).join(' ');
    const entry = counts.get(key) || { count: 0, display: slice.map((t) => t.value).join(' ') };
    entry.count += 1;
    counts.set(key, entry);
  }

  return [...counts.entries()]
    .filter(([, entry]) => entry.count >= MIN_PHRASE_HITS)
    .map(([phrase, entry]) => ({ phrase, display: entry.display, count: entry.count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/** Parrafos que empiezan siempre igual. */
export function findRepeatedStarts(text, limit = 4) {
  const blocks = splitBlocks(text);
  if (blocks.length < MIN_START_HITS) return [];
  const counts = new Map();

  for (const block of blocks) {
    const words = block.split(/\s+/).slice(0, 2).join(' ').toLowerCase().replace(/[^\p{L}\s]/gu, '');
    if (words.length < 3) continue;
    const entry = counts.get(words) || { count: 0, display: block.split(/\s+/).slice(0, 2).join(' ') };
    entry.count += 1;
    counts.set(words, entry);
  }

  return [...counts.values()]
    .filter((entry) => entry.count >= MIN_START_HITS)
    .map((entry) => ({ display: entry.display, count: entry.count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * Muletillas del diccionario local. Devuelve solo las que aparecen.
 */
export function findFillers(text, lang) {
  if (!text) return [];
  const list = getFillers(lang);
  const found = [];
  for (const phrase of list) {
    const pattern = new RegExp(
      `(?:^|[^\\p{L}\\p{N}])(${escapeRegExp(phrase)})(?![\\p{L}\\p{N}])`,
      'giu'
    );
    let count = 0;
    let match = pattern.exec(text);
    while (match !== null) {
      count += 1;
      pattern.lastIndex = match.index + Math.max(1, match[0].length - 1);
      match = pattern.exec(text);
    }
    if (count > 0) found.push({ phrase, count });
  }
  return found.sort((a, b) => b.count - a.count || a.phrase.localeCompare(b.phrase));
}

export function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Analisis completo de repeticiones.
 */
export function analyzeRepetitions(text, tokens, lang) {
  return {
    overused: findOverusedWords(tokens, lang),
    phrases: findRepeatedPhrases(tokens, lang),
    starts: findRepeatedStarts(text),
    fillers: findFillers(text, lang),
  };
}

export default analyzeRepetitions;
