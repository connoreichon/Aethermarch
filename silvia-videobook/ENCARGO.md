# Encargo: videobook de Silvia

Documento para retomar el trabajo desde una sesion de Claude Code que corra en
la maquina local (la que tiene acceso al escritorio y a las fotos).

La herramienta ya esta escrita, probada y subida. Lo que falta es meterle las
fotos reales, rellenar los datos de contacto y renderizar.

---

## 1. Punto de partida

- Repo: `connoreichon/Aethermarch`
- Rama: `claude/silvia-videobook-lx8yu2`
- Herramienta: carpeta `silvia-videobook/`
- Fotos originales: `~/Escritorio/videobooksilvia/` (12 archivos)

```bash
cd ~/Aethermarch
git fetch origin
git checkout claude/silvia-videobook-lx8yu2
git pull
```

## 2. Dependencias

```bash
pip install pillow numpy opencv-python-headless scipy
ffmpeg -version   # si no esta: brew install ffmpeg / apt install ffmpeg
```

## 3. Copiar y renombrar las fotos

Van a `silvia-videobook/fotos/` con estos nombres exactos, porque son los que
espera `config.json`. Hay que **mirar cada foto** y asignarle su nombre:

| Nombre destino | Como es la foto |
|---|---|
| `01_natural_retrato_a.jpg` | Selfie en un balcon. Pelo corto y ondulado castano, camiseta de tirantes rosa, colgante de espina de pez. Persiana y palmera al fondo. **Lleva marca de agua abajo a la derecha.** |
| `02_natural_retrato_b.jpg` | La otra selfie del mismo balcon, encuadre mas cercano. **Tambien lleva marca de agua.** |
| `03_criada_bn_puerta.jpg` | Blanco y negro, vertical. Personaje de criada con rulos, blusa de cuadros vichy y delantal negro, apoyada en el marco de una puerta con alicatado blanco, mano en la cadera. |
| `04_criada_color.jpg` | El mismo personaje en color, rulos rosa fucsia, fondo beige liso, sonriendo con las manos en las caderas. |
| `05_criada_bn_escena.jpg` | Blanco y negro. Sentada en una silla sobre escenario negro, con plumero. Perchero blanco con chaqueta y bolso al fondo. Calcetines blancos y zapatos negros. |
| `06_tragedia_sentada.jpg` | Vestido amarillo, sentada en el suelo sobre piedras blancas, ojos cerrados, mano en el hombro. Vegetacion seca detras. Vertical. |
| `07_tragedia_panuelo.jpg` | Vestido amarillo con panuelo blanco en la cabeza, dos hombres desenfocados al fondo. Apaisada. |
| `08_tragedia_brazo.jpg` | Vestido amarillo, brazo derecho extendido, hablando, pelo al viento. Apaisada. |
| `09_tragedia_mirada.jpg` | Vestido amarillo cruzado, de pie mirando hacia arriba, pelo al viento. Vertical. |
| `10_book_cuerpo_a.jpg` | Cuerpo entero, camiseta de tirantes rosa y pantalon corto rosa, descalza, esquina de pared blanca. Vertical. |
| `11_book_medio.jpg` | Medio cuerpo, misma ropa, pared clara, manos detras. Apaisada. |
| `12_book_cuerpo_b.jpg` | Cuerpo entero otra vez, misma ropa, otra pose. Vertical. |

Si alguna es `.jpeg`, `.png` o `.HEIC`, conviertela a `.jpg` antes.

## 4. Rellenar `config.json`

Dos cosas pendientes de la clienta:

1. **La cartela final** tiene tres lineas con `PENDIENTE:`. Sustituirlas por el
   correo, el telefono y la web reales. Si falta alguno, borrar esa linea.
2. **El nombre**: ahora pone `SILVIA` a secas, en la portada y en el final. En
   castings suele ir nombre y apellido; preguntar.

El borrado de marca de agua ya esta configurado para las dos selfies:

```json
"por_foto": {
  "01_natural_retrato_a.jpg": { "marca": "auto" },
  "02_natural_retrato_b.jpg": { "marca": "auto" }
}
```

`"auto"` busca en la esquina inferior derecha, que es donde esta el sello
`Piccolo Teatro` con la fecha. Si quedara algun resto, se le pasa la caja a
mano en coordenadas relativas: `"marca": [0.45, 0.86, 1.0, 1.0]`.

## 5. Previsualizar y luego renderizar

```bash
cd silvia-videobook
python3 scripts/hacer.py --rapido          # 720p, menos de un minuto
```

Revisar el resultado en `salida/`. Cuando este bien:

```bash
python3 scripts/hacer.py                   # 1080p + 1080x1920
```

Con musica, si la clienta manda una pista:

```bash
python3 scripts/hacer.py --musica ~/Escritorio/pista.mp3
```

## 6. Que revisar antes de entregar

- Las dos selfies: que no quede ni rastro del sello ni de su sombra.
- Las de la habitacion rosa: tenian una dominante magenta muy fuerte. Deben
  haber quedado neutras pero sin perder la calidez de la piel.
- Las de blanco y negro deben seguir en blanco y negro (el script las detecta
  solo y les salta el balance de blancos).
- Ninguna foto puede haber cambiado de dimensiones respecto al original.
- Que la piel siga teniendo textura. Si se ve de plastico, bajar `piel` en
  `config.json` de 0.28 a 0.15, o a 0.
- Que las letras de las cartelas esten quietas.

## 7. Reglas del retoque

**No usar nada generativo.** Ni upscalers con IA, ni "mejora de cara", ni
retoque por difusion. Todo el revelado del script es fotografico clasico:
balance de blancos, niveles, altas luces y sombras, curva, ruido, enfoque y
vineteado, mas un suavizado de piel por separacion de frecuencias que solo
toca la baja frecuencia y deja intacta la textura real.

La geometria no se toca: mismas dimensiones, mismas proporciones, mismos
rasgos, mismo pelo, mismo cuerpo. El unico sitio donde se reconstruyen pixeles
es la marca de agua, y cae sobre el fondo, no sobre ella.

## 8. Dos cosas que consultar con la clienta

- **Musica**: el video sale mudo. Hace falta una pista con licencia comercial
  (Epidemic Sound, Artlist, Uppbeat) o de dominio publico. Una con copyright
  se cae en Instagram y YouTube y da mala imagen en un envio a casting.
- **Las cuatro del vestido amarillo** parecen de una epoca bastante anterior a
  las demas. Estan agrupadas en su propio bloque, pero si son de hace muchos
  anos quiza compensa dejarlas fuera o hacerles un book aparte: un book que
  mezcla edades muy distintas confunde a quien reparte papeles.

## 9. Como esta montado el video

Portada -> 2 retratos naturales -> cartela PERSONAJES -> 3 de la criada ->
4 de la tragedia -> cartela BOOK -> 3 del book -> cartela final con contacto.

Salen unos 60 segundos. Todo el orden y los tiempos se cambian desde
`config.json`, sin tocar codigo. El detalle tecnico esta en `README.md`.
