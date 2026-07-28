#!/usr/bin/env python3
"""Split a 3-panel composite image and export each panel at 1600x900 without overlaid text."""

from __future__ import annotations

import argparse
from pathlib import Path

import cv2
import numpy as np
from PIL import Image


TARGET_SIZE = (1600, 900)


def crop_to_16_9(image: Image.Image) -> Image.Image:
    width, height = image.size
    target_ratio = 16 / 9
    current_ratio = width / height

    if current_ratio > target_ratio:
        new_width = int(height * target_ratio)
        left = (width - new_width) // 2
        return image.crop((left, 0, left + new_width, height))

    if current_ratio < target_ratio:
        new_height = int(width / target_ratio)
        top = (height - new_height) // 2
        return image.crop((0, top, width, top + new_height))

    return image


def remove_overlaid_text(panel_bgr: np.ndarray) -> np.ndarray:
    """Remove large white title overlays and obvious wall slogan text via inpainting."""
    height, width = panel_bgr.shape[:2]
    mask = np.zeros((height, width), dtype=np.uint8)

    # Top-left title overlays are bright on a dark translucent band.
    title_region = panel_bgr[: int(height * 0.22), : int(width * 0.62)]
    title_gray = cv2.cvtColor(title_region, cv2.COLOR_BGR2GRAY)
    # White / near-white overlay text
    _, bright = cv2.threshold(title_gray, 210, 255, cv2.THRESH_BINARY)
    bright = cv2.dilate(bright, np.ones((5, 5), np.uint8), iterations=2)
    mask[: title_region.shape[0], : title_region.shape[1]] = np.maximum(
        mask[: title_region.shape[0], : title_region.shape[1]], bright
    )

    # Vertical red slogan text on the right wall in the welcome panel.
    right_region = panel_bgr[:, int(width * 0.78) :]
    right_hsv = cv2.cvtColor(right_region, cv2.COLOR_BGR2HSV)
    lower_red_1 = np.array([0, 80, 80])
    upper_red_1 = np.array([12, 255, 255])
    lower_red_2 = np.array([165, 80, 80])
    upper_red_2 = np.array([180, 255, 255])
    red_mask = cv2.inRange(right_hsv, lower_red_1, upper_red_1) | cv2.inRange(
        right_hsv, lower_red_2, upper_red_2
    )
    red_mask = cv2.dilate(red_mask, np.ones((3, 3), np.uint8), iterations=2)
    mask[:, int(width * 0.78) :] = np.maximum(mask[:, int(width * 0.78) :], red_mask)

    if not np.any(mask):
        return panel_bgr

    return cv2.inpaint(panel_bgr, mask, inpaintRadius=5, flags=cv2.INPAINT_TELEA)


def process_panel(panel: Image.Image) -> Image.Image:
    panel_bgr = cv2.cvtColor(np.array(panel.convert("RGB")), cv2.COLOR_RGB2BGR)
    cleaned = remove_overlaid_text(panel_bgr)
    cleaned_rgb = cv2.cvtColor(cleaned, cv2.COLOR_BGR2RGB)
    image = Image.fromarray(cleaned_rgb)
    image = crop_to_16_9(image)
    return image.resize(TARGET_SIZE, Image.Resampling.LANCZOS)


def split_panels(source: Image.Image) -> list[Image.Image]:
    width, height = source.size
    panel_height = height // 3
    # Avoid dropping pixels on images whose height is not divisible by 3.
    bounds = [
        (0, panel_height),
        (panel_height, panel_height * 2),
        (panel_height * 2, height),
    ]
    return [source.crop((0, top, width, bottom)) for top, bottom in bounds]


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path, help="Path to the 3-panel composite image")
    parser.add_argument(
        "-o",
        "--output-dir",
        type=Path,
        default=Path("exports"),
        help="Directory for exported PNG files",
    )
    args = parser.parse_args()

    source = Image.open(args.source)
    args.output_dir.mkdir(parents=True, exist_ok=True)

    names = [
        "01-interviews-assessment-1600x900.png",
        "02-welcome-1600x900.png",
        "03-start-your-story-1600x900.png",
    ]

    for panel, name in zip(split_panels(source), names, strict=True):
        output_path = args.output_dir / name
        process_panel(panel).save(output_path, "PNG", optimize=True)
        print(f"Wrote {output_path}")


if __name__ == "__main__":
    main()
