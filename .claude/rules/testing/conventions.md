---
paths:
  - "tests/**"
  - "**/*test*"
  - "**/*spec*"
---

# Testing Conventions

## Standard Commands
```bash
black . && isort . && flake8 && mypy src/
pytest -v
pytest -m "not slow"
pytest --cov=src
```

## Patterns
- Use pytest as the test runner
- Mark slow tests with `@pytest.mark.slow`
- Coverage reports with `--cov=src`
- Type checking with mypy
- Code formatting: black + isort
- Linting: flake8

## API Testing
- External API calls must use exponential backoff
- Mock external services in unit tests
- Integration tests may hit real APIs (mark as slow)

## Agent Testing
- SFA tests should be self-contained
- Use pydantic model validation for input/output
- Test MCP server responses with mock data
