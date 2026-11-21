# Agent Team: gRPC-GraphQL Playground

## Team Overview

Five specialized agent roles working together on the travel recommendation service project. Each agent owns specific domains and participates in a structured handshake protocol for coordinated development.

---

## Agents

### 1. Project Manager (PM)
**Domain:** Roadmap, priorities, issue tracking, PR reviews

**Responsibilities:**
- Update and maintain PLAN.md with progress
- Create and manage GitHub Issues
- Review and approve PRs
- Verify milestone completion
- Coordinate between agents

**Tools:** GitHub Issues, PLAN.md, PR reviews

---

### 2. Backend Engineer (Go) – gRPC & GraphQL Gateway
**Domain:** Go gRPC services, GraphQL gateway (gqlgen), proto definitions

**Responsibilities:**
- Define and update .proto files (recommender.proto)
- Implement Go gRPC server (recommender/client/)
- Implement Go GraphQL gateway (graphql/)
- Run proto generation (buf)
- Run GraphQL code generation (gqlgen)
- Write and maintain Go unit/integration tests
- Manage go.mod dependencies

**Tools:** buf, gqlgen, go test, golangci-lint

---

### 3. Backend Engineer (Python) – Kafka Consumer
**Domain:** Python services, Kafka consumer, event processing, database models

**Responsibilities:**
- Implement Python recommender service (recommender/app/)
- Define SQLAlchemy models (db/models.py)
- Implement Kafka consumer (entry/sync.py)
- Implement gRPC server entrypoint (entry/main.py)
- Implement recommendation logic (services/recommender.py)
- Write and maintain Python unit/integration tests
- Manage pyproject.toml dependencies

**Tools:** uv, pytest, ruff, SQLAlchemy

---

### 4. Frontend Engineer
**Domain:** NextJS frontend, GraphQL client, UI components, E2E testing

**Responsibilities:**
- Initialize and maintain NextJS 14 app
- Create UI components (DestinationCard, etc.)
- Implement GraphQL code generation (codegen.ts)
- Configure GraphQL client (urql)
- Write component tests (vitest)
- Write and maintain E2E tests (Playwright)
- Manage Next.js configuration and build

**Tools:** Next.js, pnpm, urql, vitest, Playwright

---

### 5. DevOps/QA
**Domain:** Containerization, infrastructure, testing coordination, linting

**Responsibilities:**
- Manage Docker Compose configuration (docker-compose.yml)
- Set up Redpanda (Kafka-compatible)
- Configure pre-commit hooks (.pre-commit-config.yaml)
- Manage buf CLI and protobuf generation pipeline
- Run full test suite (Go + Python + E2E)
- Maintain linting configuration
- Coordinate CI/CD setup

**Tools:** Docker, Docker Compose, buf, pre-commit, git

---

## Handshake Protocol

When working on features or fixes, agents follow this protocol:

### Step 1: Verify Assignment
1. Agent checks PM-created GitHub Issue for the task
2. Issue contains: description, acceptance criteria, assigned agent
3. Agent confirms understanding and scope

### Step 2: Implement
1. Agent creates feature branch: `feat/issue-123-description`
2. Agent implements changes following CLAUDE.md guidelines
3. Agent writes/updates tests
4. Agent commits changes with issue reference: `[agent-action] feat/...: description (fixes #123)`

### Step 3: Report
1. Agent updates GitHub Issue status (in-progress → PR)
2. Agent creates PR linked to Issue
3. Agent tags commit message with `[agent-action]`
4. Agent requests PM review

### Step 4: Review & Merge
1. PM reviews code and tests
2. PM approves or requests changes
3. PM merges to main on approval

---

## Communication Norms

- **Async by default:** Use GitHub Issues and PR comments
- **Blocking questions:** Use @mentions in Issues
- **Code changes:** Always link to GitHub Issue
- **Daily standups:** Update Issue progress comments
- **Weekly sync:** Review PLAN.md progress with PM

---

## Success Metrics

- All assigned Issues completed with passing tests
- All PRs reviewed and merged within 24 hours
- Zero broken main branch builds
- E2E tests passing before each release
