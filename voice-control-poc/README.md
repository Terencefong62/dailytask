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
| `index.html` | **English (en-US)** — default | start, next step, back, go to step X |
| `zh.html` | 中文 (zh-HK) | 開始、下一步、上一步、返回第 X 步 |
| `start.html` | Language picker | Optional entry page |

Open **`index.html`** for English (default). Chinese: **`zh.html`**. Use the header language link to switch.

## Flexible servings

Adjust **Serves** (1–12 people) before cooking. Ingredient and seasoning amounts scale proportionally with practical rounding (spoons, ml, g, piece counts) so flavour stays balanced.

Each cooking step includes a **thumbnail** and **step visual guide** image (see `images/steps/`).

## Run locally

Static recipe versions (Original, Vegan, Healthy) are built into the POC — no API keys required.

```bash
cd voice-control-poc
python3 -m http.server 8080
```

Or with the bundled API server (same static UI; AI endpoints unused):

```bash
cd voice-control-poc/api
pip install -r ../requirements.txt
python3 -m uvicorn main:app --host 0.0.0.0 --port 8080
```

Open [http://localhost:8080/start.html](http://localhost:8080/start.html) (or `index.html` / `en.html`) in **Chrome** or **Edge**, allow microphone access, then click **開啟語音聆聽** / **Start voice listening**.

## Browser support

| API | Chrome / Edge | Safari | Firefox |
|-----|---------------|--------|---------|
| SpeechSynthesis (TTS) | Yes | Yes | Limited |
| SpeechRecognition | Yes | No | No |

Use Chrome or Edge for full POC (TTS + voice commands).

## Files

- `index.html` — English recipe page (default, en-US)
- `zh.html` — Chinese recipe page (zh-HK)
- `en.html` — redirects to `index.html`
- `serving-scale.js` — serving size scaling logic
- `images/steps/` — generated step guide images
- `step-images.js` — step image paths and alt text
- `config.zh-HK.js` / `config.en.js` — locale-specific steps and commands
- `styles.css` — LKK-inspired styling
- `voice-control.js` — shared TTS + voice recognition logic
- `requirements.txt` — Python dependencies
