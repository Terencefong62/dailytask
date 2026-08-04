# SEO & GEO audit checklist

Use this when scoring. Each item: note **Pass / Partial / Fail**, evidence (URL or element), and `SEO` / `GEO` / `Both`.

## A. Technical SEO & crawlability

| Check | SEO | GEO |
| --- | --- | --- |
| HTTPS everywhere; no mixed content on key templates | ✓ | |
| robots.txt allows important paths; no accidental `Disallow: /` | ✓ | |
| XML sitemap present, valid, submitted; covers locales | ✓ | ✓ |
| Canonical tags correct; no chains or conflicts | ✓ | |
| hreflang complete for all locale pairs + `x-default` | ✓ | ✓ |
| Status codes: no 404 on nav links; redirects are 301 | ✓ | |
| Mobile-friendly / responsive templates | ✓ | |
| Core Web Vitals — flag if not measured; note LCP/INP/CLS risk areas | ✓ | |
| JavaScript-critical content — key text visible without JS? | ✓ | ✓ |
| Structured internal linking (hub → spoke, breadcrumbs) | ✓ | ✓ |

## B. On-page SEO

| Check | Notes |
| --- | --- |
| Unique `<title>` per URL; ~50–60 chars; primary intent front-loaded | |
| Meta description present; ~120–160 chars; unique per URL | |
| One clear H1 per page; logical H2–H3 hierarchy | |
| Image alt text on meaningful images | |
| Open Graph + Twitter meta for share surfaces | |
| URL structure readable, stable, lowercase locale slugs | |
| Pagination / faceted URLs handled (canonical or noindex) | |

## C. Content quality & intent

| Check | SEO | GEO |
| --- | --- | --- |
| Page matches search intent (informational / navigational / transactional) | ✓ | ✓ |
| Sufficient depth vs competitors on key topics | ✓ | ✓ |
| Clear above-the-fold answer for key queries | | ✓ |
| Freshness signals on news/time-sensitive content | ✓ | ✓ |
| Duplicate or near-duplicate across locales | ✓ | ✓ |
| E-E-A-T signals: author, dates, sources, about/contact | ✓ | ✓ |
| Recruitment/careers pages: unique value, not boilerplate | ✓ | ✓ |

## D. Structured data (Schema.org)

| Type | Priority pages |
| --- | --- |
| Organization / WebSite (with `sameAs`) | Home |
| BreadcrumbList | All templates |
| Article / NewsArticle | News, press |
| FAQPage | FAQ, support |
| JobPosting | Careers |
| LocalBusiness / ContactPoint | Contact (if applicable) |

Validate: JSON-LD parseable, required fields present, matches visible content.

## E. GEO — Generative Engine Optimization

GEO targets **citation in AI answers**, not only blue-link rankings.

| Check | Why it matters |
| --- | --- |
| **Entity clarity** — Who, what, founded, HQ, markets, products in plain prose | Models extract facts from homepage + about |
| **Definitional sentences** — "X is a … that …" on key pages | Direct answer extraction |
| **Consistent naming** — Brand, product names identical across site | Reduces entity confusion |
| **FAQ / Q&A content** with explicit question headings | High citation surface |
| **Statistics with sources** — dated, attributable | Trust for AI citations |
| **Comparison / category positioning** — vs alternatives without fluff | Answer synthesis |
| **Structured lists** — milestones, awards, product lines | Easy parsing |
| **External authority** — Wikipedia, industry bodies, press with backlinks | Citation graph |
| **Fresh press / news** with proper Article schema | Recency for AI retrieval |
| **Avoid** — vague marketing fluff, untitled sections, PDF-only key facts | Poor extractability |

## F. International / multilingual

| Check |
| --- |
| Each locale has complete nav + core pages (not English fallbacks) |
| Titles/descriptions localised, not machine-translated stubs |
| `lang` attribute and `og:locale` correct |
| Locale URL pattern consistent (`/en/`, `/zh-hk/`, not mixed `zh_HK`) |
| Sitemap per locale or unified with alternates |

## G. Trust, compliance, UX signals

| Check |
| --- |
| Privacy policy, terms, contact accessible |
| Cookie/consent compliant for target markets |
| No intrusive interstitials on mobile |
| Brand-safe metadata (no staging titles, test pages indexed) |
| `noindex` on staging, search results, thin utility pages |

## Dimension scores (fill in report)

| Dimension | Weight | Score 1–5 |
| --- | --- | --- |
| Technical SEO | 20% | |
| On-page SEO | 20% | |
| Content & intent | 20% | |
| Structured data | 10% | |
| International | 10% | |
| GEO / AI visibility readiness | 20% | |

**Overall** = weighted average. Round to one decimal.
