import { defineConfig } from 'vite';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeFileSync } from 'node:fs';
import { brand } from './brand.config.js';

const root = dirname(fileURLToPath(import.meta.url));

/** Escapa texto que se inyecta dentro de atributos HTML. */
function attr(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Sustituye los marcadores {{clave}} de los HTML por los valores de
 * brand.config.js, y genera robots.txt / sitemap.xml coherentes con
 * el dominio configurado (si lo hay).
 */
function brandPlugin() {
  const lang = brand.defaultLang;
  const url = (brand.siteUrl || '').replace(/\/+$/, '');

  const tokens = {
    productName: brand.productName,
    shortName: brand.shortName,
    parentBrand: brand.parentBrand,
    lang,
    tagline: brand.tagline[lang],
    description: brand.description[lang],
    seoTitle: brand.seoTitle[lang],
    privacyTitle: `${brand.productName} — ${lang === 'es' ? 'Privacidad' : 'Privacy'}`,
    siteUrl: url,
  };

  return {
    name: 'maiclarity-brand',
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        const page = ctx.path.replace(/^\//, '') || 'index.html';
        const canonicalPath = page === 'index.html' ? '/' : `/${page}`;
        const canonical = url
          ? `\n    <link rel="canonical" href="${attr(url + canonicalPath)}" />` +
            `\n    <meta property="og:url" content="${attr(url + canonicalPath)}" />`
          : '';

        return html
          .replace(/\{\{canonical\}\}/g, canonical)
          .replace(/\{\{(\w+)\}\}/g, (match, key) =>
            key in tokens ? attr(tokens[key]) : match
          );
      },
    },
    closeBundle() {
      const outDir = resolve(root, 'dist');
      const robots = [
        'User-agent: *',
        'Allow: /',
        '',
        url ? `Sitemap: ${url}/sitemap.xml` : '# Sitemap: pendiente de dominio (brand.config.js -> siteUrl)',
        '',
      ].join('\n');
      writeFileSync(resolve(outDir, 'robots.txt'), robots, 'utf8');

      if (url) {
        const pages = ['/', '/privacy.html'];
        const sitemap =
          '<?xml version="1.0" encoding="UTF-8"?>\n' +
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
          pages
            .map((p) => `  <url><loc>${url}${p}</loc><changefreq>monthly</changefreq></url>`)
            .join('\n') +
          '\n</urlset>\n';
        writeFileSync(resolve(outDir, 'sitemap.xml'), sitemap, 'utf8');
      }
    },
  };
}

export default defineConfig({
  plugins: [brandPlugin()],
  base: './',
  build: {
    target: 'es2020',
    assetsInlineLimit: 2048,
    rollupOptions: {
      input: {
        main: resolve(root, 'index.html'),
        privacy: resolve(root, 'privacy.html'),
      },
    },
  },
  server: {
    port: 4440,
    strictPort: false,
  },
  preview: {
    port: 4441,
    strictPort: false,
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
  },
});
