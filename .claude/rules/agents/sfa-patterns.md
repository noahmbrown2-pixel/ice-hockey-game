---
paths:
  - "TheBaby_Agents/**"
  - ".claude/agents/**"
---

# Single File Agent (SFA) Development Patterns

See @docs/agent-orchestration.md for ZTE framework and DITD lifecycle details.

## Core Principles
- SFAs must be **self-contained** with isolated dependencies
- Each SFA is a single Python file with its own UV deps or pip requirements
- Follow pydantic models for input/output validation
- Use type hints throughout
- Implement exponential backoff for external API calls

## BLP Framework
- 60 Base Level Properties across 6 categories
- Current coverage: 60/60 (100%) - complete as of PR #1750
- Categories: Alignment, Autonomy, Durability, Self-Improvement, Self-Replication, Self-Organization
- Formula: `Compute Advantage = (Compute Scaling * Autonomy) / (Time + Effort + Cost)`

## Agent Hierarchy
- Root orchestrator -> Workflow agents -> Base agents -> MCP tools
- TheBaby_Agents: 19 SFAs for specialized tasks
- Orchestrator-Agent: 13 coordination agents with human-in-the-loop
- WhatsApp-Manager-Agent: 6 communication and notification agents

## Key Commands
```bash
cd TheBaby_Agents && python cli.py --list-agents
cd Orchestrator-Agent && python orchestrator_repl.py
```

## Domain Filtering
Sub-agents do NOT reliably follow domain filtering instructions from their .md config.
The orchestrator MUST inject domain filter parameters directly into the task prompt.
See @scripts/domain_filter_injector.py for the injection utility.
Config: `configs/search_domain_profiles.json` (7 profiles, 44+ agents)
