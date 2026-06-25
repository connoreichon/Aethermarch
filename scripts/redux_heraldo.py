"""
Flux Redux: genera variaciones del Heraldo manteniendo consistencia visual.
Usa heraldo_canon.png como imagen de referencia (IP-Adapter Flux).
Nodes: SigCLIP → StyleModelApply → KSampler
"""
import requests
import json
import time
import uuid
import os

COMFY_URL  = "http://127.0.0.1:8000"
OUTPUT_DIR = r"C:\Users\Usuario\Desktop\Aethermarch_Clean\public\assets\generated"
CANON      = os.path.join(OUTPUT_DIR, "heraldo_canon.png")

# ── Prompts ──────────────────────────────────────────────────────────────────
POSITIVE = """flat 2d anime illustration, clean anime art style, japanese mobile game character design, anime RPG character sprite, full body character, professional game asset, Fire Emblem style, AFK Arena style, high quality sharp illustration,

Heraldo warrior guardian class, full body front view walking pose, natural walk mid-stride left foot forward right foot back, arms swinging naturally at sides, clean readable silhouette, walk cycle animation frame,

FACE AND EYES: clean anime masculine face, simplified strong features, warm medium olive skin tone, VERY DARK BROWN almost black short hair cropped neatly, warm brown eyes with clear sharp crisp anime eye detail, firm strong jaw, composed serious expression, clean smooth face, sharp defined eyes,

ARMOR: clean stylized plate armor steel grey, bold simple armor shapes, solid chest plate, RIGHT pauldron significantly larger and taller than left pauldron, BOTH FOREARMS have identical steel grey plate vambraces covering elbow to wrist on BOTH arms equally, chainmail visible at neck and collar, simple leather straps with small bronze buckles,

CRIMSON HALF-MANTLE: deep crimson red half-mantle draped over shoulders falling to mid-thigh, clean straight lower border, no fringe no tassels, red mantle against grey armor,

BOTH HANDS EMPTY: both hands are completely EMPTY and open, hanging freely at the sides as arms swing in walk, NO object in either hand, NO weapon in hands, fingers open and relaxed,

LONGSWORD SCABBARD AT LEFT HIP: a dark brown leather LONGSWORD scabbard hangs diagonally from the belt at the character LEFT hip, the scabbard is LONG reaching down to the knee, the bronze pommel sticks upward above the belt, the FULL-LENGTH longsword is completely INSIDE the scabbard, the blade is LONG like a proper medieval longsword NOT a dagger NOT a short sword, the tip of the long scabbard points down past the knee,

BELT: simple dark leather belt with small pouch, bronze buckle,
BOOTS: knee high dark leather boots,

COLOR PALETTE: steel grey armor, deep crimson mantle, dark bronze hardware, warm olive skin, very dark brown near-black hair, warm brown eyes, dark background,

STYLE: pure flat 2d anime illustration, clean bold black outlines, flat color fills, minimal cel shading, sharp clean linework"""

NEGATIVE = """photorealistic, 3d, realistic shading, extra limbs, deformed, blurry, low quality, watermark, text, multiple characters, chibi, neon colors, blood, dirt, feminine, girl, blonde hair, white hair, pink hair, light hair, blue hair, fringe, tassels, frayed hem, sword in right hand, sword in left hand, sword held, holding sword, gripping sword, weapon in hand, hand gripping hilt, hand on pommel, sword drawn, unsheathed sword, blade in hand, sword horizontal, sword pointing up, sword raised, shield, buckler, dagger, short sword, shortsword, stubby blade, short blade, knife"""


def upload_image(path: str, name: str) -> str:
    with open(path, "rb") as f:
        r = requests.post(
            f"{COMFY_URL}/upload/image",
            files={"image": (name, f, "image/png")},
            data={"type": "input", "overwrite": "true"},
            timeout=30,
        )
    r.raise_for_status()
    return r.json()["name"]


