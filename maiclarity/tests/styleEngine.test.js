import { describe, it, expect } from 'vitest';
import {
  buildStyledBlocks,
  buildLineSegments,
  buildRules,
  applyPreset,
  DEFAULT_STYLE_CONFIG,
  PRESETS,
} from '../src/modules/styleEngine.js';
import { splitFocusPieces, focusHeadLength } from '../src/modules/focusReading.js';
import { cleanText } from '../src/modules/textCleaner.js';

const config = (patch = {}) => ({
  ...DEFAULT_STYLE_CONFIG,
  keywords: { ...DEFAULT_STYLE_CONFIG.keywords, ...(patch.keywords || {}) },
  focus: { ...DEFAULT_STYLE_CONFIG.focus, ...(patch.focus || {}) },
  customRules: patch.customRules || [],
});

const flatten = (blocks) =>
  blocks.map((block) => block.lines.map((line) => line.map((s) => s.text).join('')).join('\n')).join('\n\n');

const marks = (blocks) =>
  blocks.flatMap((block) => block.lines.flatMap((line) => line.filter((s) => s.mark)));

describe('resaltado de palabras propias', () => {
  const rule = { id: 'r1', text: 'cliente', color: 'amber', bold: true, underline: true };

  it('marca todas las apariciones', () => {
    const text = 'El cliente llamo. Otro cliente escribio. CLIENTE en mayusculas.';
    const found = marks(buildStyledBlocks(text, config({ customRules: [rule] })));
    expect(found).toHaveLength(3);
    expect(found.every((segment) => segment.mark.bold)).toBe(true);
    expect(found.every((segment) => segment.mark.underline)).toBe(true);
    expect(found.every((segment) => segment.mark.color === 'amber')).toBe(true);
  });

  it('no pinta dentro de una palabra mayor', () => {
    const panRule = { id: 'r2', text: 'pan', color: 'blue' };
    const found = marks(buildStyledBlocks('pantalla con pan y pancarta', config({ customRules: [panRule] })));
    expect(found).toHaveLength(1);
    expect(found[0].text).toBe('pan');
  });

  it('respeta las frases completas', () => {
    const phrase = { id: 'r3', text: 'cliente premium', color: 'violet' };
    const found = marks(
      buildStyledBlocks('un cliente premium y un cliente normal', config({ customRules: [phrase] }))
    );
    expect(found).toHaveLength(1);
    expect(found[0].text).toBe('cliente premium');
  });

  it('la regla propia gana a los terminos clave', () => {
    const keywords = [{ term: 'cliente', display: 'cliente', count: 3, weight: 1 }];
    const blocks = buildStyledBlocks(
      'El cliente decide',
      config({ customRules: [rule], keywords: { enabled: true } }),
      keywords
    );
    expect(marks(blocks)[0].mark.kind).toBe('custom');
  });

  it('no altera el texto', () => {
    const text = 'El cliente llamo dos veces.';
    expect(flatten(buildStyledBlocks(text, config({ customRules: [rule] })))).toBe(text);
  });
});

describe('terminos clave resaltados', () => {
  const keywords = [
    { term: 'presupuesto', display: 'presupuesto', count: 4, weight: 1 },
    { term: 'campana', display: 'campana', count: 2, weight: 0.6 },
  ];

  it('aplica color, negrita, cursiva y subrayado a la vez', () => {
    const blocks = buildStyledBlocks(
      'El presupuesto de la campana',
      config({ keywords: { enabled: true, bold: true, italic: true, underline: true, color: 'blue' } }),
      keywords
    );
    const found = marks(blocks);
    expect(found).toHaveLength(2);
    expect(found[0].mark).toMatchObject({
      bold: true,
      italic: true,
      underline: true,
      color: 'blue',
    });
  });

  it('no resalta nada si estan desactivados', () => {
    const blocks = buildStyledBlocks('El presupuesto', config(), keywords);
    expect(marks(blocks)).toHaveLength(0);
  });

  it('cambiar el color no toca el texto limpio', () => {
    const source = 'El presupuesto de la campana';
    const a = buildStyledBlocks(source, config({ keywords: { enabled: true, color: 'rose' } }), keywords);
    const b = buildStyledBlocks(source, config({ keywords: { enabled: true, color: 'green' } }), keywords);
    expect(flatten(a)).toBe(source);
    expect(flatten(b)).toBe(source);
  });
});

describe('estructura del modelo', () => {
  it('separa parrafos y detecta listas', () => {
    const { text } = cleanText('Titulo del bloque\n\n- Uno\n- Dos');
    const blocks = buildStyledBlocks(text, config());
    expect(blocks).toHaveLength(2);
    expect(blocks[1].type).toBe('list');
  });

  it('conserva los saltos internos de una lista', () => {
    const blocks = buildStyledBlocks('- Uno\n- Dos\n- Tres', config());
    expect(blocks[0].lines).toHaveLength(3);
  });
});

describe('lectura enfocada', () => {
  it('no modifica el texto', () => {
    const text = 'Una frase cualquiera para comprobarlo.';
    const withFocus = buildStyledBlocks(text, config({ focus: { enabled: true } }));
    expect(flatten(withFocus)).toBe(text);
    const pieces = splitFocusPieces(text, 'medium');
    expect(pieces.map((p) => p.text).join('')).toBe(text);
  });

  it('enfatiza mas cuanto mayor es la intensidad', () => {
    expect(focusHeadLength('documento', 'low')).toBeLessThan(focusHeadLength('documento', 'high'));
  });

  it('deja sin enfatizar las palabras muy cortas', () => {
    expect(focusHeadLength('de', 'low')).toBe(0);
    expect(focusHeadLength('y', 'high')).toBe(0);
  });

  it('siempre deja algun caracter sin enfasis', () => {
    for (const word of ['casa', 'presupuesto', 'ab']) {
      expect(focusHeadLength(word, 'high')).toBeLessThan(word.length);
    }
  });
});

describe('presets', () => {
  it('activan lo que prometen', () => {
    expect(applyPreset(config(), 'focus').focus.enabled).toBe(true);
    expect(applyPreset(config(), 'keywords').keywords.enabled).toBe(true);
    expect(applyPreset(config(), 'clean').keywords.enabled).toBe(false);
  });

  it('conservan los ajustes que no tocan', () => {
    const custom = { ...config(), font: 'georgia', size: 22 };
    const next = applyPreset(custom, 'study');
    expect(next.font).toBe('georgia');
    expect(next.size).toBe(22);
  });

  it('todos los presets declarados existen', () => {
    for (const id of ['clean', 'study', 'focus', 'keywords']) {
      expect(PRESETS[id]).toBeTruthy();
    }
  });
});

describe('reglas activas', () => {
  it('ignora las reglas vacias', () => {
    const rules = buildRules(config({ customRules: [{ id: 'x', text: '   ' }] }));
    expect(rules).toHaveLength(0);
  });

  it('sin reglas devuelve un unico segmento', () => {
    expect(buildLineSegments('texto plano', [])).toEqual([{ text: 'texto plano', mark: null }]);
  });
});
