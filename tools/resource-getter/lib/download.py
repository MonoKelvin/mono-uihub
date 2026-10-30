"""Download, post-process, and atomically write an asset.

Post-processing pipeline (order):

    fetch bytes  →  SVG sanitize / strip-bg / recolor  →  WebP conversion  →  atomic write
    →  sibling cleanup (single-copy invariant)  →  return Saved
"""

from __future__ import annotations

import os
import re
import unicodedata
from pathlib import Path

from . import env, http, raster, svg, webp
from .models import Asset, Saved

MAX_BYTES = 25 * 1024 * 1024


def _webp_threshold() -> int:
    """WebP conversion threshold (KB), from RG_WEBP_THRESHOLD env var."""
    try:
        return int(env.get("RG_WEBP_THRESHOLD") or webp.DEFAULT_THRESHOLD_KB)
    except (TypeError, ValueError):
        return webp.DEFAULT_THRESHOLD_KB


def slugify(value: str, fallback: str = "asset") -> str:
    value = unicodedata.normalize("NFKC", value or "").strip().lower()
    value = re.sub(r"[^a-z0-9一-鿿]+", "-", value).strip("-")
    value = re.sub(r"-{2,}", "-", value)
    return value[:64] or fallback


def _unique(path: Path) -> Path:
    if not path.exists():
        return path
    for index in range(2, 1000):
        candidate = path.with_name(f"{path.stem}-{index}{path.suffix}")
        if not candidate.exists():
            return candidate
    raise RuntimeError(f"无法为 {path} 找到可用文件名")


def _final_bytes_and_fmt(
    data: bytes,
    fmt: str,
    *,
    webp_force: bool,
) -> tuple[bytes, str, float]:
    """Format decision + conversion after SVG processing, before write.

    Returns ``(final_bytes, final_fmt, savings_ratio)``.
    SVG is already text-decoded upstream, so it does not pass through here.
    """
    if fmt not in webp.SOURCE_EXT:
        return data, fmt, 0.0
    if not webp.has_pillow():
        return data, fmt, 0.0

    threshold_kb = _webp_threshold()
    result = webp.convert_bytes(
        data,
        out=None,
        quality=webp.DEFAULT_QUALITY,
        threshold_kb=threshold_kb,
        force_webp=webp_force,
    )
    if result.action == "convert" and result.data is not None:
        return result.data, "webp", result.savings
    return data, fmt, 0.0


def save_bytes(
    data: bytes,
    *,
    out: Path,
    fmt: str = "",
    strip_bg: bool = False,
    recolor: dict[str, str] | None = None,
    sanitize: bool = True,
    force: bool = False,
    webp_force: bool = False,
    source_url: str = "",
    license_text: str = "",
) -> Saved:
    fmt = (fmt or "").lower().lstrip(".")
    if not fmt:
        info = raster.sniff(data)
        fmt = info.get("fmt", "bin")

    stripped = False
    if fmt == "svg":
        text = data.decode("utf-8-sig", errors="replace")
        if sanitize:
            text = svg.sanitize(text)
        if strip_bg:
            text, stripped = svg.strip_background(text)
        if recolor:
            text = svg.recolor(text, recolor)
        data = text.encode("utf-8")

    # ---- WebP conversion ----
    data, fmt, savings = _final_bytes_and_fmt(data, fmt, webp_force=webp_force)

    path = out
    if not path.suffix:
        path = path.with_suffix("." + fmt)
    elif fmt == "webp" and path.suffix.lower().lstrip(".") not in ("webp",):
        # Force webp: correct extension to keep single-copy invariant.
        path = path.with_suffix(".webp")

    if path.exists() and not force:
        path = _unique(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.with_name(path.name + ".part")
    temp.write_bytes(data)
    os.replace(temp, path)

    # Single-copy: remove siblings with same stem, different ext.
    if fmt == "webp":
        webp._cleanup_siblings(path, target="webp")

    info = raster.sniff(data)
    return Saved(
        path=str(path),
        bytes=len(data),
        fmt=info.get("fmt", fmt),
        width=info.get("width", 0),
        height=info.get("height", 0),
        has_alpha=info.get("has_alpha"),
        stripped_bg=stripped,
        source_url=source_url,
        license=license_text,
        savings=savings,
    )


def download(
    asset: Asset,
    *,
    out_dir: Path,
    name: str | None = None,
    strip_bg: bool = False,
    recolor: dict[str, str] | None = None,
    sanitize: bool = True,
    force: bool = False,
    webp_force: bool = False,
    timeout: float = 60.0,
    referer: str | None = None,
) -> Saved:
    """Fetch an :class:`Asset` and write it under ``out_dir``."""
    referer = referer or asset.meta.get("referer")
    resp = http.request(
        asset.url,
        timeout=timeout,
        retries=2,
        referer=referer,
        max_bytes=MAX_BYTES,
    )
    ctype = resp.content_type
    if ctype and not ctype.startswith("image/") and ctype not in ("application/octet-stream", "binary/octet-stream"):
        preview = resp.body[:120].decode("utf-8", errors="replace").replace("\n", " ")
        raise http.HttpError(
            f"返回的不是图片（{ctype or 'unknown'}）：{preview}", url=asset.url
        )
    if resp.truncated:
        raise http.HttpError(f"文件超过 {MAX_BYTES // (1024 * 1024)}MB 上限：{asset.url}", url=asset.url)

    fmt = raster.sniff(resp.body).get("fmt") or asset.fmt or raster.ext_for(ctype)
    requested = name or asset.title or asset.id or "asset"
    if name and Path(name).suffix:
        requested = Path(name).stem
    stem = slugify(requested, fallback=asset.id or "asset")
    target = out_dir / f"{stem}.{fmt}"
    return save_bytes(
        resp.body,
        out=target,
        fmt=fmt,
        strip_bg=strip_bg,
        recolor=recolor,
        sanitize=sanitize,
        force=force,
        webp_force=webp_force,
        source_url=asset.url,
        license_text=asset.license,
    )


def download_url(
    url: str,
    *,
    out: Path,
    fmt: str = "",
    strip_bg: bool = False,
    recolor: dict[str, str] | None = None,
    sanitize: bool = True,
    force: bool = False,
    webp_force: bool = False,
    timeout: float = 60.0,
    referer: str | None = None,
    license_text: str = "",
) -> Saved:
    resp = http.request(url, timeout=timeout, retries=2, referer=referer, max_bytes=MAX_BYTES)
    return save_bytes(
        resp.body,
        out=out,
        fmt=fmt or raster.ext_for(resp.content_type),
        strip_bg=strip_bg,
        recolor=recolor,
        sanitize=sanitize,
        force=force,
        webp_force=webp_force,
        source_url=url,
        license_text=license_text,
    )
