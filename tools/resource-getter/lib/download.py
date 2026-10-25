"""Download, post-process, and atomically write an asset."""

from __future__ import annotations

import os
import re
import unicodedata
from pathlib import Path

from . import http, raster, svg
from .models import Asset, Saved

MAX_BYTES = 25 * 1024 * 1024


def slugify(value: str, fallback: str = "asset") -> str:
    value = unicodedata.normalize("NFKC", value or "").strip().lower()
    value = re.sub(r"[^a-z0-9\u4e00-\u9fff]+", "-", value).strip("-")
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


def save_bytes(
    data: bytes,
    *,
    out: Path,
    fmt: str = "",
    strip_bg: bool = False,
    recolor: dict[str, str] | None = None,
    sanitize: bool = True,
    force: bool = False,
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

    path = out
    if not path.suffix:
        path = path.with_suffix("." + fmt)
    if path.exists() and not force:
        path = _unique(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.with_name(path.name + ".part")
    temp.write_bytes(data)
    os.replace(temp, path)

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
    target = out_dir / f"{stem}.{fmt}" if fmt else out_dir / stem
    return save_bytes(
        resp.body,
        out=target,
        fmt=fmt,
        strip_bg=strip_bg,
        recolor=recolor,
        sanitize=sanitize,
        force=force,
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
        source_url=url,
        license_text=license_text,
    )
