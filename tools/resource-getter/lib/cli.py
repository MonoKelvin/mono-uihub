"""Command line interface for resource-getter.

Commands
--------
list                       source matrix (kind / transparency / license)
search  <source> <query>   search, print candidates, no download
get     <source> <target>  search or direct URL -> probe -> hot-link or download
url     <source>           build a URL-only asset (Doodle, DiceBear, Picsum, ...)
probe   <url>...           measure TTFB / read time and print the verdict
doctor                     env, reachability, cache and license warnings

The ``get`` default is ``--mode auto``: a fast origin is hot-linked; a slow one is
downloaded into ``ui/<page>/assets`` (requires ``--page`` or ``--out``).
"""

from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path
from typing import Any

from lib import download, env, http, probe, registry, selftest, ui, vendor, webp
from lib.models import Asset
from lib.paths import REPO_ROOT, TOOL_ROOT, page_assets

EXAMPLES = """\
examples:
  python tools/resource-getter/get.py doctor
  python tools/resource-getter/get.py search undraw "developer" --limit 5
  python tools/resource-getter/get.py get undraw "developer" --page my-page
  python tools/resource-getter/get.py search pixabay "fox" --type illustration --transparent
  python tools/resource-getter/get.py get pixabay "fox" --type illustration --transparent --page my-page
  python tools/resource-getter/get.py get pngimg "fox" --page my-page
  python tools/resource-getter/get.py get storyset "developer" --style rafiki --page my-page
  python tools/resource-getter/get.py url doodleipsum --width 700 --height 1244 --style avatar --page my-page
  python tools/resource-getter/get.py url dicebear --style shapes --seed mono --page my-page
  python tools/resource-getter/get.py probe https://cdn.undraw.co/illustration/donut-chart_1ike.svg
  python tools/resource-getter/get.py test
  python tools/resource-getter/get.py test --query "cat" --limit 2
  python tools/resource-getter/get.py test --pool "cat,anime,room,work" --seed 7
  python tools/resource-getter/get.py pixiv-login --fetch-only
  python tools/resource-getter/get.py pixiv-login
  python tools/resource-getter/get.py convert ui/my-page/assets --webp
"""


# ---------------------------------------------------------------------------
# argument helpers
# ---------------------------------------------------------------------------
def add_json(parser: argparse.ArgumentParser) -> None:
    parser.add_argument("--json", action="store_true", help="机器可读输出")


def add_search_opts(parser: argparse.ArgumentParser) -> None:
    parser.add_argument("--limit", type=int, default=12, help="返回数量，默认 12")
    parser.add_argument(
        "--image-type", "--type", dest="image_type", default="all",
        choices=("all", "photo", "illustration", "vector"),
        help="Pixabay 资源类型",
    )
    parser.add_argument("--orientation", help="Pixabay: horizontal / vertical")
    parser.add_argument("--category", help="Pixabay 分类")
    parser.add_argument("--colors", help="Pixabay 颜色过滤（transparent 也可）")
    parser.add_argument("--order", default="popular", help="Pixabay: popular / latest")
    parser.add_argument("--style", help="Storyset: amico/bro/cuate/pana/rafiki；Doodle 风格")
    parser.add_argument("--transparent", action="store_true", help="只要透明底 / 抠图资源")
    parser.add_argument("--no-safe", dest="safe", action="store_false", default=True, help="关闭安全过滤")


def add_output_opts(parser: argparse.ArgumentParser) -> None:
    parser.add_argument("--page", help="原型目录名：下载到 ui/<page>/assets")
    parser.add_argument("--out", help="输出目录或完整文件路径")
    parser.add_argument("--name", help="文件名（不含扩展名）")
    parser.add_argument("--force", action="store_true", help="覆盖同名文件")
    parser.add_argument("--strip-bg", dest="strip_bg", action="store_true", default=None,
                        help="强制去除 SVG 满幅背景")
    parser.add_argument("--no-strip-bg", dest="strip_bg", action="store_false",
                        help="保留 SVG 原背景")
    parser.add_argument("--recolor", help="SVG 换色，例如 #c8a24a")
    parser.add_argument("--from-color", help="配合 --recolor 指定被替换的颜色")
    parser.add_argument("--webp", action="store_true",
                        help="下载时转为 WebP（如 Pillow 缺失则跳过，保留原格式）")
    parser.add_argument("--no-webp", dest="webp", action="store_false",
                        help="关闭 WebP 转换")
    parser.set_defaults(webp=False)


