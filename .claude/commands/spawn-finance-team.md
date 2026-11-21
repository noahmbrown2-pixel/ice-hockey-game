# Spawn Finance Team

Quick command to spawn a pre-configured Finance Operations Team.

## Usage

```
/spawn-finance-team
```

## Team Composition

The Finance Operations Team includes:

| Agent | Role | Capabilities |
|-------|------|--------------|
| financial-analyst-agent | Lead | Financial modeling, projections, analysis |
| budget-tracker-agent | Tracker | Budget management, expense tracking, variance |
| revenue-analyst-agent | Analyst | Revenue analysis, forecasting, trends |
| expense-categorizer-agent | Classifier | Expense classification, categorization, reporting |
| reporter-agent | Reporter | Status reports, summaries, dashboards |

## Wrapped Plugins

This team leverages:
- `/finance:*` - Finance skills
- `/data:*` - Data analysis skills

## Workflows

### Monthly Reporting
```
financial-analyst-agent -> reporter-agent
```

### Budget Review
```
budget-tracker-agent -> expense-categorizer-agent -> revenue-analyst-agent
```

### Forecast Update
```
revenue-analyst-agent -> financial-analyst-agent
```

## Implementation

```python
from super_orchestrator import SuperOrchestrator

orchestrator = SuperOrchestrator()
result = orchestrator.process_request("spawn finance team")
```

## Example Output

```
Created finance-ops-team with 5 agents:
- financial-analyst-agent (lead)
- budget-tracker-agent (tracker)
- revenue-analyst-agent (analyst)
- expense-categorizer-agent (classifier)
- reporter-agent (reporter)

Team ID: team-def67890
Status: active
```

## Related Commands

- `/super spawn startup-team` - Startup launch team
- `/super spawn research-team` - Research team
- `/super spawn dev-team` - Development team
- `/team-status` - View team status
