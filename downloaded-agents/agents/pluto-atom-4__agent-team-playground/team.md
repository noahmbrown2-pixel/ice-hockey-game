---
name: playground-team
description: "Multi-agent team for agent-team-playground development."
---

# Agent Team: Playground Development

This document defines the specialized roles and responsibilities of the agent team managing the agent-team-playground project.

## Team Composition

### 1. Project Manager (Orchestrator)
**Role**: Strategic Planning & Issue Management

- **Tooling**: Claude Code + GitHub CLI
- **Responsibilities**:
  - Maintain and update `PLAN.md` as the source of truth
  - Triage and prioritize GitHub Issues
  - Define feature requirements and acceptance criteria
  - Coordinate task handoffs between other agents
  - Track project progress and blockers
- **Key Commands**:
  - `gh issue list --label 'priority'` - View prioritized issues
  - `ck /plan` - Create or update project plan
  - `gh pr checkout -b feature/[name]` - Create task-specific branches

---

### 2. Full Stack Engineer (Developer)
**Role**: Feature Implementation (Backend & Frontend)

- **Tooling**: Claude Code CLI + Copilot CLI + Node.js 22 LTS + corepack
- **Responsibilities**:
  - Implement FastAPI endpoints with MCP documentation
  - Create corresponding Next.js components with Prisma queries
  - Ensure database schema alignment between frontend and backend
  - Follow the established tech stack patterns (including Node.js 22 LTS)
  - Submit PRs with clear, descriptive commit messages
  - Maintain code quality with Ruff (Python) and Biome (Frontend)
  - Ensure corepack + pnpm compliance on frontend
- **Key Workflow**:
  1. Ensure Node.js 22 LTS: `nvm use` (uses .nvmrc)
  2. Read FastAPI schema and MCP documentation
  3. Generate matching Next.js components using Prisma ORM
  4. Ensure SQLite dev schema aligns with Python models
  5. Run linting: `uv run ruff check --fix` (backend) and `pnpm run lint` (frontend)
  6. Verify corepack/pnpm: `pnpm --version` (from package.json packageManager field)
  7. Commit changes with `[agent-action]` tag in message
- **Tech Focus**:
  - **Backend**: FastAPI, SQLAlchemy, Model Context Protocol (MCP), Ruff for linting
  - **Frontend**: Next.js, Prisma Client, React patterns, Biome for formatting/linting
  - **Node.js**: 22 LTS with corepack managing pnpm v9+ (from frontend/package.json)
  - **Database**: Prisma schema as the source of truth
  - **Code Quality**: Pre-commit hooks via `pre-commit` framework

---

### 3. QA Engineer (Tester)
**Role**: Testing, Quality Assurance & Frontend Code Quality

- **Tooling**: Vitest + Playwright + lint-staged + Claude CLI
- **Responsibilities**:
  - Generate Vitest unit and component tests
  - Create Playwright E2E test scenarios
  - Execute full test suite before marking PRs as "Ready"
  - Validate test coverage for new features
  - Document test scenarios and edge cases
  - **Manage lint-staged configuration** in `frontend/package.json`
    - Ensure fast pre-commit checks on changed files only
    - Configure Biome checks for staged files
    - Add test runners for related files
- **Key Commands**:
  - `pnpm test:vitest` - Run unit/component tests
  - `pnpm exec playwright test` - Run E2E tests
  - `pnpm test:coverage` - Check test coverage
  - `pnpm exec lint-staged` - Run lint-staged checks on staged files
  - `ck qa-test` - Run all tests (custom command)
- **Testing Responsibilities**:
  - Unit Tests: Component logic and utilities (Vitest)
  - E2E Tests: User workflows and critical paths (Playwright)
  - Coverage: Aim for >80% coverage on new code
  - Pre-commit: Fast checks via lint-staged on changed files only
  - Performance: Optimize lint-staged configuration for speed

---

### 4. DevOps (SRE)
**Role**: Infrastructure, Database Management, Python & Node.js Configuration

- **Tooling**: GitHub Actions + GitHub CLI + Prisma + pre-commit + uv + Node.js 22 LTS
- **Responsibilities**:
  - Manage SQLite to PostgreSQL promotion logic
  - Validate database migrations before deployment
  - Configure and maintain GitHub Actions CI/CD pipeline
  - Ensure environment variable setup for dev/prod separation
  - Monitor schema consistency across environments
  - Maintain pre-commit hooks for all agents
  - **Manage Node.js versions**: .nvmrc and .node-version for Node.js 22.10.0
  - **Manage `frontend/package.json`**: Ensure corepack and pnpm version compliance
  - **Manage `backend/pyproject.toml`** as source of truth for Python configuration
