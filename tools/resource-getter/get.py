#!/usr/bin/env python3
"""Entry point. Run from anywhere:

    python tools/resource-getter/get.py --help
"""

from __future__ import annotations

import sys
from pathlib import Path

TOOL_ROOT = Path(__file__).resolve().parent
if str(TOOL_ROOT) not in sys.path:
    sys.path.insert(0, str(TOOL_ROOT))

from lib.cli import main  # noqa: E402  (path bootstrap must run first)

if __name__ == "__main__":
    raise SystemExit(main())
