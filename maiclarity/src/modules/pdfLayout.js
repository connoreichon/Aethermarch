/**
 * pdfLayout — reconstruye la estructura de una pagina a partir de DONDE
 * esta cada trozo de texto.
 *
 * pdf.js no devuelve parrafos: devuelve fragmentos con su posicion. Si solo
 * se concatenan, un titulo acaba pegado al parrafo siguiente y dos tarjetas
 * o dos columnas se funden en una frase absurda. Aqui se usan las
 * coordenadas para deducir lo que el PDF ya sabia:
 *
 *   - que fragmentos forman una misma linea (misma altura),
 *   - donde falta un espacio (hueco horizontal mayor que un espacio),
 *   - donde acaba un parrafo (salto vertical mayor de lo normal),
 *   - donde empieza un titulo (cambio de cuerpo de letra),
 *   - donde empieza otra columna (la lectura sube y se va a la izquierda),
 *   - que lineas son cabecera o pie repetidos y sobran.
 *
 * Codigo puro: entra una lista de fragmentos, sale texto. Sin pdf.js, sin
 * DOM y sin red, para poder probarlo pieza a pieza.
 */

/** Dos fragmentos son de la misma linea si su base cae dentro de esto. */
const LINE_TOLERANCE = 0.4;
/** Hueco horizontal, en cuerpos de letra, que ya cuenta como espacio. */
const SPACE_RATIO = 0.22;
/** Salto vertical, respecto al interlineado normal, que abre parrafo. */
const PARAGRAPH_RATIO = 1.55;
/** Cambio de cuerpo de letra, en puntos, que separa titulo de cuerpo. */
const SIZE_JUMP = 1.6;
/** Hueco horizontal, en cuerpos de letra, que ya no es un espacio sino
 *  una separacion de columna o de celda. */
const CELL_GAP_RATIO = 2.6;

function sizeOf(item) {
  const transform = item.transform || [];
  const scale = Math.abs(transform[3] || 0);
  if (scale > 0.5) return scale;
  if (item.height > 0.5) return item.height;
  return 10;
}

/**
 * Agrupa fragmentos en lineas con posicion y cuerpo de letra.
 * @param {Array} items items de getTextContent()
 * @returns {{text: string, x: number, y: number, size: number, right: number}[]}
 */
export function itemsToLines(items) {
  const usable = (items || []).filter(
    (item) => item && typeof item.str === 'string' && item.str.length > 0
  );
  if (usable.length === 0) return [];

  const lines = [];
  let current = null;

  for (const item of usable) {
    const transform = item.transform || [0, 0, 0, 0, 0, 0];
    const x = transform[4] || 0;
    const y = transform[5] || 0;
    const size = sizeOf(item);
    const width = typeof item.width === 'number' ? item.width : 0;

    const sameLine =
      current !== null && Math.abs(current.y - y) <= Math.max(1, current.size * LINE_TOLERANCE);

    if (!sameLine) {
      if (current) lines.push(current);
      current = { text: item.str, x, y, size, right: x + width, blank: !item.str.trim() };
    } else if (x - current.right > current.size * CELL_GAP_RATIO) {
      // Hueco enorme a la misma altura: no es un espacio, es otra celda o
      // el titulo de al lado. Juntarlos crearia frases que nadie escribio.
      lines.push(current);
      current = { text: item.str, x, y, size, right: x + width, blank: !item.str.trim() };
    } else {
      // Hueco horizontal: si es mayor que un espacio, hay que ponerlo.
      const gap = x - current.right;
      const needsSpace =
        gap > current.size * SPACE_RATIO &&
        !/\s$/.test(current.text) &&
        !/^\s/.test(item.str);
      current.text += (needsSpace ? ' ' : '') + item.str;
      current.right = Math.max(current.right, x + width);
      current.size = Math.max(current.size, size);
      if (item.str.trim()) current.blank = false;
    }
  }

  if (current) lines.push(current);
  return lines.filter((line) => line.text.trim().length > 0).map((line) => ({
    text: line.text.replace(/\s+$/, ''),
    x: line.x,
    y: line.y,
    size: line.size,
    right: line.right,
  }));
}

/**
 * Interlineado normal de la pagina.
 *
 * No vale la mediana: en una pagina con dos saltos, uno normal y uno de
 * parrafo, la mediana cae justo entre los dos y ya no distingue nada. Se
 * usa un percentil bajo, porque la mayoria de los saltos SON el
 * interlineado normal y los de parrafo son la excepcion.
 */
