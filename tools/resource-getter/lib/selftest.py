"""End-to-end smoke test for every source.

What it proves
--------------
For each provider: the search/build path returns at least one asset, the asset
resolves to a real image, and the bytes can be written and sniffed as PNG / JPEG
/ SVG. It does not try to judge aesthetics or semantic relevance — a random
Picsum photo will never be "a cat", and that is fine.

Defaults
--------
* one query per run, randomly picked from ``QUERY_POOL`` (or ``--query``);
* up to 2 files per source, written to ``tools/resource-getter/test-output/``;
* filenames are the source name: ``pixabay.png``, ``pixabay-2.png``, …
* a source that needs a missing credential is skipped, not failed;
* crawl sources fall back to a known-good term only when the query was random,
  so a manual ``--query`` failure is reported honestly.
"""

from __future__ import annotations

import random
import re
from pathlib import Path
from typing import Any

from . import download, env, raster, registry, ui
from .models import Asset
from .paths import TOOL_ROOT

QUERY_POOL = (
    "cat",
    "anime",
    "room",
    "work",
    "illustration",
    "developer",
    "coffee",
    "plant",
    "city",
    "music",
    "travel",
    "fox",
    "dog",
    "food",
    "nature",
    "robot",
)

# Optional API keys: when absent we still test the direct-link builder.
OPTIONAL_KEY = {
    "unsplash": "UNSPLASH_ACCESS_KEY",
    "pexels": "PEXELS_API_KEY",
}

# Fixed public ids used to exercise the direct-link path without an API key.
FIXED_ID = {
    "unsplash": "photo-1500530855697-b586d89ba3ee",
    "pexels": "1108099",
}

# Only used when the randomly chosen term has no hits; manual queries never fall back.
FALLBACK_QUERY = {
    "undraw": "developer",
    "storyset": "developer",
    "pngimg": "cat",
    "pixiv": "初音ミク",
}

SEARCH_SOURCES = {"pixabay", "undraw", "pngimg", "storyset", "pixiv"}

DEFAULT_OUT = TOOL_ROOT / "test-output"


def pick_query(
    query: str | None = None,
    pool: str | None = None,
    seed: int | None = None,
) -> dict[str, Any]:
    if query and query.strip():
        return {"value": query.strip(), "random": False, "pool_size": 1}
    items = [item.strip() for item in (pool or ",".join(QUERY_POOL)).split(",") if item.strip()]
    if not items:
        items = list(QUERY_POOL)
    rng = random.Random(seed)
    return {"value": rng.choice(items), "random": True, "pool_size": len(items)}


def _clean_source_files(out_dir: Path, name: str) -> None:
    for pattern in (f"{name}.*", f"{name}-*.*"):
        for path in out_dir.glob(pattern):
            if path.is_file() and re.match(rf"^{re.escape(name)}(-\d+)?\.[A-Za-z0-9]+$", path.name):
                try:
                    path.unlink()
                except OSError:
                    pass


def _strip_bg(asset: Asset) -> bool:
    return asset.fmt == "svg" and asset.transparent is not False


def _build_asset(source: Any, query: str) -> tuple[Asset, str]:
    name = source.NAME
    if name == "picsum":
        return source.build(width=800, height=600, seed=query), "build(seed)"
    if name == "placehold":
        return source.build(width=600, height=400, text=query), "build(text)"
    if name == "pravatar":
        return source.build(size=160, seed=query), "build(seed)"
    if name == "dicebear":
        return source.build(style="shapes", seed=query, size=256), "build(seed)"
    if name == "doodleipsum":
        return source.build(width=700, height=1000, style="avatar", transparent=True), "build(no-keyword)"
    if name in ("unsplash", "pexels"):
        width = 1200
        asset = source.build(photo_id=FIXED_ID[name], width=width)
        return asset, "build(direct)"
    raise RuntimeError(f"{name} 没有可用的测试构造方式")


def _search_assets(source: Any, query: str, limit: int) -> list[Asset]:
    return source.search(query, limit=max(2, limit * 2))


