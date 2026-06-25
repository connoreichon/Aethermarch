"""
Panel ficha de personaje v3.
Estilo: inspirado en 3304 - geometrico gotico ilustrado, sin celtico,
completamente simetrico, cruz en cima visible, cuadricula en zona info.

Post-proceso corregido: la mascara negra NO toca el borde superior
para que la cruz quede totalmente visible.
"""
import requests, time, uuid, os, io
from PIL import Image, ImageFilter, ImageDraw

COMFY_URL  = "http://127.0.0.1:8000"
OUTPUT_DIR = r"C:\Users\Usuario\Desktop\Aethermarch_Clean\public\assets\generated"

POSITIVE = """flat 2d digital illustration, medieval fantasy RPG character card frame, 512x768 portrait orientation, perfectly symmetric design,

TOP HEADER ORNAMENT: large ornate Gothic cross centered at the very top center of the card, cross arms decorated with small diamond gems, flanked symmetrically by two identical Gothic pointed arch towers or spires on left and right sides, each tower has the same decorative details, dark aged gold and bronze tone, clearly visible against dark background, prominent and detailed,

OUTER BORDER FRAME: perfectly symmetric rectangular decorative border frame, 45 pixels wide on all sides, Gothic architectural stone carvings style, warm aged gold-brown color, flat 2d illustration NOT 3d or photorealistic, repeating Gothic geometric pattern, pointed arch motifs and diamond shapes running along all four edges symmetrically,

VERTICAL SIDE PILLARS: left and right vertical borders have identical symmetric repeating Gothic column design, equally spaced diamond-shaped or quatrefoil medallion motifs running vertically, the left side is a perfect mirror of the right side, dark warm stone color with gold outline,

CORNER BRACKETS: four identical ornate Gothic corner pieces, matching exactly at all four corners, pointed arch meeting point design, dark bronze gold color, perfectly symmetric,

HORIZONTAL DIVIDER LINE: thin elegant horizontal decorative band exactly at 68 percent height from top, Gothic arch motif or fleur-de-lis at center, symmetric ornaments on both sides of center, dark gold color, clearly separates character zone from info zone,

LOWER INFO PANEL GRID (bottom 32 percent): Gothic diamond lattice or quatrefoil grid pattern covering the entire bottom info area, repeating symmetric diamond grid, very dark warm brownish-black base color with slightly lighter gold-tinted grid lines, creates a textured parchment-stone backdrop, the grid is regular and perfectly symmetric,

UPPER CHARACTER AREA (top 68 percent, inside the frame): completely empty dark void, pure near-black darkness, absolutely no decoration or pattern inside the character placement zone, only the outer frame strips are decorated,

STYLE: flat 2d professional game UI illustration, inspired by old European playing cards, illuminated manuscript borders, Fire Emblem character select card style, warm aged gold and dark stone palette, clean crisp 2d art, symmetric and balanced design"""

NEGATIVE = """Celtic knotwork, Celtic interlaced pattern, interlaced vine, asymmetric, different left and right side, mismatched corners, text, letters, numbers, watermark, photorealistic, 3d render, character, person, face, body, weapon, bright white background, neon, modern, sci-fi, blue, green, purple, red neon, curved irregular patterns, organic flowing shapes instead of geometric"""

W, H = 512, 768


def post_process(raw_bytes):
    """
    Oscurece SOLO el interior central del area del personaje.
    El borde superior (donde esta la cruz) se preserva completamente.
    Usa frame_top grande y blur pequeno para que el top frame sea visible.
    """
    img = Image.open(io.BytesIO(raw_bytes)).convert("RGB")
    img = img.resize((W, H), Image.LANCZOS)

    frame_sides  = 48   # borde lateral a preservar
    frame_top    = 78   # borde superior a preservar (suficiente para la cruz)
    frame_bottom = int(H * 0.32)   # borde inferior = 32% = zona cuadricula
    char_bottom  = H - frame_bottom

    # Mascara: blanco = conservar original, negro = hacer oscuro
    mask = Image.new("L", (W, H), 255)
    draw = ImageDraw.Draw(mask)

    # Rectangulo negro: solo el interior del area del personaje
    # Empieza en frame_top (bajo la cruz) y termina en char_bottom
    draw.rectangle(
        [frame_sides, frame_top, W - frame_sides, char_bottom],
        fill=0
    )

    # Blur pequeno (radio 8): suaviza solo el borde inmediato sin llegar al top
    mask = mask.filter(ImageFilter.GaussianBlur(radius=8))

    # Aplicar: mezclar original con negro segun mascara
    # Negro en char zone => personaje se ve limpio con mix-blend-mode:lighten
    dark = Image.new("RGB", (W, H), (0, 0, 0))
    result = Image.composite(img, dark, mask)

    out = io.BytesIO()
    result.save(out, format="PNG", optimize=False)
    return out.getvalue()


