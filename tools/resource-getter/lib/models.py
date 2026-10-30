"""The one data shape every provider returns."""

from __future__ import annotations

from dataclasses import asdict, dataclass, field
from typing import Any


@dataclass
class Asset:
    source: str
    id: str
    title: str
    url: str
    page: str = ""
    width: int = 0
    height: int = 0
    fmt: str = ""
    transparent: bool | None = None
    license: str = ""
    attribution: str = ""
    commercial: bool | None = None
    tags: list[str] = field(default_factory=list)
    meta: dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)

    @property
    def label(self) -> str:
        bits = []
        if self.fmt:
            bits.append(self.fmt.upper())
        if self.width and self.height:
            bits.append(f"{self.width}×{self.height}")
        if self.transparent:
            bits.append("透明底")
        return " · ".join(bits)


@dataclass
class Saved:
    path: str
    bytes: int
    fmt: str
    width: int = 0
    height: int = 0
    has_alpha: bool | None = None
    stripped_bg: bool = False
    source_url: str = ""
    license: str = ""
    savings: float = 0.0  # WebP 转换压缩比 (0..1)，0 表示未转换

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)
