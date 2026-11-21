# Override & Bypass Governance — Citizen-Dev Controls Cat 11

**@REQ-ID:** RQ-228 P0-γ Task 3.6
**@BLPs:** BLP-013 error_recovery, BLP-031 pattern_learning, BLP-034 error_pattern_recognition, BLP-035 success_pattern_recognition, BLP-055 process_adaptation, BLP-059 hierarchy_adjustment

## Purpose

The control plane has a three-mode dial: every rule runs in `enrich`, `warn`, or `block` mode. This document defines how rules **promote** (enrich → warn → block) and **demote** (block → warn → enrich) automatically based on observed catch-rates and operator overrides.

Without this governance, controls either lock themselves in over-permissive mode forever, or someone has to manually decide when each rule "earns" its way to block-mode. This is the *control of controls*.

## Lifecycle states

```
                  promote                          promote
   enrich ─────────────────────────► warn ─────────────────────────► block
      ▲                                ▲                                │
      │  demote (3+ operator           │  demote (3+ operator           │
      │   overrides in 7d)             │   overrides in 7d)             │
      └────────────────────────────────┴────────────────────────────────┘
```

## Promotion criteria

Rule promotes from `enrich` → `warn`:
- ≥5 confirmed catches in enrich mode (operator did NOT override the suggestion)
- 0 confirmed false positives in 14d window
- Rule has been in enrich for ≥7 days (cooldown)

Rule promotes from `warn` → `block`:
- ≥5 catches in warn mode operator did not override
- 0 false positives in 14d window
- Rule has been in warn for ≥14 days
- Explicit operator unlock OR rule kind in safe-promote allowlist:
  - PII patterns (Cat 1) — auto-promote safe
  - Cohort bleed (Cat 4) — auto-promote safe
  - Egress-proxy bypass (`egress_proxy_bypass`, RQ-233b) — auto-promote safe; warn→block once ≥5 catches + 0 false positives in 14d (centralised-egress security control, low false-positive surface)
  - All others — operator must run `python3 scripts/rule_lifecycle_manager.py --promote <rule_id> --to block`

## Demotion criteria

Rule demotes one level (block → warn, warn → enrich):
- ≥3 operator overrides in 7d → indicates over-triggering
- Operator may pin a rule with `--no-demote` annotation to prevent auto-demotion

## Override semantics

When operator passes `--override` to the underlying hook:
1. Allowed, but logged with `override_reason` (if provided)
2. Counter increments toward demote threshold
3. Operator may also pass `--override --pin-mode` to freeze the rule

## Cron schedule

`scripts/rule_lifecycle_manager.py` runs daily at 03:00 UTC via cron:
```
0 3 * * * cd /home/craigmbrown/Project && python3 scripts/rule_lifecycle_manager.py --apply
```

## State file

`data/rule_state.json` — current mode of each rule + counters:
```json
{
  "rules": {
    "pii_outbound_scan": {
      "current_mode": "enrich",
      "since": "2026-05-17T00:00:00Z",
      "catches": 0,
      "false_positives": 0,
      "operator_overrides": 0,
      "pinned": false,
      "auto_promote_allowed": true
    },
    "egress_proxy_bypass": {
      "current_mode": "warn",
      "since": "2026-05-23T00:00:00Z",
      "catches": 0,
      "false_positives": 0,
      "operator_overrides": 0,
      "pinned": false,
      "auto_promote_allowed": true,
      "owner": "RQ-233b"
    },
    ...
  }
}
```

## Reading the audit log

`.claude/rule_lifecycle_log.jsonl` — append-only state-transition log. Each entry:
```json
{
  "ts": "2026-05-17T03:00:00Z",
  "rule_id": "pii_outbound_scan",
  "from_mode": "enrich",
  "to_mode": "warn",
  "trigger": "auto_promote",
  "evidence": {"catches_14d": 7, "false_positives_14d": 0, "days_in_mode": 8}
}
```

## Related

- `scripts/rule_lifecycle_manager.py` — the daemon
- `data/rule_state.json` — current mode per rule
- `.claude/rule_lifecycle_log.jsonl` — append-only transitions
- All Cat 1/2/3/4/16 rules read their mode from `data/rule_state.json` at startup

## Coding Guidelines
See `.claude/rules/karpathy-coding-guidelines.md` for general coding behavior (think before coding, simplicity first, surgical changes, goal-driven execution).
