import { describe, it, expect } from 'vitest';
import {
  escapeHtml,
  blocksToHtml,
  buildStandaloneHtml,
  exportFileName,
} from '../src/modules/exporter.js';
import { buildStyledBlocks, DEFAULT_STYLE_CONFIG } from '../src/modules/styleEngine.js';
import { cleanText } from '../src/modules/textCleaner.js';
import { isSupportedFile, extensionOf } from '../src/modules/fileLoader.js';

const config = (patch = {}) => ({
  ...DEFAULT_STYLE_CONFIG,
  keywords: { ...DEFAULT_STYLE_CONFIG.keywords, ...(patch.keywords || {}) },
  focus: { ...DEFAULT_STYLE_CONFIG.focus, ...(patch.focus || {}) },
  customRules: patch.customRules || [],
});

describe('seguridad frente a HTML del usuario', () => {
  const attacks = [
    '<script>alert("xss")</script>',
    '<img src=x onerror=alert(1)>',
    '"><svg onload=alert(1)>',
    "javascript:alert('x')",
  ];

  it('el texto pegado sobrevive literalmente a la limpieza', () => {
    for (const attack of attacks) {
      expect(cleanText(attack).text).toContain(attack.split('\n')[0].slice(0, 10));
    }
    expect(cleanText('<script>alert("xss")</script>').text).toBe('<script>alert("xss")</script>');
  });

  it('el modelo de segmentos guarda texto, no marcado', () => {
    const blocks = buildStyledBlocks('<script>alert("xss")</script>', config());
    const text = blocks[0].lines[0].map((s) => s.text).join('');
    expect(text).toBe('<script>alert("xss")</script>');
  });

  it('el HTML exportado escapa todo el contenido', () => {
    for (const attack of attacks) {
      const html = blocksToHtml(buildStyledBlocks(attack, config()), config());
      // Ninguna etiqueta del usuario llega viva: solo quedan las nuestras.
      expect(html).not.toContain('<script');
      expect(html).not.toContain('<img');
      expect(html).not.toContain('<svg');
      const inner = html.replace(/^<p style="[^"]*">/, '').replace(/<\/p>$/, '');
      expect(inner).not.toContain('<');
      if (attack.includes('<')) expect(inner).toContain('&lt;');
    }
  });

  it('escapa comillas y ampersands', () => {
    expect(escapeHtml('a & "b" <c> \'d\'')).toBe('a &amp; &quot;b&quot; &lt;c&gt; &#39;d&#39;');
  });

  it('el documento autonomo no lleva JavaScript', () => {
    const html = buildStandaloneHtml({
      title: '<script>x</script>',
      blocks: buildStyledBlocks('Hola <b>mundo</b>', config()),
      styleConfig: config(),
      lang: 'es',
    });
    expect(html).not.toContain('<script');
    expect(html).toContain('&lt;b&gt;mundo&lt;/b&gt;');
  });
});

describe('copia con formato', () => {
  const keywords = [{ term: 'presupuesto', display: 'presupuesto', count: 3, weight: 1 }];

  it('conserva negrita, cursiva, subrayado y color', () => {
    const styleConfig = config({
      keywords: { enabled: true, bold: true, italic: true, underline: true, color: 'accent' },
    });
    const html = blocksToHtml(
      buildStyledBlocks('El presupuesto manda', styleConfig, keywords),
      styleConfig,
      { theme: 'light' }
    );
    expect(html).toContain('font-weight:700');
    expect(html).toContain('font-style:italic');
    expect(html).toContain('text-decoration:underline');
    expect(html).toContain('color:#0E7C72'); // acento resuelto para fondo claro
  });

  it('respeta un color personalizado tal cual', () => {
    const styleConfig = config({
      customRules: [{ id: 'r', text: 'presupuesto', color: '#ff0088', bold: false }],
    });
    const html = blocksToHtml(buildStyledBlocks('El presupuesto', styleConfig), styleConfig);
    expect(html).toContain('color:#ff0088');
  });

  it('mantiene la estructura de parrafos', () => {
    const styleConfig = config();
    const html = blocksToHtml(
      buildStyledBlocks('Uno.\n\nDos.\n\n- a\n- b', styleConfig),
      styleConfig
    );
    expect(html.match(/<p /g)).toHaveLength(3);
    expect(html).toContain('<br />');
  });

  it('incluye el enfasis de lectura enfocada', () => {
    const styleConfig = config({ focus: { enabled: true, intensity: 'high' } });
    const html = blocksToHtml(buildStyledBlocks('documento importante', styleConfig), styleConfig);
    expect(html).toContain('<b style="font-weight:700">');
  });

  it('la tipografia elegida viaja en el documento autonomo', () => {
    const styleConfig = { ...config(), font: 'georgia', size: 20, width: 'narrow' };
    const html = buildStandaloneHtml({
      title: 'Prueba',
      blocks: buildStyledBlocks('Texto', styleConfig),
      styleConfig,
      lang: 'es',
    });
    expect(html).toContain('Georgia');
    expect(html).toContain('20px');
    expect(html).toContain('34rem');
  });
});

describe('nombres de archivo', () => {
  it('deriva del original', () => {
    expect(exportFileName('maiclarity', 'Informe final.pdf', 'txt')).toBe('Informe-final-cleaned.txt');
  });

  it('cae al nombre por defecto sin origen', () => {
    expect(exportFileName('maiclarity', null, 'html')).toBe('maiclarity-cleaned.html');
  });

  it('descarta caracteres problematicos', () => {
    expect(exportFileName('maiclarity', 'a/b*c?.txt', 'txt')).toBe('abc-cleaned.txt');
  });
});

describe('archivos admitidos', () => {
  it('acepta txt, md y pdf', () => {
    expect(isSupportedFile({ name: 'a.txt', type: 'text/plain' })).toBe(true);
    expect(isSupportedFile({ name: 'a.md', type: '' })).toBe(true);
    expect(isSupportedFile({ name: 'a.pdf', type: 'application/pdf' })).toBe(true);
  });

  it('rechaza lo que no sabe leer', () => {
    expect(isSupportedFile({ name: 'a.docx', type: 'application/vnd.openxml' })).toBe(false);
    expect(isSupportedFile({ name: 'a.png', type: 'image/png' })).toBe(false);
  });

  it('lee la extension', () => {
    expect(extensionOf('INFORME.PDF')).toBe('.pdf');
    expect(extensionOf('sin-extension')).toBe('');
  });
});
