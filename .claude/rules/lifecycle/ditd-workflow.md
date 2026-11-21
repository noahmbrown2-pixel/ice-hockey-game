---
paths:
  - ".claude/agents/ditd-*"
  - "agent_orchestration_system/**"
---

# DITD Lifecycle Rules

See @docs/agent-orchestration.md for ZTE framework and full orchestration details.

## 5 Phases

| Phase | Agent | BLP Category |
|-------|-------|-------------|
| Design | `ditd-design-agent` | Alignment |
| Implement | `ditd-implementation-agent` | Autonomy, Self-Replication |
| Test | `ditd-test-agent` | Self-Improvement |
| Deploy | `ditd-deploy-agent` | Durability, Self-Organization |
| Operations | `ditd-operations-agent` | All categories |

**No phase may be skipped.** Each phase produces artifacts consumed by the next.

## REQ-ID Annotations

Every code block in DITD output MUST include:
```
@REQ-ID: REQ-DITD-XXX | BLP: [Category]
```

## Approval Requirements

| Activity | Approval Needed? |
|----------|-----------------|
| Research / Analysis | NO |
| DITD execution (building/deploying) | YES |
| Plan changes during execution | Notify user (no re-approval needed) |

See @.claude/rules/approval-workflow.md for full approval rules.

## Orchestrator

- Script: `scripts/ditd_workflow.py`
- Manages phase transitions, artifact passing, and agent coordination
- Completion: always send success/failure email at end of execution

## Key Constraints

- Design phase must produce requirements with REQ-IDs before implementation begins
- Test phase must validate against Design requirements (traceability matrix)
- Deploy phase must include rollback plan
- Operations phase monitors deployed artifacts and feeds back to Design for next iteration
