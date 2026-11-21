# Task Management Skill

Auto-triggered skill for task tracking and workflow management.

## Trigger Phrases

- "create a task for"
- "add to my todo list"
- "what are my action items"
- "assign this to"
- "set deadline for"
- "prioritize"
- "mark as complete"

## Overview

Markdown-based task tracking using a shared TASKS.md pattern, integrated with:
- Claude Code's native TaskCreate/TaskList tools
- Notion Tasks database
- Priority and deadline management

## Capabilities

### 1. Task Creation

When user mentions a task or action item:

```markdown
Extract and create:
- Subject: Clear, actionable title
- Description: Context and acceptance criteria
- Priority: HIGH / MEDIUM / LOW
- Deadline: Parsed from natural language
- Assignee: If mentioned
```

### 2. Task Querying

List tasks by various criteria:

```
/productivity task queries:
- "What are my high priority tasks?"
- "What's due this week?"
- "Show blocked items"
- "Tasks assigned to me"
```

### 3. Status Updates

Update task states:

```
States: pending → in_progress → completed
Also: blocked, delegated, deferred
```

### 4. Priority Management

Automatic priority inference:
- Deadline proximity → higher priority
- Explicit keywords ("urgent", "critical")
- Blocker status → elevated visibility

## Integration

### Notion Sync

When notionApi available:
- Create tasks in Notion Tasks database
- Sync status bidirectionally
- Pull tasks assigned by collaborators

### Claude Code Tasks

Maps to native tools:
- `TaskCreate` for new items
- `TaskUpdate` for status changes
- `TaskList` for querying

### TASKS.md Pattern

Local markdown fallback:

```markdown
# Tasks

## In Progress
- [ ] **[HIGH]** Complete plugin integration
  - Due: 2026-02-05
  - Notes: Phase 3 of 6

## Pending
- [ ] Review documentation updates

## Completed
- [x] Set up plugin directory structure
```

## Workflow Automation

### Daily Briefing Integration

Feeds into daily productivity briefing:
- Due today
- Overdue items
- Recently completed

### Standup Generation

Auto-generate standup format:

```markdown
**Yesterday**: Completed task X, Y
**Today**: Working on task Z
**Blockers**: Waiting on A
```

## Best Practices

1. **Clear subjects**: "Implement user authentication" not "auth stuff"
2. **Include context**: Why the task matters
3. **Set realistic deadlines**: With buffer
4. **Update promptly**: Keep status current

## Output Format

```markdown
## Task Created

**Subject**: Implement rate limiting for API
**Priority**: HIGH
**Deadline**: 2026-02-07
**Status**: pending

### Description
Add rate limiting to prevent API abuse:
- 100 requests/minute for free tier
- 1000 requests/minute for premium

### Synced To
- Claude Code: Task #47
- Notion: Page abc123
```
