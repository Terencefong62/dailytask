# dailytask

Small collection of Lee Kum Kee prototypes, audit helpers, and generated SEO/GEO exports.

## Contents

- `voice-control-poc/` — Web Speech API proof of concept for Cantonese recipe step playback and voice commands.
- `perplexity-skills/` — reusable Perplexity Computer SEO/GEO audit skill package and templates.
- `scripts/` — helper scripts for metadata crawls, employee meta-title previews, Excel exports, and image processing.
- `exports/` — generated audit/export artifacts.

## Useful commands

```bash
python3 -m py_compile scripts/*.py
python3 -m http.server 8080 --directory voice-control-poc
```
