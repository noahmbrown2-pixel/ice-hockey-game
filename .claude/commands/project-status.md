# Project Status Command

View status and details of projects and their todos.

## Usage

```
/project-status [project-id]
```

## Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| project-id | Optional | Specific project ID to view. If omitted, shows all projects. |

## Examples

### View All Projects
```
/project-status
```

Output:
```
📊 Project Status Overview

Active Projects: 4
Completed: 2
Total Todos: 23

┌─────────────────────┬────────┬──────────┬──────────┬─────────────────────────┐
│ Project             │ Status │ Progress │ Todos    │ Assigned Team           │
├─────────────────────┼────────┼──────────┼──────────┼─────────────────────────┤
│ MVP Launch          │ active │ 65%      │ 8/12     │ startup-launch          │
│ Q1 Financial Review │ active │ 40%      │ 2/5      │ finance-ops             │
│ Codebase Refactor   │ active │ 20%      │ 1/5      │ dev-team-1              │
│ Market Research     │ active │ 80%      │ 4/5      │ research-alpha          │
└─────────────────────┴────────┴──────────┴──────────┴─────────────────────────┘
```

### View Specific Project
```
/project-status MVP-Launch
```

Output:
```
📊 Project: MVP Launch

Status: active
Progress: 65% (8/12 todos complete)
Team: startup-launch
Created: 2026-02-01

Milestones:
┌─────────────────────┬────────────┬─────────────┐
│ Milestone           │ Status     │ Due Date    │
├─────────────────────┼────────────┼─────────────┤
│ Market Validation   │ ✅ complete │ 2026-02-05  │
│ MVP Specification   │ ✅ complete │ 2026-02-10  │
│ Prototype Ready     │ 🔄 active  │ 2026-02-20  │
│ Beta Launch         │ ⏳ pending │ 2026-03-01  │
└─────────────────────┴────────────┴─────────────┘

Todos:
┌───┬─────────────────────────────────┬────────────┬──────────────────────┐
│ # │ Task                            │ Status     │ Assigned             │
├───┼─────────────────────────────────┼────────────┼──────────────────────┤
│ 1 │ Complete user interviews        │ ✅ done    │ market-research-agent│
│ 2 │ Analyze competitor features     │ ✅ done    │ market-research-agent│
│ 3 │ Define MVP feature set          │ ✅ done    │ mvp-planner-agent    │
│ 4 │ Create technical architecture   │ ✅ done    │ mvp-planner-agent    │
│ 5 │ Build authentication module     │ ✅ done    │ implementer-agent    │
│ 6 │ Build core API                  │ 🔄 active  │ implementer-agent    │
│ 7 │ Create landing page             │ ⏳ pending │ pitch-deck-agent     │
│ 8 │ Develop pitch deck              │ ⏳ pending │ pitch-deck-agent     │
└───┴─────────────────────────────────┴────────────┴──────────────────────┘

Recent Activity:
- [2h ago] implementer-agent completed "Build authentication module"
- [1d ago] mvp-planner-agent completed "Create technical architecture"
```

## Implementation

```python
from super_orchestrator import SuperOrchestrator

orchestrator = SuperOrchestrator()
result = orchestrator.process_request("show project status")
# or
result = orchestrator.process_request("project status MVP-Launch")
```

## Related Commands

- `/super status` - Full system status
- `/team-status` - Team status
- `/super start project` - Create new project
- `/super add task` - Add task to project
- `/super complete task` - Mark task complete
