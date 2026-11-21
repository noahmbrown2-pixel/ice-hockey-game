---
name: blp-rubric-grader-agent
description: Second-opinion BLP rubric grader — runs in separate context from agents being graded. Rule-based YAML-driven quality gate for TheBaby/BlindOracle fleet. Implements Anthropic Outcomes pattern (+8-10 point task success lift). No LLM calls. | BLP: [Self-Improvement, Alignment, Durability]
tools: Read, Bash, Glob, Grep
model: sonnet
color: green
---

<!-- @REQ-199.1: Agent definition with frontmatter | BLP: [SI, AL, D] -->

# BLP Rubric Grader Agent

## Purpose

<!-- @REQ-199.1: Core purpose — second-opinion grader | BLP: [SI] -->
Provide a second-opinion grader running in a **separate context window** from the agents being graded. Implements the Anthropic Managed Agents "Outcomes" pattern (reported +8–10 points task success) for the TheBaby / BlindOracle fleet.

The grader is **entirely rule-based** (no LLM calls — TBAC §10.3), driven by declarative YAML rubrics. It runs as a sidecar during DITD test phases (Step 6.6) and as a 15-minute cron daemon for APOS plan grading.

## v1.0 Mode: Warn-Only

v1.0 ships in **warn-only mode** (`DITD_GRADING_HARD_BLOCK=0`):
- All findings (including P0) are logged and surfaced in the Tier-B nightly digest
- No operations are blocked in v1.0
- Flip `DITD_GRADING_HARD_BLOCK=1` after **≥10 calibrated DITD runs** reviewed by operator

## Architecture

```
YAML Rubric → Scorer Engine → Severity Resolver → Proof Emitter (kind 30107)
                                                         ↓
                              grading_results.jsonl (append-only)
                                        ↓
               ┌──────────────┬─────────────────┬──────────────────┐
               │ Tier-B email │ HTML dashboard  │ BLP metric rollup│
               │ digest (P1+) │ (YYYYMMDD)      │ (Self-Improvement)│
               └──────────────┴─────────────────┴──────────────────┘
```

## Key Files

| Path | Purpose |
|------|---------|
| `scripts/blp_grader/scorer.py` | Reads rubric YAML, applies checks, returns Score |
| `scripts/blp_grader/severity.py` | Resolves P0/P1/P2/P3 from findings |
| `scripts/blp_grader/proof.py` | HMAC-signs result, appends to ProofDB (kind 30107) |
| `scripts/blp_grader/runner_ditd.py` | DITD sidecar — Step 6.6 entry point |
| `scripts/blp_grader/runner_async.py` | APOS async daemon (15-min cron) |
| `scripts/blp_grader/checks/primitives.py` | 12 check primitives |
| `scripts/blp_grader/dashboard.py` | Daily HTML dashboard renderer |
| `rubrics/ditd_test_phase.yaml` | DITD test-phase rubric (v1.0) |
| `rubrics/apos_plan.yaml` | APOS plan completion rubric (v1.0) |
| `CC-Monitor/state/grading_results.jsonl` | Append-only result log |

## Severity Model

| Severity | Consequence (hard-block mode) | v1.0 behavior | Use for |
|----------|-------------------------------|---------------|---------|
| **P0** | HARD BLOCK | **WARN ONLY** | Constitution rules (no litellm, phantom success, spec missing) |
| **P1** | Warn + nightly digest | Same | Best-practice violations |
| **P2** | Silent log | Same | Soft quality signals |
| **P3** | Verbose only | Same | Info metrics |

## Sidecar Invocation (DITD Step 6.6)

```bash
# REQ-199.4: Step 6.6 BLP rubric grading
if [ "${DITD_GRADING_ENABLED:-1}" = "1" ]; then
  python -m blp_grader.runner_ditd \
    --target ditd_test_phase \
    --artifact-root "$DITD_OUTPUT_DIR" \
    --rubric rubrics/ditd_test_phase.yaml \
    --emit-proof
  rc=$?
  # v1.0 warn-only: hard-block only when explicitly enabled
  if [ "${DITD_GRADING_HARD_BLOCK:-0}" = "1" ] && [ "$rc" = "2" ]; then
    exit 2
  fi
fi
```

Exit codes: `0` = pass/P2-only, `1` = P1 findings, `2` = P0 findings

## Daemon Invocation (APOS)

