# CLAUDE.md — QA Multi-Agent Pipeline

**Context: The Mythos Era (April 2026)**

Claude Mythos Preview represents a watershed moment for security. Frontier AI models can now autonomously find and exploit zero-day vulnerabilities at scale. This QA pipeline is designed to help defenders respond rapidly — matching the pace of AI-capable adversaries while preserving rigor in requirement traceability, risk identification, and test coverage.

---

## Mission

This directory implements a multi-agent QA pipeline that operates in two complementary modes, both converging on the same deliverables: Polarion work items (REQ + TC), a passing/failing pytest suite, a Polarion test run, a `tc_wi_mapping.csv` traceability matrix, and an executive QA report.

- **MODE_A — Requirement-driven** (forward path)
  Start from a Polarion requirement. Analyze it, derive a risk register, generate mitigating test cases, optionally implement the feature, write and execute pytest, then produce a traceable QA report and update all affected documentation.

- **MODE_B — Code-driven** (reverse path)
  Start from a codebase change (commit range, branch, module). Reverse-engineer the implicit requirements, identify risks and coverage gaps, generate test cases, back-fill Polarion work items, execute tests, and produce the same QA report.

Mode selection is the `orchestrator`'s first decision. Hybrid runs (e.g. a change touches an existing REQ and introduces undeclared behaviour) run MODE_A on the declared slice and MODE_B on the residual.

---

## The advisor pattern

These agents implement the **advisor pattern**: a fast executor handles most of the work, and a stronger advisor is consulted at strategic moments for plans and course corrections. Inspired by Anthropic's advisor tool (https://platform.claude.com/docs/en/agents-and-tools/tool-use/advisor-tool): pair a faster executor with a higher-intelligence advisor that reads the full context and produces concise guidance (target: under 100 words, enumerated steps).

**When the executor calls the advisor:**
1. **Early** — after orientation (file reads, listing commands) but *before* substantive work. In QA, this means: after reading the requirement / diff, before committing to a risk model or test plan.
2. **When stuck** — recurring errors, non-converging test outcomes, contradictions between requirement text and observed behaviour.
3. **Before declaring done** — after writes and test output are in transcript. Make the deliverable durable first (file written, test run recorded, Polarion updated) so a timeout mid-advice doesn't lose work.

**How the executor treats advice:** follow it unless empirical evidence contradicts a specific claim. A passing self-test is not evidence the advice is wrong. If your evidence conflicts with advice, do one reconcile call rather than silently switching.

## How to invoke the advisor

Shell out via Bash, using the Claude Code CLI in non-interactive print mode:

```bash
claude -p --model <advisor-model> "$(cat <<'EOF'
You are a [role] advisor. The executor has context below.
Respond in under 100 words using enumerated steps, not explanations.

<task>
[current task]
</task>

<transcript>
[what the executor has found so far — file paths, errors, partial output]
</transcript>

What should the executor do next?
EOF
)"
```

For long transcripts, pipe via stdin: `claude -p --model <advisor-model> < prompt.txt`.

Alternatively, advisor calls can be made via the Anthropic SDK (Python/Node) against the Claude API — use the same model IDs.

---

## Claude model family

| Model | ID | Role |
|-------|----|------|
| Opus 4.7 | `claude-opus-4-7` | Flagship — deepest reasoning, long-context (1M tokens) |
| Opus 4.6 | `claude-opus-4-6` | Strong reasoning |
| Sonnet 4.6 | `claude-sonnet-4-6` | Balanced — default for executors |
| Haiku 4.5 | `claude-haiku-4-5` | Fast/cheap — lightweight executors |

---

## Agents

