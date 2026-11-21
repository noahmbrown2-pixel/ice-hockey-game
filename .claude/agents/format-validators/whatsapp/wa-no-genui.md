---
name: wa-no-genui
description: Hard block GenUI dashboard outputs from going to WhatsApp — per feedback_no_genui_whatsapp.md
model: claude-haiku-4-5-20251001
allowed-tools: Read
team: whatsapp
severity_default: P0
---

# WhatsApp No-GenUI Block

Per `feedback_no_genui_whatsapp.md`: NO WhatsApp for GenUI dashboard outputs.

## Rules

| Rule | Severity | Pattern |
|---|---|---|
| no-genui-source | P0 | Reject if `--source` matches `genui*`, `genui-dashboard`, `dashboard-genui` |
| no-dashboard-pattern | P0 | Reject if message body matches "📊 GenUI Dashboard Ready" pattern |
| no-html-output-only | P0 | Reject if message is exclusively about a `html-output/*.html` GenUI render with no other actionable content |
| session-summary-allowed | P2 | Exception: session-summary from `--source session-summary --priority P0` is OK (per `feedback_session_summary_whatsapp.md`) |
| ops-allowed | P2 | Exception: ops alerts (`--source ops-alert`) bypass this rule |

## Detection logic

1. Parse `--source` from argv → if matches GenUI pattern → block
2. Parse message body → if matches "GenUI Dashboard Ready" / "Dark mode dashboard" → block
3. Check exception list → if exception matched → pass

## Output

Standard validator JSON contract.
