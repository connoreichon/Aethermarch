import { describe, it, expect } from 'vitest';
import {
  itemsToLines,
  linesToText,
  stripRunningLines,
  pagesToText,
} from '../src/modules/pdfLayout.js';

/** Fragmento como los que devuelve pdf.js: texto, posicion y cuerpo. */
function item(str, x, y, size = 10, width = null) {
  return {
    str,
    width: width === null ? str.length * size * 0.5 : width,
    height: size,
    transform: [size, 0, 0, size, x, y],
  };
}

/** Pagina de lineas normales, una debajo de otra. */
function page(texts, { x = 50, top = 700, leading = 14, size = 10 } = {}) {
  return texts.map((text, index) => item(text, x, top - index * leading, size));
}

describe('agrupar fragmentos en lineas', () => {
  it('junta lo que esta a la misma altura', () => {
    const lines = itemsToLines([item('Hola', 50, 700), item('mundo', 90, 700)]);
    expect(lines).toHaveLength(1);
    expect(lines[0].text).toBe('Hola mundo');
  });

  it('separa lo que esta en alturas distintas', () => {
    const lines = itemsToLines([item('Primera', 50, 700), item('Segunda', 50, 686)]);
    expect(lines.map((l) => l.text)).toEqual(['Primera', 'Segunda']);
  });

  it('pone el espacio que el PDF no trae', () => {
    // Dos fragmentos separados fisicamente pero sin espacio en el texto.
    const lines = itemsToLines([item('Total', 50, 700, 10, 25), item('105.000', 90, 700)]);
    expect(lines[0].text).toBe('Total 105.000');
  });

  it('no inventa espacios donde no los hay', () => {
    const lines = itemsToLines([item('Presu', 50, 700, 10, 25), item('puesto', 75, 700)]);
    expect(lines[0].text).toBe('Presupuesto');
  });

  it('ignora fragmentos vacios', () => {
    expect(itemsToLines([item('   ', 50, 700)])).toHaveLength(0);
    expect(itemsToLines([])).toEqual([]);
    expect(itemsToLines(null)).toEqual([]);
  });
});

describe('saltos de linea y de parrafo', () => {
  it('un interlineado normal es solo un salto de linea', () => {
    const text = linesToText(itemsToLines(page(['Primera linea', 'Segunda linea', 'Tercera'])));
    expect(text).toBe('Primera linea\nSegunda linea\nTercera');
  });

  it('un hueco mayor abre parrafo', () => {
    const lines = itemsToLines([
      item('Final del primer parrafo', 50, 700),
      item('Sigue la linea', 50, 686),
      item('Empieza otro parrafo', 50, 640), // hueco muy superior al normal
    ]);
    const text = linesToText(lines);
    expect(text).toContain('Sigue la linea\n\nEmpieza otro parrafo');
  });

  it('un cambio de cuerpo de letra separa titulo y texto', () => {
    const lines = itemsToLines([
      item('TITULO DEL DOCUMENTO', 50, 700, 18),
      item('Primera linea del cuerpo', 50, 680, 10),
    ]);
    expect(linesToText(lines)).toBe('TITULO DEL DOCUMENTO\n\nPrimera linea del cuerpo');
  });

  it('detecta el salto a otra columna', () => {
    const lines = itemsToLines([
      item('Final de la columna izquierda', 50, 400, 10),
      item('Arriba de la columna derecha', 320, 700, 10),
    ]);
    // Sube y se va a la derecha: aqui la referencia es el hueco negativo.
    expect(linesToText(lines).split('\n').length).toBeGreaterThan(1);
  });

  it('una sola linea se devuelve tal cual', () => {
    expect(linesToText(itemsToLines([item('Solo esto', 50, 700)]))).toBe('Solo esto');
    expect(linesToText([])).toBe('');
  });
});

describe('cabeceras y pies repetidos', () => {
  // El contenido de cada pagina es distinto de verdad: si fuera formulaico
  // ("Contenido de la pagina 1", "... 2") tendria la misma huella que una
  // plantilla y el recorte lo trataria como tal, con razon.
  const CUERPOS = [
    'Contenido propio sobre el alcance del proyecto',
    'Detalle de las condiciones economicas acordadas',
    'Calendario previsto para cada una de las fases',
    'Responsabilidades de las partes implicadas',
    'Anexos y documentacion complementaria',
  ];
  const conPlantilla = (numeros) =>
    numeros.map((n) => [
      { text: 'Informe anual 2025' },
      { text: CUERPOS[n - 1] },
      { text: `Pagina ${n} de 5` },
    ]);

  it('quita lo que se repite en todas las paginas', () => {
    const limpio = stripRunningLines(conPlantilla([1, 2, 3, 4, 5]));
    for (const lines of limpio) {
      expect(lines.map((l) => l.text)).toHaveLength(1);
      expect(CUERPOS).toContain(lines[0].text);
    }
  });

  it('trata "Pagina 1 de 5" y "Pagina 2 de 5" como la misma plantilla', () => {
    const limpio = stripRunningLines(conPlantilla([1, 2, 3]));
    expect(limpio.every((lines) => lines.every((l) => !l.text.startsWith('Pagina')))).toBe(true);
  });

  it('no toca documentos de una o dos paginas', () => {
    const dos = conPlantilla([1, 2]);
    expect(stripRunningLines(dos)).toEqual(dos);
  });

  it('nunca deja una pagina vacia', () => {
    const soloPlantilla = [1, 2, 3].map(() => [{ text: 'Informe anual 2025' }]);
    const limpio = stripRunningLines(soloPlantilla);
    expect(limpio.every((lines) => lines.length > 0)).toBe(true);
  });

  it('no borra una linea repetida que esta en medio del texto', () => {
    // La linea repetida esta en el centro, lejos de los bordes.
    const pages = CUERPOS.slice(0, 3).map((cuerpo, i) => [
      { text: `Apartado sobre ${cuerpo}` },
      { text: cuerpo },
      { text: 'Firmado por la direccion' },
      { text: `Cierre del apartado ${cuerpo}` },
      { text: `Nota final ${i} distinta en cada pagina` },
    ]);
    const limpio = stripRunningLines(pages);
    expect(limpio[0].map((l) => l.text)).toContain('Firmado por la direccion');
  });
});

describe('documento completo', () => {
  it('separa las paginas con una linea en blanco', () => {
    const text = pagesToText([
      itemsToLines(page(['Pagina uno'])),
      itemsToLines(page(['Pagina dos'])),
    ]);
    expect(text).toBe('Pagina uno\n\nPagina dos');
  });

  it('aguanta paginas vacias y entradas raras', () => {
    expect(pagesToText([])).toBe('');
    expect(pagesToText([[], []])).toBe('');
    expect(pagesToText(null)).toBe('');
  });
});
