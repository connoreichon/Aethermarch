/**
 * pdfReader — extraccion de texto de PDFs en el propio navegador.
 *
 * PDF.js viaja empaquetado con la aplicacion (incluido su worker): no se
 * carga nada desde un CDN y el archivo no sale del dispositivo.
 *
 * Este modulo se importa de forma diferida: quien no abra un PDF no
 * descarga el motor.
 */
import * as pdfjs from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { itemsToLines, pagesToText } from './pdfLayout.js';

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

/** Menos caracteres por pagina que esto = probablemente paginas escaneadas. */
const SCANNED_CHARS_PER_PAGE = 30;

/**
 * @param {ArrayBuffer} buffer
 * @param {(page:number,total:number)=>void} [onProgress]
 * @returns {Promise<{text: string, pages: number, scanned: boolean}>}
 */
export async function extractPdfText(buffer, onProgress) {
  const task = pdfjs.getDocument({
    data: new Uint8Array(buffer),
    isEvalSupported: false,
    disableAutoFetch: true,
    useSystemFonts: true,
  });

  const doc = await task.promise;
  const pages = doc.numPages;
  const pageLines = [];

  try {
    for (let pageNumber = 1; pageNumber <= pages; pageNumber += 1) {
      const page = await doc.getPage(pageNumber);
      const content = await page.getTextContent();
      // La posicion de cada fragmento es lo que permite recuperar parrafos,
      // titulos y columnas; concatenar a pelo los funde todos.
      pageLines.push(itemsToLines(content.items));
      page.cleanup();
      if (onProgress) onProgress(pageNumber, pages);
    }
  } finally {
    // En pdf.js 6 se libera la tarea de carga (el documento ya no expone destroy).
    await task.destroy();
  }

  const text = pagesToText(pageLines);
  const density = text.replace(/\s/g, '').length / Math.max(1, pages);
  return { text, pages, scanned: density < SCANNED_CHARS_PER_PAGE };
}

export default extractPdfText;
