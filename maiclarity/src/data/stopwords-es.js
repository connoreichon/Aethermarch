/** Palabras vacias en espanol. Se excluyen del analisis de terminos clave. */
export const STOPWORDS_ES = new Set([
  'a', 'al', 'algo', 'algun', 'alguna', 'algunas', 'alguno', 'algunos', 'alli', 'ambos',
  'ante', 'antes', 'aqui', 'asi', 'aun', 'aunque', 'bajo', 'bien', 'cada', 'casi',
  'como', 'con', 'contra', 'cual', 'cuales', 'cualquier', 'cuando', 'cuanto', 'cuyo',
  'de', 'del', 'demas', 'dentro', 'desde', 'despues', 'donde', 'dos', 'durante',
  'e', 'el', 'ella', 'ellas', 'ello', 'ellos', 'en', 'entonces', 'entre', 'era', 'eran',
  'eras', 'eres', 'es', 'esa', 'esas', 'ese', 'eso', 'esos', 'esta', 'estaba', 'estaban',
  'estamos', 'estan', 'estar', 'estara', 'estas', 'este', 'esto', 'estos', 'estoy', 'estuvo',
  'fue', 'fueron', 'fui', 'fuimos', 'ha', 'habia', 'habian', 'han', 'has', 'hasta', 'hay',
  'haya', 'he', 'hemos', 'hizo', 'incluso', 'la', 'las', 'le', 'les', 'lo', 'los', 'luego',
  'mas', 'me', 'mi', 'mientras', 'mis', 'mismo', 'misma', 'mucho', 'muchos', 'muy',
  'nada', 'ni', 'ningun', 'ninguna', 'no', 'nos', 'nosotros', 'nuestra', 'nuestro', 'nunca',
  'o', 'os', 'otra', 'otras', 'otro', 'otros', 'para', 'pero', 'poco', 'por', 'porque',
  'pues', 'que', 'quien', 'quienes', 'se', 'segun', 'ser', 'si', 'sido', 'siempre', 'sin',
  'sino', 'sobre', 'solo', 'son', 'su', 'sus', 'suya', 'suyo', 'tal', 'tambien', 'tampoco',
  'tan', 'tanto', 'te', 'tendra', 'tenemos', 'tener', 'tenga', 'tengo', 'tenia', 'tiene',
  'tienen', 'toda', 'todas', 'todo', 'todos', 'tras', 'tu', 'tus', 'un', 'una', 'unas',
  'uno', 'unos', 'usted', 'ustedes', 'va', 'vamos', 'van', 'varios', 'ver', 'vez', 'y',
  'ya', 'yo', 'él', 'más', 'sí', 'está', 'están', 'esté', 'así', 'aún', 'según', 'sólo',
  'también', 'después', 'está', 'quién', 'cómo', 'dónde', 'cuál', 'qué', 'había', 'habían',
  'sería', 'ser', 'hacer', 'hace', 'haciendo', 'puede', 'pueden', 'podria', 'podría',
  'debe', 'deben', 'esta', 'ese', 'aquel', 'aquella', 'aquellos', 'aquellas', 'mediante',
  'etc', 'ademas', 'además', 'entonces', 'ahora', 'antes', 'hoy', 'ayer', 'manana', 'mañana',
]);

/** Muestra reducida para detectar idioma sin recorrer toda la lista. */
export const LANG_MARKERS_ES = [
  'que', 'de', 'la', 'el', 'en', 'los', 'las', 'un', 'una', 'por', 'con', 'para',
  'del', 'se', 'no', 'es', 'al', 'lo', 'como', 'pero', 'más', 'este', 'esta', 'son',
];

export default STOPWORDS_ES;
