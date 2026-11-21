# OWASP ASI Top 10 — Hand-Curated Pattern Library

<!-- HAND-CURATED. Not auto-generated. Lives alongside auto-learned-errors.md (which is generated). -->
<!-- Created 2026-05-19 as Rec #6 of GenAI Harness Self-Assessment deliberation. -->
<!-- Loadable by inject_context() — patterns prepended to phase prompts. -->

Companion to `.claude/rules/auto-learned-errors.md` (auto-generated, narrow). This file
codifies adversarial-pattern recognition from OWASP Top 10 for Agentic Applications 2026
(ASI01–ASI10) plus 10 internal-incident patterns observed in the TheBaby / BlindOracle
fleet. Each pattern has: regex/signature, severity, mitigation, and a reference to the
canonical control or incident that motivated it.

**Review cadence:** Weekly (every Monday 10:00 UTC). Add a pattern when:
1. A red-team agent (`red-prompt-injector`, `red-credential-leaker`, `red-delegation-forger`,
   `red-marketplace-tos`, `red-massat-runner`, `red-trap-content`) catches something new.
2. A `pre_send_verification.py` block fires that doesn't match any existing pattern.
3. A post-incident review surfaces a pattern not yet codified.

## Tier 1 — OWASP ASI Top 10 (2026)

### ASI01 — Agent Goal Hijack

#### P-ASI01-A: Prompt injection in fetched web content
**Severity:** P0
**Signature:** `(?i)(ignore\s+(previous|prior|all)\s+instructions|system\s*:\s*you\s+are\s+now|new\s+system\s+prompt)`
**Mitigation:** Route all `WebFetch`/`WebSearch` output through `scripts/content_trap_scanner.py::ContentTrapScanner.quick_scan()` before passing to downstream agents. Enforced by `pre_tool_use.py` hook.
**Reference:** RQ-173, `.claude/rules/security/trap-defense-enforcement.md`

#### P-ASI01-B: Indirect injection via tool output (file contents, search results)
**Severity:** P0
**Signature:** Multi-stage: content contains markdown link with `data:text/html;base64,` OR contains a fenced code block with shell commands that an agent could shell out.
**Mitigation:** Sanitize tool outputs before re-passing to LLM; flag base64 payloads &gt;1KB; flag `bash -c` chains.
**Reference:** `scripts/content_trap_scanner.py::deep_scan()`

#### P-ASI01-C: Self-modifying goal via memory write
**Severity:** P0
**Signature:** Agent attempts `Write` to `.claude/CLAUDE.md`, `MEMORY.md`, `v5_memory/**`, or `.env` without a `--justify` annotation or operator approval marker.
**Mitigation:** PreToolUse hook blocks; logged to `data/blocked_memory_writes.jsonl`. Memory writes require `capture_to_inbox()` flow.
**Reference:** `memory_forensics_auditor.py` (04:00 UTC daily)

### ASI02 — Tool Misuse &amp; Exploitation

#### P-ASI02-A: Unsafe tool-chain (read-secret → write-external)
**Severity:** P0
**Signature:** Within one session: `Read` of `.env`/`secrets/**`/credentials, followed by `Bash`/`WebFetch`/`mcp__*__send_*` to an external destination.
**Mitigation:** `blast-radius-critic` + `pre_send_verification.py` rule corpus. Block any outbound that follows a secrets read inside 60 seconds.
**Reference:** `.claude/agents/blast-radius-critic.md`

#### P-ASI02-B: Tool-output coercion (model treats tool output as instructions)
**Severity:** P1
**Signature:** `(?i)(execute|run)\s+the\s+following|please\s+(call|invoke)\s+tool` appearing in tool outputs (not user prompts).
**Mitigation:** `intent-critic` evaluates whether the action being executed matches operator's last stated intent.
**Reference:** `.claude/agents/intent-critic.md`

#### P-ASI02-C: Ambiguous tool argument interpretation (e.g., path traversal)
**Severity:** P1
**Signature:** Tool input contains `\.\./` chain &gt;3 OR resolves outside the project directory.
**Mitigation:** Path resolver in PreToolUse hook; reject if `Path.resolve()` escapes `/home/craigmbrown/Project/`.
**Reference:** `.claude/hooks/pre_tool_use.py`

### ASI03 — Identity &amp; Privilege Abuse

#### P-ASI03-A: Forged DELEGATION_CONTEXT block
**Severity:** P0
**Signature:** Subagent prompt contains `DELEGATION_CONTEXT` JSON whose `signature` field does not verify against parent's HMAC key, OR `delegator_passport_hash` is missing.
**Mitigation:** `red-delegation-forger` red-team agent + signature verification in `pre_tool_use.py`. ProofOfDelegation kind 30014 only emitted after verification.
**Reference:** `data/delegation_proofs.json`, `.claude/agents/red-delegation-forger.md`

