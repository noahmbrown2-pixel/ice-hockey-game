# Tier Promotion Governance — Super Orchestrator A→B→C→D

**Adopted:** 2026-05-25 (answer to "how do we verify we're good at Tier B before Tier C")
**Policy:** `per_rule_conservative`
**Sibling of:** `.claude/rules/override_governance.md` (which governs rule *modes*; this governs tier *unlocks*)
**Checker:** `super_orchestrator/tier_readiness.py`
**State:** `data/tier_readiness_state.json`
**Drills:** `super_orchestrator/tier_readiness_drills.py`

## Why a gate

The live-tier unlock is an env flag (`SUPER_ORCHESTRATOR_LIVE_TIERS`). Before
2026-05-25 there were **no criteria** for flipping it — only aspirational
"Day 15/20" comments. This document makes "are we good enough at Tier B to
unlock Tier C?" a **repeatable, evidence-based GO/NO-GO**, not a judgment call.

## The categorical jump

| Tier | Trigger (confidence_scorer.py) | Capability | Reversibility |
|---|---|---|---|
| A | conf ≥ 0.80 & blast=low | email / journal (write-only) | n/a |
| B | conf 0.50–0.80, OR blast=medium | email + fenced `request_restart` | self-healing |
| **C** | conf < 0.50, OR blast=high/critical | **state mutation behind operator approval** | **needs rollback engine working** |
| D | P0 event class | escalate (WhatsApp) | notify-only |

A/B are "tell the operator." C is "change the system, gated by a human." So
"good at B" does **not** mean "B was quiet." It means the three things C depends
on are proven: (a) B's decisions were correct, (b) rollback works, (c) the
approval loop works end-to-end.

## Policy: per-rule, conservative

Tier-C execution is unlocked for **one `(rule, action_kind)` pair at a time** —
never tier-wide. A pair is eligible only when **all 7 dimensions are green for
that pair** AND it has completed a clean soak. First realistic candidate:
`R1 → request_restart` on the already-fenced `tb-pipeline-v2.service`.

## The 7 readiness dimensions

| # | Dimension | Measure | Conservative threshold |
|---|---|---|---|
| 1 | Decision correctness | operator-flagged false-positive rate of A/B actions for the pair, trailing soak window | ≥5 precedents, **≤5% FP**, 0 unresolved noise loops |
| 2 | Rule coverage | the pair has live precedents OR a passing fault-injection drill | ≥5 precedents **or** drill pass |
| 3 | Reversibility proven | real rollback drill: act → trigger → inverse + `post==pre` | **≥1** drill pass |
| 4 | Approval loop works | mock C proposal → approve (executes+proofs) + reject (dropped) | **≥1 approve + 1 reject** |
| 5 | Observability integrity | proof coverage + ledger honesty + breaker enforced + no silent loops | proof **100%**, ledger==proof |
| 6 | Confidence calibration | predicted conf vs actual decision-correct rate (reliability/Brier) | calibration error **≤ 0.10** on ≥10 labeled samples |
| 7 | Soak + clean window | dwell since the last FP/noise incident for the pair | **≥14 days** clean |

A NO-GO on any single dimension blocks the unlock. The checker prints which.

### Fault-class rules (dim 1)

Rules that fire only on real faults — `R1` (service failed), `R3` (quota
breach), `R5` (phantom-success), `R4-pause` (cost breach) — rarely produce 5
precedents in a healthy fleet, so we do not require 5 real firings. For pairs
tagged `"fault_class": true`, dim 1 requires **all three**:

1. a **2-sided fault-injection drill** — fires with the correct `action_kind`
   on a synthetic fault AND stays silent on a healthy world,
2. **≥1 real production firing** (`min_fault_class_real_firings`, default 1) —
   the rule actually matched a real fault, counted from live executions OR
   file-only advisor matches (`kind=='noop'` + `phase1_advisor`), and
3. **0 open (unresolved) false positives** in the soak window.

**Why #2 exists (reconsidered 2026-05-25):** a bypass test showed that with soak
disabled and calibration simulated, a 2-sided drill alone manufactured a false
GO for a rule that had never fired once. A drill proves the rule fires correctly
*in theory*; #2 proves it handled at least one real fault *in reality*. This is
NOT a relaxation — it is strictly more demanding than the original drill-only
idea. The file-only advisor path means a fault-rule accrues real firings without
being unlocked (it proposes, logged, every time a real fault occurs), so the
chicken-and-egg is avoided.

