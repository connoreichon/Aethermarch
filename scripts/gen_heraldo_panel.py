"""
Genera el panel decorativo de fondo para la tarjeta de selección del Heraldo.
Colores: carmesí profundo, gris acero, bronce oscuro, fondo casi negro.
Tamaño: 512x768 (proporción 2:3, misma que el sprite del personaje).
"""
import requests, time, uuid, os

COMFY_URL  = "http://127.0.0.1:8000"
OUTPUT_DIR = r"C:\Users\Usuario\Desktop\Aethermarch_Clean\public\assets\generated"

POSITIVE = """flat 2d digital illustration, professional mobile RPG game UI panel, character selection card background frame, medieval gothic fantasy style,

OVERALL CARD: vertical portrait card layout 512x768, very dark near-black background color #070205, dark and moody medieval atmosphere,

CRIMSON GOTHIC FRAME: thick outer border frame in deep crimson red #8B1818, ornate gothic arch crown at top center of frame, decorative pointed arch at top with gothic tracery, symmetrical corner flourishes in crimson, thin secondary inner border line in dark steel grey,

VERTICAL SIDE BORDERS: two thin vertical crimson red pillar lines flanking the card on left and right interior edges, subtle crimson glow emanating inward from left and right borders,

TOP DECORATION: ornate gothic crown arch at very top, dark steel grey #505558 flanking pillar shapes, small dark bronze gold #8B6914 ornamental circle at apex peak, barely visible dark crimson red geometric diamond pattern behind the arch,

HORIZONTAL DIVIDER AT 65 PERCENT HEIGHT: thick decorative horizontal crimson red band at two thirds of the way down the card, small dark bronze gold diamond ornaments on the divider at center and corners, very subtle gothic cross motif, separates upper dark field from lower info panel,

LOWER INFO PANEL: bottom 35 percent of card has a very dark brownish-black background #100609 slightly different from upper area, two thin vertical crimson red lines on far left and right edges of info panel, subtle dark crimson tint throughout lower panel, spacious clean area for text overlay, small decorative gothic element at very bottom center,

CORNER DETAILS: four corner areas have small ornate gothic diamond shapes in dark bronze gold, barely visible,

COLORS ONLY: deep crimson red #8B1818 for frame and borders, very dark near-black #070205 for upper background, dark brownish #100609 for lower panel, steel grey #505558 for metalwork pillar elements, dark bronze gold #8B6914 for tiny ornaments,

STYLE: flat 2d professional game UI illustration, Fire Emblem character card frame style, AFK Arena card border, clean crisp digital art, no photorealism, no gradients just flat colors with very subtle shade variation"""

NEGATIVE = """character, person, face, body, hands, weapon, text, letters, numbers, watermark, logo, white background, bright colors, nature, grass, sky, clouds, landscape, building exterior, 3d render, photorealistic, blurry, noisy, painting, impressionist, colorful, rainbow, light background"""

def build_workflow(seed, prefix):
    return {
        "1":  {"class_type": "UNETLoader",
               "inputs": {"unet_name": "flux1-krea-dev_fp8_scaled.safetensors", "weight_dtype": "fp8_e4m3fn"}},
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
               "inputs": {"width": 512, "height": 768, "batch_size": 1}},
        "8":  {"class_type": "KSampler",
               "inputs": {"seed": seed, "steps": 45, "cfg": 4.5,
                          "sampler_name": "euler", "scheduler": "simple", "denoise": 1.0,
                          "model": ["3", 0], "positive": ["5", 0],
                          "negative": ["6", 0], "latent_image": ["7", 0]}},
        "9":  {"class_type": "VAELoader", "inputs": {"vae_name": "ae.safetensors"}},
        "10": {"class_type": "VAEDecode", "inputs": {"samples": ["8", 0], "vae": ["9", 0]}},
        "11": {"class_type": "SaveImage",
               "inputs": {"filename_prefix": prefix, "images": ["10", 0]}},
    }

def run(seed, name):
    wf  = build_workflow(seed, f"panel_heraldo_s{seed}")
    cid = str(uuid.uuid4())
    r   = requests.post(f"{COMFY_URL}/api/prompt", json={"prompt": wf, "client_id": cid}, timeout=30)
    if not r.ok:
        print(f"  Error {r.status_code}: {r.text[:200]}")
        return None
    pid = r.json()["prompt_id"]
    print(f"  seed={seed}  pid={pid}...", flush=True)
    while True:
        h = requests.get(f"{COMFY_URL}/history/{pid}", timeout=10).json()
        if pid in h:
            st = h[pid].get("status", {})
            if st.get("completed"):
                for out in h[pid].get("outputs", {}).values():
                    for img in out.get("images", []):
                        r2 = requests.get(f"{COMFY_URL}/view",
                                          params={"filename": img["filename"],
                                                  "subfolder": img.get("subfolder", ""),
                                                  "type": img.get("type", "output")},
                                          timeout=30)
                        path = os.path.join(OUTPUT_DIR, f"{name}.png")
                        with open(path, "wb") as f:
                            f.write(r2.content)
                        print(f"  Guardado: {path}")
                        return path
            if st.get("status_str") == "error":
                print(f"  ERROR seed={seed}")
                return None
        time.sleep(3)

if __name__ == "__main__":
    print("=== Panel Heraldo ===")
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    for seed in [7766, 7767, 7768, 7769]:
        run(seed, f"panel_heraldo_s{seed}")
    print("Listo.")
