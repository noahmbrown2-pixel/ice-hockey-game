# Plan Format Enforcement

## Rule
ALL new plans in `specs/plan-*.md` MUST follow the `/plan_w_team` format. Plans missing required sections will be rejected by the DITD pipeline.

## Required Sections (5 mandatory)

Every plan file MUST contain these 5 section headers:

1. `## Metadata` — Created date, complexity, task type, AND **`Horizon`** field (RQ-209)
2. `## Team Orchestration` — Builder/Validator agent assignments with responsibility table
3. `## Step by Step Tasks` — Numbered tasks with assigned agent, dependencies, complexity
4. `## Acceptance Criteria` — Checkbox list of measurable outcomes
5. `## Validation Commands` — Shell commands to verify completion

## Required Metadata Fields

The `## Metadata` section MUST include:

- `**Horizon**: <value>` where value ∈ `this_week | this_quarter | this_year | aspirational` (RQ-209)
  - Prevents the failure mode where strategic blueprints are misread as sprint goals
  - Operator briefings filter by horizon — `aspirational` plans are hidden from 7-day briefs
  - Validator: `python3 scripts/plan_horizon_validator.py --check-all`

## Recommended Sections (include when applicable)

- `## Task Description` — What needs to be done
- `## Objective` — What "done" looks like
- `## Problem Statement` — For medium/complex tasks
- `## Solution Approach` — Proposed solution
- `## Relevant Files` — Existing + new files
- `## Implementation Phases` — For complex tasks
- `## Testing Strategy` — Unit/integration/adversarial tests
- `## Notes` — Dependencies, risks, follow-up

## Enforcement Points

1. **TB Scout** — When generating plans from signals, use `/plan_w_team` template
2. **APOS Queue** — Plans added to `priority_queue_state.json` must reference compliant spec files
3. **DITD Pipeline** — `ditd_qa_validator.py` should check for 5 required sections before execution
4. **Manual Plans** — Always use `/plan_w_team` command to generate plans

## Exceptions

- `plan-competitive-analysis-roadmap-queue.md` is a roadmap index (multi-plan file), not an individual plan
- Historical plans (pre-2026-04-07) are grandfathered — do not retroactively reformat
- Research/design specs (`design-*.md`, `research-*.md`) follow their own format

## Validation Script

Quick check for compliance:
```bash
# Check a single plan
for section in "## Metadata" "## Team Orchestration" "## Step by Step Tasks" "## Acceptance Criteria" "## Validation Commands"; do
  grep -q "$section" specs/plan-foo.md && echo "OK: $section" || echo "MISSING: $section"
done
```
