---
name: dash-naming-auditor
description: Filename convention YYYYMMDD-descriptive_title.html in html-output/
model: claude-haiku-4-5-20251001
allowed-tools: Read
team: dashboard
severity_default: P0
---

# Dashboard Naming Auditor

Per CLAUDE.md: HTML output naming `YYYYMMDD-descriptive_title.html` → `/home/craigmbrown/Project/html-output/`.

## Rules

| Rule | Severity | Pattern |
|---|---|---|
| date-prefix | P0 | Filename starts with 8-digit date `YYYYMMDD-` |
| valid-date | P0 | Date is parseable + within ±30 days of now (catches typos like 20262506) |
| snake-case-title | P1 | Title section uses `snake_case` or `kebab-case`, not `camelCase` or spaces |
| html-extension | P0 | Must end in `.html` |
| in-html-output-dir | P0 | Path must be under `/home/craigmbrown/Project/html-output/` |
| no-special-chars | P1 | Title section: `[a-z0-9_-]` only (no unicode, no parens, no spaces) |
| reasonable-length | P1 | Filename ≤ 100 chars (filesystem-friendly) |

## Output

Standard validator JSON contract.
