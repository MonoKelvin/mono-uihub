"""HTTP plumbing shared by every provider.

Design choices:

* stdlib ``urllib`` only; honours ``HTTP_PROXY`` / ``HTTPS_PROXY`` from the
  environment, so the same proxy used by Git works here.
* a single identifying User-Agent (crawlers should be honest and contactable);
* gzip support, per-host throttling, bounded retries, and a hard byte ceiling;
* TTFB is measured separately from body time — this feeds the hot-link vs
  download decision in :mod:`lib.probe`.
"""

from __future__ import annotations

import gzip
import json
import os
import socket
import time
import urllib.error
import urllib.parse
import urllib.request
import zlib
from dataclasses import dataclass, field
from typing import Any, Mapping

DEFAULT_UA = (
    "resource-getter/1.0 "
    "(+https://github.com/monokelvin/mono-uihub; UI prototype asset fetcher)"
)
_RETRY_STATUS = {408, 425, 429, 500, 502, 503, 504}
_last_request: dict[str, float] = {}


class HttpError(RuntimeError):
    """A non-retryable HTTP or transport failure."""

    def __init__(self, message: str, *, status: int = 0, url: str = "", body: bytes = b""):
        super().__init__(message)
        self.status = status
        self.url = url
        self.body = body


@dataclass
class Response:
    url: str
    status: int
    headers: Mapping[str, str]
    body: bytes
    ttfb: float
    elapsed: float
    truncated: bool = False
    meta: dict[str, Any] = field(default_factory=dict)

    @property
    def content_type(self) -> str:
        return (self.headers.get("Content-Type") or "").split(";")[0].strip().lower()

    @property
    def text(self) -> str:
        charset = "utf-8"
        ctype = self.headers.get("Content-Type") or ""
        for part in ctype.split(";"):
            part = part.strip()
            if part.lower().startswith("charset="):
                charset = part.split("=", 1)[1].strip().strip('"') or "utf-8"
        return self.body.decode(charset, errors="replace")

    def json(self) -> Any:
        return json.loads(self.text)


def user_agent() -> str:
    return os.environ.get("RESOURCE_GETTER_UA") or DEFAULT_UA


def build_url(base: str, params: Mapping[str, Any] | None = None) -> str:
    if not params:
        return base
    clean = {k: v for k, v in params.items() if v is not None and v != ""}
    if not clean:
        return base
    sep = "&" if urllib.parse.urlsplit(base).query else "?"
    return f"{base}{sep}{urllib.parse.urlencode(clean, doseq=True)}"


def _throttle(host: str, interval: float) -> None:
    if interval <= 0:
        return
    now = time.monotonic()
    last = _last_request.get(host, 0.0)
    wait = interval - (now - last)
    if wait > 0:
        time.sleep(wait)
    _last_request[host] = time.monotonic()


def _decode_body(body: bytes, encoding: str) -> bytes:
    encoding = (encoding or "").lower()
    try:
        if encoding == "gzip":
            return gzip.decompress(body)
        if encoding == "deflate":
            return zlib.decompress(body)
    except (OSError, zlib.error):
        # Servers occasionally mislabel; keep the raw bytes rather than fail.
        return body
    return body


def request(
    url: str,
    *,
    method: str | None = None,
    headers: Mapping[str, str] | None = None,
    data: bytes | str | None = None,
    timeout: float = 30.0,
    retries: int = 2,
    max_bytes: int | None = None,
    throttle: float = 0.0,
    referer: str | None = None,
) -> Response:
    """Fetch ``url`` and return a :class:`Response`.

    ``max_bytes`` truncates the body (used by probes). Retries only cover
    transport errors and 408/425/429/5xx; a 404 fails fast.
    """
    if isinstance(data, str):
        data = data.encode("utf-8")

    host = urllib.parse.urlsplit(url).netloc.lower()
    merged: dict[str, str] = {
        "User-Agent": user_agent(),
        "Accept": "*/*",
        "Accept-Language": "en-US,en;q=0.9,zh-CN;q=0.8",
        "Accept-Encoding": "gzip, deflate",
    }
    if referer:
        merged["Referer"] = referer
    if headers:
        merged.update(headers)

    last_error: Exception | None = None
    for attempt in range(retries + 1):
        _throttle(host, throttle)
        started = time.monotonic()
        try:
            req = urllib.request.Request(url, data=data, headers=merged, method=method)
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                ttfb = time.monotonic() - started
                raw = resp.read(max_bytes) if max_bytes else resp.read()
                elapsed = time.monotonic() - started
                truncated = False
                length = resp.headers.get("Content-Length")
                if max_bytes and length and length.isdigit() and int(length) > len(raw):
                    truncated = True
                if max_bytes and not length and len(raw) >= max_bytes:
                    truncated = True
                body = raw if truncated else _decode_body(raw, resp.headers.get("Content-Encoding", ""))
                return Response(
                    url=resp.geturl(),
                    status=resp.status,
                    headers=dict(resp.headers.items()),
                    body=body,
                    ttfb=ttfb,
                    elapsed=elapsed,
                    truncated=truncated,
                )
        except urllib.error.HTTPError as exc:
            body = b""
            try:
                body = exc.read()
            except OSError:
                pass
            last_error = HttpError(
                f"HTTP {exc.code} for {url}", status=exc.code, url=url, body=body
            )
            if exc.code not in _RETRY_STATUS or attempt >= retries:
                raise last_error from None
            retry_after = exc.headers.get("Retry-After") if exc.headers else None
            delay = float(retry_after) if retry_after and retry_after.isdigit() else 0.8 * (attempt + 1)
            time.sleep(min(delay, 8.0))
        except (urllib.error.URLError, socket.timeout, TimeoutError, OSError) as exc:
            last_error = HttpError(f"请求失败 {url}: {exc}", url=url)
            if attempt >= retries:
                raise last_error from None
            time.sleep(0.8 * (attempt + 1))
    raise last_error or HttpError(f"请求失败 {url}", url=url)


def get_text(url: str, **kwargs: Any) -> str:
    return request(url, **kwargs).text


def get_json(url: str, **kwargs: Any) -> Any:
    return request(url, **kwargs).json()


def head_bytes(url: str, count: int = 64, **kwargs: Any) -> bytes:
    """Read only the first ``count`` bytes (for format / alpha sniffing)."""
    headers = dict(kwargs.pop("headers", {}) or {})
    headers.setdefault("Range", f"bytes=0-{max(0, count - 1)}")
    resp = request(url, headers=headers, max_bytes=count, retries=0, **kwargs)
    return resp.body[:count]


def png_has_alpha(url: str, **kwargs: Any) -> bool | None:
    """Cheap remote alpha check: True/False, or None when it is not a PNG."""
    from . import raster  # local import keeps the module dependency one-way

    try:
        head = head_bytes(url, 64, **kwargs)
    except HttpError:
        return None
    if not head.startswith(b"\x89PNG\r\n\x1a\n"):
        return None
    info = raster.sniff(head)
    return info.get("has_alpha")
