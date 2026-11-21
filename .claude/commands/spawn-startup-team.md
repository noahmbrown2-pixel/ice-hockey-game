# Spawn Startup Team

Quick command to spawn a pre-configured Startup Launch Team.

## Usage

```
/spawn-startup-team
```

## Team Composition

The Startup Launch Team includes:

| Agent | Role | Capabilities |
|-------|------|--------------|
| pitch-deck-agent | Lead | Pitch creation, investor materials |
| market-research-agent | Researcher | Market analysis, TAM/SAM/SOM |
| mvp-planner-agent | Architect | MVP scoping, prioritization |
| business-model-agent | Analyst | Unit economics, projections |
| implementer-agent | Builder | Implementation, coding |

## Wrapped Plugins

This team leverages:
- `/pm:*` - Product management skills
- `/sales:*` - Sales skills
- `/marketing:*` - Marketing skills

## Workflows

### Idea Validation
```
market-research-agent -> business-model-agent
```

### MVP Planning
```
mvp-planner-agent -> implementer-agent
```

### Investor Preparation
```
pitch-deck-agent -> market-research-agent
```

## Implementation

```python
from super_orchestrator import SuperOrchestrator

orchestrator = SuperOrchestrator()
result = orchestrator.process_request("spawn startup team")
```

## Example Output

```
Created startup-launch-team with 5 agents:
- pitch-deck-agent (lead)
- market-research-agent (researcher)
- mvp-planner-agent (architect)
- business-model-agent (analyst)
- implementer-agent (builder)

Team ID: team-abc12345
Status: active
```

## Related Commands

- `/super spawn finance-team` - Finance operations team
- `/super spawn research-team` - Research team
- `/super spawn dev-team` - Development team
- `/team-status` - View team status
