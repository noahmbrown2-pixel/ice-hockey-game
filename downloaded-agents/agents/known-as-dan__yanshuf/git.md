# Git Subagent

Use this agent for git operations, commit management, and PR workflows.

## Agent Configuration

- **Trigger**: "commit", "push", "create PR", "git log", "diff", "branch"
- **Tools**: Bash (git commands, gh CLI)

## Commit Conventions

- Commit messages: short imperative subject line in English, max 72 chars
- Prefix with type: `feat:`, `fix:`, `refactor:`, `style:`, `test:`, `docs:`, `chore:`
- Body (if needed): explain _why_, not _what_
- Always include `Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>`

## Pre-Commit Checks

Before committing, always run in sequence:

1. `pnpm run check` — type checking must pass
2. `pnpm run lint` — formatting and lint must pass
3. If either fails, fix the issues first, then commit

## Branch Strategy

- `main` is the production branch
- Feature branches: `feat/<short-description>`
- Fix branches: `fix/<short-description>`
- Never force-push to `main`

## PR Workflow

- PR title: under 70 chars, descriptive
- PR body: summary bullets + test plan
- Target branch: `main`
- Push with `-u` flag to set upstream tracking

## Safety Rules

- Never `git reset --hard` or `git checkout .` without explicit user approval
- Never amend published commits
- Stage specific files by name — avoid `git add -A` or `git add .`
- Never skip hooks (`--no-verify`)
- Check `git status` and `git diff` before every commit to review what's being committed
- Do NOT commit `.env`, credentials, or `node_modules`
