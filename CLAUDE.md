# Copyright (c) 2025 Craig M. Brown. All rights reserved.

# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Project Overview

A comprehensive Multi-Agent System ecosystem with 42+ specialized agents achieving 79-83% cost reduction through intelligent multi-provider LLM routing. Supports XAI/Grok models with 2M token context windows and Base Level Properties (BLP) framework with 100% property coverage (60/60).

**Core Projects:**
- **Limitless Lifelog Manager**: Voice transcript processing -> Notion items
- **TheBaby_Agents**: 19 Single File Agents (SFA) for specialized tasks
- **Orchestrator-Agent**: 13 coordination agents with human-in-the-loop
- **WhatsApp-Manager-Agent**: 6 communication and notification agents
- **BlindOracle**: CRE-integrated prediction market platform with 25 agents (see `chainlink-prediction-markets-mcp-enhanced/`)
- **MCP Server Infrastructure**: 10+ Model Context Protocol servers
- **Claude Code Hooks Observability**: Native observability with 16+ metrics

## Technology Stack

- **Python 3.11+** with type hints and pydantic validation
- **Package Management**: Mixed UV (MCP servers) and pip (main project)
- **LLM Providers**: OpenAI, Anthropic, Google Vertex AI, Venice AI, XAI (Grok), DeepSeek
- **Background Services**: Systemd for production deployment
- **External APIs**: Google (Gmail/Calendar), ElevenLabs (TTS), Firecrawl, Tavily

## Key Commands

### Setup
```bash
cp .env.example .env && source venv/bin/activate
pip install -e ./Limitless-Lifelog-Manager
pip install -r Orchestrator-Agent/requirements.txt
pip install -r TheBaby_Agents/requirements.txt
for dir in *-mcp*/; do cd "$dir" && uv sync && cd ..; done
```

### Testing
```bash
black . && isort . && flake8 && mypy src/
pytest -v
pytest -m "not slow"
pytest --cov=src
```

### Application Usage
```bash
# Lifelog
lifelog                          # Basic daily sync
lifelog --verbose --days 7       # Process last 7 days

# Gmail (basic - no threading)
python gmail_manager.py unread --max-results 10
python gmail_manager.py send --to "email@example.com" --subject "Sub" --body "Msg"
python gmail_manager.py search --query "from:notifications"

# Gmail (threaded - full HTML templates)
python3 scripts/unified_email_responder.py reply --to EMAIL --subject "Re: X" --body "HTML"

# WhatsApp
python WhatsApp-Manager-Agent/WhatsApp_Manager_Agent/send_whatsapp_message_working.py \
  --to 15712781730 --message "Task completed"

# Agent operations
cd TheBaby_Agents && python cli.py --list-agents
cd Orchestrator-Agent && python orchestrator_repl.py
```

### Service Management
```bash
sudo systemctl start agent-monitor.service llm-router.service
sudo systemctl status agent-monitor.service
journalctl -u agent-monitor.service -f
python bin/lifelog_monitor.py
```

## Architecture Overview

### System Layers

1. **Orchestration**: Root orchestrator manages workflow dependencies and context
2. **Agent Projects**: SFAs with UV deps, grouped by function (TheBaby, Orchestrator, WhatsApp)
3. **MCP Servers**: 10+ servers provide external tool integration with cost tracking
4. **Services**: Systemd services with auto-restart, health monitoring, cron scheduling

### Processing Pipeline (Lifelog)

Fetch -> Filter -> Extract -> Problem Analysis -> Transform -> Upload -> Record

### LLM Cost Optimization (79-83% reduction)

- **Tiered**: Simple tasks -> cheap models; complex -> premium; massive contexts -> XAI/Grok (2M tokens)
- **Smart Routing**: `llm-router/` with task complexity scoring, provider fallback chains
- **Caching**: Response caching, embedding reuse, XAI 75% cache discount

### BLP Framework (60/60 properties)

Six categories: Alignment, Autonomy, Durability, Self-Improvement, Self-Replication, Self-Organization.
Formula: `Compute Advantage = (Compute Scaling * Autonomy) / (Time + Effort + Cost)`

