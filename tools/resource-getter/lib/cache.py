"""Tiny TTL JSON cache (search results, static Doodle URLs, Pixiv tokens)."""

from __future__ import annotations

import json
import time
from pathlib import Path
from typing import Any

from .paths import CACHE_DIR


class JsonCache:
    def __init__(self, name: str, ttl: float = 24 * 3600) -> None:
        self.path = CACHE_DIR / name
        self.ttl = ttl

    def _read(self) -> dict[str, Any]:
        try:
            data = json.loads(self.path.read_text(encoding="utf-8"))
        except (OSError, ValueError):
            return {}
        return data if isinstance(data, dict) else {}

    def _write(self, data: dict[str, Any]) -> None:
        try:
            CACHE_DIR.mkdir(parents=True, exist_ok=True)
            self.path.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
        except OSError:
            pass

    def get(self, key: str, default: Any = None) -> Any:
        item = self._read().get(key)
        if not isinstance(item, dict):
            return default
        if time.time() - item.get("ts", 0) > self.ttl:
            return default
        return item.get("value", default)

    def set(self, key: str, value: Any) -> None:
        data = self._read()
        data[key] = {"ts": time.time(), "value": value}
        self._write(data)

    def delete(self, key: str) -> None:
        data = self._read()
        if key in data:
            data.pop(key)
            self._write(data)

    def clear(self) -> None:
        try:
            self.path.unlink()
        except OSError:
            pass

    def path_for_display(self) -> Path:
        return self.path
