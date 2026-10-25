"""Pixabay — https://pixabay.com/api/docs/

Kind: official REST API (JSON). Auth: ``PIXABAY_API_KEY``.
Rate limit: 100 requests / 60 s by default; this module throttles to 0.65 s.

``image_type`` accepts ``all`` / ``photo`` / ``illustration`` / ``vector``.
Pixabay's API does not expose its 3D-model library; use the website for those.

Transparency: Pixabay tags many cut-outs with ``transparent`` and serves them as
PNG with alpha. ``--transparent`` first filters that tag, then falls back to a
64-byte remote IHDR check (``lib.http.png_has_alpha``) for the top candidates.

License: Pixabay Content License — free for commercial use, no attribution
required, but you may not redistribute the stand-alone image.
"""

from __future__ import annotations

import re
from typing import Any

from lib import env, http
from lib.models import Asset

NAME = "pixabay"
TITLE = "Pixabay"
KIND = "api"
HOME = "https://pixabay.com/"
PING_URL = "https://pixabay.com/api/docs/"
LICENSE = "Pixabay Content License"
ATTRIBUTION = "Pixabay"
COMMERCIAL = True
REQUIRES_ENV = ("PIXABAY_API_KEY",)
TRANSPARENT = "部分"
NOTE = "照片 / 插画 / 矢量；100 req/min；3D 模型需网页端"

API = "https://pixabay.com/api/"
_VALID_TYPES = {"all", "photo", "illustration", "vector"}
_VALID_ORDERS = {"popular", "latest"}


def _ext(url: str) -> str:
    match = re.search(r"\.([a-zA-Z0-9]{2,5})(?:\?|$)", url or "")
    return match.group(1).lower() if match else ""


def _asset(hit: dict[str, Any]) -> Asset:
    tags = [tag.strip() for tag in (hit.get("tags") or "").split(",") if tag.strip()]
    url = hit.get("largeImageURL") or hit.get("webformatURL") or hit.get("previewURL") or ""
    return Asset(
        source=NAME,
        id=str(hit.get("id", "")),
        title=tags[0] if tags else f"pixabay-{hit.get('id')}",
        url=url,
        page=hit.get("pageURL", ""),
        width=int(hit.get("imageWidth") or 0),
        height=int(hit.get("imageHeight") or 0),
        fmt=_ext(url),
        transparent=True if ("transparent" in (hit.get("tags") or "").lower() or hit.get("_alpha")) else None,
        license=LICENSE,
        attribution=ATTRIBUTION,
        commercial=COMMERCIAL,
        tags=tags,
        meta={
            "type": hit.get("type", ""),
            "preview": hit.get("previewURL", ""),
            "large": hit.get("largeImageURL", ""),
            "full": hit.get("imageURL", ""),
            "user": hit.get("user", ""),
            "user_url": hit.get("userURL", ""),
            "referer": "https://pixabay.com/",
        },
    )


def search(
    query: str,
    *,
    limit: int = 12,
    image_type: str = "all",
    orientation: str | None = None,
    category: str | None = None,
    colors: str | None = None,
    order: str = "popular",
    min_width: int = 0,
    min_height: int = 0,
    safe: bool = True,
    transparent: bool = False,
    **_: Any,
) -> list[Asset]:
    key = env.require(
        "PIXABAY_API_KEY",
        hint="在 tools/resource-getter/.env 中写入 PIXABAY_API_KEY=...",
    )
    image_type = image_type if image_type in _VALID_TYPES else "all"
    per_page = max(3, min(200, limit * (3 if transparent else 1)))
    params: dict[str, Any] = {
        "key": key,
        "q": query,
        "image_type": image_type,
        "orientation": orientation,
        "category": category,
        "colors": colors or ("transparent" if transparent else None),
        "order": order if order in _VALID_ORDERS else "popular",
        "min_width": min_width or None,
        "min_height": min_height or None,
        "safesearch": "true" if safe else "false",
        "page": 1,
        "per_page": per_page,
    }
    data = http.get_json(
        http.build_url(API, params),
        timeout=30,
        throttle=0.65,
    )
    hits: list[dict[str, Any]] = list(data.get("hits") or [])

    if transparent and hits:
        tagged = [h for h in hits if "transparent" in (h.get("tags") or "").lower()]
        if tagged:
            hits = tagged
        else:
            checked: list[dict[str, Any]] = []
            for hit in hits[:8]:
                probe_url = hit.get("webformatURL") or hit.get("previewURL") or ""
                if probe_url and http.png_has_alpha(probe_url, throttle=0.65) is True:
                    hit["_alpha"] = True
                    checked.append(hit)
            if checked:
                hits = checked
    return [_asset(hit) for hit in hits[:limit]]


def resolve(asset: Asset, *, size: str = "large", **_: Any) -> str:
    order = ("full", "large", "preview") if size == "full" else ("large", "preview", "full")
    for key in order:
        value = asset.meta.get(key)
        if value:
            return value
    return asset.url


def from_url(url: str) -> Asset:
    name = url.rsplit("/", 1)[-1].split("?")[0]
    return Asset(
        source=NAME,
        id=name,
        title=name.rsplit(".", 1)[0],
        url=url,
        fmt=_ext(url),
        license=LICENSE,
        attribution=ATTRIBUTION,
        commercial=COMMERCIAL,
        meta={"referer": "https://pixabay.com/"},
    )