def add_mode_opts(parser: argparse.ArgumentParser) -> None:
    parser.add_argument("--mode", choices=("auto", "hotlink", "download"), default="auto",
                        help="auto=探测后决定；hotlink=只输出 URL；download=落盘")
    parser.add_argument("--max-ttfb", type=float, default=probe.DEFAULT_MAX_TTFB,
                        help=f"热链 TTFB 上限（秒），默认 {probe.DEFAULT_MAX_TTFB}")
    parser.add_argument("--max-total", type=float, default=probe.DEFAULT_MAX_TOTAL,
                        help=f"热链读取耗时上限（秒），默认 {probe.DEFAULT_MAX_TOTAL}")


# ---------------------------------------------------------------------------
# shared operations
# ---------------------------------------------------------------------------
def _search(source: Any, query: str, args: argparse.Namespace) -> list[Asset]:
    if not registry.supports(source, "search"):
        raise registry.SourceError(f"{source.NAME} 不支持关键词搜索，请用 `url` 或 `get <url>`。")
    return source.search(
        query,
        limit=max(1, int(args.limit)),
        image_type=args.image_type,
        orientation=args.orientation,
        category=args.category,
        colors=args.colors,
        order=args.order,
        style=args.style,
        transparent=args.transparent,
        safe=args.safe,
    )


def _recolor_map(source: Any, args: argparse.Namespace) -> dict[str, str] | None:
    if not args.recolor:
        return None
    target = args.recolor if args.recolor.startswith("#") else "#" + args.recolor
    if hasattr(source, "recolor_map"):
        return source.recolor_map(target)
    if args.from_color:
        origin = args.from_color if args.from_color.startswith("#") else "#" + args.from_color
        return {origin.lower(): target}
    ui.warn("该来源没有默认主色；--recolor 需要配合 --from-color '#xxxxxx' 使用，已跳过换色。")
    return None


def _strip_bg(asset: Asset, args: argparse.Namespace) -> bool:
    if args.strip_bg is not None:
        return bool(args.strip_bg)
    return asset.fmt == "svg" and asset.transparent is not False


def _out_target(args: argparse.Namespace) -> tuple[Path | None, Path | None]:
    """Return ``(out_dir, explicit_file)``."""
    if args.out:
        path = Path(args.out).expanduser()
        if path.suffix:
            return path.parent, path
        return path, None
    if args.page:
        return page_assets(args.page), None
    return None, None


def _snippet(asset: Asset, saved_path: str | None = None, mode: str = "hotlink", page: str | None = None) -> str:
    if saved_path and mode == "download":
        path = Path(saved_path)
        if page:
            src = "./assets/" + path.name
        else:
            try:
                src = str(path.resolve().relative_to(Path.cwd().resolve())).replace("\\", "/")
            except ValueError:
                src = str(path).replace("\\", "/")
    else:
        src = asset.url
    alt = (asset.title or "asset").replace('"', "&quot;")
    return f'<img src="{src}" alt="{alt}" loading="lazy" />'


