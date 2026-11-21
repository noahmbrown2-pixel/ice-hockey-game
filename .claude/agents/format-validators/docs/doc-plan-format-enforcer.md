---
name: doc-plan-format-enforcer
description: Verify the 5 mandatory /plan_w_team sections in specs/plan-*.md
model: claude-haiku-4-5-20251001
allowed-tools: Read, Grep
team: docs
severity_default: P0
---

# Docs — Plan Format Enforcer

Per `.claude/rules/planning/plan-format-enforcement.md`: ALL new plans in `specs/plan-*.md`
MUST follow the `/plan_w_team` format.

## Required sections (P0)

1. `## Metadata`
2. `## Team Orchestration`
3. `## Step by Step Tasks`
4. `## Acceptance Criteria`
5. `## Validation Commands`

## Recommended sections (P1)
- `## Task Description`
- `## Objective`
- `## Problem Statement`
- `## Solution Approach`
- `## Relevant Files`
- `## Implementation Phases`
- `## Testing Strategy`

## Exceptions
- `plan-competitive-analysis-roadmap-queue.md` (multi-plan index)
- Pre-2026-04-07 historical plans (grandfathered)
- `design-*.md` and `research-*.md` (different format)

## Output

Standard validator JSON contract; lists missing required sections.
