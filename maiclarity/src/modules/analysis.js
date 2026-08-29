/**
 * analysis — orquesta el analisis del texto limpio en UNA sola pasada de
 * tokenizacion, compartida por terminos clave, repeticiones y estadisticas.
 *
 * Reutiliza el resultado anterior cuando el texto no ha cambiado, para que
 * mover un control (por ejemplo la cantidad de terminos clave) no obligue a
 * recorrer el documento entero otra vez.
 */
import { tokenize } from './tokenizer.js';
import { resolveLanguage } from './language.js';
import { analyzeKeywords } from './keywordAnalyzer.js';
import { analyzeRepetitions } from './repetitionAnalyzer.js';
import { computeStats } from './textStats.js';

/**
 * @param {string} text texto limpio
 * @param {{langSetting?: string, amount?: string, previous?: object}} options
 */
export function analyzeText(text, { langSetting = 'auto', amount = 'medium', previous = null } = {}) {
  const reusable =
    previous && previous.text === text && previous.langSetting === langSetting ? previous : null;

  const tokens = reusable ? reusable.tokens : tokenize(text);
  const lang = reusable ? reusable.lang : resolveLanguage(langSetting, tokens);
  const repetitions = reusable ? reusable.repetitions : analyzeRepetitions(text, tokens, lang);
  const stats = reusable ? reusable.stats : computeStats(text, tokens);
  const keywords = analyzeKeywords(tokens, { lang, amount });

  return { text, langSetting, tokens, lang, keywords, repetitions, stats };
}

export default analyzeText;
