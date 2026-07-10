---
name: typescript-quality-reviewer
description: Improve TypeScript implementation and code review quality. Use when writing, refactoring, debugging, or reviewing TypeScript, TSX, React, Node.js, frontend, backend, library, test, tsconfig, ESLint, Vitest, Jest, or package code; when reviewing PRs or diffs that affect typed JavaScript; or when the user asks for stricter quality, maintainability, correctness, or type-safety checks in TypeScript code.
---

# TypeScript Quality Reviewer

Use this workflow to make TypeScript changes and reviews more correct, maintainable, and type-safe without drifting into broad refactors.

## Orientation

- Inspect the repository's package manager, scripts, `tsconfig`, lint config, test framework, and local patterns before changing code.
- Prefer the project's existing abstractions, typing style, validation libraries, and test helpers.
- For reviews, read the diff plus nearby call sites and exported contracts; behavior, regressions, and missing tests matter more than style comments.
- For implementations, keep changes narrow, preserve public API compatibility unless asked otherwise, and avoid "type-only fixes" that leave runtime behavior unsafe.

## Quality Gates

Use these gates while writing code and while reviewing it.

1. Type model
   - Make invalid states hard to represent with discriminated unions, branded/domain types, `readonly`, and precise generics when they fit the local code.
   - Treat external input as `unknown` until parsed, validated, or narrowed. Keep validation at IO boundaries.
   - Avoid `any`, broad `as` assertions, non-null assertions, and forced casts unless the invariant is local, documented by code, and hard to express otherwise.
   - Use exhaustive checks for finite states. Confirm optional, nullable, and absent values are intentionally distinct.

2. Runtime correctness
   - Trace data flow through callers, async boundaries, serialization, environment variables, dates, time zones, and error paths.
   - Check race conditions, stale closures, cancellation, cleanup, retries, and partial failure semantics.
   - Ensure errors are not swallowed, user-facing failures are actionable, and sensitive data is not logged.
   - In TSX/React, check hook dependencies, controlled state, derived state, stable keys, accessibility-relevant props, and server/client boundaries.

3. Maintainability
   - Prefer simple typed functions over clever conditional-type machinery unless the complexity removes real user-facing risk.
   - Keep module boundaries clear. Do not leak transport, database, or framework-specific shapes into domain code without intent.
   - Remove dead paths and duplicate state when the change makes them obsolete.
   - Watch for accidental breaking changes in exported types, function signatures, config defaults, and package entrypoints.

4. Tests and verification
   - Add or update focused tests for changed behavior, edge cases, and regressions. Include type-level tests only when the repo already supports them or the type contract is the product.
   - Prefer the narrowest meaningful verification: typecheck, lint, unit tests, affected integration tests, then broader suites if the blast radius warrants it.
   - If checks cannot be run, say exactly which check was skipped and why.

## Review Workflow

1. Identify the intended contract of the change from the PR text, tests, type signatures, and call sites.
2. Trace at least one success path and one failure or edge path through the changed code.
3. Look for mismatches between compile-time types and runtime guarantees.
4. Report findings first, ordered by severity, with tight file and line references.
5. Avoid low-signal style comments unless they hide a correctness, maintainability, or consistency issue.
6. If there are no findings, say so and mention any meaningful residual test gap.

## Implementation Workflow

1. Sketch the smallest shape of the type contract before editing.
2. Update runtime logic and type definitions together; do not let one merely appease the other.
3. Add or adjust tests near the behavior unless the repo has a clear different convention.
4. Run relevant checks using discovered scripts, such as `tsc --noEmit`, `npm test`, `pnpm test`, `yarn test`, `bun test`, lint, or framework-specific commands.
5. Summarize the changed behavior, validation performed, and any deliberate tradeoffs.

## Common Red Flags

- New casts, non-null assertions, broad object spreads, and `JSON.parse` without validation.
- Tests that only assert mocks were called, not observable behavior.
- Async functions that ignore cancellation, ordering, duplicate submissions, or partial failures.
- Type changes that silently widen public contracts.
- Config changes that relax strictness, skip checks, or hide generated-code problems without an explicit reason.
