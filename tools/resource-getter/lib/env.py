"""Tiny .env loader (no python-dotenv dependency).

Lookup order — later files win, but an already-exported environment variable
always wins over every file:

1. ``<repo>/.env``
2. ``tools/resource-getter/.env``
3. ``tools/resource-getter/.env.local``

The real files are gitignored. Never print secret values; ``mask()`` is provided
for diagnostics.
"""

from __future__ import annotations

import os
from pathlib import Path

from .paths import REPO_ROOT, TOOL_ROOT

_FILES = (
    REPO_ROOT / ".env",
    TOOL_ROOT / ".env",
    TOOL_ROOT / ".env.local",
)
_LOADED = False


def _parse(path: Path) -> dict[str, str]:
    out: dict[str, str] = {}
    try:
        raw = path.read_text(encoding="utf-8-sig")
    except OSError:
        return out
    for line in raw.splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if line.startswith("export "):
            line = line[7:].lstrip()
        if "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip()
        if not key:
            continue
        if len(value) >= 2 and value[0] == value[-1] and value[0] in ("'", '"'):
            value = value[1:-1]
        out[key] = value
    return out


def load() -> None:
    """Populate ``os.environ`` once. Safe to call repeatedly."""
    global _LOADED
    if _LOADED:
        return
    merged: dict[str, str] = {}
    for path in _FILES:
        merged.update(_parse(path))
    for key, value in merged.items():
        os.environ.setdefault(key, value)
    _LOADED = True


def get(key: str, default: str | None = None) -> str | None:
    load()
    value = os.environ.get(key)
    if value is None or value == "":
        return default
    return value


def require(key: str, hint: str = "") -> str:
    value = get(key)
    if not value:
        suffix = f" {hint}" if hint else ""
        raise MissingEnv(f"缺少环境变量 {key}。{suffix}".strip())
    return value

def mask(value: str | None) -> str:
    if not value:
        return "(未设置)"
    if len(value) <= 8:
        return value[:2] + "…"
    return f"{value[:4]}…{value[-4:]}"


class MissingEnv(RuntimeError):
    """Raised when a provider needs a credential that is not configured."""
