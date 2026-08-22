#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Montador del videobook.

Genera el video fotograma a fotograma en Python (numpy) y se lo pasa a ffmpeg
por tuberia. Hacerlo asi da control fino sobre el movimiento, los fundidos y la
tipografia, que es donde se nota si un videobook parece profesional o casero.

Dos decisiones importantes de calidad:

  * Todo se dibuja a mayor resolucion de la que se entrega y se reduce al final
    promediando (supermuestreo). Es antialiasing de verdad: los bordes de las
    fotos, las sombras y las letras dejan de hervir cuando hay movimiento.

  * Los rotulos NO se reescalan nunca. Un texto rasterizado al que se le aplica
    un zoom lentisimo cambia de patron de antialiasing en cada fotograma, y los
    trazos finos de una serif se ponen a temblar. Aqui el texto se dibuja una
    sola vez y lo unico que se anima es la opacidad y una linea que se traza
    por geometria.

Uso:
    python3 videobook.py --config ../config.json
    python3 videobook.py --config ../config.json --formato vertical
    python3 videobook.py --config ../config.json --rapido   (previsualizacion)
"""

from __future__ import annotations

import argparse
import json
import math
import subprocess
import sys
from dataclasses import dataclass, field
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

RAIZ = Path(__file__).resolve().parent.parent
FUENTE_SERIF = RAIZ / "assets" / "fonts" / "CormorantGaramond.ttf"
FUENTE_SANS = RAIZ / "assets" / "fonts" / "Jost.ttf"

FORMATOS = {
    "horizontal": (1920, 1080),   # casting, YouTube, Vimeo
    "vertical": (1080, 1920),     # Instagram / TikTok
    "cuadrado": (1080, 1080),
}

# supermuestreo por nivel de calidad
CALIDADES = {"alta": 1.5, "media": 1.25, "borrador": 1.0}

CREMA = (233, 226, 214)
CREMA_TENUE = (168, 160, 148)
NEGRO = (10, 9, 8)
BORDE_FOTO = (196, 202, 210)      # BGR, crema apagado


# --------------------------------------------------------------------------
# curvas de animacion
# --------------------------------------------------------------------------

def suave(t: float) -> float:
    """Ease in-out. El movimiento arranca y para sin tirones."""
    t = min(max(t, 0.0), 1.0)
    return t * t * (3.0 - 2.0 * t)


def suave_fuerte(t: float) -> float:
    t = min(max(t, 0.0), 1.0)
    return 0.5 * (1 - math.cos(math.pi * t))


def lut_opacidad(alfa: float) -> np.ndarray:
    """Tabla para atenuar una imagen entera. cv2.LUT es mucho mas rapido que
    multiplicar en float, y a estas resoluciones eso se nota."""
    return np.clip(np.arange(256, dtype=np.float32) * alfa, 0, 255).astype(np.uint8)


# --------------------------------------------------------------------------
# tipografia
# --------------------------------------------------------------------------

def cargar_fuente(ruta: Path, tam: int, variante: str | None = None) -> ImageFont.FreeTypeFont:
    f = ImageFont.truetype(str(ruta), max(1, tam))
    if variante:
        try:
            f.set_variation_by_name(variante)
        except Exception:
            pass
    return f


def ancho_texto(draw: ImageDraw.ImageDraw, texto: str, fuente, espaciado: float) -> float:
    if not texto:
        return 0.0
    total = sum(draw.textlength(c, font=fuente) for c in texto)
    return total + espaciado * (len(texto) - 1)


def dibujar_espaciado(draw: ImageDraw.ImageDraw, xy, texto: str, fuente,
                      color, espaciado: float):
    """Dibuja texto centrado con tracking (separacion entre letras).

    PIL no sabe hacer letter-spacing, y sin tracking los titulos en mayusculas
    quedan apretados y con pinta de plantilla barata.
    """
    x, y = xy
    x -= ancho_texto(draw, texto, fuente, espaciado) / 2
    for c in texto:
        draw.text((x, y), c, font=fuente, fill=color)
        x += draw.textlength(c, font=fuente) + espaciado


# --------------------------------------------------------------------------
# escenas
# --------------------------------------------------------------------------

class Escena:
    n_frames: int = 0

    def render(self, i: int) -> np.ndarray:
        raise NotImplementedError


@dataclass
class Cartela(Escena):
    """Rotulo sobre fondo negro: portada, separadores y despedida.

    El texto se rasteriza una unica vez y ya no se vuelve a tocar su geometria.
    Lo que da vida a la cartela es el fundido y una linea fina que se traza
    desde el centro; la linea se dibuja por geometria en cada fotograma, asi
    que crece limpia y sin hervir.
    """
    ancho: int
    alto: int
    fps: int
    titulo: str = ""
    subtitulo: str = ""
    lineas: list = field(default_factory=list)
    duracion: float = 3.4
    regla: bool = True
    escala_titulo: float = 1.0

    def __post_init__(self):
        self.n_frames = max(1, int(round(self.duracion * self.fps)))
        self._regla_y = None
        self._regla_ancho = 0
        self._base = self._componer()

    def _componer(self) -> np.ndarray:
        W, H = self.ancho, self.alto
        base = min(W, H)

        # degradado radial muy tenue: evita el negro plano de presentacion
        yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
        r = np.sqrt(((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2)
        halo = np.clip(1.0 - r / 1.5, 0, 1) ** 2 * 16.0
        fondo = np.array(Image.new("RGB", (W, H), NEGRO), dtype=np.float32) + halo[..., None]
        lienzo = Image.fromarray(np.clip(fondo, 0, 255).astype(np.uint8))
        d = ImageDraw.Draw(lienzo)

        # Maquetamos el bloque entero y luego lo centramos verticalmente.
        # Ir colocando cada linea "a ojo" respecto al centro es lo que hace que
        # el subtitulo acabe pisando al contacto cuando la cartela lleva mucho.
        piezas = []   # (texto, fuente, color, tracking, alto_linea, hueco_antes)

        if self.titulo:
            tam = max(8, int(base * 0.135 * self.escala_titulo))
            f = cargar_fuente(FUENTE_SERIF, tam, "Light")
            piezas.append((self.titulo, f, CREMA, tam * 0.16, tam * 1.06, 0.0))
            if self.regla:
                piezas.append((None, None, None, 0, 1, tam * 0.30))
            if self.subtitulo:
                tam_s = max(6, int(base * 0.026))
                fs = cargar_fuente(FUENTE_SANS, tam_s, "Light")
                piezas.append((self.subtitulo, fs, CREMA_TENUE, tam_s * 0.46,
                               tam_s * 1.2, tam * 0.26))

        if self.lineas:
            tam_l = max(6, int(base * 0.028))
            fl = cargar_fuente(FUENTE_SANS, tam_l, "Light")
            for k, linea in enumerate(self.lineas):
                hueco = base * 0.075 if k == 0 and self.titulo else tam_l * 0.75
                piezas.append((linea, fl, CREMA_TENUE, tam_l * 0.20, tam_l * 1.2, hueco))

        if not piezas:
            return cv2.cvtColor(np.array(lienzo), cv2.COLOR_RGB2BGR)

        total = sum(h + hueco for _, _, _, _, h, hueco in piezas)
        y = H / 2 - total / 2

        for texto, fuente, color, tracking, alto_linea, hueco in piezas:
            y += hueco
            if texto is None:
                # la reglita no se pinta aqui: se anima en cada fotograma
                self._regla_y = int(round(y))
                self._regla_ancho = int(base * 0.055)
            else:
                dibujar_espaciado(d, (W / 2, y), texto, fuente, color, tracking)
            y += alto_linea

        return cv2.cvtColor(np.array(lienzo), cv2.COLOR_RGB2BGR)

    def render(self, i: int) -> np.ndarray:
        n = self.n_frames
        ent = min(1.0, i / max(1.0, 0.30 * n))
        sal = min(1.0, (n - 1 - i) / max(1.0, 0.30 * n))
        alfa = suave(min(ent, sal))

        if alfa >= 0.999:
            frame = self._base.copy()
        else:
            frame = cv2.LUT(self._base, lut_opacidad(alfa))

        if self._regla_y is not None:
            # se traza desde el centro durante el primer tercio. Las
            # coordenadas van en punto fijo (shift) para que crezca con
            # precision de subpixel: a saltos de pixel entero se ve escalonada.
            crecer = suave(min(1.0, i / max(1.0, 0.35 * n)))
            mitad = self._regla_ancho * crecer
            if mitad >= 0.5:
                SHIFT = 4
                k = 1 << SHIFT
                c = tuple(int(v * alfa) for v in CREMA_TENUE)
                x = self.ancho / 2
                y = self._regla_y
                grosor = max(1, int(round(self.ancho * 0.0008)))
                cv2.line(frame,
                         (int((x - mitad) * k), int(y * k)),
                         (int((x + mitad) * k), int(y * k)),
                         c, grosor, cv2.LINE_AA, SHIFT)
        return frame


@dataclass
class Foto(Escena):
    """Una foto con movimiento Ken Burns.

    Segun cuanto se parezca la proporcion de la foto a la del marco, se elige
    entre llenar el encuadre (recortando un poco) o mostrarla entera sobre una
    version desenfocada de ella misma. Lo segundo evita las bandas negras de
    las verticales, que es lo que delata un montaje casero.
    """
    ruta: Path
    ancho: int
    alto: int
    fps: int
    duracion: float = 4.8
    direccion: int = 1              # 1 acerca, -1 aleja
    deriva: tuple = (0.0, 0.0)      # hacia donde se desplaza el encuadre
    zoom: float = 0.065

    def __post_init__(self):
        self.n_frames = max(1, int(round(self.duracion * self.fps)))
        self._preparar()

    # -- preparacion ------------------------------------------------------

    @staticmethod
    def _ventana_base(iw: int, ih: int, aspecto: float) -> tuple[int, int]:
        """El rectangulo mas grande con esa proporcion que cabe en la imagen."""
        if iw / ih > aspecto:
            return max(1, int(round(ih * aspecto))), ih
        return iw, max(1, int(round(iw / aspecto)))

    def _preparar(self):
        img = cv2.imread(str(self.ruta), cv2.IMREAD_COLOR)
        if img is None:
            raise RuntimeError(f"No se pudo leer la foto {self.ruta}")

        W, H = self.ancho, self.alto
        ih, iw = img.shape[:2]
        self.llenar = 0.82 <= ((iw / ih) / (W / H)) <= 1.22

        if self.llenar:
            self.pw, self.ph = W, H
        else:
            esc = min(W * 0.94 / iw, H * 0.94 / ih)
            self.pw = max(2, int(round(iw * esc)) & ~1)
            self.ph = max(2, int(round(ih * esc)) & ~1)
        self.px = (W - self.pw) // 2
        self.py = (H - self.ph) // 2

        # resolucion de trabajo: la justa para el zoom maximo, ni un pixel mas
        aspecto = self.pw / self.ph
        bw, _ = self._ventana_base(iw, ih, aspecto)
        escala = min(1.0, (self.pw * (1.0 + self.zoom)) / bw)
        if escala < 0.98:
            nw, nh = max(2, int(iw * escala)), max(2, int(ih * escala))
            self._frente = cv2.resize(img, (nw, nh), interpolation=cv2.INTER_AREA)
        else:
            self._frente = img

        if self.llenar:
            self._fondo = None
            self._sombra = None
            self._borde = None
        else:
            self._fondo = self._hacer_fondo(img)
            self._sombra = self._hacer_sombra()
            self._borde = self._hacer_borde()

    def _hacer_fondo(self, img: np.ndarray) -> np.ndarray:
        """La propia foto, ampliada a cubrir, muy desenfocada y apagada."""
        W, H = self.ancho, self.alto
        ih, iw = img.shape[:2]
        esc = max(W / iw, H / ih) * (1.0 + self.zoom * 0.5 + 0.04)
        fw, fh = max(2, int(iw * esc)), max(2, int(ih * esc))
        f = cv2.resize(img, (fw, fh),
                       interpolation=cv2.INTER_AREA if esc < 1 else cv2.INTER_LINEAR)
        k = max(3, (int(min(W, H) * 0.06) | 1))
        f = cv2.GaussianBlur(f, (k, k), 0)
        gris = cv2.cvtColor(f, cv2.COLOR_BGR2GRAY)
        f = cv2.addWeighted(f, 0.55, cv2.cvtColor(gris, cv2.COLOR_GRAY2BGR), 0.45, 0)
        return (f.astype(np.float32) * 0.32).astype(np.uint8)

    def _hacer_sombra(self) -> np.ndarray:
        """Sombra suave bajo la foto, para despegarla del fondo."""
        W, H = self.ancho, self.alto
        m = np.zeros((H, W), np.float32)
        cv2.rectangle(m, (self.px, self.py),
                      (self.px + self.pw, self.py + self.ph), 1.0, -1)
        k = max(3, (int(min(W, H) * 0.030) | 1))
        return cv2.GaussianBlur(m, (k, k), 0)[..., None]

    def _hacer_borde(self) -> np.ndarray:
        """Filete finisimo en el canto de la foto. Le da acabado de copia
        montada en vez de imagen pegada."""
        W, H = self.ancho, self.alto
        m = np.zeros((H, W), np.float32)
        grosor = max(1, int(round(min(W, H) * 0.0013)))
        cv2.rectangle(m, (self.px, self.py),
                      (self.px + self.pw - 1, self.py + self.ph - 1),
                      1.0, grosor, cv2.LINE_AA)
        return (m * 0.30)[..., None]

    # -- render -----------------------------------------------------------

    def _recorte(self, capa: np.ndarray, t: float, destino: tuple[int, int],
                 zoom: float, deriva: tuple, invertir: bool) -> np.ndarray:
        """Extrae la ventana correspondiente al instante t y la escala."""
        dw, dh = destino
        ch, cw = capa.shape[:2]
        aspecto = dw / dh

        s = suave_fuerte(t)
        if invertir:
            s = 1.0 - s
        z = 1.0 + zoom * (s if self.direccion > 0 else (1.0 - s))

        bw, _ = self._ventana_base(cw, ch, aspecto)
        vw = max(8, min(cw, int(round(bw / z))))
        vh = max(8, min(ch, int(round(vw / aspecto))))
        if vh > ch:
            vh = ch
            vw = max(8, min(cw, int(round(vh * aspecto))))

        libre_x, libre_y = cw - vw, ch - vh
        x0 = int(np.clip(libre_x / 2 * (1.0 + deriva[0] * (2 * s - 1)), 0, libre_x))
        y0 = int(np.clip(libre_y / 2 * (1.0 + deriva[1] * (2 * s - 1)), 0, libre_y))

        recorte = capa[y0:y0 + vh, x0:x0 + vw]
        if vw > dw:
            interp = cv2.INTER_AREA          # reduciendo: promedia, no muestrea
        elif vw < dw:
            interp = cv2.INTER_LANCZOS4      # ampliando: el mas nitido
        else:
            interp = cv2.INTER_LINEAR
        return cv2.resize(recorte, (dw, dh), interpolation=interp)

    def render(self, i: int) -> np.ndarray:
        t = i / max(1, self.n_frames - 1)
        foto = self._recorte(self._frente, t, (self.pw, self.ph),
                             self.zoom, self.deriva, False)
        if self._fondo is None:
            return foto

        W, H = self.ancho, self.alto
        fondo = self._recorte(self._fondo, t, (W, H), self.zoom * 0.45,
                              (-self.deriva[0], -self.deriva[1]), True)
        salida = fondo.astype(np.float32) * (1.0 - self._sombra * 0.60)
        salida[self.py:self.py + self.ph, self.px:self.px + self.pw] = foto

        col = np.array(BORDE_FOTO, dtype=np.float32)
        salida = salida * (1.0 - self._borde) + col * self._borde
        return np.clip(salida, 0, 255).astype(np.uint8)


# --------------------------------------------------------------------------
# acabado de imagen
# --------------------------------------------------------------------------

class Acabado:
    """Reduccion final, halo, grano y viraje.

    Recibe el fotograma dibujado a mayor resolucion y lo entrega al tamano
    final. Reducir promediando es lo que quita el hervido de los bordes; y el
    grano se anade despues de reducir, para que quede fino y no emborronado.

    El viraje comun (sombras algo frias, luces algo calidas) da unidad: fotos
    hechas con camaras distintas, en anos distintos y con luces distintas
    acaban pareciendo del mismo trabajo.
    """

    def __init__(self, ancho: int, alto: int, grano: float = 2.4,
                 halo: float = 0.10, semilla: int = 11):
        self.ancho, self.alto = ancho, alto
        self.halo = halo
        rng = np.random.default_rng(semilla)
        # El grano se genera a media resolucion y se amplia. Asi cada grano
        # mide un par de pixeles, que es como se comporta la pelicula; el
        # ruido blanco pixel a pixel no solo parece ruido digital, es que
        # ademas impide al codec predecir entre fotogramas y multiplica por
        # diez el tamano del archivo.
        self._tiles = []
        if grano > 0:
            gh, gw = max(2, alto // 2), max(2, ancho // 2)
            for _ in range(14):
                t = rng.normal(0, grano, (gh, gw)).astype(np.float32)
                t = cv2.resize(t, (ancho, alto), interpolation=cv2.INTER_LINEAR)
                self._tiles.append(t[..., None])

        x = np.linspace(0, 1, 256, dtype=np.float32)
        self._lut_b = np.clip((x + 0.016 * (1 - x) ** 2 - 0.012 * x ** 2) * 255, 0, 255).astype(np.uint8)
        self._lut_g = np.clip((x + 0.004 * (1 - x) ** 2) * 255, 0, 255).astype(np.uint8)
        self._lut_r = np.clip((x - 0.006 * (1 - x) ** 2 + 0.020 * x ** 2) * 255, 0, 255).astype(np.uint8)

    def _halo(self, f: np.ndarray) -> np.ndarray:
        """Difusion suave de las luces altas. Es lo que hace que una imagen
        digital respire como una copia optica, sin llegar a verse el efecto."""
        if self.halo <= 0:
            return f
        h, w = f.shape[:2]
        luz = f.max(axis=2)
        m = np.clip((luz - 200.0) / 55.0, 0, 1)[..., None]
        brillo = cv2.resize(f * m, (max(2, w // 4), max(2, h // 4)),
                            interpolation=cv2.INTER_AREA)
        brillo = cv2.GaussianBlur(brillo, (0, 0), max(1.0, min(w, h) / 220.0))
        glow = cv2.resize(brillo, (w, h), interpolation=cv2.INTER_LINEAR)
        return f + glow * self.halo

    def aplicar(self, frame: np.ndarray, i: int) -> np.ndarray:
        if frame.shape[1] != self.ancho or frame.shape[0] != self.alto:
            frame = cv2.resize(frame, (self.ancho, self.alto),
                               interpolation=cv2.INTER_AREA)

        f = self._halo(frame.astype(np.float32))
        if self._tiles:
            # el grano se ve en los medios tonos; en negros y blancos casi no
            # existe. Modularlo asi es mas fiel y ahorra mucho bitrate en las
            # cartelas, que son casi todo negro.
            luz = f.max(axis=2, keepdims=True) * (1.0 / 255.0)
            peso = 0.30 + 0.70 * (1.0 - np.abs(2.0 * luz - 1.0))
            f = f + self._tiles[i % len(self._tiles)] * peso
        f = np.clip(f, 0, 255).astype(np.uint8)

        b, g, r = cv2.split(f)
        return cv2.merge([cv2.LUT(b, self._lut_b),
                          cv2.LUT(g, self._lut_g),
                          cv2.LUT(r, self._lut_r)])


# --------------------------------------------------------------------------
# linea de tiempo
# --------------------------------------------------------------------------

class Montaje:
    def __init__(self, escenas: list[Escena], fps: int, fundido: float):
        self.escenas = escenas
        self.fps = fps
        self.n_fundido = max(1, int(round(fundido * fps)))
        self.inicios = []
        t = 0
        for e in escenas:
            self.inicios.append(t)
            t += e.n_frames - self.n_fundido
        self.total = t + self.n_fundido

    def frame(self, g: int) -> np.ndarray:
        activas = []
        for e, ini in zip(self.escenas, self.inicios):
            local = g - ini
            if 0 <= local < e.n_frames:
                activas.append((e, local))
        if not activas:
            e = self.escenas[-1]
            return e.render(e.n_frames - 1)
        if len(activas) == 1:
            e, local = activas[0]
            return e.render(local)

        (e1, l1), (e2, l2) = activas[0], activas[1]
        a = suave(l2 / max(1, self.n_fundido - 1))
        f1 = e1.render(l1)
        f2 = e2.render(l2)
        return cv2.addWeighted(f1, 1.0 - a, f2, a, 0.0)


# --------------------------------------------------------------------------
# construccion desde config
# --------------------------------------------------------------------------

def construir_escenas(cfg: dict, W: int, H: int, fps: int, carpeta: Path) -> list[Escena]:
    escenas: list[Escena] = []
    derivas = [(0.35, -0.25), (-0.30, 0.20), (0.20, 0.30), (-0.35, -0.18),
               (0.30, 0.22), (-0.22, -0.30)]
    d_i = 0
    n_foto = 0

    for bloque in cfg["secuencia"]:
        tipo = bloque.get("tipo")

        if tipo == "portada":
            escenas.append(Cartela(W, H, fps,
                                   titulo=bloque.get("titulo", ""),
                                   subtitulo=bloque.get("subtitulo", ""),
                                   duracion=bloque.get("duracion", 3.6)))
        elif tipo == "seccion":
            escenas.append(Cartela(W, H, fps,
                                   titulo=bloque.get("titulo", ""),
                                   duracion=bloque.get("duracion", 2.6),
                                   escala_titulo=0.52, regla=True))
        elif tipo == "final":
            escenas.append(Cartela(W, H, fps,
                                   titulo=bloque.get("titulo", ""),
                                   subtitulo=bloque.get("subtitulo", ""),
                                   lineas=bloque.get("lineas", []),
                                   duracion=bloque.get("duracion", 4.8)))
        elif tipo == "fotos":
            if "patron" in bloque:
                nombres = [r.name for r in sorted(carpeta.glob(bloque["patron"]))]
                if not nombres:
                    print(f"  aviso: el patron {bloque['patron']} no encaja con nada",
                          file=sys.stderr)
            else:
                nombres = bloque["archivos"]
            for nombre in nombres:
                ruta = carpeta / nombre
                if not ruta.exists():
                    print(f"  aviso: falta {nombre}, se omite", file=sys.stderr)
                    continue
                escenas.append(Foto(ruta, W, H, fps,
                                    duracion=bloque.get("duracion", 4.8),
                                    direccion=1 if n_foto % 2 == 0 else -1,
                                    deriva=derivas[d_i % len(derivas)],
                                    zoom=bloque.get("zoom", 0.065)))
                d_i += 1
                n_foto += 1
        else:
            raise ValueError(f"tipo de bloque desconocido: {tipo}")

    if not escenas:
        raise SystemExit("La secuencia no ha producido ninguna escena.")
    return escenas


def ruta_ffmpeg() -> str:
    local = RAIZ / "trabajo" / "ffmpeg"
    if local.exists():
        return str(local)
    import shutil
    hallado = shutil.which("ffmpeg")
    if not hallado:
        raise SystemExit("No encuentro ffmpeg.")
    return hallado


def main() -> int:
    p = argparse.ArgumentParser(description="Montador del videobook")
    p.add_argument("--config", default=str(RAIZ / "config.json"))
    p.add_argument("--fotos", default=None, help="carpeta de fotos (por defecto, la del config)")
    p.add_argument("--formato", default="horizontal", choices=list(FORMATOS))
    p.add_argument("--calidad", default="alta", choices=list(CALIDADES))
    p.add_argument("--salida", default=None)
    p.add_argument("--fps", type=int, default=25)
    p.add_argument("--musica", default=None)
    p.add_argument("--rapido", action="store_true", help="720p sin supermuestreo, para revisar")
    args = p.parse_args()

    cfg = json.loads(Path(args.config).read_text(encoding="utf-8"))
    carpeta = Path(args.fotos) if args.fotos else (RAIZ / cfg.get("carpeta_fotos", "retocadas"))

    W, H = FORMATOS[args.formato]
    calidad = "borrador" if args.rapido else args.calidad
    if args.rapido:
        W, H = (W * 2 // 3) & ~1, (H * 2 // 3) & ~1

    ss = CALIDADES[calidad]
    SW, SH = int(W * ss) & ~1, int(H * ss) & ~1
    fps = args.fps
    fundido = cfg.get("fundido", 1.0)

    print(f"Formato {args.formato} {W}x{H} @ {fps}fps  |  calidad {calidad}"
          f"{f' (dibujado a {SW}x{SH})' if ss > 1 else ''}")
    print(f"Fotos en {carpeta}")

    escenas = construir_escenas(cfg, SW, SH, fps, carpeta)
    montaje = Montaje(escenas, fps, fundido)
    acabado = Acabado(W, H, grano=0.0 if args.rapido else 2.4,
                      halo=0.0 if args.rapido else 0.10)

    dur = montaje.total / fps
    print(f"{len(escenas)} escenas  |  {montaje.total} fotogramas  |  {dur:.1f}s")

    sufijo = "_preview" if args.rapido else ""
    destino = Path(args.salida) if args.salida else (
        RAIZ / "salida" / f"silvia_videobook_{args.formato}{sufijo}.mp4")
    destino.parent.mkdir(parents=True, exist_ok=True)

    musica = args.musica or cfg.get("musica")
    tiene_musica = bool(musica) and Path(musica).exists()

    cmd = [ruta_ffmpeg(), "-y", "-loglevel", "error",
           "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{W}x{H}", "-r", str(fps), "-i", "-"]
    if tiene_musica:
        cmd += ["-i", str(musica)]
    cmd += ["-c:v", "libx264",
            "-preset", "veryfast" if args.rapido else "slower",
            "-crf", "26" if args.rapido else "18",
            "-pix_fmt", "yuv420p", "-profile:v", "high", "-level", "4.2",
            "-movflags", "+faststart",
            "-x264-params", f"keyint={fps*2}:min-keyint={fps}:bframes=3:ref=4"]
    if tiene_musica:
        desv = max(0.1, dur - 2.5)
        cmd += ["-c:a", "aac", "-b:a", "256k", "-shortest",
                "-af", f"afade=t=in:st=0:d=2,afade=t=out:st={desv:.2f}:d=2.5"]
    cmd += [str(destino)]

    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    try:
        for g in range(montaje.total):
            frame = acabado.aplicar(montaje.frame(g), g)
            proc.stdin.write(frame.tobytes())
            if g % (fps * 2) == 0:
                print(f"\r  renderizando {100.0 * g / montaje.total:5.1f}%"
                      f"  ({g}/{montaje.total})", end="", flush=True)
    finally:
        proc.stdin.close()
        codigo = proc.wait()
    print(f"\r  renderizando 100.0%  ({montaje.total}/{montaje.total})")

    if codigo != 0:
        print("ffmpeg ha fallado", file=sys.stderr)
        return codigo

    mb = destino.stat().st_size / 1e6
    print(f"\nListo: {destino}  ({mb:.1f} MB, {dur:.1f}s)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
