"""pngimg — https://pngimg.com

Kind: server-rendered search page (HTML scraping). No API key.

How it works (verified 2026-10):

* Search endpoint: ``https://pngimg.com/search_image/?search_image=<term>&page=N``.
* Thumbnails are ``/uploads/<category>/small/<name>.png``; the full-size file is
  the same path with ``/small/`` removed. Example:
  ``https://pngimg.com/uploads/fox/fox_PNG23172.png``.
* Results are 20 per page and include loosely related categories, so the module
  ranks filenames by query-token overlap and dedupes.

License: **CC BY-NC 4.0 — non-commercial only, attribution required.** Suitable
for prototypes / internal demos, not for shipped commercial UI. The CLI prints a
warning every time this source is used.
"""

from __future__ import annotations

import re
import urllib.parse
from typing import Any

from lib import htmlx, http, robots
from lib.models import Asset

NAME = "pngimg"
TITLE = "pngimg"
KIND = "crawl"
HOME = "https://pngimg.com/"
PING_URL = "https://pngimg.com/search_image/?search_image=fox"
LICENSE = "CC BY-NC 4.0"
ATTRIBUTION = "pngimg.com (CC BY-NC 4.0)"
COMMERCIAL = False
REQUIRES_ENV = ()
TRANSPARENT = "是（原生抠图 PNG）"
NOTE = "抠图 PNG 图库；仅限非商用；需署名"

BASE = "https://pngimg.com"


def _title(src: str, alt: str) -> str:
    if alt and alt.strip():
        return re.sub(r"\s+PNG\s+(image|images|picture|pictures).*$", "", alt, flags=re.I).strip()
    stem = src.rsplit("/", 1)[-1].rsplit(".", 1)[0]
    stem = re.sub(r"_PNG\d+$", "", stem)
    return stem.replace("_", " ").replace("-", " ").title()


def _score(title: str, src: str, query: str) -> int:
    haystack = f"{title} {src}".lower()
    tokens = [t for t in re.split(r"[^a-z0-9]+", query.lower()) if t]
    return sum(3 for token in tokens if token in haystack)


def search(query: str, *, limit: int = 12, pages: int = 2, **_: Any) -> list[Asset]:
    results: list[Asset] = []
    seen: set[str] = set()
    term = urllib.parse.quote_plus(query.strip())
    for page in range(1, max(1, pages) + 1):
        url = f"{BASE}/search_image/?search_image={term}&page={page}"
        robots.check(url, floor=1.0)
        resp = http.request(url, timeout=30)
        found = 0
        for img in htmlx.images(resp.text):
            src = img.get("src", "")
            if "/uploads/" not in src or not src.lower().endswith(".png"):
                continue
            src = src.replace("/small/", "/")
            full = src if src.startswith("http") else BASE + src
            if full in seen:
                continue
            seen.add(full)
            found += 1
            stem = full.rsplit("/", 1)[-1].rsplit(".", 1)[0]
            results.append(
                Asset(
                    source=NAME,
                    id=stem,
                    title=_title(src, img.get("alt", "")),
                    url=full,
                    page=url,
                    fmt="png",
                    transparent=True,
                    license=LICENSE,
                    attribution=ATTRIBUTION,
                    commercial=COMMERCIAL,
                    tags=[term],
                    meta={"referer": BASE + "/", "search": url},
                )
            )
        if found == 0:
            break
    results.sort(key=lambda asset: _score(asset.title, asset.url, query), reverse=True)
    return results[:limit]


def resolve(asset: Asset, **_: Any) -> str:
    return asset.url


def from_url(url: str) -> Asset:
    stem = url.rsplit("/", 1)[-1].rsplit(".", 1)[0]
    return Asset(
        source=NAME,
        id=stem,
        title=_title(url, ""),
        url=url,
        fmt="png",
        transparent=True,
        license=LICENSE,
        attribution=ATTRIBUTION,
        commercial=COMMERCIAL,
        meta={"referer": BASE + "/"},
    )
