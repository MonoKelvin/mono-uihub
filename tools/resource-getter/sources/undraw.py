"""unDraw — https://undraw.co/illustrations

Kind: server-rendered search page + direct SVG CDN. No API key.

Findings (verified 2026-10):

* There *is* a stable direct link: ``https://cdn.undraw.co/illustration/<slug>.svg``.
  The old note that unDraw has no hot-linkable asset is outdated.
* Search is a Next.js route: ``https://undraw.co/search/<term>``. The HTML embeds
  ``__NEXT_DATA__`` with ``initialResults`` (40 items) — no need to click the
  download panel or paginate.
* Every SVG carries a full-bleed background path (e.g. a 640×640 rounded rect,
  fill ``#f8f8f8``). ``lib.svg.strip_background`` removes it, so the result is a
  true cut-out illustration rather than a card with a hard rectangular edge.
* Primary accent colour is ``#6c63ff``; ``--recolor`` rewrites it.

License: free for personal and commercial projects, no attribution required.
Do not redistribute the illustrations as a pack, do not use them to train models,
and do not build a competing illustration service from them.
"""

from __future__ import annotations

import re
import urllib.parse
from typing import Any

from lib import htmlx, http, robots
from lib.models import Asset

NAME = "undraw"
TITLE = "unDraw"
KIND = "crawl"
HOME = "https://undraw.co/"
PING_URL = "https://undraw.co/illustrations"
LICENSE = "unDraw License (free commercial, no attribution)"
ATTRIBUTION = "unDraw"
COMMERCIAL = True
REQUIRES_ENV = ()
TRANSPARENT = "是（自动去底）"
NOTE = "开源 SVG 插画；直链 CDN；搜索页可爬"

PRIMARY_COLOR = "#6c63ff"


def _score(title: str, query: str, order: int) -> tuple[int, int]:
    title_l = title.lower()
    query_l = query.lower().strip()
    tokens = [t for t in re.split(r"[^a-z0-9]+", query_l) if t]
    if not query_l:
        return (0, -order)
    if title_l == query_l:
        base = 100
    elif title_l.startswith(query_l):
        base = 80
    elif query_l in title_l:
        base = 60
    else:
        base = sum(8 for token in tokens if token in title_l)
    return (base, -order)


def _asset(item: dict[str, Any]) -> Asset:
    slug = item.get("newSlug") or item.get("slug") or item.get("_id") or ""
    media = item.get("media") or item.get("image") or ""
    return Asset(
        source=NAME,
        id=slug,
        title=item.get("title") or slug,
        url=media,
        page=f"https://undraw.co/illustration/{slug}" if slug else "",
        fmt="svg",
        transparent=True,
        license=LICENSE,
        attribution=ATTRIBUTION,
        commercial=COMMERCIAL,
        tags=[],
        meta={"slug": slug, "referer": "https://undraw.co/"},
    )


def _results_from_page(markup: str) -> tuple[list[dict[str, Any]], int]:
    data = htmlx.next_data(markup) or {}
    props = (data.get("props") or {}).get("pageProps") or {}
    items = props.get("initialResults") or props.get("illustrations") or []
    total = int(props.get("total") or props.get("totalPages") or len(items))
    return [item for item in items if isinstance(item, dict)], total


def search(query: str, *, limit: int = 12, page: int = 1, **_: Any) -> list[Asset]:
    if query.strip():
        url = "https://undraw.co/search/" + urllib.parse.quote(query.strip(), safe="")
    else:
        url = f"https://undraw.co/illustrations/{page}" if page > 1 else "https://undraw.co/illustrations"
    robots.check(url, floor=0.8)
    resp = http.request(url, timeout=30)
    items, _total = _results_from_page(resp.text)
    assets = [_asset(item) for item in items if item.get("media")]
    ranked = sorted(
        enumerate(assets),
        key=lambda pair: _score(pair[1].title, query, pair[0]),
        reverse=True,
    )
    return [asset for _, asset in ranked][:limit]


def resolve(asset: Asset, **_: Any) -> str:
    return asset.url


def recolor_map(color: str) -> dict[str, str]:
    return {PRIMARY_COLOR: color}


def from_url(url: str) -> Asset:
    name = url.rsplit("/", 1)[-1].split("?")[0]
    slug = name[:-4] if name.lower().endswith(".svg") else name
    title = slug.rsplit("_", 1)[0].replace("-", " ").title()
    return Asset(
        source=NAME,
        id=slug,
        title=title,
        url=url,
        page=f"https://undraw.co/illustration/{slug}",
        fmt="svg",
        transparent=True,
        license=LICENSE,
        attribution=ATTRIBUTION,
        commercial=COMMERCIAL,
        meta={"slug": slug, "referer": "https://undraw.co/"},
    )
