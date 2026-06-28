"""
Panel pergamino — textura de pergamino medieval auténtico.
512x384 landscape (ratio 4:3, encaja con el panel del personaje ~430x304px).
Tonos cálidos sepia/ámbar, superficie natural, bordes desgastados.
"""
import requests, time, uuid, os

COMFY_URL  = "http://127.0.0.1:8000"
OUTPUT_DIR = r"C:\Users\Usuario\Desktop\Aethermarch_Clean\public\assets\generated"

POSITIVE = """flat 2d illustration, parchment material texture closeup, RPG UI panel asset, 512x384 landscape,

THE ENTIRE IMAGE IS PARCHMENT SURFACE — no scene, no object, no context, just material:
- warm cream-amber tone filling edge to edge, base color #D4B870 to #C4A458
- natural linen and vellum fiber grain visible across the whole surface
- subtle directional texture from the material fibers, very fine
- very slight tonal variation across the surface: warmer in center, fractionally darker at edges
- MINIMAL aging: just a tiny amount of natural yellowing, almost clean and smooth
- edges: softly darker amber-brown rim, organic feathered fade, NOT a geometric border

QUALITY: premium clean parchment, mostly smooth and even, like a freshly prepared manuscript sheet
CLEAN: barely any stains — at most one or two extremely faint marks, nearly invisible
COLOR: warm honey-amber cream, uniform and inviting, readable

NO water stains, NO foxing spots, NO blotches, NO dirty marks, NO heavy aging
NO table, NO desk, NO wood surface, NO shadow underneath, NO scene, NO objects
NO text, NO symbols, NO borders, NO decorative elements
PURE FLAT PARCHMENT TEXTURE — fills the whole frame edge to edge"""

NEGATIVE = """table, desk, wood, surface, scene, background, object, shadow underneath,
stains, blotches, foxing spots, heavy aging, dirty, dark patches,
text, letters, writing, runes, symbols, border, frame, decorative ornament,
modern, white paper, bright white, cold, blue, grey, purple, futuristic,
photorealistic, 3d render, dramatic lighting, bokeh, character"""

W, H = 512, 384


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
                          "strength_model": 0.55, "strength_clip": 0.55,
                          "model": ["1", 0], "clip": ["4", 0]}},
        "3":  {"class_type": "LoraLoader",
               "inputs": {"lora_name": "2d_flat_illustrations_flux.safetensors",
                          "strength_model": 0.45, "strength_clip": 0.45,
                          "model": ["2", 0], "clip": ["2", 1]}},
        "5":  {"class_type": "CLIPTextEncode",
               "inputs": {"text": POSITIVE, "clip": ["3", 1]}},
        "6":  {"class_type": "CLIPTextEncode",
               "inputs": {"text": NEGATIVE, "clip": ["3", 1]}},
        "7":  {"class_type": "EmptyLatentImage",
               "inputs": {"width": W, "height": H, "batch_size": 1}},
        "8":  {"class_type": "KSampler",
               "inputs": {"seed": seed, "steps": 30, "cfg": 3.5,
                          "sampler_name": "euler", "scheduler": "simple",
                          "denoise": 1.0,
                          "model": ["3", 0], "positive": ["5", 0],
                          "negative": ["6", 0], "latent_image": ["7", 0]}},
        "9":  {"class_type": "VAELoader",
               "inputs": {"vae_name": "ae.safetensors"}},
        "10": {"class_type": "VAEDecode",
               "inputs": {"samples": ["8", 0], "vae": ["9", 0]}},
        "11": {"class_type": "SaveImage",
               "inputs": {"filename_prefix": f"pergamino_s{seed}",
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
                    for img in out.get("images", []):
                        r2 = requests.get(f"{COMFY_URL}/view",
                            params={"filename": img["filename"],
                                    "subfolder": img.get("subfolder", ""),
                                    "type": img.get("type", "output")},
                            timeout=30)
                        dst = os.path.join(OUTPUT_DIR, f"pergamino_s{seed}.png")
                        with open(dst, "wb") as f:
                            f.write(r2.content)
                        print(f"  OK -> {dst}", flush=True)
                        return dst
            if st.get("status_str") == "error":
                print(f"  ERROR seed={seed}")
                return None
        time.sleep(3)


if __name__ == "__main__":
    print("=== Pergamino medieval (512x384) ===")
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    for seed in [8901, 8902, 8903]:
        run(seed)
    print("\n=== Listo ===")
