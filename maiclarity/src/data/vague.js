/**
 * Palabras que aparecen mucho y dicen poco.
 *
 * No son palabras vacias (esas ya se descartan): son sustantivos y verbos
 * comodin que suben en cualquier recuento de frecuencia y hacen que los
 * terminos clave parezcan elegidos al azar. Se penalizan, no se prohiben:
 * si un texto habla de verdad sobre "el proceso", el termino sobrevive.
 */

export const VAGUE_ES = new Set([
  'cosa', 'cosas', 'parte', 'partes', 'forma', 'formas', 'manera', 'maneras',
  'modo', 'modos', 'tipo', 'tipos', 'caso', 'casos', 'tema', 'temas',
  'punto', 'puntos', 'linea', 'lineas', 'línea', 'líneas', 'vez', 'veces',
  'lado', 'lados', 'hecho', 'hechos', 'gente', 'sitio', 'sitios',
  'momento', 'momentos', 'nivel', 'niveles', 'aspecto', 'aspectos',
  'elemento', 'elementos', 'cuestion', 'cuestión', 'cuestiones',
  'situacion', 'situación', 'situaciones', 'general', 'generales',
  'nuevo', 'nueva', 'nuevos', 'nuevas', 'gran', 'grande', 'grandes',
  'mejor', 'mejores', 'peor', 'peores', 'mismo', 'misma', 'mismos', 'mismas',
  'poder', 'hacer', 'haciendo', 'tener', 'teniendo', 'decir', 'dice',
  'seguir', 'siguiente', 'siguientes', 'anterior', 'anteriores',
  'total', 'totales', 'final', 'finales', 'inicio', 'principio',
  'ejemplo', 'ejemplos', 'proceso', 'procesos',
]);

export const VAGUE_EN = new Set([
  'thing', 'things', 'part', 'parts', 'way', 'ways', 'kind', 'kinds',
  'type', 'types', 'case', 'cases', 'topic', 'topics', 'point', 'points',
  'line', 'lines', 'time', 'times', 'side', 'sides', 'fact', 'facts',
  'people', 'place', 'places', 'moment', 'moments', 'level', 'levels',
  'aspect', 'aspects', 'element', 'elements', 'issue', 'issues',
  'situation', 'situations', 'general', 'new', 'great', 'big',
  'better', 'best', 'worse', 'worst', 'same', 'able',
  'make', 'making', 'made', 'take', 'taking', 'give', 'giving',
  'follow', 'following', 'next', 'previous', 'total', 'final', 'start',
  'example', 'examples', 'process', 'processes', 'stuff', 'lot', 'lots',
]);

export function getVagueWords(lang) {
  return lang === 'es' ? VAGUE_ES : VAGUE_EN;
}

export default getVagueWords;
