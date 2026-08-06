#!/usr/bin/env python3
"""Shared helpers for Lee Kum Kee metadata scripts."""

from __future__ import annotations

import re
from html import unescape
from urllib.request import Request, urlopen


BASE = "https://preview-web.lkk.com"
LOCALES = ("en", "zh-hk", "zh-cn")
EMPLOYEE_SLUGS = (
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
)

SKIPPED_BREADCRUMB_NAMES = {
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


def fetch(url: str, user_agent: str, timeout: int = 20) -> str:
    req = Request(url, headers={"User-Agent": user_agent})
    with urlopen(req, timeout=timeout) as resp:
        return resp.read().decode("utf-8", errors="replace")


def normalize_whitespace(text: str) -> str:
    return re.sub(r"\s+", " ", unescape(text)).strip()


def extract_title(html: str) -> str:
    title = re.search(r"<title[^>]*>(.*?)</title>", html, re.IGNORECASE | re.DOTALL)
    return normalize_whitespace(title.group(1)) if title else ""


def extract_employee_name(html: str) -> str:
    names = re.findall(
        r'"@type":\s*"ListItem"[^}]*"name":\s*"([^"]+)"',
        html,
        flags=re.IGNORECASE | re.DOTALL,
    )
    for name in reversed(names):
        if name not in SKIPPED_BREADCRUMB_NAMES:
            return unescape(name.strip())

    h2 = re.search(
        r'class="G33-basic-content-title[^"]*"[^>]*>([^<]+)<',
        html,
        flags=re.IGNORECASE,
    )
    if h2:
        return unescape(h2.group(1).strip())

    return extract_title(html)
