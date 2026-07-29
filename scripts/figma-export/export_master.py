#!/usr/bin/env python3
"""Best-effort Figma Slides -> PDF exporter.

Tries, in order:
1) Figma REST API render (needs FIGMA_ACCESS_TOKEN)
2) Instructs operator if token missing

Usage:
  FIGMA_ACCESS_TOKEN=... python3 export_master.py
"""

from __future__ import annotations

import json
import os
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
OUT = Path("/workspace/exports/LKK-Delivery.pdf")
FILE_KEY = "fzzMkZ4FCXIGXeduFtkpZ5"


def main() -> int:
    token = os.environ.get("FIGMA_ACCESS_TOKEN", "").strip()
    if not token:
        print(
            "Missing FIGMA_ACCESS_TOKEN.\n"
            "Create at https://www.figma.com/settings → Security → Personal access tokens\n"
            "Store as a Runtime Secret named FIGMA_ACCESS_TOKEN in your cloud environment.\n"
            "Then run: FIGMA_ACCESS_TOKEN=figd_... python3 export_master.py\n\n"
            "Note: Collab/Viewer seats are limited to ~6 Tier-1 API calls/month.\n"
            "Use a Full or Dev seat token for automated exports, or export manually in Figma.",
            file=sys.stderr,
        )
        return 2

    env = os.environ.copy()
    env["FIGMA_ACCESS_TOKEN"] = token
    rc = subprocess.call([sys.executable, str(ROOT / "export_via_api.py")], env=env)
    if rc == 0 and OUT.exists():
        mb = OUT.stat().st_size / (1024 * 1024)
        print(f"Exported {OUT} ({mb:.2f} MB)")
        return 0
    return rc or 1


if __name__ == "__main__":
    raise SystemExit(main())
