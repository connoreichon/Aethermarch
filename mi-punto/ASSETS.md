# Recursos

## Fondos ambientales — originales

`src/assets/fondos/*.webp`, cuatro archivos: dos escenas (`costa`, `alba`) con
recorte de escritorio (2560×1440) y de móvil (1170×2200). Entre 11 y 16 kB cada
uno.

**No son fotografías.** Son escenas construidas por código con numpy, scipy y
Pillow. La primera versión sí eran cuatro degradados, y se notaba al mirarla a
tamaño real: mar plano, costura recta en el horizonte y bandas. Lo que hace que
la actual aguante al 100 %:

- **Todo el mezclado va en luz lineal** y solo al final se pasa a sRGB. Mezclar
  en sRGB es lo que ensucia los cielos.
- **Nubes con ruido fBm** estirado en horizontal y comprimido hacia el
  horizonte: eso es la perspectiva de un cielo real.
- **Mar con olas** cuya frecuencia crece con la distancia, un camino de brillos
  bajo el sol y oscurecimiento hacia el espectador.
- **El horizonte no es una línea dibujada**, es bruma: lo que se ve de verdad.
- **Tramado triangular** antes de cuantizar a 8 bits. Sin esto, un degradado tan
  largo hace escalones por muy bien calculado que esté.
- La altura del promontorio va con el **ancho** de la imagen, no con el alto: si
  no, en el recorte vertical de móvil se convierte en un volcán.

Comprobado recortando al 100 % el horizonte, la zona del titular y el primer
plano, no mirando la imagen reducida. Contraste del texto claro sobre la zona
del titular: **8,9:1** en el peor punto.

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
CSS. El favicon es `public/icono.svg`: el mismo punto sobre un cuadrado de
tinta, SVG de dos formas y 180 bytes, declarado en `index.html`. Original.

## Iconos de los accesos — de terceros, no redistribuidos

Los iconos que se ven en los accesos son **el favicon de cada sitio**, pedido en
tiempo de ejecución al propio dominio. No se descargan, no se guardan y no se
incluyen en el repositorio.

Orden de intentos, porque cada sitio publica el suyo en un sitio distinto:

1. El icono que la persona haya puesto a mano en el acceso, si lo hay.
2. `{origen}/apple-touch-icon.png`
3. `{origen}/favicon.svg`
4. `{origen}/favicon.ico`
5. El dominio raíz: `mail.google.com` → `google.com/favicon.ico` y
   `www.google.com/favicon.ico`. Muchos subdominios (correo, sede, app) no
   sirven icono pero su dominio principal sí.
6. La inicial del nombre.

**Lo que esto implica y hay que saber:** cuando se llega al paso 5, dos accesos
de la misma casa comparten icono. Gmail y Calendario acaban los dos con la G de
Google, porque ninguno de sus subdominios publica un icono accesible. No es un
error: es lo que hay disponible. El remedio está en el propio formulario del
acceso, campo «Icono», donde se pega la dirección de la imagen que se quiera.

Hay sitios que no dan ninguno de los cinco (Notion es uno): ahí queda la
inicial, que también es un resultado correcto.

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

- Datos del titular para los documentos legales, si se publica.
- Un logotipo más trabajado que el punto, si el producto llega a tener marca.
