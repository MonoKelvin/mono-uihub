"""Provider discovery.

Each source lives in exactly one file under ``sources/`` and is the single place
to edit when that site changes. This registry is intentionally dumb: add a name
to ``NAMES`` and the CLI / doctor pick it up.
"""

from __future__ import annotations

import importlib
from types import ModuleType

NAMES = (
    "pixabay",
    "undraw",
    "pngimg",
    "storyset",
    "doodleipsum",
    "pixiv",
    "picsum",
    "unsplash",
    "pexels",
    "placehold",
    "pravatar",
    "dicebear",
)


class SourceError(RuntimeError):
    pass


def load(name: str) -> ModuleType:
    key = name.strip().lower()
    if key not in NAMES:
        raise SourceError(f"未知来源 {name}；可选：{', '.join(NAMES)}")
    try:
        return importlib.import_module(f"sources.{key}")
    except Exception as exc:  # pragma: no cover - surface import problems clearly
        raise SourceError(f"加载来源 {key} 失败：{exc}") from exc


def all_sources() -> list[ModuleType]:
    result: list[ModuleType] = []
    for name in NAMES:
        try:
            result.append(load(name))
        except SourceError:
            continue
    return result


def supports(module: ModuleType, capability: str) -> bool:
    return callable(getattr(module, capability, None))
