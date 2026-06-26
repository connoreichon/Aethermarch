"""
Elimina el fondo negro solido de la imagen del Heraldo.
Umbral: pixeles con R<25, G<25, B<25 -> transparente.
"""
from PIL import Image
import os

INPUT  = r"C:\Users\Usuario\Desktop\Aethermarch_Clean\public\assets\generated\heraldo_botharms_s2014.png"
OUTPUT = r"C:\Users\Usuario\Desktop\Aethermarch_Clean\public\assets\generated\heraldo_s2014_nobg.png"
THRESHOLD = 22

def remove_black_bg(src, dst, thr):
    img = Image.open(src).convert("RGBA")
    data = img.getdata()
    new_data = []
    removed = 0
    for r, g, b, a in data:
        if r < thr and g < thr and b < thr:
            new_data.append((0, 0, 0, 0))
            removed += 1
        else:
            new_data.append((r, g, b, 255))
    img.putdata(new_data)
    img.save(dst, "PNG")
    total = len(data)
    print(f"Eliminados {removed}/{total} px ({removed*100//total}%) -> {dst}")

if __name__ == "__main__":
    if not os.path.exists(INPUT):
        print(f"ERROR: no se encuentra {INPUT}")
    else:
        remove_black_bg(INPUT, OUTPUT, THRESHOLD)
        print("Listo.")
