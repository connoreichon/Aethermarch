#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Retoque fotografico para el videobook de Silvia.

Filosofia: SOLO revelado fotografico clasico. Nada generativo, nada de IA que
"reinvente" pixeles. No se altera la geometria, ni las proporciones, ni los
rasgos, ni el pelo, ni el cuerpo. La foto de salida tiene exactamente las
mismas dimensiones que la de entrada.

Lo que si se hace (lo que haria un retocador en Lightroom):
  1. Balance de blancos automatico (quita dominantes de color)
  2. Niveles / exposicion y recuperacion de altas luces y sombras
  3. Curva de contraste suave
  4. Reduccion de ruido conservando el detalle
  5. Suavizado de piel MUY sutil por separacion de frecuencias
  6. Enfoque (mascara de enfoque) con proteccion de zonas planas
  7. Vineteado apenas perceptible
  8. Borrado de marcas de agua por inpainting (solo sobre fondo)

Uso:
    python3 retoque.py --entrada ../fotos --salida ../retocadas
    python3 retoque.py --entrada foto.jpg --salida out/ --piel 0.35
"""

from __future__ import annotations

import argparse
import json
import sys
from dataclasses import dataclass, asdict
from pathlib import Path

import cv2
import numpy as np

EXTENSIONES = {".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff", ".bmp"}


# --------------------------------------------------------------------------
# utilidades de espacio de color
# --------------------------------------------------------------------------

def a_float(img_u8: np.ndarray) -> np.ndarray:
    """uint8 BGR -> float32 BGR en rango 0..1."""
    return img_u8.astype(np.float32) / 255.0


def a_u8(img_f: np.ndarray) -> np.ndarray:
    return np.clip(img_f * 255.0, 0, 255).astype(np.uint8)


def a_lineal(srgb: np.ndarray) -> np.ndarray:
    """sRGB 0..1 -> luz lineal. Las correcciones de exposicion y balance de
    blancos son fisicamente correctas solo en lineal."""
    return np.where(srgb <= 0.04045, srgb / 12.92, ((srgb + 0.055) / 1.055) ** 2.4)


def a_srgb(lin: np.ndarray) -> np.ndarray:
    lin = np.clip(lin, 0.0, None)
    return np.where(lin <= 0.0031308, lin * 12.92, 1.055 * (lin ** (1 / 2.4)) - 0.055)


def luminancia(bgr: np.ndarray) -> np.ndarray:
    """Luma Rec.709 a partir de BGR."""
    return 0.0722 * bgr[..., 0] + 0.7152 * bgr[..., 1] + 0.2126 * bgr[..., 2]


def es_monocromo(bgr_u8: np.ndarray, umbral: float = 6.0) -> bool:
    """Detecta blanco y negro para no aplicarle balance de blancos."""
    muestra = cv2.resize(bgr_u8, (256, 256), interpolation=cv2.INTER_AREA)
    hsv = cv2.cvtColor(muestra, cv2.COLOR_BGR2HSV)
    return float(hsv[..., 1].mean()) < umbral


# --------------------------------------------------------------------------
# 1. balance de blancos
# --------------------------------------------------------------------------

def balance_de_blancos(bgr: np.ndarray, fuerza: float = 0.85) -> np.ndarray:
    """Estima el iluminante y lo neutraliza.

    Combina 'white patch' (el 5% mas claro deberia ser neutro) con 'gray world'
    (la media de la escena deberia ser neutra). El white patch solo se calcula
    sobre pixeles no quemados, que es donde vive la informacion de color fiable.
    La correccion se limita para que la piel no vire a un tono raro.
    """
    lin = a_lineal(bgr)
    luz = luminancia(lin)

    # white patch: percentil alto, descartando lo que ya esta clipado
    validos = luz < 0.98
    if validos.sum() < 64:
        return bgr
    corte = np.percentile(luz[validos], 97.0)
    mascara = validos & (luz >= corte)
    if mascara.sum() < 32:
        mascara = validos
    wp = np.array([lin[..., c][mascara].mean() for c in range(3)], dtype=np.float64)

    # gray world sobre la escena entera
    gw = np.array([lin[..., c].mean() for c in range(3)], dtype=np.float64)

    estimacion = 0.65 * wp + 0.35 * gw
    estimacion = np.maximum(estimacion, 1e-6)

    ganancia = estimacion.mean() / estimacion
    # limitamos: mas de +-35% suele significar que la foto es de color a proposito
    ganancia = np.clip(ganancia, 0.65, 1.55)
    # aplicamos solo una fraccion, para no "lavar" la intencion del original
    ganancia = 1.0 + (ganancia - 1.0) * fuerza

    lin *= ganancia.astype(np.float32).reshape(1, 1, 3)
    return np.clip(a_srgb(lin), 0.0, 1.0)


# --------------------------------------------------------------------------
# 2. niveles y exposicion
# --------------------------------------------------------------------------

def auto_niveles(bgr: np.ndarray, recorte_bajo=0.15, recorte_alto=0.20,
                 banda=(0.38, 0.58), fuerza_exposicion=0.7) -> np.ndarray:
    """Expande el rango tonal y corrige la exposicion.

    Trabaja sobre la luminancia y aplica la misma escala a los tres canales,
    de modo que el color no se desplaza (a diferencia de un auto-levels por
    canal, que si mete dominantes).

    La exposicion solo se toca si la foto se sale de una banda comoda: asi una
    foto luminosa a proposito (pared blanca) sigue siendo luminosa y una foto
    de teatro con fondo negro sigue siendo oscura. Igualar todas a un mismo
    tono medio es justo lo que hace que un lote parezca procesado a maquina.
    """
    luz = luminancia(bgr)
    negro = np.percentile(luz, recorte_bajo)
    blanco = np.percentile(luz, 100.0 - recorte_alto)
    if blanco - negro < 0.05:
        return bgr

    # dejamos un pelin de aire: ni negro puro ni blanco puro
    negro = max(0.0, negro - 0.004)
    blanco = min(1.0, blanco + 0.004)

    out = (bgr - negro) / (blanco - negro)
    out = np.clip(out, 0.0, 1.0)

    # exposicion: llevamos la mediana hacia el objetivo con una gamma
    mediana = float(np.median(luminancia(out)))
    objetivo = float(np.clip(mediana, banda[0], banda[1]))
    if 0.02 < mediana < 0.98 and abs(objetivo - mediana) > 1e-3:
        gamma = np.log(max(objetivo, 1e-4)) / np.log(max(mediana, 1e-4))
        gamma = float(np.clip(gamma, 0.72, 1.38))
        gamma = 1.0 + (gamma - 1.0) * fuerza_exposicion
        out = np.power(out, 1.0 / gamma)

    return np.clip(out, 0.0, 1.0)


def recuperar_altas_y_sombras(bgr: np.ndarray, altas=0.30, sombras=0.26) -> np.ndarray:
    """Baja las altas luces y levanta las sombras, como los sliders de Camera Raw.

    Usa una mascara suavizada (luminancia desenfocada) para que la correccion
    sea local y no aplane el contraste global.
    """
    luz = luminancia(bgr)
    radio = max(3, int(min(bgr.shape[:2]) * 0.02) | 1)
    luz_suave = cv2.GaussianBlur(luz, (radio, radio), 0)

    m_altas = np.clip((luz_suave - 0.62) / 0.38, 0, 1) ** 1.5
    m_sombras = np.clip((0.42 - luz_suave) / 0.42, 0, 1) ** 1.5

    out = bgr.copy()
    out *= (1.0 - altas * m_altas)[..., None]
    out += (sombras * m_sombras * (0.30 - luz_suave * 0.22))[..., None]
    return np.clip(out, 0.0, 1.0)


def curva_contraste(bgr: np.ndarray, intensidad=0.16) -> np.ndarray:
    """Curva en S suave. Aumenta el contraste sin cerrar negros ni quemar blancos."""
    x = bgr
    s = x * x * (3.0 - 2.0 * x)          # smoothstep
    return np.clip(x + (s - x) * intensidad, 0.0, 1.0)


def saturacion_natural(bgr: np.ndarray, cantidad=0.12) -> np.ndarray:
    """'Vibrance': sube la saturacion de los colores apagados y respeta los que
    ya estan saturados (y muy especialmente los tonos de piel)."""
    if cantidad <= 0:
        return bgr
    luz = luminancia(bgr)[..., None]
    croma = bgr - luz
    sat_actual = np.linalg.norm(croma, axis=2, keepdims=True)
    peso = np.clip(1.0 - sat_actual * 2.6, 0.0, 1.0)
    return np.clip(luz + croma * (1.0 + cantidad * peso), 0.0, 1.0)


# --------------------------------------------------------------------------
# 3. ruido, piel y enfoque
# --------------------------------------------------------------------------

def mascara_de_piel(bgr_u8: np.ndarray) -> np.ndarray:
    """Mascara suave de tonos de piel en YCrCb (robusto a la iluminacion).

    Solo se usa para decidir DONDE suavizar levemente. No modifica la forma de
    nada: no hay deteccion de rasgos ni deformacion.
    """
    ycrcb = cv2.cvtColor(bgr_u8, cv2.COLOR_BGR2YCrCb)
    cr = ycrcb[..., 1].astype(np.float32)
    cb = ycrcb[..., 2].astype(np.float32)
    # rango clasico de piel, con caida gaussiana en vez de umbral duro
    d_cr = np.exp(-((cr - 152.0) ** 2) / (2 * 13.0 ** 2))
    d_cb = np.exp(-((cb - 116.0) ** 2) / (2 * 11.0 ** 2))
    m = d_cr * d_cb
    radio = max(3, int(min(bgr_u8.shape[:2]) * 0.01) | 1)
    m = cv2.GaussianBlur(m, (radio, radio), 0)
    return np.clip(m / (m.max() + 1e-6), 0.0, 1.0)


def reducir_ruido(bgr_u8: np.ndarray, fuerza: float = 1.0) -> np.ndarray:
    """Reduccion de ruido cromatico y de luminancia, suave.

    El ruido de color es el que mas delata a un movil, y se puede quitar casi
    entero sin perder detalle porque el ojo no resuelve croma fino.
    """
    if fuerza <= 0:
        return bgr_u8
    h_luma = float(np.clip(2.5 * fuerza, 0.5, 8.0))
    h_croma = float(np.clip(6.0 * fuerza, 1.0, 16.0))
    return cv2.fastNlMeansDenoisingColored(bgr_u8, None, h_luma, h_croma, 7, 21)


def suavizar_piel(bgr: np.ndarray, mascara: np.ndarray, cantidad: float = 0.28) -> np.ndarray:
    """Separacion de frecuencias 'ligera'.

    Se suaviza SOLO la baja frecuencia (manchas, irregularidades de tono) y se
    devuelve intacta la alta frecuencia (poro, textura, pelillos, lunares). Por
    eso la piel sigue pareciendo piel y no plastico: la textura real no se toca.
    """
    if cantidad <= 0:
        return bgr

    radio = max(3, int(min(bgr.shape[:2]) * 0.012) | 1)
    baja = cv2.bilateralFilter((bgr * 255).astype(np.uint8), 0, 26, radio).astype(np.float32) / 255.0
    baja_orig = cv2.GaussianBlur(bgr, (radio, radio), 0)
    alta = bgr - baja_orig                       # textura real, se conserva

    suavizada = np.clip(baja + alta, 0.0, 1.0)
    m = (mascara * cantidad)[..., None]
    return np.clip(bgr * (1.0 - m) + suavizada * m, 0.0, 1.0)


def enfocar(bgr: np.ndarray, cantidad=0.55, radio_rel=0.0012, umbral=0.012) -> np.ndarray:
    """Mascara de enfoque con umbral: enfoca los bordes reales y deja en paz
    las zonas planas (donde enfocar solo amplificaria ruido)."""
    if cantidad <= 0:
        return bgr
    radio = max(3, int(min(bgr.shape[:2]) * radio_rel) | 1)
    borroso = cv2.GaussianBlur(bgr, (radio, radio), 0)
    detalle = bgr - borroso
    fuerza = np.clip((np.abs(detalle).max(axis=2, keepdims=True) - umbral) / umbral, 0, 1)
    return np.clip(bgr + detalle * cantidad * fuerza, 0.0, 1.0)


def vineteado(bgr: np.ndarray, cantidad=0.14) -> np.ndarray:
    """Oscurecimiento perimetral muy leve. Centra la mirada en la cara."""
    if cantidad <= 0:
        return bgr
    h, w = bgr.shape[:2]
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    dx = (xx - w / 2) / (w / 2)
    dy = (yy - h / 2) / (h / 2)
    r = np.sqrt(dx * dx + dy * dy) / np.sqrt(2.0)
    mascara = 1.0 - cantidad * np.clip((r - 0.45) / 0.55, 0, 1) ** 2
    return np.clip(bgr * mascara[..., None], 0.0, 1.0)


# --------------------------------------------------------------------------
# 4. borrado de marcas de agua
# --------------------------------------------------------------------------

def detectar_texto_claro(roi_u8: np.ndarray) -> np.ndarray:
    """Mascara del texto de la marca de agua dentro de un recorte.

    El texto de fecha de una camara es: claro, de trazo fino, muy contrastado
    contra su entorno inmediato, y formado por manchas del tamano de una letra.
    Se filtra por esas cuatro cosas a la vez; con menos, el ruido del sensor
    tambien pasa el corte y el inpainting acaba destrozando el fondo.
    """
    gris = cv2.cvtColor(roi_u8, cv2.COLOR_BGR2GRAY)
    limpio = cv2.medianBlur(gris, 3)          # el ruido de un pixel no es texto

    h, w = limpio.shape
    lado = max(15, (int(min(h, w) * 0.09) | 1))
    nucleo = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (lado, lado))
    tophat = cv2.morphologyEx(limpio, cv2.MORPH_TOPHAT, nucleo)

    # umbral por encima del suelo de ruido real de esta foto (MAD, robusta)
    mad = float(np.median(np.abs(tophat.astype(np.float32) - np.median(tophat))))
    sigma = 1.4826 * mad
    umbral = float(np.clip(max(24.0, 5.0 * sigma), 24.0, 90.0))
    _, m = cv2.threshold(tophat, umbral, 255, cv2.THRESH_BINARY)

    # ademas tiene que ser claro en terminos absolutos
    m = cv2.bitwise_and(m, (limpio > np.percentile(limpio, 55)).astype(np.uint8) * 255)

    # el emoji de color: saturacion alta y mancha compacta
    hsv = cv2.cvtColor(cv2.medianBlur(roi_u8, 3), cv2.COLOR_BGR2HSV)
    m_color = ((hsv[..., 1] > 110) & (hsv[..., 2] > 120)).astype(np.uint8) * 255
    m = cv2.bitwise_or(m, m_color)

    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE,
                         cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3)))

    # nos quedamos solo con las manchas que tienen tamano y forma de caracter
    area_roi = float(h * w)
    n, etiquetas, est, _ = cv2.connectedComponentsWithStats(m, 8)
    filtrada = np.zeros_like(m)
    for i in range(1, n):
        x, y, cw, ch, area = est[i]
        if area < 12 or area > area_roi * 0.02:
            continue
        if ch < 5 or ch > h * 0.30 or cw > w * 0.30:
            continue
        if cw / max(1, ch) > 6.0:            # rayas largas = borde real, no letra
            continue
        if area / float(cw * ch) < 0.12:     # demasiado disperso = ruido
            continue
        filtrada[etiquetas == i] = 255

    if filtrada.sum() == 0:
        return filtrada

    # las letras van en linea: descartamos manchas sueltas lejos del bloque
    filas = (filtrada > 0).sum(axis=1)
    activas = np.where(filas > 0)[0]
    if activas.size:
        banda = np.zeros_like(filtrada)
        banda[max(0, activas.min() - 6):min(h, activas.max() + 7), :] = 255
        filtrada = cv2.bitwise_and(filtrada, banda)

    # estas marcas llevan sombra paralela oscura; si solo quitamos el trazo
    # claro queda un rastro de guiones. Buscamos trazos oscuros finos, pero
    # solo pegados al texto que ya hemos encontrado.
    blackhat = cv2.morphologyEx(limpio, cv2.MORPH_BLACKHAT, nucleo)
    _, m_sombra = cv2.threshold(blackhat, umbral, 255, cv2.THRESH_BINARY)
    vecindad = cv2.dilate(filtrada,
                          cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9)), iterations=2)
    filtrada = cv2.bitwise_or(filtrada, cv2.bitwise_and(m_sombra, vecindad))

    # engordamos para tapar el antialias
    filtrada = cv2.dilate(filtrada,
                          cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7)), iterations=2)
    return cv2.morphologyEx(filtrada, cv2.MORPH_CLOSE,
                            cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (13, 13)))


def borrar_marca(bgr_u8: np.ndarray, caja_rel: tuple[float, float, float, float]) -> np.ndarray:
    """Elimina una marca de agua reconstruyendo el fondo por inpainting.

    caja_rel = (x1, y1, x2, y2) en fraccion de la imagen (0..1).
    Se combinan los dos algoritmos de OpenCV (Telea y Navier-Stokes) porque
    cada uno falla de forma distinta y la media de ambos queda mas limpia.
    """
    h, w = bgr_u8.shape[:2]
    x1, y1, x2, y2 = caja_rel
    # margen extra para que el inpainting tenga contexto de donde copiar
    mx, my = int(0.05 * w), int(0.04 * h)
    ax1 = max(0, int(x1 * w) - mx)
    ay1 = max(0, int(y1 * h) - my)
    ax2 = min(w, int(x2 * w) + mx)
    ay2 = min(h, int(y2 * h) + my)

    roi = bgr_u8[ay1:ay2, ax1:ax2]
    if roi.size == 0:
        return bgr_u8

    m_roi = detectar_texto_claro(roi)

    # La caja que nos dan es una indicacion, no un recorte: si una letra queda
    # a caballo del borde, se elimina entera. Recortarla por la mitad deja
    # medio caracter pegado en la foto, que es peor que no tocar nada.
    interior = np.zeros_like(m_roi)
    ix1, iy1 = int(x1 * w) - ax1, int(y1 * h) - ay1
    ix2, iy2 = int(x2 * w) - ax1, int(y2 * h) - ay1
    interior[max(0, iy1):max(0, iy2), max(0, ix1):max(0, ix2)] = 255

    n, etiquetas, _, _ = cv2.connectedComponentsWithStats(m_roi, 8)
    conservada = np.zeros_like(m_roi)
    for i in range(1, n):
        comp = etiquetas == i
        if np.any(interior[comp]):
            conservada[comp] = 255
    m_roi = conservada

    if m_roi.sum() == 0:
        return bgr_u8

    a = cv2.inpaint(roi, m_roi, 7, cv2.INPAINT_TELEA)
    b = cv2.inpaint(roi, m_roi, 7, cv2.INPAINT_NS)
    reparado = cv2.addWeighted(a, 0.5, b, 0.5, 0)

    # el inpainting deja la zona demasiado lisa; le devolvemos el grano del
    # entorno para que no se note un "parche" mate
    ruido_ref = roi.astype(np.float32) - cv2.GaussianBlur(roi, (0, 0), 3).astype(np.float32)
    sigma = float(np.std(ruido_ref))
    if sigma > 0.6:
        rng = np.random.default_rng(7)
        grano = rng.normal(0, sigma * 0.35, reparado.shape).astype(np.float32)
        reparado = np.clip(reparado.astype(np.float32) + grano, 0, 255).astype(np.uint8)

    # fundido de bordes para que la costura sea invisible
    pluma = cv2.GaussianBlur(m_roi.astype(np.float32) / 255.0, (0, 0), 3.0)[..., None]
    mezcla = roi.astype(np.float32) * (1 - pluma) + reparado.astype(np.float32) * pluma

    out = bgr_u8.copy()
    out[ay1:ay2, ax1:ax2] = np.clip(mezcla, 0, 255).astype(np.uint8)
    return out


# --------------------------------------------------------------------------
# receta completa
# --------------------------------------------------------------------------

@dataclass
class Ajustes:
    balance: float = 0.85        # 0 = no tocar el color, 1 = neutralizar del todo
    exposicion: float = 0.7
    altas: float = 0.30
    sombras: float = 0.26
    contraste: float = 0.16
    vibrance: float = 0.12
    ruido: float = 1.0
    piel: float = 0.28           # suavizado de piel (0 = ninguno)
    enfoque: float = 0.55
    vineta: float = 0.14
    marca: tuple | None = None   # (x1,y1,x2,y2) relativo, para borrar marca de agua


def revelar(ruta: Path, aj: Ajustes) -> tuple[np.ndarray, dict]:
    bgr_u8 = cv2.imread(str(ruta), cv2.IMREAD_COLOR)
    if bgr_u8 is None:
        raise RuntimeError(f"No se pudo leer {ruta}")

    alto, ancho = bgr_u8.shape[:2]
    mono = es_monocromo(bgr_u8)
    info = {"archivo": ruta.name, "ancho": ancho, "alto": alto,
            "blanco_y_negro": mono, "pasos": []}

    if aj.marca:
        bgr_u8 = borrar_marca(bgr_u8, aj.marca)
        info["pasos"].append("marca_de_agua_borrada")

    if aj.ruido > 0:
        bgr_u8 = reducir_ruido(bgr_u8, aj.ruido)
        info["pasos"].append("reduccion_de_ruido")

    piel = mascara_de_piel(bgr_u8)
    img = a_float(bgr_u8)

    if not mono and aj.balance > 0:
        img = balance_de_blancos(img, aj.balance)
        info["pasos"].append("balance_de_blancos")

    img = auto_niveles(img, fuerza_exposicion=aj.exposicion)
    info["pasos"].append("niveles_y_exposicion")

    img = recuperar_altas_y_sombras(img, aj.altas, aj.sombras)
    info["pasos"].append("altas_luces_y_sombras")

    img = curva_contraste(img, aj.contraste)
    info["pasos"].append("curva_de_contraste")

    if not mono:
        img = saturacion_natural(img, aj.vibrance)
        info["pasos"].append("saturacion_natural")

    if aj.piel > 0:
        img = suavizar_piel(img, piel, aj.piel)
        info["pasos"].append("piel_suavizada_baja_frecuencia")

    img = enfocar(img, aj.enfoque)
    info["pasos"].append("enfoque")

    img = vineteado(img, aj.vineta)
    info["pasos"].append("vineteado")

    salida = a_u8(img)
    assert salida.shape == (alto, ancho, 3), "el retoque no debe cambiar el tamano"
    return salida, info


def main() -> int:
    p = argparse.ArgumentParser(description="Retoque fotografico no generativo")
    p.add_argument("--entrada", required=True, help="archivo o carpeta")
    p.add_argument("--salida", required=True, help="carpeta de destino")
    p.add_argument("--piel", type=float, default=Ajustes.piel)
    p.add_argument("--balance", type=float, default=Ajustes.balance)
    p.add_argument("--enfoque", type=float, default=Ajustes.enfoque)
    p.add_argument("--vineta", type=float, default=Ajustes.vineta)
    p.add_argument("--ruido", type=float, default=Ajustes.ruido)
    p.add_argument("--marca", default=None,
                   help="'auto', o x1,y1,x2,y2 relativos (0..1) de la marca a borrar")
    p.add_argument("--calidad", type=int, default=96)
    args = p.parse_args()

    entrada = Path(args.entrada)
    destino = Path(args.salida)
    destino.mkdir(parents=True, exist_ok=True)

    if entrada.is_dir():
        rutas = sorted(r for r in entrada.iterdir() if r.suffix.lower() in EXTENSIONES)
    else:
        rutas = [entrada]
    if not rutas:
        print(f"No hay imagenes en {entrada}", file=sys.stderr)
        return 1

    marca = None
    if args.marca == "auto":
        # esquina inferior derecha: donde las camaras estampan fecha y lugar
        marca = (0.38, 0.84, 1.0, 1.0)
    elif args.marca:
        marca = tuple(float(v) for v in args.marca.split(","))
        if len(marca) != 4:
            print("--marca necesita 4 numeros: x1,y1,x2,y2 (o 'auto')", file=sys.stderr)
            return 1

    aj = Ajustes(balance=args.balance, piel=args.piel, enfoque=args.enfoque,
                 vineta=args.vineta, ruido=args.ruido, marca=marca)

    informe = []
    for ruta in rutas:
        img, info = revelar(ruta, aj)
        fuera = destino / f"{ruta.stem}.jpg"
        cv2.imwrite(str(fuera), img,
                    [cv2.IMWRITE_JPEG_QUALITY, args.calidad, cv2.IMWRITE_JPEG_OPTIMIZE, 1])
        info["salida"] = fuera.name
        informe.append(info)
        marca_txt = " (marca borrada)" if marca else ""
        byn = " [B/N]" if info["blanco_y_negro"] else ""
        print(f"  ok  {ruta.name} -> {fuera.name}  {info['ancho']}x{info['alto']}{byn}{marca_txt}")

    (destino / "_informe_retoque.json").write_text(
        json.dumps({"ajustes": {k: v for k, v in asdict(aj).items()}, "fotos": informe},
                   indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"\n{len(informe)} fotos reveladas en {destino}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
