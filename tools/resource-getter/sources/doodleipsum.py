"""Doodle Ipsum — https://doodleipsum.com

Kind: pure URL builder (no API, no key). Output: PNG with alpha.

Format (per the site's own docs):
    https://doodleipsum.com/[width]x[height]/[style]
    https://doodleipsum.com/x500                 # height only
    https://doodleipsum.com/500                  # width only
    ?bg=transparent                              # alpha background

A bare URL returns a random illustration on every load. ``resolve`` follows the
one-time redirect and caches the resulting ``?i=<imageId>`` URL, so hot-linking
is stable and reproducible.

Styles: random / flat / hand-drawn / outline / abstract / avatar / avatar-2..5.

License: Blush License — free for commercial and non-commercial use, no credit
required; do not resell or redistribute the illustrations themselves.
"""

from __future__ import annotations

import urllib.parse
from typing import Any

from lib import http
from lib.cache import JsonCache
from lib.models import Asset

NAME = "doodleipsum"
TITLE = "Doodle Ipsum"
KIND = "url"
HOME = "https://doodleipsum.com/"
PING_URL = "https://doodleipsum.com/700x1244/avatar?bg=transparent"
LICENSE = "Blush License (free commercial, no attribution)"
ATTRIBUTION = "Blush / Doodle Ipsum"
COMMERCIAL = True
REQUIRES_ENV = ()
TRANSPARENT = "是（bg=transparent）"
NOTE = "占位插画；纯 URL；支持透明底"

BASE = "https://doodleipsum.com"
STYLES = (
    "random",
    "flat",
    "hand-drawn",
    "outline",
    "abstract",
    "avatar",
    "avatar-2",
    "avatar-3",
    "avatar-4",
    "avatar-5",
)
_cache = JsonCache("doodle.json", ttl=7 * 24 * 3600)


def build(
    width: int = 700,
    height: int = 1000,
    style: str = "random",
    transparent: bool = True,
    bg: str | None = None,
    **_: Any,
) -> Asset:
    width = 700 if width is None else int(width)
    height = 1000 if height is None else int(height)
    width = max(0, width)
    height = max(0, height)
    if width and height:
        dims = f"{width}x{height}"
    elif width:
        dims = str(width)
    elif height:
        dims = f"x{height}"
    else:
        dims = "700x1000"
    style = (style or "random").lower()
    style = style if style in STYLES else "random"
    path = f"{BASE}/{dims}" + (f"/{style}" if style != "random" else "")
    query: dict[str, str] = {}
    if transparent:
        query["bg"] = "transparent"
    elif bg:
        query["bg"] = bg
    url = http.build_url(path, query)
    return Asset(
        source=NAME,
        id=f"{dims}-{style}",
        title=f"doodle-{style}-{dims}",
        url=url,
        page=BASE + "/",
        width=width,
        height=height,
        fmt="png",
        transparent=transparent,
        license=LICENSE,
        attribution=ATTRIBUTION,
        commercial=COMMERCIAL,
        tags=[style],
        meta={"static": False, "referer": BASE + "/"},
    )


def resolve(asset: Asset, **_: Any) -> str:
    """Follow the redirect once and return the cached static ``?i=`` URL."""
    cached = _cache.get(asset.url)
    if cached:
        return cached
    try:
        resp = http.request(asset.url, max_bytes=1, timeout=20, retries=1)
    except http.HttpError:
        return asset.url
    final = resp.url
    if "i=" in urllib.parse.urlsplit(final).query:
        _cache.set(asset.url, final)
        asset.meta["static"] = True
        return final
    return asset.url


def from_url(url: str) -> Asset:
    parts = urllib.parse.urlsplit(url)
    segs = [seg for seg in parts.path.split("/") if seg]
    dims = segs[0] if segs else "700x1000"
    style = segs[1] if len(segs) > 1 else "random"
    return Asset(
        source=NAME,
        id=f"{dims}-{style}",
        title=f"doodle-{style}-{dims}",
        url=url,
        page=BASE + "/",
        fmt="png",
        transparent="bg=transparent" in parts.query,
        license=LICENSE,
        attribution=ATTRIBUTION,
        commercial=COMMERCIAL,
        meta={"static": "i=" in parts.query, "referer": BASE + "/"},
    )
