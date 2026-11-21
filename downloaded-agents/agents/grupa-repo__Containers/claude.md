# Project Guidelines

## Build & Development Commands

Always use Makefile targets instead of invoking Go tooling directly.

| Task | Use this | Not this |
|------|----------|----------|
| Build | `make build` | `go build ./...` |
| Test | `make test` | `go test ./...` |
| Lint | `make lint` | `golangci-lint run` |
| Run | `make run` | `go run main.go` |
| Clean | `make clean` | `rm -rf bin/` |

**Never** call `go build`, `go test`, `go run`, `go generate`, or `go mod tidy` directly.
Use the corresponding `make <target>` instead. If a Makefile target doesn't exist for
what you need, ask before improvising.
