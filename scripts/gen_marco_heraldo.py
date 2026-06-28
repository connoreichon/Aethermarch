"""
Marco decorativo para la tarjeta del Heraldo.
Genera una imagen 512x768 con bordes medievales dorados y centro negro puro.
Se superpone con mix-blend-mode: lighten en CSS:
  - negro (0,0,0) = invisible  ->  se ve el personaje/fondo debajo
  - dorado/bronce = visible    ->  aparece el marco encima de todo
"""
import requests, time, uuid, os, io
from PIL import Image, ImageDraw

COMFY_URL  = "http://127.0.0.1:8000"
OUTPUT_DIR = r"C:\Users\Usuario\Desktop\Aethermarch_Clean\public\assets\generated"

POSITIVE = """flat 2d digital illustration, medieval fantasy RPG card border frame overlay, 512x768 vertical portrait,

IMPORTANT: the ENTIRE CENTER of the image is pure solid black (RGB 0,0,0), completely empty void, absolutely nothing inside, only the four border strips around the edges have decoration,

FRAME STRIPS: thin elegant decorative border strips on all four sides, approximately 50 pixels wide, warm aged gold and dark bronze color palette, flat clean 2d art, simple and elegant,

TOP STRIP: horizontal ornamental band along the very top edge, small decorative central motif (fleur-de-lis or simple cross or diamond), perfectly symmetrical left and right, gold-bronze color on black,

BOTTOM STRIP: elegant horizontal band along the very bottom edge, matches and mirrors the top strip style, same design language, symmetrical,

LEFT STRIP: thin vertical strip along the left edge, simple repeating pattern of small diamonds or pointed ovals or chevrons evenly spaced, gold color on black,

RIGHT STRIP: exact perfect mirror of the left strip, identical repeating pattern, perfectly symmetrical,

CORNER PIECES: four identical corner bracket ornaments where strips meet, simple elegant L-shaped corner design, matching medieval gold style,

COLOR PALETTE: warm dark gold, aged bronze, antique amber, all on pure black background, no other colors,

ART STYLE: very clean simple flat 2d game UI asset, elegant minimal medieval aesthetic, NOT busy or cluttered, NOT photorealistic, NOT 3d, solid flat colors, suits a dark fantasy RPG"""

NEGATIVE = """scene, landscape, interior, environment, castle background, character, person, figure, face, body, colored interior fill, white areas, light center, gradient background, Celtic knotwork, complex interlaced patterns, photorealistic, 3d render, modern, sci-fi, neon, watermark, text, letters, bright background, busy cluttered design"""

W, H     = 512, 768
BORDER   = 52   # anchura en px de las franjas del marco a conservar


def ensure_black_center(raw_bytes):
    """Garantiza centro negro puro para que mix-blend-mode: lighten lo haga transparente."""
    img = Image.open(io.BytesIO(raw_bytes)).convert("RGB")
    img = img.resize((W, H), Image.LANCZOS)
    draw = ImageDraw.Draw(img)
    draw.rectangle(
        [BORDER, BORDER, W - BORDER - 1, H - BORDER - 1],
        fill=(0, 0, 0)
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
                          "strength_model": 0.90, "strength_clip": 0.90,
                          "model": ["2", 0], "clip": ["2", 1]}},
        "5":  {"class_type": "CLIPTextEncode",
               "inputs": {"text": POSITIVE, "clip": ["3", 1]}},
        "6":  {"class_type": "CLIPTextEncode",
               "inputs": {"text": NEGATIVE, "clip": ["3", 1]}},
        "7":  {"class_type": "EmptyLatentImage",
               "inputs": {"width": W, "height": H, "batch_size": 1}},
        "8":  {"class_type": "KSampler",
               "inputs": {"seed": seed, "steps": 50, "cfg": 5.5,
                          "sampler_name": "euler", "scheduler": "simple",
                          "denoise": 1.0,
                          "model": ["3", 0], "positive": ["5", 0],
                          "negative": ["6", 0], "latent_image": ["7", 0]}},
        "9":  {"class_type": "VAELoader",
               "inputs": {"vae_name": "ae.safetensors"}},
        "10": {"class_type": "VAEDecode",
               "inputs": {"samples": ["8", 0], "vae": ["9", 0]}},
        "11": {"class_type": "SaveImage",
               "inputs": {"filename_prefix": f"marco_heraldo_raw_s{seed}",
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

                        raw_path   = os.path.join(OUTPUT_DIR, f"marco_heraldo_raw_s{seed}.png")
                        final_path = os.path.join(OUTPUT_DIR, f"marco_heraldo_s{seed}.png")

                        with open(raw_path, "wb") as f:
                            f.write(r2.content)

                        processed = ensure_black_center(r2.content)
                        with open(final_path, "wb") as f:
                            f.write(processed)

                        print(f"  OK -> {final_path}", flush=True)
                        return final_path

            if st.get("status_str") == "error":
                print(f"  ERROR seed={seed}")
                return None
        time.sleep(3)


if __name__ == "__main__":
    print("=== Marco Heraldo ===")
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    for seed in [7701, 7702, 7703, 7704]:
        run(seed)
    print("\n=== Listo ===")