#### P-ASI03-B: Privilege escalation via subagent (parent task at L3, subagent acts at L5)
**Severity:** P0
**Signature:** Child agent attempts blast-radius tier higher than parent's `delegation_kind` allows.
**Mitigation:** Tier-gating in `action_executor.is_live(tier, kind)`. Tier C/D require operator approval regardless of parent scope.
**Reference:** `super_orchestrator/action_executor.py`

#### P-ASI03-C: Revoked-passport delegation attempt
**Severity:** P1
**Signature:** `delegator_passport_hash` matches an entry in `data/revoked_passports.json`.
**Mitigation:** `revoke()` flow in `agent_onboarding.py` writes to revoked list; PreToolUse hook checks before emitting proof.
**Reference:** `chainlink-prediction-markets-mcp-enhanced/services/onboarding/agent_onboarding.py::revoke()`

### ASI04 — Agentic Supply Chain Vulnerabilities

#### P-ASI04-A: Third-party MCP server with no signed release
**Severity:** P1
**Signature:** MCP server in `~/.claude.json` whose source repo has no signed git tag matching its declared version.
**Mitigation:** Pre-install audit via `scripts/audit_mcp_supply_chain.py` (queued); manual review until shipped. Sigstore/cosign on local builds.
**Reference:** Rec #8 of 2026-05-19 deliberation

#### P-ASI04-B: Unrouted .md agent stub (dormant attack surface)
**Severity:** P2
**Signature:** Agent .md file in `.claude/agents/` not present in `super_orchestrator/state/capability_registry.json` AND last-mtime &gt; 30d.
**Mitigation:** `scripts/propose_dormant_archival.py` flags candidates; quarantine behind `active_capability_registry` import gate.
**Reference:** `super_orchestrator/liveness_classifier.py` (already classifies)

#### P-ASI04-C: Skill version mismatch (skill loaded ≠ skill registered)
**Severity:** P1
**Signature:** SKILL.md `version:` field in frontmatter differs from `data/skills_versions.json` entry by &gt;1 major.
**Mitigation:** Skill loader checks version on `/skill <name>` invocation.

### ASI05 — Memory Poisoning

#### P-ASI05-A: Direct write to v5_memory bypassing inbox flow
**Severity:** P0
**Signature:** `Write` to `v5_memory/knowledge/**` or `v5_memory/episodic/**` without prior `capture_to_inbox()` proof in same session.
**Mitigation:** `memory_forensics_auditor.py` daily audit; PostToolUse hook flags. ProofOfMemoryIntegrity (kind 30015).
**Reference:** `scripts/memory_forensics_auditor.py`

#### P-ASI05-B: Memory write with unverifiable source
**Severity:** P1
**Signature:** New entry to `MEMORY.md` topic file with no `**Why:**` line citing a session_id, file path, or external reference.
**Mitigation:** Memory-write linter in PostToolUse; require provenance for any memory entry classified as `feedback` or `project`.

#### P-ASI05-C: Mass-overwrite of MEMORY.md (truncation attack)
**Severity:** P0
**Signature:** `Write` to `MEMORY.md` reduces line count by &gt;20% in a single edit, OR overwrites with no `[[link-name]]` references preserved.
**Mitigation:** Backup before each write; reject if size delta exceeds threshold without `--force-memory-prune` flag.

### ASI06 — Cascading Hallucination

#### P-ASI06-A: Downstream agent accepts upstream output without verification
**Severity:** P1
**Signature:** Multi-agent chain where downstream's argument is `f"based on the previous agent's report: {prior_output}"` without spot-check or fact-cite step.
**Mitigation:** `aggregation-truth-critic` + `critic_pool.py` peer cross-talk before final send.
  **RQ-250 (2026-05-27):** `SubagentResult` pydantic schema enforces a typed boundary at the subagent → parent handoff.
  `post_tool_use.py` intercepts Agent/Task tool results and validates the envelope via `scripts/subagent_result_validator.py`.
  `raw_text` is isolated (never inlined into parent prompt); `findings[]` (typed) is the only trusted surface.
  Phantom-success fix (P-INT-10): every `deliverables[*].sha256` is verified against actual file content.
  Mode lifecycle: `enrich` (default) → `warn` → `block` per `.claude/rules/override_governance.md`.
**Reference:** `.claude/agents/aggregation-truth-critic.md`, `scripts/critic_pool.py`,
  `scripts/subagent_result_schema.py`, `scripts/subagent_result_validator.py`,
  `data/subagent_result_validations.jsonl` (RQ-250)

