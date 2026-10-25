"""SVG post-processing: strip the baked-in background, recolour, sanitise.

Why this exists
---------------
"Free SVG illustration" sites often ship a full-bleed rounded rectangle behind
the artwork (unDraw does exactly this: a 640×640 path filled ``#f8f8f8``). That
turns a cutout-style illustration into a card with a hard rectangular edge,
which is precisely what the UI skill forbids.

``strip_background`` removes at most one full-bleed shape from the top of the
drawing order. It is deliberately conservative: if it cannot prove the shape
covers the canvas, it leaves the SVG untouched.
"""

from __future__ import annotations

import re
import xml.etree.ElementTree as ET

SVG_NS = "http://www.w3.org/2000/svg"
XLINK_NS = "http://www.w3.org/1999/xlink"
ET.register_namespace("", SVG_NS)
ET.register_namespace("xlink", XLINK_NS)

_DRAWABLE = {"rect", "path", "circle", "ellipse", "polygon", "polyline"}
_SKIP_ANCESTORS = {
    "defs",
    "clippath",
    "mask",
    "marker",
    "pattern",
    "symbol",
    "style",
    "title",
    "desc",
    "metadata",
}
_HEX = re.compile(r"#([0-9a-fA-F]{6})\b")
_CMD = re.compile(r"([MmLlHhVvCcSsQqTtAaZz])([^MmLlHhVvCcSsQqTtAaZz]*)")
_NUM = re.compile(r"[-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?")


def _local(tag: str) -> str:
    return tag.rsplit("}", 1)[-1].lower()


def _num(el: ET.Element, name: str, default: float = 0.0) -> float:
    raw = el.get(name)
    if not raw:
        return default
    match = _NUM.search(raw)
    return float(match.group(0)) if match else default


def viewbox(root: ET.Element) -> tuple[float, float, float, float]:
    raw = root.get("viewBox") or root.get("viewbox")
    if raw:
        parts = [p for p in re.split(r"[\s,]+", raw.strip()) if p]
        if len(parts) == 4:
            try:
                return tuple(float(p) for p in parts)  # type: ignore[return-value]
            except ValueError:
                pass
    return 0.0, 0.0, _num(root, "width", 0.0), _num(root, "height", 0.0)


def _points_bbox(values: list[float]) -> tuple[float, float, float, float] | None:
    if len(values) < 2:
        return None
    xs = values[0::2]
    ys = values[1::2]
    return min(xs), min(ys), max(xs), max(ys)


def _path_bbox(d: str) -> tuple[float, float, float, float] | None:
    """Approximate absolute bounding box of a path.

    Handles M/L/H/V/C/S/Q/T/A and Z, absolute and relative. Control points are
    included, so the box may be slightly larger than the true ink — harmless for
    the "does it cover the whole canvas?" test.
    """
    points: list[tuple[float, float]] = []
    cx = cy = sx = sy = 0.0
    for cmd, payload in _CMD.findall(d or ""):
        nums = [float(n) for n in _NUM.findall(payload)]
        rel = cmd.islower()
        op = cmd.upper()
        i = 0
        if op == "M":
            while i + 1 < len(nums):
                x, y = nums[i], nums[i + 1]
                if rel:
                    x, y = cx + x, cy + y
                cx, cy = x, y
                if i == 0:
                    sx, sy = x, y
                points.append((x, y))
                i += 2
        elif op == "L":
            while i + 1 < len(nums):
                x, y = nums[i], nums[i + 1]
                if rel:
                    x, y = cx + x, cy + y
                cx, cy = x, y
                points.append((x, y))
                i += 2
        elif op == "H":
            for value in nums:
                cx = cx + value if rel else value
                points.append((cx, cy))
                i += 1
        elif op == "V":
            for value in nums:
                cy = cy + value if rel else value
                points.append((cx, cy))
                i += 1
        elif op in ("C", "S", "Q"):
            step = 6 if op == "C" else 4
            while i + step - 1 < len(nums):
                for j in range(0, step, 2):
                    x, y = nums[i + j], nums[i + j + 1]
                    if rel:
                        x, y = cx + x, cy + y
                    points.append((x, y))
                cx, cy = points[-1]
                i += step
        elif op == "T":
            while i + 1 < len(nums):
                x, y = nums[i], nums[i + 1]
                if rel:
                    x, y = cx + x, cy + y
                cx, cy = x, y
                points.append((x, y))
                i += 2
        elif op == "A":
            while i + 6 < len(nums):
                x, y = nums[i + 5], nums[i + 6]
                if rel:
                    x, y = cx + x, cy + y
                cx, cy = x, y
                points.append((x, y))
                i += 7
        elif op == "Z":
            cx, cy = sx, sy
            points.append((cx, cy))
    if not points:
        return None
    xs = [p[0] for p in points]
    ys = [p[1] for p in points]
    return min(xs), min(ys), max(xs), max(ys)


def _style_value(el: ET.Element, prop: str) -> str | None:
    style = el.get("style") or ""
    for part in style.split(";"):
        if ":" in part:
            key, value = part.split(":", 1)
            if key.strip().lower() == prop:
                return value.strip()
    return None


def _fill(el: ET.Element) -> str:
    return (el.get("fill") or _style_value(el, "fill") or "").strip().lower()


