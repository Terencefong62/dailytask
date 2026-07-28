#!/usr/bin/env python3
"""Resize an image to 1600x900 without stretching (aspect ratio preserved)."""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image

TARGET_SIZE = (1600, 900)


def resize_cover(image: Image.Image, size: tuple[int, int] = TARGET_SIZE) -> Image.Image:
    """Scale to cover the target frame, then center-crop. No distortion."""
    target_w, target_h = size
    src_w, src_h = image.size
    scale = max(target_w / src_w, target_h / src_h)
    resized = image.resize(
        (round(src_w * scale), round(src_h * scale)),
        Image.Resampling.LANCZOS,
    )
    left = (resized.width - target_w) // 2
    top = (resized.height - target_h) // 2
    return resized.crop((left, top, left + target_w, top + target_h))


def resize_contain(
    image: Image.Image,
    size: tuple[int, int] = TARGET_SIZE,
    background: tuple[int, int, int] = (255, 255, 255),
) -> Image.Image:
    """Scale to fit inside the target frame with padding. No distortion."""
    target_w, target_h = size
    src_w, src_h = image.size
    scale = min(target_w / src_w, target_h / src_h)
    resized = image.resize(
        (round(src_w * scale), round(src_h * scale)),
        Image.Resampling.LANCZOS,
    )
    canvas = Image.new("RGB", size, background)
    left = (target_w - resized.width) // 2
    top = (target_h - resized.height) // 2
    canvas.paste(resized, (left, top))
    return canvas


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path)
    parser.add_argument(
        "-o",
        "--output",
        type=Path,
        help="Output path (default: source stem + -1600x900.png)",
    )
    parser.add_argument(
        "--mode",
        choices=("cover", "contain"),
        default="cover",
        help="cover = center crop to fill; contain = fit with padding",
    )
    args = parser.parse_args()

    image = Image.open(args.source).convert("RGB")
    output = args.output or args.source.with_name(f"{args.source.stem}-1600x900.png")

    result = resize_cover(image) if args.mode == "cover" else resize_contain(image)
    result.save(output, "PNG", optimize=True)
    print(f"Wrote {output} ({result.size[0]}x{result.size[1]}, mode={args.mode})")


if __name__ == "__main__":
    main()
