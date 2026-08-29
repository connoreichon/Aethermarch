/**
 * renderer — pinta el modelo de segmentos en el DOM.
 *
 * SIEMPRE con createTextNode. El texto del usuario nunca se interpreta
 * como HTML: si alguien pega <script>alert(1)</script> lo vera escrito,
 * porque es exactamente lo que es, texto.
 */
import { splitFocusPieces } from '../modules/focusReading.js';
import { HIGHLIGHT_COLORS, containerStyle } from '../modules/styleEngine.js';

const PALETTE_IDS = new Set(HIGHLIGHT_COLORS.map((color) => color.id));

/** El color de paleta se resuelve por variable CSS para seguir al tema. */
export function colorToCss(colorId) {
  if (!colorId) return null;
  return PALETTE_IDS.has(colorId) ? `var(--hl-${colorId})` : colorId;
}

function appendPieces(parent, text, focus) {
  if (!focus || !focus.enabled) {
    parent.appendChild(document.createTextNode(text));
    return;
  }
  for (const piece of splitFocusPieces(text, focus.intensity)) {
    if (!piece.strong) {
      parent.appendChild(document.createTextNode(piece.text));
      continue;
    }
    const strong = document.createElement('b');
    strong.className = 'mc-focus';
    strong.appendChild(document.createTextNode(piece.text));
    parent.appendChild(strong);
  }
}

function appendSegment(parent, segment, focus) {
  if (!segment.mark) {
    appendPieces(parent, segment.text, focus);
    return;
  }
  const span = document.createElement('span');
  if (segment.mark.kind === 'locate') {
    span.className = 'mc-locate';
  } else {
    span.className = 'mc-hl';
    // El termino viaja en el nodo para poder encenderlo desde la lista.
    span.dataset.term = segment.text.toLowerCase();
    const color = colorToCss(segment.mark.color);
    if (color) span.style.color = color;
    if (segment.mark.bold) span.style.fontWeight = '700';
    if (segment.mark.italic) span.style.fontStyle = 'italic';
    if (segment.mark.underline) span.style.textDecoration = 'underline';
    if (segment.mark.font) span.style.fontFamily = segment.mark.font;
  }
  appendPieces(span, segment.text, focus);
  parent.appendChild(span);
}

/**
 * @param {HTMLElement} container
 * @param {Array} blocks modelo devuelto por buildStyledBlocks
 * @param {object} styleConfig
 */
export function renderStyledBlocks(container, blocks, styleConfig) {
  const fragment = document.createDocumentFragment();
  const focus = styleConfig.focus;

  for (const block of blocks) {
    const paragraph = document.createElement('p');
    paragraph.className = block.type === 'list' ? 'mc-block mc-block--list' : 'mc-block';
    block.lines.forEach((segments, index) => {
      if (index > 0) paragraph.appendChild(document.createElement('br'));
      for (const segment of segments) appendSegment(paragraph, segment, focus);
    });
    fragment.appendChild(paragraph);
  }

  container.replaceChildren(fragment);
  applyContainerStyle(container, styleConfig);
}

/** Aplica tipografia, tamano, interlineado, ancho y alineacion. */
export function applyContainerStyle(container, styleConfig) {
  const box = containerStyle(styleConfig);
  container.style.fontFamily = box.fontFamily;
  container.style.fontSize = box.fontSize;
  container.style.lineHeight = box.lineHeight;
  container.style.maxWidth = box.maxWidth;
  container.style.textAlign = box.textAlign;
}

export default renderStyledBlocks;
