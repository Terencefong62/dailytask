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

Cooking steps match the live recipe (4 steps; video embed and tip omitted from TTS list).

## Run locally

Web Speech API requires a secure context (HTTPS or `localhost`). Use a local server:

```bash
cd voice-control-poc
python3 -m http.server 8080
```

Open [http://localhost:8080](http://localhost:8080) in **Chrome** or **Edge**, allow microphone access, then click **開啟語音聆聽**.

## Browser support

| API | Chrome / Edge | Safari | Firefox |
|-----|---------------|--------|---------|
| SpeechSynthesis (TTS) | Yes | Yes | Limited |
| SpeechRecognition | Yes | No | No |

Use Chrome or Edge for full POC (TTS + voice commands).

## Files

- `index.html` — recipe layout and controls
- `styles.css` — LKK-inspired styling
- `voice-control.js` — TTS + voice recognition logic