## Configuration & State

**Environment** (priority order): env vars > `.env` file > defaults in `utils/config.py`

**Key env groups**: `LIMITLESS_*`, `NOTION_*`, `OPENAI_*`, `ANTHROPIC_*`, `GOOGLE_AI_*`

**State files**:
- `logs/processed_transcripts.json` - Deduplication
- `logs/monitor_alerts.json` - Alert tracking
- `logs/whatsapp_notifications.json` - Notification audit
- `transcripts_archive/` - Local transcript backup

## Development Workflow

### Branch Strategy
```bash
git checkout -b feature/your-feature
git checkout -b fix/issue-description
```

### Adding Features

Choose the right layer:
- New agent -> SFA in appropriate project
- New tool -> MCP server or extend existing
- New pipeline stage -> Module in Lifelog Manager

Follow patterns: pydantic models, exponential backoff for external APIs, type hints.

## Coding Guidelines (Karpathy)

Full text: `.claude/rules/karpathy-coding-guidelines.md`. Source: https://github.com/multica-ai/andrej-karpathy-skills. Bias toward caution over speed; use judgment on trivial tasks.

1. **Think before coding** — state assumptions explicitly; if multiple interpretations exist, present them rather than picking silently; ask when something is unclear instead of guessing.
2. **Simplicity first** — minimum code that solves the problem; no speculative abstractions, flexibility, or error handling for impossible scenarios.
3. **Surgical changes** — touch only what the task requires; don't refactor or "improve" adjacent code; match existing style; only remove dead code your own change orphaned.
4. **Goal-driven execution** — turn vague asks into verifiable success criteria (e.g. "fix the bug" → write a failing test, then make it pass) and loop against that instead of "make it work."

## Key Patterns

- **Single File Agents (SFA)**: Self-contained with isolated dependencies
- **MCP Wrapper Pattern**: Cost-tracked interface for external tools
- **Hierarchical Orchestration**: Root -> Workflow -> Base agents -> MCP tools
- **Incremental Processing**: State tracking prevents reprocessing
- **Multi-Provider Routing**: Automatic fallback chains for reliability
- **Domain Filter Injection**: When spawning web-search agents via Task tool, inject domain filters from `configs/search_domain_profiles.json` into the prompt. Use `scripts/domain_filter_injector.py` to get the injection text. Agents do NOT reliably read their own .md config for domain filtering - the orchestrator MUST inject it into the task prompt.

## Hooks System

Claude Code hooks in `.claude/hooks/` provide observability:
- Pre/Post tool use: Damage control validation + event logging
- Session management: Start/stop tracking
- Event streaming: HTTP POST to observability dashboard (port 5173)

BlindOracle agents use lightweight file-only hooks (no HTTP) in their own `.claude/hooks/`.

## Important Notes

### File Naming
HTML output: `YYYYMMDD-descriptive_title.html` -> `/home/craigmbrown/Project/html-output/`

### Key Script Paths
- WhatsApp: `WhatsApp-Manager-Agent/WhatsApp_Manager_Agent/send_whatsapp_message_working.py`
- Gmail (basic): `gmail_manager.py`
- Gmail (threaded): `scripts/unified_email_responder.py`
- Calendar: `scripts/execution_toolkit.py calendar`
- Execution toolkit: `scripts/execution_toolkit.py` (whatsapp, email, calendar, github, search)
- Peer-to-peer agent comms: `scripts/coms.py` (register, list, send, get, await, listen) — `/coms` skill, RQ-232

### Default Contacts
- WhatsApp: 15712781730
- Email: craigmbrown@gmail.com
- GitHub repo: craigmbrown/ETAC-System

## Email Sending Rules

These rules apply to ALL outbound email (cold outreach, status reports, deliverable notifications). Adopted 2026-05-15 from `/insights` friction analysis (Jesse Pollak bare-gmail incident, dry-run-sent-real-email incident, backfill-stamped-now-not-historical incident).

