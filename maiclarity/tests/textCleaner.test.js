import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  cleanText,
  joinBrokenWords,
  joinWrappedLines,
  fixPunctuationSpacing,
  normalizeChars,
  isStructuralLine,
} from '../src/modules/textCleaner.js';

const here = dirname(fileURLToPath(import.meta.url));
const fixture = (name) => readFileSync(resolve(here, 'fixtures', name), 'utf8');

describe('palabras partidas', () => {
  it('une una palabra cortada por guion al final de linea', () => {
    const { text } = cleanText('Este docu-\nmento es una prueba.');
    expect(text).toBe('Este documento es una prueba.');
  });

  it('no une si la siguiente linea empieza en mayuscula', () => {
    const stats = { brokenWordsJoined: 0 };
    const out = joinBrokenWords('Garcia-\nLopez firmo', stats);
    expect(out).toContain('Garcia-');
    expect(stats.brokenWordsJoined).toBe(0);
  });

  it('respeta compuestos con acronimo en mayusculas', () => {
    const stats = { brokenWordsJoined: 0 };
    const out = joinBrokenWords('formato PDF-\nlector abierto', stats);
    expect(out).toContain('PDF-');
  });

  it('cuenta las uniones', () => {
    const { stats } = cleanText('Un docu-\nmento y un presu-\npuesto.');
    expect(stats.brokenWordsJoined).toBe(2);
  });
});

describe('saltos de linea del PDF', () => {
  it('reconstruye un parrafo partido en varias lineas', () => {
    const input = [
      'Este documento ha sido',
      'extraido desde un PDF y',
      'contiene saltos automaticos.',
    ].join('\n');
    expect(cleanText(input).text).toBe(
      'Este documento ha sido extraido desde un PDF y contiene saltos automaticos.'
    );
  });

  it('no convierte todo el documento en un unico parrafo', () => {
    const input = 'Primer parrafo de prueba.\n\nSegundo parrafo de prueba.';
    const { text } = cleanText(input);
    expect(text.split(/\n{2,}/)).toHaveLength(2);
  });

  it('mantiene separados dos parrafos reales', () => {
    const input = fixture('messy-es.txt');
    const { text } = cleanText(input);
    expect(text.split(/\n{2,}/).length).toBeGreaterThanOrEqual(6);
  });

  it('no fusiona una linea corta que termina en punto', () => {
    const stats = { lineBreaksFixed: 0 };
    const input = [
      'Una linea larga que ocupa practicamente todo el ancho disponible aqui',
      'Final corto.',
      'Otro parrafo que vuelve a ser largo y ocupa tambien todo el ancho util',
    ].join('\n');
    const out = joinWrappedLines(input, stats);
    expect(out.split('\n')).toHaveLength(2); // solo se une la primera con la segunda
  });
});

describe('estructura', () => {
  it('conserva una lista numerada', () => {
    const input = ['Lista de tareas:', '1. Primera', '2. Segunda', '3. Tercera'].join('\n');
    const { text } = cleanText(input);
    expect(text).toBe(input);
  });

  it('conserva los bullets', () => {
    const input = ['Pendiente:', '- Uno', '- Dos', '• Tres'].join('\n');
    expect(cleanText(input).text).toBe(input);
  });

  it('reconoce lineas estructurales', () => {
    expect(isStructuralLine('1. Primera')).toBe(true);
    expect(isStructuralLine('- Uno')).toBe(true);
    expect(isStructuralLine('> Una cita')).toBe(true);
    expect(isStructuralLine('Texto normal')).toBe(false);
  });

  it('mantiene el titulo separado del cuerpo en el fixture', () => {
    const { text } = cleanText(fixture('messy-es.txt'));
    expect(text.startsWith('INFORME TRIMESTRAL DE MARKETING')).toBe(true);
    expect(text.split('\n')[1]).toBe('');
  });

  it('conserva las tres lineas de la lista del fixture', () => {
    const { text } = cleanText(fixture('messy-en.txt'));
    expect(text).toContain('1. Grow incoming budget requests by 20%.');
    expect(text).toContain('2. Bring down the campaign cost per contact.');
    expect(text).toContain('3. Deliver the marketing report every month.');
  });
});

describe('espacios y puntuacion', () => {
  it('quita el espacio antes del punto', () => {
    expect(cleanText('Hola mundo .').text).toBe('Hola mundo.');
  });

  it('arregla la coma separada', () => {
    expect(cleanText('hola , mundo').text).toBe('hola, mundo');
  });

  it('anade el espacio que falta tras la coma', () => {
    expect(cleanText('cliente,premium').text).toBe('cliente, premium');
  });

  it('no toca los millares ni las horas', () => {
    const { text } = cleanText('Son 1,000 euros a las 10:30 en punto.');
    expect(text).toBe('Son 1,000 euros a las 10:30 en punto.');
  });

  it('colapsa los espacios multiples', () => {
    expect(cleanText('uno    dos').text).toBe('uno dos');
  });

  it('respeta URLs y emails', () => {
    const input = 'Escribe a hola@ejemplo.com o entra en https://ejemplo.com/ruta,ya';
    expect(cleanText(input).text).toContain('https://ejemplo.com/ruta,ya');
    expect(cleanText(input).text).toContain('hola@ejemplo.com');
  });

  it('no altera una ruta de Windows', () => {
    const input = 'El archivo esta en C:\\Users\\demo\\informe.txt y listo';
    expect(cleanText(input).text).toContain('C:\\Users\\demo\\informe.txt');
  });
});

describe('caracteres raros', () => {
  it('elimina invisibles y normaliza espacios duros', () => {
    const stats = { strangeCharsRemoved: 0, spacingIssuesRemoved: 0 };
    // El espacio duro pasa a espacio; el ancho cero y el guion blando desaparecen.
    const out = normalizeChars('a\u00A0b\u200Bc\u00ADd', stats);
    expect(out).toBe('a bcd');
    expect(stats.strangeCharsRemoved).toBe(3);
  });

  it('conserva acentos, enies y emojis', () => {
    const { text } = cleanText('Añadir mañana ✨ señal');
    expect(text).toBe('Añadir mañana ✨ señal');
  });
});

describe('recuento de arreglos', () => {
  it('devuelve un total coherente con el fixture', () => {
    const { totalFixes, stats } = cleanText(fixture('messy-es.txt'));
    expect(totalFixes).toBeGreaterThan(0);
    expect(stats.brokenWordsJoined).toBe(1);
    expect(stats.lineBreaksFixed).toBeGreaterThan(3);
  });

  it('no inventa arreglos en un texto ya limpio', () => {
    const { totalFixes } = cleanText('Un texto corto y limpio.');
    expect(totalFixes).toBe(0);
  });

  it('devuelve vacio ante una entrada vacia', () => {
    expect(cleanText('   ').text).toBe('');
    expect(cleanText(null).text).toBe('');
  });
});

describe('puntuacion aislada', () => {
  it('separa dos frases pegadas', () => {
    const stats = { spacingIssuesRemoved: 0 };
    expect(fixPunctuationSpacing('final.Otra frase', stats)).toBe('final. Otra frase');
  });
});
