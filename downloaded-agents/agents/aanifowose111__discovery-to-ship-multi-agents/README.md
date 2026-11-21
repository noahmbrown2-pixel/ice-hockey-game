# Assistants (subagents)

Each `.md` file in this folder defines one subagent — an independent worker or reviewer with its own context window. Claude Code auto-discovers them, and the main Claude can hand work off to one via the `Agent` tool by name.

> **This is where the reviewer assistants live.** Because multiple reviewers will exist per domain (each focused on a different aspect — viability, market fit, competitive landscape, architecture, security, etc.), this folder will grow large. The naming convention below is what keeps it navigable.

## File format

```markdown
---
name: product-viability-reviewer
description: Reviews a green-bucket idea card for problem viability on external evidence. Use during the validation phase defined in guides/product/idea-validation-methodology.md.
tools: Read, Grep, Bash, WebFetch, WebSearch
model: sonnet
---

You are an assistant specialized in <role>. Your job is to <responsibility>...

[Detailed instructions for the subagent, including what to look for, what to ignore, how to format output, and when to escalate to the user.]
```

## Naming convention

Filenames use the pattern **`<domain>-<role>.md`**, kebab-case throughout.

**Domain prefixes (use exactly these):**

| Prefix | Domain |
|---|---|
| `web-` | Web app development (Flask, dockerization, APIs, frontend) |
| `mobile-` | Mobile app development (React Native, native integrations) |
| `product-` | Product idea search, discovery, viability validation |
| `market-` | Market research, segment analysis, competitive scans |
| `funding-` | Funding strategy, approach, pitch/report production |

**Role suffix:** describe what the assistant *does*, not how it does it. Examples we are committed to building here:
- `product-viability-reviewer.md` *(done)*
- `product-competition-reviewer.md`
- `market-segment-reviewer.md`
- `product-scope-reviewer.md`
- `mobile-ux-reviewer.md` *(later — mobile UX is not covered by agent-skills personas)*
- `funding-pitch-reviewer.md` *(later — funding domain)*

Flat folder only — Claude Code does not auto-discover subagents nested inside subdirectories.

## Code / security / test review is delegated to `external/agent-skills`

The cloned agent-skills repo at `external/agent-skills/agents/` already ships three production-grade engineering personas:

- **`code-reviewer`** — 5-axis review (correctness, readability, architecture, security, performance). Replaces what would have been `web-arch-reviewer`, `mobile-arch-reviewer`, etc.
- **`security-auditor`** — vulnerability detection / OWASP-style audit. Replaces what would have been `web-security-reviewer`.
- **`test-engineer`** — test strategy, coverage, Prove-It pattern.

**We do not duplicate these.** Any code/security/test review on this project — for web MVPs and mobile MVPs alike — uses those personas, not new ones written here.

The three personas are **file-level copies** of the agent-skills sources, placed at `.claude/agents/<name>.md`:

```
.claude/agents/code-reviewer.md      ← copy of external/agent-skills/agents/code-reviewer.md
.claude/agents/security-auditor.md   ← copy of external/agent-skills/agents/security-auditor.md
.claude/agents/test-engineer.md      ← copy of external/agent-skills/agents/test-engineer.md
```

**Attribution.** These personas were originally authored by **Addy Osmani** (MIT License, Copyright 2025), maintained at [`addyosmani/agent-skills`](https://github.com/addyosmani/agent-skills). They reach this workspace via [`aanifowose111/agent-skills`](https://github.com/aanifowose111/agent-skills), a fork by Abiodun Anifowose. The full LICENSE accompanies the source via the git submodule at `external/agent-skills/LICENSE`.

**Why copies, not symlinks?** GitHub's web UI renders file symlinks as text containing the target path rather than the resolved content — clicking them doesn't show the file. Regular-file copies render properly. The trade-off is that upstream updates don't propagate automatically; they're brought in by a single command:

```bash
bash scripts/update-agent-skills.sh
```

This script pulls the submodule, re-copies the personas + skills, and commits the changes. From the user's perspective: one command, same experience as the old symlink workflow.

## Conventions for this project

- **One responsibility per assistant.** If a reviewer is checking both architecture *and* security, split it. The point of having multiple reviewers is that each one is focused.
- **Reviewers must return a verdict** (e.g., approve / approve-with-notes / reject) plus a short list of findings. Free-form prose is harder for the main Claude to act on.
- **Until the user has verified an assistant**, do not invoke it as part of an automated workflow. New assistants are draft-status; the user signs off before they become load-bearing.
- **Update the index in `CLAUDE.md`** whenever an assistant is added, renamed, or removed.
