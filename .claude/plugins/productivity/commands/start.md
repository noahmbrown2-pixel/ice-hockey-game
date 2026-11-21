# /productivity:start

Initialize the productivity workspace with tasks and memory systems.

## Usage

```
/productivity:start
/productivity:start --dashboard
/productivity:start --sync
```

## Description

Sets up your productivity environment by:
1. Loading existing tasks from Notion or local TASKS.md
2. Initializing the V4 memory system for context recall
3. Generating a dashboard view of current work items
4. Syncing external tool states (calendar, email priorities)

## Options

- `--dashboard`: Open an interactive HTML dashboard view
- `--sync`: Force sync with external tools before display
- `--quiet`: Minimal output, just status summary

## Workflow

### 1. Task Initialization
- Query Notion Tasks database for active items
- Load local TASKS.md if Notion unavailable
- Categorize by status: In Progress, Pending, Blocked

### 2. Memory System
- Load V4 memory context from session archives
- Identify recent conversation topics
- Prepare context for continuity

### 3. Dashboard Generation
- Create priority-sorted task list
- Show upcoming deadlines
- Display blocked items requiring attention

## Output

```markdown
## Productivity Dashboard

### Active Tasks (3)
- [ ] **[HIGH]** Complete plugin integration - Due: 2026-02-05
- [ ] **[MED]** Review PR #42 - Due: 2026-02-06
- [ ] **[LOW]** Update documentation

### Memory Context
- Last session: Knowledge Work Plugins discussion
- Key topics: MCP connectors, skill architecture

### Blocked Items (1)
- Waiting for API credentials from vendor
```

## MCP Connectors

- **notionApi** (required): Query tasks database
- **pocket-pick** (optional): Quick data retrieval

## Integration

Integrates with:
- V4 Memory System (`unified-communication/v4/memory/`)
- Notion Task Database
- Claude Code task list (TaskCreate, TaskList tools)
