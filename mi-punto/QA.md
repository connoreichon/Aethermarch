# Pruebas

Todo lo de abajo se ejecutó en la web real (Chromium vía Playwright) contra el
servidor de desarrollo. Lo que no se probó está en la última sección, dicho tal
cual.

## Recorridos funcionales

| # | Recorrido | Resultado |
|---|---|---|
| 1 | Primera visita: elegir accesos, poner nombre, entrar | Pasa. Se guardan como favoritos, el nombre aparece en el saludo y `presentado` queda a `true`. También se probó «Saltar este paso». |
| 2 | Añadir una URL propia (`boe.es`) | Pasa. Se normaliza a `https://boe.es/`. |
| 3 | Duplicado: añadir `www.boe.es` teniendo `boe.es` | Pasa **tras corregir un fallo**. Antes se guardaban como dos accesos distintos; ahora: «Ya tienes un acceso a esa dirección», el diálogo no se cierra y sigue habiendo 1 acceso. |
| 4 | Reordenar un acceso y marcar/desmarcar favorito | Pasa. |
| 5 | Crear grupo, renombrarlo y mover un acceso | Pasa. |
| 6 | Guardar enlace para retomar y marcarlo terminado | Pasa. Sale de la lista de pendientes y aparece en «Terminados». |
| 7 | Escribir una nota y recargar | Pasa. «Guardando…» → «Guardado», y el texto con tildes sobrevive a la recarga. |
| 8 | Tarea: crear, prioridad automática, completar y deshacer | Pasa. El aviso con «Deshacer» devuelve la tarea a pendiente. |
| 9 | Buscar con resultados y sin resultados | Pasa. «1 resultado» con la tarea encontrada; con `zzzzqqq`, «No hay nada que coincida» más el aviso de que no busca en internet. |
| 10 | Exportar y reimportar | Pasa. JSON válido, nombre con fecha, tildes intactas; al reimportar se recupera todo, incluida la preferencia de fondo. |
| 11 | Rechazar un archivo inválido | Pasa. «Ese archivo no es una copia de Mi Punto», sin vista previa y **sin tocar los datos**. |
| 12 | URLs no permitidas | Pasa. `javascript:alert(1)`, `data:text/html,…`, `file:///C:/` y texto suelto: las cuatro rechazadas con mensaje comprensible. |
| 13 | Importar un archivo con una URL `javascript:` dentro | Pasa. El archivo traía 2 accesos; la vista previa dice «1 acceso … Se descartó 1 elemento que no se pudo leer». |
| 14 | Migración del esquema v1 al v2 | Pasa. La nota única de la v1 se convierte en la primera nota de la lista; la clave antigua se deja intacta. |
| 15 | Calculadora | Pasa. `12,5 × 4 = 50`; `8 ÷ 0 = —`; `9 + 1 = 10`; `200 − 50 = 150`; `50 % = 0,5`; retroceso vuelve a 0. |
| 16 | Porcentajes con decimales y con error | Pasa. 21 % de `1.234,50` = `259,245`; con letras, «Escribe un número». |
| 17 | Teclado: Escape en diálogo | Pasa. Cierra, **el foco vuelve al botón que lo abrió** y se libera el scroll. |
| 18 | Build de producción | Pasa. `tsc` limpio y `vite build` correcto; comprobado sirviendo `dist/` y repitiendo la primera visita sobre él. |
| 19 | Cadena de iconos | Pasa. De 8 accesos del ejemplo, 7 con icono real: El País y Wikipedia por `apple-touch-icon`, Drive, YouTube y Spotify por `favicon.ico`, Gmail y Calendario por el dominio raíz. Notion no publica ninguno y queda con su inicial. |
| 20 | Icono propio por acceso | Pasa. Con texto que no es una dirección: «Esa no es una dirección de imagen válida». Con una URL buena: vista previa en el propio campo y guardado en disco. |
| 21 | «Volver a buscar los iconos» | Pasa. Había 3 dominios recordados como fallidos; el aviso dice «Se volverán a buscar 3 sitios» y Gmail y Calendario pasan a mostrar icono. |
| 24 | Barra de comandos | Pasa. Con un correo ofrece «Escribir un correo a» primero; con un teléfono, el WhatsApp; con un dominio, «Abrir la dirección»; con «doc», «Documento nuevo»; y «Buscarlo en Google» está siempre. |
| 25 | Acciones propias | Pasa. Añadí Milanuncios (que no está en el catálogo), le creé «Buscar en Milanuncios» con plantilla `?s={q}` desde el formulario, se guardó en disco y sale la primera en la barra al escribir «bicicleta». |
| 23 | Fondo a tamaño real | Pasa tras rehacerlo. Recortes 1:1 del horizonte, de la zona del titular y del primer plano: sin bandas, sin costura en el horizonte y con textura real en el agua. Contraste del texto claro, 8,9:1 medido sobre los píxeles del fondo. |
| 22 | Color de grupo desde la web | Pasa. El punto abre las seis opciones, se elige una, el menú se cierra y el color cambia también en la ficha del inicio. |

