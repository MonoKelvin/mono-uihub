#!/usr/bin/env python3
"""Image Forge · matte — online image editing with a high-quality offline fallback.

Default pipeline:
  1. Edit the source with an OpenAI-compatible image-to-image model (Agnes Image
     2.5 Flash supported) and require a real alpha channel in the response.
  2. Accept the model's RGBA result by default (minor deviations are allowed).
     Optionally preserve source RGB exactly with --preserve-source-colors.
  3. If the online API is unavailable or returns an opaque/invalid result, run a
     local ONNX model. BiRefNet is the default for detailed, soft hair edges.

Offline extra deps: onnxruntime, Pillow, numpy, opencv-python.
Large models are downloaded once into models/cache/ (gitignored).

Usage:
  python tools/image-forge/matte.py in.jpg out.png --subject "woman with fine hair"
  python tools/image-forge/matte.py in.jpg out.png --offline-only
  python tools/image-forge/matte.py in.jpg out.png --model birefnet-portrait
  python tools/image-forge/matte.py in.jpg out.png --dry-run --subject "red car"
"""

from __future__ import annotations

import argparse
import base64
import hashlib
import io
import os
import subprocess
import sys
import tempfile
from pathlib import Path

from generate import _curl_bytes, _curl_json, _load_env_file, cfg

SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parents[1]
MODELS_DIR = SCRIPT_DIR / "models"
CACHE_DIR = MODELS_DIR / "cache"
RELEASE = "https://github.com/danielgatis/rembg/releases/download/v0.0.0"
_load_env_file(REPO_ROOT / ".env")
GH_PROXY = os.environ.get("IMAGE_FORGE_GH_PROXY", "https://ghfast.top/")

MODELS = {
    "u2netp": {
        "file": "u2netp.onnx", "family": "u2net", "vendored": True,
    },
    "u2net": {
        "file": "u2net.onnx", "family": "u2net", "remote": "u2net.onnx",
    },
    "isnet-general-use": {
        "file": "isnet-general-use.onnx", "family": "isnet",
        "remote": "isnet-general-use.onnx",
    },
    "birefnet-general": {
        "file": "birefnet-general.onnx", "family": "birefnet",
        "remote": "BiRefNet-general-epoch_244.onnx",
        "md5": "7a35a0141cbbc80de11d9c9a28f52697",
    },
    "birefnet-portrait": {
        "file": "birefnet-portrait.onnx", "family": "birefnet",
        "remote": "BiRefNet-portrait-epoch_150.onnx",
        "md5": "c3a64a6abf20250d090cd055f12a3b67",
    },
}
FAMILY = {
    "u2net": {"size": 320, "mean": (0.485, 0.456, 0.406), "std": (0.229, 0.224, 0.225)},
    "isnet": {"size": 1024, "mean": (0.5, 0.5, 0.5), "std": (1.0, 1.0, 1.0)},
    "birefnet": {"size": 1024, "mean": (0.485, 0.456, 0.406), "std": (0.229, 0.224, 0.225)},
}
PORTRAIT_HINTS = (
    "person", "people", "portrait", "human", "woman", "man", "girl", "boy",
    "face", "hair", "headshot", "人", "人物", "人像", "肖像", "女", "男", "儿童", "发丝", "头发",
)
RATIOS = ("1:1", "3:4", "4:3", "16:9", "9:16", "2:3", "3:2", "21:9")

MATTE_PROMPT = """Remove only the background from the input image and return a transparent PNG with a true alpha channel.
Keep every foreground subject pixel exactly unchanged: preserve the original colors, texture, lighting, facial features, shape, scale, position and composition.
Precisely retain fine hair strands, fur, transparent or semi-transparent details and natural soft alpha edges. Do not cut into the subject or leave background halos.
Do not beautify, redraw, restyle, sharpen, relight, recolor, crop, rotate, resize, add or remove anything in the foreground.
Do not add shadows, outlines, checkerboards, backgrounds, text or watermarks. Output only the isolated foreground on transparency."""


