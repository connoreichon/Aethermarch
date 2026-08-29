/**
 * styleEngine — convierte texto limpio + configuracion visual en un modelo
 * de segmentos listos para pintar.
 *
 * Es codigo puro: no toca el DOM y no modifica NUNCA el texto limpio.
 * El mismo modelo lo usan el renderizador (DOM seguro) y el exportador
 * (HTML escapado), de modo que lo que se ve es exactamente lo que se copia.
 */
import { escapeRegExp } from './repetitionAnalyzer.js';

/* ------------------------------------------------------------------ *
 *  Configuracion visual
 * ------------------------------------------------------------------ */

export const FONT_STACKS = {
  system: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  arial: 'Arial, "Helvetica Neue", Helvetica, sans-serif',
  verdana: 'Verdana, Geneva, sans-serif',
  georgia: 'Georgia, "Times New Roman", serif',
  times: '"Times New Roman", Times, serif',
  mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
};

export const LINE_HEIGHTS = { compact: 1.45, comfortable: 1.7, relaxed: 1.95 };
export const READING_WIDTHS = { narrow: '34rem', comfortable: '44rem', wide: '58rem' };
export const TEXT_SIZES = [14, 16, 17, 18, 20, 22, 24];

/** Paleta de resaltado. 'accent' se resuelve al color de marca del tema. */
export const HIGHLIGHT_COLORS = [
  { id: 'accent', light: '#0E7C72', dark: '#2EC4B6' },
  { id: 'amber', light: '#A8461A', dark: '#F0A03C' },
  { id: 'blue', light: '#1D4ED8', dark: '#60A5FA' },
  { id: 'violet', light: '#6D28D9', dark: '#A78BFA' },
  { id: 'rose', light: '#BE123C', dark: '#FB7185' },
  { id: 'green', light: '#15803D', dark: '#4ADE80' },
];

export const DEFAULT_STYLE_CONFIG = Object.freeze({
  preset: 'clean',
  font: 'system',
  size: 18,
  lineHeight: 'comfortable',
  width: 'comfortable',
  align: 'left',
  keywords: Object.freeze({
    enabled: false,
    amount: 'medium',
    color: 'accent',
    bold: true,
    italic: false,
    underline: false,
  }),
  focus: Object.freeze({ enabled: false, intensity: 'medium' }),
  customRules: Object.freeze([]),
});

export const PRESETS = {
  clean: {
    keywords: { enabled: false },
    focus: { enabled: false },
    lineHeight: 'comfortable',
    width: 'comfortable',
  },
  study: {
    keywords: { enabled: true, amount: 'medium', color: 'accent', bold: false, underline: true, italic: false },
    focus: { enabled: false },
    lineHeight: 'relaxed',
    width: 'comfortable',
  },
  focus: {
    keywords: { enabled: false },
    focus: { enabled: true, intensity: 'medium' },
    lineHeight: 'relaxed',
    width: 'comfortable',
  },
  keywords: {
    keywords: { enabled: true, amount: 'high', color: 'accent', bold: true, underline: false, italic: false },
    focus: { enabled: false },
    lineHeight: 'comfortable',
    width: 'comfortable',
  },
};

/** Aplica un preset sobre la configuracion actual sin perder lo no tocado. */
export function applyPreset(config, presetId) {
  const preset = PRESETS[presetId];
  if (!preset) return { ...config, preset: 'custom' };
  return {
    ...config,
    ...preset,
    preset: presetId,
    keywords: { ...config.keywords, ...preset.keywords },
    focus: { ...config.focus, ...preset.focus },
  };
}

export function resolveColor(colorId, theme = 'light') {
  const entry = HIGHLIGHT_COLORS.find((c) => c.id === colorId);
  if (entry) return theme === 'dark' ? entry.dark : entry.light;
  return colorId; // color personalizado (#rrggbb)
}

/* ------------------------------------------------------------------ *
 *  Reglas de resaltado
 * ------------------------------------------------------------------ */

const WORD_CHAR = /[\p{L}\p{N}]/u;

function styleOf(source) {
  return {
    color: source.color,
    bold: Boolean(source.bold),
    italic: Boolean(source.italic),
    underline: Boolean(source.underline),
    font: source.font || null,
  };
}

/**
 * Construye la lista de reglas activas. Las personalizadas tienen
 * prioridad sobre los terminos clave detectados automaticamente.
 */
