---
name: gtm-audit
description: Run the canonical GTM audit playbook — APOS queue + staged drafts + outbound state + recent commits + cron health. Codifies the audit pattern that turned today's "what else for GTM?" question into a 12-item adoption plan. Use whenever the operator asks about GTM status, what to ship next, or what's stale.
allowed-tools: Read, Write, Bash, Grep, Glob
version: 1.0.0
---

# /gtm-audit

**Role:** You are the GTM auditor — you run the 7-phase read-only audit (APOS queue, staged drafts, outbound funnel, cron health, recent commits) and report what's staged-but-unshipped. You audit and report only; you do not deploy or send anything.

Codified GTM audit playbook. The pattern that surfaced 20 staged-but-undeployed GTM artifacts on 2026-05-14 and led to the Tier 1/2/3/4 punch list. Use this skill whenever:

- Operator asks "what else for GTM?" or "what should I build?"
- Operator asks for a status summary of outbound / marketplace / GTM work
- Before claiming GTM is in any particular state, run this audit first

## The 7-phase audit

### Phase 1 — APOS queue (top of mind)

```bash
# GTM-tagged plans, status-aware
jq '.plans | map(select(.gtm_track != null or (.plan_name | tostring | test("GTM|gtm|marketplace|outbound|landing|campaign|customer"; "i")))) | sort_by(-.priority_score) | .[0:15] | map({score: .priority_score, status, rq: .roadmap_id, name: .plan_name[0:70]})' \
  /home/craigmbrown/Project/plan_operationalization/priority_queue_state.json
```

Look for: APPROVED with `execution_attempts: 0` (means: approved but never executed — likely the build-trap signal).

### Phase 2 — Staged drafts (the distribution backlog)

```bash
ls -d /home/craigmbrown/Project/gtm/drafts_* | tail -10
for d in /home/craigmbrown/Project/gtm/drafts_*/; do
  echo "--- $d ---"
  ls "$d" | head -5
done
```

Drafts not yet deployed are the highest-leverage shipping opportunity. Today's audit found ~20 staged artifacts in `drafts_20260511` through `drafts_20260514`. Each is ≤30 min from "in the world."

### Phase 3 — Outbound CRM state (the funnel)

```bash
python3 /home/craigmbrown/Project/scripts/first5_dashboard.py --dry-run --no-tinyurl
# Look at funnel: queued / sent / replied / paid counts
# 0 replied + non-zero sent for > 7 days = pitch / sender-rep / audience problem
```

### Phase 4 — Cron health (broken refs are silent failures)

```bash
crontab -l | grep -E "rq150|first5|outbound|gtm|email_golden" | grep -v "^#"
# For each referenced script, check it exists:
crontab -l | grep -oE "/home/craigmbrown/Project/scripts/[^ ]+" | sort -u | while read f; do
  test -f "$f" && echo "OK: $f" || echo "MISSING: $f"
done
```

The RQ-150 audit found `rq150_funnel_dashboard.py` and `rq150_reply_watcher.py` in cron but absent from disk — silently failing every 15 min / 60 min.

### Phase 5 — Recent GTM commits (what shipped vs talked-about)

```bash
git log --oneline --since="30 days ago" --grep="gtm\|GTM\|marketplace\|outbound\|landing\|RQ-14[0-9]\|RQ-15[0-9]" | head -20
```

Multiple commits labeled "shipped" can hide partial scaffolding (RQ-150 was 30% built across 4 "shipped" commits over 6 weeks).

### Phase 6 — agent-services.json + treasury (revenue truth)

```bash
curl -s -m 8 https://api.craigmbrown.com/a2a/treasury/balances | jq '.platform_health'
curl -s -m 8 https://craigmbrown.com/.well-known/agent-services.json | jq '.services | length'
```

Per `feedback_bo_revenue_verify_live.md`: BO GTM/revenue ALWAYS hit `/a2a/treasury/balances` first; never quote revenue from memory.

### Phase 7 — Send-log activity

```bash
echo "Total RQ-150 sends:" ; grep -c "RQ-150" /home/craigmbrown/Project/data/outbound/send_log.jsonl 2>/dev/null
echo "Replies in watcher state:"; jq '.replies_found | length' /home/craigmbrown/Project/data/outbound/reply_watcher_state.json 2>/dev/null
```

## Output: tiered punch list

After collecting Phases 1-7, the audit produces a punch list in 4 tiers:

| Tier | Definition |
|---|---|
| **Tier 1 — Ship Today** | Assets already exist; ≤30 min each to deploy (web form submissions, PR opens, paste-into-forum) |
| **Tier 2 — Build This Week** | Approved plans not yet built; 1-3 days each |
| **Tier 3 — Build Next Sprint** | Bigger lifts; require operator scoping or external dependencies |
| **Tier 4 — Do NOT Build** | Items that look attractive but are not the build-trap-exit (e.g., new API products with 0 buyers) |

## Output format

Dark-mode dashboard at `/home/craigmbrown/Project/html-output/YYYYMMDD-gtm_next_actions_punchlist.html`. Always include:
- Top metrics card (CRM size, staged drafts, queued plans, sendable emails)
- The 4 tiers
- Three execution paths (Q quick / V volume / B build)
- A "Do not build" anti-list with reasoning

Generate TinyURL. Don't send WhatsApp unless explicitly asked (audits go via dashboard, not P0).

## Phase-checkpoint between audit and recommendation

After collecting evidence (Phases 1-7), STOP and post a 5-line checkpoint:
1. What I found (top 3 surprises)
2. What's clearly the highest-leverage next move
3. What's clearly NOT worth building
4. Estimated tool calls to execute the recommendation
5. Wait for operator "go" before opening any PR or sending any email

Prevents the over-engineering trap of going from "audit" straight to "ship 12 things."

## Anti-patterns this skill prevents

| Failure mode | What this catches |
|---|---|
| Recommending builds before checking if it already exists | Phase 1 + 4 + 5 cross-checks |
| Quoting stale revenue from memory | Phase 6 (treasury live read) |
| Missing the staged drafts directory | Phase 2 |
| Saying "the pipeline is fine" while cron is silently failing | Phase 4 |
| Confusing "commits labeled shipped" with "actually shipped" | Phase 5 + per-file existence check |