### Tier classification is per-action, not per-rule

The unlock target tier comes from `confidence_scorer._tier(conf, blast)`, not the
candidate-pair name. Verified mapping:

| action_kind | blast | Tier |
|---|---|---|
| `request_restart` | medium | **B** (already live, fenced to tb-pipeline-v2) |
| `pre_emptive_provider_failover` | medium | **B** |
| `write_pause_list_entry` (R4-pause) | high | **C** |

So `R1:request_restart` is a **Tier-B** pair (and already unlocked) — not a C
candidate. The genuine first **Tier-C** candidate is
`R4-pause:write_pause_list_entry` (blast=high). Each pair carries an
`expected_tier` field; the gate should be read with that in mind.

### Observability fix marker (dim 5)

dim 5 measures **forward** integrity. `data/tier_readiness_state.json` carries an
`observability_fix_at` timestamp; dim 5 only counts ledger/proof contradictions
in rows written **after** that marker (and after the trailing soak window).
Contradictions from a since-fixed bug are surfaced transparently as
`known_pre_fix_contradictions` but do not block forever. Set the marker only
when the underlying observability bug is actually fixed in code.

### Resolved false positives (dim 1 & dim 6)

A false-positive event with `"resolved": true` (root cause fixed) no longer
counts against dim 1, and its actions are **excluded** from the dim 6
calibration sample (they are artifacts of a fixed bug, not current scorer
behavior). dim 6 then honestly reports "insufficient clean samples" until fresh
decisions accumulate — calibration cannot be shortcut, only earned by operation.

## Generating the evidence — 4 drills

Readiness is *manufactured* with controlled, reversible drills (run via
`tier_readiness_drills.py`), not waited for:

1. **fault-injection** — feed `decision_engine.evaluate()` a synthetic world with
   a failing service; assert the rule proposes the right `action_kind` with
   correct evidence. (No real services touched.) → dim 2
2. **rollback** — synthesize an action + pre-snapshot, call
   `rollback_engine.attempt_rollback()` against a degraded synthetic world;
   assert it fires, emits ProofOfRollback (30103), `post != pre`. → dim 3
3. **approval** — file a mock C proposal to the approval queue; simulate an
   approve (would-execute + proofs) and a reject (dropped + logged). Real
   end-to-end with the operator dashboard is the final confirmation. → dim 4
4. **calibration** — replay `outcomes.jsonl`, bucket A/B actions by predicted
   confidence, compare to actual decision-correctness; require reliability
   error ≤ 0.10. Flags contaminated/low samples honestly. → dim 6

## Operator commands

```bash
# GO/NO-GO for a specific pair
python3 super_orchestrator/tier_readiness.py --from B --to C --rule R1 [--json]

# whole-tier snapshot (every rule's status)
python3 super_orchestrator/tier_readiness.py --from B --to C

# record a false positive (resets that rule's soak clock)
python3 super_orchestrator/tier_readiness.py --flag-fp R13 --reason "hourly false-positive loop, fixed 0947928e13"

# run a drill (writes results into tier_readiness_state.json)
python3 super_orchestrator/tier_readiness_drills.py fault-injection --rule R1
python3 super_orchestrator/tier_readiness_drills.py rollback
python3 super_orchestrator/tier_readiness_drills.py approval
python3 super_orchestrator/tier_readiness_drills.py calibration
```

The checker is **read-only** — it NEVER flips `SUPER_ORCHESTRATOR_LIVE_TIERS`.
It tells the operator GO/NO-GO; the operator (or a future approved automation)
edits the env drop-in only after a GO.

## Demotion

A pair already unlocked for C demotes back to file-only if it accrues
**≥3 operator overrides / rejections in 7 days** OR any P0 rollback that
indicates a wrong C decision. Same rhythm as `override_governance.md`.

## Audit

- `data/tier_readiness_state.json` — thresholds, per-rule drill results, FP events, soak starts
- `.claude/tier_readiness_log.jsonl` — append-only GO/NO-GO evaluations + drill runs
- ProofOfRollback (30103) for rollback drills; existing 30100/30102 for action proofs

## Coding Guidelines
See `.claude/rules/karpathy-coding-guidelines.md` for general coding behavior (think before coding, simplicity first, surgical changes, goal-driven execution).
