# Recursos

## Fondos ambientales — originales

`src/assets/fondos/*.webp`, cuatro archivos: dos escenas (`costa`, `alba`) con
recorte de escritorio (2560×1440) y de móvil (1170×2200). Entre 11 y 16 kB cada
uno.

**No son fotografías.** Son imágenes construidas por código con Pillow:
degradado vertical de cielo en tres tramos, luz lateral cálida junto al
horizonte, un promontorio lejano de bajo contraste, filo de horizonte,
viñeteado suave y grano fino para evitar bandas.

- Fuente reproducible: `scripts/generar_fondo.py`. Se regeneran con
  `npm run fondos` (requiere Python con Pillow).
- Licencia: originales de este proyecto. Sin derechos de terceros.
- Por qué así y no una foto: en esta sesión no había herramienta de generación
  de imágenes, y una fotografía con licencia habría que descargarla. Se eligió
  deliberadamente, no por accidente.

La interfaz funciona sin ellos: si la imagen no carga queda un degradado liso
definido en CSS, y hay una opción «Liso» en Ajustes que no pide ninguna imagen.

## Tipografía

**Manrope**, SIL Open Font License 1.1. Instalada como dependencia
(`@fontsource/manrope`) y servida desde el propio dominio. Cuatro pesos (400,
500, 700, 800), subconjunto latino. Ninguna petición a Google Fonts ni a ningún
otro tercero.

## Iconos funcionales — originales

`src/componentes/Iconos.tsx`. Una sola familia dibujada para el proyecto:
cuadrícula de 20×20, trazo 1,6, remates y uniones redondos, `currentColor`.
Se usan a 18–20 px dentro de áreas táctiles de 44×44 como mínimo.

## Marca

El distintivo es un punto en mandarina (`--accion`) junto al nombre, hecho en
CSS. No hay archivo de logotipo ni favicon propio todavía: **el `index.html` no
declara `<link rel="icon">`**, así que el navegador muestra su icono por
defecto. Queda pendiente.

## Iconos de los accesos — de terceros, no redistribuidos

Los iconos que se ven en los accesos son **el favicon de cada sitio**, pedido en
tiempo de ejecución al propio dominio (`/apple-touch-icon.png` y, si falla,
`/favicon.ico`). No se descargan, no se guardan y no se incluyen en el
repositorio.

- **Por qué al propio dominio y no a un servicio de favicons:** un agregador
  recibiría de golpe la lista entera de sitios que tienes guardados. Pidiéndolo
  a cada sitio, cada uno solo se entera de lo suyo, y es una web que ya visitas.
- **Lo que sí ocurre:** la primera vez que se dibuja un acceso, ese dominio
  puede deducir que lo tienes guardado. Está dicho en Ayuda y en Privacidad.
- Si un sitio no responde, se usa su inicial y el dominio se recuerda para no
  volver a pedirlo.
- Son marcas de sus dueños. Sirven para que la persona reconozca su propio
  acceso; **no se usan en material promocional de Mi Punto** ni se alteran sus
  proporciones.

Las sugerencias de la primera visita (Gmail, Outlook, Drive, YouTube, Spotify,
Wikipedia, Notion) son enlaces a sus páginas oficiales, comprobados uno a uno.
Son propuestas que la persona marca si quiere: no son servicios conectados ni
datos detectados, y así se dice en pantalla.

## Datos de ejemplo

`src/datos/ejemplo.ts`. Contenido inventado para el modo «Ver un ejemplo», con
nombre ficticio. No son datos reales de nadie y están separados de los datos
de la persona: entrar y salir del ejemplo no los toca.

## Pendiente

- Favicon y marca de la web (no hay archivo).
- Datos del titular para los documentos legales, si se publica.
