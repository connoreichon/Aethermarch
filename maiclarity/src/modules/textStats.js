/**
 * textStats — cifras del documento. Todas aproximadas se marcan como tales
 * en la interfaz (el tiempo de lectura lo es por definicion).
 */
import { splitBlocks } from './tokenizer.js';

/** Palabras por minuto usadas para la estimacion de lectura. */
export const WORDS_PER_MINUTE = 200;

export function computeStats(text, tokens) {
  const words = tokens.length;
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, '').length;
  const paragraphs = splitBlocks(text).length;
  const sentences = countSentences(text);
  const minutes = words === 0 ? 0 : Math.max(1, Math.round(words / WORDS_PER_MINUTE));
  return { words, characters, charactersNoSpaces, paragraphs, sentences, minutes };
}

function countSentences(text) {
  if (!text.trim()) return 0;
  const matches = text.match(/[^.!?…]+[.!?…]+(?:["'»”’)\]]+)?/g);
  if (!matches) return text.trim() ? 1 : 0;
  return matches.length;
}

export default computeStats;
