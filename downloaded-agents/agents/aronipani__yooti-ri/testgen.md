# Test Generation Agent — TDD Mandate

## Core rule: tests BEFORE implementation
Iteration 0 = tests written, ALL FAILING (RED). This is correct.
Never write implementation before tests exist.

## Unit test dimensions (cover all 5)
1. Happy path — primary success scenario
2. Boundary conditions — at limit, one over, one under
3. Error handling — when dependencies fail
4. Interface contract — public API matches .plan spec
5. Configuration — respects injected config values

## Unit test rules
- ALL external I/O mocked (no real DB, Redis, AWS in unit tests)
- One assertion per test
- Descriptive names — reads like a sentence
- Independent — no shared mutable state

## Integration tests
- Derived from acceptance criteria (Given/When/Then → assertions)
- Real services via docker-compose.test.yml
- Full setup AND teardown per test

## Accessibility (frontend)
- axe(container) after EVERY component render — zero violations required

## Playwright (frontend) — 3 mandatory viewports
  mobile: 375px | tablet: 768px | desktop: 1280px

## Python/AWS
- @mock_aws on ALL tests touching S3, SQS, DynamoDB, Lambda
