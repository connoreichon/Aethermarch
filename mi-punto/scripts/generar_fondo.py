"""Fondo ambiental de Mi Punto.

NO es una fotografia: es una escena construida por codigo. Pero no son
cuatro degradados. La primera version lo era y se notaba al mirarla a
tamano real: mar plano, costura recta en el horizonte y bandas.

Lo que hace que aguante el 100 %:

  · Todo el mezclado va en luz lineal y solo al final se pasa a sRGB.
    Mezclar en sRGB es lo que ensucia los cielos.
  · Nubes con ruido fBm estirado en horizontal y comprimido hacia el
    horizonte: eso es la perspectiva de un cielo real.
  · El mar tiene olas cuya frecuencia crece con la distancia, un camino
    de brillos bajo el sol y oscurecimiento en primer plano.
  · El horizonte no es una linea dibujada: es bruma, que es lo que se
    ve de verdad.
  · Tramado de ruido triangular antes de cuantizar a 8 bits. Sin esto
    un degradado tan largo hace escalones, por muy bien calculado que
    este.

La mitad superior central se deja limpia y oscura: ahi van la hora, el
saludo y el buscador, y tienen que leerse en blanco.

Uso:  npm run fondos   (o  python scripts/generar_fondo.py)
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter1d, zoom

SALIDA = Path(__file__).resolve().parent.parent / "src" / "assets" / "fondos"
SEMILLA = 20261010

# ---------------------------------------------------------------- color

def srgb_a_lineal(c: np.ndarray) -> np.ndarray:
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


def lineal_a_srgb(c: np.ndarray) -> np.ndarray:
    c = np.clip(c, 0.0, 1.0)
    return np.where(c <= 0.0031308, c * 12.92, 1.055 * c ** (1 / 2.4) - 0.055)


def tinta(hex_: str) -> np.ndarray:
    """Un color de la paleta, ya en luz lineal."""
    v = np.array([int(hex_[i : i + 2], 16) for i in (1, 3, 5)], dtype=np.float32) / 255.0
    return srgb_a_lineal(v).astype(np.float32)


# Paleta de la escena. Parientes de los tokens del producto.
CENIT = tinta("#16293F")
CIELO_MEDIO = tinta("#3C5A77")
BRUMA = tinta("#C3CDD2")
SOL = tinta("#F6A06A")
MAR_LEJOS = tinta("#8595A0")
MAR_CERCA = tinta("#22354A")
TIERRA = tinta("#4A5E6E")


# ---------------------------------------------------------------- ruido

def ruido_valor(alto: int, ancho: int, celdas_y: int, celdas_x: int, rng) -> np.ndarray:
    """Ruido suave: una rejilla pequena ampliada con interpolacion
    bicubica. Barato y sin artefactos de rejilla visibles."""
    base = rng.random((max(2, celdas_y), max(2, celdas_x))).astype(np.float32)
    return np.clip(
        zoom(base, (alto / base.shape[0], ancho / base.shape[1]), order=3), 0.0, 1.0
    )[:alto, :ancho]


def fbm(alto: int, ancho: int, celdas_y: int, celdas_x: int, octavas: int, rng) -> np.ndarray:
    """Suma de octavas. Cada una duplica el detalle y pesa la mitad."""
    total = np.zeros((alto, ancho), dtype=np.float32)
    amplitud, peso = 1.0, 0.0
    for i in range(octavas):
        total += amplitud * ruido_valor(alto, ancho, celdas_y * 2**i, celdas_x * 2**i, rng)
        peso += amplitud
        amplitud *= 0.5
    return total / peso


def suave(x: np.ndarray) -> np.ndarray:
    x = np.clip(x, 0.0, 1.0)
    return x * x * (3 - 2 * x)


# ------------------------------------------------------------- escena

def construir(ancho: int, alto: int, horizonte: float, sol_x: float) -> Image.Image:
    rng = np.random.default_rng(SEMILLA)
    y = np.linspace(0.0, 1.0, alto, dtype=np.float32)[:, None]
    x = np.linspace(0.0, 1.0, ancho, dtype=np.float32)[None, :]
    yh = alto * horizonte

    lienzo = np.zeros((alto, ancho, 3), dtype=np.float32)

    # ---- cielo: cenit -> medio -> bruma, con la curva cargada abajo --
    t = suave(np.clip(y / horizonte, 0, 1))
    t_bruma = suave(np.clip((y / horizonte - 0.58) / 0.42, 0, 1)) ** 1.9
    cielo = CENIT * (1 - t)[..., None] + CIELO_MEDIO * t[..., None]
    cielo = cielo * (1 - t_bruma)[..., None] + BRUMA * t_bruma[..., None]

    # ---- luz del sol: fuera de cuadro, justo bajo el horizonte -------
    dx = (x - sol_x) * 1.35
    dy = (y - horizonte * 1.01) * 3.2
    dist = np.sqrt(dx**2 + dy**2)
    resplandor = np.exp(-(dist**1.7) * 7.0).astype(np.float32)
    cielo = cielo + SOL * (resplandor * 0.26)[..., None]

    # ---- nubes: fBm estirado y comprimido hacia el horizonte ---------
    # La compresion vertical es la perspectiva: las nubes lejanas se
    # aplastan contra la linea del horizonte.
    perspectiva = np.clip(y / horizonte, 0.0, 1.0)
    altura_nube = 1.0 - (1.0 - perspectiva) ** 0.42
    idx = np.clip((altura_nube * (alto - 1)), 0, alto - 1).astype(np.int32)

    # Bandas: frecuencia alta en vertical y baja en horizontal
    nube_base = fbm(alto, ancho, 11, 3, 4, rng)
    nubes = nube_base[idx, np.arange(ancho)[None, :]]
    nubes = gaussian_filter1d(nubes, sigma=1.6, axis=0)
    nubes = gaussian_filter1d(nubes, sigma=ancho * 0.004, axis=1)

    # Solo nubes en la franja media-alta; nada pegado al horizonte
    mascara = suave(np.clip((perspectiva - 0.10) / 0.35, 0, 1)) * suave(
        np.clip((0.90 - perspectiva) / 0.30, 0, 1)
    )
    jirones = np.clip((nubes - 0.56) * 2.2, 0, 1) * mascara
    jirones = jirones.astype(np.float32)

    # Las nubes aclaran, y por debajo cogen la luz calida del sol
    luz_nube = BRUMA * 0.80 + SOL * (resplandor * 0.55)[..., None]
    cielo = cielo * (1 - jirones * 0.38)[..., None] + luz_nube * (jirones * 0.38)[..., None]

    lienzo[:] = cielo

    # ---- mar ---------------------------------------------------------
    bajo = y >= horizonte
    prof = np.clip((y - horizonte) / max(1e-6, 1.0 - horizonte), 0, 1)
    prof_s = suave(prof)

    caida = (prof_s ** 0.75)
    agua = MAR_LEJOS * (1 - caida)[..., None] + MAR_CERCA * caida[..., None]

    # Reflejo del sol: columna ensanchada hacia el espectador
    ancho_reflejo = 0.030 + prof * 0.20
    reflejo = np.exp(-((x - sol_x) ** 2) / (2 * ancho_reflejo**2))
    reflejo = reflejo * np.exp(-prof * 3.4)

    # Olas: la frecuencia crece hacia el horizonte (perspectiva)
    escala = np.clip(prof, 0.012, 1.0)
    fila_ola = np.clip((np.log(escala / 0.012) / np.log(1 / 0.012)) * (alto - 1), 0, alto - 1)
    idx_ola = fila_ola.astype(np.int32)
    olas_base = fbm(alto, ancho, 90, 16, 4, rng)
    olas = olas_base[idx_ola, np.arange(ancho)[None, :]]
    olas = (olas - olas.mean()) * 2.0

    # El brillo solo existe donde hay cresta y donde da la luz
    destellos = np.clip(olas, 0, 1) ** 1.6 * reflejo
    agua = agua + SOL * (destellos * 0.70)[..., None]
    # Textura general muy leve, para que el agua no sea una plancha
    agua = agua * (1.0 + olas * 0.035 * (1 - prof_s * 0.6))[..., None]

    lienzo = np.where(bajo[..., None], agua, lienzo)

    # ---- promontorio: silueta irregular que se come la bruma ---------
    perfil = fbm(1, ancho, 1, 5, 4, rng)[0]
    perfil = gaussian_filter1d(perfil, sigma=ancho * 0.012)
    perfil = (perfil - perfil.min()) / max(1e-6, float(np.ptp(perfil)))
    joroba = np.exp(-((np.linspace(0, 1, ancho) - (sol_x + 0.12)) ** 2) / 0.030)
    # La altura va con el ANCHO: si va con el alto, en el recorte
    # vertical de movil el promontorio se convierte en un volcan.
    altura = (perfil * 0.45 + joroba * 0.9) * ancho * 0.031
    cresta = yh - altura
    es_tierra = (np.arange(alto)[:, None] >= cresta[None, :]) & (np.arange(alto)[:, None] < yh)
    # Perspectiva aerea: lo lejano se disuelve en la bruma
    velo = 0.62
    tierra = TIERRA * (1 - velo) + BRUMA * velo
    lienzo = np.where(es_tierra[..., None], tierra + SOL * (resplandor * 0.12)[..., None], lienzo)

    # ---- bruma del horizonte: sin linea dibujada ---------------------
    franja = np.exp(-(((y - horizonte) * alto / (alto * 0.009)) ** 2))
    lienzo = lienzo * (1 - franja * 0.30)[..., None] + (BRUMA * 0.98) * (franja * 0.30)[..., None]

    # ---- asiento: la interfaz necesita algo mas oscuro abajo ---------
    vineta = suave(np.clip((y - 0.58) / 0.42, 0, 1)) ** 1.3
    lienzo = lienzo * (1 - vineta * 0.34)[..., None] + CENIT * (vineta * 0.34)[..., None]

    # ---- a sRGB + tramado --------------------------------------------
    salida = lineal_a_srgb(lienzo)
    # Ruido triangular de +-1 nivel: convierte los escalones en grano
    tramado = (rng.random(salida.shape, dtype=np.float32) - rng.random(salida.shape, dtype=np.float32))
    salida = salida + tramado * (1.4 / 255.0)
    return Image.fromarray(np.clip(salida * 255.0 + 0.5, 0, 255).astype(np.uint8), "RGB")


def main() -> None:
    SALIDA.mkdir(parents=True, exist_ok=True)
    piezas = [
        ("costa-escritorio", 2560, 1440, 0.705, 0.26),
        ("costa-movil", 1170, 2200, 0.620, 0.30),
        ("alba-escritorio", 2560, 1440, 0.760, 0.74),
        ("alba-movil", 1170, 2200, 0.660, 0.70),
    ]
    for nombre, ancho, alto, horizonte, sol in piezas:
        img = construir(ancho, alto, horizonte, sol)
        destino = SALIDA / f"{nombre}.webp"
        img.save(destino, "WEBP", quality=90, method=6)
        print(f"{destino.name}  {ancho}x{alto}  {destino.stat().st_size // 1024} kB")


if __name__ == "__main__":
    main()
