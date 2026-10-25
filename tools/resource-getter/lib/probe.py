"""Latency probing — decides whether a URL is safe to hot-link.

The UI skill prefers hot-links, but a slow origin is worse than a local file:
a 4-second TTFB makes the whole prototype feel broken. ``probe`` measures the
first byte and the time to read a bounded prefix, then ``decide`` turns that
into ``hotlink`` or ``download``.

Thresholds are intentionally conservative and overridable from the CLI.
"""

from __future__ import annotations

from dataclasses import dataclass

from . import http

DEFAULT_MAX_TTFB = 0.9
DEFAULT_MAX_TOTAL = 2.5


@dataclass
class ProbeResult:
    url: str
    ok: bool
    status: int = 0
    ttfb: float = 0.0
    total: float = 0.0
    bytes: int = 0
    content_type: str = ""
    truncated: bool = False
    error: str = ""

    def line(self) -> str:
        if not self.ok:
            return f"timeout/error  {self.url}  ({self.error})"
        state = "ok" if self.ttfb <= DEFAULT_MAX_TTFB else "slow"
        return (
            f"{state}  ttfb={self.ttfb * 1000:.0f}ms  "
            f"read={self.total * 1000:.0f}ms  {self.bytes // 1024}KB  "
            f"{self.content_type or '?'}"
        )


def probe(
    url: str,
    *,
    max_bytes: int = 256 * 1024,
    timeout: float = 20.0,
    referer: str | None = None,
) -> ProbeResult:
    try:
        resp = http.request(
            url,
            max_bytes=max_bytes,
            timeout=timeout,
            retries=0,
            referer=referer,
        )
    except http.HttpError as exc:
        return ProbeResult(url=url, ok=False, status=exc.status, error=str(exc))
    return ProbeResult(
        url=resp.url,
        ok=200 <= resp.status < 400,
        status=resp.status,
        ttfb=resp.ttfb,
        total=resp.elapsed,
        bytes=len(resp.body),
        content_type=resp.content_type,
        truncated=resp.truncated,
    )


def decide(
    result: ProbeResult,
    *,
    max_ttfb: float = DEFAULT_MAX_TTFB,
    max_total: float = DEFAULT_MAX_TOTAL,
) -> str:
    if not result.ok:
        return "download"
    if result.ttfb > max_ttfb:
        return "download"
    if result.total > max_total:
        return "download"
    return "hotlink"
