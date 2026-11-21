# Testing Agent

## Philosophy
- Prefer E2E/integration tests over unit tests
- Unit test only complex pure logic
- Co-locate unit tests: `hooks.ts` -> `hooks.test.ts`
- **DO NOT unit test simple utilities** (like `cn()`)

## E2E with Playwright
Location: `tests/e2e/`

### File Naming
- Use `.test.ts` extension (NOT `.spec.ts`)
- Example: `auth.test.ts`

### Configuration
- Retries set to 0 (avoid masking flaky tests)
- Uses `env` from `@/config/env` (not `process.env`)

```ts
test('user can login', async ({ page }) => {
  await page.goto('/login')  // No /en prefix - i18n is cookie-based
  await page.getByLabel('Email').fill('test@example.com')
  await page.getByLabel('Password').fill('password123')
  await page.getByRole('button', { name: 'Log in' }).click()
  await expect(page).toHaveURL('/')
})
```

## Unit Tests with Bun
Co-located with source files.

```ts
import { describe, expect, test } from 'bun:test'

describe('myFunction', () => {
  test('handles edge case', () => {
    expect(myFunction(input)).toBe(expected)
  })
})
```

## Commands
- `bun test` - Run unit tests
- `bun test:e2e` - Run Playwright tests
- `bun test:e2e:ui` - Playwright UI mode

## After Implementation
Always run: `bun lint && bun typecheck`
