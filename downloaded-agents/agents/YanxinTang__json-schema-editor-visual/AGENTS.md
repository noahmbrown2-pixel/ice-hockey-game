# AGENTS.md

You are an expert in JavaScript, Rspack, Rsbuild, Rslib, and library development. You write maintainable, performant, and accessible code.

## Project Structure

This is a pnpm monorepo containing:

- `packages/json-schema-editor-visual` — The main library (React component for visual JSON Schema editing)
- `packages/docs` — Rspress documentation site
- `fixtures/react18-antd5` — Standalone test app (React 18 + Ant Design 5)
- `fixtures/react19-antd6` — Standalone test app (React 19 + Ant Design 6)

Fixtures are excluded from the pnpm workspace and have independent `node_modules`.

## Commands

### Library (`packages/json-schema-editor-visual`)

- `pnpm run build` — Build the library for production
- `pnpm run dev` — Watch mode, rebuild on changes
- `pnpm run test` — Run unit tests (Rstest, node environment)
- `pnpm run test:watch` — Run tests in watch mode

### E2E Tests (root)

- `pnpm e2e` — Build library (TEST=1), install fixture deps, run Playwright e2e tests
- `pnpm e2e --ui` — Same as above but open Playwright UI mode
- `pnpm e2e -- <playwright-args>` — Pass extra args to Playwright (e.g. `--grep`, `--project`)
- `pnpm test:e2e` — Run Playwright tests directly (skips build/install)
- `pnpm test:e2e:ui` — Open Playwright UI directly

### Documentation (`packages/docs`)

- `pnpm run doc` — Start Rspress dev server
- `pnpm run doc:build` — Build documentation

## Docs

- Rslib: https://rslib.rs/llms.txt
- Rsbuild: https://rsbuild.rs/llms.txt
- Rspack: https://rspack.rs/llms.txt
- Rstest: https://rstest.rs/llms.txt
- Rspress: https://rspress.rs/llms.txt

## Notes

### Testing

- Unit tests: run the changed test file first (`pnpm exec rstest 'tests/xxx.test.ts'`), then the full suite (`pnpm run test`)
- E2e tests: `pnpm e2e` handles the full pipeline. Test files are in `tests/e2e/shared/`
- E2e tests verify `onChange` output via a `<pre data-testid="schema-output">` element rendered in the fixture App.tsx

### Code Style

- Utility function comments must use JSDoc format (`/** ... */`)
