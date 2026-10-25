"""Pravatar — https://i.pravatar.cc

Kind: pure URL builder. No key.

    https://i.pravatar.cc/120?u=<seed>
    https://i.pravatar.cc/120?img=<1-70>

License: placeholder avatars for prototyping. The service does not grant a
clear commercial license for the underlying photos; for shipped UI prefer
DiceBear (per-style CC0/CC BY) or a licensed photo source.
"""

from __future__ import annotations

import urllib.parse
from typing import Any

from lib import http
from lib.models import Asset

NAME = "pravatar"
TITLE = "Pravatar"
KIND = "url"
HOME = "https://i.pravatar.cc/"
PING_URL = "https://i.pravatar.cc/120"
LICENSE = "Pravatar placeholder (prototype use)"
ATTRIBUTION = "pravatar.cc"
COMMERCIAL = False
REQUIRES_ENV = ()
TRANSPARENT = "否"
NOTE = "头像占位；来源授权不明确，正式项目改用 DiceBear"

BASE = "https://i.pravatar.cc"


def build(size: int = 120, seed: str | None = None, image: int | None = None, **_: Any) -> Asset:
    size = max(1, min(1000, int(size or 120)))
    query: dict[str, Any] = {}
    if image:
        query["img"] = int(image)
    elif seed:
        query["u"] = str(seed)
    url = http.build_url(f"{BASE}/{size}", query)
    ident = str(image or seed or size)
    return Asset(
        source=NAME,
        id=ident,
        title=f"avatar-{ident}",
        url=url,
        page=BASE + "/",
        width=size,
        height=size,
        fmt="jpg",
        transparent=False,
        license=LICENSE,
        attribution=ATTRIBUTION,
        commercial=COMMERCIAL,
        meta={"referer": BASE + "/"},
    )


def resolve(asset: Asset, **_: Any) -> str:
    return asset.url


def from_url(url: str) -> Asset:
    parts = urllib.parse.urlsplit(url)
    size = parts.path.strip("/") or "120"
    return Asset(
        source=NAME,
        id=parts.query or size,
        title="avatar",
        url=url,
        width=int(size) if size.isdigit() else 0,
        height=int(size) if size.isdigit() else 0,
        fmt="jpg",
        license=LICENSE,
        attribution=ATTRIBUTION,
        commercial=COMMERCIAL,
        meta={"referer": BASE + "/"},
    )
