# Sub-agents

This directory is intentionally empty. It's where you'll define **sub-agents**
at the Intermediate level.

Each sub-agent is a markdown file with YAML frontmatter:

```
.claude/agents/<name>.md
```

Required frontmatter: `name` and `description`. Optional: `tools`, `model`,
`permissionMode`, `memory`, `isolation: worktree`, and more. The body is the
agent's system prompt. The main session delegates to a sub-agent when a task
matches its `description`.

For the Intermediate/Advanced levels, the booking-confirmation workflow is a good fit for multiple agents:
one to fetch pending bookings, one to confirm them, one to handle exceptions.
