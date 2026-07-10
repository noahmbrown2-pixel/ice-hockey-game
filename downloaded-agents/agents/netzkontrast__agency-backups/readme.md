# .claude/agents/ — 16 persona sub-agent re-exports

Authored by Task 094 ST-2 (PR #124 review-fix revision).
Each `<slug>.md` file in this folder is a **hybrid wrapper**: the
frontmatter exposes the slug + description to Claude Code's sub-agent
discovery path (per https://docs.anthropic.com/en/docs/claude-code/sub-agents),
and the body instructs the activated subagent to bootstrap by `Skill`-loading
the canonical `skills/<slug>/SKILL.md` body before producing substantive
output. This keeps SKILL.md as the single source of truth (SHA-pinned
per ADR-0011 D.3) while ensuring `@<slug>` activations actually run
under the persona's guardrails — answering Codex P1 #2 on PR #124.

If a future runtime check confirms that Claude Code does NOT pass the
SKILL.md body into a subagent context automatically (even when the
`Skill` bootstrap directive fires), the hybrid pattern remains correct:
the body's `Read skills/<slug>/SKILL.md` fallback still loads the
canonical instructions verbatim.

**Note (PR #124 review fix, P2 #1):** `sc-pm-agent` is intentionally
*not* re-exported here. Per [CLAUDE.md §13.1](../../CLAUDE.md#131-superclaude-sc--39-skills-skill_source-superclaudev430)
it is `skill_kind: meta` and is invokable only via `/sc:pm`; re-exporting
it as `@sc-pm-agent` would bypass the orchestrator-routing constraint.

## Roster (16)

- [sc-system-architect.md](./sc-system-architect.md)
- [sc-backend-architect.md](./sc-backend-architect.md)
- [sc-frontend-architect.md](./sc-frontend-architect.md)
- [sc-security-engineer.md](./sc-security-engineer.md)
- [sc-quality-engineer.md](./sc-quality-engineer.md)
- [sc-refactoring-expert.md](./sc-refactoring-expert.md)
- [sc-performance-engineer.md](./sc-performance-engineer.md)
- [sc-deep-research-agent.md](./sc-deep-research-agent.md)
- [sc-devops-architect.md](./sc-devops-architect.md)
- [sc-learning-guide.md](./sc-learning-guide.md)
- [sc-python-expert.md](./sc-python-expert.md)
- [sc-requirements-analyst.md](./sc-requirements-analyst.md)
- [sc-root-cause-analyst.md](./sc-root-cause-analyst.md)
- [sc-self-review.md](./sc-self-review.md)
- [sc-socratic-mentor.md](./sc-socratic-mentor.md)
- [superpowers-code-reviewer.md](./superpowers-code-reviewer.md)

## Why thin re-exports?

The 17 entries are SHA-pinned to the imported corpora (ADR-0011 D.3).
Duplicating their bodies into `.claude/agents/<slug>.md` would create a
drift surface the next time `skills/<slug>/SKILL.md` is re-synced.
The thin-wrapper pattern keeps the persona descriptions stable while
the implementation evolves under the canonical path.
