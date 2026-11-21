---
name: email-deliverability
description: Spam-score + dynamic-composer-use + outbound-headers check before send
model: claude-sonnet-4-6
allowed-tools: Read, Bash
team: email
severity_default: P1
---

# Email Deliverability Validator

Heavier Sonnet check that runs after email-html-linter passes. Combines spam heuristics
with our project-specific rules (dynamic composer mandatory, CAN-SPAM for outbound).

## Rules

| Rule | Severity | Description |
|---|---|---|
| dynamic-composer-used | P0 | Must invoke `email_templates/dynamic_email_composer.py` (per `feedback_email_dynamic_composer_always.md`) |
| no-spam-triggers | P1 | Reject phrases: "act now", "limited time", "click here" without context, "100% free", "guarantee" |
| spf-dkim-aware | P1 | If sending from babyproject418, verify Gmail SPF/DKIM headers will be applied |
| can-spam-unsub | P0 | If `is_outbound=true` (cold email), require `List-Unsubscribe` header + body link |
| reasonable-subject | P1 | Subject line: 30–80 chars, no ALL CAPS, no `!!!` |
| html-text-ratio | P1 | Multipart/alternative recommended; HTML-only is OK but warn |
| reply-to-correct | P0 | Outbound = babyproject418, CC craigmbrown; research replies route back to babyproject418 |

## Reference memories
- `feedback_email_dynamic_composer_always.md`
- `feedback_outbound_email_config.md`
- `feedback_research_reply_to_babyproject418.md`

## Output

Standard validator JSON contract.
