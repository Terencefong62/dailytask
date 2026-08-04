#!/usr/bin/env python3
"""Crawl preview-web.lkk.com sitemaps and extract URL, title, and meta description."""

from __future__ import annotations

import re
import sys
import xml.etree.ElementTree as ET
from concurrent.futures import ThreadPoolExecutor, as_completed
from html import unescape
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

BASE = "https://preview-web.lkk.com"
SITEMAP_INDEX = f"{BASE}/sitemap.xml"
NS = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
USER_AGENT = "Mozilla/5.0 (compatible; LKKMetaCrawler/1.0)"
TIMEOUT = 20


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
    # Fallback without namespace
    if not urls:
        for loc in root.iter():
            if loc.tag.endswith("loc") and loc.text:
                urls.append(loc.text.strip())
    return urls


def collect_page_urls() -> list[str]:
    index_xml = fetch(SITEMAP_INDEX)
    sitemap_urls = parse_sitemap_urls(index_xml)
    page_urls: list[str] = []
    for sm_url in sitemap_urls:
        page_urls.extend(parse_sitemap_urls(fetch(sm_url)))
    # Stable dedupe while preserving order
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


def crawl_url(url: str) -> tuple[str, str, str, str]:
    try:
        html = fetch(url)
        title, desc = extract_meta(html)
        return url, title, desc, ""
    except HTTPError as exc:
        return url, "", "", f"HTTP {exc.code}"
    except URLError as exc:
        return url, "", "", str(exc.reason)
    except Exception as exc:  # noqa: BLE001
        return url, "", "", str(exc)


def escape_cell(value: str) -> str:
    return value.replace("|", "\\|").replace("\n", " ").strip()


def main() -> None:
    urls = collect_page_urls()
    results: list[tuple[str, str, str, str]] = []

    with ThreadPoolExecutor(max_workers=8) as executor:
        futures = {executor.submit(crawl_url, url): url for url in urls}
        for future in as_completed(futures):
            results.append(future.result())

    results.sort(key=lambda row: row[0])

    print(f"Found {len(results)} URLs in sitemaps.\n")
    print("| URL | Meta Title | Meta Description |")
    print("| --- | --- | --- |")
    for url, title, desc, error in results:
        if error:
            print(f"| {escape_cell(url)} | ERROR | {escape_cell(error)} |")
        else:
            print(f"| {escape_cell(url)} | {escape_cell(title)} | {escape_cell(desc)} |")


if __name__ == "__main__":
    main()
