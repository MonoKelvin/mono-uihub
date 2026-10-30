"""图片格式转换与压缩 —— JPG/PNG/GIF → WebP。

参考 monokelvin.studio 的 optimize-images.mjs 单副本策略：

    每张图片最多保留一种格式：
      · 原图 ≤ --threshold KB 且不需要透明 → 保留为原格式（零重编码损耗）；
      · 否则 → 转为 WebP（有 alpha 则保留 alpha）；
      · 同主名其它格式文件被删除，保持单副本。

Pillow 是**可选**依赖：如果未安装，转换功能自动降级为「跳过并告知」，
resource-getter 的其它功能完全不受影响。这是故意的 —— 该工具主线
（搜索/热链/下载/SVG 处理）坚持零第三方依赖；WebP 转换是锦上添花的
瘦身步骤。

``convert_bytes`` / ``convert_path`` 是可供 CLI 及下载链路嵌入的核心。
``has_pillow`` 让调用方在降级前做出明确选择。
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any

from . import raster

# 转换目标格式集合。注意不把 webp 当「源图」输入 —— 它本身就是产物。
SOURCE_EXT = {"jpg", "jpeg", "png", "gif"}
# 下载后清理「同主名其它格式」时删掉的扩展名。
SIBLING_EXT = ("jpg", "jpeg", "png", "gif", "webp", "avif")

DEFAULT_QUALITY = 85
DEFAULT_THRESHOLD_KB = 64
# 小图不值得转 WebP：体积收益微，还增加一次重编码。
DEFAULT_MIN_SIZE = 4 * 1024


@dataclass
class ConvertResult:
    """单张图片转换的决策结果。"""

    action: str       # keep / convert / skip
    from_fmt: str
    to_fmt: str
    bytes: int        # 最终文件体积
    data: bytes | None = None  # 转换后字节（仅 convert 时有值）
    width: int = 0
    height: int = 0
    has_alpha: bool | None = None
    savings: float = 0.0  # 相比原图压缩掉的比例 (0..1)


def has_pillow() -> bool:
    try:
        import PIL  # noqa: F401
        return True
    except ImportError:
        return False


def _sniff_fmt(data: bytes, fallback: str = "") -> str:
    return raster.sniff(data).get("fmt") or fallback


def decide(
    data: bytes,
    *,
    quality: int = DEFAULT_QUALITY,
    threshold_kb: int = DEFAULT_THRESHOLD_KB,
    force_webp: bool = False,
    keep_small: bool = True,
    has_alpha: bool | None = None,
) -> str:
    """返回 'keep' 或 'webp' —— 不写盘，只做格式决策。

    规则（与 Node 版 optimize-images.mjs 保持一致）:

      · force_webp → 始终 'webp'
      · 来自 GIF → 视为动图时保留原格式（静态 WebP 丢失帧）
      · 原图 ≤ threshold KB 且无 alpha → 'keep'
      · 否则 → 'webp'
    """
    from_fmt = _sniff_fmt(data)
    size_kb = len(data) / 1024
    if force_webp:
        return "webp"
    if from_fmt == "gif":
        return "keep"
    alpha = has_alpha if has_alpha is not None else raster.sniff(data).get("has_alpha")
    if keep_small and size_kb <= threshold_kb and not alpha:
        return "keep"
    return "webp"


def _to_webp(data: bytes, quality: int, has_alpha: bool | None) -> bytes:
    """使用 Pillow 把 JPG/PNG/GIF 字节 → WebP 字节。"""
    import io

    Image = __import__("PIL.Image", fromlist=["Image"])
    img = Image.open(io.BytesIO(data))
    img.load()
    if img.mode in ("P", "LA") or (has_alpha and img.mode != "RGBA"):
        img = img.convert("RGBA")
    buf_io = io.BytesIO()
    img.save(buf_io, format="WEBP", quality=quality, method=6)
    return buf_io.getvalue()


def convert_bytes(
    data: bytes,
    *,
    out: Path | None = None,
    quality: int = DEFAULT_QUALITY,
    threshold_kb: int = DEFAULT_THRESHOLD_KB,
    force_webp: bool = False,
    keep_small: bool = True,
    strip_alpha: bool = False,
) -> ConvertResult:
    """在内存中完成一次转换，返回决策结果。

    若 ``out`` 给定则写入文件；否则 ``result.data`` 包含转换后字节，
    交给调用方决定落盘位置。
    """
    info = raster.sniff(data)
    from_fmt = info.get("fmt", "")
    if not from_fmt or from_fmt not in SOURCE_EXT:
        return ConvertResult(
            action="skip", from_fmt=from_fmt, to_fmt=from_fmt, bytes=len(data), data=data,
        )

    if not has_pillow():
        return ConvertResult(
            action="skip", from_fmt=from_fmt, to_fmt=from_fmt, bytes=len(data), data=data,
        )

    target = decide(
        data, quality=quality, threshold_kb=threshold_kb,
        force_webp=force_webp, keep_small=keep_small,
        has_alpha=info.get("has_alpha"),
    )

    if target == "keep":
        result_data = data
        if out is not None:
            out.parent.mkdir(parents=True, exist_ok=True)
            out.write_bytes(data)
            _cleanup_siblings(out, target=from_fmt)
        return ConvertResult(
            action="keep", from_fmt=from_fmt, to_fmt=from_fmt, bytes=len(data),
            data=result_data,
            width=info.get("width", 0), height=info.get("height", 0),
            has_alpha=info.get("has_alpha"),
        )

    # target == "webp"
    webp_data = _to_webp(data, quality, info.get("has_alpha") if not strip_alpha else False)
    savings = (1 - len(webp_data) / len(data)) if len(data) else 0.0

    if out is not None:
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_bytes(webp_data)
        _cleanup_siblings(out, target="webp")

    return ConvertResult(
        action="convert", from_fmt=from_fmt, to_fmt="webp",
        bytes=len(webp_data), data=webp_data,
        width=info.get("width", 0), height=info.get("height", 0),
        has_alpha=info.get("has_alpha"), savings=savings,
    )


def convert_path(
    src: Path,
    *,
    dst: Path | None = None,
    quality: int = DEFAULT_QUALITY,
    threshold_kb: int = DEFAULT_THRESHOLD_KB,
    force_webp: bool = False,
    strip_alpha: bool = False,
) -> ConvertResult:
    """转换一个磁盘文件。``dst`` 缺省时就地改扩展名为 .webp。"""
    src = src.resolve()
    if not src.exists():
        raise FileNotFoundError(src)
    data = src.read_bytes()
    final_dst = dst or src.with_suffix(".webp")
    return convert_bytes(
        data, out=final_dst, quality=quality, threshold_kb=threshold_kb,
        force_webp=force_webp, strip_alpha=strip_alpha,
    )


def _cleanup_siblings(owner: Path, *, target: str) -> int:
    """删除 ``owner`` 同主名、不同扩展名的兄弟文件（单副本维护）。"""
    removed = 0
    for ext in SIBLING_EXT:
        if ext == target:
            continue
        sib = owner.with_suffix(f".{ext}")
        if sib.exists() and sib.resolve() != owner.resolve():
            try:
                sib.unlink()
                removed += 1
            except OSError:
                pass
        for alt in owner.parent.glob(f"{owner.stem}-*.{ext}"):
            try:
                alt.unlink()
                removed += 1
            except OSError:
                pass
    return removed
