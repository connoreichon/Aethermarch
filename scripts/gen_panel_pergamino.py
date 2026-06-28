"""
Panel pergamino — textura de pergamino medieval auténtico.
512x384 landscape (ratio 4:3, encaja con el panel del personaje ~430x304px).
Tonos cálidos sepia/ámbar, superficie natural, bordes desgastados.
"""
import requests, time, uuid, os

COMFY_URL  = "http://127.0.0.1:8000"
OUTPUT_DIR = r"C:\Users\Usuario\Desktop\Aethermarch_Clean\public\assets\generated"

POSITIVE = """flat 2d illustration, ancient medieval parchment scroll texture, RPG UI panel asset, 512x384 landscape,

MATERIAL: old aged vellum parchment unfurled scroll, authentic medieval manuscript material:
- base tone: warm amber sepia #C8A458 to #B89040, fills the whole image
- natural linen fiber grain texture clearly visible across the surface
- very slightly uneven surface, hand-crafted artisan quality
- subtle aged water stains scattered across: pale circular marks, very faint
- light age spots and foxing marks, authentic yellowing from centuries
- center zone: slightly lighter warm cream for readability, organic not geometric
- edges all four sides: naturally darker brown-amber border, worn and feathered, NOT a hard line

TOP EDGE: slightly darker amber-brown, like the top of a scroll rolled out, with visible grain
BOTTOM EDGE: same natural darkening, slight curl/shadow suggestion
SIDES: natural feathered darker edges

ATMOSPHERE: real old map parchment, ancient tome page, medieval manuscript leaf
QUALITY: premium material texture, warm and organic, genuinely aged

NO text, NO letters, NO writing, NO symbols, NO runes, NO decorative borders, NO ornaments
PURE PARCHMENT MATERIAL TEXTURE ONLY — the entire image is material surface"""

NEGATIVE = """text, letters, writing, runes, symbols, border, frame, decorative line, ornament,
modern, clean, white, bright, cold, blue, grey, purple, futuristic,
photorealistic, 3d render, dramatic lighting, bokeh, character, scene,
smooth plastic, digital look, metallic, stone, fabric other than parchment"""

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
    for seed in [8801, 8802, 8803]:
        run(seed)
    print("\n=== Listo ===")