def build_workflow(canon_name: str, seed: int, prefix: str) -> dict:
    return {
        # ── Base model + LoRAs ───────────────────────────────────────────────
        "1": {
            "class_type": "UNETLoader",
            "inputs": {
                "unet_name": "flux1-krea-dev_fp8_scaled.safetensors",
                "weight_dtype": "fp8_e4m3fn"
            }
        },
        "4": {
            "class_type": "DualCLIPLoader",
            "inputs": {
                "clip_name1": "t5xxl_fp8_e4m3fn_scaled.safetensors",
                "clip_name2": "clip_l.safetensors",
                "type": "flux"
            }
        },
        "2": {
            "class_type": "LoraLoader",
            "inputs": {
                "lora_name": "flat_illustration_flux.safetensors",
                "strength_model": 1.0,
                "strength_clip": 1.0,
                "model": ["1", 0],
                "clip": ["4", 0]
            }
        },
        "3": {
            "class_type": "LoraLoader",
            "inputs": {
                "lora_name": "2d_flat_illustrations_flux.safetensors",
                "strength_model": 0.90,
                "strength_clip": 0.90,
                "model": ["2", 0],
                "clip": ["2", 1]
            }
        },
        # ── Texto ────────────────────────────────────────────────────────────
        "5": {
            "class_type": "CLIPTextEncode",
            "inputs": {"text": POSITIVE, "clip": ["3", 1]}
        },
        "6": {
            "class_type": "CLIPTextEncode",
            "inputs": {"text": NEGATIVE, "clip": ["3", 1]}
        },
        # ── SigCLIP Vision Encoder → procesa imagen canon ───────────────────
        "20": {
            "class_type": "CLIPVisionLoader",
            "inputs": {"clip_name": "sigclip_vision_patch14_384.safetensors"}
        },
        "21": {
            "class_type": "LoadImage",
            "inputs": {"image": canon_name}
        },
        "22": {
            "class_type": "CLIPVisionEncode",
            "inputs": {
                "clip_vision": ["20", 0],
                "image": ["21", 0],
                "crop": "center"
            }
        },
        # ── Redux Style Model ─────────────────────────────────────────────────
        "23": {
            "class_type": "StyleModelLoader",
            "inputs": {"style_model_name": "flux1-redux-dev.safetensors"}
        },
        "24": {
            "class_type": "StyleModelApply",
            "inputs": {
                "conditioning": ["5", 0],
                "style_model": ["23", 0],
                "clip_vision_output": ["22", 0],
                "strength": 0.35,
                "strength_type": "attn_bias"
            }
        },
        # ── Latent + Sampler ─────────────────────────────────────────────────
        "7": {
            "class_type": "EmptyLatentImage",
            "inputs": {"width": 768, "height": 1152, "batch_size": 1}
        },
        "8": {
            "class_type": "KSampler",
            "inputs": {
                "seed": seed,
                "steps": 50,
                "cfg": 4.0,
                "sampler_name": "euler",
                "scheduler": "simple",
                "denoise": 1.0,
                "model": ["3", 0],
                "positive": ["24", 0],
                "negative": ["6", 0],
                "latent_image": ["7", 0]
            }
        },
        # ── VAE + Guardar ─────────────────────────────────────────────────────
        "9": {
            "class_type": "VAELoader",
            "inputs": {"vae_name": "ae.safetensors"}
        },
        "10": {
            "class_type": "VAEDecode",
            "inputs": {"samples": ["8", 0], "vae": ["9", 0]}
        },
        "11": {
            "class_type": "SaveImage",
            "inputs": {"filename_prefix": prefix, "images": ["10", 0]}
        }
    }


def run_and_save(workflow: dict, save_path: str) -> bool:
    cid  = str(uuid.uuid4())
    resp = requests.post(
        f"{COMFY_URL}/api/prompt",
        json={"prompt": workflow, "client_id": cid},
        timeout=30,
    )
    if not resp.ok:
        print(f"  Error API: {resp.text[:500]}")
        return False
    pid = resp.json()["prompt_id"]
    print(f"  prompt_id={pid}  generando...", flush=True)
    while True:
        hist = requests.get(f"{COMFY_URL}/history/{pid}", timeout=10).json()
        if pid in hist:
            st = hist[pid].get("status", {})
            if st.get("completed"):
                for node_out in hist[pid].get("outputs", {}).values():
                    for img in node_out.get("images", []):
                        r = requests.get(
                            f"{COMFY_URL}/view",
                            params={
                                "filename": img["filename"],
                                "subfolder": img.get("subfolder", ""),
                                "type": img.get("type", "output"),
                            },
                            timeout=30,
                        )
                        with open(save_path, "wb") as f:
                            f.write(r.content)
                        print(f"  Guardado: {save_path}")
                        return True
            if st.get("status_str") == "error":
                print("  ERROR en sampler")
                return False
        time.sleep(3)


if __name__ == "__main__":
    print("=== Flux Redux — Heraldo consistente ===")
    print(f"Canon: {CANON}")
    canon_name = upload_image(CANON, "heraldo_canon.png")
    print(f"  Subido como: {canon_name}")

    # Runs: seed, descripción de pose
    runs = [
        (2010, "heraldo_botharms_s2010"),
        (2013, "heraldo_botharms_s2013"),
        (2014, "heraldo_botharms_s2014"),
    ]

    for seed, prefix in runs:
        save_path = os.path.join(OUTPUT_DIR, f"{prefix}.png")
        print(f"\nSeed={seed}  ({prefix})")
        wf = build_workflow(canon_name, seed, prefix)
        run_and_save(wf, save_path)

    print("\nListo.")
