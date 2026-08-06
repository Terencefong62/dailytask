"""Cursor Cloud Agents API client for real-time recipe generation."""

import json
import time
from typing import Any, Generator

import httpx

CURSOR_API_BASE = "https://api.cursor.com/v1"
DEFAULT_MODEL = "composer-2.5"
POLL_INTERVAL_SEC = 2
POLL_TIMEOUT_SEC = 180


def _auth(api_key: str) -> tuple[str, str]:
    return (api_key, "")


def create_agent(api_key: str, prompt: str) -> tuple[str, str]:
    payload = {
        "prompt": {"text": prompt},
        "model": {"id": DEFAULT_MODEL},
    }
    with httpx.Client(timeout=60.0) as client:
        response = client.post(
            f"{CURSOR_API_BASE}/agents",
            json=payload,
            auth=_auth(api_key),
        )
        if response.status_code == 401:
            raise PermissionError("Invalid Cursor API key")
        if response.status_code >= 400:
            raise RuntimeError(f"Cursor API error {response.status_code}: {response.text}")

        data = response.json()
        agent_id = data["agent"]["id"]
        run_id = data["run"]["id"]
        return agent_id, run_id


def poll_run_until_done(api_key: str, agent_id: str, run_id: str) -> str:
    deadline = time.time() + POLL_TIMEOUT_SEC
    terminal = {"FINISHED", "ERROR", "CANCELLED", "EXPIRED"}

    with httpx.Client(timeout=30.0) as client:
        while time.time() < deadline:
            response = client.get(
                f"{CURSOR_API_BASE}/agents/{agent_id}/runs/{run_id}",
                auth=_auth(api_key),
            )
            if response.status_code >= 400:
                raise RuntimeError(f"Cursor API error {response.status_code}: {response.text}")

            run = response.json()
            status = run.get("status", "")
            if status in terminal:
                if status != "FINISHED":
                    raise RuntimeError(f"Cursor agent run failed with status: {status}")
                result = run.get("result") or ""
                if not result:
                    raise RuntimeError("Cursor agent finished without a text result")
                return result

            time.sleep(POLL_INTERVAL_SEC)

    raise TimeoutError("Cursor AI took too long. Please try again.")


def stream_run_events(
    api_key: str, agent_id: str, run_id: str
) -> Generator[dict[str, Any], None, None]:
    url = f"{CURSOR_API_BASE}/agents/{agent_id}/runs/{run_id}/stream"
    assistant_buffer: list[str] = []

    with httpx.Client(timeout=None) as client:
        with client.stream(
            "GET",
            url,
            auth=_auth(api_key),
            headers={"Accept": "text/event-stream"},
        ) as response:
            if response.status_code >= 400:
                body = response.read().decode()
                raise RuntimeError(f"Cursor stream error {response.status_code}: {body}")

            event_type = None
            for line in response.iter_lines():
                if line.startswith("event:"):
                    event_type = line[6:].strip()
                elif line.startswith("data:") and event_type:
                    payload = json.loads(line[5:].strip())
                    if event_type == "status":
                        yield {"type": "status", "status": payload.get("status")}
                    elif event_type == "assistant":
                        chunk = payload.get("text", "")
                        assistant_buffer.append(chunk)
                        yield {"type": "delta", "text": chunk}
                    elif event_type == "thinking":
                        yield {"type": "thinking", "text": payload.get("text", "")}
                    elif event_type == "result":
                        text = payload.get("text") or "".join(assistant_buffer)
                        yield {
                            "type": "result",
                            "status": payload.get("status"),
                            "text": text,
                        }
                    event_type = None

    if assistant_buffer:
        yield {"type": "result", "status": "FINISHED", "text": "".join(assistant_buffer)}


def generate_variant_with_cursor(
    api_key: str, prompt: str, use_stream: bool = True
) -> Generator[dict[str, Any], None, None]:
    yield {"type": "status", "message": "Connecting to Cursor AI…"}
    agent_id, run_id = create_agent(api_key, prompt)
    yield {
        "type": "status",
        "message": "Cursor agent started",
        "agentId": agent_id,
        "runId": run_id,
    }

    if use_stream:
        try:
            for event in stream_run_events(api_key, agent_id, run_id):
                yield event
            return
        except Exception:
            yield {"type": "status", "message": "Falling back to polling…"}

    result_text = poll_run_until_done(api_key, agent_id, run_id)
    yield {"type": "result", "status": "FINISHED", "text": result_text}
