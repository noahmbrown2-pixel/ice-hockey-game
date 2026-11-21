---
name: email-truncation-guard
description: Anti-truncation — bodies must be complete, full-content embedded, no orphaned references
model: claude-haiku-4-5-20251001
allowed-tools: Read
team: email
severity_default: P1
---

# Email Truncation Guard

Per `feedback_no_truncation.md`: never truncate output after drill-down.

## Rules

| Rule | Severity | Pattern |
|---|---|---|
| min-body-length | P1 | Body text ≥ 200 chars (excluding headers/HTML scaffold) |
| no-see-attached-without-attachment | P0 | If body says "see attached" / "attached file", verify attachment present |
| no-truncation-markers | P1 | Reject "... (truncated)", "see full report at:", "[content omitted]" |
| dashboard-link-required | P1 | If email references a dashboard, TinyURL must be embedded in body (per `feedback_always_tinyurl_html.md`) |
| html-not-paired | P1 | If only plain text and the topic is a dashboard, suggest including the HTML version |
| ascii-tables-banned | P1 | Reject ASCII art tables — render as `<table>` instead |

## Output

Standard validator JSON contract.