def _test_source(
    source: Any,
    *,
    query: str,
    random_query: bool,
    limit: int,
    out_dir: Path,
    timeout: float,
) -> dict[str, Any]:
    name = source.NAME
    result: dict[str, Any] = {
        "source": name,
        "status": "ok",
        "method": "",
        "query": query,
        "fallback": False,
        "files": [],
        "error": "",
        "license": getattr(source, "LICENSE", ""),
    }

    missing = [key for key in getattr(source, "REQUIRES_ENV", ()) if not env.get(key)]
    if missing:
        result.update(status="skip", error=f"缺少 {', '.join(missing)}")
        return result

    try:
        assets: list[Asset] = []
        method = ""
        if name in SEARCH_SOURCES:
            assets = _search_assets(source, query, limit)
            method = "search"
            if not assets and random_query and name in FALLBACK_QUERY:
                query = FALLBACK_QUERY[name]
                result["query"] = query
                result["fallback"] = True
                assets = _search_assets(source, query, limit)
                method = "search(fallback)"
        elif name in OPTIONAL_KEY and env.get(OPTIONAL_KEY[name]):
            try:
                assets = _search_assets(source, query, limit)
                method = "search"
            except Exception:
                assets = []
        if not assets:
            asset, method = _build_asset(source, query)
            assets = [asset]
        if not assets:
            result.update(status="skip", error=f"no results for '{query}'")
            return result

        _clean_source_files(out_dir, name)
        for index, asset in enumerate(assets[:limit], 1):
            if registry.supports(source, "resolve"):
                asset.url = source.resolve(asset)
            stem = name if index == 1 else f"{name}-{index}"
            saved = download.download(
                asset,
                out_dir=out_dir,
                name=stem,
                strip_bg=_strip_bg(asset),
                force=True,
                webp_force=False,
                timeout=timeout,
                referer=asset.meta.get("referer"),
            )
            path = Path(saved.path)
            data = path.read_bytes()
            info = raster.sniff(data)
            if not path.exists() or not data:
                raise RuntimeError("下载结果为空")
            if not info.get("fmt"):
                raise RuntimeError("无法识别的图片格式")
            result["files"].append(
                {
                    "path": str(path),
                    "bytes": saved.bytes,
                    "fmt": info.get("fmt", ""),
                    "width": info.get("width", 0),
                    "height": info.get("height", 0),
                    "has_alpha": info.get("has_alpha"),
                    "stripped_bg": saved.stripped_bg,
                    "source_url": saved.source_url,
                    "license": saved.license,
                }
            )
        result["method"] = method
    except Exception as exc:  # one bad source must not abort the run
        result.update(status="fail", error=str(exc))
    return result


def _print_result(result: dict[str, Any]) -> None:
    name = result["source"]
    if result["status"] == "skip":
        print(f"{ui.yellow('-')} {name:<12} skipped   {result['error']}")
        return
    if result["status"] == "fail":
        print(f"{ui.red('×')} {name:<12} failed    {result['error'][:160]}")
        return
    files = result["files"]
    total = sum(item["bytes"] for item in files)
    size_text = f"{total // 1024}KB" if total >= 1024 else f"{total}B"
    first = files[0] if files else {}
    dims = f"{first.get('width')}×{first.get('height')}" if first.get("width") else first.get("fmt", "").upper()
    query = result["query"] + (" (fallback)" if result["fallback"] else "")
    print(
        f"{ui.green('✓')} {name:<12} {result['method']:<17} "
        f"{len(files)} files  {size_text:<6} {dims:<12} {query}"
    )


def run(
    *,
    query: str,
    random_query: bool,
    limit: int = 2,
    out_dir: str | Path | None = None,
    timeout: float = 60.0,
    quiet: bool = False,
) -> dict[str, Any]:
    out = Path(out_dir) if out_dir else DEFAULT_OUT
    out.mkdir(parents=True, exist_ok=True)
    limit = max(1, min(5, int(limit)))

    results: list[dict[str, Any]] = []
    for source in registry.all_sources():
        result = _test_source(
            source,
            query=query,
            random_query=random_query,
            limit=limit,
            out_dir=out,
            timeout=timeout,
        )
        results.append(result)
        if not quiet:
            _print_result(result)

    ok = sum(1 for item in results if item["status"] == "ok")
    skipped = sum(1 for item in results if item["status"] == "skip")
    failed = sum(1 for item in results if item["status"] == "fail")
    files = sum(len(item["files"]) for item in results)
    summary = {
        "query": query,
        "random": random_query,
        "limit": limit,
        "out_dir": str(out),
        "ok": ok,
        "skipped": skipped,
        "failed": failed,
        "files": files,
        "results": results,
    }
    if not quiet:
        print("")
        line = f"{ok} ok · {skipped} skipped · {failed} failed · {files} files"
        print((ui.green(line) if failed == 0 else ui.yellow(line)) + f"  →  {out}")
    return summary
