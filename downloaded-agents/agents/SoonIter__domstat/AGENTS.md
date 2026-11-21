# AGENTS.md

You are an expert in JavaScript, TypeScript, Rspack, Rsbuild, Rslib, and CLI development. You write maintainable, performant, and well-tested code.

## Project Overview

**domstat** is a CLI tool that turns a running browser into a queryable state machine via Chrome DevTools Protocol (CDP). It enables AI agents and developers to query the actual runtime state of a front-end page (DOM, console, network) without screenshots or high token overhead.

### Key Design Principles

- **Read-only browser state inspector** - No mutations, only queries
- **Low token overhead** - Short, stable, machine-friendly output
- **Deterministic and scriptable** - Reliable for automated workflows
- **AI-first design** - Optimized for AI self-testing during development

## Project Structure

```
src/
├── index.ts              # CLI entry point, argument parsing
├── types.ts              # Shared TypeScript types
├── cdp/
│   ├── index.ts          # CDP module exports
│   └── client.ts         # CDP client wrapper class
└── commands/
    ├── index.ts          # Commands module exports
    ├── launch.ts         # Chrome launcher command
    ├── ping.ts           # Connection check command
    └── query.ts          # DOM query command
tests/
├── index.test.ts         # CLI tests
├── cdp/
│   └── client.test.ts    # CDP client tests
└── commands/
    └── query.test.ts     # Query command tests
```

## Tech Stack

- **Runtime**: Node.js >= 18
- **Language**: TypeScript (strict mode)
- **Build Tool**: Rslib (ESM output, bundled)
- **Testing**: Rstest
- **Linting/Formatting**: Biome
- **CDP Library**: chrome-remote-interface

## Commands

```bash
# Development
pnpm dev              # Watch mode, rebuild on changes
pnpm build            # Build for production

# Testing
pnpm test             # Run all tests
npx rstest <file>     # Run specific test file

# Code Quality
pnpm check            # Lint and format (auto-fix)
pnpm format           # Format only
```

## CLI Usage

```bash
domstat launch              # Launch Chrome with remote debugging
domstat ping                # Check CDP connection
domstat query <selector>    # Query DOM elements

# Options
--port <number>             # Chrome debugging port (default: 9222)
--host <string>             # Chrome debugging host (default: localhost)
```

## Architecture

### CDP Client (`src/cdp/client.ts`)

The `CDPClient` class wraps chrome-remote-interface:
- `connect()` - Establish connection and enable Runtime domain
- `disconnect()` - Close connection
- `evaluate<T>(expression)` - Execute JavaScript in browser context
- `isConnected` - Connection status getter

### Commands

1. **launch** - Spawns Chrome with `--remote-debugging-port` flag
2. **ping** - Verifies CDP connection, returns page URL/title
3. **query** - Executes DOM query via `Runtime.evaluate`

### Query Result Format

```typescript
interface QueryResult {
  exists: boolean;        // Element(s) found
  count: number;          // Number of matches
  text: string | null;    // First element's textContent
  visible: boolean | null; // First element's visibility
}
```

## Code Style

- Use `const` over `let`, never `var`
- Prefer arrow functions
- Single quotes, trailing commas
- camelCase for variables/functions, PascalCase for types/classes
- Keep functions small and focused
- Self-documenting code over comments

## Docs

- Rslib: https://rslib.rs/llms.txt
- Rsbuild: https://rsbuild.rs/llms.txt
- Rspack: https://rspack.rs/llms.txt
- Chrome DevTools Protocol: https://chromedevtools.github.io/devtools-protocol/

## Testing Guidelines

- Tests live in `tests/` directory, mirroring `src/` structure
- Use `.test.ts` suffix
- Run `pnpm test` before committing
- CDP tests may need mocking for CI environments

## When Making Changes

1. Understand the existing patterns in the codebase
2. Keep changes minimal and focused
3. Add tests for new functionality
4. Run `pnpm check` to ensure code quality
5. Avoid adding unnecessary dependencies
