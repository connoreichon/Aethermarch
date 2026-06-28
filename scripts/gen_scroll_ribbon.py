"""
gen_scroll_ribbon.py
Genera lazo de cinta carmesí medieval sobre FONDO BLANCO puro.
- Fondo blanco: con mix-blend-mode:darken en CSS desaparece (blanco = transparente).
- Lazo carmesí: color propio queda intacto (140x30x30 < 196x152x80 en todos los canales).
- Para otros personajes: filter:hue-rotate en CSS cambia el color del lazo.
Salida: 512x140 px. La banda horizontal atraviesa todo el ancho.
"""
import requests, time, uuid, os

COMFY_URL  = "http://127.0.0.1:8000"
OUTPUT_DIR = r"C:\Users\Usuario\Desktop\Aethermarch_Clean\public\assets\generated"

POSITIVE = """top-down bird-eye flat lay macro view of a crimson satin ribbon bow, 512x140

CANVAS: pure white (#ffffff) background, completely flat and uniform, no texture
COMPOSITION:
- horizontal satin ribbon band crosses the entire width of the image at vertical center
- at center of image: a tied bow knot sits ON TOP of the horizontal band
- bow: two plump rounded loops extending symmetrically left and right from center
- center knot: small gathered bundle of fabric where loops meet
- below knot: two short ribbon tail ends trailing downward

RIBBON DETAILS:
- deep rich crimson-red color #aa2222
- soft satin fabric texture with a gentle sheen highlight along the top surface
- slightly soft fabric edges, not perfectly sharp
- subtle drop shadow under ribbon onto the white background

BACKGROUND: pure white #ffffff, nothing else, no objects, no texture
LIGHTING: flat soft even light from directly above
NO parchment, NO wooden surface, NO scroll body, NO text, NO other objects"""

NEGATIVE = """parchment, wood, table, stone, floor, texture background, colored background,
dark background, grey background, multiple bows, untied ribbon, blue ribbon, green ribbon,
gold ribbon, text, writing, quill, ink, other objects, messy, uneven, SVG flat look,
cartoon simplified, photorealistic 3d render with dramatic shadows"""

W, H = 512, 140


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
               "inputs": {"seed": seed, "steps": 28, "cfg": 3.5,
                          "sampler_name": "euler", "scheduler": "simple",
                          "denoise": 1.0,
                          "model": ["1", 0], "positive": ["5", 0],
                          "negative": ["6", 0], "latent_image": ["7", 0]}},
        "9":  {"class_type": "VAELoader",
               "inputs": {"vae_name": "ae.safetensors"}},
        "10": {"class_type": "VAEDecode",
               "inputs": {"samples": ["8", 0], "vae": ["9", 0]}},
        "11": {"class_type": "SaveImage",
               "inputs": {"filename_prefix": f"scroll_ribbon_s{seed}",
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
                        dst = os.path.join(OUTPUT_DIR, f"scroll_ribbon_s{seed}.png")
                        with open(dst, "wb") as f:
                            f.write(r2.content)
                        print(f"  OK -> {dst}", flush=True)
                        return dst
            if st.get("status_str") == "error":
                print(f"  ERROR seed={seed}")
                return None
        time.sleep(3)


if __name__ == "__main__":
    print("=== Lazo carmesí del scroll (512x140, fondo blanco) ===")
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    for seed in [7001, 7002, 7003, 7004]:
        run(seed)
    print("\n=== Listo ===")
