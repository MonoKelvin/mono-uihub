#!/usr/bin/env python3
"""Image Forge — generate transparent PNG icons / assets via an LLM image API.

Reads config from environment variables (or a .env file in the project root):

  IMAGE_API_BASE_URL   OpenAI-compatible base URL (e.g. https://api.openai.com/v1)
  IMAGE_API_KEY        API key (bearer token)
  IMAGE_MODEL          Model id, e.g. gpt-image-2  or  grok-imagine-2

Usage:
  python tools/image-forge/generate.py "a sci-fi HUD line icon, transparent background" out/ui/icon-hud.png
  python tools/image-forge/generate.py "logo" out/ui/logo.png --no-transparent   # opaque OK
"""

import base64
import json
import os
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

# --------------------------------------------------------------------------- #
# env loader (no third-party deps — we parse the few lines we need ourselves)
# --------------------------------------------------------------------------- #

def _load_env_file(dotenv: Path) -> None:
    if not dotenv.exists():
        return
    for line in dotenv.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, val = line.split("=", 1)
        key = key.strip()
        val = val.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = val


def cfg(key: str, default: str = "") -> str:
    return os.environ.get(key, default).strip()


# --------------------------------------------------------------------------- #
# HTTP helpers (curl-backed so it works even when Python's ssl is broken)
# --------------------------------------------------------------------------- #

def _curl_json(url: str, payload: dict, token: str,
               timeout: int = 180, extra_form: dict | None = None) -> dict:
    """POST JSON via curl, return parsed JSON response."""
    args = ["curl", "-sS", "-X", "POST", url,
            "-H", "Content-Type: application/json",
            "-H", f"Authorization: Bearer {token}",
            "-d", json.dumps(payload),
            "--max-time", str(timeout)]
    proc = subprocess.run(args, capture_output=True, text=True, check=False)
    if proc.returncode != 0:
        raise RuntimeError(f"curl exit {proc.returncode}: {proc.stderr.strip()}")
    return json.loads(proc.stdout)


def _curl_bytes(url: str, token: str, timeout: int = 120) -> bytes:
    """GET bytes via curl."""
    args = ["curl", "-sS", url, "--max-time", str(timeout)]
    if token:
        args += ["-H", f"Authorization: Bearer {token}"]
    proc = subprocess.run(args, capture_output=True, check=False)
    if proc.returncode != 0:
        raise RuntimeError(f"curl exit {proc.returncode}: {proc.stderr.strip()}")
    return proc.stdout


# --------------------------------------------------------------------------- #
# core: one generation attempt, returns raw PNG bytes
# --------------------------------------------------------------------------- #

def _try_generate(base_url: str, token: str, model: str, prompt: str,
                  transparent: bool) -> bytes:
    endpoint = base_url.rstrip("/") + "/images/generations"
    payload = {"model": model, "prompt": prompt, "n": 1}

    # Try for transparency first (OpenAI-style param), fall back silently.
    if transparent:
        payload["transparent"] = True  # gpt-image family
    elif "grok" in model.lower():
        payload["transparent"] = True  # some grok gateways accept it too

    result = _curl_json(endpoint, payload, token)
    # OpenAI returns b64; some gateways return url.
    if "data" not in result or not result["data"]:
        raise RuntimeError(f"No image data in response: {result}")

    entry = result["data"][0]
    if "b64_json" in entry and entry["b64_json"]:
        return base64.b64decode(entry["b64_json"])

    if "url" in entry and entry["url"]:
        url = entry["url"]
        try:
            time.sleep(1)  # give the gateway a moment to finish
            return _curl_bytes(url, token)
        except Exception:  # noqa: BLE001
            # URL might be signed but expired — one retry
            time.sleep(2)
            return _curl_bytes(url, token)

    raise RuntimeError(f"Unexpected response shape: {result}")


def generate(prompt: str, out_path: Path, transparent: bool = True,
             attempts: tuple = (True, False)) -> None:
    base_url = cfg("IMAGE_API_BASE_URL")
    token = cfg("IMAGE_API_KEY")
    model = cfg("IMAGE_MODEL")

    if not (base_url and token and model):
        sys.stderr.write(
            "Missing config. Set IMAGE_API_BASE_URL, IMAGE_API_KEY, "
            "IMAGE_MODEL (via env or a .env file in the repo root).\n"
        )
        raise SystemExit(2)

    last_err: Exception | None = None
    for transparency_wanted in attempts:
        try:
            raw = _try_generate(base_url, token, model, prompt,
                                transparent=transparency_wanted)
            out_path.parent.mkdir(parents=True, exist_ok=True)

            # Detect actual format from magic bytes and warn if transparency lost.
            fmt = "png" if raw[:8] == b"\x89PNG\r\n\x1a\n" else "jpeg"
            has_alpha = fmt == "png"
            if transparent and transparency_wanted and not has_alpha:
                sys.stderr.write(
                    f"[warn] transparent requested but model "
                    f"{model!r} returned JPEG (no alpha channel). "
                    f"Use a model that supports alpha (e.g. gpt-image-2).\n"
                )

            suffix = ".png" if fmt == "png" else ".jpg"
            honest = out_path.with_suffix(suffix)
            honest.write_bytes(raw)
            tag = "transparent" if transparency_wanted and has_alpha else \
                  "opaque" if fmt == "png" else "jpeg-opaque"
            print(f"[ok] saved ({tag}, {fmt}) -> {honest}")
            return
        except Exception as exc:  # noqa: BLE001
            last_err = exc
            # degrade: retry next attempt (transparency → opaque → done)
            continue

    sys.stderr.write(f"Generation failed after retries: {last_err}\n")
    raise SystemExit(1)


# --------------------------------------------------------------------------- #
# CLI
# --------------------------------------------------------------------------- #

if __name__ == "__main__":
    if len(sys.argv) < 3:
        sys.stderr.write(__doc__)
        raise SystemExit(2)

    _prompt = sys.argv[1]
    _out = Path(sys.argv[2])
    _transparent = "--no-transparent" not in sys.argv

    # Look for .env in repo root first, then alongside this script.
    _script_dir = Path(__file__).resolve().parent
    _repo_root = _script_dir.parents[1]
    for _candidate in (_repo_root / ".env", _script_dir / ".env", _script_dir / ".env.local"):
        _load_env_file(_candidate)

    generate(_prompt, _out, transparent=_transparent)
