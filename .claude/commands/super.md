# Super Orchestrator Command

Read-only operator window into the autonomous 6-tier control plane (Phase-1
advisor + Tier-A/B live email path). Use this to inspect what the daemon is
deciding, what it's actually firing, and what it's seeing across the fleet.

The daemon (`super-orchestrator-daemon.service`) runs a 60-second tick. Every
tick it refreshes world state, scores rules, proposes actions, and — when
`SUPER_ORCHESTRATOR_LIVE_TIERS` includes the action's tier — actually hits
the network (currently Tier A,B → email only; Tier B underlying ops, C, D
remain file-only). Identity, decisions, and actions are HMAC-signed into the
proof rail.

## Usage

```bash
# Quick status (all subcommands map to file reads or systemctl queries)
/super status                  # daemon heartbeat + breaker + ledger summary
/super tiers                   # which tiers are live, what caps apply
/super top-stalled             # top-5 score-sorted stalled plans (R7 input)
/super inventory               # PROD/DORMANT/STALE/DEAD/GHOSTED counts
/super docs                    # list auto-generated docs in super_orchestrator/docs/
/super tail-ledger N           # last N action-ledger entries (jq pretty)
/super tail-proofs N           # last N HMAC proofs
/super tail-journal            # last 5 min of daemon log
```

Examples (one-liners — copy-paste into a shell):

```bash
# Heartbeat + tier matrix
cat super_orchestrator/state/daemon_heartbeat.json | jq
systemctl show super-orchestrator-daemon.service -p Environment --value \
  | tr ' ' '\n' | grep SUPER_ORCH

# Top-5 stalled plans (post-score-sort fix, PR #207)
jq '.stalled[0:5] | map({score, plan_id, reason})' \
  super_orchestrator/state/roadmap_snapshot.json

# Liveness counts
jq '.summary' super_orchestrator/state/liveness_report.json

# Auto-generated docs
ls super_orchestrator/docs/   # 7 markdown files refreshed hourly
```

## Architecture (current — Phase 1 advisor)

```
super_orchestrator/
├── daemon.py                 # main 60s tick loop
├── state_aggregator.py       # mtime-gated → state/world_state.json
├── roadmap_tracker.py        # APOS queue → state/roadmap_snapshot.json (score-sorted)
├── decision_engine.py        # R1–R12 rule registry → ranked Actions
├── confidence_scorer.py      # confidence formula
├── action_executor.py        # is_live(tier,kind) gate + email path + ledger
├── circuit_breaker.py        # 60/h global, 1/h per-target (env-tunable), 600s dedup
├── rollback_engine.py        # post-action eval (DORMANT until first state-mutating op)
├── proof_emitter.py          # HMAC kinds 30100–30104 → state/proofs.jsonl (only emits on real exec; noop ticks suppressed)
├── outcome_recorder.py       # delta capture → state/outcomes.jsonl
├── efficiency_meter.py       # tokens-avoided, code_first_score
├── memory_reader.py          # MEMORY.md + feedback memories on demand
├── capability_discoverer.py  # daily scan → state/capability_registry.json
├── liveness_classifier.py    # PROD/DORMANT/STALE/DEAD/GHOSTED
├── ops_docs_generator.py     # docs/*.md (auto-generated, never hand-edit)
└── api_server.py             # FastAPI :8081 — /world-state /roadmap /capabilities …
```

State files live in `super_orchestrator/state/`. Auto-generated docs live in
`super_orchestrator/docs/`. Both are refreshed by the daemon's slow-cadence
loop on a 1-hour cadence (controlled by `SUPER_ORCHESTRATOR_SLOW_CADENCE_TICKS`).

## Tier model

| Tier | What | Live today |
|---|---|---|
| A | Auto-act, low blast (email_digest, noop, emit_p0_journal_event) | ✅ live |
| B | Companion email digests for R1/R3/R4/R8/R11 | ✅ live (PR #208) |
| B | Underlying ops (request_restart, pre_emptive_provider_failover) | file-only until Days 15/20 |
| C | HITL — operator approval required | file-only |
| D | P0 escalation (WhatsApp) | file-only |

Per-tier control via `/etc/systemd/system/super-orchestrator-daemon.service.d/tier-a-live.conf`:
```
Environment=SUPER_ORCHESTRATOR_LIVE_TIERS=A,B
Environment=SUPER_ORCHESTRATOR_GLOBAL_MAX_PER_HOUR=60
Environment=SUPER_ORCHESTRATOR_PER_TARGET_MAX_PER_HOUR=10
```

## Run-state queries

```bash
# Service state
systemctl status super-orchestrator-daemon.service
journalctl -u super-orchestrator-daemon.service --since "10 min ago"

# Most-recent N tick summaries
journalctl -u super-orchestrator-daemon.service --since "1 hour ago" \
  | grep -E '^.*tick#'
```

## API endpoints (read-only — port 8081)

```bash
curl -s http://127.0.0.1:8081/world-state | jq
curl -s http://127.0.0.1:8081/roadmap | jq '.top_5_by_score, .stalled[0:5]'
curl -s http://127.0.0.1:8081/capabilities | jq '. | {version, agents: (.agents|length)}'
curl -s http://127.0.0.1:8081/liveness | jq '.summary'
curl -s http://127.0.0.1:8081/efficiency | jq
curl -s http://127.0.0.1:8081/docs/OPERATIONS.md
```

## BLP Properties

The Super Orchestrator implements the autonomy layer of the BLP framework:
- Alignment: rule-first decisions with human-readable `{what, why, evidence, risk, rollback, confidence}`
- Autonomy: tiered live unlock, no LLM in the MVP decision path
- Durability: HMAC proof rail, file-only state, mtime-gated refreshes
- Self-Improvement: efficiency_meter tracks code_first_score (target ≥ 0.95)
- Self-Replication: settings-knowledge snapshot + portability/export+import SHIPPED 2026-05-22 (`settings_knowledge/snapshot_scanner.py` → `state/settings_knowledge.json` with HIGH/MED/LOW replication priority; `portability/{export_state,import_state}.py` for redacted DR bundles; cross-VM sync built but env-gated off via `SUPER_ORCHESTRATOR_SYNC_ENABLED`)
- Self-Organization: capability_discoverer auto-registers new agents/services daily

## Files (verified live as of 2026-04-27)

Verified by `liveness_classifier.py` — all paths below are PRODUCTION:

| Module | Purpose |
|---|---|
| `super_orchestrator/daemon.py` | 60s tick loop |
| `super_orchestrator/decision_engine.py` | R1–R12 rule registry |
| `super_orchestrator/action_executor.py` | tier-gated execution + ledger |
| `super_orchestrator/api_server.py` | read-only REST on :8081 |
| `super_orchestrator/OWNERSHIP.md` | hand-written authority table |
| `super_orchestrator/docs/OPERATIONS.md` | auto-generated current state |
| `super_orchestrator/docs/CAPABILITY_REGISTRY.md` | auto-generated agent/service inventory |
| `super_orchestrator/docs/DEAD_CODE_AUDIT.md` | auto-generated stale/ghost report |
| `super_orchestrator/docs/ROADMAP_VIEW.md` | auto-generated APOS top-5 + stalled |

> Phase-0 design fossils (Feb 2026, four references to never-built files) were removed from this skill in 2026-04-27 cleanup. The Phase-1 advisor architecture (April 2026, PRs #203/205/206/207/208) supersedes them. The liveness classifier flagged the originals; this rewrite closes the loop.

## Related Commands

- `/apos-control` — APOS plan queue inspection (peer system)
- `/super` (this) — Super Orchestrator status
- `/status` — overall system health
