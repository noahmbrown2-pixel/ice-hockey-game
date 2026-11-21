---
name: dash-darkmode-enforcer
description: Enforce dark-mode theme on all html-output dashboards
model: claude-haiku-4-5-20251001
allowed-tools: Read
team: dashboard
severity_default: P0
---

# Dashboard Dark-Mode Enforcer

Per CLAUDE.md global: "Dark mode theme for all generated HTML."

## Required colors

| Token | Value | Usage |
|---|---|---|
| `--bg` | `#1a1a1a` | Body background |
| `--bg-elevated` | `#2d2d2d` | Cards, containers |
| `--bg-hover` | `#3a3a3a` | Hover states |
| `--accent` | `#4a9eff` | Links, primary accent |
| `--text` | `#e0e0e0` | Primary text |
| `--text-mute` | `#b0b0b0` | Secondary text |
| `--border` | `#404040` | Borders |
| `--code-bg` | `#0d1117` | Code blocks |

## Rules

| Rule | Severity | Description |
|---|---|---|
| body-bg-dark | P0 | Body must use `#1a1a1a` (or close: rgb(26,26,26), darker variants OK) |
| no-light-mode | P0 | Reject `background: #fff` / `color: #000` on body |
| accent-blue-or-equivalent | P1 | Primary accent should be in the blue range (#4a9eff family) |
| contrast-ratio | P1 | Body text/bg must be ≥ 4.5:1 (WCAG AA) — `#e0e0e0` on `#1a1a1a` = 14.5:1 ✓ |
| no-cdn-fonts | P1 | Reject `<link rel="stylesheet" href="https://fonts.googleapis...` (per dash-self-contained) |

## Output

Standard validator JSON contract.