| Agent | Executor | Advisor | Responsibility |
|-------|----------|---------|----------------|
| `orchestrator` | `claude-sonnet-4-6` | `claude-opus-4-7` | Mode selection (A/B/hybrid), pipeline routing, gate enforcement. **Default coordinator.** |
| `team-lead` | `claude-opus-4-7` | `claude-opus-4-7` | Agent Teams variant of orchestrator for high-complexity MODE_A runs. Spawns feature-coder, test-coder, and security-agent as teammates with plan approval. Opt-in only. |
| `requirement-analyst` | `claude-sonnet-4-6` | `claude-opus-4-7` | Parses REQ; produces risk register and candidate TC set |
| `code-analyst` | `claude-sonnet-4-6` | `claude-opus-4-7` | MODE_B only — reverse-engineers REQs from diffs and module structure |
| `polarion-writer` | `claude-sonnet-4-6` | `claude-sonnet-4-6` | Creates/updates REQ + TC work items; maintains `tc_wi_mapping.csv`; duplicate-checks before insert |
| `feature-coder` | `claude-sonnet-4-6` | `claude-opus-4-7` | Implements the requirement under test (MODE_A only); minimal, architecture-respecting |
| `test-coder` | `claude-sonnet-4-6` | `claude-sonnet-4-6` | Generates pytest files; embeds TC-ID in function names |
| `test-executor` | `claude-sonnet-4-6` | `claude-sonnet-4-6` | Runs pytest; emits JUnit XML + coverage; classifies failures |
| `code-reviewer` | `claude-opus-4-7` | *(none — IS the deep pass)* | Fresh-context review of artifacts only (never the writer transcript). Read-only. Gates `test-run-creator`. |
| `prompt-critic` | `claude-opus-4-7` | *(none — IS the deep pass)* | MODE_B post-failure critic. Reads retry transcripts and proposes a diff against the failing agent's prompt. Writes only to `.claude/agents/_proposals/`. Never auto-applies. |
| `rubric-judge` | `claude-opus-4-7` | *(none — IS the deep pass)* | LLM-as-judge for the internal eval bench (`evals/`). Scores an orchestrator run against a frozen rubric across six dimensions. Read-only against the system under test; writes only `verdict.json` + `verdict.md` into the case's results directory. |
| `test-run-creator` | `claude-sonnet-4-6` | `claude-sonnet-4-6` | Creates Polarion test run; attaches evidence; flips TC statuses |
| `report-writer` | `claude-sonnet-4-6` | `claude-sonnet-4-6` | Produces `qa_report.md`; updates `README.md`, `CHANGELOG.md`, and affected ADRs |
| `security-agent` | `claude-sonnet-4-6` | `claude-opus-4-7` | Threat-model overlay, SAST/SCA scan, hardening recommendations |

**Rationale**: Analysis-heavy stages (orchestrator, requirement-analyst, code-analyst, feature-coder, security-agent) pair Sonnet 4.6 execution with Opus 4.7 advisory review — the strongest available reasoning at decision points. Write-focused agents (polarion-writer, test-coder, test-executor, test-run-creator, report-writer) use Sonnet 4.6 for both executor and advisor since the tasks are more mechanical. The `code-reviewer` is the lone exception that uses Opus 4.7 as the **executor** itself: it runs in a fresh context window with no access to writer transcripts, and the strongest model is reserved for this independent-pass checkpoint.

---

## Skills

Shared procedural knowledge lives in `.claude/skills/`, not in individual agent prompts. Agents reference skills by name; Claude Code loads them on demand. This keeps each agent's `.md` focused on its *role* (when to run, what to decide, what to produce) rather than on procedure (CLI syntax, file formats, regex).

| Skill | Loaded by | Contents |
|-------|-----------|----------|
| `polarion-cli` | `polarion-writer`, `test-run-creator` | Canonical Polarion operations (`create-wi`, `link-wi`, `search-wi`, `create-test-run`, `add-test-record`, `attach`), required fields per WI type, idempotency contract |
| `tc-mapping-csv` | `polarion-writer`, `test-run-creator` (and the validation hooks) | The 8-column schema, field ownership, DictReader/DictWriter patterns for read and write-back |
| `tc-id-naming` | `test-coder`, `test-run-creator` | TC-ID format, the embedding regex, parametrized-test conventions, hook behavior |

When you add a new agent or modify an existing one, prefer extracting any procedure repeated across two or more agents into a skill rather than duplicating it. Agent prompts should be short enough that a reader can hold the whole role in their head; skills are where the procedural depth lives.

## Eval bench

Two regression benches live under `evals/`:

- **`run_bench.sh`** — orchestrator bench. Three seed cases (trivial, moderate, complex) scored against rubrics via the `rubric-judge` agent across six weighted dimensions.
- **`run_agent_bench.sh`** — per-agent bench (Phase 11). One seed case each for `code-reviewer`, `prompt-critic`, and `rubric-judge`, scored structurally via `score_agent_run.py`. Catches regressions in the deep-pass agents' own judgment quality.

See `evals/README.md` for layout, how to add cases, and how to run.

Neither bench is a production gate. They are the regression check we run before merging any prompt edit — including (especially) prompt-critic proposals from Phase 4. The agent bench is what catches the case where a prompt-critic proposal would *itself* regress the agent it modifies; the orchestrator bench catches end-to-end pipeline regressions.

## Choosing the coordinator

Coordinator choice is determined by the orchestrator's **effort tiering** (the full rule lives in `orchestrator.md` § "Effort tiering — assign before anything else runs"). Summary:

| Tier | Default coordinator |
|------|---------------------|
| TRIVIAL — single risk, single module, fixup/typo | `orchestrator` |
| NORMAL — 2–3 risks across 1–2 modules | `orchestrator` |
| COMPLEX (MODE_B) — retry loop is inherently sequential | `orchestrator` |
| COMPLEX (MODE_A) — ≥4 risks or ≥2 modules or cross-cutting change | recommend `team-lead` (opt-in via `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`) |

