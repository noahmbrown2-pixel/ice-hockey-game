# Format Validator Fleet (RQ-189)

28 validator agents across 5 teams that gate outbound content from the TheBaby fleet.
Built from the Pi `damage-control` concept; consumed by `scripts/format_validator_router.py`.

## Teams

| Dir | Team | Agents | Trigger |
|---|---|---|---|
| `email/` | Email format | 5 | Hook on `unified_email_responder.py` + `dynamic_email_composer.py` |
| `whatsapp/` | WhatsApp messages | 5 | Hook on `send_whatsapp_message_working.py` + `notification_ledger.py` |
| `dashboard/` | Dashboard format | 6 | Write tool when path matches `html-output/*.html` |
| `redteam/` | Security red team | 6 | Nightly cron 03:00 UTC + on new agent spawn |
| `docs/` | Documentation | 6 | Pre-commit on .md/.yaml writes; weekly summary 09:00 UTC Mon |

## Common contract

Every agent returns:
```json
{
  "team": "email|whatsapp|dashboard|redteam|docs",
  "agent": "agent-id",
  "verdict": "pass|warn|block",
  "violations": [{"rule": "...", "severity": "P0|P1|P2", "fix": "..."}],
  "evidence_paths": ["..."],
  "confidence": 0.0
}
```

Aggregator: `scripts/format_validator_router.py` collects per-agent verdicts and emits a single
team verdict to `data/format_validators/verdicts.jsonl`. Hard rules:
- Any P0 violation = team verdict `block`
- Any P1 violation = team verdict `warn` (allow, log, surface in status)
- All-pass = `pass`

## Severity policy

New rules ship at **P1** for 48h. Promote to **P0** only if no false positives observed.
Demotion happens automatically: 5 false positives in 24h = auto-demote to P2.

## Plan A scope

Plan A ships agent **specs** only (these .md files) + the router. Hook integration
(actually invoking these on send/Write) is a follow-up DITD plan to keep the
production hook surface clean.
