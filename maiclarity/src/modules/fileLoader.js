/**
 * fileLoader — apertura local de archivos.
 *
 * Nada se sube a ningun sitio: se lee el archivo con FileReader / ArrayBuffer
 * y se procesa en la misma pestana.
 */

export const MAX_FILE_BYTES = 20 * 1024 * 1024; // 20 MB

export const SUPPORTED_EXTENSIONS = ['.txt', '.md', '.markdown', '.pdf'];

export const ACCEPT_ATTRIBUTE = '.txt,.md,.markdown,.pdf,text/plain,text/markdown,application/pdf';

export class FileLoadError extends Error {
  constructor(code, detail = {}) {
    super(code);
    this.name = 'FileLoadError';
    this.code = code;
    this.detail = detail;
  }
}

export function extensionOf(name = '') {
  const match = /\.[^.]+$/.exec(name.toLowerCase());
  return match ? match[0] : '';
}

export function isSupportedFile(file) {
  if (!file) return false;
  const extension = extensionOf(file.name);
  if (SUPPORTED_EXTENSIONS.includes(extension)) return true;
  return file.type === 'application/pdf' || file.type.startsWith('text/');
}

function readAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new FileLoadError('readFailed', { name: file.name }));
    reader.readAsText(file, 'utf-8');
  });
}

function readAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new FileLoadError('readFailed', { name: file.name }));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * @param {File} file
 * @param {{onProgress?: (page:number,total:number)=>void}} [options]
 * @returns {Promise<{text: string, name: string, kind: 'text'|'pdf', pages?: number, scanned?: boolean}>}
 */
export async function loadFile(file, { onProgress } = {}) {
  if (!file) throw new FileLoadError('noFile');
  if (file.size === 0) throw new FileLoadError('emptyFile', { name: file.name });
  if (file.size > MAX_FILE_BYTES) {
    throw new FileLoadError('tooLarge', { name: file.name, size: file.size });
  }
  if (!isSupportedFile(file)) {
    throw new FileLoadError('unsupported', { name: file.name });
  }

  const extension = extensionOf(file.name);
  const isPdf = extension === '.pdf' || file.type === 'application/pdf';

  if (!isPdf) {
    const text = await readAsText(file);
    return { text, name: file.name, kind: 'text' };
  }

  const buffer = await readAsArrayBuffer(file);
  try {
    const { extractPdfText } = await import('./pdfReader.js');
    const result = await extractPdfText(buffer, onProgress);
    return {
      text: result.text,
      name: file.name,
      kind: 'pdf',
      pages: result.pages,
      scanned: result.scanned,
    };
  } catch (error) {
    if (error instanceof FileLoadError) throw error;
    throw new FileLoadError('pdfFailed', { name: file.name, cause: String(error && error.message) });
  }
}

export default loadFile;
