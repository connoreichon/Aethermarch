/**
 * Puente entre brand.config.js (raiz, compartido con Vite) y el runtime.
 * Todo lo que la interfaz necesita saber sobre la identidad del producto
 * sale de aqui, nunca escrito a mano en un componente.
 */
import { brand } from '../../brand.config.js';

export { brand };

/** Claves de almacenamiento local. Solo tema e idioma se guardan. */
export const STORAGE_KEYS = {
  theme: `${brand.fileSlug}.theme`,
  lang: `${brand.fileSlug}.lang`,
};

export default brand;
