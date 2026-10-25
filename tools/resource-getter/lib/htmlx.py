"""Small HTML helpers — no BeautifulSoup, no lxml.

The two crawler providers expose server-rendered HTML, so a tolerant
``HTMLParser`` plus a ``__NEXT_DATA__`` extractor is enough. Keeping this
dependency-free matches the rest of the repo (image-forge is stdlib-only too).
"""

from __future__ import annotations

import html as html_module
import json
import re
from html.parser import HTMLParser
from typing import Any


class _Collector(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.images: list[dict[str, str]] = []
        self.links: list[dict[str, str]] = []
        self.options: list[tuple[str, str]] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        data = {k.lower(): (v or "") for k, v in attrs}
        if tag.lower() == "img":
            self.images.append(data)
        elif tag.lower() == "a":
            self.links.append(data)
        elif tag.lower() == "option":
            self.options.append((data.get("value", ""), data.get("label", "")))

    handle_startendtag = handle_starttag


def _feed(markup: str) -> _Collector:
    parser = _Collector()
    parser.feed(markup)
    parser.close()
    return parser


def images(markup: str) -> list[dict[str, str]]:
    return _feed(markup).images


def links(markup: str, pattern: str | None = None) -> list[dict[str, str]]:
    found = _feed(markup).links
    if pattern:
        rx = re.compile(pattern)
        found = [a for a in found if rx.search(a.get("href", ""))]
    return found


def text(markup: str) -> str:
    cleaned = re.sub(r"<(script|style)\b.*?</\1>", " ", markup, flags=re.S | re.I)
    cleaned = re.sub(r"<[^>]+>", " ", cleaned)
    return re.sub(r"\s+", " ", html_module.unescape(cleaned)).strip()


def next_data(markup: str) -> dict[str, Any] | None:
    """Extract Next.js ``__NEXT_DATA__`` JSON (unDraw uses this)."""
    match = re.search(
        r'<script[^>]+id="__NEXT_DATA__"[^>]*>(.*?)</script>', markup, flags=re.S
    )
    if not match:
        return None
    try:
        value = json.loads(match.group(1))
    except ValueError:
        return None
    return value if isinstance(value, dict) else None


def meta(markup: str, name: str) -> str:
    rx = re.compile(
        rf'<meta[^>]+(?:name|property)=["\']{re.escape(name)}["\'][^>]*content=["\']([^"\']*)',
        re.I,
    )
    match = rx.search(markup)
    return html_module.unescape(match.group(1)) if match else ""
