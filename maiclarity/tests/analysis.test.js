import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cleanText } from '../src/modules/textCleaner.js';
import { tokenize } from '../src/modules/tokenizer.js';
import { detectLanguage } from '../src/modules/language.js';
import { analyzeKeywords, targetKeywordCount } from '../src/modules/keywordAnalyzer.js';
import { analyzeRepetitions, findFillers } from '../src/modules/repetitionAnalyzer.js';
import { computeStats } from '../src/modules/textStats.js';
import { analyzeText } from '../src/modules/analysis.js';

const here = dirname(fileURLToPath(import.meta.url));
const fixture = (name) => readFileSync(resolve(here, 'fixtures', name), 'utf8');
const cleanedEs = cleanText(fixture('messy-es.txt')).text;
const cleanedEn = cleanText(fixture('messy-en.txt')).text;

describe('deteccion de idioma', () => {
  it('reconoce el espanol', () => {
    expect(detectLanguage(tokenize(cleanedEs))).toBe('es');
  });

  it('reconoce el ingles', () => {
    expect(detectLanguage(tokenize(cleanedEn))).toBe('en');
  });
});

describe('terminos clave en espanol', () => {
  const keywords = analyzeKeywords(tokenize(cleanedEs), { lang: 'es' });
  const terms = keywords.map((k) => k.term);

  it('saca los terminos del documento', () => {
    expect(terms).toContain('cliente');
    expect(terms).toContain('presupuesto');
    expect(terms).toContain('marketing');
  });

  it('no propone palabras vacias', () => {
    for (const stopword of ['de', 'la', 'que', 'el', 'un']) {
      expect(terms).not.toContain(stopword);
    }
  });

  it('cuenta las apariciones reales', () => {
    const cliente = keywords.find((k) => k.term === 'cliente');
    expect(cliente.count).toBeGreaterThanOrEqual(4);
  });

  it('ordena por relevancia y normaliza el peso', () => {
    expect(keywords[0].weight).toBe(1);
    for (let i = 1; i < keywords.length; i += 1) {
      expect(keywords[i].score).toBeLessThanOrEqual(keywords[i - 1].score);
    }
  });
});

describe('terminos clave en ingles', () => {
  const terms = analyzeKeywords(tokenize(cleanedEn), { lang: 'en' }).map((k) => k.term);

  it('saca los terminos del documento', () => {
    expect(terms).toContain('client');
    expect(terms).toContain('budget');
    expect(terms).toContain('marketing');
  });

  it('no propone palabras vacias', () => {
    for (const stopword of ['the', 'of', 'and', 'to', 'is']) {
      expect(terms).not.toContain(stopword);
    }
  });
});

describe('cantidad de terminos', () => {
  it('crece con la longitud del documento', () => {
    expect(targetKeywordCount(50)).toBeLessThan(targetKeywordCount(2000));
  });

  it('responde al ajuste de cantidad', () => {
    expect(targetKeywordCount(800, 'low')).toBeLessThan(targetKeywordCount(800, 'medium'));
    expect(targetKeywordCount(800, 'high')).toBeGreaterThan(targetKeywordCount(800, 'medium'));
  });

  it('nunca inunda el documento', () => {
    expect(targetKeywordCount(100000, 'high')).toBeLessThanOrEqual(24);
  });
});

describe('repeticiones y muletillas', () => {
  const repetitions = analyzeRepetitions(cleanedEs, tokenize(cleanedEs), 'es');

  it('detecta palabras repetidas', () => {
    const words = repetitions.overused.map((item) => item.term);
    expect(words).toContain('presupuesto');
  });

  it('detecta muletillas en espanol', () => {
    const fillers = repetitions.fillers.map((item) => item.phrase);
    expect(fillers).toContain('basicamente');
    expect(fillers).toContain('obviamente');
    expect(fillers).toContain('realmente');
  });

  it('detecta muletillas en ingles', () => {
    const fillers = findFillers(cleanedEn, 'en').map((item) => item.phrase);
    expect(fillers).toContain('basically');
    expect(fillers).toContain('actually');
  });

  it('no cuenta una muletilla dentro de otra palabra', () => {
    expect(findFillers('Es una realidad concreta.', 'es')).toHaveLength(0);
  });
});

describe('estadisticas', () => {
  const stats = computeStats(cleanedEs, tokenize(cleanedEs));

  it('cuenta palabras, caracteres y parrafos', () => {
    expect(stats.words).toBeGreaterThan(100);
    expect(stats.characters).toBe(cleanedEs.length);
    expect(stats.paragraphs).toBeGreaterThanOrEqual(6);
  });

  it('estima al menos un minuto de lectura', () => {
    expect(stats.minutes).toBeGreaterThanOrEqual(1);
  });

  it('devuelve ceros con texto vacio', () => {
    const empty = computeStats('', []);
    expect(empty.words).toBe(0);
    expect(empty.minutes).toBe(0);
  });
});

describe('reutilizacion del analisis', () => {
  it('reaprovecha la tokenizacion cuando solo cambia la cantidad', () => {
    const first = analyzeText(cleanedEs, { amount: 'medium' });
    const second = analyzeText(cleanedEs, { amount: 'high', previous: first });
    expect(second.tokens).toBe(first.tokens); // misma referencia: no se retokeniza
    expect(second.keywords.length).toBeGreaterThan(first.keywords.length);
  });

  it('rehace el analisis si cambia el texto', () => {
    const first = analyzeText(cleanedEs, {});
    const second = analyzeText(cleanedEn, { previous: first });
    expect(second.tokens).not.toBe(first.tokens);
    expect(second.lang).toBe('en');
  });
});
