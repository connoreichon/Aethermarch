#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Hace el videobook entero de una sola pasada: retoque + montaje.

Todos los ajustes viven en config.json, incluidos los de cada foto concreta
(por ejemplo que a una hay que borrarle la marca de agua). Asi el trabajo es
reproducible y no se pierde nada al reprocesar el lote: basta con volver a
lanzar este script.

    python3 hacer.py                      # retoca y monta los dos formatos
    python3 hacer.py --solo-retoque
    python3 hacer.py --solo-video
    python3 hacer.py --rapido             # previsualizacion en 720p
"""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path

import cv2

sys.path.insert(0, str(Path(__file__).resolve().parent))
from retoque import Ajustes, EXTENSIONES, revelar  # noqa: E402

RAIZ = Path(__file__).resolve().parent.parent


def ajustes_de(cfg_retoque: dict, nombre: str) -> Ajustes:
    """Ajustes por defecto, pisados por los especificos de esta foto."""
    valores = dict(cfg_retoque.get("por_defecto", {}))
    valores.update(cfg_retoque.get("por_foto", {}).get(nombre, {}))

    marca = valores.get("marca")
    if marca == "auto":
        valores["marca"] = (0.38, 0.84, 1.0, 1.0)
    elif isinstance(marca, (list, tuple)):
        valores["marca"] = tuple(float(v) for v in marca)
    elif marca is None:
        valores.pop("marca", None)

    validos = {c for c in Ajustes.__dataclass_fields__}
    sobrantes = set(valores) - validos
    if sobrantes:
        raise SystemExit(f"Ajuste desconocido para {nombre}: {', '.join(sorted(sobrantes))}")
    return Ajustes(**valores)


def fotos_de_la_secuencia(cfg: dict) -> list[str]:
    nombres = []
    for bloque in cfg["secuencia"]:
        if bloque.get("tipo") == "fotos" and "archivos" in bloque:
            nombres.extend(bloque["archivos"])
    return nombres


def retocar(cfg: dict, calidad: int = 96) -> int:
    origen = RAIZ / cfg.get("carpeta_originales", "fotos")
    destino = RAIZ / cfg.get("carpeta_fotos", "retocadas")
    destino.mkdir(parents=True, exist_ok=True)

    if not origen.is_dir():
        raise SystemExit(f"No existe la carpeta de originales: {origen}")

    rutas = sorted(r for r in origen.iterdir() if r.suffix.lower() in EXTENSIONES)
    if not rutas:
        raise SystemExit(f"No hay fotos en {origen}")

    cfg_ret = cfg.get("retoque", {})
    print(f"Retocando {len(rutas)} fotos  ({origen}  ->  {destino})")
    for ruta in rutas:
        aj = ajustes_de(cfg_ret, ruta.name)
        img, info = revelar(ruta, aj)
        fuera = destino / f"{ruta.stem}.jpg"
        cv2.imwrite(str(fuera), img,
                    [cv2.IMWRITE_JPEG_QUALITY, calidad, cv2.IMWRITE_JPEG_OPTIMIZE, 1])
        notas = []
        if info["blanco_y_negro"]:
            notas.append("B/N")
        if aj.marca:
            notas.append("marca borrada")
        if aj.piel != Ajustes.piel:
            notas.append(f"piel {aj.piel}")
        extra = f"  [{', '.join(notas)}]" if notas else ""
        print(f"  ok  {ruta.name:34s} {info['ancho']}x{info['alto']}{extra}")

    # aviso si la secuencia menciona fotos que no existen
    disponibles = {p.name for p in destino.glob("*.jpg")}
    faltan = [n for n in fotos_de_la_secuencia(cfg) if n not in disponibles]
    if faltan:
        print("\n  AVISO: la secuencia pide fotos que no estan:", ", ".join(faltan),
              file=sys.stderr)
    return 0


def montar(cfg_ruta: Path, formatos: list[str], rapido: bool, musica: str | None,
           calidad: str = "alta") -> int:
    for formato in formatos:
        print()
        cmd = [sys.executable, str(RAIZ / "scripts" / "videobook.py"),
               "--config", str(cfg_ruta), "--formato", formato, "--calidad", calidad]
        if rapido:
            cmd.append("--rapido")
        if musica:
            cmd += ["--musica", musica]
        codigo = subprocess.call(cmd)
        if codigo != 0:
            return codigo
    return 0


def main() -> int:
    p = argparse.ArgumentParser(description="Retoque + montaje del videobook")
    p.add_argument("--config", default=str(RAIZ / "config.json"))
    p.add_argument("--solo-retoque", action="store_true")
    p.add_argument("--solo-video", action="store_true")
    p.add_argument("--rapido", action="store_true")
    p.add_argument("--calidad", default="alta",
                   choices=["alta", "media", "borrador"])
    p.add_argument("--formatos", default="horizontal,vertical")
    p.add_argument("--musica", default=None)
    args = p.parse_args()

    cfg_ruta = Path(args.config)
    cfg = json.loads(cfg_ruta.read_text(encoding="utf-8"))

    if not args.solo_video:
        retocar(cfg)
    if not args.solo_retoque:
        formatos = [f.strip() for f in args.formatos.split(",") if f.strip()]
        return montar(cfg_ruta, formatos, args.rapido, args.musica, args.calidad)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
