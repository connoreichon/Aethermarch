"""
Fondo atmosférico para la card del Heraldo.
512x768 — interior de fortaleza medieval, iluminación de antorchas roja/ámbar.
El personaje PNG se superpone encima en CSS.
"""
import requests, time, uuid, os, io
from PIL import Image

COMFY_URL  = "http://127.0.0.1:8000"
OUTPUT_DIR = r"C:\Users\Usuario\Desktop\Aethermarch_Clean\public\assets\generated"

POSITIVE = """flat 2d digital illustration, dark fantasy RPG atmospheric card background, 512x768 vertical format, game asset, NO characters, NO people,

medieval stone fortress interior at night, dramatic atmospheric scene:

COMPOSITION:
- left and right sides: stone columns or walls with mounted torch sconces, warm amber-crimson flames
- center vertical strip: darker, relatively empty space where character will be placed in front
- bottom: barely visible worn stone floor, thin wisps of crimson mist at ground level
- upper area: vaulted stone ceiling fading to deep shadow

TOP 18 PERCENT OF IMAGE: extremely dark, near-black, almost no detail — this area is reserved for title text overlay

LIGHTING: dramatic chiaroscuro, warm pools of amber-red torchlight on stone, deep cold shadows between, tiny floating embers, atmospheric depth and mist

COLOR PALETTE: deep crimson (#5a0010), warm amber (#c87820), antique gold accents, dark charcoal stone (#1a1514), atmospheric moody tones

MOOD: dark heroic fantasy, atmospheric and immersive, sense of depth and grandeur

ART STYLE: clean flat 2d digital illustration, game background art, dark fantasy RPG card aesthetic, NOT photorealistic, NOT 3d render, flat cel-shading, atmospheric"""

NEGATIVE = """character, person, figure, face, portrait, border frame, decorative frame, text, watermark, photorealistic, 3d, realistic, bright white, modern, sci-fi, cheerful, colorful, busy, cluttered, crowded scene"""

W, H = 512, 768


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
                          "strength_model": 0.9, "strength_clip": 0.9,
                          "model": ["1", 0], "clip": ["4", 0]}},
        "3":  {"class_type": "LoraLoader",
               "inputs": {"lora_name": "2d_flat_illustrations_flux.safetensors",
                          "strength_model": 0.8, "strength_clip": 0.8,
                          "model": ["2", 0], "clip": ["2", 1]}},
        "5":  {"class_type": "CLIPTextEncode",
               "inputs": {"text": POSITIVE, "clip": ["3", 1]}},
        "6":  {"class_type": "CLIPTextEncode",
               "inputs": {"text": NEGATIVE, "clip": ["3", 1]}},
        "7":  {"class_type": "EmptyLatentImage",
               "inputs": {"width": W, "height": H, "batch_size": 1}},
        "8":  {"class_type": "KSampler",
               "inputs": {"seed": seed, "steps": 40, "cfg": 4.0,
                          "sampler_name": "euler", "scheduler": "simple",
                          "denoise": 1.0,
                          "model": ["3", 0], "positive": ["5", 0],
                          "negative": ["6", 0], "latent_image": ["7", 0]}},
        "9":  {"class_type": "VAELoader",
               "inputs": {"vae_name": "ae.safetensors"}},
        "10": {"class_type": "VAEDecode",
               "inputs": {"samples": ["8", 0], "vae": ["9", 0]}},
        "11": {"class_type": "SaveImage",
               "inputs": {"filename_prefix": f"fondo_heraldo_s{seed}",
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
                        final_path = os.path.join(OUTPUT_DIR, f"fondo_heraldo_s{seed}.png")
                        with open(final_path, "wb") as f:
                            f.write(r2.content)
                        print(f"  OK -> {final_path}", flush=True)
                        return final_path
            if st.get("status_str") == "error":
                print(f"  ERROR seed={seed}")
                return None
        time.sleep(3)


if __name__ == "__main__":
    print("=== Fondo Heraldo (512x768 atmosférico) ===")
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    for seed in [5501, 5502, 5503]:
        run(seed)
    print("\n=== Listo ===")