function typicalLeading(values) {
  if (values.length === 0) return 0;
  const sorted = values.slice().sort((a, b) => a - b);
  const index = Math.min(sorted.length - 1, Math.floor(sorted.length * 0.3));
  return sorted[index];
}

/**
 * Decide donde hay salto de linea y donde salto de parrafo.
 *
 * Se respeta el orden en que el PDF dibuja el texto. Probado con documentos
 * reales: reordenar por coordenadas (arriba-abajo) parece mas "correcto"
 * pero sale peor, porque Word, LaTeX y la impresion del navegador ya emiten
 * el texto en orden logico —columna entera, luego la siguiente— y ordenar
 * por altura entrelaza las dos columnas linea a linea.
 * @param {ReturnType<typeof itemsToLines>} lines
 */
export function linesToText(lines) {
  if (!lines || lines.length === 0) return '';
  if (lines.length === 1) return lines[0].text;

  // Interlineado normal de la pagina: la mediana de los saltos hacia abajo.
  const gaps = [];
  for (let i = 1; i < lines.length; i += 1) {
    const gap = lines[i - 1].y - lines[i].y;
    if (gap > 0) gaps.push(gap);
  }
  const leading = typicalLeading(gaps);

  let out = lines[0].text;
  for (let i = 1; i < lines.length; i += 1) {
    const previous = lines[i - 1];
    const line = lines[i];
    const gap = previous.y - line.y;

    let breakLevel = 1;
    if (leading > 0 && gap > leading * PARAGRAPH_RATIO) breakLevel = 2;
    if (Math.abs(line.size - previous.size) > SIZE_JUMP) breakLevel = 2;
    // La lectura sube y se va a la izquierda: es otra columna u otro bloque.
    if (gap < -leading && line.x < previous.x - previous.size) breakLevel = 2;

    out += (breakLevel === 2 ? '\n\n' : '\n') + line.text;
  }

  return out;
}

/** Normaliza una linea para comparar cabeceras entre paginas. */
function fingerprint(text) {
  return text
    .trim()
    .toLowerCase()
    .replace(/\d+/g, '#')
    .replace(/\s+/g, ' ');
}

/**
 * Quita cabeceras y pies repetidos (incluido "Pagina 3 de 12"), que en el
 * texto plano solo son ruido en mitad del documento.
 *
 * Trabaja sobre las lineas tal cual (objetos con .text), no sobre cadenas,
 * para no confundir dos lineas iguales en sitios distintos.
 *
 * @param {{text: string}[][]} pages lineas de cada pagina
 * @returns {{text: string}[][]}
 */
export function stripRunningLines(pages) {
  if (!pages || pages.length < 3) return pages || [];

  const counts = new Map();
  const bump = (line) => {
    const key = fingerprint(line.text);
    if (!key) return;
    counts.set(key, (counts.get(key) || 0) + 1);
  };

  for (const lines of pages) {
    if (lines.length === 0) continue;
    bump(lines[0]);
    if (lines.length > 1) bump(lines[1]);
    bump(lines[lines.length - 1]);
    if (lines.length > 1) bump(lines[lines.length - 2]);
  }

  // Repetida en la mayoria de las paginas: es plantilla, no contenido.
  const threshold = Math.max(3, Math.ceil(pages.length * 0.6));
  const repeated = new Set(
    [...counts.entries()].filter(([, count]) => count >= threshold).map(([key]) => key)
  );
  if (repeated.size === 0) return pages;

  // Como mucho dos lineas por borde: una cabecera de verdad no ocupa media
  // pagina, y comerse contenido es mucho peor que dejar un pie suelto.
  const MAX_EDGE = 2;
  return pages.map((lines) => {
    const kept = lines.slice();
    for (let i = 0; i < MAX_EDGE && kept.length > 1; i += 1) {
      if (!repeated.has(fingerprint(kept[0].text))) break;
      kept.shift();
    }
    for (let i = 0; i < MAX_EDGE && kept.length > 1; i += 1) {
      if (!repeated.has(fingerprint(kept[kept.length - 1].text))) break;
      kept.pop();
    }
    return kept.length > 0 ? kept : lines;
  });
}

/**
 * Texto completo del documento a partir de las lineas de cada pagina.
 * @param {ReturnType<typeof itemsToLines>[]} pages
 */
export function pagesToText(pages) {
  return stripRunningLines(pages || [])
    .map((lines) => linesToText(lines))
    .filter((text) => text.trim().length > 0)
    .join('\n\n');
}