def _paintable(el: ET.Element) -> bool:
    fill = _fill(el)
    if fill in ("none", "transparent"):
        return False
    opacity = el.get("opacity") or _style_value(el, "opacity") or "1"
    if _NUM.search(str(opacity)) and float(_NUM.search(str(opacity)).group(0)) == 0:  # type: ignore[union-attr]
        return False
    if (el.get("display") or "").lower() == "none":
        return False
    return True


def _bbox(el: ET.Element, vb: tuple[float, float, float, float]) -> tuple[float, float, float, float] | None:
    tag = _local(el.tag)
    if tag == "rect":
        def size(name: str, extent: float) -> float:
            raw = el.get(name)
            if raw and raw.strip().endswith("%"):
                try:
                    return extent * float(raw.strip()[:-1]) / 100.0
                except ValueError:
                    return 0.0
            return _num(el, name)

        x, y = size("x", vb[2]), size("y", vb[3])
        return x, y, x + size("width", vb[2]), y + size("height", vb[3])
    if tag == "circle":
        cx, cy, r = _num(el, "cx"), _num(el, "cy"), _num(el, "r")
        return cx - r, cy - r, cx + r, cy + r
    if tag == "ellipse":
        cx, cy = _num(el, "cx"), _num(el, "cy")
        rx, ry = _num(el, "rx"), _num(el, "ry")
        return cx - rx, cy - ry, cx + rx, cy + ry
    if tag in ("polygon", "polyline"):
        values = [float(n) for n in _NUM.findall(el.get("points") or "")]
        return _points_bbox(values)
    if tag == "path":
        return _path_bbox(el.get("d") or "")
    return None


def _is_fullbleed(el: ET.Element, vb: tuple[float, float, float, float]) -> bool:
    vx, vy, vw, vh = vb
    if vw <= 0 or vh <= 0 or not _paintable(el):
        return False
    box = _bbox(el, vb)
    if not box:
        return False
    x0, y0, x1, y1 = box
    tol_x, tol_y = vw * 0.03, vh * 0.03
    return (
        x0 <= vx + tol_x
        and y0 <= vy + tol_y
        and x1 >= vx + vw - tol_x
        and y1 >= vy + vh - tol_y
    )


def _ancestor_tags(root: ET.Element) -> dict[ET.Element, list[str]]:
    parents: dict[ET.Element, ET.Element] = {}
    for parent in root.iter():
        for child in parent:
            parents[child] = parent
    result: dict[ET.Element, list[str]] = {}
    for el in root.iter():
        tags: list[str] = []
        node = parents.get(el)
        while node is not None:
            tags.append(_local(node.tag))
            node = parents.get(node)
        result[el] = tags
    return result


def strip_background(text: str) -> tuple[str, bool]:
    """Remove the first full-bleed background shape, if one is provable."""
    try:
        root = ET.fromstring(text)
    except ET.ParseError:
        return text, False
    vb = viewbox(root)
    if vb[2] <= 0 or vb[3] <= 0:
        return text, False

    ancestors = _ancestor_tags(root)
    parents = {child: parent for parent in root.iter() for child in parent}
    drawables = [
        el
        for el in root.iter()
        if _local(el.tag) in _DRAWABLE
        and not any(tag in _SKIP_ANCESTORS for tag in ancestors.get(el, []))
    ]
    removed = 0
    for el in drawables[:4]:
        if _is_fullbleed(el, vb):
            parent = parents.get(el)
            if parent is not None:
                parent.remove(el)
                removed += 1
                if removed >= 2:  # a rect + a path stack is common; stop there
                    break
    if removed:
        body = ET.tostring(root, encoding="unicode")
        if text.lstrip().startswith("<?xml"):
            body = '<?xml version="1.0" encoding="UTF-8"?>\n' + body
        return body, True
    return text, False


def recolor(text: str, mapping: dict[str, str]) -> str:
    """Replace exact hex colours, e.g. ``{"#6c63ff": "#c8a24a"}``."""
    normal = {("#" + k.lstrip("#")).lower(): v for k, v in mapping.items()}

    def repl(match: re.Match[str]) -> str:
        key = "#" + match.group(1).lower()
        return normal.get(key, match.group(0))

    return _HEX.sub(repl, text)


def dominant_colors(text: str, top: int = 6) -> list[tuple[str, int]]:
    counts: dict[str, int] = {}
    for match in _HEX.finditer(text):
        key = "#" + match.group(1).lower()
        counts[key] = counts.get(key, 0) + 1
    return sorted(counts.items(), key=lambda item: item[1], reverse=True)[:top]


def sanitize(text: str) -> str:
    """Drop scripts and inline event handlers from third-party SVGs."""
    text = re.sub(r"<script\b.*?</script>", "", text, flags=re.S | re.I)
    text = re.sub(r"\son[a-z]+\s*=\s*(\"[^\"]*\"|'[^']*')", "", text, flags=re.I)
    text = re.sub(r"(href|xlink:href)\s*=\s*(\"javascript:[^\"]*\"|'javascript:[^']*')", "", text, flags=re.I)
    return text


def info(text: str) -> dict:
    from . import raster

    return raster.sniff(text.encode("utf-8"))
