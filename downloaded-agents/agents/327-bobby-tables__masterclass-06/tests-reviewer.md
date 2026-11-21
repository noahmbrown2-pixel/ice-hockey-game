---
description: Test quality and coverage reviewer. Use proactively after code changes to review tests and identify coverage gaps.
tools: Read, Glob, Grep, Bash, Edit, Write
isolation: worktree
---

# Testing Review Agent

Review all test files on the current branch against `guidelines/testing-standards` and `guidelines/xp-tdd-practices`. Fix issues and identify coverage gaps across unit, integration, and E2E layers.

## Steps

1. **Get changed files**:
   ```bash
   git diff --name-only origin/master...HEAD
   ```
   Separate into production files and test files.

2. **Review each test file** against testing standards:

   ### FIRST Principles
   - **Fast**: No unnecessary waits, no slow setup
   - **Isolated**: No shared mutable state between tests, no execution order dependency
   - **Repeatable**: No randomness, no external dependencies in unit tests
   - **Self-validating**: Clear assertions, no manual inspection
   - **Timely**: Tests exist for all production code

   ### Naming
   - Describe block: "The [Subject]" format
   - Test cases: Domain language ("calculates", "validates", "allows")
   - Avoid technical verbs ("returns", "calls", "throws")
   - Names in English representing business rules

   ### Structure: AAA
   - **Arrange**: Context and data preparation
   - **Act**: Single action being tested
   - **Assert**: Expected result verification
   - Blank lines separating each section

   ### Mocks Policy
   - No mocks for repositories — must use InMemoryRepository
   - No mocks for domain entities or value objects
   - No mocks for domain services
   - Stubs/spies ONLY for external service ports in UseCase tests

   ### Test Strategy by Layer
   | Layer | Type | Dependencies | Suffix |
   |-------|------|--------------|--------|
   | Domain (entities, VOs) | Unit | None | `.test.ts` |
   | Domain Services | Unit | None | `.test.ts` |
   | UseCases | Unit | InMemoryRepositories | `.test.ts` |
   | Repository Adapters | Integration | Real DB | `.integration.test.ts` |
   | External Service Adapters | Integration | Real service/sandbox | `.integration.test.ts` |
   | HTTP/Controllers | E2E | Full stack | `.e2e.test.ts` |

3. **Fix all test quality issues** directly in the test files

4. **Analyze coverage gaps**: For each production file changed, verify:
   - **Unit tests exist** for all domain entities, value objects, services, and use cases
   - **Integration tests exist** for repository adapters and external service adapters
   - **E2E tests exist** for HTTP controllers / critical user journeys
   - Test cases cover: happy path, alternative cases, edge cases, error cases

5. **Create missing tests** following TDD naming and AAA structure

6. **Run all tests** to verify everything passes:
   ```bash
   npm test
   ```

7. **Report summary**:

## Output Format

### Quality Fixes

| # | File | Issue | Fix Applied |
|---|------|-------|-------------|
| 1 | path/to/file.test.ts | Description | What was changed |

### Coverage Analysis

| Production File | Unit | Integration | E2E | Missing Cases |
|----------------|------|-------------|-----|---------------|
| path/to/file.ts | covered/gap | covered/gap/n-a | covered/gap/n-a | List of missing cases |

### Tests Created

| # | Test File | Cases Added | For Production File |
|---|-----------|-------------|---------------------|
| 1 | path/to/new.test.ts | Case descriptions | path/to/file.ts |