def build_prompt(subject: str = "") -> str:
    """Build the conservative online edit instruction; never add style terms."""
    if not subject.strip():
        return MATTE_PROMPT
    return (
        f"The foreground subject(s) to extract: {subject.strip()}. "
        "Treat everything else as background.\n" + MATTE_PROMPT
    )


def _curl(url: str, out: str | Path, timeout: int = 600) -> None:
    target = Path(out)
    partial = target.with_name(target.name + ".part")
    proc = subprocess.run(
        ["curl", "-L", "--fail", "--max-time", str(timeout), "--retry", "2", "-o", str(partial), url],
        check=False,
    )
    if proc.returncode != 0 or not partial.exists():
        partial.unlink(missing_ok=True)
        raise RuntimeError(f"download failed: {url}")
    os.replace(partial, target)


def _file_md5(path: Path) -> str:
    digest = hashlib.md5()  # noqa: S324 - model integrity, not security
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(8 * 1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def choose_offline_model(requested: str = "auto", subject: str = "") -> str:
    if requested != "auto":
        return requested
    hint = subject.casefold()
    return "birefnet-portrait" if any(word in hint for word in PORTRAIT_HINTS) else "birefnet-general"


def resolve_model(name: str, subject: str = "") -> tuple[Path, str, str]:
    name = choose_offline_model(name, subject)
    if name not in MODELS:
        raise RuntimeError(f"unknown offline model {name!r}; choose auto or {', '.join(MODELS)}")
    spec = MODELS[name]
    path = MODELS_DIR / spec["file"] if spec.get("vendored") else CACHE_DIR / spec["file"]
    if path.exists():
        if spec.get("md5") and _file_md5(path) != spec["md5"]:
            path.unlink()
        else:
            return path, spec["family"], name
    if spec.get("vendored"):
        raise RuntimeError(f"vendored model missing: {path}")

    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    url = RELEASE + "/" + spec["remote"]
    if GH_PROXY:
        url = GH_PROXY.rstrip("/") + "/" + url
    print(f"[matte] fetching offline model {name} -> {path}")
    _curl(url, path)
    if spec.get("md5"):
        digest = _file_md5(path)
        if digest != spec["md5"]:
            path.unlink(missing_ok=True)
            raise RuntimeError(f"model checksum mismatch for {name}")
    return path, spec["family"], name


def load_image(src: str) -> tuple[Path, bool]:
    if src.startswith(("http://", "https://")):
        fd, tmp = tempfile.mkstemp(prefix="ifmatte_", suffix=".img")
        os.close(fd)
        _curl(src, tmp, timeout=90)
        return Path(tmp), True
    path = Path(src)
    if not path.exists():
        raise RuntimeError(f"input not found: {src}")
    return path, False


def _ratio(width: int, height: int) -> str:
    value = width / max(height, 1)
    return min(RATIOS, key=lambda item: abs(value - int(item.split(":")[0]) / int(item.split(":")[1])))


def _png_data_uri(image) -> str:
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    return "data:image/png;base64," + base64.b64encode(buffer.getvalue()).decode("ascii")


def _response_bytes(result: dict, token: str, timeout: int) -> bytes:
    data = result.get("data")
    if not isinstance(data, list) or not data:
        message = result.get("error", {}).get("message") if isinstance(result.get("error"), dict) else None
        raise RuntimeError(f"online API returned no image{': ' + str(message)[:240] if message else ''}")
    entry = data[0]
    if entry.get("b64_json"):
        try:
            return base64.b64decode(entry["b64_json"], validate=True)
        except (ValueError, TypeError) as exc:
            raise RuntimeError("online API returned invalid Base64 image data") from exc
    if entry.get("url"):
        return _curl_bytes(entry["url"], token, timeout=min(timeout, 120))
    raise RuntimeError("online API response contains neither b64_json nor url")


def online_matte(image, *, subject: str, size: str, model: str, preserve_colors: bool):
    """Return an RGBA image, or raise when the response is not a real cutout."""
    import numpy as np
    from PIL import Image

    base_url = cfg("IMAGE_API_BASE_URL")
    token = cfg("IMAGE_API_KEY")
    if not (base_url and token and model):
        raise RuntimeError("online config missing: IMAGE_API_BASE_URL, IMAGE_API_KEY or image model")
    timeout = int(cfg("IMAGE_MATTE_TIMEOUT", "240"))
    payload = {
        "model": model,
        "prompt": build_prompt(subject),
        "size": size,
        "ratio": _ratio(*image.size),
        "extra_body": {
            "image": [_png_data_uri(image)],
            "response_format": "b64_json",
        },
    }
    result = _curl_json(base_url.rstrip("/") + "/images/generations", payload, token, timeout=timeout)
    candidate = Image.open(io.BytesIO(_response_bytes(result, token, timeout))).convert("RGBA")
    alpha = np.asarray(candidate.getchannel("A"))
    transparent_ratio = float((alpha < 250).mean())
    foreground_ratio = float((alpha > 5).mean())
    if transparent_ratio < 0.001 or foreground_ratio < 0.001:
        raise RuntimeError(
            f"online result has no usable alpha (transparent={transparent_ratio:.3%}, foreground={foreground_ratio:.3%})"
        )
    if not preserve_colors:
        return candidate, transparent_ratio

    source_ratio = image.width / image.height
    result_ratio = candidate.width / candidate.height
    if abs(source_ratio - result_ratio) / source_ratio > 0.03:
        raise RuntimeError(
            f"online result changed aspect ratio ({image.size} -> {candidate.size}); refusing to realign the subject"
        )
    # The model supplies only its matte. Original RGB/alpha-independent pixels
    # are retained exactly, preventing face/color/texture regeneration.
    refined_alpha = candidate.getchannel("A").resize(image.size, Image.Resampling.LANCZOS)
    output = image.copy()
    output.putalpha(refined_alpha)
    return output, transparent_ratio


def _guided_filter(alpha, guide, radius: int, eps: float):
    """Edge-aware smoothing that follows image detail instead of blurring hair."""
    import cv2
    import numpy as np

    if radius <= 0:
        radius = max(2, min(24, round(min(alpha.shape) / 180)))
    source = alpha.astype("float32")
    guide = guide.astype("float32")
    kernel = (radius * 2 + 1, radius * 2 + 1)
    mean_i = cv2.boxFilter(guide, -1, kernel, normalize=True)
    mean_p = cv2.boxFilter(source, -1, kernel, normalize=True)
    corr_i = cv2.boxFilter(guide * guide, -1, kernel, normalize=True)
    corr_ip = cv2.boxFilter(guide * source, -1, kernel, normalize=True)
    var_i = corr_i - mean_i * mean_i
    cov_ip = corr_ip - mean_i * mean_p
    a = cov_ip / (var_i + eps)
    b = mean_p - a * mean_i
    filtered = cv2.boxFilter(a, -1, kernel, normalize=True) * guide + cv2.boxFilter(b, -1, kernel, normalize=True)
    # Retain a floor under faint strand predictions; do not introduce hard cuts.
    faint = (source > 0.01) & (source < 0.2)
    filtered[faint] = np.maximum(filtered[faint], source[faint] * 0.85)
    return np.clip(filtered, 0.0, 1.0)


def _nearest_seed_colors(rgb, seed):
    import cv2
    import numpy as np

    query = np.where(seed, 0, 255).astype("uint8")
    _, labels = cv2.distanceTransformWithLabels(query, cv2.DIST_L2, 3, labelType=cv2.DIST_LABEL_PIXEL)
    lut = np.zeros((int(labels.max()) + 1, 3), dtype="float32")
    seed_labels = labels[seed]
    lut[seed_labels] = rgb[seed]
    return lut[labels]


def _decontaminate(rgb, alpha, strength: float):
    """Remove background color spill from soft edges using the compositing equation."""
    import numpy as np

    if strength <= 0:
        return rgb
    background = alpha <= 0.01
    if not background.any() or not (alpha >= 0.98).any():
        return rgb
    bg = _nearest_seed_colors(rgb, background)
    soft = (alpha > 0.02) & (alpha < 0.98)
    safe_alpha = np.maximum(alpha, 0.08)[..., None]
    estimate = (rgb - (1.0 - alpha[..., None]) * bg) / safe_alpha
    estimate = np.clip(estimate, 0.0, 1.0)
    weight = np.zeros_like(alpha)
    weight[soft] = strength
    return rgb * (1.0 - weight[..., None]) + estimate * weight[..., None]


def offline_matte(image, *, model: str, subject: str, trim: bool, feather: float,
                  guided: bool, guide_radius: int, guide_eps: float, decontaminate: float):
    import numpy as np
    import onnxruntime as ort
    from PIL import Image, ImageFilter

    model_path, family, model = resolve_model(model, subject)
    spec = FAMILY[family]
    size = spec["size"]
    rgb_image = image.convert("RGB")
    width, height = rgb_image.size
    arr = np.asarray(rgb_image.resize((size, size), Image.Resampling.LANCZOS)).astype("float32") / 255.0
    for channel in range(3):
        arr[:, :, channel] = (arr[:, :, channel] - spec["mean"][channel]) / spec["std"][channel]
    arr = arr.transpose(2, 0, 1)[None, ...].astype("float32")
    session = ort.InferenceSession(str(model_path), providers=["CPUExecutionProvider"])
    pred = session.run(None, {session.get_inputs()[0].name: arr})[0][0, 0]
    if family == "birefnet":
        pred = 1.0 / (1.0 + np.exp(-np.clip(pred, -50, 50)))
    pred = (pred - float(pred.min())) / (float(pred.max()) - float(pred.min()) + 1e-8)
    alpha = np.asarray(
        Image.fromarray((pred * 255).astype("uint8")).resize((width, height), Image.Resampling.LANCZOS)
    ).astype("float32") / 255.0
    if guided:
        guide = np.asarray(rgb_image.convert("L")).astype("float32") / 255.0
        alpha = _guided_filter(alpha, guide, guide_radius, guide_eps)
    if feather > 0:
        alpha = np.asarray(
            Image.fromarray((alpha * 255).astype("uint8")).filter(ImageFilter.GaussianBlur(feather))
        ).astype("float32") / 255.0

    rgb = np.asarray(rgb_image).astype("float32") / 255.0
    rgb = _decontaminate(rgb, alpha, decontaminate)
    result = Image.fromarray((np.clip(rgb, 0, 1) * 255).astype("uint8")).convert("RGBA")
    mask = Image.fromarray((alpha * 255).astype("uint8"))
    result.putalpha(mask)
    if trim:
        # A low threshold retains fine strands that a binary/128 threshold loses.
        box = mask.point(lambda value: 255 if value > 3 else 0).getbbox()
        if box:
            pad = int(0.03 * max(width, height))
            result = result.crop((max(0, box[0] - pad), max(0, box[1] - pad),
                                  min(width, box[2] + pad), min(height, box[3] + pad)))
    return result, model


def run(src: str, out: str, *, model: str = "auto", subject: str = "", trim: bool = True,
        feather: float = 0.0, offline_only: bool = False, fallback: bool = True,
        size: str = "2K", preserve_colors: bool = False, guided: bool = True,
        guide_radius: int = 0, guide_eps: float = 0.001, decontaminate: float = 0.65):
    import numpy as np
    from PIL import Image, ImageOps

    inp, is_tmp = load_image(src)
    output = Path(out).with_suffix(".png")
    try:
        with Image.open(inp) as opened:
            image = ImageOps.exif_transpose(opened).convert("RGBA")
        result = None
        online_error = None
        if not offline_only:
            online_model = cfg("IMAGE_MATTE_MODEL") or cfg("IMAGE_MODEL") or "agnes-image-2.5-flash"
            try:
                result, transparent = online_matte(
                    image, subject=subject, size=size, model=online_model,
                    preserve_colors=preserve_colors,
                )
                print(f"[matte] backend=online model={online_model} transparent={transparent:.1%}")
            except Exception as exc:  # noqa: BLE001 - fallback must cover network/model/shape failures
                online_error = exc
                print(f"[matte] online unavailable: {exc}", file=sys.stderr)
                if not fallback:
                    raise
        if result is None:
            if not offline_only and not fallback and online_error:
                raise online_error
            result, used_model = offline_matte(
                image, model=model, subject=subject, trim=trim, feather=feather,
                guided=guided, guide_radius=guide_radius, guide_eps=guide_eps,
                decontaminate=decontaminate,
            )
            print(f"[matte] backend=offline model={used_model}")
        elif not trim:
            pass
        else:
            alpha = result.getchannel("A")
            box = alpha.point(lambda value: 255 if value > 3 else 0).getbbox()
            if box:
                width, height = result.size
                pad = int(0.03 * max(width, height))
                result = result.crop((max(0, box[0] - pad), max(0, box[1] - pad),
                                      min(width, box[2] + pad), min(height, box[3] + pad)))
        output.parent.mkdir(parents=True, exist_ok=True)
        result.save(output, format="PNG")
        foreground = float((np.asarray(result.getchannel("A")) > 5).mean()) * 100
        print(f"[matte] saved={output} size={result.size} foreground={foreground:.1f}%")
        if foreground < 1 or foreground > 99:
            print("[matte] WARNING: foreground ratio looks degenerate; inspect the alpha channel", file=sys.stderr)
        return output
    finally:
        if is_tmp:
            inp.unlink(missing_ok=True)


def main() -> None:
    for stream in (sys.stdout, sys.stderr):
        try:
            stream.reconfigure(encoding="utf-8", errors="replace")
        except Exception:  # noqa: BLE001
            pass
    parser = argparse.ArgumentParser(prog="image-forge-matte", description="Online image-edit matting with offline BiRefNet fallback.")
    parser.add_argument("input", help="source image: http(s) URL or local path")
    parser.add_argument("output", help="output PNG path")
    parser.add_argument("--subject", default="", help="precise foreground description, e.g. 'woman on the left'")
    parser.add_argument("--model", default=cfg("IMAGE_MATTE_OFFLINE_MODEL", "auto"),
                        help="offline model: auto (default), birefnet-general, birefnet-portrait, isnet-general-use, u2net, u2netp")
    parser.add_argument("--size", default=cfg("IMAGE_MATTE_SIZE", "2K"), choices=("1K", "2K", "3K", "4K"))
    parser.add_argument("--offline-only", action="store_true", help="skip the online API")
    parser.add_argument("--no-fallback", action="store_true", help="fail instead of using offline matting")
    parser.add_argument("--preserve-source-colors", action="store_true",
                        help="strict mode: use only the online alpha and keep source RGB exactly unchanged")
    parser.add_argument("--no-trim", action="store_true", help="keep the full frame")
    parser.add_argument("--feather", type=float, default=0.0, help="optional extra blur in px; default 0 preserves hair")
    parser.add_argument("--no-guided-filter", action="store_true", help="disable edge-aware offline refinement")
    parser.add_argument("--guide-radius", type=int, default=0, help="guided filter radius; 0 adapts to image size")
    parser.add_argument("--guide-eps", type=float, default=0.001, help="guided filter regularization, default 0.001")
    parser.add_argument("--decontaminate", type=float, default=0.65, help="edge color cleanup strength 0..1; default 0.65")
    parser.add_argument("--dry-run", action="store_true", help="print the online prompt without reading the image or calling the API")
    args = parser.parse_args()
    if args.dry_run:
        print(build_prompt(args.subject))
        return
    if not 0 <= args.decontaminate <= 1:
        parser.error("--decontaminate must be between 0 and 1")
    run(args.input, args.output, model=args.model, subject=args.subject,
        trim=not args.no_trim, feather=args.feather, offline_only=args.offline_only,
        fallback=not args.no_fallback, size=args.size,
        preserve_colors=args.preserve_source_colors, guided=not args.no_guided_filter,
        guide_radius=args.guide_radius, guide_eps=args.guide_eps,
        decontaminate=args.decontaminate)


if __name__ == "__main__":
    main()
