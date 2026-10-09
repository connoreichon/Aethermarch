# Diseño

Dirección **A, «Ventana personal»**: un fondo ambiental propio y, encima,
superficies claras y opacas donde se lee y se trabaja. Tres niveles y nada más:
fondo ambiental · superficies funcionales · controles.

Las otras dos direcciones que se barajaron, y por qué no:

- **Mesa de trabajo** (materiales táctiles, objetos de escritorio por zonas).
  Es la que se había desarrollado antes y la que se rechazó: terminaba en
  tarjetas iguales y en un panel de administración con textura.
- **Índice editorial** (protagonismo tipográfico, listas compactas, numeración).
  Ordena bien el contenido, pero convierte el inicio en un sumario: no da la
  sensación de sitio propio al que apetece volver, que es lo que se buscaba.

## Color

Todo en `src/estilos/tokens.css`. Contrastes **medidos**, no supuestos, sobre la
superficie clara `#F8F8F4`:

| Token | Valor | Contraste | Uso |
|---|---|---|---|
| `--txt` | `#1D2734` | 14,2:1 | texto principal |
| `--txt-2` | `#566373` | 5,8:1 | texto secundario |
| `--foco` | `#3559D8` | 5,5:1 | foco y selección |
| `--txt-error` | `#AC3035` | 6,1:1 | error |
| `--txt-exito` | `#27654C` | 6,5:1 | éxito |
| `--canto` | `#7E8C9B` | 3,2:1 | contorno de control (mínimo 3) |
| `--accion` | `#F66A38` | 3,0:1 | **no vale para texto** |
| `--c-mandarina-texto` | `#B3421A` | 5,3:1 | cuando hay que escribir en naranja |

Y sobre la mandarina: tinta cálida `#231206` da **6,1:1**; el blanco solo 3,2:1.
Por eso **el botón principal lleva texto oscuro**, no blanco.

El separador `#DDE2E7` es decorativo: no se usa nunca como contorno de control.

## Tipografía

Manrope (SIL OFL 1.1), servida desde el propio proyecto vía `@fontsource`: ni
una petición a terceros. Cuatro pesos, ni uno más (400, 500, 700, 800).

| Rol | Escritorio | Móvil |
|---|---|---|
| Hora | 64 px, peso 300 | 44 px |
| Saludo | 40 px, peso 800 | 30 px |
| Título de panel | 23 px | 20 px |
| Texto y campos | 16 px | 16 px |
| Secundario | 14 px | 14 px |

No hay texto esencial por debajo de 14 px. La jerarquía se hace con escala,
peso y posición, no poniéndolo todo en negrita.

## Composición

**Inicio (1440).** Cabecera de 72 px con marca, navegación discreta, ayuda y
ajustes. Debajo, bloque centrado de 880 px algo por encima del centro: hora y
fecha, saludo, **accesos**, buscador y tres tarjetas de contexto. En 1440×900
entra todo sin desplazarse (comprobado: 900 px de alto de página).

**Por qué los accesos van encima del buscador.** El encargo pedía lo contrario,
pero con el buscador arriba la pantalla se leía como una página de Google, y
ese buscador no busca en internet: solo en tus cosas. Invertirlo rompe el
patrón y coincide con el orden real de acciones (abrir una web habitual es la
primera). El campo lleva además el distintivo «en lo tuyo» y, cuando no hay
resultados, dice explícitamente que no busca en internet.

**Vistas internas** a 1080 px, en dos columnas donde hay lista y detalle
(Colecciones, Notas).

**Móvil (desde 360).** Márgenes de 18 px, cabecera compacta con marca,
herramientas, ayuda y ajustes, y barra inferior de cuatro destinos con espacio
seguro respetado. Los accesos pasan a tres columnas. No es el escritorio
encogido: la navegación cambia de sitio.

## Materiales e interacción

- **Botón principal:** 44 px (48 en móvil), radio 12, padding 18, degradado
  mandarina con canto más oscuro, luz interior muy tenue y sombra corta de
  contacto. Al pulsar baja 1 px con `transform` y pierde sombra; no mueve nada
  alrededor.
- **Secundario:** superficie neutra, contorno `--canto`, misma mecánica.
- **Campos:** el contorno, el radio y el anillo de foco viven en el envoltorio;
  el `input` va sin borde propio para que no se dibujen dos.
- **Áreas táctiles:** en móvil ningún control baja de 44×44 aunque su dibujo sea
  menor. Verificado midiendo todos los botones y enlaces de la página.

## Movimiento

Solo `opacity`, `transform` y `box-shadow`. Estados 150 ms, paneles 210 ms,
curva `cubic-bezier(.16, 1, .3, 1)`. Todo detrás de
`prefers-reduced-motion: no-preference`: con movimiento reducido los diálogos
**siguen apareciendo** pero sin recorrido (verificado: `animation-name: none`,
duración 1 ms, diálogo visible).

Nada de partículas, confeti, sonido ni animaciones perpetuas.

## Referencias

Cinco componentes de [21st.dev](https://21st.dev/) abiertos y manipulados en el
navegador, no vistos en una captura. No se ha copiado código de ninguno.

| Referencia | Qué observé | Qué me llevé | Qué descarté |
|---|---|---|---|
| [Texture Button](https://21st.dev/@cult-ui/components/texture-button) (cult/ui, MIT) | No dibuja borde: contenedor con degradado y `padding: 1px`. Radio exterior 12, interior 10. | La regla **radio interior = exterior − grosor del canto**. | Que al pulsar solo cambie el color: sin desplazamiento no se siente como pulsar. |
| [Tabs like bookmark](https://21st.dev/@k3menn/components/tabs-like-bookmark) (k3menn) | La pestaña activa se distingue por superficie, `z-index: 10` y radio solo arriba. | Que la selección se lleve por superficie **y** posición, no solo por color. | Su diferencia de superficie es tan floja que no se ve; aquí se le suma peso tipográfico. Y `transition: all`. |
| [Animated Check Box](https://21st.dev/@ringlabs/components/animated-check-box) (ringlabs) | El tic se dibuja con `stroke-dasharray` 40→0 en 400 ms, curva `(.16,1,.3,1)`. | La técnica del trazo que se dibuja y **la curva**, que es la de todo el proyecto. | El neón entero (`#00ffaa` sobre negro) y los 400 ms: aquí son 150. |
| [Input Group](https://21st.dev/@shadcn/components/input-group) (shadcn, MIT) | El borde, el radio y el foco van en el envoltorio; el `input` lleva `border: 0`. Transición limitada a color y sombra. | Las dos cosas, tal cual. | 36 px de alto y texto de 14: el mínimo aquí es 44 y 16 (16 evita además el zoom de iOS). |
| [Sheet](https://21st.dev/@kevingirelli/components/sheet) (kevingirelli) | Lo abrí y lo cerré con teclado: Escape cierra y **el foco vuelve al botón que lo abrió**. La animación va detrás de `motion-safe`. | El contrato de accesibilidad entero y poner el movimiento detrás de la preferencia. | El velo a negro puro al 50 %: aquí es tinta al 44 %, y en móvil la hoja sube desde abajo. |

Licencias comprobadas antes de mirar el código. Donde la ficha no declara
licencia, no se ha reutilizado nada: solo se estudió el comportamiento.
