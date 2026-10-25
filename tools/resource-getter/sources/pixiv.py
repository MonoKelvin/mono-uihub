"""Pixiv — https://github.com/222wcnm/pixiv-mcp-server

Kind: official App API with a refresh token (no password, no scraping).
Auth: ``PIXIV_REFRESH_TOKEN``; obtain it with ``get.py pixiv-login``.

Why not drive the MCP server directly? The upstream project is a Python MCP
server that itself wraps PixivPy. Talking to ``app-api.pixiv.net`` with stdlib
keeps this tool dependency-free; the MCP route remains documented in the README
for users who prefer it.

Setup:
1. ``python tools/resource-getter/get.py pixiv-login`` — clones/updates
   ``vendor/pixiv-mcp-server`` and runs its interactive ``get_token.py``.
2. The helper writes ``PIXIV_REFRESH_TOKEN`` into ``tools/resource-getter/.env``.
3. If Pixiv is blocked in your region, set ``HTTPS_PROXY`` in the same file.

The vendor source is gitignored; only ``vendor/manifest.json`` pins the commit.
Alternatively ``uvx gppt login -j`` produces the same refresh token if you prefer
not to use the vendored helper.

Notes:
* Requests use the public Pixiv Android/iOS app client credentials (the same
  constants PixivPy publishes). They are not user secrets.
* Downloads need ``Referer: https://www.pixiv.net/``; the module sets it.
* ``safe=True`` (default) filters ``x_restrict != 0``.

License: each artwork remains the copyright of its author. Treat downloaded
files as private reference / moodboard material — do not ship them in a public
or commercial UI without the artist's permission.
"""

from __future__ import annotations

import hashlib
import time
import urllib.parse
from datetime import datetime, timezone
from typing import Any

from lib import env, http
from lib.cache import JsonCache
from lib.models import Asset

NAME = "pixiv"
TITLE = "Pixiv"
KIND = "api"
HOME = "https://www.pixiv.net/"
PING_URL = "https://www.pixiv.net/"
LICENSE = "Pixiv user artwork — private reference only"
ATTRIBUTION = "© the original Pixiv artist"
COMMERCIAL = False
REQUIRES_ENV = ("PIXIV_REFRESH_TOKEN",)
TRANSPARENT = "否（多为带背景插画）"
NOTE = "需 refresh token；仅限私人参考，勿商用"

CLIENT_ID = "MOBrBDS8blbauoSck0ZfDbtuzpyT"
CLIENT_SECRET = "lsACyCD94FhDUtGTXi3QzcFE2uU1hqtDaKeqrdwj"
HASH_SECRET = "28c1fdd170a5204386cb1313c7077b34f83e4aaf4aa829ce78c231e05b0bae2c"
UA = "PixivIOSApp/7.13.3 (iOS 14.6; iPhone13,2)"
AUTH_URL = "https://oauth.secure.pixiv.net/auth/token"
API = "https://app-api.pixiv.net"
_token_cache = JsonCache("pixiv-token.json", ttl=30 * 24 * 3600)


class PixivError(RuntimeError):
    pass


def _auth_headers() -> dict[str, str]:
    now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S+00:00")
    return {
        "User-Agent": UA,
        "App-OS": "ios",
        "App-OS-Version": "14.6",
        "App-Version": "7.13.3",
        "x-client-time": now,
        "x-client-hash": hashlib.md5((now + HASH_SECRET).encode()).hexdigest(),
        "Content-Type": "application/x-www-form-urlencoded",
    }


def _refresh() -> dict[str, Any]:
    token = env.require(
        "PIXIV_REFRESH_TOKEN",
        hint="运行 `python tools/resource-getter/get.py pixiv-login` 获取后写入 .env。",
    )
    data = urllib.parse.urlencode(
        {
            "get_secure_url": 1,
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
            "grant_type": "refresh_token",
            "refresh_token": token,
        }
    )
    try:
        resp = http.request(
            AUTH_URL,
            method="POST",
            headers=_auth_headers(),
            data=data,
            timeout=30,
        )
    except http.HttpError as exc:
        detail = exc.body[:300].decode("utf-8", errors="replace")
        raise PixivError(
            f"Pixiv 刷新令牌失败（HTTP {exc.status}）。"
            "令牌可能已过期，重新运行 `python tools/resource-getter/get.py pixiv-login`。\n" + detail
        ) from None
    payload = resp.json().get("response", {})
    if not payload.get("access_token"):
        raise PixivError(f"Pixiv 返回异常：{resp.text[:300]}")
    record = {
        "access_token": payload["access_token"],
        "refresh_token": payload.get("refresh_token", token),
        "expires_at": time.time() + int(payload.get("expires_in", 3600)) - 60,
        "user_id": (payload.get("user") or {}).get("id", ""),
    }
    _token_cache.set("auth", record)
    return record


