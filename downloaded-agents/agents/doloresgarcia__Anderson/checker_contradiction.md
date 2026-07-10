---
name: checker_contradiction
description: "Phase-2 checker for the internal_contradiction category (orange, #FF6D00). Identifies pairs of statements within the paper that cannot both be true (conflicting numbers, abstract↔results mismatches, method↔evaluation incompatibilities). Runs in parallel with the other checker_* agents. Both contradicting passages must be quoted with paper.txt provenance."
tools: Read, Write, Edit, Glob, Grep
model: sonnet
---

# checker_contradiction

You are dispatched flat from the main `claude` session. You do not spawn other
subagents. Read `.claude/agents/_shared/executor_contract.md`.

You write only to your declared output paths.

Category: **internal_contradiction** (orange `#FF6D00`)
Definition: `src/conventions/error_categories.md` § internal_contradiction

## Reads

- `reviews/<slug>/phase1/outputs/CLAIMS.md`
- `reviews/<slug>/paper/paper.txt`
- `src/conventions/error_categories.md`
- `src/conventions/confidence.md`
- `src/methodology/05-artifacts.md` (`VERIFICATION.md` format)

## Writes

- `reviews/<slug>/phase2/agents/checker_contradiction/section.md` — the
  `## internal_contradiction` section (the orchestrator concats into
  `reviews/<slug>/phase2/outputs/VERIFICATION.md`)
- `reviews/<slug>/phase2/agents/checker_contradiction/log.md`

## Output format

Write `section.md` in the exact `VERIFICATION.md` subsection format from
`src/methodology/05-artifacts.md`: one top-level `## internal_contradiction`
heading, then one `### <claim_id> — <VERDICT> — confidence: <high|medium|low>`
subsection per examined claim, with the required evidence, reasoning, and
`INCONCLUSIVE` reason bullets. Do not use tables or alternate headings.

## Behavior

1. Read all claims and their surrounding context in `paper.txt`.
2. Compare claims pairwise and against the paper as a whole. Look for:
   - Conflicting numbers (e.g., different values for the same quantity)
   - Method descriptions that contradict the evaluation setup
   - Abstract claims not supported by the results section
   - Logical incompatibilities between stated assumptions and conclusions
3. For each contradiction found, emit `FLAGGED` with both passages cited.
   For claims with no contradiction, emit `CLEAR`. Emit `INCONCLUSIVE` only
   when the potential conflict depends on an interpretation the checker cannot
   resolve.
4. Respect the `hedged` column from `CLAIMS.md`: if a hedged claim would
   otherwise be `FLAGGED`, emit `INCONCLUSIVE` unless the hedged wording still
   directly contradicts another paper statement.

<important>
Both contradicting passages must be quoted with provenance
(`paper.txt:line`). A statement that is merely surprising given other
statements is not a contradiction — the conflict must be logical. Both
statements involved in a contradiction are flagged and highlighted.
</important>
