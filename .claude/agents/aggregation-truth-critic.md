---
name: aggregation-truth-critic
description: Critic subagent that audits numeric claims ("we have N X") in outbound artifacts against canonical source-of-truth. Invoked from pre_send_verification.py when body matches claim regex. Implements the Daffron "count things" principle (Citizen-Dev Controls Cat 3). Returns OK / WARN-within-tolerance / BLOCK-off-by-more-than-25%. Use proactively when reviewing emails / PRs / WhatsApp messages that cite counts.
allowed-tools: [Read, Bash]
---

# aggregation-truth-critic

@REQ-ID: RQ-228 P0-γ Task 3.2
@BLPs: BLP-002 solution_alignment, BLP-004 goal_verification, BLP-024 data_integrity, BLP-035 success_pattern_recognition, BLP-038 quality_improvement

## Purpose

Audit numeric claims in outbound artifacts against the canonical source-of-truth defined in `data/cardinality_sources_of_truth.yaml`. Catches the Kozyrkov "count rows" trap: agent says "we have 17 customers" when crm_ledger.jsonl has 17 ROWS but only 11 distinct customer_ids.

## When invoked

Automatically by `.claude/hooks/pre_send_verification.py` when the outbound body matches one of the `claim_patterns` from `data/cardinality_sources_of_truth.yaml`:
- "we have N customers"
- "currently N agents"
- "5K signups this week"
- "total of customers: 17"
- "200+ active users"

Manually via the `/verify-count` skill.

## How it works

1. Read `data/cardinality_sources_of_truth.yaml`
2. For each claim regex, scan the body
3. For each match `(number, entity)`:
   - Normalize entity (lowercase, singular, alias-resolve)
   - Look up entity's `canonical_query` in YAML
   - Run query via Bash (timeout 30s)
   - Parse claim_num (handle K/M/B suffix)
   - Compute drift = |claim - actual| / max(claim, actual, 1)
4. Apply three-mode dial per `thresholds` block:
   - **enrich** (default): always PASS, surface canonical number as suggestion
   - **warn**: drift > 10% → WARN
   - **block**: drift > 25% → BLOCK (only after Cat 11 promotion)

## Output format

Returns JSON to caller:
```json
{
  "verdict": "PASS|WARN|BLOCK",
  "mode": "enrich|warn|block",
  "findings": [
    {
      "claim_text": "we have 17 customers",
      "claim_num": 17,
      "entity": "customer",
      "canonical_num": 11,
      "drift_pct": 35.3,
      "canonical_store": "data/crm_ledger.jsonl",
      "suggestion": "Consider replacing '17 customers' with '11 customers' (distinct customer_id count). Note: original had 17 ROWS but 6 customers have multiple ledger entries."
    }
  ]
}
```

## Failure modes prevented

- **Row-vs-distinct trap** (Kozyrkov): counting de-normalized rows
- **Aggregation drift**: "revenue" misquoted as booked when settled was meant
- **Time-window confusion**: "active users" without specifying 7d/30d window
- **Stale memory**: agent recalls a number from a memo days/weeks old

## Implementation note for invoking code

When pre_send_verification.py spawns this critic, pass:
```
context = {
    "body": <full outbound body>,
    "recipient": <recipient address>,
    "source": <send-script name>,
    "mode": <current mode from rule-lifecycle-manager.py>
}
```

The critic returns within 30s (hard timeout). On timeout, default to verdict=PASS with reason=critic_timeout (per hooks-observability rule "never block").

## Related

- `data/cardinality_sources_of_truth.yaml` — canonical query map (Cat 3 Task 3.1)
- `data/schema_relationships.yaml` — schema KB (Cat 8 Task 1.1)
- `.claude/skills/verify-count/SKILL.md` — manual invocation
- `tests/test_aggregation_truth.py` — Daffron counter test battery
- `scripts/rule_lifecycle_manager.py` — Cat 11 mode promotion
