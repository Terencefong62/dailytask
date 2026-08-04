# Benchmark framework

Use when comparing the audited site to category peers.

## 1. Pick competitors (3–5)

**Selection criteria** (document why each was chosen):

- Same industry vertical (e.g. FMCG sauce/condiment, corporate food brand)
- Same geography or expansion markets
- Similar site type (corporate vs consumer product site)
- Sites that **appear in AI answers** for target queries (test 2–3 queries in search)

**Sources to find peers:** industry rankings, trade associations, "top [category] brands [region]", GSC competitor reports (if user provides), news coverage.

## 2. Query set (build 8–15 queries)

Group by intent:

| Intent | Example patterns |
| --- | --- |
| Brand | `[brand name]`, `[brand] company` |
| Category | `asian sauce manufacturer`, `oyster sauce brand` |
| Product | `[product type] supplier`, `[product] ingredients` |
| Corporate | `[brand] sustainability`, `[brand] careers` |
| Localised | Same queries in zh-hk / zh-cn if relevant |

## 3. Comparative dimensions

Score audited site vs each competitor (Better / Parity / Behind):

| Dimension | What to compare |
| --- | --- |
| Title/meta patterns | Length, uniqueness, brand suffix, locale coverage |
| Homepage entity signal | Clear who/what/where in first screen + meta |
| Content depth | Word count, sections, media on comparable pages |
| News/PR cadence | Volume, schema, dates |
| FAQ / help | Presence, structure, FAQ schema |
| Careers | Dedicated hub, JobPosting, employee stories |
| Schema richness | Types used vs available |
| Site speed perception | Heavy media, font loads (qualitative if no lab data) |
| AI citation test | Does competitor get cited for target queries? |

## 4. AI visibility spot-check

For 3–5 target queries, note:

- Which domains are cited in AI overview / Perplexity / ChatGPT (if testable)
- Whether audited brand is mentioned, cited, or absent
- What content format competitors use (FAQ, tables, press, Wikipedia)

**Do not** claim citation rates without evidence. Record exact query + what was observed.

## 5. Gap narrative template

For each Behind score:

```
Competitor: [name]
Query/topic: [topic]
Their strength: [specific observable]
Our gap: [specific]
Recommended fix: [action]
Priority: P0/P1/P2
```

## Industry notes (FMCG / corporate food)

- Corporate sites often **under-invest in meta descriptions** — benchmark whether leaders fill them on news/awards pages.
- **GEO wins** from: heritage story, milestones timeline, sustainability facts, press with dates, multilingual about pages.
- **Recruitment** is a separate SEO cluster — benchmark careers hub depth vs peers.
- Consumer product sites may outperform on schema; corporate sites on E-E-A-T — compare the right archetype.