def build_workflow(seed):
    return {
        "1":  {"class_type": "UNETLoader",
               "inputs": {"unet_name": "flux1-krea-dev_fp8_scaled.safetensors",
                          "weight_dtype": "fp8_e4m3fn"}},
        "4":  {"class_type": "DualCLIPLoader",
               "inputs": {"clip_name1": "t5xxl_fp8_e4m3fn_scaled.safetensors",
                          "clip_name2": "clip_l.safetensors", "type": "flux"}},
        "2":  {"class_type": "LoraLoader",
               "inputs": {"lora_name": "flat_illustration_flux.safetensors",
                          "strength_model": 1.0, "strength_clip": 1.0,
                          "model": ["1", 0], "clip": ["4", 0]}},
        "3":  {"class_type": "LoraLoader",
               "inputs": {"lora_name": "2d_flat_illustrations_flux.safetensors",
                          "strength_model": 0.90, "strength_clip": 0.90,
                          "model": ["2", 0], "clip": ["2", 1]}},
        "5":  {"class_type": "CLIPTextEncode",
               "inputs": {"text": POSITIVE, "clip": ["3", 1]}},
        "6":  {"class_type": "CLIPTextEncode",
               "inputs": {"text": NEGATIVE, "clip": ["3", 1]}},
        "7":  {"class_type": "EmptyLatentImage",
               "inputs": {"width": W, "height": H, "batch_size": 1}},
        "8":  {"class_type": "KSampler",
               "inputs": {"seed": seed, "steps": 55, "cfg": 5.5,
                          "sampler_name": "euler", "scheduler": "simple",
                          "denoise": 1.0,
                          "model": ["3", 0], "positive": ["5", 0],
                          "negative": ["6", 0], "latent_image": ["7", 0]}},
        "9":  {"class_type": "VAELoader",
               "inputs": {"vae_name": "ae.safetensors"}},
        "10": {"class_type": "VAEDecode",
               "inputs": {"samples": ["8", 0], "vae": ["9", 0]}},
        "11": {"class_type": "SaveImage",
               "inputs": {"filename_prefix": f"panel_v3_raw_s{seed}",
                          "images": ["10", 0]}},
    }


def run(seed):
    print(f"\n>> seed={seed}", flush=True)
    wf  = build_workflow(seed)
    cid = str(uuid.uuid4())
    r   = requests.post(f"{COMFY_URL}/api/prompt",
                        json={"prompt": wf, "client_id": cid}, timeout=30)
    if not r.ok:
        print(f"  Error {r.status_code}: {r.text[:200]}")
        return None
    pid = r.json()["prompt_id"]
    print(f"  pid={pid}", flush=True)

    while True:
        h = requests.get(f"{COMFY_URL}/history/{pid}", timeout=10).json()
        if pid in h:
            st = h[pid].get("status", {})
            if st.get("completed"):
                for out in h[pid].get("outputs", {}).values():
                    for img_info in out.get("images", []):
                        r2 = requests.get(
                            f"{COMFY_URL}/view",
                            params={"filename": img_info["filename"],
                                    "subfolder": img_info.get("subfolder", ""),
                                    "type":     img_info.get("type", "output")},
                            timeout=30)

                        raw_path   = os.path.join(OUTPUT_DIR, f"panel_v3_raw_s{seed}.png")
                        final_path = os.path.join(OUTPUT_DIR, f"panel_heraldo_v3_s{seed}.png")

                        with open(raw_path, "wb") as f:
                            f.write(r2.content)

                        processed = post_process(r2.content)
                        with open(final_path, "wb") as f:
                            f.write(processed)

                        print(f"  OK {final_path}", flush=True)
                        return final_path

            if st.get("status_str") == "error":
                print(f"  ERROR seed={seed}")
                return None
        time.sleep(3)


if __name__ == "__main__":
    print("=== Panel Heraldo v3 ===")
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    for seed in [4401, 4402, 4403, 4404]:
        run(seed)
    print("\n=== Listo ===")
