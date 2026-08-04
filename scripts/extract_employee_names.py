#!/usr/bin/env python3
"""Extract employee display names from LKK employee story pages."""

from __future__ import annotations

import re
from concurrent.futures import ThreadPoolExecutor, as_completed
from html import unescape
from urllib.request import Request, urlopen

BASE = "https://preview-web.lkk.com"
SLUGS = [
    "adam-ho",
    "cheng-chiu-ming",
    "cheng-wei-yan",
    "gong-min",
    "jiang-zhi",
    "lau-fung-ying-christine",
    "mark-butzke",
    "mauricio-olmedo",
    "ng-seow-voon-miko",
    "ou-yang-tong",
    "tony-mok",
    "wei-gang",
    "wen-wen",
    "wu-zhi-gang-jacky",
    "yip-wai-chuen",
    "zhao-xiao-min",
]
USER_AGENT = "Mozilla/5.0 (compatible; LKKEmployeeCrawler/1.0)"


def fetch(url: str) -> str:
    req = Request(url, headers={"User-Agent": USER_AGENT})
    with urlopen(req, timeout=20) as resp:
        return resp.read().decode("utf-8", errors="replace")


def extract_display_name(html: str) -> str:
    # Breadcrumb JSON-LD last ListItem name (employee name)
    breadcrumb_names = re.findall(
        r'"@type":\s*"ListItem"[^}]*"name":\s*"([^"]+)"',
        html,
        flags=re.IGNORECASE | re.DOTALL,
    )
    skip = {
        "lkkGroup",
        "Home",
        "主頁",
        "Careers",
        "職業生涯",
        "职业发展",
        "Employee Stories",
        "員工故事",
        "员工故事",
    }
    for name in reversed(breadcrumb_names):
        if name not in skip:
            return unescape(name.strip())

    h2 = re.search(
        r'class="G33-basic-content-title[^"]*"[^>]*>([^<]+)<',
        html,
        flags=re.IGNORECASE,
    )
    if h2:
        return unescape(h2.group(1).strip())

    title = re.search(r"<title[^>]*>(.*?)</title>", html, re.IGNORECASE | re.DOTALL)
    return unescape(title.group(1).strip()) if title else ""


def proposed_meta_title(locale: str, name: str) -> str:
    if locale == "zh-hk":
        return f"{name} | 員工故事 | 李錦記企業"
    if locale == "zh-cn":
        return f"{name} | 员工故事 | 李锦记企业"
    return f"{name} | Employee Stories | Lee Kum Kee Corporate"


def main() -> None:
    rows: list[dict[str, str]] = []
    tasks = []
    for slug in SLUGS:
        for locale in ("en", "zh-hk", "zh-cn"):
            url = f"{BASE}/{locale}/employee/{slug}"
            tasks.append((slug, locale, url))

    def work(item: tuple[str, str, str]) -> dict[str, str]:
        slug, locale, url = item
        html = fetch(url)
        current_title = ""
        m = re.search(r"<title[^>]*>(.*?)</title>", html, re.IGNORECASE | re.DOTALL)
        if m:
            current_title = unescape(re.sub(r"\s+", " ", m.group(1)).strip())
        name = extract_display_name(html)
        return {
            "slug": slug,
            "locale": locale,
            "url": url,
            "extracted_name": name,
            "current_meta_title": current_title,
            "proposed_meta_title": proposed_meta_title(locale, name),
        }

    with ThreadPoolExecutor(max_workers=8) as ex:
        futures = [ex.submit(work, t) for t in tasks]
        for fut in as_completed(futures):
            rows.append(fut.result())

    rows.sort(key=lambda r: (r["slug"], r["locale"]))

    print("| Slug | Locale | Extracted Name | Current Meta Title | Proposed Meta Title |")
    print("| --- | --- | --- | --- | --- |")
    for r in rows:
        def esc(s: str) -> str:
            return s.replace("|", "\\|")

        print(
            f"| {esc(r['slug'])} | {r['locale']} | {esc(r['extracted_name'])} | "
            f"{esc(r['current_meta_title'])} | {esc(r['proposed_meta_title'])} |"
        )


if __name__ == "__main__":
    main()
