#!/usr/bin/env python3
"""Update employee meta titles/descriptions and export Excel with cols E/F."""

from __future__ import annotations

import argparse
import csv
import re
from pathlib import Path

import openpyxl
from openpyxl.styles import Font

from lkk_meta_utils import (
    BASE,
    EMPLOYEE_SLUGS,
    LOCALES,
    extract_employee_name,
    fetch,
    normalize_whitespace,
)

USER_AGENT = "LKKEmployeeMeta/1.0"
MAX_DESC = 155

BRAND = {
    "en": "Lee Kum Kee",
    "zh-hk": "李錦記",
    "zh-cn": "李锦记",
}
SECTION = {
    "en": "Employee Stories",
    "zh-hk": "員工故事",
    "zh-cn": "员工故事",
}
CORP = {
    "en": "Lee Kum Kee Corporate",
    "zh-hk": "李錦記企業",
    "zh-cn": "李锦记企业",
}


def extract_employee_fields(html: str) -> tuple[str, str, str]:
    name = extract_employee_name(html)

    role = ""
    role_m = re.search(
        r'class="G33-basic-content-date"[^>]*>([^<]+)<',
        html,
        flags=re.IGNORECASE,
    )
    if role_m:
        role = normalize_whitespace(role_m.group(1))

    intro = ""
    intro_m = re.search(
        r'class="G33-basic-content-intro"[^>]*>([^<]+)<',
        html,
        flags=re.IGNORECASE,
    )
    if intro_m:
        intro = normalize_whitespace(intro_m.group(1))

    return name, role, intro


def proposed_title(locale: str, name: str) -> str:
    return f"{name} | {SECTION[locale]} | {CORP[locale]}"


def proposed_description(locale: str, name: str, role: str, intro: str) -> str:
    if locale == "en":
        lead = (
            f"{name}, {role} at {BRAND[locale]}."
            if name and role
            else f"{name} — {BRAND[locale]}."
        )
        text = f"{lead} {intro}".strip() if intro else lead
    else:
        role_fragment = f"{role}，" if role else ""
        lead = f"{name}，{role_fragment}分享在{BRAND[locale]}的工作故事。"
        text = f"{lead}{intro}" if intro else lead

    text = normalize_whitespace(text)
    if len(text) > MAX_DESC:
        text = text[: MAX_DESC - 1].rstrip() + "…"
    return text


def build_employee_updates() -> dict[str, tuple[str, str]]:
    updates: dict[str, tuple[str, str]] = {}
    for slug in EMPLOYEE_SLUGS:
        for locale in LOCALES:
            url = f"{BASE}/{locale}/employee/{slug}"
            html = fetch(url, USER_AGENT)
            name, role, intro = extract_employee_fields(html)
            title = proposed_title(locale, name)
            desc = proposed_description(locale, name, role, intro)
            updates[url] = (title, desc)
    return updates


def load_crawl_rows(path: Path) -> list[dict[str, str]]:
    with path.open(encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f))


def write_crawl_csv(rows: list[dict[str, str]], path: Path) -> None:
    fields = ["Language", "URL", "Meta Title", "Meta Description", "Error"]
    with path.open("w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fields, quoting=csv.QUOTE_ALL)
        writer.writeheader()
        writer.writerows(rows)


def write_excel(rows: list[dict[str, str]], path: Path) -> None:
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Meta Crawl"

    headers = [
        "Language",  # A
        "URL",  # B
        "Page Type",  # C
        "Slug",  # D
        "Meta Title",  # E
        "Meta Description",  # F
        "Error",  # G
    ]
    ws.append(headers)
    for cell in ws[1]:
        cell.font = Font(bold=True)

    for row in rows:
        url = row["URL"]
        slug = ""
        page_type = ""
        if "/employee/" in url:
            page_type = "Employee Story"
            slug = url.split("/employee/")[-1]
        ws.append(
            [
                row["Language"],
                url,
                page_type,
                slug,
                row["Meta Title"],
                row["Meta Description"],
                row.get("Error", ""),
            ]
        )

    for col in ("A", "B", "E", "F"):
        ws.column_dimensions[col].width = 28
    ws.column_dimensions["B"].width = 55
    ws.column_dimensions["F"].width = 60

    wb.save(path)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--crawl",
        type=Path,
        default=Path("exports/lkk_meta_crawl.csv"),
        help="Input/output crawl CSV path",
    )
    parser.add_argument(
        "--excel",
        type=Path,
        default=Path("exports/lkk_meta_crawl.xlsx"),
        help="Output Excel path",
    )
    args = parser.parse_args()

    rows = load_crawl_rows(args.crawl)
    updates = build_employee_updates()

    changed = 0
    for row in rows:
        url = row["URL"]
        if url in updates:
            title, desc = updates[url]
            row["Meta Title"] = title
            row["Meta Description"] = desc
            changed += 1

    write_crawl_csv(rows, args.crawl)
    write_excel(rows, args.excel)
    print(f"Updated {changed} employee rows")
    print(f"CSV: {args.crawl}")
    print(f"Excel: {args.excel} (Meta Title=col E, Meta Description=col F)")


if __name__ == "__main__":
    main()
