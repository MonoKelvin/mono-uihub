"""Lorem Picsum — https://picsum.photos

Kind: URL builder + public list API (no key). Images are sourced from Unsplash.

Patterns:
    https://picsum.photos/seed/<seed>/1200/800
    https://picsum.photos/id/<id>/1200/800
    ...?grayscale&blur=2

``search`` is author-based filtering over ``/v2/list`` — Picsum has no keyword
search. For subject search use Pixabay / pexels.

License: Unsplash License (free commercial, no attribution required).
"""

from __future__ import annotations

import urllib.parse
from typing import Any

from lib import http
from lib.models import Asset

NAME = "picsum"
TITLE = "Lorem Picsum"
KIND = "url"
HOME = "https://picsum.photos/"
PING_URL = "https://picsum.photos/200/300"
LICENSE = "Unsplash License (via Lorem Picsum)"
ATTRIBUTION = "Unsplash / Lorem Picsum"
COMMERCIAL = True
REQUIRES_ENV = ()
TRANSPARENT = "否"
NOTE = "摄影占位；seed 可复现；无关键词搜索"

BASE = "https://picsum.photos"


def build(
    width: int = 1200,
    height: int = 800,
    seed: str | None = None,
    image_id: str | None = None,
    grayscale: bool = False,
    blur: int | None = None,
    **_: Any,
) -> Asset:
    width = max(1, int(width or 1200))
    height = max(1, int(height or 800))
    if image_id:
        path = f"/id/{image_id}/{width}/{height}"
        ident = str(image_id)
    elif seed:
        quoted = urllib.parse.quote(str(seed), safe="")
        path = f"/seed/{quoted}/{width}/{height}"
        ident = str(seed)
    else:
        path = f"/{width}/{height}"
        ident = f"{width}x{height}"
    params: dict[str, Any] = {}
    if blur:
        params["blur"] = max(1, min(10, int(blur)))
    url = http.build_url(BASE + path, params) if params else BASE + path
    if grayscale:
        url += ("&" if "?" in url else "?") + "grayscale"
    return Asset(
        source=NAME,
        id=ident,
        title=f"picsum-{ident}",
        url=url,
        page=f"{BASE}/id/{image_id}" if image_id else BASE + "/",
        width=width,
        height=height,
        fmt="jpg",
        transparent=False,
        license=LICENSE,
        attribution=ATTRIBUTION,
        commercial=COMMERCIAL,
        meta={"referer": BASE + "/"},
    )


def search(query: str = "", *, limit: int = 12, width: int = 1200, height: int = 800, **_: Any) -> list[Asset]:
    data = http.get_json(f"{BASE}/v2/list?page=1&limit=100", timeout=25)
    items = data if isinstance(data, list) else []
    needle = query.strip().lower()
    if needle:
        items = [item for item in items if needle in (item.get("author") or "").lower()]
    assets: list[Asset] = []
    for item in items[:limit]:
        image_id = item.get("id")
        assets.append(
            Asset(
                source=NAME,
                id=str(image_id),
                title=f"Picsum · {item.get('author', 'unknown')}",
                url=f"{BASE}/id/{image_id}/{width}/{height}",
                page=item.get("url", ""),
                width=width,
                height=height,
                fmt="jpg",
                transparent=False,
                license=LICENSE,
                attribution=item.get("author", ATTRIBUTION),
                commercial=COMMERCIAL,
                tags=[item.get("author", "")],
                meta={"referer": BASE + "/", "download_url": item.get("download_url", "")},
            )
        )
    return assets


def resolve(asset: Asset, **_: Any) -> str:
    return asset.url


def from_url(url: str) -> Asset:
    return Asset(
        source=NAME,
        id=url.rsplit("/", 1)[-1],
        title="picsum",
        url=url,
        fmt="jpg",
        license=LICENSE,
        attribution=ATTRIBUTION,
        commercial=COMMERCIAL,
        meta={"referer": BASE + "/"},
    )
