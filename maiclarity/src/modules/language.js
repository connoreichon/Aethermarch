/**
 * language — deteccion de idioma por coincidencia de palabras frecuentes.
 *
 * No pretende ser perfecta: solo elige el diccionario correcto de
 * stopwords y muletillas. El usuario siempre puede forzarlo a mano.
 */
import { LANG_MARKERS_ES, STOPWORDS_ES } from '../data/stopwords-es.js';
import { LANG_MARKERS_EN, STOPWORDS_EN } from '../data/stopwords-en.js';
import { FILLERS_ES } from '../data/fillers-es.js';
import { FILLERS_EN } from '../data/fillers-en.js';

export const SUPPORTED_LANGS = ['es', 'en'];

const MARKERS = {
  es: new Set(LANG_MARKERS_ES),
  en: new Set(LANG_MARKERS_EN),
};

/**
 * @param {import('./tokenizer.js').Token[]} tokens
 * @returns {'es'|'en'}
 */
export function detectLanguage(tokens) {
  if (!tokens || tokens.length === 0) return 'en';
  const sample = tokens.length > 800 ? tokens.slice(0, 800) : tokens;
  let es = 0;
  let en = 0;
  for (const token of sample) {
    if (MARKERS.es.has(token.lower)) es += 1;
    if (MARKERS.en.has(token.lower)) en += 1;
  }
  // Marcas ortograficas exclusivas del espanol como desempate suave.
  if (es === en) {
    const accented = sample.filter((t) => /[áéíóúñü¿¡]/i.test(t.value)).length;
    if (accented > 0) es += accented;
  }
  return es >= en && es > 0 ? 'es' : 'en';
}

/** Resuelve 'auto' a un idioma concreto. */
export function resolveLanguage(setting, tokens) {
  if (setting && setting !== 'auto' && SUPPORTED_LANGS.includes(setting)) return setting;
  return detectLanguage(tokens);
}

export function getStopwords(lang) {
  return lang === 'es' ? STOPWORDS_ES : STOPWORDS_EN;
}

export function getFillers(lang) {
  return lang === 'es' ? FILLERS_ES : FILLERS_EN;
}
