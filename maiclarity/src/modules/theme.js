/**
 * theme — sistema / claro / oscuro.
 *
 * La preferencia (y solo la preferencia) se guarda en localStorage.
 * Nunca el documento.
 */
import { STORAGE_KEYS } from '../config/brand.js';

export const THEMES = ['system', 'light', 'dark'];

const query = typeof window !== 'undefined' && window.matchMedia
  ? window.matchMedia('(prefers-color-scheme: dark)')
  : null;

function readStored() {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.theme);
    return THEMES.includes(stored) ? stored : 'system';
  } catch (error) {
    return 'system';
  }
}

export function createTheme() {
  let mode = readStored();
  const listeners = new Set();

  function effective() {
    if (mode !== 'system') return mode;
    return query && query.matches ? 'dark' : 'light';
  }

  function apply() {
    const resolved = effective();
    document.documentElement.dataset.theme = resolved;
    document.documentElement.style.colorScheme = resolved;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', resolved === 'dark' ? '#0F1115' : '#F6F8FA');
    listeners.forEach((listener) => listener(resolved, mode));
  }

  if (query) {
    const onSystemChange = () => {
      if (mode === 'system') apply();
    };
    if (typeof query.addEventListener === 'function') {
      query.addEventListener('change', onSystemChange);
    } else if (typeof query.addListener === 'function') {
      query.addListener(onSystemChange);
    }
  }

  return {
    get mode() {
      return mode;
    },
    effective,
    apply,
    set(next) {
      if (!THEMES.includes(next)) return;
      mode = next;
      try {
        localStorage.setItem(STORAGE_KEYS.theme, mode);
      } catch (error) {
        /* modo privado: se aplica igual, solo no se recuerda */
      }
      apply();
    },
    onChange(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

export default createTheme;
