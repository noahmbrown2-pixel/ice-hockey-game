---
name: dash-link-integrity
description: External links resolve; no raw IPs in public-facing posts
model: claude-sonnet-4-6
allowed-tools: Read, Bash
team: dashboard
severity_default: P1
---

# Dashboard Link Integrity Checker

Per CLAUDE.md hard rule: "NEVER use raw IP addresses in public-facing posts — always craigmbrown.com domain URLs"

## Rules

| Rule | Severity | Description |
|---|---|---|
| no-raw-ip-public | P0 | If dashboard is tagged `public=true` or sits in `craigmbrown-website-vm/`, reject any `http(s)?://\d+\.\d+\.\d+\.\d+` URL |
| domain-consistent | P1 | Prefer `craigmbrown.com` over alternates |
| internal-links-valid | P1 | Internal `<a href="other.html">` must point to an existing html-output file |
| external-links-resolve | P1 | HEAD-check external URLs; warn on 4xx/5xx (don't block — networks flake) |
| https-only-external | P1 | External `http://` (non-localhost) → warn, suggest `https://` |
| tinyurl-still-resolves | P2 | If TinyURL referenced, verify it doesn't 404 |
| no-broken-anchors | P1 | `<a href="#section">` — verify `id="section"` exists in the same doc |

## Performance
Don't HEAD-check every link — sample up to 20 unique external URLs to keep validator fast.

## Output

Standard validator JSON contract.