#### P-ASI06-B: Numeric claim with no canonical-count source
**Severity:** P1
**Signature:** Outbound artifact contains `\d+` followed by entity noun (customer, agent, lead) but no preceding `canonical-count` query in session log.
**Mitigation:** `/canonical-count` skill (Citizen-Dev Cat 15); `verify-count` skill returns OK/WARN/BLOCK with proof.
**Reference:** `.claude/skills/verify-count/SKILL.md`, `.claude/skills/canonical-count/SKILL.md`

### ASI07 — Inter-Agent Communications Abuse

#### P-ASI07-A: Unsigned peer-to-peer message via /coms
**Severity:** P1
**Signature:** Entry in `~/.thebaby/coms/*` with no `hmac:` field OR hmac fails verification.
**Mitigation:** `scripts/coms.py::send()` signs all outgoing; `scripts/coms.py::get()` verifies on receipt.
**Reference:** `scripts/coms.py` (RQ-232, 2026-05-19)

#### P-ASI07-B: Replay of stale peer message (timestamp &gt; 1h old)
**Severity:** P2
**Signature:** `coms get` returns message whose `ts` is &gt;3600s before current time AND seen-cache miss.
**Mitigation:** Time-window check; replay-protection seen-cache (`data/coms_seen.json`).

### ASI08 — Resource Exhaustion

#### P-ASI08-A: Agent loop without breaker
**Severity:** P0
**Signature:** Same `agent_id` + `tool_name` invoked &gt;10 times per hour for the same target.
**Mitigation:** `circuit_breaker.py` — 60/h global, 10/h per-target, 600s dedup.
**Reference:** `super_orchestrator/circuit_breaker.py`

#### P-ASI08-B: Daemon stampede after restart (multiple instances race)
**Severity:** P1
**Signature:** Cron job starts &gt;1 process for the same script within 5 minutes; both holding the same lockfile target.
**Mitigation:** `flock -n /tmp/X.lock` in cron entry + `fcntl.flock` in-script. See `cron_daemon_stampede_antipattern.md` memory.
**Reference:** Per memory: 2026-04-19 incident (169 orphans).

#### P-ASI08-C: Token bomb in single LLM call (&gt;500K tokens to a 200K-context model)
**Severity:** P1
**Signature:** LLM call with `input_tokens` &gt; configured model max.
**Mitigation:** Pre-call token estimator; route to 1M-context model (XAI/Grok) or chunk.

### ASI09 — Insecure Output Handling

#### P-ASI09-A: External email contains private GH URL
**Severity:** P0
**Signature:** Outbound email/landing/social post contains `github.com/(craigmbrown/ETAC-System|craigmbrown/chainlink-prediction-markets-mcp-enhanced)` (both private).
**Mitigation:** `pre_send_verification.py` rule corpus; blocked at hook.
**Reference:** `feedback_only_public_gh_urls_in_outbound.md` (2026-05-17)

#### P-ASI09-B: Bare-Gmail From without display name
**Severity:** P1
**Signature:** Outbound email From-header = `babyproject418@gmail.com` or `craigmbrown@gmail.com` with no quoted display name.
**Mitigation:** `identity-critic` + `pre_send_verification.py`. Required format: `"Craig Brown — BlindOracle" <babyproject418@gmail.com>`.
**Reference:** Jesse Pollak incident 2026-05-13; `feedback_verify_external_email_before_send.md`

