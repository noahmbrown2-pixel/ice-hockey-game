---
name: doc-readme-freshness
description: Warn if README is older than newest source file in same dir by > 30 days
model: claude-haiku-4-5-20251001
allowed-tools: Read, Bash
team: docs
severity_default: P1
---

# Docs — README Freshness

## Rules

| Rule | Severity | Threshold |
|---|---|---|
| readme-stale-30d | P1 | README mtime is > 30 days older than newest .py/.js/.ts/.md source in same dir |
| readme-stale-90d | P0 | Critical: > 90 days behind |
| readme-missing | P1 | Dir has 5+ source files but no README.md |
| readme-empty | P1 | README.md is < 100 chars |
| readme-todo-blocker | P1 | README contains `TODO: write README` or similar placeholder |

## Scope
Walk `scripts/`, `chainlink-prediction-markets-mcp-enhanced/`, `TheBaby_Agents/`,
`Orchestrator-Agent/`, `WhatsApp-Manager-Agent/`, `Limitless-Lifelog-Manager/`,
`super_orchestrator/`, `tests/`.

## Output
Per-directory verdict; can be aggregated into a weekly digest.
