# ── Aethermarch Asset Generator ───────────────────────────────────────────────
param(
    [Parameter(Mandatory=$true)]  [string]$Name,
    [Parameter(Mandatory=$true)]  [string]$Prompt,
    [Parameter(Mandatory=$false)] [string]$ClipL       = "",
    [Parameter(Mandatory=$false)] [int]   $Width       = 512,
    [Parameter(Mandatory=$false)] [int]   $Height      = 512,
    [Parameter(Mandatory=$false)] [long]  $Seed        = -1,
    [Parameter(Mandatory=$false)] [int]   $Steps       = 25,
    [Parameter(Mandatory=$false)] [float] $Guidance    = 3.5,
    [Parameter(Mandatory=$false)] [float] $LoraGCP     = 0.85,
    [Parameter(Mandatory=$false)] [float] $LoraCEL     = 0.7,
    [Parameter(Mandatory=$false)] [switch]$Transparent
)

$API      = "http://127.0.0.1:8000"
$DEST_DIR = "C:\Users\Usuario\Desktop\Aethermarch_Clean\public\assets\generated"

if ($Seed -eq -1) { $Seed = Get-Random -Minimum 1 -Maximum 2147483647 }
if ($ClipL -eq "") { $ClipL = ($Prompt -split " " | Select-Object -First 20) -join " " }

function EscJ($s) { $s -replace '\\','\\' -replace '"','\"' -replace "`n",'\n' -replace "`r",'' }
$pClipL = EscJ $ClipL
$pT5    = EscJ $Prompt
$pName  = EscJ "aethermarch/$Name"

# Construir workflow base
$wfBase = @"
{
  "1":  { "inputs": { "unet_name": "flux1-krea-dev_fp8_scaled.safetensors", "weight_dtype": "fp8_e4m3fn" }, "class_type": "UNETLoader" },
  "2":  { "inputs": { "clip_name1": "clip_l.safetensors", "clip_name2": "t5xxl_fp8_e4m3fn_scaled.safetensors", "type": "flux" }, "class_type": "DualCLIPLoader" },
  "3":  { "inputs": { "vae_name": "ae.safetensors" }, "class_type": "VAELoader" },
  "4":  { "inputs": { "lora_name": "game_character_portrait_flux.safetensors", "strength_model": $LoraGCP, "strength_clip": $LoraGCP, "model": ["1", 0], "clip": ["2", 0] }, "class_type": "LoraLoader" },
  "5":  { "inputs": { "lora_name": "cel_shading_anime_flux.safetensors", "strength_model": $LoraCEL, "strength_clip": $LoraCEL, "model": ["4", 0], "clip": ["4", 1] }, "class_type": "LoraLoader" },
  "6":  { "inputs": { "clip": ["5", 1], "clip_l": "$pClipL", "t5xxl": "$pT5", "guidance": $Guidance }, "class_type": "CLIPTextEncodeFlux" },
  "7":  { "inputs": { "guidance": $Guidance, "conditioning": ["6", 0] }, "class_type": "FluxGuidance" },
  "8":  { "inputs": { "width": $Width, "height": $Height, "batch_size": 1 }, "class_type": "EmptyLatentImage" },
  "9":  { "inputs": { "noise_seed": $Seed }, "class_type": "RandomNoise" },
  "10": { "inputs": { "model": ["5", 0], "conditioning": ["7", 0] }, "class_type": "BasicGuider" },
  "11": { "inputs": { "sampler_name": "euler" }, "class_type": "KSamplerSelect" },
  "12": { "inputs": { "scheduler": "simple", "steps": $Steps, "denoise": 1.0, "model": ["5", 0] }, "class_type": "BasicScheduler" },
  "13": { "inputs": { "noise": ["9", 0], "guider": ["10", 0], "sampler": ["11", 0], "sigmas": ["12", 0], "latent_image": ["8", 0] }, "class_type": "SamplerCustomAdvanced" },
  "14": { "inputs": { "samples": ["13", 0], "vae": ["3", 0] }, "class_type": "VAEDecode" },
  "15": { "inputs": { "filename_prefix": "${pName}_base", "images": ["14", 0] }, "class_type": "SaveImage" }
}
"@

# Añadir REMBG si se pide fondo transparente
if ($Transparent) {
    $wfBase = $wfBase.TrimEnd("}").TrimEnd().TrimEnd("}") + @"
,
  "16": { "inputs": { "images": ["14", 0], "rem_mode": "RMBG-1.4", "image_output": "Hide", "save_prefix": "rembg_tmp", "add_background": "none", "refine_foreground": true }, "class_type": "easy imageRemBg" },
  "17": { "inputs": { "image": ["16", 0], "mask": ["16", 1] }, "class_type": "JoinImageWithAlpha" },
  "18": { "inputs": { "filename_prefix": "$pName", "images": ["17", 0] }, "class_type": "SaveImageWithAlpha" }
}
"@
}

$body = "{`"prompt`": $wfBase}"

Write-Host "Generando '$Name' (seed: $Seed, ${Width}x${Height}, steps: $Steps, transparent: $($Transparent.IsPresent))..."

try {
    $res = Invoke-RestMethod -Uri "$API/prompt" -Method POST -Body $body -ContentType "application/json"
} catch {
    $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
    Write-Host "ERROR ComfyUI: $($reader.ReadToEnd())"
    exit 1
}

$promptId = $res.prompt_id
Write-Host "  Job ID: $promptId"

# Polling
$maxWait = 600
$elapsed = 0
do {
    Start-Sleep -Seconds 3
    $elapsed += 3
    try {
        $hist = Invoke-RestMethod -Uri "$API/history/$promptId" -TimeoutSec 5
        $done = $hist.PSObject.Properties.Name -contains $promptId
    } catch { $done = $false }
    if (-not $done) { Write-Host "  ...esperando (${elapsed}s)" }
} while (-not $done -and $elapsed -lt $maxWait)

if (-not $done) { Write-Host "ERROR: timeout"; exit 1 }

$outputs = $hist.$promptId.outputs

# Elegir nodo de salida
$saveNodeId = "15"
if ($Transparent -and $outputs."18") { $saveNodeId = "18" }
$imgNode = $outputs.$saveNodeId

if (-not $imgNode) {
    Write-Host "ERROR: sin output. Nodos: $($outputs.PSObject.Properties.Name -join ', ')"
    exit 1
}

$imgInfo   = $imgNode.images[0]
$filename  = $imgInfo.filename
$subfolder = $imgInfo.subfolder
$imgType   = if ($imgInfo.type) { $imgInfo.type } else { "output" }
$imgUrl    = "$API/view?filename=$([System.Uri]::EscapeDataString($filename))&subfolder=$([System.Uri]::EscapeDataString($subfolder))&type=$imgType"

New-Item -ItemType Directory -Force $DEST_DIR | Out-Null
$destFile = "$DEST_DIR\$Name.png"
Invoke-WebRequest -Uri $imgUrl -OutFile $destFile

Write-Host "OK: $destFile"
Write-Host "   Seed: $Seed"
