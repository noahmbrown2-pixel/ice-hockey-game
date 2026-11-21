# Team Status Command

View status and details of agent teams.

## Usage

```
/team-status [team-id]
```

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| team-id | Optional | Specific team ID to view. If omitted, shows all teams. |

## Examples

### View All Teams
```
/team-status
```

Output:
```
📊 Team Status Overview

Active Teams: 3
Idle Teams: 1
Total Agents: 18

┌─────────────────┬────────┬─────────┬─────────────────────────┐
│ Team ID         │ Status │ Members │ Purpose                 │
├─────────────────┼────────┼─────────┼─────────────────────────┤
│ startup-launch  │ active │ 5       │ Launch new startup      │
│ finance-ops     │ active │ 5       │ Financial operations    │
│ research-alpha  │ active │ 4       │ Deep research tasks     │
│ dev-team-1      │ idle   │ 5       │ Software development    │
└─────────────────┴────────┴─────────┴─────────────────────────┘
```

### View Specific Team
```
/team-status startup-launch
```

Output:
```
📊 Team: startup-launch

Status: active
Purpose: Launch new startup from idea to MVP
Created: 2026-02-05 14:30:00

Members:
┌──────────────────────┬────────────┬─────────────────────────────────┐
│ Agent                │ Role       │ Capabilities                    │
├──────────────────────┼────────────┼─────────────────────────────────┤
│ pitch-deck-agent     │ lead       │ Pitch creation, investor docs   │
│ market-research-agent│ researcher │ Market analysis, TAM/SAM/SOM    │
│ mvp-planner-agent    │ architect  │ MVP scoping, prioritization     │
│ business-model-agent │ analyst    │ Unit economics, projections     │
│ implementer-agent    │ builder    │ Implementation, coding          │
└──────────────────────┴────────────┴─────────────────────────────────┘

Current Workflow: idea_validation
Progress: 60%

Active Tasks:
- [in_progress] Market analysis for AI assistant space
- [pending] Competitive landscape research
```

## Implementation

```python
from super_orchestrator import SuperOrchestrator

orchestrator = SuperOrchestrator()
result = orchestrator.process_request("show team status")
# or
result = orchestrator.process_request("team status startup-launch")
```

## Related Commands

- `/super status` - Full system status
- `/project-status` - Project and todo status
- `/super create team` - Create new team
- `/super dissolve team` - Remove a team
