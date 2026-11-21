---
name: slop
description: Sweep the current diff for AI slop - defensive code, unjustified abstraction, bad names - then apply the fixes. Use when user says "slop", "remove ai slop", "desloppify", "anything we can simplify", or as a final pass before review.
user-invocable: true
---

Walk the full diff against the parent branch (not just the last commit). This is a per-PR hygiene pass, behavior-preserving and minimal-diff - not a restructuring (that's thermo-nuclear-code-quality-review). Use `gh pr diff` to view only the changes from the current pull request.

## Kill-list

Delete on sight:

- Defensive try/catch, swallowed errors, fallback values across seams (`x ?? y` where x is guaranteed).
- Validation re-checking what the type system or an upstream layer already guarantees.
- Single-use helpers - inline them. Stateless wrapper classes/objects that exist to carry params - pass plain values.
- Dead params, unused fields, headers/constants/exports nothing reads.
- Barrel files, re-exports, `__all__` aggregation, import-then-export indirection.
- Back-compat shims, aliases, legacy toggles, versioned variants nobody asked for (assume greenfield).
- Speculative scaffolding: retries, options, hooks, config for futures nobody asked for.
- Narrative comments (keep only load-bearing ones), emoji, gratuitous logging.
- Tests for helpers/settings/trivia; over-specific assertions (exact timestamps/tokens) where "any valid value" is the contract.
- Duplicate implementations of an operation that already has a canonical method - call the canonical one.

## Naming pass

- Prefix-stutter: drop parent prefixes the directory/domain already provides (ProjectVersion → Version, teardown-target.ts → teardown.ts, SERVER_BUILD_STARTED → BUILD_STARTED).
- Generic suffixes (Config, Result, Manager, Service, Helper, Record...) unless they distinguish two real concepts.
- Invented jargon: if the plan/domain doesn't use the word, the code doesn't either.
- Name = what the thing literally does or is. If you can't explain the name in one line, rename it.

## Call-graph walk

Trace the changed flow end to end in pseudocode. Every hop must be explainable in one line; control flow should read top-to-bottom with guard clauses, no jumping between layers to follow it. Flag any hop that doesn't.

## Apply

Apply clear-cut kills and renames directly; the diff should shrink. List judgment calls (might be load-bearing, behavior-adjacent) as one-liners for Jake instead of guessing. Run checks locally after. Report what was removed/renamed in a few lines - no inventory.
