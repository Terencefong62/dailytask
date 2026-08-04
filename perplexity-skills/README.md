# Perplexity SEO & GEO Audit Skill

A reusable **Perplexity Computer** skill that turns Computer into an SEO + GEO (Generative Engine Optimization) auditor with benchmarking and step-by-step optimisation plans.

## What it does

- Audits sites against professional SEO and GEO standards
- Benchmarks against competitors in your industry
- Produces structured audit reports and phased action plans
- Handles multilingual sites (en, zh-hk, zh-cn, etc.)
- Separates traditional search (Google/Bing) from AI citation readiness (Perplexity, ChatGPT, AI Overviews)

## Install in Perplexity Pro (Computer)

### Option A — Upload ZIP (recommended)

1. Download **`seo-geo-audit-flat.zip`** (SKILL.md at zip root — preferred for upload) or **`seo-geo-audit.zip`** (folder wrapper)
2. Open **Perplexity Computer** → **Skills** (left sidebar)
3. Click **Upload a Skill**
4. Upload the zip (max 10 MB; must include `SKILL.md` with YAML frontmatter)

### Option B — Upload single Markdown file

1. Upload **`seo-geo-audit-standalone.md`** (includes full instructions in one file; no progressive reference loading)

### Option C — Create with Perplexity

1. Skills → **Create skill** → **Create with Perplexity**
2. Paste the contents of `SKILL.md` and ask Computer to format it as a skill with the same name and description

## Example prompts (after install)

```
Audit https://example.com for SEO and GEO. Benchmark against [competitor A] and [competitor B]. 
Locales: en, zh-hk, zh-cn. Give me a scored report and a 90-day action plan.
```

```
Crawl the sitemap and build a CSV of URL, title, and meta description. 
Flag missing descriptions and duplicate titles. Then prioritise fixes.
```

```
Why isn't our brand showing up in AI answers for "[your category query]"? 
Run a GEO audit and tell me exactly what to change on the homepage and about pages.
```

## Files in this package

| File | Purpose |
| --- | --- |
| `seo-geo-audit/SKILL.md` | Hub — workflow, gotchas, routing to references |
| `references/audit-checklist.md` | Full SEO + GEO scoring checklist |
| `references/benchmark-framework.md` | Competitor selection and comparison method |
| `assets/audit-report-template.md` | Report output structure |
| `assets/action-plan-template.md` | Phased optimisation roadmap |

## Customisation

Edit `SKILL.md` description if triggers are too broad/narrow. Perplexity routes skills via the **description** line — keep it under ~50 words and start with **"Load when..."**.

Add industry-specific benchmarks under `references/` (e.g. `references/fmcg-corporate.md`) and link from `SKILL.md`.

## GEO vs SEO

| SEO | GEO |
| --- | --- |
| Rankings, crawlability, meta tags, CWV | AI citation, entity clarity, answer extractability |
| Google Search Console | Query spot-checks in AI tools |
| Schema for rich results | Schema + FAQ + definitional prose for models |

## License

Use and modify freely for your Perplexity Pro account.
