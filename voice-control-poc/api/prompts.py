import json
from typing import Any

from recipe_base import LOCALES


def build_transform_prompt(variant: str, locale: str) -> str:
    original = LOCALES.get(locale, LOCALES["zh-HK"])
    variant_rules = {
        "vegan": (
            "Replace all meat with plant-based alternatives. "
            "Replace oyster sauce with vegan oyster sauce or mushroom-based vegetarian sauce. "
            "No animal products."
        ),
        "healthy": (
            "Keep the same dish concept but reduce oil, sodium, and sugar. "
            "Lower oyster sauce and sugar amounts in marinade and seasoning. "
            "Prefer less oil when frying."
        ),
    }
    rule = variant_rules.get(variant, variant_rules["vegan"])

    return f"""You are a Lee Kum Kee recipe editor. Transform this recipe into a "{variant}" version.

Rules: {rule}

Original recipe JSON:
{json.dumps(original, ensure_ascii=False, indent=2)}

Return ONLY valid JSON (no markdown) matching this schema:
{{
  "note": "short summary of what changed for this version",
  "sections": [
    {{ "title": "section name", "items": [{{ "text": "ingredient line", "changed": true|false }}] }}
  ],
  "lkkProducts": [
    {{ "category": "...", "name": "...", "changed": true|false }}
  ],
  "steps": [
    {{ "number": 1, "text": "cooking step text" }}
  ]
}}

Mark changed: true on any ingredient, product, or amount that differs from the original.
Use the same language as the original recipe ({locale}).
Keep the same number of cooking steps as the original unless a split is necessary.
"""


def extract_json_from_text(text: str) -> dict[str, Any]:
    text = text.strip()
    if text.startswith("```"):
        lines = text.split("\n")
        lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        text = "\n".join(lines).strip()

    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1:
        raise ValueError("No JSON object found in model response")

    return json.loads(text[start : end + 1])
