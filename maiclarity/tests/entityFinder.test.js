import { describe, it, expect } from 'vitest';
import { findEntities, prioritise, ENTITY_KINDS } from '../src/modules/entityFinder.js';
import { analyzeKeywords } from '../src/modules/keywordAnalyzer.js';
import { tokenize } from '../src/modules/tokenizer.js';
import { buildStyledBlocks, DEFAULT_STYLE_CONFIG } from '../src/modules/styleEngine.js';

const textOf = (entities, kind) =>
  entities.filter((entity) => entity.kind === kind).map((entity) => entity.text.toLowerCase());

describe('fechas', () => {
  it('reconoce formatos numericos', () => {
    const found = findEntities('La reunion es el 12/03/2025 y el acta el 2025-04-01.', 'es');
    expect(textOf(found, 'date')).toContain('12/03/2025');
    expect(textOf(found, 'date')).toContain('2025-04-01');
  });

  it('reconoce fechas escritas en espanol', () => {
    const found = findEntities('Hay que entregarlo el 12 de marzo de 2025 sin falta.', 'es');
    expect(textOf(found, 'date')).toContain('12 de marzo de 2025');
  });

  it('reconoce fechas escritas en ingles', () => {
    const found = findEntities('The report is due on March 12, 2025 at the latest.', 'en');
    expect(textOf(found, 'date')).toContain('march 12, 2025');
  });

  it('caza un mes suelto aunque salga una sola vez', () => {
    const found = findEntities('El cliente quiere la propuesta cerrada antes de octubre.', 'es');
    expect(textOf(found, 'date')).toContain('octubre');
  });

  it('caza dias de la semana y anos', () => {
    const found = findEntities('Lo aprobaron el lunes y arranca en 2026.', 'es');
    expect(textOf(found, 'date')).toContain('lunes');
    expect(textOf(found, 'date')).toContain('2026');
  });
});

describe('importes y cifras', () => {
  it('reconoce porcentajes, moneda y unidades', () => {
    const found = findEntities(
      'Subimos un 20% el presupuesto: 1.500 € en total, durante 3 meses.',
      'es'
    );
    const amounts = textOf(found, 'amount');
    expect(amounts).toContain('20%');
    expect(amounts.some((value) => value.includes('1.500'))).toBe(true);
    expect(amounts).toContain('3 meses');
  });

  it('se queda con el simbolo de la moneda', () => {
    const found = findEntities('El presupuesto es de 12.500 € este trimestre.', 'es');
    expect(textOf(found, 'amount')).toContain('12.500 €');
  });

  it('reconoce moneda delante de la cifra', () => {
    const found = findEntities('The budget is $12,000 for the quarter.', 'en');
    expect(textOf(found, 'amount').some((value) => value.includes('12,000'))).toBe(true);
  });
});

describe('plazos y nombres', () => {
  it('reconoce palabras de plazo', () => {
    const found = findEntities('Es urgente: la fecha limite no se puede mover.', 'es');
    const deadlines = textOf(found, 'deadline');
    expect(deadlines).toContain('urgente');
    expect(deadlines).toContain('fecha limite');
  });

  it('reconoce nombres propios a media frase', () => {
    const found = findEntities('El informe lo revisa Marta antes de enviarlo a Vodafone.', 'es');
    const names = textOf(found, 'name');
    expect(names).toContain('marta');
    expect(names).toContain('vodafone');
  });

  it('un nombre no cruza el salto de parrafo', () => {
    const found = findEntities('Contrato con Vodafone\n\nEl cliente firma manana.', 'es');
    expect(textOf(found, 'name')).toContain('vodafone');
    expect(textOf(found, 'name')).not.toContain('vodafone el');
  });

  it('no confunde el principio de frase con un nombre propio', () => {
    const found = findEntities('Enviamos el informe. Revisado y cerrado.', 'es');
    expect(textOf(found, 'name')).not.toContain('revisado');
  });

  it('reconoce siglas utiles y descarta el ruido', () => {
    const found = findEntities('Aplica el IVA segun el RGPD, ok.', 'es');
    const acronyms = textOf(found, 'acronym');
    expect(acronyms).toContain('iva');
    expect(acronyms).toContain('rgpd');
    expect(acronyms).not.toContain('ok');
  });
});

