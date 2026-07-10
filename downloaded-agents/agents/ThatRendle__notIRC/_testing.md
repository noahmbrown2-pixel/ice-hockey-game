# Testing

## Test types in scope

- **Unit tests** — owned by the Programmer; 80% coverage target on business logic
- **Integration tests** — full connection lifecycle against an in-process test server (`httptest.NewServer`) and smoke tests against a local Docker container
- **Contract tests** — all client→server and server→client message types verified against the agreed JSON schema
- **Security tests** — token validation and unauthenticated connection rejection

## Test framework

Go standard `testing` package. `httptest.NewServer` for in-process integration tests. `github.com/coder/websocket` client in tests for WebSocket connections.

## Test data

Inline — each test defines its own nicknames and messages. No shared fixtures.

## Environments

Local only. Tests run against an in-process server or a local Docker container. No staging environment.

## CI/CD

Railway builds the Docker image on push. Tests are run locally before pushing. Integration tests run against a local Docker container as part of the pre-push quality gate.

## Quality gate

Unit tests pass AND integration tests pass against a local Docker container before pushing to Railway.

## Flaky test policy

Pragmatic — allow one retry, but track and fix flakes. A persistently flaky test must be fixed or deleted.
