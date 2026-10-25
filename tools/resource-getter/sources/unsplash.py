"""Unsplash — https://unsplash.com

Kind: direct image CDN (no key needed when you already have a photo id) +
optional official API search when ``UNSPLASH_ACCESS_KEY`` is configured.

Pattern:
    https://images.unsplash.com/photo-<id>?w=1600&q=80&auto=format&fit=crop

The existing skill only documented the hot-link template. Search is added here
for completeness; without a key the module fails with a clear message instead of
scraping the site (Unsplash's robots/terms disallow that).

License: Unsplash License — free commercial, no attribution required.
"""

from __future__ import annotations

import urllib.parse
from typing import Any

from lib import env, http
from lib.models import Asset

NAME = "unsplash"
TITLE = "Unsplash"
KIND = "url"
HOME = "https://unsplash.com/"
PING_URL = "https://images.unsplash.com/"
LICENSE = "Unsplash License"
ATTRIBUTION = "Unsplash"
COMMERCIAL = True
REQUIRES_ENV = ()
TRANSPARENT = "否"
NOTE = "摄影；有 photo id 可直链；搜索需 UNSPLASH_ACCESS_KEY"

BASE = "https://images.unsplash.com"
API = "https://api.unsplash.com"


def _photo_id(value: str) -> str:
    value = value.strip()
    if value.startswith("http"):
        path = urllib.parse.urlsplit(value).path.strip("/")
        return path.split("/")[-1] or value
    return value


def build(
    photo_id: str,
    width: int = 1600,
    quality: int = 80,
    fit: str = "crop",
    **_: Any,
) -> Asset:
    if not photo_id:
        raise ValueError("Unsplash 需要 --id <photo-id>（例如 photo-1500530855697-b586d89ba3ee）。")
    ident = _photo_id(photo_id)
    params = {"w": width, "q": quality, "auto": "format", "fit": fit}
    url = http.build_url(f"{BASE}/{ident}", params)
    return Asset(
        source=NAME,
        id=ident,
        title=ident,
        url=url,
        page=f"https://unsplash.com/photos/{ident.replace('photo-', '')}",
        width=width,
        height=0,
        fmt="jpg",
        transparent=False,
        license=LICENSE,
        attribution=ATTRIBUTION,
        commercial=COMMERCIAL,
        meta={"referer": "https://unsplash.com/"},
    )


def search(query: str, *, limit: int = 12, width: int = 1600, **_: Any) -> list[Asset]:
    key = env.require(
        "UNSPLASH_ACCESS_KEY",
        hint="在 tools/resource-getter/.env 中设置；不设则只能用 build/直链。",
    )
    data = http.get_json(
        http.build_url(
            f"{API}/search/photos",
            {"query": query, "per_page": max(1, min(30, limit)), "client_id": key},
        ),
        timeout=30,
    )
    assets: list[Asset] = []
    for item in (data.get("results") or [])[:limit]:
        raw = (item.get("urls") or {}).get("raw") or (item.get("urls") or {}).get("regular") or ""
        if not raw:
            continue
        url = http.build_url(raw, {"w": width, "q": 80, "auto": "format", "fit": "crop"})
        assets.append(
            Asset(
                source=NAME,
                id=item.get("id", ""),
                title=item.get("description") or item.get("alt_description") or item.get("id", ""),
                url=url,
                page=(item.get("links") or {}).get("html", ""),
                width=int(item.get("width") or 0),
                height=int(item.get("height") or 0),
                fmt="jpg",
                transparent=False,
                license=LICENSE,
                attribution=(item.get("user") or {}).get("name", ATTRIBUTION),
                commercial=COMMERCIAL,
                tags=[tag.get("title", "") for tag in item.get("tags") or [] if isinstance(tag, dict)],
                meta={"referer": "https://unsplash.com/", "download": (item.get("links") or {}).get("download", "")},
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
        title=ident,
        url=url,
        fmt="jpg",
        license=LICENSE,
        attribution=ATTRIBUTION,
        commercial=COMMERCIAL,
        meta={"referer": "https://unsplash.com/"},
    )
