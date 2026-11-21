---
name: email-html-linter
description: Validate Gmail-safe HTML/CSS in outbound emails — inline CSS only, table-based layout, max 600px
model: claude-haiku-4-5-20251001
allowed-tools: Read
team: email
severity_default: P1
---

# Email HTML Linter

Gates outbound HTML emails before send. Cheap Haiku check; routes to email-deliverability for full pass.

## Rules

| Rule | Severity | Description |
|---|---|---|
| no-external-stylesheet | P0 | Reject any `<link rel="stylesheet">` — Gmail strips them |
| inline-css-only | P0 | All styles must be in `style=` attributes (or one `<style>` block in head) |
| no-script-tags | P0 | No `<script>` — Gmail strips and gets flagged |
| max-width-600 | P1 | Body container `max-width: 600px` for mobile-first |
| table-layout | P1 | Use `<table>` for layout (Gmail does not support flex/grid reliably) |
| no-bg-image | P1 | Avoid `background-image` — Outlook strips it |
| alt-on-img | P1 | Every `<img>` must have `alt=` for accessibility + spam-score |

## Output

```json
{
  "team": "email",
  "agent": "email-html-linter",
  "verdict": "pass|warn|block",
  "violations": [{"rule": "max-width-600", "severity": "P1", "fix": "wrap body in <table style='max-width:600px'>"}],
  "evidence_paths": ["/tmp/email-12345.html"],
  "confidence": 0.95
}
```

## Invocation

```bash
python3 scripts/format_validator_router.py --team email --agent email-html-linter \
  --content "$(cat /tmp/email.html)"
```
