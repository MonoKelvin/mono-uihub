"""robots.txt compliance for the two crawler-based providers.

We only crawl pages that a normal browser could open, and only when robots.txt
allows it. APIs (Pixabay, Storyset MCP, Pixiv) are not crawled — they are called
through their documented endpoints.

Policy: longest-match wins (RFC 9309); ``*`` wildcards and a trailing ``$`` are
supported; Crawl-delay is honoured with a conservative per-host floor.
"""

from __future__ import annotations

import json
import re
import time
import urllib.parse
from dataclasses import dataclass, field

from . import http
from .paths import CACHE_DIR

_CACHE_TTL = 24 * 3600
_cache_file = CACHE_DIR / "robots.json"
_last_hit: dict[str, float] = {}


class ComplianceError(RuntimeError):
    """Raised when robots.txt forbids the requested path."""


@dataclass
class _Rule:
    allow: bool
    pattern: str
    regex: re.Pattern[str]


@dataclass
class _Group:
    agents: list[str] = field(default_factory=list)
    rules: list[_Rule] = field(default_factory=list)
    delay: float | None = None


def _compile(pattern: str) -> re.Pattern[str]:
    anchored = pattern.endswith("$")
    body = pattern[:-1] if anchored else pattern
    regex = re.escape(body).replace(r"\*", ".*")
    return re.compile(f"^{regex}{'$' if anchored else ''}")


def _parse(text: str) -> list[_Group]:
    groups: list[_Group] = []
    current = _Group()
    seen_rule = False
    for raw in text.splitlines():
        line = raw.split("#", 1)[0].strip()
        if not line or ":" not in line:
            continue
        key, value = line.split(":", 1)
        key = key.strip().lower()
        value = value.strip()
        if key == "user-agent":
            if seen_rule:
                groups.append(current)
                current = _Group()
                seen_rule = False
            current.agents.append(value.lower())
        elif key in ("allow", "disallow"):
            seen_rule = True
            if key == "disallow" and not value:
                continue  # empty Disallow means "allow everything"
            current.rules.append(_Rule(key == "allow", value, _compile(value)))
        elif key == "crawl-delay":
            try:
                current.delay = max(current.delay or 0.0, float(value))
            except ValueError:
                pass
    if current.agents or current.rules:
        groups.append(current)
    return groups


def _load_cache() -> dict[str, dict]:
    try:
        return json.loads(_cache_file.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return {}


def _save_cache(data: dict[str, dict]) -> None:
    try:
        CACHE_DIR.mkdir(parents=True, exist_ok=True)
        _cache_file.write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")
    except OSError:
        pass


def _robots_text(host: str) -> str:
    cache = _load_cache()
    item = cache.get(host)
    now = time.time()
    if isinstance(item, dict) and now - item.get("ts", 0) < _CACHE_TTL:
        return item.get("text", "")
    url = f"https://{host}/robots.txt"
    try:
        resp = http.request(url, retries=0, timeout=15)
        text = resp.text
        if resp.content_type not in ("text/plain", "text/x-robots", ""):
            text = "" if text.lstrip().startswith("<") else text
    except http.HttpError as exc:
        text = "" if exc.status in (401, 403, 404, 410) else ""
    cache[host] = {"ts": now, "text": text}
    _save_cache(cache)
    return text


def _groups_for(host: str) -> list[_Group]:
    groups = _parse(_robots_text(host))
    specific = [g for g in groups if any("resource-getter" in a for a in g.agents)]
    if specific:
        return specific
    return [g for g in groups if "*" in g.agents]


def allowed(url: str) -> bool:
    parts = urllib.parse.urlsplit(url)
    path = parts.path or "/"
    if parts.query:
        path = f"{path}?{parts.query}"
    groups = _groups_for(parts.netloc.lower())
    best_len = -1
    best_allow = True
    for group in groups:
        for rule in group.rules:
            if rule.regex.match(path):
                length = len(rule.pattern)
                if length > best_len or (length == best_len and rule.allow):
                    best_len = length
                    best_allow = rule.allow
    return best_allow if best_len >= 0 else True


def delay(url: str, floor: float = 0.6) -> float:
    host = urllib.parse.urlsplit(url).netloc.lower()
    groups = _groups_for(host)
    values = [g.delay for g in groups if g.delay]
    return max([floor, *values])


def wait(url: str, floor: float = 0.6) -> None:
    host = urllib.parse.urlsplit(url).netloc.lower()
    interval = delay(url, floor)
    now = time.monotonic()
    remaining = interval - (now - _last_hit.get(host, 0.0))
    if remaining > 0:
        time.sleep(remaining)
    _last_hit[host] = time.monotonic()


def check(url: str, *, floor: float = 0.6) -> None:
    """Raise :class:`ComplianceError` when crawling ``url`` is not allowed."""
    if not allowed(url):
        raise ComplianceError(
            f"robots.txt 禁止抓取该路径，已停止：{url}\n"
            "请改用站点提供的 API/直链，或手动下载。"
        )
    wait(url, floor=floor)


def info(host: str) -> dict:
    """Diagnostics for ``doctor``; never raises."""
    text = _robots_text(host)
    groups = _parse(text)
    return {
        "host": host,
        "groups": len(groups),
        "crawl_delay": max([g.delay or 0 for g in groups] or [0]),
        "has_file": bool(text.strip()),
    }
