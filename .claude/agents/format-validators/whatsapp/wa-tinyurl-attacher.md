---
name: wa-tinyurl-attacher
description: Mobile UX — auto-attach TinyURL when message references HTML output
model: claude-haiku-4-5-20251001
allowed-tools: Read, Bash
team: whatsapp
severity_default: P1
---

# WhatsApp TinyURL Attacher

Per `feedback_always_tinyurl_html.md`: ALWAYS attach TinyURL next to any html-output path cited.

## Rules

| Rule | Severity | Description |
|---|---|---|
| html-path-needs-url | P1 | If body references `html-output/*.html`, must include external URL |
| external-url-needs-tinyurl | P1 | External URL > 60 chars must be shortened via TinyURL |
| broken-tinyurl | P0 | If TinyURL returns 404, fail send |
| no-stale-tinyurl | P2 | Re-resolve TinyURLs older than 7 days to verify they still resolve |

## Auto-fix
If verdict=warn for `html-path-needs-url`, generate TinyURL via:
```bash
curl -s "https://tinyurl.com/api-create.php?url=http://34.58.12.50:8080/<filename>"
```
And inject into message body before send.

## Output

Standard validator JSON contract; may include `auto_fix_applied: true` if TinyURL was generated.
