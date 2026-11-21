# FishBowl - Claude Code Quick Reference

You are an expert Game Developer and Software Architect working on "FishBowl", a web-based fish breeding simulation game.

## ⚠️ Task & Progress Tracking via SpecKit

**ALL project progress, changes, and features MUST be documented in SpecKit** (in the current milestone's `specs/XXX/tasks.md` file). This is the single source of truth for the project.

Currently tracking: **Milestone 2** → [specs/001-core-mechanics/tasks.md](specs/001-core-mechanics/tasks.md)

**DO NOT** use Claude Code's in-memory todo list for project tasks. Session todo lists are temporary and lost when the session ends.

**To add a task or feature**:
1. Edit the appropriate `tasks.md` file in the current spec directory (`specs/001-core-mechanics/`, `specs/002-visual-prototype/`, etc.)
2. Update the task status (✅ COMPLETE, 📋 READY, 🔄 IN PROGRESS, [ ] PENDING)
3. Ensure all changes are committed to git with clear commit messages
4. After milestone completion, run `/speckit.tasks` or `/updatedocs` to regenerate documentation

## Tech Stack

- **Runtime**: React 19 + Vite 7
- **Language**: TypeScript 5.9 (Strict Mode)
- **Game Engine**: Pixi.js 8
- **State Management**: Zustand
- **Testing**: Vitest (unit/integration) + Playwright (E2E)
- **Package Manager**: pnpm

## Current Status

✅ **Phases 1-3 COMPLETE** | 🔄 **Phase 4a-4f IN TESTING** | 📋 **Phase 4g-5 PLANNED**

See [IMPLEMENTATION_STATUS.md](../docs/IMPLEMENTATION_STATUS.md) for detailed progress.

> **📌 Milestone Numbering**: Milestone 1 = Spec 002 (POC), Milestone 2 = Spec 001 (Core Mechanics)

## Core Principles (Non-Negotiable)

- **Test-First (TDD)**: Write failing tests before implementation, target 90% coverage
- **Type Safety**: No `any` types, strict TypeScript mode
- **Separation of Concerns**: Logic (models/services) → State (Zustand) → View (Pixi.js) → UI (React)
- **Zero Linting Warnings**: `pnpm lint` must pass after every phase
- **Feature-Centric**: Implement features as cohesive, independently testable modules

See [constitution.md](.specify/memory/constitution.md) for complete principles.

## Quick Commands

```bash
pnpm dev              # Start dev server (http://localhost:5173)
pnpm test             # Run unit & integration tests
pnpm test --coverage  # Run tests with coverage
pnpm test:e2e         # Run E2E tests
pnpm lint             # Check linting (ESLint + TypeScript)
pnpm lint --fix       # Auto-fix linting issues
pnpm format           # Format code (Prettier)
pnpm build            # Build for production
```

**Developer Mode**: Add `?dev=true` to URL for 1000 credits, STANDARD tank, no tutorial.

## Key Files & Architecture

| Layer | Purpose | Location |
|-------|---------|----------|
| **Models** | Pure domain logic (Fish, Tank) | `src/models/` |
| **Services** | Business logic (Physics, Economy) | `src/services/` |
| **Store** | Zustand state management | `src/store/slices/` |
| **Game** | Pixi.js rendering | `src/game/` |
| **Components** | React UI (HUD, menus) | `src/components/` |
| **Types** | TypeScript interfaces | `src/models/types/` |
| **Tests** | Unit & integration tests | `tests/unit/`, `tests/integration/` |

See [README.md](README.md) for full project structure and architecture overview.

## Important Implementation Notes

### Store Architecture
- `RenderingEngine` syncs with store (not vice versa)
- Single source of truth pattern with Zustand
- Store state includes geometry (position, velocity, dimensions)

### Geometry Pattern
- Fish: `geometry: IFishGeometry` (position, velocity, radius)
- Tank: `geometry: ITankGeometry` (width, height, centerX, centerY)
- Legacy getters/setters for backward compatibility (e.g., `fish.x`, `fish.y`)

### Testing Strategy
- Reset store state in tests: `useGameStore.setState({ tank: null, tanks: [] })`
- Write tests before implementation
- Keep tests isolated and focused

### Phase-Based Development
- Each phase on separate git branch
- After each phase: run tests → run linter → update docs
- Use `loc-audit` skill to verify code quality

## Common Tasks

**Run specific tests**:
```bash
pnpm test tests/unit/Fish.test.ts
pnpm test tests/integration/Breeding.test.ts
```

**Add new fish species**:
1. Update `FishSpecies` enum in `src/models/types/fish.ts`
2. Add constants in `src/lib/constants.ts`
3. Update `FishController` spawn logic
4. Add tests
5. Run `pnpm lint && pnpm test`

**Refactor models**: Update interfaces → implementation → tests → store slices → RenderingEngine sync → full test suite

## Documentation

| Document | Purpose |
|----------|---------|
| [README.md](README.md) | Project overview, tech stack, architecture |
| [IMPLEMENTATION_STATUS.md](docs/IMPLEMENTATION_STATUS.md) | Progress tracking, milestone status, code quality analysis |
| [constitution.md](.specify/memory/constitution.md) | Project governance, principles, standards |
| [QUICKSTART.md](QUICKSTART.md) | Setup and development guide |
| [tasks.md](specs/001-core-mechanics/tasks.md) | Milestone 2 implementation tasks |
| [PRD.md](docs/PRD_Eng.md) | Product requirements (detailed features) |
| [PHYSICS.md](docs/PHYSICS.md) | Physics engine implementation details |
| [TEST_ORGANIZATION_GUIDE.md](docs/TEST_ORGANIZATION_GUIDE.md) | Testing patterns and organization |
| [ARCHITECTURE_CONCERNS.md](ARCHITECTURE_CONCERNS.md) | Known architectural issues and refactoring notes |

## References

- **Primary Source of Truth**: [constitution.md](.specify/memory/constitution.md)
- **Specifications**: [specs/001-core-mechanics/](specs/001-core-mechanics/), [specs/002-visual-prototype/](specs/002-visual-prototype/)
- **Git History**: Check commits for architectural decisions and refactoring context
