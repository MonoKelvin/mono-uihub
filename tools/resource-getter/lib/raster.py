"""Header-level image inspection — dimensions and alpha, without Pillow.

Only the first few hundred bytes are needed, which makes remote alpha checks
cheap: fetch 64 bytes of a PNG and read IHDR's colour type. This is what lets
``--transparent`` reject white-background JPEGs before downloading them.

Caveat: an RGBA PNG can still be fully opaque. We report "has an alpha channel",
not "visually transparent".
"""

from __future__ import annotations

import re
import struct


def _png(data: bytes) -> dict:
    if len(data) < 26 or data[:8] != b"\x89PNG\r\n\x1a\n":
        return {}
    width, height = struct.unpack(">II", data[16:24])
    color_type = data[25]
    has_alpha: bool | None
    if color_type in (4, 6):
        has_alpha = True
    elif color_type == 3:
        # Palette PNG: tRNS may live beyond the 64-byte probe window.
        has_alpha = True if b"tRNS" in data else None
    else:
        has_alpha = False
    return {"fmt": "png", "width": width, "height": height, "has_alpha": has_alpha}


def _jpeg(data: bytes) -> dict:
    if not data.startswith(b"\xff\xd8"):
        return {}
    i = 2
    while i + 9 < len(data):
        if data[i] != 0xFF:
            i += 1
            continue
        marker = data[i + 1]
        i += 2
        if marker in (0xD8, 0xD9) or 0xD0 <= marker <= 0xD7:
            continue
        if i + 1 >= len(data):
            break
        length = struct.unpack(">H", data[i : i + 2])[0]
        if marker in (0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7, 0xC9, 0xCA, 0xCB, 0xCD, 0xCE, 0xCF):
            if i + 7 <= len(data):
                height, width = struct.unpack(">HH", data[i + 3 : i + 7])
                return {"fmt": "jpg", "width": width, "height": height, "has_alpha": False}
            break
        i += max(length, 2)
    return {"fmt": "jpg", "has_alpha": False}


def _gif(data: bytes) -> dict:
    if not data.startswith((b"GIF87a", b"GIF89a")) or len(data) < 10:
        return {}
    width, height = struct.unpack("<HH", data[6:10])
    return {"fmt": "gif", "width": width, "height": height, "has_alpha": True}


def _webp(data: bytes) -> dict:
    if len(data) < 30 or data[:4] != b"RIFF" or data[8:12] != b"WEBP":
        return {}
    chunk = data[12:16]
    if chunk == b"VP8X":
        flags = data[20]
        width = 1 + int.from_bytes(data[24:27], "little")
        height = 1 + int.from_bytes(data[27:30], "little")
        return {"fmt": "webp", "width": width, "height": height, "has_alpha": bool(flags & 0x10)}
    if chunk == b"VP8L" and len(data) >= 25:
        bits = int.from_bytes(data[21:25], "little")
        width = (bits & 0x3FFF) + 1
        height = ((bits >> 14) & 0x3FFF) + 1
        return {"fmt": "webp", "width": width, "height": height, "has_alpha": bool((bits >> 28) & 1)}
    if chunk == b"VP8 " and len(data) >= 30 and data[23:26] == b"\x9d\x01\x2a":
        # Lossy VP8 frame header: sync code at +3, 14-bit width/height at +6.
        width, height = struct.unpack("<HH", data[26:30])
        return {"fmt": "webp", "width": width & 0x3FFF, "height": height & 0x3FFF, "has_alpha": False}
    return {"fmt": "webp", "has_alpha": None}


def _svg(data: bytes) -> dict:
    head = data[:4096].decode("utf-8", errors="ignore").lstrip("\ufeff \r\n\t")
    open_tag = re.search(r"<svg\b([^>]*)>", head, re.I)
    if not open_tag:
        return {}
    attrs = open_tag.group(1)
    width = re.search(r'\bwidth=["\']([\d.]+)', attrs)
    height = re.search(r'\bheight=["\']([\d.]+)', attrs)
    viewbox = re.search(r'viewBox=["\']([\d.\-\s,]+)["\']', attrs)
    w = int(float(width.group(1))) if width else 0
    h = int(float(height.group(1))) if height else 0
    if (not w or not h) and viewbox:
        parts = re.split(r"[\s,]+", viewbox.group(1).strip())
        if len(parts) == 4:
            try:
                w, h = int(float(parts[2])), int(float(parts[3]))
            except ValueError:
                pass
    return {"fmt": "svg", "width": w, "height": h, "has_alpha": True}


def sniff(data: bytes) -> dict:
    """Return ``{fmt, width, height, has_alpha}``; unknown formats give ``{}``."""
    for detector in (_png, _jpeg, _gif, _webp, _svg):
        info = detector(data)
        if info:
            info.setdefault("width", 0)
            info.setdefault("height", 0)
            info.setdefault("has_alpha", None)
            return info
    return {}


def ext_for(content_type: str) -> str:
    ctype = (content_type or "").split(";")[0].strip().lower()
    return {
        "image/png": "png",
        "image/jpeg": "jpg",
        "image/jpg": "jpg",
        "image/webp": "webp",
        "image/svg+xml": "svg",
        "image/gif": "gif",
        "image/avif": "avif",
    }.get(ctype, "")
