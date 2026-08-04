#!/usr/bin/env python3
"""Crawl preview-web.lkk.com sitemaps and export URL, title, and meta description."""

from __future__ import annotations

import argparse
import csv
import re
import sys
import xml.etree.ElementTree as ET
from concurrent.futures import ThreadPoolExecutor, as_completed
from html import unescape
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

BASE = "https://preview-web.lkk.com"
SITEMAP_INDEX = f"{BASE}/sitemap.xml"
NS = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
USER_AGENT = "Mozilla/5.0 (compatible; LKKMetaCrawler/1.0)"
TIMEOUT = 20

LANGUAGE_SITEMAPS = [
    ("en", f"{BASE}/sitemap-lang.xml"),
    ("zh-hk", f"{BASE}/zh_HK/sitemap-lang.xml"),
    ("zh-cn", f"{BASE}/zh_CN/sitemap-lang.xml"),
]


def fetch(url: str) -> str:
    req = Request(url, headers={"User-Agent": USER_AGENT})
    with urlopen(req, timeout=TIMEOUT) as resp:
        return resp.read().decode("utf-8", errors="replace")


def parse_sitemap_urls(xml_text: str) -> list[str]:
    root = ET.fromstring(xml_text)
    urls: list[str] = []
    for loc in root.findall(".//sm:loc", NS):
        if loc.text:
            urls.append(loc.text.strip())
    if not urls:
        for loc in root.iter():
            if loc.tag.endswith("loc") and loc.text:
                urls.append(loc.text.strip())
    return urls


def detect_language(url: str) -> str:
    path = url.lower()
    if "/zh-hk/" in path or path.endswith("/zh-hk") or "/zh_hk/" in path:
        return "zh-hk"
    if "/zh-cn/" in path or path.endswith("/zh-cn") or "/zh_cn/" in path:
        return "zh-cn"
    if "/en/" in path or path.endswith("/en"):
        return "en"
    if "/home/" in path:
        return "en"
    return "unknown"


def collect_page_urls() -> list[str]:
    """Collect URLs from all language sitemaps (en, zh-hk, zh-cn)."""
    page_urls: list[str] = []
    for _lang, sitemap_url in LANGUAGE_SITEMAPS:
        page_urls.extend(parse_sitemap_urls(fetch(sitemap_url)))

    # Also include anything listed in the sitemap index (fallback).
    index_xml = fetch(SITEMAP_INDEX)
    for sm_url in parse_sitemap_urls(index_xml):
        if sm_url.endswith("sitemap-lang.xml"):
            continue
        page_urls.extend(parse_sitemap_urls(fetch(sm_url)))

    seen: set[str] = set()
    unique: list[str] = []
    for url in page_urls:
        if url not in seen:
            seen.add(url)
            unique.append(url)
    return sorted(unique)


def extract_meta(html: str) -> tuple[str, str]:
    title_match = re.search(r"<title[^>]*>(.*?)</title>", html, re.IGNORECASE | re.DOTALL)
    title = unescape(re.sub(r"\s+", " ", title_match.group(1)).strip()) if title_match else ""

    desc = ""
    for pattern in [
        r"<meta[^>]+name=[\"']description[\"'][^>]+content=[\"'](.*?)[\"']",
        r"<meta[^>]+content=[\"'](.*?)[\"'][^>]+name=[\"']description[\"']",
        r"<meta[^>]+property=[\"']og:description[\"'][^>]+content=[\"'](.*?)[\"']",
        r"<meta[^>]+content=[\"'](.*?)[\"'][^>]+property=[\"']og:description[\"']",
    ]:
        match = re.search(pattern, html, re.IGNORECASE | re.DOTALL)
        if match:
            desc = unescape(re.sub(r"\s+", " ", match.group(1)).strip())
            break

    return title, desc


def crawl_url(url: str) -> dict[str, str]:
    try:
        html = fetch(url)
        title, desc = extract_meta(html)
        return {
            "Language": detect_language(url),
            "URL": url,
            "Meta Title": title,
            "Meta Description": desc,
            "Error": "",
        }
    except HTTPError as exc:
        return {
            "Language": detect_language(url),
            "URL": url,
            "Meta Title": "",
            "Meta Description": "",
            "Error": f"HTTP {exc.code}",
        }
    except URLError as exc:
        return {
            "Language": detect_language(url),
            "URL": url,
            "Meta Title": "",
            "Meta Description": "",
            "Error": str(exc.reason),
        }
    except Exception as exc:  # noqa: BLE001
        return {
            "Language": detect_language(url),
            "URL": url,
            "Meta Title": "",
            "Meta Description": "",
            "Error": str(exc),
        }


def write_csv(rows: list[dict[str, str]], output_path: Path) -> None:
    fieldnames = ["Language", "URL", "Meta Title", "Meta Description", "Error"]
    with output_path.open("w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, quoting=csv.QUOTE_ALL)
        writer.writeheader()
        writer.writerows(rows)


def write_markdown(rows: list[dict[str, str]], output_path: Path) -> None:
    def esc(value: str) -> str:
        return value.replace("|", "\\|").replace("\n", " ").strip()

    lines = [
        f"Found {len(rows)} URLs across en, zh-hk, and zh-cn sitemaps.\n",
        "| Language | URL | Meta Title | Meta Description |",
        "| --- | --- | --- | --- |",
    ]
    for row in rows:
        if row["Error"]:
            lines.append(
                f"| {esc(row['Language'])} | {esc(row['URL'])} | ERROR | {esc(row['Error'])} |"
            )
        else:
            lines.append(
                f"| {esc(row['Language'])} | {esc(row['URL'])} | "
                f"{esc(row['Meta Title'])} | {esc(row['Meta Description'])} |"
            )
    output_path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "-o",
        "--output",
        type=Path,
        default=Path("exports/lkk_meta_crawl.csv"),
        help="Output CSV path (default: exports/lkk_meta_crawl.csv)",
    )
    parser.add_argument(
        "--markdown",
        type=Path,
        default=None,
        help="Optional markdown table output path",
    )
    args = parser.parse_args()

    urls = collect_page_urls()
    results: list[dict[str, str]] = []

    with ThreadPoolExecutor(max_workers=8) as executor:
        futures = [executor.submit(crawl_url, url) for url in urls]
        for future in as_completed(futures):
            results.append(future.result())

    results.sort(key=lambda row: (row["Language"], row["URL"]))

    args.output.parent.mkdir(parents=True, exist_ok=True)
    write_csv(results, args.output)

    if args.markdown:
        write_markdown(results, args.markdown)

    counts = {lang: 0 for lang in ("en", "zh-hk", "zh-cn", "unknown")}
    for row in results:
        counts[row["Language"]] = counts.get(row["Language"], 0) + 1

    print(f"Crawled {len(results)} URLs -> {args.output}")
    print(
        f"  en: {counts.get('en', 0)}, "
        f"zh-hk (Traditional Chinese): {counts.get('zh-hk', 0)}, "
        f"zh-cn (Simplified Chinese): {counts.get('zh-cn', 0)}"
    )
    if counts.get("unknown"):
        print(f"  unknown: {counts['unknown']}")


if __name__ == "__main__":
    main()
