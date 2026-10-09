"""Fondo ambiental de Mi Punto.

NO es una fotografia. Es un cielo construido por codigo: degradado
vertical, luz lateral calida, horizonte bajo y grano fino. Se hace asi
porque en esta sesion no hay generacion de imagenes y una foto con
licencia habria que descargarla.

La composicion reserva la mitad superior central limpia: ahi van la
hora, el saludo y el buscador, y tienen que leerse.

Uso:  python scripts/generar_fondo.py
"""

from __future__ import annotations

import math
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

SALIDA = Path(__file__).resolve().parent.parent / "src" / "assets" / "fondos"

# Paleta del encargo. El cielo se mueve entre la tinta y un gris azulado
# claro; el acento calido es compatible con la mandarina de accion.
TINTA = (24, 43, 67)
CIELO_ALTO = (38, 62, 88)
CIELO_MEDIO = (96, 124, 146)
CIELO_BAJO = (186, 201, 208)
MAR = (58, 82, 102)
CALIDO = (246, 106, 56)


def mezcla(a: tuple[int, int, int], b: tuple[int, int, int], t: float) -> tuple[int, int, int]:
    return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))  # type: ignore[return-value]


def suave(t: float) -> float:
    """Curva en S: evita que el degradado se vea en bandas rectas."""
    return t * t * (3 - 2 * t)


def cielo(ancho: int, alto: int, horizonte: float) -> Image.Image:
    """Degradado vertical en tres tramos hasta el horizonte."""
    lienzo = Image.new("RGB", (1, alto))
    pintor = ImageDraw.Draw(lienzo)
    y_horizonte = alto * horizonte
    for y in range(alto):
        if y < y_horizonte:
            t = suave(y / y_horizonte)
            color = mezcla(CIELO_ALTO, CIELO_MEDIO, suave(min(1.0, t * 1.45))) if t < 0.62 \
                else mezcla(CIELO_MEDIO, CIELO_BAJO, suave((t - 0.62) / 0.38))
        else:
            t = (y - y_horizonte) / max(1.0, alto - y_horizonte)
            color = mezcla(mezcla(MAR, CIELO_BAJO, 0.35), TINTA, suave(t) * 0.75)
        pintor.point((0, y), fill=color)
    return lienzo.resize((ancho, alto), Image.Resampling.BILINEAR)


def luz_lateral(ancho: int, alto: int, horizonte: float, desde_izquierda: bool) -> Image.Image:
    """Resplandor calido bajo y lateral, como un sol fuera de cuadro."""
    capa = Image.new("L", (ancho, alto), 0)
    pintor = ImageDraw.Draw(capa)
    cx = ancho * (0.22 if desde_izquierda else 0.78)
    cy = alto * (horizonte - 0.06)
    radio = max(ancho, alto) * 0.58
    pasos = 90
    for i in range(pasos, 0, -1):
        r = radio * i / pasos
        valor = round(150 * (1 - i / pasos) ** 2.1)
        pintor.ellipse((cx - r, cy - r * 0.62, cx + r, cy + r * 0.62), fill=valor)
    return capa.filter(ImageFilter.GaussianBlur(radius=max(ancho, alto) * 0.035))


def promontorio(ancho: int, alto: int, horizonte: float, desde_izquierda: bool) -> Image.Image:
    """Costa lejana: una silueta muy baja y de poco contraste. Da
    profundidad sin competir con los controles."""
    capa = Image.new("L", (ancho, alto), 0)
    pintor = ImageDraw.Draw(capa)
    y0 = alto * horizonte
    pico = alto * 0.045
    puntos = [(0 if desde_izquierda else ancho, y0 + 2)]
    tramos = 48
    for i in range(tramos + 1):
        t = i / tramos
        x = ancho * (t if desde_izquierda else 1 - t)
        perfil = math.exp(-((t - 0.18) ** 2) / 0.012) * 1.0 + math.exp(-((t - 0.34) ** 2) / 0.03) * 0.55
        puntos.append((x, y0 - pico * perfil))
    puntos.append((ancho if desde_izquierda else 0, y0 + 2))
    pintor.polygon(puntos, fill=96)
    return capa.filter(ImageFilter.GaussianBlur(radius=max(2, ancho * 0.0012)))


def grano(ancho: int, alto: int, fuerza: int) -> Image.Image:
    """Ruido fino. Sin el, un degradado tan largo hace bandas visibles."""
    rnd = random.Random(20261010)
    pequeno = Image.new("L", (max(2, ancho // 2), max(2, alto // 2)))
    pequeno.putdata([128 + rnd.randint(-fuerza, fuerza) for _ in range(pequeno.width * pequeno.height)])
    return pequeno.resize((ancho, alto), Image.Resampling.BILINEAR)


def construir(ancho: int, alto: int, horizonte: float, desde_izquierda: bool = True) -> Image.Image:
    base = cielo(ancho, alto, horizonte)

    calido = Image.new("RGB", (ancho, alto), CALIDO)
    base = Image.composite(
        Image.blend(base, calido, 0.34), base, luz_lateral(ancho, alto, horizonte, desde_izquierda)
    )

    oscuro = Image.new("RGB", (ancho, alto), mezcla(TINTA, MAR, 0.45))
    base = Image.composite(oscuro, base, promontorio(ancho, alto, horizonte, desde_izquierda))

    # Linea de horizonte: un filo claro, no una raya dura
    filo = Image.new("L", (ancho, alto), 0)
    ImageDraw.Draw(filo).rectangle(
        (0, alto * horizonte - max(1, alto * 0.0012), ancho, alto * horizonte + max(1, alto * 0.0012)),
        fill=70,
    )
    filo = filo.filter(ImageFilter.GaussianBlur(radius=max(1, alto * 0.002)))
    base = Image.composite(Image.new("RGB", (ancho, alto), CIELO_BAJO), base, filo)

    # Vineteado muy leve hacia abajo, para asentar la interfaz
    sombra = Image.new("L", (1, alto))
    pintor = ImageDraw.Draw(sombra)
    for y in range(alto):
        t = y / alto
        pintor.point((0, y), fill=round(58 * max(0.0, (t - 0.55) / 0.45) ** 1.5))
    base = Image.composite(
        Image.new("RGB", (ancho, alto), TINTA), base, sombra.resize((ancho, alto), Image.Resampling.BILINEAR)
    )

    return Image.blend(base, Image.merge("RGB", (grano(ancho, alto, 7),) * 3), 0.035)


def main() -> None:
    SALIDA.mkdir(parents=True, exist_ok=True)
    piezas = [
        ("costa-escritorio", 2560, 1440, 0.74, True),
        ("costa-movil", 1170, 2200, 0.66, True),
        ("alba-escritorio", 2560, 1440, 0.78, False),
        ("alba-movil", 1170, 2200, 0.70, False),
    ]
    for nombre, ancho, alto, horizonte, izquierda in piezas:
        img = construir(ancho, alto, horizonte, izquierda)
        destino = SALIDA / f"{nombre}.webp"
        img.save(destino, "WEBP", quality=82, method=6)
        print(f"{destino.name}  {ancho}x{alto}  {destino.stat().st_size // 1024} kB")


if __name__ == "__main__":
    main()