def _emit_asset(asset: Asset, args: argparse.Namespace, source: Any) -> dict[str, Any]:
    mode = args.mode
    resolved = source.resolve(asset, size="large") if registry.supports(source, "resolve") else asset.url
    asset.url = resolved
    if not args.json:
        ui.license_note(asset)

    result: dict[str, Any] = {"asset": asset.to_dict(), "mode": mode, "url": resolved}
    if mode == "hotlink":
        result["snippet"] = _snippet(asset, None, "hotlink")
        if not args.json:
            print(ui.green("→ ") + resolved)
            print("  " + ui.dim(result["snippet"]))
        return result

    measured = probe.probe(
        resolved,
        timeout=25,
        referer=asset.meta.get("referer"),
    )
    verdict = "download" if mode == "download" else probe.decide(
        measured, max_ttfb=args.max_ttfb, max_total=args.max_total
    )
    result["probe"] = measured.__dict__
    result["verdict"] = verdict
    if not args.json:
        print("  " + ui.dim("[probe] " + measured.line()))
        if verdict == "download" and mode == "auto":
            ui.info("判定：偏慢，改为本地下载")

    if verdict == "hotlink":
        result["snippet"] = _snippet(asset, None, "hotlink")
        if not args.json:
            print(ui.green("→ ") + resolved)
            print("  " + ui.dim(result["snippet"]))
        return result

    out_dir, explicit = _out_target(args)
    if out_dir is None:
        raise RuntimeError(
            "需要 --page <原型名> 或 --out <目录/文件> 才能下载。\n"
            f"例如：python tools/resource-getter/get.py get {source.NAME} \"...\" --page my-page"
        )

    recolor = _recolor_map(source, args)
    if explicit:
        saved = download.download_url(
            resolved,
            out=explicit,
            fmt=asset.fmt,
            strip_bg=_strip_bg(asset, args),
            recolor=recolor,
            force=args.force,
            webp_force=args.webp,
            referer=asset.meta.get("referer"),
            license_text=asset.license,
        )
    else:
        saved = download.download(
            asset,
            out_dir=out_dir,
            name=args.name,
            strip_bg=_strip_bg(asset, args),
            recolor=recolor,
            force=args.force,
            webp_force=args.webp,
            referer=asset.meta.get("referer"),
        )
    result["saved"] = saved.to_dict()
    result["snippet"] = _snippet(asset, saved.path, "download", page=args.page)
    if not args.json:
        ui.saved_line(saved)
        print("  " + ui.dim(result["snippet"]))
    return result


# ---------------------------------------------------------------------------
# commands
# ---------------------------------------------------------------------------
def cmd_list(args: argparse.Namespace) -> int:
    rows = []
    for source in registry.all_sources():
        rows.append(
            {
                "name": source.NAME,
                "kind": source.KIND,
                "transparent": getattr(source, "TRANSPARENT", ""),
                "license": getattr(source, "LICENSE", ""),
                "env": ", ".join(getattr(source, "REQUIRES_ENV", ())) or "-",
                "note": getattr(source, "NOTE", ""),
            }
        )
    if args.json:
        ui.dump_json(rows)
        return 0
    for row in rows:
        print(ui.bold(f"{row['name']:<12}") + ui.dim(f"{row['kind']:<7}") + f"  {row['note']}")
        print(f"            透明: {row['transparent']}  |  {row['license']}  |  需要: {row['env']}")
    return 0


def cmd_search(args: argparse.Namespace) -> int:
    source = registry.load(args.source)
    assets = _search(source, args.query, args)
    if not assets:
        ui.warn("没有结果。换关键词，或试试 --type illustration / --transparent。")
        if args.json:
            ui.dump_json([])
        return 1
    payload = []
    for index, asset in enumerate(assets, 1):
        item = {"index": index, **asset.to_dict()}
        if args.probe:
            measured = probe.probe(asset.url, timeout=20, referer=asset.meta.get("referer"))
            item["probe"] = measured.__dict__
        payload.append(item)
        if not args.json:
            ui.asset_line(index, asset)
            if args.probe:
                print("    " + ui.dim(measured.line()))
    if not args.json and any(asset.commercial is False for asset in assets):
        ui.warn(f"{source.LICENSE}：该来源禁止商用，仅限原型演示。")
    if args.json:
        ui.dump_json(payload)
    return 0


def cmd_get(args: argparse.Namespace) -> int:
    source = registry.load(args.source)
    target = args.target.strip()
    if target.startswith(("http://", "https://")):
        asset = source.from_url(target) if registry.supports(source, "from_url") else Asset(
            source=source.NAME,
            id=target.rsplit("/", 1)[-1],
            title=target.rsplit("/", 1)[-1],
            url=target,
            license=getattr(source, "LICENSE", ""),
        )
    else:
        args.limit = max(args.limit, args.pick)
        assets = _search(source, target, args)
        if not assets:
            ui.error(f"{source.NAME} 没有找到 “{target}”。")
            return 1
        if args.pick < 1 or args.pick > len(assets):
            ui.error(f"--pick 超出范围：1–{len(assets)}")
            return 1
        asset = assets[args.pick - 1]
        if not args.json:
            ui.asset_line(args.pick, asset)
    result = _emit_asset(asset, args, source)
    if args.json:
        ui.dump_json(result)
    return 0


