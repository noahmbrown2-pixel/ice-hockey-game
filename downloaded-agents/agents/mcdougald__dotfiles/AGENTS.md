# Agent instructions (template)

Use this file in repositories where you want shared guidance for **Claude Code**, **Cursor Agent**, **GitHub Copilot agent mode**, **Antigravity**, or similar tools.

## Project context

- **Runtime / stack**: (e.g. Node 22, pnpm, Next.js App Router)
- **Test command**: (e.g. `pnpm test`)
- **Lint / format**: (e.g. `pnpm lint`, `pnpm format`)
- **Deploy / env**: (where secrets live; never commit tokens)

## Conventions

- Prefer small, reviewable changes; match existing style and patterns.
- Do not add dependencies unless necessary; explain tradeoffs.
- After substantive edits, run the project’s tests or linters when feasible.

## Boundaries

- No production data or secrets in code, logs, or commits.
- Confirm ambiguous product behavior with the maintainer instead of guessing.

## Links

- Dotfiles AI/editor setup: see `../README.md` in this `.config` tree.
