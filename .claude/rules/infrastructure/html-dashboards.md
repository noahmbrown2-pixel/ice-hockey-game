---
paths:
  - "html-output/**"
  - "scripts/*dashboard*"
---

# HTML Dashboard Rules

## File Naming

Format: `YYYYMMDD-descriptive-title.html`
Directory: `html-output/`

Example: `20260303-system-status-report.html`

## Theme (Mandatory)

Dark mode always:
- Background: `#1a1a1a`
- Text: `#e0e0e0`
- Cards/containers: `#2d2d2d`
- Accent: `#4a9eff`
- Code blocks: `#0d1117`

Self-contained HTML5 with all CSS embedded -- no external dependencies.

## Hosting

- Served at `:8080` on thebaby VM
- Public links via `craigmbrown.com` -- **never use raw IPs** in public-facing links
- External URL pattern: `http://34.58.12.50:8080/FILENAME` (internal only)

## Post-Generation Checklist (Mandatory)

1. Save HTML to `html-output/`
2. Generate TinyURL: `requests.get("https://tinyurl.com/api-create.php", params={"url": url})`
3. Send WhatsApp notification to `15712781730` with TinyURL

## Approval Dashboards

- Generator: `scripts/approval_dashboard_generator.py`
- Pattern: multi-choice Q/A form with text feedback
- Data capture: `localStorage` + `POST http://34.58.12.50:8081`
- See @.claude/rules/approval-workflow.md for approval rules