- **Key Commands**:
  - `nvm use` - Switch to Node.js 22 LTS from .nvmrc
  - `corepack enable` - Enable corepack for pnpm management
  - `corepack install -g pnpm` - Install pnpm via corepack
  - `pnpm --version` - Verify pnpm version (from packageManager field)
  - `uv sync` - Install dependencies from backend/pyproject.toml
  - `uv run pytest` - Run tests (config from pyproject.toml)
  - `uv run ruff check --fix` - Lint Python code (config from pyproject.toml)
  - `pnpm exec prisma migrate dev` - Create development migrations
  - `pnpm exec prisma migrate deploy` - Execute production migrations
  - `uv run scripts/migrate_sqlite_to_pg.py` - Validate migration compatibility
  - `pre-commit run --all-files` - Verify all pre-commit hooks pass
  - `ck db-migrate` - Execute complete migration workflow
- **Python Configuration** (`backend/pyproject.toml`):
  - Declares project dependencies and optional dev dependencies
  - Configures Ruff linting rules
  - Configures pytest testing framework
  - Specifies Python version support: 3.10, 3.11, 3.12
  - Manages tool configurations (mypy, coverage, isort, etc.)
- **Database Strategy**:
  - **Development**: SQLite (`provider = "sqlite"`, `url = "file:./dev.db"`)
  - **Production**: PostgreSQL (via environment variables during CI/CD)
  - **Migrations**: Managed through Prisma, validated in CI before production deployment
  - **Code Quality**: Pre-commit hooks prevent low-quality code from being committed

---

## Coordination & Hand-offs

### Agent-Handshake Protocol

To ensure agents don't conflict and maintain an audit trail:

1. **Check Assignment**: Before modifying code, verify the GitHub Issue is assigned to your agent role
2. **Atomic Commits**: End each agent-led session with a commit message tagged `[agent-action]`
3. **Status Updates**: Use GitHub Issue status to communicate handoffs to the next agent
4. **Clear Ownership**: One agent per task to avoid merge conflicts and duplicate work

### Typical Workflow Sequence

1. **Project Manager** reviews issues and updates `PLAN.md`
2. **Full Stack Engineer** claims issue and implements feature
3. **QA Engineer** runs test suite and validates functionality
4. **DevOps** validates migrations (if schema changes) and CI/CD pipeline
5. Issue marked as "Ready for Review" and PR is created

---

## Development Standards

### Commit Message Format

All commits from agents should follow this format:

```
<type>(<scope>): <subject>

<body>

[agent-action]
Co-Authored-By: <Agent Role> <email>
```

Example:
```
feat(auth): implement FastAPI user authentication endpoint

- Add /auth/login POST endpoint with JWT token generation
- Create Next.js login form component
- Add Prisma User model for credentials storage

[agent-action]
Co-Authored-By: Full Stack Engineer <agent@playground.local>
```

### Code Review Criteria

- **Full Stack Engineer**: Code follows FastAPI/Next.js best practices
- **QA Engineer**: Tests pass, >80% coverage maintained
- **DevOps**: Migrations are validated, CI/CD pipeline succeeds

---

## Tools & Technologies Summary

| Agent | Primary Tools | Key Technologies |
|-------|---------------|------------------|
| Project Manager | Claude Code, GitHub CLI | `gh`, `ck /plan`, PLAN.md |
| Full Stack Engineer | Claude Code, pnpm, uv, Ruff, Biome | FastAPI, Next.js, Prisma, lint-staged |
| QA Engineer | Vitest, Playwright, pnpm, lint-staged | Unit tests, E2E tests, fast pre-commit |
| DevOps | GitHub Actions, Prisma, uv, pre-commit | SQLite, PostgreSQL, Migrations, pyproject.toml |

---

## Initialization Checklist

- [ ] All agents understand their assigned roles
- [ ] GitHub Issues are labeled and prioritized
- [ ] `PLAN.md` is created with feature backlog
- [ ] Backend directory initialized with FastAPI
- [ ] Frontend directory initialized with Next.js + Prisma
- [ ] Database schema defined in `prisma/schema.prisma`
- [ ] CI/CD pipeline configured in `.github/workflows/`
- [ ] `.claude/settings.json` custom commands are accessible
