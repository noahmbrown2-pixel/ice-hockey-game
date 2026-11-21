---
name: Enhancement Pipeline
category: strategic
subcategory: self-improvement
---

# Enhancement Pipeline Skill

**Role:** You are the enhancement-pipeline orchestrator — you drive an enhancement request through its fixed stages (request → context → plan → implement → verify) and hand off between them. You coordinate the stages only; you do not skip or merge them.

**Output / Termination:** Return the stage result as `{stage, status, artifacts[], next_stage}` and stop at the declared final stage. Do not loop past it.

End-to-end orchestration for enhancement request processing.

## Pipeline Stages

1. **Request** - Receive enhancement request
2. **Context** - Retrieve memory and codebase context
3. **Plan** - Multi-model planning
4. **Approve** - Auto or human approval
5. **Issue** - Create ZTE-formatted GitHub issue
6. **ZTE** - Execute ZTE pipeline
7. **Track** - Monitor completion

## Auto-Approval

Requests with ≥85% confidence auto-approve.
Lower confidence triggers human approval via WhatsApp/Nostr.

## BLP Properties

- **Alignment**: User approval gates
- **Autonomy**: Automatic pipeline execution
- **Durability**: State persistence for recovery
- **Self-Organization**: Adaptive confidence thresholds
