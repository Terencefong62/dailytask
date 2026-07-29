#!/usr/bin/env python3
"""Export Figma Slides to PDF via Images API + cached slide IDs."""

from __future__ import annotations

import json
import os
import sys
import time
from pathlib import Path

import requests
from PIL import Image

FILE_KEY = "fzzMkZ4FCXIGXeduFtkpZ5"
API = "https://api.figma.com/v1"
SCALE = 2
OUT = Path("/workspace/exports/LKK-Delivery.pdf")
CACHE_DIR = Path("/workspace/exports/slide-pngs")
SLIDES_JSON = Path(__file__).resolve().parent / "active-slides.json"


def hdr(token: str) -> dict[str, str]:
    return {"X-Figma-Token": token}


def format_retry_after(seconds: int) -> str:
    if seconds >= 86400:
        days = seconds / 86400
        return f"{days:.1f} days"
    if seconds >= 3600:
        hours = seconds / 3600
        return f"{hours:.1f} hours"
    return f"{seconds} seconds"


def raise_rate_limit(response: requests.Response) -> None:
    retry_after = int(response.headers.get("Retry-After", "0") or 0)
    limit_type = response.headers.get("X-Figma-Rate-Limit-Type", "unknown")
    wait = format_retry_after(retry_after) if retry_after else "until the monthly quota resets"
    raise SystemExit(
        "Figma Images API rate limit exceeded (HTTP 429).\n"
        f"  Rate limit type: {limit_type}\n"
        f"  Retry after: {wait}\n\n"
        "Collab/Viewer seats on Enterprise are limited to ~6 Tier-1 API calls per month.\n"
        "Each export attempt consumes quota. Options:\n"
        "  1) Wait for quota reset, then rerun (script uses one API call for all slides).\n"
        "  2) Use a Full or Dev seat personal access token (20 req/min on Enterprise).\n"
        "  3) Export manually in Figma: File → Export slides to PDF.\n"
    )


def request_image_urls(token: str, ids: list[str]) -> dict[str, str | None]:
    for attempt in range(3):
        response = requests.get(
            f"{API}/images/{FILE_KEY}",
            headers=hdr(token),
            params={
                "ids": ",".join(ids),
                "format": "png",
                "scale": SCALE,
                "use_absolute_bounds": "true",
            },
            timeout=600,
        )
        if response.status_code == 429:
            raise_rate_limit(response)
        if response.status_code in {400, 500} and len(ids) > 1:
            mid = len(ids) // 2
            print(
                f"Batch of {len(ids)} failed ({response.status_code}); splitting...",
                file=sys.stderr,
            )
            left = request_image_urls(token, ids[:mid])
            time.sleep(2)
            right = request_image_urls(token, ids[mid:])
            left.update(right)
            return left
        response.raise_for_status()
        payload = response.json()
        if payload.get("err"):
            if len(ids) > 1:
                mid = len(ids) // 2
                print(f"Render error; splitting batch of {len(ids)}...", file=sys.stderr)
                left = request_image_urls(token, ids[:mid])
                time.sleep(2)
                right = request_image_urls(token, ids[mid:])
                left.update(right)
                return left
            raise RuntimeError(payload["err"])
        return payload.get("images") or {}
    raise RuntimeError("Failed to render slide images")


def download_pngs(slides: list[dict], urls: dict[str, str | None]) -> list[Path]:
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    paths: list[Path] = []
    for idx, slide in enumerate(slides, start=1):
        out = CACHE_DIR / f"{idx:03d}-{slide['name'].replace('/', '-')}.png"
        if out.exists() and out.stat().st_size > 1000:
            paths.append(out)
            continue
        url = urls.get(slide["id"])
        if not url:
            print(f"Missing render for slide {slide['name']} ({slide['id']})", file=sys.stderr)
            continue
        for attempt in range(4):
            try:
                data = requests.get(url, timeout=120).content
                out.write_bytes(data)
                paths.append(out)
                print(f"Downloaded {idx}/{len(slides)}: {slide['name']}")
                break
            except Exception as exc:
                wait = 3 * (attempt + 1)
                print(
                    f"Download retry {attempt + 1} for slide {slide['name']}: {exc}",
                    file=sys.stderr,
                )
                time.sleep(wait)
    return paths


def build_pdf(image_paths: list[Path], out: Path) -> None:
    images = [Image.open(p).convert("RGB") for p in image_paths]
    out.parent.mkdir(parents=True, exist_ok=True)
    images[0].save(out, "PDF", save_all=True, append_images=images[1:], resolution=300.0)


def main() -> None:
    token = os.environ.get("FIGMA_ACCESS_TOKEN", "").strip()
    if not token:
        sys.exit("Set FIGMA_ACCESS_TOKEN to a Figma personal access token.")

    slides = json.loads(SLIDES_JSON.read_text())
    ids = [s["id"] for s in slides]
    print(f"Exporting {len(slides)} slides via one Images API request...")
    urls = request_image_urls(token, ids)
    png_paths = download_pngs(slides, urls)
    if not png_paths:
        raise SystemExit("No slide images downloaded.")
    build_pdf(png_paths, OUT)
    mb = OUT.stat().st_size / (1024 * 1024)
    print(f"Wrote {OUT} ({len(png_paths)} pages, {mb:.1f} MB)")


if __name__ == "__main__":
    main()
