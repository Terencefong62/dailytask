# dailytask

Lee Kum Kee (LKK) and related project workspace — scripts, exports, skills, and proof-of-concept apps.

## Projects

| Directory | Description |
| --- | --- |
| [`scripts/`](scripts/) | Python utilities for site meta crawling, employee name extraction, and image processing |
| [`exports/`](exports/) | Generated CSV, Excel, and image deliverables |
| [`data/`](data/) | Input data files (e.g. ingredient rankings) |
| [`perplexity-skills/`](perplexity-skills/) | Reusable Perplexity Computer skill for SEO & GEO audits |
| [`voice-control-poc/`](voice-control-poc/) | Web Speech API proof of concept for recipe cooking steps |

## Quick start

### Python scripts

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python scripts/crawl_lkk_meta.py
```

See [`scripts/README.md`](scripts/README.md) for all available scripts.

### Voice control POC

```bash
cd voice-control-poc
python3 -m http.server 8080
```

Open [http://localhost:8080](http://localhost:8080) in Chrome or Edge. See [`voice-control-poc/README.md`](voice-control-poc/README.md) for voice commands and browser support.

### Perplexity SEO & GEO audit skill

Upload `perplexity-skills/seo-geo-audit-flat.zip` to Perplexity Computer → Skills. See [`perplexity-skills/README.md`](perplexity-skills/README.md) for install options and example prompts.

## Repository layout

```
.
├── data/                  # Input spreadsheets and source data
├── exports/               # Generated outputs (see exports/README.md)
├── perplexity-skills/     # Perplexity Computer skill package
├── scripts/               # Python utility scripts
├── voice-control-poc/     # Recipe voice control POC
├── requirements.txt       # Python dependencies for scripts
└── .cursor/
    └── environment.json   # Cloud agent preview config (port 8080)
```
