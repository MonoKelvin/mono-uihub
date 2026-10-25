"""Pexels — https://www.pexels.com

Kind: direct image CDN + optional official API search (``PEXELS_API_KEY``).

Pattern:
    https://images.pexels.com/photos/<id>/pexels-photo-<id>.jpeg?auto=compress&w=1600

License: Pexels License — free commercial, no attribution required.
"""

from __future__ import annotations

import urllib.parse
from typing import Any

from lib import env, http
from lib.models import Asset

NAME = "pexels"
TITLE = "Pexels"
KIND = "url"
HOME = "https://www.pexels.com/"
PING_URL = "https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&w=200"
LICENSE = "Pexels License"
ATTRIBUTION = "Pexels"
COMMERCIAL = True
REQUIRES_ENV = ()
TRANSPARENT = "否"
NOTE = "摄影；有 photo id 可直链；搜索需 PEXELS_API_KEY"

BASE = "https://images.pexels.com"
API = "https://api.pexels.com/v1"


def _photo_id(value: str) -> str:
    value = value.strip()
    if value.startswith("http"):
        parts = [part for part in urllib.parse.urlsplit(value).path.split("/") if part]
        for index, part in enumerate(parts):
            if part == "photos" and index + 1 < len(parts):
                return parts[index + 1]
        return value
    return value


def build(
    photo_id: str,
    width: int = 1600,
    height: int | None = None,
    **_: Any,
) -> Asset:
    if not photo_id:
        raise ValueError("Pexels 需要 --id <photo-id> 或完整图片 URL（例如 1108099）。")
    raw = str(photo_id).strip()
    params: dict[str, Any] = {"auto": "compress", "cs": "tinysrgb", "w": width}
    if height:
        params["h"] = height
        params["fit"] = "crop"
    if raw.startswith("http"):
        # Preserve the real CDN filename: not every Pexels photo is
        # ``pexels-photo-<id>.jpeg`` (many use a descriptive slug).
        base = urllib.parse.urlsplit(raw)
        clean = urllib.parse.urlunsplit((base.scheme, base.netloc, base.path, "", ""))
        url = http.build_url(clean, params)
        ident = _photo_id(raw)
    else:
        ident = raw
        url = http.build_url(f"{BASE}/photos/{ident}/pexels-photo-{ident}.jpeg", params)
    return Asset(
        source=NAME,
        id=ident,
        title=f"pexels-{ident}",
        url=url,
        page=f"https://www.pexels.com/photo/{ident}/",
        width=width,
        height=height or 0,
        fmt="jpg",
        transparent=False,
        license=LICENSE,
        attribution=ATTRIBUTION,
        commercial=COMMERCIAL,
        meta={"referer": "https://www.pexels.com/"},
    )


def search(query: str, *, limit: int = 12, width: int = 1600, **_: Any) -> list[Asset]:
    key = env.require(
        "PEXELS_API_KEY",
        hint="在 tools/resource-getter/.env 中设置；不设则只能用 build/直链。",
    )
    resp = http.request(
        http.build_url(f"{API}/search", {"query": query, "per_page": max(1, min(80, limit))}),
        headers={"Authorization": key},
        timeout=30,
    )
    data = resp.json()
    assets: list[Asset] = []
    for item in (data.get("photos") or [])[:limit]:
        src = item.get("src") or {}
        raw = src.get("large2x") or src.get("original") or src.get("large") or ""
        if not raw:
            continue
        url = http.build_url(raw, {"auto": "compress", "cs": "tinysrgb", "w": width})
        assets.append(
            Asset(
                source=NAME,
                id=str(item.get("id", "")),
                title=item.get("alt") or f"pexels-{item.get('id')}",
                url=url,
                page=item.get("url", ""),
                width=int(item.get("width") or 0),
                height=int(item.get("height") or 0),
                fmt="jpg",
                transparent=False,
                license=LICENSE,
                attribution=item.get("photographer", ATTRIBUTION),
                commercial=COMMERCIAL,
                tags=[],
                meta={"referer": "https://www.pexels.com/", "photographer_url": item.get("photographer_url", "")},
            )
        )
    return assets


def resolve(asset: Asset, **_: Any) -> str:
    return asset.url


def from_url(url: str) -> Asset:
    ident = _photo_id(url)
    return Asset(
        source=NAME,
        id=ident,
        title=f"pexels-{ident}",
        url=url,
        fmt="jpg",
        license=LICENSE,
        attribution=ATTRIBUTION,
        commercial=COMMERCIAL,
        meta={"referer": "https://www.pexels.com/"},
    )
