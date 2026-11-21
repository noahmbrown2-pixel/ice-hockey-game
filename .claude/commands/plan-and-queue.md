---
allowed-tools: Read, Glob, Grep, Write, WebSearch, Bash(python3:*), Bash(git:*), Bash(gh api:*), Bash(date:*), Bash(cat:*)
description: Author a plan with /plan_w_team format AND register it in the APOS roadmap queue in one shot — no orphans
model: opus
---

# Plan and Queue (one-shot author + register)

Single combined verb. Equivalent to running `/plan_w_team` followed by `/plan-to-ditd` —
but in one call so the second step can never be forgotten. Closes the orphan-creation
gap (44/79 plans on disk were unregistered as of 2026-05-03).

## Variables
- **prompt**: $ARGUMENTS (The task/feature to plan and queue)

## Pre-Computed Context
- **Timestamp**: !`date -u +"%Y%m%d%H%M%S"`
- **Current Branch**: !`git branch --show-current`
- **APOS Pending Count**: !`python3 -c "import json; d=json.load(open('/home/craigmbrown/Project/plan_operationalization/pending_approvals.json')); print(len(d.get('approvals',{})))" 2>/dev/null || echo "?"`
- **Disk Plan Count**: !`ls /home/craigmbrown/Project/specs/plan-*.md 2>/dev/null | wc -l`
- **Format Gate Available**: !`test -f /home/craigmbrown/Project/scripts/plan_format_gate.py && echo "yes" || echo "no"`

## Workflow

This skill is an **inline composition** of two existing skills. It does NOT call them
as subskills (avoids slash-skill recursion); instead it follows their templates directly.

### Step 1 — Author plan (uses /plan_w_team template verbatim)

Follow the entire `/plan_w_team` workflow:
1. Requirements analysis (parse the prompt)
2. Codebase understanding (Read/Glob/Grep — no subagents)
3. Solution design
4. Team definition (Builder/Validator from `.claude/agents/team/`)
5. Task definition (numbered Step by Step Tasks)
6. Plan generation — write to `specs/plan-{descriptive-name}.md` using the EXACT
   6-mandatory-section template enforced by `.claude/rules/planning/plan-format-enforcement.md`:
     1. `## Metadata`
     2. `## Team Orchestration`
     3. `## Step by Step Tasks`
     4. `## Acceptance Criteria`
     5. `## Validation Commands`
     6. `## Verifier` (with parseable `def verify() -> tuple[bool, dict]` block)
7. Also save the verifier block to `specs/verifiers/plan-{name}-verifier.py`

### Step 2 — Self-validate before queueing (uses scripts/plan_format_gate.py)

Run the format gate on the just-written plan:

```bash
python3 /home/craigmbrown/Project/scripts/plan_format_gate.py --plan specs/plan-{name}.md
```

If exit code != 0, the plan failed the gate. **Do NOT proceed to Step 3.** Read the
gate's `[FAIL]` output, fix the missing sections in the plan, re-run the gate. Loop
until the gate passes. Only a passing plan gets queued.

If the gate is missing (Format Gate Available = no in pre-computed context), skip
this step and proceed — but warn in the final output.

### Step 3 — Register in APOS queue (uses /plan-to-ditd template verbatim)

Follow the entire `/plan-to-ditd` workflow:

a. **Create GitHub issue** via `gh api` (REST endpoint, separate rate-limit bucket
   from GraphQL — per `.claude/rules/auto-learned-errors.md` Pattern 3):
   - Title: extracted from plan H1
   - Body: requirements table, BLP coverage, files, DITD lifecycle status
   - Labels: `enhancement`, `ditd`

b. **Append to `pending_approvals.json`** with bypass:
   ```json
   {
     "request_id": "APOS-{timestamp}-{plan_name_slug}",
     "state": "fully_approved",
     "whatsapp_approved": true,
     "email_approved": true,
     "response_channel": "manual_bypass_approval",
     "plan_path": "specs/plan-{name}.md",
     "plan_data": {...}
   }
   ```

c. **Append to `execution_state.json`** with DITD lifecycle stub
   (design/implement/test/deploy/operations all `pending`).

The `approval-mma-bridge.service` will pick up the `fully_approved` entry within 30s
and submit it to the MMA Job Server at `:7601`.

## Output Format

Print one combined SUCCESS JSON:

```json
{
  "status": "success",
  "plan": {
    "path": "/home/craigmbrown/Project/specs/plan-{name}.md",
    "verifier_path": "specs/verifiers/plan-{name}-verifier.py",
    "format_gate": "PASS"
  },
  "github_issue": {
    "number": 1234,
    "url": "https://github.com/craigmbrown/ETAC-System/issues/1234"
  },
  "apos": {
    "request_id": "APOS-20260503142500-plan-name",
    "state": "fully_approved",
    "pending_approvals_count_after": 235
  },
  "ditd": {
    "phase": "pending",
    "next_action": "approval-mma-bridge will submit to MMA :7601 within 30s"
  }
}
```

## Failure Modes

| Failure | Behavior |
|---|---|
| Format gate FAILS after authoring | Loop: fix sections → re-gate. Maximum 3 attempts; on 3rd fail abort and print the gate output verbatim. |
| GitHub issue creation fails (rate limit) | Retry once via REST `curl` per Pattern 3. If still failing, write plan to disk + queue, but skip GH issue and flag `"github_issue": {"status": "deferred", "reason": "..."}`. |
| `pending_approvals.json` write fails | Hard abort. Plan is on disk but unqueued — print explicit recovery command: `/plan-to-ditd specs/plan-{name}.md` |

## Why this skill exists

Today's canonical sweep (2026-05-03) found 44 of 79 disk plans (56%) are ORPHANS —
they exist as specs but were never registered in the APOS queue. Root cause: the
two-step `/plan_w_team` → `/plan-to-ditd` workflow was easy to forget the second
step. This skill collapses both steps into one verb so registration cannot be
skipped accidentally.

When the user says **"build a plan and add to roadmap queue"**, the system should
invoke `/plan-and-queue` — not the two skills separately.

## Usage Examples

```
/plan-and-queue Add a Redis cache layer to the LLM router
```
Authors plan → validates → creates GH issue → enqueues → returns combined JSON.

```
/plan-and-queue --skip-github "small internal refactor — don't need an issue"
```
Authors plan → validates → enqueues only (no GH issue). Useful for low-priority
internal cleanup that doesn't need public visibility.

## Related

- `/plan_w_team` — author only (use when you DON'T want to queue, e.g. for review-first)
- `/plan-to-ditd` — queue an existing spec (use when plan was authored manually)
- `scripts/plan_format_gate.py` — the validator. Also runs as pre-commit hook
  if `.githooks/` is enabled via `bash scripts/install_plan_format_hook.sh`
- `scripts/apos_path_repair.py` — orphan finder + path-drift repair
- `.claude/rules/planning/plan-format-enforcement.md` — the rule this enforces
