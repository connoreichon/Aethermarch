"""
Panel de habilidad v2 — textura oscura de alta calidad para la zona de descripcion.
512x256 landscape. Sin bordes IA — el borde dorado preciso va en CSS (box-shadow inset).
Estrategia: basalto/hierro oscuro con grano sutil y ligero calor medieval.
"""
import requests, time, uuid, os

COMFY_URL  = "http://127.0.0.1:8000"
OUTPUT_DIR = r"C:\Users\Usuario\Desktop\Aethermarch_Clean\public\assets\generated"

POSITIVE = """flat 2d digital illustration, dark fantasy RPG UI texture panel, 512x256 landscape, game asset,

MATERIAL SURFACE: a wide horizontal slab of aged dark basalt stone or cold hammered iron, ancient and worn:
- extremely dark surface, deep near-black warm tone (#0c0a07), fills the entire image
- subtle horizontal micro-grain texture, barely visible directional lines going left-to-right like hammered metal
- slight natural vignette: the four edges are marginally darker than the center zone
- center zone: barely perceptible lighter dark warm core (#131008), creates natural reading focal area
- very occasional faint veins of slightly warmer dark material, like ancient stone variation
- bottom edge: fractionally lighter dark tone to hint at depth, like a thick stone slab viewed from above

QUALITY: smooth and worn, cold and heavy, like ancient iron plate or polished dark granite, permanent and grounded
NO border, NO frame, NO decorative ornaments, NO symbols, NO runes, NO text, NO light streaks, NO glowing effects
PURE MATERIAL TEXTURE ONLY — the whole image is material surface

LIGHTING: flat even ambient, minimal depth from material grain only, NOT dramatic chiaroscuro, NOT rim-lit
COLOR PALETTE: deep near-black cold-warm mix (#0a0806 to #181008), no other colors whatsoever
ART STYLE: precise flat 2d texture art, professional game UI panel asset, dark fantasy RPG, minimal and clean"""

NEGATIVE = """border, frame, decorative line, ornament, symbol, rune, text, character, scene, landscape,
bright, white, grey, gradient, cluttered, photorealistic, 3d render, dramatic lighting, colorful,
glowing, neon, blue, green, purple, red, orange, fire, sparks, bokeh, vignette ring, circular glow"""

W, H = 512, 256


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
                          "strength_model": 0.75, "strength_clip": 0.75,
                          "model": ["1", 0], "clip": ["4", 0]}},
        "3":  {"class_type": "LoraLoader",
               "inputs": {"lora_name": "2d_flat_illustrations_flux.safetensors",
                          "strength_model": 0.65, "strength_clip": 0.65,
                          "model": ["2", 0], "clip": ["2", 1]}},
        "5":  {"class_type": "CLIPTextEncode",
               "inputs": {"text": POSITIVE, "clip": ["3", 1]}},
        "6":  {"class_type": "CLIPTextEncode",
               "inputs": {"text": NEGATIVE, "clip": ["3", 1]}},
        "7":  {"class_type": "EmptyLatentImage",
               "inputs": {"width": W, "height": H, "batch_size": 1}},
        "8":  {"class_type": "KSampler",
               "inputs": {"seed": seed, "steps": 35, "cfg": 4.0,
                          "sampler_name": "euler", "scheduler": "simple",
                          "denoise": 1.0,
                          "model": ["3", 0], "positive": ["5", 0],
                          "negative": ["6", 0], "latent_image": ["7", 0]}},
        "9":  {"class_type": "VAELoader",
               "inputs": {"vae_name": "ae.safetensors"}},
        "10": {"class_type": "VAEDecode",
               "inputs": {"samples": ["8", 0], "vae": ["9", 0]}},
        "11": {"class_type": "SaveImage",
               "inputs": {"filename_prefix": f"panel_v2_s{seed}",
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
                        final_path = os.path.join(OUTPUT_DIR, f"panel_v2_s{seed}.png")
                        with open(final_path, "wb") as f:
                            f.write(r2.content)
                        print(f"  OK -> {final_path}", flush=True)
                        return final_path
            if st.get("status_str") == "error":
                print(f"  ERROR seed={seed}")
                return None
        time.sleep(3)


if __name__ == "__main__":
    print("=== Panel v2 (textura basalto/hierro oscuro 512x256) ===")
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    for seed in [7701, 7702, 7703]:
        run(seed)
    print("\n=== Listo ===")
