/**
 * toast — avisos breves. Se anuncian por aria-live para que tambien
 * lleguen a quien usa lector de pantalla.
 */
import { el } from './dom.js';

const DURATION = 3200;

export function createToaster(container) {
  let timer = null;

  function show(message, kind = 'info') {
    if (!container) return;
    if (timer) clearTimeout(timer);
    const node = el('div', { class: `toast toast--${kind}`, role: 'status' }, [message]);
    container.replaceChildren(node);
    // Fuerza la transicion de entrada.
    requestAnimationFrame(() => node.classList.add('is-visible'));
    timer = setTimeout(() => {
      node.classList.remove('is-visible');
      setTimeout(() => {
        if (node.isConnected) node.remove();
      }, 220);
    }, DURATION);
  }

  return {
    show,
    info: (message) => show(message, 'info'),
    success: (message) => show(message, 'success'),
    error: (message) => show(message, 'error'),
  };
}

export default createToaster;
