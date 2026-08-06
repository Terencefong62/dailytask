"""OpenAI ChatGPT API client for fast recipe variant generation."""

import json
import os
from typing import Any, Generator

import httpx

OPENAI_CHAT_URL = "https://api.openai.com/v1/chat/completions"
DEFAULT_MODEL = os.environ.get("OPENAI_MODEL", "gpt-4o-mini")
REQUEST_TIMEOUT = 120.0


def stream_openai_variant(api_key: str, prompt: str) -> Generator[dict[str, Any], None, None]:
    yield {"type": "status", "message": "Connecting to ChatGPT…"}

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": DEFAULT_MODEL,
        "messages": [
            {
                "role": "system",
                "content": "You are a Lee Kum Kee recipe editor. Respond with valid JSON only.",
            },
            {"role": "user", "content": prompt},
        ],
        "response_format": {"type": "json_object"},
        "stream": True,
        "temperature": 0.4,
    }

    buffer: list[str] = []

    with httpx.Client(timeout=REQUEST_TIMEOUT) as client:
        with client.stream("POST", OPENAI_CHAT_URL, headers=headers, json=payload) as response:
            if response.status_code == 401:
                raise PermissionError("Invalid OpenAI API key")
            if response.status_code >= 400:
                body = response.read().decode()
                raise RuntimeError(f"OpenAI API error {response.status_code}: {body}")

            yield {"type": "status", "message": "ChatGPT is generating…"}

            for line in response.iter_lines():
                if not line.startswith("data:"):
                    continue
                data = line[5:].strip()
                if data == "[DONE]":
                    break
                try:
                    chunk = json.loads(data)
                except json.JSONDecodeError:
                    continue

                for choice in chunk.get("choices", []):
                    delta = choice.get("delta", {})
                    text = delta.get("content")
                    if text:
                        buffer.append(text)
                        yield {"type": "delta", "text": text}

    full_text = "".join(buffer)
    if not full_text:
        raise RuntimeError("ChatGPT returned an empty response")

    yield {"type": "result", "status": "FINISHED", "text": full_text}


def generate_openai_variant(api_key: str, prompt: str) -> str:
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": DEFAULT_MODEL,
        "messages": [
            {
                "role": "system",
                "content": "You are a Lee Kum Kee recipe editor. Respond with valid JSON only.",
            },
            {"role": "user", "content": prompt},
        ],
        "response_format": {"type": "json_object"},
        "temperature": 0.4,
    }

    with httpx.Client(timeout=REQUEST_TIMEOUT) as client:
        response = client.post(OPENAI_CHAT_URL, headers=headers, json=payload)
        if response.status_code == 401:
            raise PermissionError("Invalid OpenAI API key")
        if response.status_code >= 400:
            raise RuntimeError(f"OpenAI API error {response.status_code}: {response.text}")

        data = response.json()
        content = data["choices"][0]["message"]["content"]
        if not content:
            raise RuntimeError("ChatGPT returned an empty response")
        return content