## Adaptación

| Comprobación | Resultado |
|---|---|
| 360 px | Sin desbordamiento horizontal. Accesos en tres columnas, barra inferior con los cuatro destinos. |
| 390 px | Sin desbordamiento. **Todos** los botones y enlaces miden 44×44 o más (se corrigieron: cabecera a 40, filas de tarjeta a 31, botones compactos a 42). |
| 768 px | Correcto. Se corrigió aquí un fallo: una regla `.tarjeta__fila span` demasiado amplia empujaba la casilla de las tareas a la derecha. |
| 1440×900 | Hora, saludo, accesos, buscador y las tres tarjetas **entran sin desplazarse** (alto de página = 900). |
| 720 px (= 1440 al 200 % de zoom) | Sin desbordamiento y sin perder funciones: buscador, accesos y navegación siguen ahí. |
| Movimiento reducido | Con `prefers-reduced-motion: reduce`: `animation-name: none` y duración 1 ms, pero **el diálogo sigue apareciendo**. El estado cambia, el recorrido no. |

## Estados de datos

- **Primera visita** con sugerencias.
- **Vacío tras saltarla:** no hay tres contenedores vacíos; sale una sola
  tarjeta con tres acciones directas.
- **Con datos** mediante «Ver un ejemplo» (11 accesos, 4 enlaces, 2 notas,
  5 tareas). Entrar y salir del ejemplo no toca los datos reales: comprobado
  leyendo `localStorage` antes y después.

### Fallos de la barra de comandos, encontrados probándola

Las tres primeras salidas de la barra traían: «Escribir un correo a factura»
(sinsentido), «Abrir la dirección» convirtiendo `ana@ejemplo.com` en
`https://ana@ejemplo.com`, y «Buscarlo en Google» ausente por caerse del límite.
Se corrigió haciendo que cada acción **declare qué tipo de dato admite**
(correo, teléfono, dirección, texto o ninguno) y ordenando por tipo que encaja.

## Fallos encontrados y corregidos durante las pruebas

1. **Duplicados por `www.`** — comparaba cadenas completas. Ahora compara una
   huella de la dirección (sin `www.`, sin barra final, sin distinguir
   mayúsculas).
2. **Texto desbordando las tarjetas del inicio** — las columnas de un grid
   tienen `min-width: auto` y no encogen por debajo de su contenido. Corregido
   con `minmax(0, …)` en cascada.
3. **Casilla de tarea empujada a la derecha** a 768 px (regla CSS demasiado
   amplia).
4. **Botones de grupo saliéndose del panel** en Colecciones (columna de 280 px
   para un contenido que pedía 340).
5. **Áreas táctiles por debajo de 44 px** en móvil, en cinco sitios.
6. **Herramientas no era alcanzable**: no estaba en ninguna navegación.
7. **Títulos duplicados** en Notas (el panel del editor se llamaba «Notas»,
   igual que la lista y el encabezado).
8. **El icono de ajustes era un menú hamburguesa**, no unos controles.

## Lo que NO se ha probado

- **Navegadores reales distintos de Chromium.** Todo está verificado en
  Chromium. No se ha abierto en Firefox ni en Safari, ni en un móvil físico.
- **Rendimiento medido.** No se ha pasado Lighthouse ni ninguna herramienta de
  métricas. Lo único medido son los tamaños del build: CSS 25,6 kB (6,1 kB
  comprimido), JS 299 kB (92 kB comprimido) y fondos de 11 a 16 kB.
- **Lector de pantalla.** Hay etiquetas, nombres accesibles, `aria-current`,
  gestión de foco y región en vivo, pero no se ha recorrido con NVDA ni VoiceOver.
- **Recorrido completo con el tabulador, pantalla por pantalla.** Se verificó el
  foco visible y el contrato de diálogos; no se tabuló cada vista entera.
- **Pruebas automatizadas.** No hay suite. Las comprobaciones de arriba se
  hicieron conduciendo el navegador, no con tests que se puedan repetir solos.
  Importación, validación y cálculos son los candidatos claros si se añade.
- **Fallo de escritura real.** La interfaz está preparada (`discoOk`) y no dice
  «Guardado» si falla, pero no se simuló una cuota llena.

## Nota sobre el entorno

Una vez el build murió con «out of memory» del proceso de Node. El código no
tenía nada que ver: con `NODE_OPTIONS=--max-old-space-size=4096` pasó a la
primera, y después volvió a funcionar sin la variable. Queda apuntado por si
reaparece en una máquina ajustada de memoria.
