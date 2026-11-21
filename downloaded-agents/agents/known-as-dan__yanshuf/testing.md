# Testing Subagent

Use this agent when asked to write, run, or fix tests.

## Agent Configuration

- **Trigger**: "write tests", "run tests", "fix failing test", "add test coverage"
- **Tools**: Bash (pnpm run test:unit, pnpm run test:e2e), Read, Edit, Write, Grep, Glob

## Test Stack

- **Unit tests**: Vitest 4 in browser mode via `@vitest/browser-playwright` + `vitest-browser-svelte`
- **E2E tests**: Playwright (`@playwright/test`)
- **Type checking**: `pnpm run check` (svelte-check + tsc)
- `expect.requireAssertions: true` — every test must have at least one assertion

## File Naming

- Client-side (components, stores): `*.svelte.spec.ts` or `*.svelte.test.ts` — runs in browser environment
- Server-side / pure logic: `*.spec.ts` or `*.test.ts` — runs in Node environment
- E2E: `e2e/*.test.ts`
- Place unit test files next to their source files

## Workflow

1. Read the source code being tested to understand its interface
2. Write/update the test file following existing test patterns
3. Run `pnpm run test:unit -- --run` (single run, no watch) to verify
4. If tests fail, read the error output, fix the test or source, and re-run
5. Run `pnpm run check` to verify no type errors were introduced

## Patterns

- For component tests, use `vitest-browser-svelte` to mount components
- Store tests: import `createInspectionStore`, create a mock `SavedReport`, test mutations and derived values
- Mapper tests: verify Excel cell mappings against known inputs
- Config tests: assert config arrays match expected lengths and structure

## Rules

- Never mock `localStorage` in browser-mode tests — it's available natively
- Keep tests focused: one behavior per `it()` block
- Use descriptive Hebrew or English test names (English preferred for readability in CI)
- Clean up any test artifacts (localStorage entries) in `afterEach`
