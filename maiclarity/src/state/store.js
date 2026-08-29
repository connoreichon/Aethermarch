/**
 * store — estado de la aplicacion.
 *
 * Las cinco piezas viven separadas a proposito:
 *   rawText        lo que el usuario pego o abrio (nunca se destruye)
 *   cleanText      resultado de la limpieza (editable a mano)
 *   styleConfig    apariencia (no toca el texto)
 *   analysis       terminos clave, repeticiones y estadisticas
 *   la vista       se deriva de los anteriores en cada render
 *
 * Nada de esto se guarda en disco ni en localStorage.
 */
import { DEFAULT_STYLE_CONFIG } from '../modules/styleEngine.js';

function cloneStyleConfig(config = DEFAULT_STYLE_CONFIG) {
  return {
    ...config,
    keywords: { ...config.keywords },
    focus: { ...config.focus },
    customRules: config.customRules.map((rule) => ({ ...rule })),
  };
}

export function createInitialState() {
  return {
    rawText: '',
    cleanText: '',
    cleanStats: null,
    totalFixes: 0,
    manualEdit: false,
    source: null, // {name, kind, pages, scanned}
    analysis: null,
    analysisLang: 'auto', // 'auto' | 'es' | 'en'
    styleConfig: cloneStyleConfig(),
    view: 'cleaned', // 'cleaned' | 'styled'
    status: { kind: 'idle', params: null },
    locatedTerm: null,
    history: null, // instantanea para deshacer
    nextRuleId: 1,
  };
}

export function createStore(initialState = createInitialState()) {
  let state = initialState;
  const listeners = new Set();

  function notify(reason) {
    listeners.forEach((listener) => listener(state, reason));
  }

  return {
    get state() {
      return state;
    },
    set(patch, reason = 'update') {
      state = { ...state, ...patch };
      notify(reason);
    },
    setStyle(patch, reason = 'style') {
      state = { ...state, styleConfig: { ...state.styleConfig, ...patch } };
      notify(reason);
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    reset() {
      const fresh = createInitialState();
      // Los ajustes visuales sobreviven al vaciado del documento.
      fresh.styleConfig = cloneStyleConfig(state.styleConfig);
      fresh.nextRuleId = state.nextRuleId;
      state = fresh;
      notify('reset');
    },
  };
}

export { cloneStyleConfig };
export default createStore;
