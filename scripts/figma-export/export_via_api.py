#!/usr/bin/env python3
"""Export Figma Slides to PDF via REST API (requires FIGMA_ACCESS_TOKEN)."""

from __future__ import annotations

import io
import os
import sys
import time
from pathlib import Path

import requests
from PIL import Image

FILE_KEY = "fzzMkZ4FCXIGXeduFtkpZ5"
API = "https://api.figma.com/v1"
BATCH = 25
SCALE = 2
OUT = Path("/workspace/exports/LKK-Delivery.pdf")


def hdr(token: str) -> dict[str, str]:
    return {"X-Figma-Token": token}


def collect_slides(doc: dict) -> list[dict]:
    slides: list[dict] = []

    def walk(node: dict, row: int | None = None, col: int | None = None) -> None:
        t = node.get("type")
        if t == "SLIDE_ROW":
            for i, child in enumerate(node.get("children") or []):
                walk(child, row=row, col=i)
            return
        if t == "SLIDE_GRID":
            for i, child in enumerate(node.get("children") or []):
                if child.get("type") == "SLIDE_ROW":
                    walk(child, row=i)
                elif child.get("type") == "SLIDE":
                    walk(child, row=i, col=0)
            return
        if t == "SLIDE":
            slides.append(
                {
                    "id": node["id"],
                    "name": node.get("name", ""),
                    "row": row if row is not None else 9999,
                    "col": col if col is not None else 0,
                    "skipped": bool(node.get("isSkippedSlide")),
                }
            )
            return
        for child in node.get("children") or []:
            walk(child, row=row, col=col)

    walk(doc)
    slides.sort(key=lambda s: (s["row"], s["col"], s["name"]))
    active = [s for s in slides if not s["skipped"]]
    return active or slides


def main() -> None:
    token = os.environ.get("FIGMA_ACCESS_TOKEN")
    if not token:
        sys.exit(2)

    file_json = requests.get(f"{API}/files/{FILE_KEY}", headers=hdr(token), timeout=120).json()
    slides = collect_slides(file_json["document"])
    ids = [s["id"] for s in slides]

    urls: dict[str, str | None] = {}
    for i in range(0, len(ids), BATCH):
        batch = ids[i : i + BATCH]
        r = requests.get(
            f"{API}/images/{FILE_KEY}",
            headers=hdr(token),
            params={
                "ids": ",".join(batch),
                "format": "png",
                "scale": SCALE,
                "use_absolute_bounds": "true",
            },
            timeout=180,
        ).json()
        urls.update(r.get("images") or {})
        time.sleep(0.4)

    images: list[Image.Image] = []
    for s in slides:
        url = urls.get(s["id"])
        if not url:
            continue
        data = requests.get(url, timeout=120).content
        images.append(Image.open(io.BytesIO(data)).convert("RGB"))

    OUT.parent.mkdir(parents=True, exist_ok=True)
    images[0].save(OUT, "PDF", save_all=True, append_images=images[1:], resolution=300.0)
    print(OUT, len(images))


if __name__ == "__main__":
    main()
