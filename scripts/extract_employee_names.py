#!/usr/bin/env python3
"""Extract employee display names from LKK employee story pages."""

from __future__ import annotations

from concurrent.futures import ThreadPoolExecutor, as_completed

from lkk_meta_utils import (
    BASE,
    EMPLOYEE_SLUGS,
    LOCALES,
    extract_employee_name,
    extract_title,
    fetch,
)

USER_AGENT = "Mozilla/5.0 (compatible; LKKEmployeeCrawler/1.0)"


def proposed_meta_title(locale: str, name: str) -> str:
    if locale == "zh-hk":
        return f"{name} | 員工故事 | 李錦記企業"
    if locale == "zh-cn":
        return f"{name} | 员工故事 | 李锦记企业"
    return f"{name} | Employee Stories | Lee Kum Kee Corporate"


def main() -> None:
    rows: list[dict[str, str]] = []
    tasks = []
    for slug in EMPLOYEE_SLUGS:
        for locale in LOCALES:
            url = f"{BASE}/{locale}/employee/{slug}"
            tasks.append((slug, locale, url))

    def work(item: tuple[str, str, str]) -> dict[str, str]:
        slug, locale, url = item
        html = fetch(url, USER_AGENT)
        current_title = extract_title(html)
        name = extract_employee_name(html)
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
