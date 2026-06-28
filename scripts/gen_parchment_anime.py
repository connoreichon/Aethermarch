"""
gen_parchment_anime.py
Pergamino en estilo ilustración 2D anime, como en Fire Emblem / Octopath Traveler.
- Cel shading plano, colores cálidos, sin textura fotorrealista
- Líneas de pliegue dibujadas a mano (look ilustrado)
- 512x384 (mismo uso que pergamino_s9102.png)
"""
import requests, time, uuid, os

COMFY_URL  = "http://127.0.0.1:8000"
OUTPUT_DIR = r"C:\Users\Usuario\Desktop\Aethermarch_Clean\public\assets\generated"

POSITIVE = """2D anime JRPG game UI parchment scroll paper texture, flat cel-shaded illustration style, 512x384,

STYLE: exactly like Fire Emblem Three Houses or Octopath Traveler menu backgrounds
- completely flat 2D illustration, NOT photographic, NOT realistic
- cel shaded, clean flat colors, hand-drawn look
- warm cream-amber color #D8B870, fills entire image
- simple clean drawn fold crease lines in slightly darker warm amber
- gentle vignette slightly darker at edges

TEXTURE:
- flat warm paper surface with very subtle hand-drawn grain
- 2-3 soft diagonal fold lines crossing the page at gentle angles
- fold lines are illustrated brushstroke style, soft and warm, not harsh
- center area cleanest and lightest
- overall tone: warm medieval document

NO photographic paper grain, NO realistic 3D shading, NO objects on paper
NO dark areas, NO dramatic lighting, NO photorealism"""

NEGATIVE = """photorealistic, 3D render, photograph, realistic paper texture, dramatic shadows,
table, wood, objects on paper, quill, ink, writing, text, symbols,
dark background, blue colors, grey colors, cold tones, noise, grain photograph style"""

W, H = 512, 384


def build_wf(seed):
    return {
        "1":  {"class_type": "UNETLoader",
               "inputs": {"unet_name": "flux1-krea-dev_fp8_scaled.safetensors",
                          "weight_dtype": "fp8_e4m3fn"}},
        "4":  {"class_type": "DualCLIPLoader",
               "inputs": {"clip_name1": "t5xxl_fp8_e4m3fn_scaled.safetensors",
                          "clip_name2": "clip_l.safetensors", "type": "flux"}},
        "5":  {"class_type": "CLIPTextEncode",
               "inputs": {"text": POSITIVE, "clip": ["4", 0]}},
        "6":  {"class_type": "CLIPTextEncode",
               "inputs": {"text": NEGATIVE, "clip": ["4", 0]}},
        "7":  {"class_type": "EmptyLatentImage",
               "inputs": {"width": W, "height": H, "batch_size": 1}},
        "8":  {"class_type": "KSampler",
               "inputs": {"seed": seed, "steps": 28, "cfg": 3.8,
                          "sampler_name": "euler", "scheduler": "simple",
                          "denoise": 1.0,
                          "model": ["1", 0], "positive": ["5", 0],
                          "negative": ["6", 0], "latent_image": ["7", 0]}},
        "9":  {"class_type": "VAELoader",
               "inputs": {"vae_name": "ae.safetensors"}},
        "10": {"class_type": "VAEDecode",
               "inputs": {"samples": ["8", 0], "vae": ["9", 0]}},
        "11": {"class_type": "SaveImage",
               "inputs": {"filename_prefix": f"parch_anime_s{seed}",
                          "images": ["10", 0]}},
    }


def run(seed):
    print(f"\n>> seed={seed}", flush=True)
    wf  = build_wf(seed)
    cid = str(uuid.uuid4())
    r   = requests.post(f"{COMFY_URL}/api/prompt",
                        json={"prompt": wf, "client_id": cid}, timeout=30)
    if not r.ok:
        print(f"  Error {r.status_code}: {r.text[:200]}")
        return None
    pid = r.json()["prompt_id"]
    print(f"  pid={pid}", flush=True)
    while True:
        hist = requests.get(f"{COMFY_URL}/history/{pid}", timeout=10).json()
        if pid in hist:
            st = hist[pid].get("status", {})
            if st.get("completed"):
                for out in hist[pid].get("outputs", {}).values():
                    for img in out.get("images", []):
                        r2 = requests.get(
                            f"{COMFY_URL}/view",
                            params={"filename": img["filename"],
                                    "subfolder": img.get("subfolder", ""),
                                    "type": img.get("type", "output")},
                            timeout=30)
                        dst = os.path.join(OUTPUT_DIR, f"parch_anime_s{seed}.png")
                        with open(dst, "wb") as f:
                            f.write(r2.content)
                        print(f"  OK -> {dst}", flush=True)
                        return dst
            if st.get("status_str") == "error":
                print(f"  ERROR seed={seed}")
                return None
        time.sleep(3)


if __name__ == "__main__":
    print("=== Pergamino anime estilo JRPG ===")
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    for seed in [8101, 8102, 8103, 8104]:
        run(seed)
    print("\n=== Listo ===")
