"""
Panel ficha de personaje v2.
Estrategia:
  1. ComfyUI genera un borde/marco medieval decorativo
  2. PIL oscurece el interior (zona del personaje) a negro puro
     => con mix-blend-mode:lighten en el juego el personaje sale limpio sin tinte
"""
import requests, time, uuid, os, io
from PIL import Image, ImageFilter, ImageDraw

COMFY_URL  = "http://127.0.0.1:8000"
OUTPUT_DIR = r"C:\Users\Usuario\Desktop\Aethermarch_Clean\public\assets\generated"

POSITIVE = """flat 2d digital illustration, professional medieval fantasy RPG character card border frame, 512x768 portrait,

OUTER FRAME: ornate medieval engraved border running along all four edges, 40 to 50 pixel wide decorative strip, aged dark bronze and antique gold tones, intricate Gothic knotwork and scrollwork pattern engraved into the frame, thin vine motifs, very detailed medieval craftsmanship, slightly worn and aged,

CORNER ORNAMENTS: four elaborate corner medallions, cross-hatched diamond filigree, intertwined vines, dark aged bronze gold color #8B6914, each corner is a distinctive ornamental piece,

TOP HEADER: elaborate ornamental Gothic header at very top, pointed arch motif within the frame top strip, small central medallion with cross or diamond, dark bronze ornamental peaks at top corners,

BOTTOM FOOTER: matching ornamental footer at very bottom, medieval decorative band, mirrored symmetry with header,

VERTICAL SIDE BARS: thin decorated side strips left and right edges, knotwork pattern repeating vertically, aged bronze gold tone,

DIVIDER LINE: thin elegant horizontal dividing line at 68 percent height from top, dark aged gold color, very thin 1-2 pixel line, small diamond or cross ornament centered on divider, barely visible but present,

BACKGROUND: the interior center field beyond the frame strips is deep dark background #060204, very dark atmospheric void,

LOWER PANEL: bottom 30 percent interior has slightly warmer very dark background #0E0709, subtle barely-visible aged stone or parchment micro-texture, dark and moody,

STYLE: flat 2d, Darkest Dungeon UI aesthetic, old-school fantasy trading card border, hand-crafted medieval engraving feel, warm aged metal tones, NOT modern, NOT photorealistic, crisp 2d art, Fire Emblem character card frame style"""

NEGATIVE = """character, person, face, body, red neon, modern, sci-fi, futuristic, cyberpunk, bright red, saturated red border, thick red arch, photorealistic, 3d, blurry, gradient, anime character inside, white, bright, light interior, text, watermark, buildings in center, arch in center area, architectural elements inside card, blue, green, purple"""

W, H = 512, 768


def post_process(raw_bytes):
    """
    Oscurece el interior de la zona del personaje (top 68% sin contar el borde del marco)
    a negro puro (#000000), conservando el marco exterior y el panel inferior.
    """
    img = Image.open(io.BytesIO(raw_bytes)).convert("RGB")
    img = img.resize((W, H), Image.LANCZOS)

    frame_px      = 50          # ancho del marco a preservar en los lados
    char_bottom   = int(H * 0.68)   # fin de la zona del personaje
    fade_radius   = 20          # radio del suavizado en el borde máscara

    # Máscara: 255 = conservar original, 0 = negro puro
    mask = Image.new("L", (W, H), 255)
    draw = ImageDraw.Draw(mask)

    # Interior del área del personaje → negro
    draw.rectangle(
        [frame_px, frame_px, W - frame_px, char_bottom],
        fill=0
    )

    # Suavizar la transición para que el marco no quede cortado bruscamente
    mask = mask.filter(ImageFilter.GaussianBlur(radius=fade_radius))

    black  = Image.new("RGB", (W, H), (0, 0, 0))
    result = Image.composite(img, black, mask)

    out = io.BytesIO()
    result.save(out, format="PNG", optimize=False)
    return out.getvalue()


def build_workflow(seed, prefix):
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
               "inputs": {"filename_prefix": prefix, "images": ["10", 0]}},
    }


def run(seed):
    print(f"\n>> seed={seed}", flush=True)
    wf  = build_workflow(seed, f"panel_v2_raw_s{seed}")
    cid = str(uuid.uuid4())
    r   = requests.post(f"{COMFY_URL}/api/prompt",
                        json={"prompt": wf, "client_id": cid}, timeout=30)
    if not r.ok:
        print(f"  Error {r.status_code}: {r.text[:200]}")
        return None
    pid = r.json()["prompt_id"]
    print(f"  prompt_id={pid}", flush=True)

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
                        # Guardar raw
                        raw_path   = os.path.join(OUTPUT_DIR, f"panel_v2_raw_s{seed}.png")
                        final_path = os.path.join(OUTPUT_DIR, f"panel_heraldo_v2_s{seed}.png")
                        with open(raw_path, "wb") as f:
                            f.write(r2.content)
                        # Postprocesar y guardar final
                        processed = post_process(r2.content)
                        with open(final_path, "wb") as f:
                            f.write(processed)
                        print(f"  OK {final_path}", flush=True)
                        return final_path
            if st.get("status_str") == "error":
                print(f"  ERROR en seed={seed}")
                return None
        time.sleep(3)


if __name__ == "__main__":
    print("=== Panel Heraldo v2 ===")
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    for seed in [3301, 3302, 3303, 3304]:
        run(seed)
    print("\n=== Listo ===")
