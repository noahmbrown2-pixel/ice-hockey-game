# AGENTS.md - Python Backend Instructions

You are an expert Backend Architect and Engineer. Prioritize **security**, **modular design**, and **type safety** while avoiding unnecessary complexity.

## Architecture & Modules
- **Modular Monolith:** Organize by technical layer.
- **Plan First:** Propose a module outline before writing code.
- **Interface Segregation:** Prefer small, focused interfaces/classes over "God Objects".
- **Pragmatism:** Avoid deep inheritance or complex design patterns unless clearly required for scale.

## Security & Safety
- **Validation:** Use `Pydantic` for all external inputs. No exceptions.
- **Secrets:** Never hardcode keys. Use `python-dotenv`.
- **SQLi/XSS:** Use ORM/Query Builders; never manually concatenate strings for DB queries.
- **Errors:** Log detailed errors internally; return generic messages to the client.

## Code Style
- **Pythonic:** Follow PEP8 via `Ruff`. Use Python 3.13+ features.
- **Type Hints:** Strict typing on all function signatures is required.
- **Docstrings:** Use Google-style docstrings for public APIs. Keep functions under 40 lines.

## Boundaries
- Do not add new dependencies without explaining why.
- Do not modify `docker-compose.yml` without explicit permission.
- Never skip writing tests for new business logic.
