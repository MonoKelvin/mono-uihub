"""Storyset — https://storyset.com

Kind: remote MCP server (Streamable HTTP), no API key.

The community MCP server (https://github.com/ba443/storyset-mcp, MIT) exposes
``search`` / ``get_illustration`` and returns canonical SVG + PNG URLs on
``stories.freepiklabs.com``. We talk to it with the minimal JSON-RPC client in
``lib.mcp`` instead of installing the MCP SDK.

Default endpoint (free, no signup):
    https://storyset-mcp.engdawood.com/mcp
Override with ``STORYSET_MCP_URL``.

Styles: ``amico`` / ``bro`` / ``cuate`` / ``pana`` / ``rafiki``.

License: free for personal and commercial use **with credit** to Storyset /
Freepik; credit can be removed only with a Flaticon Premium subscription.
"""

from __future__ import annotations

import os
from typing import Any

from lib import env, http
from lib.mcp import MCPClient, MCPError
from lib.models import Asset

NAME = "storyset"
TITLE = "Storyset"
KIND = "mcp"
HOME = "https://storyset.com/"
PING_URL = "https://storyset.com/"
LICENSE = "Storyset / Freepik (free with attribution)"
ATTRIBUTION = "Illustration by Storyset (storyset.com)"
COMMERCIAL = True
REQUIRES_ENV = ()
TRANSPARENT = "是（透明 SVG）"
NOTE = "矢量插画；需署名；远程 MCP，无 Key"

MCP_URL = "https://storyset-mcp.engdawood.com/mcp"
STYLES = ("amico", "bro", "cuate", "pana", "rafiki")


def _endpoint() -> str:
    return env.get("STORYSET_MCP_URL") or os.environ.get("STORYSET_MCP_URL") or MCP_URL


def _asset(item: dict[str, Any]) -> Asset:
    slug = item.get("slug") or ""
    style = item.get("style") or "amico"
    return Asset(
        source=NAME,
        id=f"{slug}-{style}" if slug else "",
        title=item.get("title") or slug,
        url=item.get("preview_url") or item.get("svg_url") or "",
        page=item.get("page_url") or f"https://storyset.com/illustration/{slug}/{style}",
        fmt="svg",
        transparent=True,
        license=LICENSE,
        attribution=ATTRIBUTION,
        commercial=COMMERCIAL,
        tags=[style],
        meta={"slug": slug, "style": style, "referer": "https://storyset.com/"},
    )


def search(query: str, *, limit: int = 12, style: str | None = None, **_: Any) -> list[Asset]:
    count = max(1, min(60, limit * 2))
    client = MCPClient(_endpoint(), timeout=45)
    try:
        data = client.call("search", {"query": query, "limit": count})
    finally:
        client.close()
    results = data.get("results", []) if isinstance(data, dict) else []
    assets = [_asset(item) for item in results if isinstance(item, dict)]
    if style:
        wanted = style.lower()
        assets = [asset for asset in assets if asset.meta.get("style") == wanted]
    return assets[:limit]


def resolve(asset: Asset, *, size: str = "svg", **_: Any) -> str:
    slug = asset.meta.get("slug")
    style = asset.meta.get("style") or "amico"
    if not slug:
        return asset.url
    client = MCPClient(_endpoint(), timeout=45)
    try:
        data = client.call("get_illustration", {"slug": slug, "style": style})
    except (MCPError, http.HttpError):
        return asset.url
    finally:
        client.close()
    if isinstance(data, dict):
        key = "png_url" if size == "png" else "svg_url"
        return data.get(key) or data.get("svg_url") or asset.url
    return asset.url


def from_url(url: str) -> Asset:
    name = url.rsplit("/", 1)[-1].split("?")[0]
    stem = name.rsplit(".", 1)[0]
    title = stem.replace("_", " ").replace("+", " ").title()
    return Asset(
        source=NAME,
        id=stem,
        title=title,
        url=url,
        fmt="svg" if url.lower().endswith(".svg") else "png",
        transparent=url.lower().endswith(".svg"),
        license=LICENSE,
        attribution=ATTRIBUTION,
        commercial=COMMERCIAL,
        meta={"referer": "https://storyset.com/"},
    )