def cmd_url(args: argparse.Namespace) -> int:
    source = registry.load(args.source)
    if not registry.supports(source, "build"):
        raise registry.SourceError(f"{source.NAME} 不支持 URL 生成，请用 `search` / `get`。")
    kwargs: dict[str, Any] = {
        "width": args.width,
        "height": args.height,
        "style": args.style,
        "seed": args.seed,
        "text": args.text,
        "bg": args.bg,
        "fg": args.fg,
        "fmt": args.format,
        "quality": args.quality,
        "radius": args.radius,
        "grayscale": args.grayscale,
        "blur": args.blur,
        "image_id": args.id,
        "photo_id": args.id,
    }
    if args.transparent is not None:
        kwargs["transparent"] = args.transparent
    asset = source.build(**kwargs)
    if not args.json:
        print(ui.bold(asset.title) + "  " + ui.dim(asset.label))
    result = _emit_asset(asset, args, source)
    if args.json:
        ui.dump_json(result)
    return 0


def cmd_probe(args: argparse.Namespace) -> int:
    results = []
    for url in args.urls:
        measured = probe.probe(
            url,
            max_bytes=args.max_bytes,
            timeout=args.timeout,
            referer=args.referer,
        )
        verdict = probe.decide(measured, max_ttfb=args.max_ttfb, max_total=args.max_total)
        results.append({"url": url, "verdict": verdict, **measured.__dict__})
        if not args.json:
            print(ui.bold(url))
            print("  " + measured.line() + "  →  " + ui.cyan(verdict))
    if args.json:
        ui.dump_json(results)
    return 0


def cmd_test(args: argparse.Namespace) -> int:
    picked = selftest.pick_query(args.query, args.pool, args.seed)
    result = selftest.run(
        query=picked["value"],
        random_query=picked["random"],
        limit=args.limit,
        out_dir=args.out,
        timeout=args.timeout,
        quiet=args.json,
    )
    if args.json:
        ui.dump_json(result)
    return 0 if result["failed"] == 0 else 1


def _verify_pixiv(token: str, args: argparse.Namespace) -> int:
    os.environ["PIXIV_REFRESH_TOKEN"] = token
    try:
        source = registry.load("pixiv")
        user_id = source.check(force=True)
    except Exception as exc:
        ui.error(f"Pixiv 验证失败：{exc}")
        return 1
    if args.json:
        ui.dump_json({"token": env.mask(token), "user_id": user_id, "verified": True})
    else:
        print(ui.green("✓ ") + f"Pixiv API 验证通过，user_id={user_id}")
    return 0


def cmd_pixiv_login(args: argparse.Namespace) -> int:
    env.load()  # export HTTPS_PROXY / HTTP_PROXY from .env to git, uv and requests
    target = Path(args.env_file).expanduser()

    if args.fetch_only:
        path = vendor.ensure_pixiv(update=args.update)
        commit = vendor.pixiv_commit()[:7]
        if args.json:
            ui.dump_json({"path": str(path), "commit": commit, **vendor.status()})
        else:
            print(ui.green("✓ ") + f"pixiv-mcp-server @ {commit}")
            print("  " + ui.dim(str(path)))
        return 0

    if args.verify_only:
        token = vendor.read_env_value(target, "PIXIV_REFRESH_TOKEN")
        if not token:
            ui.error(f"{target} 中没有 PIXIV_REFRESH_TOKEN。")
            return 1
        if not args.json:
            print(ui.dim(f"PIXIV_REFRESH_TOKEN={env.mask(token)}"))
        return _verify_pixiv(token, args)

    if not args.json:
        print(ui.bold("Pixiv refresh token"))
        ui.info("上游 get_token.py 会打开浏览器；按提示粘贴 callback URL 完成授权。")
    code = vendor.run_token_helper(target, insecure=args.insecure, update=args.update)
    if code != 0:
        ui.error(f"登录向导退出，exit={code}。未写入 token。")
        return code

    token = vendor.read_env_value(target, "PIXIV_REFRESH_TOKEN")
    if not token:
        ui.warn(f"向导结束，但 {target} 中没有 PIXIV_REFRESH_TOKEN（若刚才是主动退出，忽略即可）。")
        return 1
    if not args.json:
        print(ui.green("✓ ") + f"已写入 {target}")
        print("  " + ui.dim(f"PIXIV_REFRESH_TOKEN={env.mask(token)}"))

    if args.verify:
        return _verify_pixiv(token, args)
    if args.json:
        ui.dump_json({"token": env.mask(token), "verified": False})
    return 0


