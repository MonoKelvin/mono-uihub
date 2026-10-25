"""DiceBear — https://www.dicebear.com

Kind: URL builder over the public HTTP API. No key. Returns SVG.

    https://api.dicebear.com/9.x/<style>/svg?seed=<seed>&backgroundColor=transparent

``backgroundColor=transparent`` is mandatory for the cut-out look; without it
DiceBear paints a solid circle/square behind the avatar.

Verified styles: shapes, notionists, adventurer, lorelei, micah, glass, rings,
identicon, thumbs, bottts, avataaars, fun-emoji, pixel-art.

License: the generator code is MIT; each avatar style carries its own license
(mostly CC0 1.0 or CC BY 4.0). Check the style page when shipping commercially.
"""

from __future__ import annotations

import urllib.parse
from typing import Any

from lib import http
from lib.models import Asset

NAME = "dicebear"
TITLE = "DiceBear"
KIND = "url"
HOME = "https://www.dicebear.com/"
PING_URL = "https://api.dicebear.com/9.x/shapes/svg?seed=mono"
LICENSE = "DiceBear (per-style CC0 / CC BY)"
ATTRIBUTION = "DiceBear"
COMMERCIAL = None
REQUIRES_ENV = ()
TRANSPARENT = "是（SVG）"
NOTE = "头像与抽象插画；seed 可复现；透明底"

BASE = "https://api.dicebear.com/9.x"
STYLES = (
    "shapes",
    "notionists",
    "adventurer",
    "lorelei",
    "micah",
    "glass",
    "rings",
    "identicon",
    "thumbs",
    "bottts",
    "avataaars",
    "fun-emoji",
    "pixel-art",
)


def build(
    style: str = "shapes",
    seed: str = "mono",
    size: int | None = None,
    transparent: bool = True,
    background: str | None = None,
    radius: int | None = None,
    **_: Any,
) -> Asset:
    style = (style or "shapes").lower()
    style = style if style in STYLES else "shapes"
    params: dict[str, Any] = {"seed": seed}
    if transparent:
        params["backgroundColor"] = "transparent"
    elif background:
        params["backgroundColor"] = background.lstrip("#")
    if size:
        params["size"] = max(16, min(1024, int(size)))
    if radius is not None:
        params["radius"] = max(0, min(50, int(radius)))
    url = http.build_url(f"{BASE}/{style}/svg", params)
    return Asset(
        source=NAME,
        id=f"{style}-{seed}",
        title=f"{style}-{seed}",
        url=url,
        page=HOME,
        width=int(size or 0),
        height=int(size or 0),
        fmt="svg",
        transparent=transparent,
        license=LICENSE,
        attribution=ATTRIBUTION,
        commercial=COMMERCIAL,
        tags=[style],
        meta={"referer": HOME},
    )


def resolve(asset: Asset, **_: Any) -> str:
    return asset.url


def from_url(url: str) -> Asset:
    parts = urllib.parse.urlsplit(url)
    segs = [seg for seg in parts.path.split("/") if seg]
    style = segs[1] if len(segs) > 1 else "shapes"
    query = urllib.parse.parse_qs(parts.query)
    seed = (query.get("seed") or ["mono"])[0]
    return Asset(
        source=NAME,
        id=f"{style}-{seed}",
        title=f"{style}-{seed}",
        url=url,
        fmt="svg",
        transparent="transparent" in parts.query,
        license=LICENSE,
        attribution=ATTRIBUTION,
        commercial=COMMERCIAL,
        meta={"referer": HOME},
    )
