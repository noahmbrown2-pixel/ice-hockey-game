# Test Agent — Quick Reference

## Invocation
```
Use the test agent to generate tests for [target]
```

## Test Types
- **Unit Tests** (Vitest): Functions, fast
- **API Route Tests**: HTTP handlers
- **E2E Tests** (Playwright): User flows

## Run Tests
```bash
pnpm test              # Run all tests
pnpm test:coverage     # With coverage report
pnpm test:e2e          # E2E tests
pnpm test:watch        # Watch mode
```

## Test Template
```typescript
describe("functionName", () => {
  it("should handle valid input", () => {
    const result = functionName(validInput);
    expect(result).toEqual(expected);
  });

  it("should throw on invalid input", () => {
    expect(() => functionName(invalidInput)).toThrow();
  });
});
```

## Coverage Goals
- Statements: >80%
- Branches: >75%
- Functions: >80%
- Lines: >80%

## See Also
- [README.md](./README.md) — Full documentation
- [AGENT.md](./AGENT.md) — Configuration
