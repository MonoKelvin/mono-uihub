"""Terminal output helpers. No rich, no tabulate — CJK-safe line layout."""

from __future__ import annotations

import json
import os
import sys
from typing import Any

from .models import Asset, Saved

def _tty() -> bool:
    return sys.stdout.isatty() and not os.environ.get("NO_COLOR")


def paint(text: str, code: str) -> str:
    return f"\033[{code}m{text}\033[0m" if _tty() else text


def dim(text: str) -> str:
    return paint(text, "2")


def bold(text: str) -> str:
    return paint(text, "1")


def green(text: str) -> str:
    return paint(text, "32")


def yellow(text: str) -> str:
    return paint(text, "33")


def red(text: str) -> str:
    return paint(text, "31")


def cyan(text: str) -> str:
    return paint(text, "36")


def warn(message: str) -> None:
    print(yellow("! ") + message)


def error(message: str) -> None:
    print(red("× ") + message, file=sys.stderr)


def info(message: str) -> None:
    print(dim("· ") + message)


def dump_json(value: Any) -> None:
    print(json.dumps(value, ensure_ascii=False, indent=2))


def asset_line(index: int, asset: Asset) -> None:
    title = asset.title or asset.id or "(untitled)"
    print(f"{cyan(str(index).rjust(2))}. {bold(title)}")
    bits = [asset.source]
    if asset.label:
        bits.append(asset.label)
    if asset.license:
        bits.append(asset.license)
    print("    " + dim(" · ".join(bits)))
    print("    " + asset.url)
    if asset.page:
        print("    " + dim(asset.page))


def saved_line(saved: Saved) -> None:
    bits = [saved.fmt.upper()]
    if saved.width and saved.height:
        bits.append(f"{saved.width}×{saved.height}")
    if saved.has_alpha is True:
        bits.append("alpha")
    if saved.stripped_bg:
        bits.append("已去底")
    if saved.savings > 0:
        bits.append(f"-{saved.savings * 100:.0f}%")
    print(green("✓ ") + saved.path)
    print("  " + dim(" · ".join(bits) + f" · {saved.bytes // 1024}KB"))


def license_note(asset: Asset) -> None:
    if asset.commercial is False:
        warn(f"{asset.license or '该来源'}：禁止商用，仅限原型演示。{asset.attribution}")
    elif asset.attribution:
        info(f"来源：{asset.attribution}")
