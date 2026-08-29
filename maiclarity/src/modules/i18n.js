/**
 * i18n — cadenas de interfaz centralizadas.
 *
 * Toda etiqueta visible sale de aqui. El HTML marca los nodos con
 * data-i18n / data-i18n-attr y este modulo los rellena; asi anadir un
 * idioma no obliga a tocar la logica.
 */
import { LOCALES, SUPPORTED_UI_LANGS } from '../data/locales.js';
import { brand, STORAGE_KEYS } from '../config/brand.js';

function readStoredLang() {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.lang);
    return SUPPORTED_UI_LANGS.includes(stored) ? stored : null;
  } catch (error) {
    return null;
  }
}

export function detectUiLang() {
  const stored = readStoredLang();
  if (stored) return stored;
  const navigatorLang = (typeof navigator !== 'undefined' && navigator.language) || 'en';
  return navigatorLang.toLowerCase().startsWith('es') ? 'es' : 'en';
}

export function createI18n(initialLang = detectUiLang()) {
  let lang = SUPPORTED_UI_LANGS.includes(initialLang) ? initialLang : 'en';
  const listeners = new Set();

  function interpolate(template, params) {
    return template.replace(/\{(\w+)\}/g, (match, key) => {
      if (key === 'product') return brand.productName;
      if (key === 'parent') return brand.parentBrand;
      if (params && key in params) return String(params[key]);
      return match;
    });
  }

  function t(key, params) {
    const dictionary = LOCALES[lang] || LOCALES.en;
    const template = dictionary[key] ?? LOCALES.en[key] ?? key;
    return interpolate(template, params);
  }

  /** Plural minimo: clave.one / clave.other. */
  function tn(key, count, params = {}) {
    const suffix = Math.abs(count) === 1 ? 'one' : 'other';
    return t(`${key}.${suffix}`, { n: count, ...params });
  }

  function apply(root = document) {
    root.querySelectorAll('[data-i18n]').forEach((node) => {
      node.textContent = t(node.dataset.i18n);
    });
    root.querySelectorAll('[data-i18n-attr]').forEach((node) => {
      node.dataset.i18nAttr.split(';').forEach((pair) => {
        const [attribute, key] = pair.split(':').map((part) => part && part.trim());
        if (attribute && key) node.setAttribute(attribute, t(key));
      });
    });
  }

  function setLang(next) {
    if (!SUPPORTED_UI_LANGS.includes(next) || next === lang) return;
    lang = next;
    try {
      localStorage.setItem(STORAGE_KEYS.lang, lang);
    } catch (error) {
      /* modo privado: seguimos sin recordar la preferencia */
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
      document.title = `${brand.productName} — ${t('meta.title')}`;
      const description = document.querySelector('meta[name="description"]');
      if (description) description.setAttribute('content', brand.description[lang]);
    }
    listeners.forEach((listener) => listener(lang));
  }

  return {
    t,
    tn,
    apply,
    setLang,
    get lang() {
      return lang;
    },
    onChange(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

export default createI18n;
