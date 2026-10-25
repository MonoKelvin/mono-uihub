"""Canonical paths for the tool.

Layout:
    <repo>/tools/resource-getter/lib/paths.py
    TOOL_ROOT = <repo>/tools/resource-getter
    REPO_ROOT = <repo>
"""

from __future__ import annotations

from pathlib import Path

TOOL_ROOT = Path(__file__).resolve().parents[1]
REPO_ROOT = TOOL_ROOT.parents[1]
UI_ROOT = REPO_ROOT / "ui"
CACHE_DIR = TOOL_ROOT / ".cache"


def page_assets(page: str) -> Path:
    """Return ``ui/<page>/assets`` for a prototype folder name."""
    return UI_ROOT / page / "assets"
