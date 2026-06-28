"""
Panel pergamino — textura de pergamino medieval auténtico.
512x384 landscape (ratio 4:3, encaja con el panel del personaje ~430x304px).
Tonos cálidos sepia/ámbar, superficie natural, bordes desgastados.
"""
import requests, time, uuid, os

COMFY_URL  = "http://127.0.0.1:8000"
OUTPUT_DIR = r"C:\Users\Usuario\Desktop\Aethermarch_Clean\public\assets\generated"

POSITIVE = """close-up macro top-down flat lay of aged parchment paper, 512x384,

CAMERA: directly above looking straight down — bird-eye view, flat lay style, NO angle
FILLS 100 PERCENT OF FRAME: only paper surface visible, nothing else, no context

PAPER SURFACE:
- warm cream-amber tone #D0B068, fills the entire image
- natural paper fiber grain texture visible across whole surface
- several soft fold lines and gentle creases crossing the paper at angles
- crease shadows soft and subtle — darker amber-brown lines, not harsh
- center slightly lighter warm cream tone
- edges marginally darker amber vignette

LIGHTING: even soft diffuse light from directly above, no dramatic shadows from objects
NO objects ON the paper, NO ink, NO quill, NO other items
NO background visible — only the paper surface fills the frame"""

NEGATIVE = """table, desk, wooden surface, wood grain, floor, wall, room, scene,
background behind paper, objects on paper, quill pen, ink, books, furniture,
scroll tube, items, dramatic shadow from object, any object whatsoever,
border, frame, text, writing, symbols, runes, decorative elements,
dark, cold colors, blue, grey, purple, futuristic, photorealistic, 3d render"""

W, H = 512, 384


def build_workflow(seed):
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
               "inputs": {"seed": seed, "steps": 25, "cfg": 2.8,
                          "sampler_name": "euler", "scheduler": "simple",
                          "denoise": 1.0,
                          "model": ["1", 0], "positive": ["5", 0],
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
    for seed in [9101, 9102, 9103]:
        run(seed)
    print("\n=== Listo ===")