- **ALWAYS preview external emails before sending**: render to file, open in browser, light-mode check (per `feedback_verify_external_email_before_send.md`), verify recipient/From-display-name/subject/first-5-body-lines, then operator confirmation before `--send`.
- **Verify the From field has a display name** — never a bare `babyproject418@gmail.com` or `craigmbrown@gmail.com`. Format: `"Craig Brown — BlindOracle" <babyproject418@gmail.com>`. The Jesse Pollak send broke this rule.
- **Never send real emails during dry-run verification** — route to a test recipient or use a `--dry-run` flag that returns the rendered body without hitting SMTP. A real test send during a "fix the spam" diagnosis added to the spam.
- **For backfill operations, preserve ORIGINAL timestamps; never stamp with current time** — this was the bug fixed in `outbound_crm.py::backfill` 2026-05-14. If you're advancing CRM stages from `send_log.jsonl`, pass `ts=rec["timestamp"]` not `_now_iso()`.
- **External cold emails use light-mode HTML** (#222 text on #fff bg) — exception to the green-on-black theme. Internal status/research emails keep green-on-black per `feedback_compose_email_before_send.md`.

## Pre-Implementation Verification

Before claiming any component "does not exist", "is empty", or "was never built", run a broader discovery pass. Adopted 2026-05-15 from `/insights` friction analysis (ConvAI infrastructure misdeclared as missing, plan-review backend dismissed despite operator's "it was working at one point").

- **Grep the codebase AND check git history** for prior mentions before concluding nonexistence. Use `git log --all --oneline --grep=<keyword>` not just `find .`.
- **If operator says "it was working at one point", treat that as authoritative** — search harder before concluding otherwise. Operator memory of working state is ground truth; my read of the filesystem snapshot is not.
- **For sweeps/audits (blog posts, whitepapers, emails, drafts), check ALL subdirectories** before reporting completeness. The blog restyle missed 8 posts + 4 whitepapers in a separate subdirectory; the RQ-150 audit found design specs at two file paths.
- **Show your work**: when concluding "X doesn't exist", surface (1) every grep pattern tried, (2) every directory walked, (3) git log searches for related commit messages. This lets the operator catch premature conclusions before they become incorrect actions.

## Test-Before-Ship

Run a smoke test after every fix before declaring it complete. Adopted 2026-05-15 from `/insights` friction analysis (renamed-variable bug in log statement crashed first dry-run, TB OAuth required 2 additional patches after initial "fix", initial probe fix didn't stop counter repopulation).

- **Run dry-run/tests after every fix** before declaring it complete. For Python edits, `python -m py_compile <file>` is a 100ms check that catches the most common rename-aftermath bugs. A PostToolUse hook in `.claude/settings.json` now does this automatically.
- **For OAuth/auth-related fixes, verify the END-TO-END flow** — token path, scopes, refresh, and an actual successful API call. Don't ship after only fixing the surface error message; the next layer down often breaks too.
- **After variable renames, grep for ALL references** — including log statements, f-strings, docstrings, dictionary keys. The most common post-rename crash is a single `log.info(f"... {old_var}")` that argparse + linter don't catch.
- **Per-phase checkpoint before proceeding**: in long autonomous sessions, after each shipped phase post a 5-line state summary — (1) what shipped, (2) what's verified working, (3) what's deferred, (4) proposed next phase, (5) estimated tool calls — then wait for operator go. Prevents over-engineering and sunk-cost growth.

## Commit/Merge Verification

Codified 2026-05-15 after a critical incident: PR #2225 and PR #2227 merged successfully on GitHub but key files NEVER reached `origin/main`. Root causes were two distinct silent failures.

### Rule 1 — `git add` silently drops gitignored files

A root-level `lib/` pattern in `.gitignore` (intended for Python venv) matched `agents/mesh/lib/` and dropped 4 source files at `git add` time. **No error. No warning.** The commit succeeded with `9 files changed` but the 4 lib files were absent. Cherry-picks across worktrees re-evaluated gitignore at every stage and dropped them again.

- **Always check after staging**: `git status --short | grep "^A"` should match your expected new-file list. If a file you wrote isn't there, you have a silent drop.
- **Path overlaps with common gitignore patterns** are the killer: `lib`, `build`, `target`, `dist`, `out`, `bin`, `tmp`, `cache`, `.next`, `node_modules`. Sub-directories named these will silently disappear.
- **Fix**: add `!path/to/protected/` exception line directly below the gitignore rule. Then `git add -f` once to bypass, then verify normal `git add` works next time.

### Rule 2 — GitHub "merged" status can lie under race conditions

3 PRs merged within a 1-second window 2026-05-15: #2225 at 16:21:31, #2227 at 16:21:48, #2226 at 16:22:03. PR #2227's merge commit was created (`5b8d077f21`) BUT main never moved to point at it — PR #2226's merge wrote main off the pre-#2227 state. GitHub's PR UI showed all 3 as "MERGED" but #2227's changes were effectively reverted.

- **Always verify the merge landed**: after `gh pr merge`, run `git fetch origin main && git ls-tree origin/main <expected-path>`. The file must appear in the tree, not just in the merge commit.
- **For batch merges**: when merging multiple PRs in rapid succession, do them serially with a `sleep 5` between each merge AND verify main moved by `git rev-parse origin/main` before merging the next one.
- **Symptom of a lost merge**: PR shows MERGED in UI, but `git log origin/main` doesn't contain the expected merge commit hash.

### Pre-flight verification skill candidate

These two rules belong in a `/pre-merge-verify` skill that runs:
1. Pre-commit: `git status --short | grep "^A"` matches expected file count
2. Post-commit: `git show --stat HEAD` matches expected file list
3. Post-merge: `git ls-tree origin/main <path>` for each expected new file
4. Bonus: cross-reference PR merge commit SHA against main's history

Until that skill exists, do it manually for any PR that adds files under `lib/`, `build/`, `dist/`, or similar gitignore-prone paths.

## Mesh Notifications — env-var gated (RQ-222 followup)

Per operator preference 2026-05-15: **WhatsApp P0 is the only default notification channel for mesh incidents.** Email was generating noise without adding value and is now opt-in.

Two env vars control behavior, both default OFF (safe — no leakage):

| Var | Effect |
|---|---|
| `MESH_NOTIFICATIONS_ENABLED=1` | Master switch. Required for ANY external notification. When on: WhatsApp P0 fires on incident open. |
| `MESH_EMAIL_NOTIFICATIONS=1` | Email opt-in (requires master on). When both on: orchestrator digest emails + resolution-ack emails fire. |

When master is OFF, the on-disk audit trail (`scripts/mesh_incident_close.py --list-open` + `.claude/mesh_memory/incidents.json`) is the only way to see incidents. That's the intended default for first-week shadow operation.

Enable in production via systemd unit drop-ins:
```
[Service]
Environment=MESH_NOTIFICATIONS_ENABLED=1
# Uncomment to also enable email channel:
# Environment=MESH_EMAIL_NOTIFICATIONS=1
```

Tests: env vars unset → nothing fires → no real channels touched. The lesson from the test-leaked-WhatsApp-and-email incident (2026-05-15) is codified at the env-var level so future tests can't repeat it.

## Pre-Send Verification (RQ-220)

A deterministic PreToolUse hook intercepts outbound-shaped Bash commands (gmail_manager.py send, gh pr create, send_whatsapp_message, curl POST) and validates against a rule corpus before the command executes. Shipped 2026-05-15.

- **Hook**: `.claude/hooks/pre_send_verification.py` — fast (<100ms), deterministic, exits 1 to block + 0 to allow
- **Rule corpus**: `data/verification_rule_corpus.jsonl` — seeded from past friction incidents (Jesse Pollak bare-gmail, dry-run-real-recipient, suppressed-subject-replies, etc.)
- **Verification log**: `.claude/verification_log.jsonl` — append-only audit of every blocked attempt
- **Critic subagents** (manual invocation via Task() for harder cases): `rendering-critic`, `identity-critic`, `blast-radius-critic`, `intent-critic` — see `.claude/agents/*-critic.md`

Override path: pass `--override` to the hook script (logged but allows the send). Reserved for cases where the operator confirms the verdict is a false positive.

Phase 2 (queued): parallel LLM critic fanout from the hook itself, with consensus-gated blocking. Phase 1 covers the deterministic patterns that catch ~80% of past friction.

**Block-with-feedback (RQ-232, 2026-05-19)**: the hook now exits 2 (CC convention) instead of 1 when a violation is found, so the agent sees the structured `{verdict, mode, instruction_to_agent, findings[]}` stderr block and can self-correct rather than aborting the turn. Set `PRE_SEND_LEGACY_EXIT=1` to fall back to exit-1 user-visible aborts. Port of `disler/pi-vs-claude-code` `damage-control-continue` pattern.

## Peer-to-Peer Agent Comms (RQ-232)

Flat agent-to-agent messaging via `scripts/coms.py` (no orchestrator, no parent/child). Port of Pi's `coms` extension. Use when two agents need bidirectional dialogue — negotiation, prod↔dev redacted bridges, heterogeneous-model debate without round-trip orchestrator.

- Skill: `/coms` (see `.claude/skills/coms/SKILL.md`)
- Storage: `~/.thebaby/coms/` (override with `COMS_ROOT`)
- Four primitives: `list`, `send`, `get`, `await` — same shape as Pi
- Helpers: `scripts/coms_helpers.py` (`ask_peer`, `fan_out`, `register_pool`, `serve_loop`)
- Tests: `tests/test_coms.py` (10) + `tests/test_coms_integrations.py` (14) + `tests/test_coms_observability.py` (12)

### Observability (Patch A + B, 2026-05-19)

| Surface | Activation | What it provides |
|---|---|---|
| `coms watch` | `python3 scripts/coms.py watch [--from-start] [--event send] [--from X --to Y] [--json]` | live tail of audit.jsonl with pretty-print + filters |
| Shadow CC peer | `coms register --name X --shadow` then `coms listen --name X` | every `coms_send` fans out a copy to all shadow peers' inboxes with `shadow_copy:true`; `serve_loop` auto-skips `write_reply` for shadow copies |
| Full-body audit | env `COMS_AUDIT_FULL_BODY=1` | includes prompt + response bodies in `audit.jsonl` (default metadata-only for PII safety) |

### Phase-2 fleet integrations (shipped 2026-05-19)

| Integration | Script | Status |
|---|---|---|
| **#4 Critic cross-talk** | `scripts/critic_pool.py` — 4 send-critics consult each other before voting; gated by `CRITIC_PEER_CONSULT=1` env var, log to `data/critic_dialogue.jsonl` | wired into `pre_send_verification.py::run_rq228_critics` |
| **#1 DITD test ↔ impl Q&A** | `scripts/ditd_peer_qa.py` — test agent asks impl agent for spec intent; log to `data/ditd_peer_qa.jsonl` | callable from test phase |
| **#3 Peer deliberation** | `scripts/peer_deliberate.py` — replaces orchestrator round-robin with N-round mesh; log to `data/peer_deliberations.jsonl` | CLI + Python API, `--stub-responses` for offline tests |
| **#2 BO marketplace negotiation** | `scripts/bo_negotiate.py` — multi-turn band-overlap settle protocol; log to `data/bo_negotiations.jsonl` | foundation for x402 + ProofOfSettlement |

## Extended Documentation

Detailed docs for specific subsystems (read on-demand, not loaded into context):
- `docs/gmail-setup.md` - Gmail OAuth, scopes, automation rules
- `docs/security-infrastructure.md` - CaMel 4-layer, Byzantine consensus, anti-persuasion
- `docs/agent-orchestration.md` - ZTE framework, DITD lifecycle, BLP details
- `docs/multi-agent-research.md` - Debate framework, negotiation, fact-checking
- `docs/comedy-system.md` - 40-agent comedy consensus, InterCabal
- `docs/v4-memory.md` - Memory types, performance, enhanced agents
- `docs/hooks-system.md` - Hook configuration, AgentOps integration
- `docs/plugins.md` - Knowledge Work Plugins (41 commands, 45 skills)
- `docs/notion-workflow.md` - Notion-Native Agent Workflow System
