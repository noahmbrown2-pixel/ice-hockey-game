# Project Context (Always-Loaded)

This repository is a **Battleship game built by a multi-agent pipeline** running inside RooCode.

## You are one of 17 custom modes

See `.roomodes` for the full roster. Your `slug` defines your role. Stay strictly within it.

## The single source of truth chain

1. `docs/game_spec.md` — rules + 13 acceptance criteria.
2. `docs/api_contract.md` — Socket.IO events (authored by `architect-reviewer` in Phase 1).
3. `shared/types.ts` — TypeScript types (authored by `architect-reviewer`).
4. `prompts/orchestrator_master_prompt.md` — the pipeline spec.

**If any of these conflict, the lower-numbered one wins.** Stop and request an Architect amendment instead of patching downstream.

## Three things you must never do

1. Commit to `main` or `dev` directly.
2. Skip the handoff block at the end of your turn (see `03-handoff-format.md`).
3. Redefine a type that exists in `shared/types.ts` — always import.
