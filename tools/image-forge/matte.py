#!/usr/bin/env python3
"""Image Forge · matte — offline background removal (ONNX, U²-Net family).

A fallback for when API image generation is unavailable (quota/outage): take an
ONLINE photo (or a local file) that already contains the subject and cut it out
to a clean transparent PNG with an offline ONNX saliency model — no cloud calls.

Models (rembg weights — see models/NOTICE for provenance & license):
  u2netp             vendored at models/u2netp.onnx  (Apache-2.0, ~4.4MB) — default
  u2net              higher quality  (~168MB, downloaded on first use)
  isnet-general-use  best edges      (~170MB, downloaded on first use)

Large models are fetched to models/cache/ (gitignored) via a GitHub proxy;
override with env IMAGE_FORGE_GH_PROXY (set empty to hit GitHub directly).

Extra deps (NOT part of generate.py's stdlib-only path): onnxruntime, Pillow, numpy.

Usage:
  python tools/image-forge/matte.py "https://host/photo.jpg" ui/<page>/assets/x.png
  python tools/image-forge/matte.py in.jpg out.png --model isnet-general-use
  python tools/image-forge/matte.py in.jpg out.png --no-trim --feather 0.6
"""

import argparse
import os
import subprocess
import sys
import tempfile
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
MODELS_DIR = SCRIPT_DIR / "models"
CACHE_DIR = MODELS_DIR / "cache"
GH_PROXY = os.environ.get("IMAGE_FORGE_GH_PROXY", "https://ghfast.top/")
RELEASE = "https://github.com/danielgatis/rembg/releases/download/v0.0.0"

MODELS = {
    "u2netp":            {"file": "u2netp.onnx",            "family": "u2net", "vendored": True},
    "u2net":             {"file": "u2net.onnx",             "family": "u2net", "vendored": False},
    "isnet-general-use": {"file": "isnet-general-use.onnx", "family": "isnet", "vendored": False},
}
FAMILY = {
    "u2net": {"size": 320,  "mean": (0.485, 0.456, 0.406), "std": (0.229, 0.224, 0.225)},
    "isnet": {"size": 1024, "mean": (0.5, 0.5, 0.5),       "std": (1.0, 1.0, 1.0)},
}


def _curl(url, out, timeout=600):
    r = subprocess.run(["curl", "-L", "--fail", "--max-time", str(timeout),
                        "--retry", "2", "-o", str(out), url])
    if r.returncode != 0 or not Path(out).exists():
        raise SystemExit(f"[matte] download failed: {url}")


def resolve_model(name):
    if name not in MODELS:
        raise SystemExit(f"[matte] unknown --model {name!r}; choose from {', '.join(MODELS)}")
    spec = MODELS[name]
    if spec["vendored"]:
        p = MODELS_DIR / spec["file"]
        if not p.exists():
            raise SystemExit(f"[matte] vendored model missing: {p}")
        return p, spec["family"]
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    p = CACHE_DIR / spec["file"]
    if not p.exists():
        url = (GH_PROXY.rstrip("/") + "/" + RELEASE + "/" + spec["file"]) if GH_PROXY else (RELEASE + "/" + spec["file"])
        print(f"[matte] fetching {name} -> {p}")
        _curl(url, p)
    return p, spec["family"]


def load_image(src):
    if src.startswith(("http://", "https://")):
        fd, tmp = tempfile.mkstemp(prefix="ifmatte_", suffix=".img")
        os.close(fd)
        _curl(src, tmp, timeout=90)
        return Path(tmp), True
    p = Path(src)
    if not p.exists():
        raise SystemExit(f"[matte] input not found: {src}")
    return p, False


def run(src, out, model="u2netp", trim=True, feather=1.0):
    import numpy as np
    import onnxruntime as ort
    from PIL import Image, ImageFilter

    mpath, family = resolve_model(model)
    fam = FAMILY[family]
    size = fam["size"]

    inp, is_tmp = load_image(src)
    try:
        img = Image.open(inp).convert("RGB")
    finally:
        if is_tmp:
            try: Path(inp).unlink()
            except OSError: pass
    w, h = img.size

    arr = np.asarray(img.resize((size, size), Image.LANCZOS)).astype("float32") / 255.0
    for c in range(3):
        arr[:, :, c] = (arr[:, :, c] - fam["mean"][c]) / fam["std"][c]
    arr = arr.transpose(2, 0, 1)[None, ...].astype("float32")

    sess = ort.InferenceSession(str(mpath), providers=["CPUExecutionProvider"])
    pred = sess.run(None, {sess.get_inputs()[0].name: arr})[0][0, 0]
    lo, hi = float(pred.min()), float(pred.max())
    pred = (pred - lo) / (hi - lo + 1e-8)

    mask = Image.fromarray((pred * 255).astype("uint8")).resize((w, h), Image.LANCZOS)
    if feather > 0:
        mask = mask.filter(ImageFilter.GaussianBlur(feather))

    res = img.convert("RGBA")
    res.putalpha(mask)

    if trim:
        box = mask.point(lambda p: 255 if p > 12 else 0).getbbox()
        if box:
            pad = int(0.03 * max(w, h))
            res = res.crop((max(0, box[0] - pad), max(0, box[1] - pad),
                            min(w, box[2] + pad), min(h, box[3] + pad)))

    Path(out).parent.mkdir(parents=True, exist_ok=True)
    res.save(out)

    fg = float((np.asarray(res.split()[-1]) > 128).mean()) * 100
    print(f"[matte] model={model} family={family} -> {out}")
    print(f"[matte] out={res.size} foreground={fg:.1f}%  (healthy cutout ≈ 10–85%)")
    if fg < 2 or fg > 97:
        print("[matte] WARNING: foreground ratio looks degenerate; try --model isnet-general-use "
              "or a cleaner source photo.")
    return fg


if __name__ == "__main__":
    ap = argparse.ArgumentParser(prog="image-forge-matte",
                                 description="Offline ONNX background removal → transparent PNG.")
    ap.add_argument("input", help="source image: http(s) URL or local path")
    ap.add_argument("output", help="output PNG path, e.g. ui/<page>/assets/x.png")
    ap.add_argument("--model", default="u2netp", help="u2netp (default) | u2net | isnet-general-use")
    ap.add_argument("--no-trim", action="store_true", help="keep full frame (don't crop to subject)")
    ap.add_argument("--feather", type=float, default=1.0, help="edge feather radius in px (default 1.0)")
    a = ap.parse_args()
    run(a.input, a.output, model=a.model, trim=not a.no_trim, feather=a.feather)
