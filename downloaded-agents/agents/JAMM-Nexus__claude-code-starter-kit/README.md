# Agents

Agents are specialized sub-processes that Claude Code can launch to handle specific tasks autonomously. Each agent has its own context, tools, and instructions.

## The 3-Tier Model

Choose the right model tier based on the task complexity and cost:

### Opus (expensive, most capable)
Best for: strategic planning, complex architecture decisions, creative writing, multi-step analysis
```yaml
model: opus
```

### Sonnet (balanced — default)
Best for: typical engineering work, code reviews, content generation, research, debugging
```yaml
model: sonnet
```

### Haiku (cheap, fast)
Best for: mechanical tasks, data lookups, formatting, simple transformations, publishing
```yaml
model: haiku
```

## Creating an Agent

Create a `.md` file in this folder with YAML frontmatter:

```markdown
---
name: my-agent
description: One-line description of what this agent does
model: sonnet
tools:
  - Read
  - Glob
  - Grep
  - WebSearch
  - WebFetch
---

# Agent Instructions

[Detailed instructions for the agent — what to do, what NOT to do, how to format output]
```

## Key fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | No | Display name (defaults to filename) |
| `description` | Yes | Short description — shown in agent picker |
| `model` | No | `opus`, `sonnet`, or `haiku` (default: inherits from parent) |
| `tools` | No | List of tools the agent can use (default: all except Agent, Edit, Write) |

## Guidelines

- **Keep agents focused.** One agent = one job. A "researcher" shouldn't also edit files.
- **Limit tools.** Only give agents the tools they actually need. A research agent doesn't need Write.
- **Write clear instructions.** The agent starts fresh — it doesn't see your conversation. Tell it everything it needs to know.
- **Use the right tier.** Don't use Opus for a data lookup. Don't use Haiku for architecture planning.

## Included example

- `researcher.md` — Web + codebase research agent (Sonnet tier)

## Ideas for agents you might create

- **reviewer** — Code review with specific standards (Sonnet)
- **test-runner** — Run tests and report results (Haiku)
- **content-writer** — Generate content following your brand voice (Sonnet/Opus)
- **deployer** — Execute deployment checklists (Sonnet)
- **db-migrator** — Generate and validate database migrations (Sonnet)

## Official resources

- **How sub-agents work:** https://docs.anthropic.com/en/docs/claude-code/sub-agents
- **Agent teams (multi-agent):** https://docs.anthropic.com/en/docs/claude-code/agent-teams
- **Community skills & agents:** https://github.com/anthropics/skills