def cmd_doctor(args: argparse.Namespace) -> int:
    env.load()
    info: dict[str, Any] = {
        "python": sys.version.split()[0],
        "tool_root": str(TOOL_ROOT),
        "repo_root": str(REPO_ROOT),
        "env_files": {
            str(path): path.exists()
            for path in (REPO_ROOT / ".env", TOOL_ROOT / ".env", TOOL_ROOT / ".env.local")
        },
        "sources": [],
    }
    try:
        info["vendor"] = vendor.status()
    except Exception as exc:  # git missing / broken checkout should not kill doctor
        info["vendor"] = {"present": False, "error": str(exc)}
    if not args.json:
        print(ui.bold("resource-getter doctor"))
        print(f"  python  {info['python']}")
        print(f"  tool    {TOOL_ROOT}")
        print(f"  cache   {TOOL_ROOT / '.cache'}")
        vendor_info = info["vendor"]
        if vendor_info.get("present"):
            print(f"  vendor  pixiv-mcp-server @ {vendor_info.get('commit', '')[:7]}  {vendor_info.get('path', '')}")
        else:
            print(f"  vendor  pixiv-mcp-server 未拉取（pixiv-login --fetch-only）")
        print("")
    for source in registry.all_sources():
        row: dict[str, Any] = {
            "name": source.NAME,
            "kind": source.KIND,
            "license": getattr(source, "LICENSE", ""),
            "commercial": getattr(source, "COMMERCIAL", None),
            "requires": {},
        }
        for key in getattr(source, "REQUIRES_ENV", ()):
            value = env.get(key)
            row["requires"][key] = {"set": bool(value), "masked": env.mask(value)}
        if args.net and getattr(source, "PING_URL", ""):
            measured = probe.probe(source.PING_URL, max_bytes=64 * 1024, timeout=10)
            row["ping"] = {**measured.__dict__, "verdict": probe.decide(measured)}
        info["sources"].append(row)
        if not args.json:
            keys = ", ".join(
                f"{key}={'ok' if value['set'] else 'missing'}"
                for key, value in row["requires"].items()
            ) or "no key"
            line = f"  {source.NAME:<12} {source.KIND:<6} {keys}"
            print(line)
            if row.get("ping"):
                print("      " + ui.dim(row["ping"]["verdict"] + " · " + measured.line()))
            if getattr(source, "COMMERCIAL", None) is False:
                ui.warn(f"{source.NAME}: {getattr(source, 'LICENSE', '')} — 不可直接商用")
    if not args.json:
        print("")
        ui.info("第一次使用请复制 .env.example 为 .env，填入 PIXABAY_API_KEY 等凭据。")
    else:
        ui.dump_json(info)
    return 0


