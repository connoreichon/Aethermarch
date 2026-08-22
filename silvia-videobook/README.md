# Videobook de Silvia

Monta un videobook a partir de sus fotos: las revela con criterio fotografico
y las encadena en un video con movimiento, rotulos y musica.

## Uso rapido

```bash
cd silvia-videobook
python3 scripts/hacer.py          # retoca todo y monta los dos formatos
```

Salida en `salida/`:

| Archivo | Para que |
|---|---|
| `silvia_videobook_horizontal.mp4` | 1920x1080 — castings, YouTube, Vimeo, la web |
| `silvia_videobook_vertical.mp4` | 1080x1920 — Instagram, TikTok |

Otras opciones:

```bash
python3 scripts/hacer.py --rapido                  # 720p, para revisar en 40s
python3 scripts/hacer.py --solo-retoque            # solo las fotos
python3 scripts/hacer.py --solo-video              # solo el montaje
python3 scripts/hacer.py --formatos horizontal     # un formato nada mas
python3 scripts/hacer.py --musica pista.mp3
```

## Como se cambia algo

Todo esta en `config.json`. No hace falta tocar codigo.

- **Orden y agrupacion de las fotos** → el array `secuencia`.
- **Textos** (nombre, secciones, contacto) → los campos `titulo`,
  `subtitulo` y `lineas`.
- **Duracion de cada foto** → `duracion` de cada bloque (segundos).
- **Retoque de una foto concreta** → `retoque.por_foto`.

Un bloque de fotos acepta `"archivos": [...]` con nombres explicitos, o
`"patron": "03_*.jpg"` para cogerlas por comodin en orden alfabetico.

## El retoque

Es revelado fotografico clasico, **nada generativo**. No se altera la
geometria, ni las proporciones, ni los rasgos, ni el pelo, ni el cuerpo: la
foto de salida tiene exactamente las mismas dimensiones que la de entrada y
la persona es la misma, pixel a pixel, salvo por luz y color.

En orden:

1. **Balance de blancos** — quita dominantes (las de la habitacion rosa las
   tienen muy fuertes). Las fotos en blanco y negro se detectan solas y se
   saltan este paso.
2. **Niveles y exposicion** — expande el rango tonal. La exposicion solo se
   corrige si la foto se sale de una banda comoda, para que una foto luminosa
   a proposito siga siendo luminosa y una de teatro con fondo negro siga
   siendo oscura.
3. **Altas luces y sombras** — recupera detalle en los dos extremos.
4. **Curva de contraste** en S, suave.
5. **Saturacion natural** — sube el color apagado y respeta la piel.
6. **Reduccion de ruido** — sobre todo el ruido de color, que es lo que
   delata a un movil.
7. **Piel** — separacion de frecuencias: se suaviza solo la baja frecuencia
   (irregularidades de tono) y se devuelve intacta la alta frecuencia (poro,
   textura, lunares, pelillos). Por eso la piel sigue pareciendo piel. Se
   controla con `piel` (0 = no tocar; por defecto 0.28, discreto).
8. **Enfoque** con umbral, para no amplificar ruido en zonas planas.
9. **Vineteado** apenas perceptible.

### Borrar marcas de agua

Para las fotos con el sello de fecha (`Piccolo Teatro` + fecha):

```json
"por_foto": { "01_natural_retrato_a.jpg": { "marca": "auto" } }
```

`"auto"` mira la esquina inferior derecha. Si la marca esta en otro sitio se
le pasa la caja a mano en coordenadas relativas: `"marca": [0.5, 0.88, 1, 1]`.

Dentro de esa zona se busca texto de verdad (trazo claro y fino, contrastado,
con manchas del tamano de un caracter) y se reconstruye el fondo por
inpainting. La caja es una indicacion, no un recorte: una letra a caballo del
borde se elimina entera. Solo funciona bien si la marca cae sobre fondo; si
pisa la cara, mejor recortar la foto.

## El montaje

Los fotogramas se generan en Python y se le pasan a ffmpeg por tuberia.

- **Movimiento** Ken Burns lento, alternando acercamiento y alejamiento, con
  la deriva cambiando de foto en foto para que no se note el patron.
- **Fotos verticales en marco horizontal** (y al reves): se muestran enteras
  sobre una version desenfocada y apagada de si mismas, con una sombra suave
  debajo. Nunca aparecen bandas negras. El fondo se mueve al reves que la
  foto: da sensacion de profundidad.
- **Encadenados** de 0,9 s con curva suave.
- **Acabado comun**: grano de pelicula muy fino y un viraje leve (sombras
  algo frias, luces algo calidas). Es lo que hace que fotos de camaras,
  epocas y luces distintas parezcan del mismo trabajo.
- **Tipografia**: Cormorant Garamond para los nombres y Jost para los datos,
  ambas con tracking amplio.

## Musica

No lleva por defecto. Con `--musica pista.mp3` (o `"musica"` en el config) se
anade, con entrada y salida en fundido ajustadas a la duracion del video.

Hay que usar una pista con licencia para uso comercial (Epidemic Sound,
Artlist, Uppbeat) o de dominio publico. Una pista con copyright hace que se
caiga el video en Instagram y YouTube y da mala imagen en un envio a casting.

## Estructura

```
silvia-videobook/
├── config.json          todo lo configurable
├── fotos/               originales (entrada)
├── retocadas/           fotos ya reveladas (intermedio)
├── salida/              los MP4
├── assets/fonts/        Cormorant Garamond y Jost (SIL Open Font License)
└── scripts/
    ├── hacer.py         retoque + montaje de una pasada
    ├── retoque.py       el revelado
    └── videobook.py     el montaje
```

## Dependencias

```bash
pip install pillow numpy opencv-python-headless scipy
npm install ffmpeg-static      # o un ffmpeg del sistema
```

`videobook.py` usa `trabajo/ffmpeg` si existe, y si no el `ffmpeg` del PATH.
