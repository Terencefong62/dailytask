"""FastAPI server: static POC + Cursor AI recipe generation."""

import json
import os
from typing import Any, Optional

from fastapi import FastAPI, Header, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from cursor_service import generate_variant_with_cursor
from prompts import build_transform_prompt, extract_json_from_text

app = FastAPI(title="Voice Control POC API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class VariantRequest(BaseModel):
    variant: str = Field(..., pattern="^(vegan|healthy)$")
    locale: str = Field(default="zh-HK")


def resolve_api_key(header_key: Optional[str]) -> Optional[str]:
    return header_key or os.environ.get("CURSOR_API_KEY")


@app.get("/api/health")
def health(authorization: Optional[str] = Header(default=None)) -> dict[str, Any]:
    server_key = bool(os.environ.get("CURSOR_API_KEY"))
    client_key = bool(authorization and authorization.startswith("Bearer "))
    return {
        "ok": True,
        "cursorAi": True,
        "serverKeyConfigured": server_key,
        "clientKeyProvided": client_key,
        "ready": server_key or client_key,
    }


@app.post("/api/recipe/variant")
def generate_variant(
    body: VariantRequest,
    authorization: Optional[str] = Header(default=None),
) -> dict[str, Any]:
    api_key = resolve_api_key(
        authorization.replace("Bearer ", "", 1) if authorization and authorization.startswith("Bearer ") else None
    )
    if not api_key:
        raise HTTPException(
            status_code=401,
            detail="Add your Cursor API key in the panel or set CURSOR_API_KEY on the server.",
        )

    prompt = build_transform_prompt(body.variant, body.locale)
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

    return {"variant": body.variant, "locale": body.locale, "data": data, "source": "cursor-ai"}


@app.get("/api/recipe/variant/stream")
def stream_variant(
    variant: str = Query(..., pattern="^(vegan|healthy)$"),
    locale: str = Query(default="zh-HK"),
    authorization: Optional[str] = Header(default=None),
):
    api_key = resolve_api_key(
        authorization.replace("Bearer ", "", 1) if authorization and authorization.startswith("Bearer ") else None
    )
    if not api_key:
        raise HTTPException(status_code=401, detail="Cursor API key required")

    prompt = build_transform_prompt(variant, locale)

    def event_stream():
        result_text = None
        try:
            for event in generate_variant_with_cursor(api_key, prompt, use_stream=True):
                if event.get("type") == "result":
                    result_text = event.get("text")
                yield f"data: {json.dumps(event, ensure_ascii=False)}\n\n"

            if result_text:
                parsed = extract_json_from_text(result_text)
                yield f"data: {json.dumps({'type': 'complete', 'data': parsed}, ensure_ascii=False)}\n\n"
            else:
                yield f"data: {json.dumps({'type': 'error', 'message': 'Empty AI response'})}\n\n"
        except Exception as exc:
            yield f"data: {json.dumps({'type': 'error', 'message': str(exc)}, ensure_ascii=False)}\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")


# Static files (POC frontend)
static_dir = os.path.join(os.path.dirname(__file__), "..")
app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")
