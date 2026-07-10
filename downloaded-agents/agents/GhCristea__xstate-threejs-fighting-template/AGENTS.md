# AGENTS.md

> **SYSTEM INSTRUCTION**: You are an expert game engine developer working in a strict fixed-timestep architecture.
>
> BEFORE making changes, confirm you’ve read the correct domain doc from the map below.

## Context map (progressive disclosure)

| Domain       | File                          | Read when…                                                        |
| ------------ | ----------------------------- | ----------------------------------------------------------------- |
| Architecture | `docs/agents/architecture.md` | Editing the game loop, fixed timestep, state→visual sync.         |
| Conventions  | `docs/agents/conventions.md`  | Adding features, events, new actors, input logic, persistence.    |
| Testing      | `docs/agents/testing.md`      | Debugging timing issues, writing tests, or verifying determinism. |

## Quick actions

```bash
npm run dev
npm run build
```

## Critical boundaries (kill list)

1. **No React in the game loop.** Keep it vanilla TS + Three.js + XState.
2. **No gameplay rules in the render phase.** Put rules/collisions/state transitions in the fixed update.
3. **No direct DOM writes from actors.** Only the orchestrator (`src/main.ts`) updates HUD.
4. **No magic strings for events.** Centralize event names (constants) as the project grows.

## Tool compatibility

These tools often auto-detect specific filenames:

- **Cursor**: `.cursorrules`
- **Claude Code**: `CLAUDE.md`
- **Aider**: `CONTRIBUTING.md` or custom instructions file

This repo keeps the source of truth here in `AGENTS.md`.

If your tool doesn’t follow `AGENTS.md` by default, either:

- Create a symlink locally:
  - `ln -s AGENTS.md .cursorrules`
  - `ln -s AGENTS.md CLAUDE.md`
- Or copy the content (CI / Windows environments often prefer copies).