describe('recorte y orden', () => {
  it('pone delante lo que obliga a decidir', () => {
    const entities = prioritise([
      { text: 'Marta', kind: 'name', count: 1 },
      { text: '12 de marzo', kind: 'date', count: 1 },
    ]);
    expect(entities[0].kind).toBe('date');
  });

  it('descarta lo que ya esta dentro de algo mayor', () => {
    const entities = prioritise([
      { text: '12 de marzo de 2025', kind: 'date', count: 1 },
      { text: 'marzo', kind: 'date', count: 1 },
    ]);
    expect(entities).toHaveLength(1);
  });

  it('no inunda el documento', () => {
    const many = Array.from({ length: 60 }, (_, i) => ({
      text: `Nombre${i}`,
      kind: 'name',
      count: 1,
    }));
    expect(prioritise(many).length).toBeLessThanOrEqual(26);
  });

  it('devuelve vacio con textos minusculos', () => {
    expect(findEntities('hola', 'es')).toEqual([]);
    expect(findEntities('', 'es')).toEqual([]);
  });

  it('solo usa tipos conocidos', () => {
    const found = findEntities('El 12/03/2025 pagamos 300 € a Marta. Es urgente.', 'es');
    for (const entity of found) expect(ENTITY_KINDS).toContain(entity.kind);
  });
});

describe('los datos se pintan en el texto', () => {
  const config = {
    ...DEFAULT_STYLE_CONFIG,
    keywords: { ...DEFAULT_STYLE_CONFIG.keywords, enabled: false },
    entities: { ...DEFAULT_STYLE_CONFIG.entities, enabled: true, color: 'amber' },
    focus: { ...DEFAULT_STYLE_CONFIG.focus },
    customRules: [],
  };

  it('marca una fecha que aparece una sola vez', () => {
    const text = 'La propuesta se entrega antes de octubre y no se movera.';
    const entities = findEntities(text, 'es');
    const blocks = buildStyledBlocks(text, config, [], entities);
    const marked = blocks
      .flatMap((block) => block.lines.flat())
      .filter((segment) => segment.mark)
      .map((segment) => segment.text.toLowerCase());
    expect(marked).toContain('octubre');
  });

  it('no altera el texto al marcarlos', () => {
    const text = 'Pagamos 300 € el lunes.';
    const blocks = buildStyledBlocks(text, config, [], findEntities(text, 'es'));
    const rebuilt = blocks
      .map((block) => block.lines.map((line) => line.map((s) => s.text).join('')).join('\n'))
      .join('\n\n');
    expect(rebuilt).toBe(text);
  });
});

describe('terminos clave con mas criterio', () => {
  it('penaliza las palabras comodin frente a las que dicen algo', () => {
    const text = [
      'Presupuesto de la campana para el cliente.',
      'La linea de la linea de la linea del documento.',
      'El presupuesto del cliente sube y el presupuesto manda.',
    ].join(' ');
    const keywords = analyzeKeywords(tokenize(text), { lang: 'es', amount: 'high' });
    const terms = keywords.map((k) => k.term);
    // "linea" sale mas veces que "presupuesto" y aun asi no manda.
    expect(terms[0]).toBe('presupuesto');
    const linea = terms.indexOf('linea');
    expect(linea === -1 || linea > terms.indexOf('presupuesto')).toBe(true);
  });

  it('sube lo que aparece en la entradilla', () => {
    const text = 'Contrato de mantenimiento\n\nEl acuerdo cubre el mantenimiento anual del equipo.';
    const sinContexto = analyzeKeywords(tokenize(text), { lang: 'es' });
    const conContexto = analyzeKeywords(tokenize(text), { lang: 'es', leadEnd: 26 });
    const puntua = (list, term) => (list.find((k) => k.term === term) || { score: 0 }).score;
    expect(puntua(conContexto, 'mantenimiento')).toBeGreaterThan(puntua(sinContexto, 'mantenimiento'));
  });
});
