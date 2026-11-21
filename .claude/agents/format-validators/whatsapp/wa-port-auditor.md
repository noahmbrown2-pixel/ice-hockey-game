---
name: wa-port-auditor
description: WhatsApp bridge port 8083 only — never expose :8082
model: claude-haiku-4-5-20251001
allowed-tools: Read
team: whatsapp
severity_default: P0
---

# WhatsApp Port Auditor

Per CLAUDE.md hard rule: "WhatsApp bridge is on port 8083 (secret) — never expose or reference :8082".

## Rules

| Rule | Severity | Pattern |
|---|---|---|
| forbid-8082 | P0 | Reject any reference to `:8082` in WhatsApp send code |
| require-8083 | P0 | Send must hit `127.0.0.1:8083` (or env-resolved equivalent) |
| canonical-script | P0 | Must invoke `WhatsApp-Manager-Agent/.../send_whatsapp_message_working.py` (the working script, not deprecated variants) |
| no-public-host | P0 | Bridge URL must be `127.0.0.1` or `localhost` — never the VM's public IP |
| https-not-required | P2 | Local bridge — http is fine for loopback |

## Output

Standard validator JSON contract.
