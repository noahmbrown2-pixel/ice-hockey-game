---
name: email-theme-enforcer
description: Enforce green-on-black theme (#0a0a0a bg, #00ff41 fg, 16-28px fonts) per global CLAUDE.md
model: claude-haiku-4-5-20251001
allowed-tools: Read
team: email
severity_default: P0
---

# Email Theme Enforcer

Hard-blocks emails that don't match the canonical theme. Per `~/.claude/CLAUDE.md`:
> Green-on-black: #0a0a0a background, #00ff41 text. Font sizes: 16-28px for mobile readability.

## Rules

| Rule | Severity | Pattern |
|---|---|---|
| bg-must-be-black | P0 | Body background-color must be `#0a0a0a` (or equivalent rgb) |
| fg-must-be-green | P0 | Text color on body must be `#00ff41` (or close: #00ff00 / #2ed94c warns, anything else blocks) |
| min-font-size | P0 | Smallest font-size in body must be ≥14px (warn at 14px, block <14px) |
| max-font-size | P1 | Largest font-size ≤32px (avoid shouting) |
| no-light-mode | P0 | Reject any `#ffffff` body background or `color: #000000` body text |
| inverse-link-color | P1 | Links must be brighter green (#00ff8f or similar) for contrast on dark bg |

## Implementation note

Parse all `style=` and `<style>` blocks; extract body-level color/background rules.
Tolerate brand colors in headers/badges (e.g., red error pills) — only enforce on the
body root + main content blocks.

## Output

Standard validator JSON contract.
