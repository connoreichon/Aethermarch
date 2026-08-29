/**
 * Banco de pruebas con PDFs reales.
 *
 *   node tests/harness/pdf-report.mjs "ruta/al.pdf" [--full]
 *
 * Reproduce EXACTAMENTE la cadena del producto fuera del navegador:
 * la misma extraccion que src/modules/pdfReader.js (items + hasEOL, paginas
 * separadas por linea en blanco), el mismo limpiador y el mismo analisis.
 * Lo unico que cambia es la build de pdf.js: la "legacy" corre en Node.
 *
 * No sube nada a ninguna parte: lee el archivo del disco y punto.
 */
import { readFileSync } from 'node:fs';
import { basename } from 'node:path';
import { cleanText, CLEAN_STAT_KEYS } from '../../src/modules/textCleaner.js';
import { analyzeText } from '../../src/modules/analysis.js';
import { itemsToLines, pagesToText } from '../../src/modules/pdfLayout.js';

const SCANNED_CHARS_PER_PAGE = 30; // mismo umbral que el producto

async function extract(path, { naive = false } = {}) {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const data = new Uint8Array(readFileSync(path));
  const task = pdfjs.getDocument({
    data,
    isEvalSupported: false,
    disableAutoFetch: true,
    useSystemFonts: true,
  });

  const started = Date.now();
  const doc = await task.promise;
  const pages = doc.numPages;
  const pageLines = [];
  const naiveChunks = [];

  try {
    for (let pageNumber = 1; pageNumber <= pages; pageNumber += 1) {
      const page = await doc.getPage(pageNumber);
      const content = await page.getTextContent();
      if (naive) {
        // Como se hacia antes: concatenar y confiar en hasEOL.
        let pageText = '';
        for (const item of content.items) {
          if (typeof item.str === 'string') pageText += item.str;
          if (item.hasEOL) pageText += '\n';
        }
        naiveChunks.push(pageText.replace(/[ \t]+\n/g, '\n'));
      } else {
        pageLines.push(itemsToLines(content.items));
      }
      page.cleanup();
    }
  } finally {
    await task.destroy();
  }

  const text = naive ? naiveChunks.join('\n\n') : pagesToText(pageLines);
  const density = text.replace(/\s/g, '').length / Math.max(1, pages);
  return { text, pages, scanned: density < SCANNED_CHARS_PER_PAGE, ms: Date.now() - started };
}

/** Palabras cortadas que han sobrevivido: el fallo mas visible. */
function leftoverHyphens(text) {
  return (text.match(/\p{L}-\n\p{Ll}/gu) || []).length;
}

/** Lineas sueltas que deberian haberse unido (heuristica de revision). */
function suspiciousBreaks(text) {
  const lines = text.split('\n');
  let count = 0;
  for (let i = 0; i < lines.length - 1; i += 1) {
    const a = lines[i].trim();
    const b = lines[i + 1].trim();
    if (!a || !b) continue;
    // Linea larga que no cierra frase seguida de minuscula: sospechoso.
    if (a.length > 55 && !/[.!?:;]$/.test(a) && /^[\p{Ll}]/u.test(b)) count += 1;
  }
  return count;
}

function blocks(text) {
  return text.split(/\n{2,}/).filter((block) => block.trim()).length;
}

async function main() {
  const path = process.argv[2];
  const full = process.argv.includes('--full');
  if (!path) {
    console.error('uso: node tests/harness/pdf-report.mjs "ruta.pdf" [--full]');
    process.exit(1);
  }

  const raw = await extract(path, { naive: process.argv.includes('--naive') });
  const cleanStart = Date.now();
  const cleaned = cleanText(raw.text);
  const cleanMs = Date.now() - cleanStart;

  const analysisStart = Date.now();
  const analysis = analyzeText(cleaned.text, { langSetting: 'auto', amount: 'medium' });
  const analysisMs = Date.now() - analysisStart;

  const report = {
    archivo: basename(path),
    paginas: raw.pages,
    escaneado: raw.scanned,
    tiempos: { extraccion: raw.ms, limpieza: cleanMs, analisis: analysisMs },
    crudo: {
      caracteres: raw.text.length,
      lineas: raw.text.split('\n').length,
      bloques: blocks(raw.text),
      guionesPartidos: leftoverHyphens(raw.text),
    },
    limpio: {
      caracteres: cleaned.text.length,
      lineas: cleaned.text.split('\n').length,
      bloques: blocks(cleaned.text),
      guionesPartidosRestantes: leftoverHyphens(cleaned.text),
      cortesSospechosos: suspiciousBreaks(cleaned.text),
    },
    arreglos: {
      total: cleaned.totalFixes,
      ...Object.fromEntries(CLEAN_STAT_KEYS.map((key) => [key, cleaned.stats[key]])),
    },
    analisis: {
      idioma: analysis.lang,
      palabras: analysis.stats.words,
      parrafos: analysis.stats.paragraphs,
      terminos: analysis.keywords.slice(0, 10).map((k) => `${k.display} (${k.count})`),
      datos: analysis.entities.map((e) => `${e.kind}: ${e.text}`),
      muletillas: analysis.repetitions.fillers.map((f) => `${f.phrase} (${f.count})`),
    },
  };

  console.log(JSON.stringify(report, null, 2));

  if (full) {
    console.log('\n===== CRUDO (primeros 1200) =====\n' + raw.text.slice(0, 1200));
    console.log('\n===== LIMPIO (primeros 1800) =====\n' + cleaned.text.slice(0, 1800));
  }
}

main().catch((error) => {
  console.error('FALLO:', error && error.message);
  process.exit(1);
});
