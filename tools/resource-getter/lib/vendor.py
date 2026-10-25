"""Reference-style vendoring for third-party helpers.

Source is cloned into ``vendor/<name>/`` and ignored by git; only
``vendor/manifest.json`` pins the repo and commit. The one thing we need from
pixiv-mcp-server is ``get_token.py``: an interactive PKCE flow that writes
``PIXIV_REFRESH_TOKEN`` into our ``.env``.

Nothing here runs at search/download time — :mod:`sources.pixiv` calls the
official App API directly.
"""

from __future__ import annotations

import importlib.util
import json
import os
import shutil
import subprocess
import sys
from datetime import date
from pathlib import Path
from typing import Any

from .paths import TOOL_ROOT

VENDOR_ROOT = TOOL_ROOT / "vendor"
PIXIV_DIR = VENDOR_ROOT / "pixiv-mcp-server"
PIXIV_REPO = "https://github.com/222wcnm/pixiv-mcp-server"
MANIFEST = VENDOR_ROOT / "manifest.json"
ENV_FILE = TOOL_ROOT / ".env"


class VendorError(RuntimeError):
    pass


def _run(
    cmd: list[str],
    *,
    cwd: Path | None = None,
    check: bool = True,
    capture: bool = True,
) -> subprocess.CompletedProcess[str]:
    try:
        proc = subprocess.run(
            cmd,
            cwd=str(cwd) if cwd else None,
            text=True,
            capture_output=capture,
            check=False,
        )
    except FileNotFoundError as exc:
        raise VendorError(f"未找到命令 {cmd[0]}，请先安装 Git。") from exc
    if check and proc.returncode != 0:
        detail = (proc.stderr or proc.stdout or "").strip().splitlines()
        tail = "\n".join(detail[-4:]) if detail else f"exit {proc.returncode}"
        raise VendorError(f"命令失败：{' '.join(cmd)}\n{tail}")
    return proc


def pixiv_present() -> bool:
    return (PIXIV_DIR / ".git").exists() and (PIXIV_DIR / "get_token.py").is_file()


def pixiv_commit() -> str:
    if not pixiv_present():
        return ""
    return _run(["git", "rev-parse", "HEAD"], cwd=PIXIV_DIR).stdout.strip()


def write_manifest() -> dict[str, Any]:
    try:
        data: dict[str, Any] = json.loads(MANIFEST.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        data = {}
    commit = pixiv_commit()
    data["pixiv-mcp-server"] = {
        "repo": PIXIV_REPO,
        "commit": commit,
        "short": commit[:7],
        "license": "MIT",
        "purpose": "One-time Pixiv OAuth refresh-token acquisition (get_token.py)",
        "fetched_at": date.today().isoformat(),
    }
    VENDOR_ROOT.mkdir(parents=True, exist_ok=True)
    MANIFEST.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return data["pixiv-mcp-server"]


def ensure_pixiv(*, update: bool = False) -> Path:
    """Clone if missing, optionally fast-forward, then refresh the manifest."""
    if pixiv_present():
        if update:
            _run(["git", "pull", "--ff-only"], cwd=PIXIV_DIR)
            write_manifest()
        return PIXIV_DIR

    if PIXIV_DIR.exists() and any(PIXIV_DIR.iterdir()):
        raise VendorError(
            f"{PIXIV_DIR} 已存在但不是完整的 pixiv-mcp-server checkout。\n"
            "请删除该目录后重试，或手动执行 git clone。"
        )

    VENDOR_ROOT.mkdir(parents=True, exist_ok=True)
    _run(
        ["git", "clone", "--depth", "1", PIXIV_REPO, str(PIXIV_DIR)],
        cwd=VENDOR_ROOT,
    )
    write_manifest()
    return PIXIV_DIR


def read_env_value(env_file: Path, key: str) -> str:
    try:
        for line in env_file.expanduser().read_text(encoding="utf-8-sig").splitlines():
            raw = line.strip()
            if raw.startswith("export "):
                raw = raw[7:].lstrip()
            if raw.startswith(f"{key}="):
                value = raw.split("=", 1)[1].strip()
                if len(value) >= 2 and value[0] == value[-1] and value[0] in ("'", '"'):
                    value = value[1:-1]
                return value
    except OSError:
        pass
    return ""


def run_token_helper(
    env_file: Path = ENV_FILE,
    *,
    insecure: bool = False,
    update: bool = False,
) -> int:
    """Run the upstream interactive helper; inherits stdin/stdout."""
    ensure_pixiv(update=update)
    script = PIXIV_DIR / "get_token.py"
    target = env_file.expanduser().resolve()
    target.parent.mkdir(parents=True, exist_ok=True)

    tail = [str(script), "--env-file", str(target)]
    if insecure:
        tail.append("--insecure")

    uv = shutil.which("uv")
    if uv:
        cmd = [uv, "run", "--no-project", "--with", "requests", "python", *tail]
    elif importlib.util.find_spec("requests") is not None:
        cmd = [sys.executable, *tail]
    else:
        raise VendorError(
            "需要 uv（推荐）或当前 Python 已安装 requests。\n"
            "安装 uv：https://docs.astral.sh/uv/ ；或 pip install requests"
        )

    print(f"  runner  {os.path.basename(cmd[0]).lower()}")
    print(f"  repo    {PIXIV_DIR}")
    print(f"  commit  {pixiv_commit()[:7]}")
    print(f"  target  {target}")
    print("")
    sys.stdout.flush()
    return subprocess.run(cmd, cwd=str(PIXIV_DIR), check=False).returncode


def status() -> dict[str, Any]:
    present = pixiv_present()
    manifest: dict[str, Any] = {}
    try:
        manifest = json.loads(MANIFEST.read_text(encoding="utf-8")).get("pixiv-mcp-server", {})
    except (OSError, ValueError):
        pass
    return {
        "present": present,
        "path": str(PIXIV_DIR),
        "repo": PIXIV_REPO,
        "commit": pixiv_commit() if present else manifest.get("commit", ""),
        "manifest_commit": manifest.get("commit", ""),
        "license": "MIT",
    }