The orchestrator emits its tier assignment in the pre-flight message of every run. When in doubt, it tiers up — under-tiering causes the bigger failure mode (missed risks under a too-small budget). Teams add coordination overhead that only pays off when the work is genuinely parallelizable. See `team_lead.md` for the full opt-in criteria and cost guardrails.

## Pipeline stages

### MODE_A — Requirement-driven

```
requirement-analyst → polarion-writer → feature-coder* → test-coder → test-executor → code-reviewer → test-run-creator → report-writer
                                     ↘ security-agent (parallel) ↗
```
*`feature-coder` runs only when implementation is requested; analysis-only runs skip it.*

1. **Analyze** — `requirement-analyst` reads the Polarion REQ, produces a **risk register** (likelihood × impact × category), and proposes candidate test cases, each linked to the risk(s) it mitigates. Unmitigatable risks are flagged as residual.
2. **Record** — `polarion-writer` creates/updates TC work items, links them to the parent REQ, and appends rows to `tc_wi_mapping.csv`. Before insert, it duplicate-checks by hashed title + REQ-ID to avoid TC bloat across re-runs.
3. **Implement** *(optional)* — `feature-coder` produces a minimal implementation that satisfies the REQ; no scope creep, no speculative generality.
4. **Codify tests** — `test-coder` writes pytest files. Each test function name embeds its TC-ID, e.g. `test_TC_1234_login_rejects_expired_token`. Parametrized cases keep the same TC-ID prefix.
5. **Execute** — `test-executor` runs pytest, emits JUnit XML + coverage report, classifies failures (`assertion` / `error` / `flake` / `env`), and quarantines flakes for a second pass before reporting.
6. **Record run** — `test-run-creator` creates a Polarion test run, attaches JUnit XML and logs, and flips TC statuses (`passed` / `failed` / `blocked`) against `tc_wi_mapping.csv`.
7. **Report** — `report-writer` produces `qa_report.md`, updates `README.md` and `CHANGELOG.md`, touches any affected ADRs, and summarizes coverage delta vs. the previous baseline.

### MODE_B — Code-driven

```
code-analyst → requirement-analyst → polarion-writer → test-coder → test-executor → code-reviewer → test-run-creator → report-writer
```

1. **Reverse-engineer** — `code-analyst` inspects the diff / target module and produces draft REQ statements in given/when/then form, flagging behaviours that have no corresponding Polarion REQ.
2. **Analyze** — `requirement-analyst` enriches drafts with risks and candidate test cases, identifying coverage gaps against existing tests.
3. **Back-fill** — `polarion-writer` creates the missing REQs (linked back to the commit/PR) before creating TCs, preserving traceability.
4. Downstream stages (4–7) are identical to MODE_A.

`feature-coder` is skipped — the code already exists. If the analyst pair identifies required code changes (e.g. missing input validation), those are filed as new MODE_A work items, not patched inline.

---

## Deliverables and artifacts

| Artifact | Producer | Purpose |
|----------|----------|---------|
| `tc_wi_mapping.csv` | `polarion-writer`, `test-run-creator` | Authoritative TC ↔ WI traceability. Columns: `tc_id, wi_id, requirement_id, test_file, test_function, created_at, last_run, last_status`. |
| `risk_register.md` | `requirement-analyst` | Per-feature risk catalogue with likelihood, impact, mitigating TC-IDs, and residual risks. |
| `artifacts/<run-id>/junit.xml` | `test-executor` | Machine-readable test results consumed by `test-run-creator`. |
| `artifacts/<run-id>/coverage/` | `test-executor` | HTML + `coverage.xml` for delta analysis. |
| `qa_report.md` | `report-writer` | Executive summary: scope, mode (A/B), risks covered, pass/fail counts, coverage delta, residual risks, security findings, Polarion links. |
| `docs/README.md`, `docs/CHANGELOG.md`, `docs/adr/*` | `report-writer` | Updated when observable behaviour changes. |

---

## Gate rules (orchestrator-enforced)

These gates block pipeline progression when violated. Violations require explicit override with justification logged to the run transcript.