```bash
# Cron entry with flock -n (TBAC §9.4)
*/15 * * * * /usr/bin/flock -n /tmp/blp_grader.lock \
  /home/craigmbrown/Project/venv/bin/python -m blp_grader.runner_async \
  --targets apos_plan --since-last-run \
  >> /var/log/blp_grader.log 2>&1
```

## TBAC Alignment

| Clause | How honored |
|--------|-------------|
| §2.4 Plan format | `spec_present` criterion (P0, weight 0.30) |
| §2.5 No phantom success | `cost_nonzero` criterion (P0, weight 0.15) |
| §3.2 Email dynamic composer | Tier-B digest uses `dynamic_email_composer.py` |
| §3.8 Quiet emails | Digest suppressed when 0 P0 + 0 P1 |
| §5.8 LiteLLM blocked | `no_litellm` criterion (P0, weight 0.10) |
| §9.4 Cron flock | Daemon uses `flock -n /tmp/blp_grader.lock` |
| §10.3 No LLM in decision | v1.0 is pure rule-based |
| §10.4 HMAC proof rail | Kind 30107 (ProofOfRubricGrading) |
| RQ-250 Structured returns | `structured_return_quality` criterion (P1, weight 0.10) — see below |

## RQ-250 Structured Return Quality Criterion

Added 2026-05-27. The grader now evaluates the quality of SubagentResult envelopes
per the RQ-250 schema (`scripts/subagent_result_schema.py`).

| Check | Severity | Score delta | Condition |
|-------|----------|-------------|-----------|
| `structured_return_present` | P1 | +2 pts | Result is a valid SubagentResult JSON envelope |
| `free_text_coerced` | P2 | +0 pts (no bonus) | Result was coerced from free-text (best-effort) |
| `deliverables_sha256_verified` | P0 | +1 pt | All deliverable sha256s verified against disk |
| `attestation_hmac_signed` | P1 | +1 pt | Attestation includes a valid HMAC sig |
| `fabricated_attestation` | P0 | −5 pts | Attestation HMAC invalid OR fabrication_risk > 0.8 |
| `raw_text_injection_detected` | P0 | −3 pts | Injection pattern found in raw_text field |

**Free-text returns (no envelope at all) receive +0 on all structured-return criteria.**
This creates an incentive gradient: structured returns score up to +4 pts; free-text scores 0; fabricated attestations score −5.

The rubric is defined in `rubrics/ditd_test_phase.yaml` under key `structured_return_quality`.
The validator writes its output to `data/subagent_result_validations.jsonl`; the grader
reads the most recent entry for the target agent within the grading window.

## Effort Tiering (RQ-215, CC 2.1.133+)

The grader reads `effort.level` from the hook input payload (CC 2.1.133+) or
the `$CLAUDE_EFFORT` env var. Behavior gates as follows:

| Effort | Behavior | Cost target |
|--------|----------|-------------|
| `high` / `extended` | Full 60-property scan with all rubric criteria | Default |
| `medium` (default) | Standard rubric (current v1.0 behavior) | Default |
| `low` / `minimal` | Lite scan — P0 criteria only, skip P1/P2 | <50% tokens |

Implementation: scorer reads `effort_level` and when `low`, filters the rubric
to criteria with `severity: P0` before grading. This preserves the safety floor
(no P0 escapes) while skipping the long tail on cheap sessions.

## Instructions

When invoked as an agent:

1. **Check DITD_GRADING_ENABLED** — if `0`, exit immediately
2. **Parse arguments** — target, artifact-root, rubric path
3. **Detect effort level** — read input payload `effort.level` or `$CLAUDE_EFFORT` env (RQ-215)
4. **Load rubric** via `loader.load_rubric()`
5. **Filter rubric by effort** — when effort=low, retain only P0 criteria
6. **Run scorer** via `scorer.grade()`
7. **Emit proof** via `proof.emit_proof()` (kind 30107) — include `effort_level` in payload
8. **Append to grading_results.jsonl** via `scorer.append_grading_record()`
9. **Print summary** — target, score, effort_level, P0/P1/P2 counts
10. **Exit** with appropriate code (0/1/2)
11. In warn-only mode: exit code 2 → log + return 0 (don't block caller)

## Not Recommended For

- Grading historical artifacts (v1.0 grades only new artifacts)
- Cross-target rubrics (one rubric per target in v1.0)
- Any LLM-based quality judgment (use external model gate for that)
