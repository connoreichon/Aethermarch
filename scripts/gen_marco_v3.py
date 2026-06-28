"""
Marco v3 — franjas anchas (BORDER=80px), banda superior con espacio para título.
Objetivo: marcos visualmente prominentes, banda superior plana para superponer texto.
"""
import requests, time, uuid, os, io
from PIL import Image, ImageDraw

COMFY_URL  = "http://127.0.0.1:8000"
OUTPUT_DIR = r"C:\Users\Usuario\Desktop\Aethermarch_Clean\public\assets\generated"

POSITIVE = """flat 2d digital illustration, medieval fantasy RPG decorative card border overlay, 512x768 vertical portrait, transparent center,

CRITICAL: the ENTIRE CENTER of the image must be PURE SOLID BLACK (RGB 0,0,0), completely void and empty, all decoration is ONLY on the four wide border strips around the outer edges,

BORDER STYLE: wide prominent decorative strips, 75 to 85 pixels wide on all four sides, rich warm gold color on pure black background, thick and ornate,

TOP BORDER: wide horizontal gold band at top edge, flat clear open area in the CENTER of the band (no ornament blocking center, flat horizontal band), symmetrical scrollwork filigree only on the far left and right sides of the band, very fine gold linework, ornate corner intersections,

BOTTOM BORDER: wide horizontal band at bottom edge, mirrors the top band exactly, same symmetrical filigree on sides, flat center, prominent gold band,

LEFT BORDER: wide vertical strip along left edge, repeating motif of elegant pointed oval or lozenge shapes, fine gold line, evenly spaced, ornate and decorative, goes full height,

RIGHT BORDER: exact perfect mirror of the left border, identical repeating motifs, perfectly symmetrical, goes full height,

CORNER PIECES: four identical ornate corner ornaments at all four corners, elaborate bracket design, rich warm gold linework, fills the corner nicely,

COLOR: rich warm aged gold, antique amber, bright gold on pure black background, nothing else in the center, high contrast gold on black,

ART STYLE: clean flat 2d game UI art, bold and prominent borders NOT thin and weak, dark fantasy RPG aesthetic, symmetrical design, decorative fine linework"""

NEGATIVE = """thin border, narrow strips, small border, wide center, large center area, ornament in center of top band, blocking center text area, oval center medallion, scene, character, person, colored interior, white center, gradient background, Celtic knotwork, photorealistic, 3d, modern, sci-fi, neon, watermark, text, asymmetric, mismatched sides"""

W, H     = 512, 768
BORDER   = 80   # franjas anchas: 80px en lugar de 34px


def make_transparent(raw_bytes, threshold=30):
    """Píxeles oscuros → transparentes. Solo deja los dorados/brillantes del marco."""
    img = Image.open(io.BytesIO(raw_bytes)).convert("RGBA")
    img = img.resize((W, H), Image.LANCZOS)
    pixels = img.load()

    # Paso 1: transparencia por brillo
    for y in range(H):
        for x in range(W):
            r, g, b, a = pixels[x, y]
            if (r + g + b) / 3 < threshold:
                pixels[x, y] = (0, 0, 0, 0)

    # Paso 2: garantizar banda dorada inferior (por si la IA la omite)
    draw = ImageDraw.Draw(img)
    y_line = H - 12
    # Línea horizontal dorada
    draw.line([(BORDER, y_line), (W - BORDER, y_line)],
              fill=(195, 158, 50, 255), width=2)
    draw.line([(BORDER, y_line - 2), (W - BORDER, y_line - 2)],
              fill=(148, 118, 32, 160), width=1)
    # Ornamento rombo central inferior
    cx = W // 2
    draw.polygon(
        [(cx, y_line - 7), (cx + 7, y_line), (cx, y_line + 5), (cx - 7, y_line)],
        fill=(195, 158, 50, 255)
    )

    out = io.BytesIO()
    img.save(out, format="PNG")
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
                          "strength_model": 0.85, "strength_clip": 0.85,
                          "model": ["2", 0], "clip": ["2", 1]}},
        "5":  {"class_type": "CLIPTextEncode",
               "inputs": {"text": POSITIVE, "clip": ["3", 1]}},
        "6":  {"class_type": "CLIPTextEncode",
               "inputs": {"text": NEGATIVE, "clip": ["3", 1]}},
        "7":  {"class_type": "EmptyLatentImage",
               "inputs": {"width": W, "height": H, "batch_size": 1}},
        "8":  {"class_type": "KSampler",
               "inputs": {"seed": seed, "steps": 50, "cfg": 4.5,
                          "sampler_name": "euler", "scheduler": "simple",
                          "denoise": 1.0,
                          "model": ["3", 0], "positive": ["5", 0],
                          "negative": ["6", 0], "latent_image": ["7", 0]}},
        "9":  {"class_type": "VAELoader",
               "inputs": {"vae_name": "ae.safetensors"}},
        "10": {"class_type": "VAEDecode",
               "inputs": {"samples": ["8", 0], "vae": ["9", 0]}},
        "11": {"class_type": "SaveImage",
               "inputs": {"filename_prefix": f"marco_v3_raw_s{seed}",
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

                        raw_path   = os.path.join(OUTPUT_DIR, f"marco_v3_raw_s{seed}.png")
                        final_path = os.path.join(OUTPUT_DIR, f"marco_v3_s{seed}.png")

                        with open(raw_path, "wb") as f:
                            f.write(r2.content)

                        processed = make_transparent(r2.content)
                        with open(final_path, "wb") as f:
                            f.write(processed)

                        print(f"  OK -> {final_path}", flush=True)
                        return final_path

            if st.get("status_str") == "error":
                print(f"  ERROR seed={seed}")
                return None
        time.sleep(3)


if __name__ == "__main__":
    print("=== Marco v3 (franjas anchas BORDER=80) ===")
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    for seed in [9901, 9902, 9903, 9904]:
        run(seed)
    print("\n=== Listo — elige el mejor marco_v3_s*.png ===")
