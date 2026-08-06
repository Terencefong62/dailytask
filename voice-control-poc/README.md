# Voice Control POC — 李錦記食譜 Web Speech API

Proof of concept for **text-to-speech** and **voice control** on recipe cooking steps (烹調步驟).

**Recipe:** [蠔油薯仔炆雞翼](https://hk.lkk.com/zh-hk/recipes/oyster-flavoured-braised-chicken-wings-with-potatoes)

## Features

1. **Text-to-speech (TTS)** — reads each 烹調步驟 aloud in Chinese (zh-HK).
2. **Voice commands** — control playback with speech:
   - `開始` — play step 1
   - `下一步` — next step
   - `上一步` — previous step
   - `返回第 X 步` / `第 X 步` — jump to step X (e.g. 返回第 2 步)
   - `停止` / `暫停` — stop reading
   - `重複` — repeat current step

Cooking steps match the live recipe (tip omitted from TTS list).

## Recipe versions

Both languages support three versions (click buttons or use voice):

| Version | Chinese voice | English voice | Changes |
|---------|---------------|---------------|---------|
| Original / 原版 | 原版 | original | Classic recipe |
| Vegan / 素食版 | 素食版 | vegan version | Meat replaced with plant-based ingredients; vegan oyster sauce |
| Healthy / 健康版 | 健康版 | healthy version | Less oil, reduced oyster sauce and sugar |

## Languages

| Page | Language | Voice commands |
|------|----------|----------------|
| `index.html` | 中文 (zh-HK) | 開始、下一步、上一步、返回第 X 步 |
| `en.html` | English (en-US) | start, next step, back, go to step X |

Use the **English** / **中文** link in the header to switch language.

## AI generation (real-time)

Vegan and Healthy can be generated with **ChatGPT (OpenAI API)** — recommended, usually **5–15 seconds** — or **Cursor Cloud Agents** (~30–90 seconds).

### ChatGPT (OpenAI)

1. Create an API key at [OpenAI API keys](https://platform.openai.com/api-keys)
2. In the POC, select **ChatGPT (OpenAI)** and paste your `sk-…` key
3. Click **Save & connect**, then choose **素食版 / Vegan** or **健康版 / Healthy**

Server env (optional): `OPENAI_API_KEY` and optional `OPENAI_MODEL` (default `gpt-4o-mini`).

### Cursor AI (alternative)

1. API key from [Cursor Dashboard → API Keys](https://cursor.com/dashboard/api)
2. Select **Cursor AI** in the dropdown

Server env (optional): `CURSOR_API_KEY`

Without a key, static fallback data is used. Results cache in `sessionStorage` per provider.

## Run locally

```bash
cd voice-control-poc/api
pip install -r ../requirements.txt
python3 -m uvicorn main:app --host 0.0.0.0 --port 8080
```

Open [http://localhost:8080](http://localhost:8080) in **Chrome** or **Edge**, allow microphone access, then click **開啟語音聆聽**.

## Browser support

| API | Chrome / Edge | Safari | Firefox |
|-----|---------------|--------|---------|
| SpeechSynthesis (TTS) | Yes | Yes | Limited |
| SpeechRecognition | Yes | No | No |

Use Chrome or Edge for full POC (TTS + voice commands).

## Files

- `index.html` — Chinese recipe page (zh-HK)
- `en.html` — English recipe page (en-US)
- `config.zh-HK.js` / `config.en.js` — locale-specific steps and commands
- `styles.css` — LKK-inspired styling
- `ai-client.js` — ChatGPT + Cursor API client
- `api/` — FastAPI backend (`main.py`, `openai_service.py`, `cursor_service.py`)
- `requirements.txt` — Python dependencies
