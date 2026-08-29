/**
 * ------------------------------------------------------------------
 *  IDENTIDAD DEL PRODUCTO — punto unico de verdad.
 * ------------------------------------------------------------------
 *  El nombre "MAIClarity" es provisional. Para renombrar el producto
 *  entero SOLO hay que tocar este archivo: el HTML (titulo, meta, OG,
 *  logotipo, footer), la UI y los exports leen de aqui.
 *
 *  Este modulo lo consumen dos mundos:
 *    - vite.config.js  -> inyecta los valores en index.html / privacy.html
 *                         y genera robots.txt + sitemap.xml
 *    - src/config/brand.js -> lo re-exporta al runtime del navegador
 *
 *  Por eso es JS plano sin imports: debe poder cargarse en Node y en el
 *  navegador sin transformaciones.
 * ------------------------------------------------------------------
 */

export const brand = {
  /** Nombre completo del producto. Aparece en title, header y exports. */
  productName: 'MAIClarity',

  /**
   * El wordmark se dibuja en dos piezas: la primera con mas peso.
   * Si renombras el producto, ajusta tambien este par.
   * nameParts.join('') deberia dar productName.
   */
  nameParts: ['MAI', 'Clarity'],

  /** Version corta para espacios estrechos (favicon alt, toasts, etc.). */
  shortName: 'MAIClarity',

  /** Marca paraguas. MAI crea productos; MAIClarity es uno de ellos. */
  parentBrand: 'MAI',

  /** Slug usado en nombres de archivo exportados: maiclarity-cleaned.txt */
  fileSlug: 'maiclarity',

  /** Frase corta de producto (no es el H1). */
  tagline: {
    es: 'Herramientas de texto que funcionan en tu navegador.',
    en: 'Local text tools that run in your browser.',
  },

  /** Meta description por idioma. ~155 caracteres. */
  description: {
    es: 'Limpia texto copiado de PDFs, arregla saltos de linea y palabras partidas, destaca las palabras clave y ajusta la lectura. Todo se procesa en tu navegador.',
    en: 'Clean text copied from PDFs, fix broken line breaks and split words, highlight key terms and tune the reading view. Everything is processed in your browser.',
  },

  /** Title de la pagina principal por idioma (el HTML sirve el que toque por defecto). */
  seoTitle: {
    es: 'MAIClarity — Limpia texto de PDF y destaca lo importante',
    en: 'MAIClarity — Clean messy text and highlight what matters',
  },

  /**
   * Dominio final. Vacio = todavia no publicado.
   * Al rellenarlo (ej. 'https://maiclarity.com') se generan automaticamente
   * canonical, og:url, sitemap.xml y la linea Sitemap de robots.txt.
   */
  siteUrl: '',

  /** Idioma por defecto del HTML servido. El runtime puede cambiarlo. */
  defaultLang: 'en',
};

export default brand;