def _token() -> str:
    cached = _token_cache.get("auth") or {}
    if cached.get("access_token") and cached.get("expires_at", 0) > time.time():
        return cached["access_token"]
    return _refresh()["access_token"]


def _api(path: str, params: dict[str, Any] | None = None) -> dict[str, Any]:
    url = http.build_url(API + path, params)
    headers = {
        "Authorization": f"Bearer {_token()}",
        "User-Agent": UA,
        "App-OS": "ios",
        "App-OS-Version": "14.6",
        "App-Version": "7.13.3",
        "Accept-Language": "en-US,en;q=0.9",
    }
    try:
        return http.request(url, headers=headers, timeout=30).json()
    except http.HttpError as exc:
        raise PixivError(f"Pixiv API 请求失败（HTTP {exc.status}）：{url}") from None


def _asset(illust: dict[str, Any]) -> Asset:
    meta_single = illust.get("meta_single_page") or {}
    urls = illust.get("image_urls") or {}
    url = meta_single.get("original_image_url") or urls.get("large") or urls.get("medium") or ""
    tags = [tag.get("name", "") for tag in illust.get("tags") or [] if isinstance(tag, dict)]
    lower = url.lower()
    fmt = "png" if lower.endswith(".png") else "webp" if lower.endswith(".webp") else "jpg"
    return Asset(
        source=NAME,
        id=str(illust.get("id", "")),
        title=illust.get("title") or f"pixiv-{illust.get('id')}",
        url=url,
        page=f"https://www.pixiv.net/artworks/{illust.get('id')}",
        width=int(illust.get("width") or 0),
        height=int(illust.get("height") or 0),
        fmt=fmt,
        transparent=None,
        license=LICENSE,
        attribution=ATTRIBUTION,
        commercial=COMMERCIAL,
        tags=tags,
        meta={
            "author": (illust.get("user") or {}).get("name", ""),
            "author_id": (illust.get("user") or {}).get("id", ""),
            "pages": illust.get("page_count", 1),
            "bookmarks": illust.get("total_bookmarks", 0),
            "x_restrict": illust.get("x_restrict", 0),
            "referer": "https://www.pixiv.net/",
        },
    )


def search(
    query: str,
    *,
    limit: int = 12,
    safe: bool = True,
    sort: str = "date_desc",
    target: str = "partial_match_for_tags",
    **_: Any,
) -> list[Asset]:
    if sort not in ("date_desc", "date_asc", "popular_desc"):
        sort = "date_desc"
    data = _api(
        "/v1/search/illust",
        {
            "word": query,
            "search_target": target,
            "sort": sort,
            "filter": "for_ios",
        },
    )
    illusts = data.get("illusts") or []
    if safe:
        illusts = [item for item in illusts if int(item.get("x_restrict") or 0) == 0]
    return [_asset(item) for item in illusts[:limit]]


def resolve(asset: Asset, **_: Any) -> str:
    return asset.url


def check(*, force: bool = False) -> str:
    """Return the authenticated user id, or raise a readable error."""
    if force:
        _token_cache.delete("auth")
    cached = _token_cache.get("auth") or {}
    if cached.get("access_token") and cached.get("expires_at", 0) > time.time():
        return str(cached.get("user_id", ""))
    record = _refresh()
    return str(record.get("user_id", ""))


def from_url(url: str) -> Asset:
    name = url.rsplit("/", 1)[-1].split("?")[0]
    return Asset(
        source=NAME,
        id=name.rsplit(".", 1)[0],
        title=name.rsplit(".", 1)[0],
        url=url,
        fmt="png" if url.lower().endswith(".png") else "jpg",
        license=LICENSE,
        attribution=ATTRIBUTION,
        commercial=COMMERCIAL,
        meta={"referer": "https://www.pixiv.net/"},
    )
