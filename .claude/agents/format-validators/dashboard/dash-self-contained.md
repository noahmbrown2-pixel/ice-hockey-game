---
name: dash-self-contained
description: No external CDN deps — all CSS inline, no remote fonts/scripts
model: claude-haiku-4-5-20251001
allowed-tools: Read
team: dashboard
severity_default: P0
---

# Dashboard Self-Contained Enforcer

Per CLAUDE.md: "Self-contained: Every HTML file must work standalone without external dependencies."

## Rules

| Rule | Severity | Pattern |
|---|---|---|
| no-cdn-script | P0 | Reject `<script src="https://...">` |
| no-cdn-link | P0 | Reject `<link rel="stylesheet" href="https://...">` |
| no-google-fonts | P0 | Reject `fonts.googleapis.com`, `fonts.gstatic.com` |
| no-cdn-images | P1 | Warn on `<img src="https://cdn.*">` (use base64 or skip) |
| inline-styles-only | P0 | All CSS in `<style>` blocks within `<head>`, or `style=` attributes |
| no-iframe-external | P0 | Reject `<iframe src="https://...">` (privacy + offline-break) |
| favicon-data-uri | P2 | Favicon should be data URI, not external resource |

## Allowed
- `<a href="https://...">` to external sites is fine (just a link, no asset load)
- Internal links to other html-output files are encouraged
- Data URIs (`data:image/png;base64,...`) are encouraged for inline images

## Output

Standard validator JSON contract.
