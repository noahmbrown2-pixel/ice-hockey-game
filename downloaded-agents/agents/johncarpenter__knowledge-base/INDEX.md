# Knowledge Base Agents

This directory contains agent references and project-specific overrides. Global agents are defined in `~/.claude/agents/`.

## Available Agents

| Agent | Location | Purpose | Model | Proactive |
|-------|----------|---------|-------|-----------|
| pmo-worker | Global | PMO coordination, Jira sync, planning | sonnet | Yes |
| research-worker | Global | Technical research, feasibility analysis, buy-vs-build | opus | Yes |
| suncorp-worker | Project | Suncorp FinOps, KPI, cloud-doctor MCP | haiku | No |

## Global vs Project Agents

- **Global agents** (`~/.claude/agents/`): Available across all projects, auto-detected
- **Project agents** (`.claude/agents/`): Project-specific, can override global definitions

## Architecture

```
User Request
     │
     ▼
┌─────────────┐
│ Main Claude │  ◄─── Orchestrates, delegates to agents
└─────────────┘
     │
     ├── Task tool ──► pmo-worker (PMO operations)
     │
     ├── Task tool ──► research-worker (Technical research)
     │
     └── Task tool ──► [future: code-worker]
```

## Coordination Model

Agents coordinate via:

1. **Task System** - Claude's built-in TaskList/TaskCreate/TaskUpdate tools
   - One owner per task
   - Status: pending → in_progress → completed
   - Dependencies via blockedBy/addBlocks

2. **Shared State** - `operations/pmo/agent-activity.md`
   - Activity log for visibility
   - Current agent operations
   - Coordination notes

3. **Local Files** - Knowledge base markdown files
   - `operations/pmo/tasks/*.md` - Work items
   - `operations/pmo/epics/*.md` - Epics
   - `operations/pmo/weekly-plan.md` - Current focus

## Adding New Agents

1. Create `{agent-name}.md` in this directory
2. Follow the frontmatter format:
   ```yaml
   ---
   name: agent-name
   description: When and how to use this agent
   tools: Comma, Separated, Tool, Names
   model: sonnet | opus | haiku
   color: blue | green | orange | etc
   ---
   ```
3. Define the agent's system prompt in the body
4. Update this INDEX.md

## Agent Design Principles

- **Single Responsibility** - Each agent has a clear domain
- **Explicit Handoffs** - Use Task tools for coordination
- **Fail Safe** - Handle errors gracefully, ask when uncertain
- **Visibility** - Log significant operations
- **Incremental** - Work in small, verifiable steps

## Future Agents (Planned)

| Agent | Purpose | Priority |
|-------|---------|----------|
| meeting-worker | Granola sync, action item tracking | Medium |
| timesheet-worker | Time entry coordination | Low |
| kb-maintainer | Index updates, link checking | Low |