# ---------------------------------------------------------------------------
# commands: convert
# ---------------------------------------------------------------------------
def cmd_convert(args: argparse.Namespace) -> int:
    """批量转换目录下的 JPG/PNG/GIF → WebP，单副本维护。"""
    path = Path(args.path).expanduser()
    if not path.exists():
        ui.error(f"路径不存在：{path}")
        return 1

    files = []
    if path.is_file():
        files = [path]
    else:
        for root, _, names in os.walk(path):
            for name in names:
                if name.split(".")[-1].lower() in webp.SOURCE_EXT:
                    files.append(Path(root) / name)
    if not files:
        ui.warn("没有找到 jpg/png/gif 文件。")
        return 0

    threshold_kb = args.threshold
    force_webp = args.force_webp
    dry_run = args.dry_run
    total_before = 0
    total_after = 0
    webp_count = 0
    keep_count = 0
    skip_count = 0
    skipped_due_to_pillow = False

    if not webp.has_pillow():
        skipped_due_to_pillow = True
        ui.warn("未检测到 Pillow：跳过所有转换（已按原格式保留）。")
        ui.info("安装 Pillow 后可用 `pip install Pillow` 启用 WebP 转换。")

    for file in sorted(files):
        data = file.read_bytes()
        size_before = len(data)
        total_before += size_before
        result = webp.convert_bytes(
            data,
            out=None,
            quality=args.quality,
            threshold_kb=threshold_kb,
            force_webp=force_webp,
        )

        if result.action == "keep":
            keep_count += 1
            total_after += size_before
            if not args.json:
                print(f"  {ui.dim('KEEP')} {file}")
        elif result.action == "skip":
            skip_count += 1
            total_after += size_before
            if not args.json:
                print(f"  {ui.dim('SKIP')} {file}  ({ui.dim('格式不支持或 Pillow 缺失')})")
        else:  # convert
            if result.data is None:
                skip_count += 1
                total_after += size_before
                continue
            webp_count += 1
            total_after += len(result.data)
            dst = file.with_suffix(".webp")
            if not dry_run:
                file.parent.mkdir(parents=True, exist_ok=True)
                dst.write_bytes(result.data)
                webp._cleanup_siblings(dst, target="webp")
            if not args.json:
                saved_pct = f" -{result.savings * 100:.0f}%"
                size_kb = len(result.data) // 1024
                print(
                    f"  {ui.green('OK')} {dst}  ({ui.dim(f'{size_kb}KB')}{saved_pct})"
                )

    if not args.json:
        print("")
        print(
            f"处理 {len(files)} 张："
            f"{ui.green(f'{webp_count} → webp')}，"
            f"{ui.dim(f'{keep_count} 保留原格式')}，"
            f"{ui.dim(f'{skip_count} 跳过')}"
        )
        if total_before > 0:
            mb_before = total_before / 1024 / 1024
            mb_after = total_after / 1024 / 1024
            pct = (1 - total_after / total_before) * 100
            print(
                f"  原图合计 {mb_before:.1f}MB → 优化后 {mb_after:.1f}MB"
                f" ({ui.green(f'-{pct:.0f}%')})"
            )
        if skipped_due_to_pillow:
            print(f"  {ui.yellow('提示：安装 Pillow 可启用 WebP 转换: pip install Pillow')}")

    return 0