#### P-ASI09-C: Green-on-black email to light-mode Gmail recipient
**Severity:** P1
**Signature:** External cold email rendered with `#0a0a0a` background + `#00ff41` text and recipient class = external.
**Mitigation:** `preview-as-recipient` skill renders in light-mode before send. External cold = light-mode HTML (#222 on #fff).
**Reference:** `.claude/skills/preview-as-recipient/SKILL.md`

### ASI10 — Untraceable Autonomy

#### P-ASI10-A: Autonomous action with no proof emission
**Severity:** P0
**Signature:** Action recorded in `super_orchestrator/state/action_ledger.jsonl` but no corresponding entry in `super_orchestrator/state/proofs.jsonl` for the same `action_id`.
**Mitigation:** `proof_emitter.py` runs synchronously on every state-mutating action. Noop ticks suppressed.
**Reference:** `super_orchestrator/proof_emitter.py`

#### P-ASI10-B: HMAC key rotation without audit chain
**Severity:** P1
**Signature:** New HMAC key in env without matching `key_rotation_log.jsonl` entry.
**Mitigation:** Key rotation must emit ProofOfKeyRotation (proposed kind 30017) — queued.

## Tier 2 — Internal-Incident Patterns (TheBaby / BlindOracle specific)

#### P-INT-01: Dry-run sent real email
**Severity:** P0
**Signature:** Send command flag `--dry-run` paired with `--send` OR with real SMTP credentials in same execution.
**Mitigation:** Mutually-exclusive flags enforced; `--dry-run` routes to test recipient or returns rendered body without SMTP.
**Reference:** 2026-05-14 incident; `feedback_verify_external_email_before_send.md`

#### P-INT-02: Backfill stamped with current time instead of original
**Severity:** P0
**Signature:** Stage-advance from `send_log.jsonl` uses `_now_iso()` instead of `rec["timestamp"]`.
**Mitigation:** Code review checklist; lint rule `outbound_crm.py::backfill` must pass `ts=rec["timestamp"]`.
**Reference:** 2026-05-14 fix.

#### P-INT-03: Renamed-variable bug in log statement
**Severity:** P1
**Signature:** Variable renamed; `log.info(f"... {old_name}")` orphaned.
**Mitigation:** `python -m py_compile <file>` PostToolUse hook; lint pass after rename.
**Reference:** `feedback_test_before_ship` (2026-05-15).

#### P-INT-04: TB voice cmd classified as TODO when it's approval
**Severity:** P1
**Signature:** TB voice transcript matches `(approve|go|build it|ship it)` but gets routed to APOS as plan-request.
**Mitigation:** Regex gate in `tb_scout/intent_extractor.py` BEFORE LLM call; route to approval handler.
**Reference:** `feedback_tb_voice_is_approval.md`

#### P-INT-05: Cron daemon stampede (169 orphans)
**Severity:** P0
**Signature:** &gt;5 processes of same script running concurrently from cron.
**Mitigation:** `flock -n /tmp/X.lock --once` + in-script `fcntl.flock`. See ASI08-B.
**Reference:** 2026-04-19 incident.

#### P-INT-06: `git add` silently drops gitignored sub-paths
**Severity:** P0
**Signature:** `agents/mesh/lib/`, `**/build/`, `**/dist/`, `**/cache/` added but missing from `git status -s | grep "^A"` output.
**Mitigation:** `!path/to/protected/` exception line in `.gitignore`; check `git status --short | grep "^A"` matches expected file list before commit.
**Reference:** PR #2225/#2227 incident, CLAUDE.md "Commit/Merge Verification" section.

#### P-INT-07: GitHub PR shows MERGED but main never moved
**Severity:** P0
**Signature:** `gh pr merge` succeeded; `git ls-tree origin/main &lt;expected-path&gt;` returns nothing.
**Mitigation:** Post-merge verification: `git fetch origin main &amp;&amp; git ls-tree origin/main <path>` for each expected new file.
**Reference:** 2026-05-15 PR #2227 lost merge.

#### P-INT-08: Plan reads as sprint goal when horizon was aspirational
**Severity:** P1
**Signature:** Strategic blueprint plan executed against current sprint scope instead of filtered out of 7-day brief.
**Mitigation:** `## Metadata: Horizon: aspirational|this_year|this_quarter|this_week` required field; validator `scripts/plan_horizon_validator.py`.
**Reference:** RQ-209.

#### P-INT-09: Calendar 100% decorative (316 ghosts)
**Severity:** P2
**Signature:** Calendar event with `privateExtendedProperty.tb_outcome_v1` field empty AND age &gt;7 days.
**Mitigation:** `calendar_outcome_updater.py` cron job (purged 316 ghosts on 2026-05-01).

#### P-INT-10: Phantom-success — phase claimed $0 cost + zero deliverables
**Severity:** P1
**Signature:** DITD phase reports success with cost ≤ $0.01 AND `deliverables` list empty.
**Mitigation:** `plan_deliverable_validator.py` parses `## Relevant Files / New`, checks each exists, has size &gt;0, and contains executable code. `DITD_VALIDATOR_ENFORCE=1` env.
**Reference:** 2026-05-01 4/4 phantom completions; `feedback_validator_enforce`.

## Loading

To inject these patterns into a phase prompt, call:
```python
from scripts.context_injector import inject_context
ctx = inject_context([
    ".claude/rules/auto-learned-errors.md",       # auto-generated
    ".claude/rules/owasp-asi-pattern-library.md", # this file
])
```

The DITD `inject_context()` hook should be updated to read both files.

## Metrics

Tracked in `data/asi_pattern_metrics.json` (created on first run):
- patterns_total: 30 (10 ASI × 3 + 10 internal)
- patterns_with_active_mitigation: count of mitigations whose tooling exists
- patterns_with_canonical_reference: count with a file/line reference
- patterns_seen_in_30d: count whose signature matched at least once

Weekly cron `scripts/asi_pattern_metrics_updater.py` (queued) updates the dashboard at `html-output/asi-pattern-coverage.html`.

## Coding Guidelines
See `.claude/rules/karpathy-coding-guidelines.md` for general coding behavior (think before coding, simplicity first, surgical changes, goal-driven execution).
