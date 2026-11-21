# /productivity:update

Triage stale items, check memory for gaps, and sync from external tools.

## Usage

```
/productivity:update
/productivity:update --comprehensive
/productivity:update --email-scan
/productivity:update --calendar-check
```

## Description

Reviews and updates your productivity state by:
1. Identifying stale tasks (not updated in 7+ days)
2. Checking for memory gaps (unresolved discussions)
3. Scanning email for missed action items
4. Reviewing calendar for preparation needs

## Options

- `--comprehensive`: Deep scan of email, calendar, and chat for todos
- `--email-scan`: Focus on email inbox for action items
- `--calendar-check`: Review upcoming meetings for prep needs
- `--stale-days N`: Define stale threshold (default: 7)

## Workflow

### Standard Update

1. **Stale Item Triage**
   - Query tasks not updated in N days
   - Prompt for status: Still active? Complete? Blocked?
   - Update statuses accordingly

2. **Memory Gap Analysis**
   - Review recent sessions for unresolved discussions
   - Flag items mentioned but not tracked
   - Suggest new tasks for orphaned items

3. **External Sync**
   - Pull latest from Notion
   - Check for tasks assigned by others
   - Update due dates from external sources

### Comprehensive Update (--comprehensive)

Additional deep scan:
- **Email**: Search for action-oriented keywords
- **Calendar**: Check next 7 days for prep requirements
- **Recent files**: Look for TODO comments in modified files

## Output

```markdown
## Productivity Update Report

### Stale Items Found (2)
1. **"Research competitor pricing"** - 12 days stale
   - Action: [Mark Complete] [Still Working] [Deprioritize]

2. **"Update team wiki"** - 8 days stale
   - Action: [Mark Complete] [Still Working] [Deprioritize]

### Memory Gaps (1)
- Discussion about "API rate limiting" not tracked
  - Suggested: Create task for rate limit implementation

### Email Discoveries (--comprehensive)
- Action item from sarah@company.com: "Review Q4 budget by Friday"
- Follow-up needed: Vendor contract renewal

### Calendar Prep Needed
- **Tomorrow 2pm**: Client demo - No prep notes found
  - Suggested: Create prep checklist
```

## MCP Connectors

- **notionApi**: Task database sync
- **pocket-pick**: Recent item cache

## Integration

Works with:
- Gmail token for email scanning
- Calendar API for meeting prep
- V4 Memory for gap analysis