export function buildRules(styleConfig, keywords = []) {
  const rules = [];
  const customRules = styleConfig.customRules || [];

  customRules.forEach((rule, index) => {
    const term = (rule.text || '').trim();
    if (!term) return;
    rules.push({
      id: rule.id,
      kind: 'custom',
      priority: index,
      terms: [term],
      style: styleOf(rule),
    });
  });

  if (styleConfig.keywords.enabled && keywords.length > 0) {
    rules.push({
      id: 'keywords',
      kind: 'keyword',
      priority: 1000,
      terms: keywords.map((k) => k.term),
      style: styleOf(styleConfig.keywords),
    });
  }

  return rules;
}

function isWholeWordMatch(text, start, end) {
  const before = start > 0 ? text[start - 1] : '';
  const after = end < text.length ? text[end] : '';
  if (before && WORD_CHAR.test(before)) return false;
  if (after && WORD_CHAR.test(after)) return false;
  return true;
}

function termPattern(term) {
  const source = term
    .trim()
    .split(/\s+/)
    .map(escapeRegExp)
    .join('\\s+');
  return new RegExp(source, 'giu');
}

/**
 * Todas las coincidencias de una regla dentro de una linea.
 * Siempre por palabra completa: la regla "pan" no pinta "pantalla".
 */
export function collectMatches(text, rule) {
  const found = [];
  for (const term of rule.terms) {
    if (!term) continue;
    const pattern = termPattern(term);
    let match = pattern.exec(text);
    while (match !== null) {
      const start = match.index;
      const end = start + match[0].length;
      if (match[0].length === 0) {
        pattern.lastIndex += 1;
      } else {
        if (isWholeWordMatch(text, start, end)) {
          found.push({ start, end, rule });
        }
        pattern.lastIndex = end;
      }
      match = pattern.exec(text);
    }
  }
  return found;
}

/** Resuelve solapes: gana la regla mas prioritaria y, a igualdad, la mas larga. */
export function mergeMatches(matches) {
  const sorted = matches.slice().sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start;
    if (a.rule.priority !== b.rule.priority) return a.rule.priority - b.rule.priority;
    return b.end - a.end;
  });
  const out = [];
  let cursor = -1;
  for (const match of sorted) {
    if (match.start < cursor) continue;
    out.push(match);
    cursor = match.end;
  }
  return out;
}

/** Corta una linea en segmentos {text, mark}. */
export function buildLineSegments(line, rules) {
  if (!line) return [];
  if (rules.length === 0) return [{ text: line, mark: null }];

  const matches = mergeMatches(rules.flatMap((rule) => collectMatches(line, rule)));
  if (matches.length === 0) return [{ text: line, mark: null }];

  const segments = [];
  let cursor = 0;
  for (const match of matches) {
    if (match.start > cursor) {
      segments.push({ text: line.slice(cursor, match.start), mark: null });
    }
    segments.push({
      text: line.slice(match.start, match.end),
      mark: { ruleId: match.rule.id, kind: match.rule.kind, ...match.rule.style },
    });
    cursor = match.end;
  }
  if (cursor < line.length) segments.push({ text: line.slice(cursor), mark: null });
  return segments;
}

/* ------------------------------------------------------------------ *
 *  Modelo del documento
 * ------------------------------------------------------------------ */

const LIST_LINE = /^\s*(?:[-*+•·▪◦‣–—]\s+|\d+[.)]\s+|[a-zA-Z][.)]\s+)/;

/**
 * @param {string} text texto limpio (no se modifica)
 * @param {object} styleConfig
 * @param {Array} keywords
 * @returns {{type: string, lines: Array<Array<{text:string, mark:object|null}>>}[]}
 */
export function buildStyledBlocks(text, styleConfig, keywords = []) {
  if (!text) return [];
  const rules = buildRules(styleConfig, keywords);
  return text
    .split(/\n{2,}/)
    .map((block) => block.replace(/\s+$/, ''))
    .filter((block) => block.trim().length > 0)
    .map((block) => {
      const rawLines = block.split('\n');
      const isList = rawLines.length > 0 && rawLines.every((line) => LIST_LINE.test(line));
      return {
        type: isList ? 'list' : 'paragraph',
        lines: rawLines.map((line) => buildLineSegments(line, rules)),
      };
    });
}

/** Estilo de contenedor derivado de la configuracion (compartido app/export). */
export function containerStyle(styleConfig) {
  return {
    fontFamily: FONT_STACKS[styleConfig.font] || FONT_STACKS.system,
    fontSize: `${styleConfig.size}px`,
    lineHeight: String(LINE_HEIGHTS[styleConfig.lineHeight] || LINE_HEIGHTS.comfortable),
    maxWidth: READING_WIDTHS[styleConfig.width] || READING_WIDTHS.comfortable,
    textAlign: styleConfig.align || 'left',
  };
}

export default buildStyledBlocks;
