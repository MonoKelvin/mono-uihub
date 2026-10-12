#!/usr/bin/env python3
"""Image Forge — generate transparent PNG icons / assets via an LLM image API.

Every prompt is **automatically purified** before it is sent: the clean-image
word packs in `skills/image-purify/purify.json` (universal base + the style pack
you pick + a transparent-cutout pack when alpha is requested) are appended to
your prompt. That is what keeps output free of noise, fish-scale micro-texture,
debris and the usual "AI look". You only write the subject.

Reads config from environment variables (or a .env file in the project root):

  IMAGE_API_BASE_URL   OpenAI-compatible base URL (e.g. https://api.openai.com/v1)
  IMAGE_API_KEY        API key (bearer token)
  IMAGE_MODEL          Model id, e.g. gpt-image-2  or  grok-imagine-2
  IMAGE_NEGATIVE_PARAM set to 1 if the gateway accepts a `negative_prompt` field
                       (default: negatives are folded into the prompt text)

Usage:
  python tools/image-forge/generate.py --style lineicon \
      "a sci-fi HUD line icon, single cyan stroke" ui/<page>/assets/icon-hud.png

  python tools/image-forge/generate.py --list-styles
  python tools/image-forge/generate.py --style anime --dry-run "..." out.png
  python tools/image-forge/generate.py "logo" out/logo.png --no-transparent
"""

import argparse
import base64
import json
import os
import subprocess
import sys
import time
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parents[1]

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
# purify packs — the "keep it clean" prompt overlay (skills/image-purify/)
# --------------------------------------------------------------------------- #

PACK_PATH = REPO_ROOT / "skills" / "image-purify" / "purify.json"

# Used only if the pack file is missing (e.g. the script was copied elsewhere).
# Deliberately the bare minimum; the real vocabulary lives in purify.json.
_FALLBACK_PACK = {
    "base": {
        "positive": [
            "clean professional image",
            "one clear subject, uncluttered composition",
            "smooth even surfaces with continuous gradients",
            "restrained controlled detail",
            "soft even lighting",
            "noise-free clean rendering",
            "high clarity without over-sharpening",
        ],
        "negative": [
            "noise", "grain", "speckles", "scale-like texture",
            "fish-scale pattern", "crunchy high-frequency detail",
            "over-sharpening", "dirty smudges", "fragmented debris",
            "cluttered background", "garbled text", "watermark",
            "plastic waxy surface",
        ],
    },
    "styles": {"general": {"label": "通用 / 风格未定", "positive": [], "negative": []}},
    "extras": {},
}


def load_pack() -> dict:
    path = Path(cfg("PURIFY_PACK") or PACK_PATH)
    if not path.exists():
        sys.stderr.write(
            f"[warn] purify pack not found at {path} — falling back to the "
            f"built-in minimal base pack.\n"
        )
        return _FALLBACK_PACK
    return json.loads(path.read_text(encoding="utf-8"))


def resolve_style(pack: dict, name: str) -> tuple[str, dict]:
    """Map a style key or alias to its pack entry. Unknown names fail loudly."""
    styles = pack.get("styles", {})
    key = (name or "general").strip().lower()
    if key in styles:
        return key, styles[key]
    for real_key, entry in styles.items():
        if key in [a.lower() for a in entry.get("aliases", [])]:
            return real_key, entry
    available = ", ".join(sorted(styles))
    sys.stderr.write(f"Unknown --style {name!r}. Available: {available}\n")
    raise SystemExit(2)


def _dedupe(terms: list[str]) -> list[str]:
    seen, out = set(), []
    for term in terms:
        key = term.strip().lower()
        if key and key not in seen:
            seen.add(key)
            out.append(term.strip())
    return out


def purify(subject: str, pack: dict, style_key: str,
           transparent: bool) -> tuple[str, list[str]]:
    """Append the clean-image packs to `subject`.

    Order is fixed: subject → style pack → universal base → avoid list.
    Returns (final prompt, negative terms) — negatives are also folded into the
    prompt text as an `Avoid:` sentence, since plain /images/generations has no
    negative-prompt field.
    """
    _, style = resolve_style(pack, style_key)
    base = pack.get("base", {})
    extra = pack.get("extras", {}).get("transparent", {}) if transparent else {}

    positives = [
        ", ".join(style.get("positive", [])),
        ", ".join(extra.get("positive", [])),
        ", ".join(base.get("positive", [])),
    ]
    negatives = _dedupe(
        list(base.get("negative", []))
        + list(style.get("negative", []))
        + list(extra.get("negative", []))
    )

    chunks = [c.strip().rstrip(" .,;") for c in [subject, *positives] if c.strip()]
    prompt = ". ".join(chunks) + "."
    if negatives:
        prompt += " Avoid: " + ", ".join(negatives) + "."
    return prompt, negatives


# --------------------------------------------------------------------------- #
# HTTP helpers (curl-backed so it works even when Python's ssl is broken)
# --------------------------------------------------------------------------- #