- **Traceability gate** — no code change ships without at least one TC linked to a REQ in `tc_wi_mapping.csv`.
- **TC-ID embedding** — `test-coder` MUST embed TC-ID in the function name; `test-executor` MUST extract TC-IDs from the JUnit XML and reconcile against `tc_wi_mapping.csv` — mismatches block `test-run-creator`.
- **No-duplicate gate** — `polarion-writer` refuses to create a TC when a hash collision on `(REQ-ID, normalized_title)` exists; it updates the existing TC instead.
- **Green-report gate** — if `test-executor` reports any failure, `report-writer` cannot mark the run as "green"; a residual-risk section is mandatory.
- **Security gate** — `security-agent` findings at severity HIGH or CRITICAL block report finalization until acknowledged or mitigated, and are carried into the report's residual-risk section.
- **Flake gate** — a test classified as `flake` on first pass but `passed` on quarantine pass is reported but does not block; three consecutive flake classifications quarantine the TC and raise a new REQ for investigation.
- **Review gate** — `test-run-creator` MUST NOT proceed when `code-reviewer`'s most recent verdict is `BLOCK`. An `APPROVE_WITH_FINDINGS` verdict permits progression only if the findings are forwarded to `report-writer` for inclusion in `qa_report.md`.
- **Self-improvement gate** — when `orchestrator` exhausts `MAX_RETRIES` in MODE_B, it MUST (1) invoke `prompt-critic`, then (2) invoke `evals/check_proposal.sh` on the proposal so the bench-with-diff verdicts are injected into the rationale, before emitting the human-action report. The report MUST contain a pointer to the proposal AND the regression-check headline. Skipping either step requires an explicit "not invoked: <reason>" line in the report — never silent. This keeps the prompt-improvement loop visible in the failure queue *with* a regression signal attached, so humans never have to evaluate a prompt diff blind.

---

## Invocation

```
Agent(
  description: "Analyse requirement POLARION-1234",
  subagent_type: "requirement-analyst",
  prompt: "Analyze requirement POLARION-1234 for the Authentication project."
)
```

For MODE_B entry:

```
Agent(
  description: "Reverse-engineer REQs from PR #482",
  subagent_type: "orchestrator",
  prompt: "Run MODE_B on branch feature/session-renewal against main. Target module: src/auth/session.py."
)
```

---

## Context discipline (just-in-time loading)

All agents in this pipeline are expected to follow a just-in-time context pattern, especially write agents and any agent operating over per-item collections (risks, TCs, WIs, junit testcases):

1. **The orchestrator passes lightweight identifiers**, not embedded bodies. An agent receives a path to `risk_register.md` and a list of risk IDs — not the full risk text dumped into the prompt.
2. **The agent fetches bodies on demand**, one item at a time, using `grep -n` to locate the row plus `Read` with `offset`/`limit` scoped to that block. Do not read whole files into context unless the operation genuinely requires the whole file.
3. **Capture per-item results before fetching the next item.** Recording a returned WI ID, junit case status, or similar before loading the next item keeps the agent's working context lean and prevents cross-contamination between items.
4. **Source-of-truth files override embedded copies.** If the spawn prompt contains an embedded snippet from `risk_register.md` or the review doc, treat it as a hint at best — always re-fetch the live row before writing. Embedded content drifts when the analyst updates the doc mid-run.

This pattern is the project's primary defense against context rot in long-running QA cycles. Anthropic's published context-engineering guidance is the source: smallest possible set of high-signal tokens, fetched at the moment of need.

## Persona convention

Every agent definition includes a `## Persona` section between the opening pattern paragraph and the first content section. The persona is a concrete, distinctive backstory (3–5 sentences) that pushes the agent toward specific behavior — not a generic "you are a senior engineer" framing. Per CrewAI's published findings and Anthropic's prompt-engineering guidance, a concrete persona shifts model behavior more reliably than abstract role descriptions.

Each persona should:

- Reference a specific failure mode the role guards against (duplicate WIs for polarion-writer, false confidence from too-credulous tests for test-coder, etc.)
- Be distinctive — a reader should be able to identify the agent from its persona alone
- Push behavior, not describe role (the role is already in the description frontmatter)

Keep personas tight. Inflated backstories crowd the prompt and add no value.

## Adding new agents

Frontmatter contract:

```yaml
---
name: my-agent
description: One-line purpose (shown in agent picker)
mode: [A, B]           # which pipeline modes the agent participates in
executor: claude-sonnet-4-6
advisor: claude-opus-4-7
integrity-hash-sha256: SHA256:<hash>
tools:
  - name: Bash
  - name: Read
---

# My Agent

[agent description and workflow]
```

Every new agent must document:
1. Its preconditions (what must exist in the run state before it runs).
2. Its postconditions (what it writes to `tc_wi_mapping.csv`, `artifacts/`, or Polarion).
3. Which gate rules its output feeds.

---

## Advisor Output Validation

Before acting on any advisor output, run it through the validation checklist in `ADVISOR_OUTPUT_CONTRACT.md`. The executor is responsible for rejecting any advisor response that violates the contract — in particular, advice that invents TC-IDs, REQ-IDs, or file paths not present in the transcript must be discarded and re-requested with a clarifying prompt.