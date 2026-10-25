"""placehold.co — https://placehold.co

Kind: pure URL builder. No key.

    https://placehold.co/600x400
    https://placehold.co/600x400/EEE/31343C?text=Hello
    https://placehold.co/600x400.png

License: free placeholder service.
"""

from __future__ import annotations

from typing import Any

from lib import http
from lib.models import Asset

NAME = "placehold"
TITLE = "placehold.co"
KIND = "url"
HOME = "https://placehold.co/"
PING_URL = "https://placehold.co/600x400"
LICENSE = "placehold.co (free placeholder)"
ATTRIBUTION = "placehold.co"
COMMERCIAL = True
REQUIRES_ENV = ()
TRANSPARENT = "否"
NOTE = "纯色占位图；URL 拼接"

BASE = "https://placehold.co"


def build(
    width: int = 600,
    height: int = 400,
    text: str | None = None,
    bg: str | None = None,
    fg: str | None = None,
    fmt: str = "svg",
    font: str | None = None,
    **_: Any,
) -> Asset:
    width = max(1, int(width or 600))
    height = max(1, int(height or 400))
    fmt = (fmt or "svg").lower()
    path = f"/{width}x{height}"
    if bg or fg:
        path += f"/{(bg or 'eee').lstrip('#')}/{(fg or '31343c').lstrip('#')}"
    if fmt != "svg":
        path += f".{fmt}"
    url = http.build_url(BASE + path, {"text": text, "font": font})
    return Asset(
        source=NAME,
        id=f"{width}x{height}",
        title=text or f"placehold-{width}x{height}",
        url=url,
        page=BASE + "/",
        width=width,
        height=height,
        fmt=fmt,
        transparent=False,
        license=LICENSE,
        attribution=ATTRIBUTION,
        commercial=COMMERCIAL,
        meta={"referer": BASE + "/"},
    )


def resolve(asset: Asset, **_: Any) -> str:
    return asset.url


def from_url(url: str) -> Asset:
    return Asset(
        source=NAME,
        id=url.rsplit("/", 1)[-1],
        title="placehold",
        url=url,
        fmt="png" if ".png" in url.lower() else "svg",
        license=LICENSE,
        attribution=ATTRIBUTION,
        commercial=COMMERCIAL,
    )
