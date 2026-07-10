# Parade Agents

Agents are specialized sub-processes spawned by the project coordinator to perform specific tasks.

## Agent Types

### Discovery Phase Agents

| Agent | File | Purpose |
|-------|------|---------|
| Technical SME | `technical-sme.md` | Codebase analysis, architecture review, technical risks |
| Business SME | `business-sme.md` | Requirements validation, stakeholder analysis |
| Context Builder | `context-builder.md` | Gather focused context for tasks |

### Implementation Agents

These agents are generic templates - customize for your project's tech stack.

| Agent | Label | Purpose |
|-------|-------|---------|
| SQL Agent | `agent:sql` | Database migrations, RLS policies, queries |
| TypeScript Agent | `agent:typescript` | Backend, edge functions, APIs |
| Swift Agent | `agent:swift` | iOS app, SwiftUI, services |
| Test Agent | `agent:test` | Verification, testing, QA |

## Creating Custom Agents

Copy the template below and customize for your needs:

```markdown
# <Agent Name> Agent

## Role
<What this agent does>

## Input
<What it receives from the coordinator>

## Tasks
<What it should accomplish>

## Output
<What it should return/produce>

## Guidelines
<Important rules and conventions>
```

## Agent Communication

### From Coordinator to Agent

Coordinator provides:
- Task ID and title
- Beads issue details (via `bd show <id>`)
- Pointers to relevant context

Coordinator does NOT provide:
- Full implementation details
- Code to copy
- Decisions the agent should make

### From Agent to Coordinator

Agent reports:
- Status: PASS or FAIL
- Summary: 2-3 sentences
- Files modified (list of paths)
- Any blockers or concerns

## Spawning Agents

Use Claude's Task tool:

```
Task: <task-id> - <title>

<description from beads>

Acceptance Criteria:
<from bd show output>

Context: <what to read/investigate>

Report: PASS/FAIL with summary
```

For parallel execution, use `run_in_background: true`.

## Best Practices

1. **Minimal context** - Let agents discover what they need
2. **Clear acceptance** - Define what "done" looks like
3. **Verification** - Always run tests/builds after
4. **Status updates** - Update beads immediately after completion
5. **Fail fast** - Block tasks early if issues found
