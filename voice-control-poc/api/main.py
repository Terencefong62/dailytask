"""FastAPI server: static POC + AI recipe generation (ChatGPT / Cursor)."""

import json
import os
from typing import Any, Literal, Optional

from fastapi import FastAPI, Header, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from cursor_service import generate_variant_with_cursor
from openai_service import generate_openai_variant, stream_openai_variant
from prompts import build_transform_prompt, extract_json_from_text

app = FastAPI(title="Voice Control POC API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Provider = Literal["openai", "cursor"]


class VariantRequest(BaseModel):
    variant: str = Field(..., pattern="^(vegan|healthy)$")
    locale: str = Field(default="zh-HK")
    provider: Provider = "openai"


def parse_bearer(authorization: Optional[str]) -> Optional[str]:
    if authorization and authorization.startswith("Bearer "):
        return authorization[7:].strip() or None
    return None


def resolve_api_key(provider: Provider, header_key: Optional[str]) -> Optional[str]:
    if header_key:
        return header_key
    if provider == "openai":
        return os.environ.get("OPENAI_API_KEY")
    return os.environ.get("CURSOR_API_KEY")


def stream_provider_events(provider: Provider, api_key: str, prompt: str):
    if provider == "openai":
        return stream_openai_variant(api_key, prompt)
    return generate_variant_with_cursor(api_key, prompt, use_stream=True)


@app.get("/api/health")
def health(
    authorization: Optional[str] = Header(default=None),
    provider: Provider = Query(default="openai"),
) -> dict[str, Any]:
    header_key = parse_bearer(authorization)
    openai_server = bool(os.environ.get("OPENAI_API_KEY"))
    cursor_server = bool(os.environ.get("CURSOR_API_KEY"))
    client_key = bool(header_key)

    ready = False
    if provider == "openai":
        ready = openai_server or client_key
    else:
        ready = cursor_server or client_key

    return {
        "ok": True,
        "provider": provider,
        "openai": {
            "configured": openai_server or (client_key and provider == "openai"),
            "serverKeyConfigured": openai_server,
        },
        "cursor": {
            "configured": cursor_server or (client_key and provider == "cursor"),
            "serverKeyConfigured": cursor_server,
        },
        "clientKeyProvided": client_key,
        "ready": ready,
        "defaultProvider": "openai",
    }


@app.post("/api/recipe/variant")
def generate_variant(
    body: VariantRequest,
    authorization: Optional[str] = Header(default=None),
) -> dict[str, Any]:
    api_key = resolve_api_key(body.provider, parse_bearer(authorization))
    if not api_key:
        raise HTTPException(
            status_code=401,
            detail=f"Add your {'OpenAI' if body.provider == 'openai' else 'Cursor'} API key or set server env.",
        )

    prompt = build_transform_prompt(body.variant, body.locale)

    if body.provider == "openai":
        try:
            result_text = generate_openai_variant(api_key, prompt)
        except PermissionError as exc:
            raise HTTPException(status_code=401, detail=str(exc))
        except RuntimeError as exc:
            raise HTTPException(status_code=500, detail=str(exc))
    else:
        result_text = None
        for event in generate_variant_with_cursor(api_key, prompt, use_stream=False):
            if event.get("type") == "result":
                result_text = event.get("text")
        if not result_text:
            raise HTTPException(status_code=500, detail="No response from Cursor AI")

    try:
        data = extract_json_from_text(result_text)
    except (json.JSONDecodeError, ValueError) as exc:
        raise HTTPException(status_code=500, detail=f"Could not parse AI response: {exc}")

    return {
        "variant": body.variant,
        "locale": body.locale,
        "data": data,
        "source": body.provider,
    }


@app.get("/api/recipe/variant/stream")
def stream_variant(
    variant: str = Query(..., pattern="^(vegan|healthy)$"),
    locale: str = Query(default="zh-HK"),
    provider: Provider = Query(default="openai"),
    authorization: Optional[str] = Header(default=None),
):
    api_key = resolve_api_key(provider, parse_bearer(authorization))
    if not api_key:
        label = "OpenAI" if provider == "openai" else "Cursor"
        raise HTTPException(status_code=401, detail=f"{label} API key required")

    prompt = build_transform_prompt(variant, locale)

    def event_stream():
        result_text = None
        try:
            for event in stream_provider_events(provider, api_key, prompt):
                if event.get("type") == "result":
                    result_text = event.get("text")
                yield f"data: {json.dumps(event, ensure_ascii=False)}\n\n"

            if result_text:
                parsed = extract_json_from_text(result_text)
                yield f"data: {json.dumps({'type': 'complete', 'data': parsed, 'source': provider}, ensure_ascii=False)}\n\n"
            else:
                yield f"data: {json.dumps({'type': 'error', 'message': 'Empty AI response'})}\n\n"
        except Exception as exc:
            yield f"data: {json.dumps({'type': 'error', 'message': str(exc)}, ensure_ascii=False)}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")


static_dir = os.path.join(os.path.dirname(__file__), "..")
app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")
