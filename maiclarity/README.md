# MAIClarity

Herramienta gratuita para **pegar → limpiar → destacar → leer → copiar** texto.

Pegas un texto (o abres un TXT, MD o PDF), MAIClarity lo limpia solo —saltos de
línea del PDF, palabras partidas, espacios y caracteres invisibles— y después
puedes darle forma para leerlo: términos clave resaltados, palabras propias,
tipografía, interlineado, ancho de lectura y modo de lectura enfocada.

**Todo ocurre en el navegador.** No hay backend, no hay API, no hay IA y el
documento no se sube a ninguna parte. Se puede comprobar: con la pestaña de red
abierta, la aplicación no hace ni una petición a otro dominio.

---

## Arrancar

```bash
npm install
```

Desarrollo:

```bash
npm run dev
```

Producción:

```bash
npm run build
```

Ver la build:

```bash
npm run preview
```

Tests:

```bash
npm test
```

---

## Cómo está montado

Sin framework: HTML semántico, JavaScript moderno con ES Modules, CSS con
variables y Vite para empaquetar. Una sola dependencia de runtime
(`pdfjs-dist`), empaquetada con la app: el worker de PDF **no** se carga de un
CDN.

```
brand.config.js          identidad del producto (nombre, claims, dominio)
vite.config.js           build + inyección de marca + robots/sitemap
index.html               la herramienta
privacy.html             privacidad
src/
  main.js                controlador: eventos -> qué recalcular -> pintar
  config/brand.js        puente de marca al runtime
  state/store.js         estado (rawText, cleanText, styleConfig, analysis)
  modules/               lógica pura, sin DOM
    textCleaner.js       tubería de limpieza, paso a paso
    tokenizer.js         una sola tokenización compartida
    language.js          detección es/en
    keywordAnalyzer.js   puntuación determinista de términos clave
    repetitionAnalyzer.js repeticiones, frases repetidas y muletillas
    textStats.js         palabras, caracteres, párrafos, lectura
    focusReading.js      heurística de énfasis visual
    styleEngine.js       texto + estilo -> modelo de segmentos
    exporter.js          HTML escapado, portapapeles y descargas
    pdfReader.js         extracción local con PDF.js (carga diferida)
    fileLoader.js        apertura y validación de archivos
    i18n.js / theme.js   idioma y tema
  ui/                    pintado en el DOM (nunca innerHTML con texto del usuario)
  data/                  stopwords, muletillas, textos de interfaz, ejemplos
  styles/                tokens, base, componentes, estructura
tests/                   Vitest + fixtures de texto sucio
```

### Decisiones de usabilidad

- **Pegar funciona en toda la página.** `Ctrl+V` en cualquier sitio carga el
  texto; no hace falta acertar dentro del cuadro. Si ya había documento, queda
  recuperable con *Deshacer*.
- **El estado vacío es la primera pantalla y trae acciones**, no solo un
  placeholder: probar un ejemplo, elegir archivo y el atajo de teclado.
- **Se puede ver qué se ha arreglado.** El contador de arreglos es un botón:
  abre el desglose por categorías en lugar de esconderlo en un tooltip.
- **Los presets se explican solos:** cada uno muestra debajo qué hace.
- **Las cifras del documento están siempre a la vista** (palabras y tiempo de
  lectura), sin abrir ningún panel.
- **La página enseña el producto antes de pedir nada:** tres pasos y una
  demostración *antes / después* que limpia el fragmento con la herramienta de
  verdad, en el navegador, al cargar.
- **Progresión:** los controles finos (tipografía) van plegados; lo que se usa
  siempre queda abierto.

### Reglas que sostienen el diseño

- **El texto limpio no se toca al cambiar estilos.** Cambiar un color, una
  fuente o activar la lectura enfocada no vuelve a ejecutar el limpiador; solo
  se reconstruye el modelo visual. Cambiar el tamaño de letra ni siquiera hace
  eso.
- **`rawText` nunca se destruye** mientras dure la sesión: el original siempre
  está a la izquierda.
- **Nada del usuario se interpreta como HTML.** El texto se pinta con nodos de
  texto y se exporta escapado. Pegar `<script>alert(1)</script>` muestra eso,
  escrito.
- **Una sola tokenización** alimenta términos clave, repeticiones, muletillas y
  estadísticas.

---

## Renombrar el producto

El nombre es provisional. Está todo en [`brand.config.js`](brand.config.js):
nombre, partes del logotipo, marca paraguas, slug de archivos, claims y
descripciones por idioma. Vite los inyecta en el HTML (título, meta, Open Graph)
y el runtime los lee de ahí. No hay que buscar "MAIClarity" por los archivos.

### Dominio

`siteUrl` está vacío a propósito: cuando exista dominio, se pone ahí y la build
genera sola el `canonical`, el `og:url`, el `sitemap.xml` y la línea `Sitemap:`
de `robots.txt`.

---

## Identidad

- **Concepto:** tinta y rotulador sobre papel. Una hoja de trabajo dividida por
  filetes de un píxel, titulares en serif del sistema, cifras en monoespaciada y
  un único gesto de marca: el trazo de rotulador.
- **Ese trazo se repite** en el logotipo, bajo la pestaña activa, detrás de la
  opción elegida, detrás de la segunda mitad del nombre y como barra de peso de
  cada término detectado.
- **Paleta:** papel cálido (`#ECE7DD`), tinta (`#15191E`), rotulador turquesa
  (`#148F84` / `#2EC4B6` en oscuro) y terracota (`#A8461A`) como segundo
  marcador. Modo oscuro con tinta profunda (`#101318`).
- **Tipografías del sistema.** No se descarga ninguna fuente.
- Logotipo en [`public/logo.svg`](public/logo.svg),
  [`public/logo-mark.svg`](public/logo-mark.svg) y favicon derivado.

---

## Idiomas

Interfaz en español e inglés (se detecta con `navigator.language` y se puede
cambiar en la cabecera). Todas las cadenas están en
[`src/data/locales.js`](src/data/locales.js). El análisis de texto tiene su
propio selector de idioma (auto / español / inglés) con listas locales de
stopwords y muletillas.

---

## Privacidad

- El documento se procesa en memoria de la pestaña y desaparece al recargar.
- En `localStorage` solo se guardan dos cosas: **tema** e **idioma**.
- Sin analítica, sin cookies, sin fuentes externas, sin peticiones a terceros.

---

## Qué falta (honestamente)

- **OCR:** un PDF escaneado se detecta y se avisa; no se inventa texto.
- **DOCX:** no está en esta versión.
- **Imagen de Open Graph:** hay título y descripción, pero falta el PNG de
  previsualización (necesita dominio y una imagen real).
- **CJK:** el tokenizador usa `Intl.Segmenter` cuando detecta esos alfabetos,
  pero las listas de stopwords y muletillas solo cubren español e inglés.
