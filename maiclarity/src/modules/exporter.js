/**
 * exporter — copiar y descargar.
 *
 * El HTML se construye escapando SIEMPRE el texto del usuario. Nada de lo
 * que se pegue en la aplicacion puede acabar ejecutandose: ni al pintar,
 * ni al copiar, ni en el archivo descargado.
 */
import { containerStyle, resolveColor } from './styleEngine.js';
import { splitFocusPieces } from './focusReading.js';

export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function markStyle(mark, theme) {
  const parts = [];
  if (mark.color) parts.push(`color:${resolveColor(mark.color, theme)}`);
  if (mark.bold) parts.push('font-weight:700');
  if (mark.italic) parts.push('font-style:italic');
  if (mark.underline) parts.push('text-decoration:underline');
  if (mark.font) parts.push(`font-family:${mark.font}`);
  return parts.join(';');
}

function segmentToHtml(segment, { focus, theme }) {
  const inner = focus.enabled
    ? splitFocusPieces(segment.text, focus.intensity)
        .map((piece) =>
          piece.strong
            ? `<b style="font-weight:700">${escapeHtml(piece.text)}</b>`
            : escapeHtml(piece.text)
        )
        .join('')
    : escapeHtml(segment.text);

  if (!segment.mark) return inner;
  const style = markStyle(segment.mark, theme);
  return style ? `<span style="${style}">${inner}</span>` : inner;
}

/**
 * Serializa el modelo de bloques a HTML con estilos en linea, de modo que
 * conserve el formato al pegarlo en Word, Docs o el correo.
 */
export function blocksToHtml(blocks, styleConfig, { theme = 'light' } = {}) {
  const focus = styleConfig.focus || { enabled: false, intensity: 'medium' };
  return blocks
    .map((block) => {
      const lines = block.lines
        .map((segments) => segments.map((s) => segmentToHtml(s, { focus, theme })).join(''))
        .join('<br />');
      const margin = block.type === 'list' ? '0 0 0.6em 0' : '0 0 1em 0';
      return `<p style="margin:${margin}">${lines}</p>`;
    })
    .join('\n');
}

/** Documento HTML autonomo, sin JavaScript, listo para abrir o adjuntar. */
export function buildStandaloneHtml({ title, blocks, styleConfig, lang = 'en', theme = 'light' }) {
  const box = containerStyle(styleConfig);
  const body = blocksToHtml(blocks, styleConfig, { theme });
  return `<!doctype html>
<html lang="${escapeHtml(lang)}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(title)}</title>
<style>
  :root { color-scheme: light; }
  body {
    margin: 0;
    padding: 2.5rem 1.25rem 4rem;
    background: #ffffff;
    color: #17202a;
    font-family: ${box.fontFamily};
    font-size: ${box.fontSize};
    line-height: ${box.lineHeight};
  }
  main { max-width: ${box.maxWidth}; margin: 0 auto; text-align: ${box.textAlign}; }
  p { margin: 0 0 1em; }
</style>
</head>
<body>
<main>
${body}
</main>
</body>
</html>
`;
}

/* ------------------------------------------------------------------ *
 *  Portapapeles
 * ------------------------------------------------------------------ */

function legacyCopy(text) {
  try {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.top = '-1000px';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(area);
    return ok;
  } catch (error) {
    return false;
  }
}

/** @returns {Promise<boolean>} */
export async function copyPlainText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      /* cae al metodo antiguo */
    }
  }
  return legacyCopy(text);
}

/**
 * Copia con formato. Devuelve 'rich' | 'plain' | 'failed' para que la
 * interfaz pueda ser honesta sobre lo que ha ocurrido.
 * @returns {Promise<'rich'|'plain'|'failed'>}
 */
export async function copyRichText(html, plain) {
  const canRich =
    typeof ClipboardItem !== 'undefined' &&
    navigator.clipboard &&
    typeof navigator.clipboard.write === 'function' &&
    window.isSecureContext;

  if (canRich) {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([html], { type: 'text/html' }),
          'text/plain': new Blob([plain], { type: 'text/plain' }),
        }),
      ]);
      return 'rich';
    } catch (error) {
      /* cae a texto plano */
    }
  }
  const ok = await copyPlainText(plain);
  return ok ? 'plain' : 'failed';
}

/* ------------------------------------------------------------------ *
 *  Descargas
 * ------------------------------------------------------------------ */

export function downloadBlob(filename, blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Margen para que el navegador inicie la descarga antes de liberar.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadText(filename, text) {
  downloadBlob(filename, new Blob([text], { type: 'text/plain;charset=utf-8' }));
}

export function downloadHtml(filename, html) {
  downloadBlob(filename, new Blob([html], { type: 'text/html;charset=utf-8' }));
}

/** Nombre de archivo derivado del original, sin extensiones raras. */
export function exportFileName(slug, sourceName, extension) {
  if (!sourceName) return `${slug}-cleaned.${extension}`;
  const base = sourceName
    .replace(/\.[^.]+$/, '')
    .replace(/[^\w\d\-_ ]+/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60);
  return base ? `${base}-cleaned.${extension}` : `${slug}-cleaned.${extension}`;
}