# ---------------------------------------------------------------------------
# parser
# ---------------------------------------------------------------------------
def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="resource-getter",
        description="为 UI 原型获取免费图片 / 矢量插画 / 抠图 PNG，并自动决定热链或本地下载。",
        epilog=EXAMPLES,
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    sub = parser.add_subparsers(dest="command", required=True)

    p = sub.add_parser("list", help="列出来源与许可")
    add_json(p)
    p.set_defaults(func=cmd_list)

    p = sub.add_parser("search", help="搜索资源，不下载")
    p.add_argument("source", choices=registry.NAMES)
    p.add_argument("query")
    add_search_opts(p)
    p.add_argument("--probe", action="store_true", help="对每条结果做延迟探测")
    add_json(p)
    p.set_defaults(func=cmd_search)

    p = sub.add_parser("get", help="搜索或直链 → 探测 → 热链/下载")
    p.add_argument("source", choices=registry.NAMES)
    p.add_argument("target", help="关键词或 http(s) URL")
    p.add_argument("--pick", type=int, default=1, help="选第几条搜索结果，默认 1")
    add_search_opts(p)
    add_output_opts(p)
    add_mode_opts(p)
    add_json(p)
    p.set_defaults(func=cmd_get)

    p = sub.add_parser("url", help="生成 URL 型资源（Doodle/DiceBear/Picsum/...）")
    p.add_argument("source", choices=registry.NAMES)
    p.add_argument("--width", type=int)
    p.add_argument("--height", type=int)
    p.add_argument("--style")
    p.add_argument("--seed")
    p.add_argument("--text")
    p.add_argument("--bg")
    p.add_argument("--fg")
    p.add_argument("--format", default="svg", choices=("svg", "png", "jpg", "webp"))
    p.add_argument("--id", help="Picsum image id / Unsplash photo id / Pexels photo id")
    p.add_argument("--quality", type=int, default=80)
    p.add_argument("--radius", type=int)
    p.add_argument("--grayscale", action="store_true")
    p.add_argument("--blur", type=int)
    p.add_argument("--transparent", dest="transparent", action="store_true", default=None)
    p.add_argument("--no-transparent", dest="transparent", action="store_false")
    add_output_opts(p)
    add_mode_opts(p)
    add_json(p)
    p.set_defaults(func=cmd_url)

    p = sub.add_parser("probe", help="探测 URL 的 TTFB 与读取耗时")
    p.add_argument("urls", nargs="+")
    p.add_argument("--max-bytes", type=int, default=256 * 1024)
    p.add_argument("--timeout", type=float, default=25)
    p.add_argument("--referer")
    p.add_argument("--max-ttfb", type=float, default=probe.DEFAULT_MAX_TTFB)
    p.add_argument("--max-total", type=float, default=probe.DEFAULT_MAX_TOTAL)
    add_json(p)
    p.set_defaults(func=cmd_probe)

    p = sub.add_parser("test", help="逐个来源抓取样本，验证搜索/下载链路")
    p.add_argument("--query", help="手动关键词；不传则从随机池抽取")
    p.add_argument("--pool", help="逗号分隔的随机池，例如 cat,anime,room,work")
    p.add_argument("--seed", type=int, help="随机种子，便于复现")
    p.add_argument("--limit", type=int, default=2, help="每个来源最多抓几张，默认 2")
    p.add_argument("--out", default=str(TOOL_ROOT / "test-output"), help="测试输出目录")
    p.add_argument("--timeout", type=float, default=60, help="单个下载超时（秒）")
    add_json(p)
    p.set_defaults(func=cmd_test)

    p = sub.add_parser("pixiv-login", help="拉取 pixiv-mcp-server 并获取 refresh token")
    p.add_argument("--fetch-only", action="store_true", help="只拉取/更新源码，不启动登录向导")
    p.add_argument("--update", action="store_true", help="git pull --ff-only 更新 vendor")
    p.add_argument("--insecure", action="store_true", help="跳过 TLS 校验（仅本地调试）")
    p.add_argument("--verify", action="store_true", help="登录写入后调用 Pixiv API 验证 token")
    p.add_argument("--verify-only", action="store_true", help="不启动向导，只验证 .env 中已有 token")
    p.add_argument("--env-file", default=str(TOOL_ROOT / ".env"), help="写入的 .env 路径")
    add_json(p)
    p.set_defaults(func=cmd_pixiv_login)

    p = sub.add_parser("doctor", help="检查凭据、连通性与许可")
    p.add_argument("--net", action="store_true", help="实际探测各来源入口")
    add_json(p)
    p.set_defaults(func=cmd_doctor)

    p = sub.add_parser("convert", help="将目录下的 JPG/PNG/GIF 批量转为 WebP（单副本）")
    p.add_argument("path", help="图片文件或目录（目录递归搜索）")
    p.add_argument("--quality", type=int, default=webp.DEFAULT_QUALITY,
                   help=f"WebP 质量 1-100，默认 {webp.DEFAULT_QUALITY}")
    p.add_argument("--threshold", type=int, default=webp.DEFAULT_THRESHOLD_KB,
                   help=f"自动模式下「很小」的阈值 KB，默认 {webp.DEFAULT_THRESHOLD_KB}")
    p.add_argument("--force-webp", action="store_true",
                   help="忽略体积/透明判断，强制全部转 WebP")
    p.add_argument("--dry-run", action="store_true", help="只预览，不写入或删除文件")
    add_json(p)
    p.set_defaults(func=cmd_convert)

    return parser


def main(argv: list[str] | None = None) -> int:
    if os.name == "nt":
        for stream in (sys.stdout, sys.stderr):
            try:
                stream.reconfigure(encoding="utf-8")
            except (AttributeError, OSError):
                pass
    parser = build_parser()
    args = parser.parse_args(argv)
    try:
        return int(args.func(args))
    except (registry.SourceError, env.MissingEnv, http.HttpError, RuntimeError, ValueError) as exc:
        ui.error(str(exc))
        return 1
    except KeyboardInterrupt:
        ui.error("已中断")
        return 130
