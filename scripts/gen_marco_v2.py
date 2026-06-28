"""
Marco v2 — franjas más finas (BORDER=34px) y ornamento más delicado.
Diseño: líneas doradas finas, esquinas con fleur-de-lis o laurel, sin diamantes grandes.
Mix-blend-mode: lighten en CSS: negro=invisible, dorado=visible.
"""
import requests, time, uuid, os, io
from PIL import Image, ImageDraw

COMFY_URL  = "http://127.0.0.1:8000"
OUTPUT_DIR = r"C:\Users\Usuario\Desktop\Aethermarch_Clean\public\assets\generated"

POSITIVE = """flat 2d digital illustration, medieval fantasy RPG decorative card border overlay, 512x768 vertical portrait, transparent center,

CRITICAL: the ENTIRE CENTER of the image must be PURE SOLID BLACK (RGB 0,0,0), completely void and empty, all decoration is ONLY on the four thin border strips around the outer edges,

BORDER STYLE: very thin elegant decorative strips, only 30 to 35 pixels wide on all four sides, warm aged gold color on pure black background,

TOP BORDER: thin horizontal gold band at top edge, delicate central ornament — a small elegant fleur-de-lis or gothic cross finial, symmetrical small filigree scrollwork on both sides of center, very fine gold linework,

BOTTOM BORDER: thin horizontal band at bottom edge, mirrors the top band exactly, same delicate ornament at center, symmetrical filigree,

LEFT BORDER: very thin vertical strip along left edge, simple repeating motif of small elegant pointed oval or lozenge shapes, fine gold line, evenly spaced, delicate not heavy,

RIGHT BORDER: exact perfect mirror of the left border, identical small motifs, perfectly symmetrical,

CORNER PIECES: four identical small corner ornaments, elegant bracket or fleur-de-lis corner piece, very fine gold linework, NOT overpowering,

COLOR: warm aged gold, antique amber, thin elegant lines, all on pure black background, nothing else,

ART STYLE: very clean minimal flat 2d game UI art, thin and elegant NOT thick and heavy, dark fantasy RPG aesthetic, delicate fine linework"""

NEGATIVE = """wide thick border, heavy border, thick strips, large diamonds, large shapes, busy cluttered pattern, Celtic knotwork, scene, character, person, colored interior, white center, gradient background, photorealistic, 3d, modern, sci-fi, neon, watermark, text, asymmetric, mismatched sides, thick lines, bold heavy ornament"""

W, H     = 512, 768
BORDER   = 34   # franjas más finas: 34px en lugar de 52px


def make_transparent(raw_bytes, threshold=30):
    """Píxeles oscuros -> transparentes. Solo deja visibles los dorados/brillantes del marco."""
    img = Image.open(io.BytesIO(raw_bytes)).convert("RGBA")
    img = img.resize((W, H), Image.LANCZOS)
    pixels = img.load()
    for y in range(H):
        for x in range(W):
            r, g, b, a = pixels[x, y]
            if (r + g + b) / 3 < threshold:
                pixels[x, y] = (0, 0, 0, 0)
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
               "inputs": {"filename_prefix": f"marco_v2_raw_s{seed}",
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

                        raw_path   = os.path.join(OUTPUT_DIR, f"marco_v2_raw_s{seed}.png")
                        final_path = os.path.join(OUTPUT_DIR, f"marco_v2_s{seed}.png")

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
    print("=== Marco v2 (franjas finas) ===")
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    for seed in [8801, 8802, 8803, 8804]:
        run(seed)
    print("\n=== Listo — elige el mejor marco_v2_s*.png ===")
