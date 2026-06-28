"""
Panel decorativo para la sección de habilidad pasiva.
512x256 landscape — placa de hierro oscuro con borde dorado fino.
Se usa como fondo del área de descripción en la card.
"""
import requests, time, uuid, os, io

COMFY_URL  = "http://127.0.0.1:8000"
OUTPUT_DIR = r"C:\Users\Usuario\Desktop\Aethermarch_Clean\public\assets\generated"

POSITIVE = """flat 2d digital illustration, dark fantasy RPG game UI panel, 512x256 horizontal landscape, game HUD element, game asset,

a wide horizontal text panel, precise and elegant:

SURFACE: very dark aged iron plate or polished obsidian stone slab, near-black (#0d0b0a), extremely dark main area for maximum text legibility, very subtle worn metal texture grain

BORDER: single thin precise line of warm aged gold (#c8a832) running around ALL FOUR edges, exactly 3 pixels from each edge, clean and sharp, no gaps

CORNER ORNAMENTS: at each of the four corners, a small precise right-angle bracket ornament made of two thin gold lines forming an L-shape, extends 18px along each edge from the corner

TOP CENTER: one small gold diamond shape (◆) centered exactly on the top edge, 8px tall, acts as decorative divider between top border and surface

BOTTOM CENTER: matching gold diamond (◆) centered exactly on the bottom edge, identical to the top one, perfect symmetry

SURFACE TEXTURE: the dark surface has extremely subtle directional brush strokes or metal grain going horizontally, barely perceptible, adds depth without reducing contrast

COLOR: near-black surface #0d0b0a, thin gold border #c8a832, no other colors, no highlights, no gradients except barely-visible subtle vignette darkening toward edges

ART STYLE: precise clean flat 2d game UI, dark fantasy RPG HUD element, exact symmetry, crisp edges, professional game asset, NOT photorealistic, NOT 3d"""

NEGATIVE = """bright, white, light colored, character, scene, landscape, cluttered, busy, photorealistic, 3d, gradient background, colored interior, text written on surface, wide thick border, ornate scrollwork, thick frame"""

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
               "inputs": {"seed": seed, "steps": 40, "cfg": 5.0,
                          "sampler_name": "euler", "scheduler": "simple",
                          "denoise": 1.0,
                          "model": ["3", 0], "positive": ["5", 0],
                          "negative": ["6", 0], "latent_image": ["7", 0]}},
        "9":  {"class_type": "VAELoader",
               "inputs": {"vae_name": "ae.safetensors"}},
        "10": {"class_type": "VAEDecode",
               "inputs": {"samples": ["8", 0], "vae": ["9", 0]}},
        "11": {"class_type": "SaveImage",
               "inputs": {"filename_prefix": f"panel_habilidad_s{seed}",
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
                        final_path = os.path.join(OUTPUT_DIR, f"panel_habilidad_s{seed}.png")
                        with open(final_path, "wb") as f:
                            f.write(r2.content)
                        print(f"  OK -> {final_path}", flush=True)
                        return final_path
            if st.get("status_str") == "error":
                print(f"  ERROR seed={seed}")
                return None
        time.sleep(3)


if __name__ == "__main__":
    print("=== Panel Habilidad (512x256, placa oscura) ===")
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    for seed in [6601, 6602, 6603]:
        run(seed)
    print("\n=== Listo ===")
