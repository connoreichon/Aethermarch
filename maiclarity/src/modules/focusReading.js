/**
 * focusReading — modo de enfasis visual.
 *
 * Marca tipograficamente el arranque de determinadas palabras para que la
 * vista tenga un punto de anclaje al saltar de una a otra. Es una ayuda
 * visual, no un metodo cientifico: no prometemos velocidades ni milagros.
 *
 * IMPORTANTE: nunca modifica el texto limpio. Solo describe como pintarlo.
 */

export const FOCUS_INTENSITIES = ['low', 'medium', 'high'];

const PROFILES = {
  low: { minLength: 6, ratio: 0.33 },
  medium: { minLength: 4, ratio: 0.4 },
  high: { minLength: 2, ratio: 0.5 },
};

/**
 * Cuantos caracteres iniciales se enfatizan en una palabra.
 * Devuelve 0 si esa palabra no debe enfatizarse.
 */
export function focusHeadLength(word, intensity = 'medium') {
  const profile = PROFILES[intensity] || PROFILES.medium;
  const letters = word.replace(/[^\p{L}\p{N}]/gu, '');
  if (letters.length < profile.minLength) return 0;
  const head = Math.max(1, Math.round(word.length * profile.ratio));
  // Siempre queda al menos un caracter sin enfatizar: el contraste es el efecto.
  return Math.min(head, word.length - 1);
}

/**
 * Parte un fragmento de texto en piezas {text, strong} listas para pintar.
 * Los espacios y signos viajan en piezas normales, nunca se pierden.
 *
 * @param {string} text
 * @param {string} intensity
 * @returns {{text: string, strong: boolean}[]}
 */
export function splitFocusPieces(text, intensity = 'medium') {
  if (!text) return [];
  const pieces = [];
  const parts = text.split(/(\s+)/);
  for (const part of parts) {
    if (!part) continue;
    if (/^\s+$/.test(part)) {
      pushPiece(pieces, part, false);
      continue;
    }
    const head = focusHeadLength(part, intensity);
    if (head <= 0) {
      pushPiece(pieces, part, false);
      continue;
    }
    pushPiece(pieces, part.slice(0, head), true);
    pushPiece(pieces, part.slice(head), false);
  }
  return pieces;
}

function pushPiece(pieces, text, strong) {
  if (!text) return;
  const last = pieces[pieces.length - 1];
  if (last && last.strong === strong) {
    last.text += text;
    return;
  }
  pieces.push({ text, strong });
}

export default splitFocusPieces;