def _curl_json(url: str, payload: dict, token: str, timeout: int = 180) -> dict:
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
                  transparent: bool, negatives: list[str] | None = None) -> bytes:
    endpoint = base_url.rstrip("/") + "/images/generations"
    payload = {"model": model, "prompt": prompt, "n": 1}

    # Only gateways that advertise it get a real negative_prompt field;
    # everywhere else the Avoid: sentence inside the prompt does the work.
    if negatives and cfg("IMAGE_NEGATIVE_PARAM").lower() in ("1", "true", "yes"):
        payload["negative_prompt"] = ", ".join(negatives)

    # Try for transparency first (OpenAI-style param), fall back silently.
    if transparent:
        payload["transparent"] = True  # gpt-image family

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


def generate(subject: str, out_path: Path, transparent: bool = True,
             style: str = "general", apply_purify: bool = True,
             dry_run: bool = False) -> None:
    pack = load_pack()
    if apply_purify:
        style_key, style_entry = resolve_style(pack, style)
        prompt, negatives = purify(subject, pack, style_key, transparent)
        extras = " +transparent-cutout" if transparent else ""
        print(f"[purify] style={style_key} ({style_entry.get('label', '')}){extras}"
              f", {len(negatives)} avoid terms")
        if style_key == "general":
            sys.stderr.write(
                "[hint] no --style given: only the universal base pack was "
                "applied. Pass --style (see --list-styles) so style-specific "
                "dirt (line noise, render fireflies, grunge…) is suppressed too.\n"
            )
    else:
        prompt, negatives = subject, []
        sys.stderr.write(
            "[warn] --no-purify: sending the raw prompt. For A/B tests only — "
            "do not ship assets generated this way.\n"
        )

    if dry_run:
        print("\n--- final prompt ---")
        print(prompt)
        print(f"--- {len(prompt)} chars, nothing sent (--dry-run) ---")
        return

    base_url = cfg("IMAGE_API_BASE_URL")
    token = cfg("IMAGE_API_KEY")
    model = cfg("IMAGE_MODEL")

    if not (base_url and token and model):
        sys.stderr.write(
            "Missing config. Set IMAGE_API_BASE_URL, IMAGE_API_KEY, "
            "IMAGE_MODEL (via env or a .env file in the repo root).\n"
        )
        raise SystemExit(2)

    # transparency strategy: ask for alpha, then degrade to opaque so a model
    # that rejects the param still produces a usable asset.
    attempts = (True, False) if transparent else (False,)

    last_err: Exception | None = None
    for transparency_wanted in attempts:
        try:
            raw = _try_generate(base_url, token, model, prompt,
                                transparent=transparency_wanted,
                                negatives=negatives)
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

def _print_styles(pack: dict) -> None:
    print("Available --style packs (pick exactly one):\n")
    for key, entry in pack.get("styles", {}).items():
        aliases = entry.get("aliases", [])
        alias_txt = f"  (aliases: {', '.join(aliases)})" if aliases else ""
        print(f"  {key:<14}{entry.get('label', '')}{alias_txt}")
    print("\nDocs: skills/image-purify/SKILL.md")


if __name__ == "__main__":
    # Chinese pack labels must not die on a legacy console codepage.
    for _stream in (sys.stdout, sys.stderr):
        try:
            _stream.reconfigure(encoding="utf-8", errors="replace")
        except Exception:  # noqa: BLE001
            pass

    # Look for .env in repo root first, then alongside this script.
    for _candidate in (REPO_ROOT / ".env", SCRIPT_DIR / ".env", SCRIPT_DIR / ".env.local"):
        _load_env_file(_candidate)

    parser = argparse.ArgumentParser(
        prog="image-forge",
        description="Generate a (transparent) PNG asset. Clean-image prompt "
                    "packs from skills/image-purify are applied automatically.",
    )
    parser.add_argument("prompt", nargs="?", help="subject only — no quality or "
                                                  "'detailed' words, they are added for you")
    parser.add_argument("output", nargs="?", help="output path, e.g. ui/<page>/assets/icon.png")
    parser.add_argument("--style", default="general",
                        help="clean-image style pack; see --list-styles")
    parser.add_argument("--no-transparent", action="store_true",
                        help="skip the alpha request (and the cutout pack)")
    parser.add_argument("--no-purify", action="store_true",
                        help="send the raw prompt — A/B tests only")
    parser.add_argument("--dry-run", action="store_true",
                        help="print the assembled prompt without calling the API")
    parser.add_argument("--list-styles", action="store_true",
                        help="list the available style packs and exit")
    args = parser.parse_args()

    if args.list_styles:
        _print_styles(load_pack())
        raise SystemExit(0)

    if not args.prompt or not args.output:
        parser.error("both a prompt and an output path are required")

    generate(args.prompt, Path(args.output),
             transparent=not args.no_transparent,
             style=args.style,
             apply_purify=not args.no_purify,
             dry_run=args.dry_run)
