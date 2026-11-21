# {Agent Name} - Golden Standard Agent

<!-- @REQ-GA-XXX: Agent Identity | BLP: [A, AU, D, SI, SR, SO] -->
<!-- Agent ID: agent-{category}-{name}-{uuid8} -->
<!-- Nostr Pubkey: npub1... (if payment-enabled) -->

## Overview

**Category**: {category}
**Model**: {haiku|sonnet|opus|default}
**BLP Properties**: {A, AU, D, SI, SR, SO}
**Status**: Production

{Brief description of agent purpose and capabilities}

---

## Usage Recommendations

<!-- @REQ-GA-001: Usage recommendations section | BLP: [A, AU] -->

### Best Used For
- {Primary use case with specific example}
- {Secondary use case with example}
- {Tertiary use case}

### Not Recommended For
- {When another agent is better suited}
- {Task complexity limitations}
- {Resource/time constraints}

### Pairs Well With
- `{complementary-agent-1}` - for {capability extension}
- `{complementary-agent-2}` - for {workflow integration}
- `{complementary-agent-3}` - for {specialized processing}

### When to Use Proactively
{Describe conditions when this agent should be invoked automatically}

---

## LLM Router Integration

<!-- @REQ-GA-005: LLM Router integration | BLP: [SI, SO] -->

```python
from llm_router.core.router import LLMRouter, TaskComplexity

router = LLMRouter()
recommendation = await router.get_model_for_agent_task(
    task_type="{research|analysis|workflow|generation}",
    agent_id="{agent-id}",
    complexity="{SIMPLE|MEDIUM|COMPLEX}",
    context={"description": "..."}
)
```

**Model Tier**: {Simple|Medium|Complex|Massive}
**Recommended Models**:
- Primary: {model-name}
- Fallback: {fallback-model}
- Budget: {budget-model}

---

## CaMel Security Configuration

<!-- @REQ-GA-006: CaMel security configuration | BLP: [A, D] -->

```python
from tac_adw_security import CaMelSecuritySystem, SecurityContext, SecurityLevel

security = CaMelSecuritySystem()
context = SecurityContext(
    user_id="{agent-id}",
    source="agent_api",
    security_level=SecurityLevel.INTERNAL,
    operation_type="{service_call|data_access|external_api}",
    timestamp=datetime.now().isoformat(),
    session_id="{session-id}",
    metadata={}
)

decision = security.validate_request(user_input, context)
```

**Security Level**: {INTERNAL|TRUSTED|EXTERNAL}
**Anti-Persuasion**: Enabled
**Byzantine Consensus**: 3 validators, 67% threshold
**Deviation Threshold**: 30%

---

## Error Handling

<!-- @REQ-GA-002: 4-case error handling block | BLP: [D, SI] -->

| Error Type | Response | Recovery Action |
|------------|----------|-----------------|
| API 401/403 | Notify user, don't retry | Request new credentials |
| API 429 | Exponential backoff (1s-60s) | Queue and retry up to 3x |
| Timeout | Checkpoint state | Resume from checkpoint |
| Parse Error | Log with full context | Request clarification |

### Standard I/O Pattern

<!-- @REQ-GA-010: Standard I/O | BLP: [D, SI] -->

```python
try:
    result = perform_operation()
    print(f"SUCCESS: Operation completed - {result}")  # Always print success
    return result
except SpecificError as e:
    print(f"ERROR: {type(e).__name__}: {e}")  # Full exception details
    print(f"  Context: operation={operation_name}")
    print(traceback.format_exc())
    raise
except Exception as e:
    print(f"ERROR: Unexpected: {type(e).__name__}: {e}")
    print(traceback.format_exc())
    raise
```

---

## MCP Tools Available

<!-- @REQ-GA-009: Integration points section | BLP: [SO] -->

### Core Tools
- `Read`, `Write`, `Edit` - File operations
- `Bash` - Command execution
- `Grep`, `Glob` - Search operations
- `Task` - Sub-agent spawning

### MCP External Tools
- `mcp__notionApi__*` - Notion database operations
- `mcp__whatsapp__send_message` - WhatsApp notifications
- `mcp__exa__web_search_exa` - Semantic web search
- `mcp__elevenlabs__text_to_speech` - Audio generation
- `mcp__just-prompt__prompt` - Multi-LLM prompting

---

## Agent Identity

<!-- @REQ-GA-007: Persistent agent ID | BLP: [D, SR] -->

```json
{
  "agent_id": "agent-{category}-{name}-{uuid8}",
  "created_at": "{ISO-8601}",
  "version": "1.0.0",
  "registry_entry": true
}
```

### Nostr Identity (if payment-enabled)

<!-- @REQ-GA-008: Nostr identity | BLP: [AU, SR] -->

```json
{
  "npub": "npub1...",
  "nip05": "{agent-name}@intercabalsquabble.io",
  "lightning_address": "{agent-name}@intercabalsquabble.io",
  "wallet_type": "ecash",
  "federation": "fed11qgqyj3mfwfhksw309umxxe3hxv6rsdfnxv6"
}
```

---

## BLP Properties

<!-- @REQ-GA-004: BLP properties tags | BLP: [A, AU, D, SI, SR, SO] -->

| Property | Status | Implementation |
|----------|--------|----------------|
| **Alignment (A)** | {check} | {How agent aligns with domain} |
| **Autonomy (AU)** | {check} | {Decision-making capabilities} |
| **Durability (D)** | {check} | {State persistence, recovery} |
| **Self-Improvement (SI)** | {check} | {Learning, optimization} |
| **Self-Replication (SR)** | {check} | {Scaling, spawning} |
| **Self-Organization (SO)** | {check} | {Coordination, workflow} |

### BLP Integration Code

```python
# Import golden agent BLP capabilities
from blp_capabilities import (
    GoldenBLPAgent,
    create_golden_agent,
    SafetyConstraint,
    EthicalPrinciple,
    Action
)

# Create agent with BLP capabilities
agent = create_golden_agent(
    agent_id="{agent-id}",
    category="{category}",
    name="{name}",
    custom_constraints=[
        SafetyConstraint(
            name="custom_constraint",
            validator=lambda a: {custom_validation_logic}
        )
    ]
)

# Execute actions with full BLP validation
action = Action(
    id="action-001",
    description="Perform task",
    parameters={"key": "value"}
)

if agent.is_action_safe(action):
    result = agent.execute_with_accountability(
        action,
        reasoning="User requested this operation"
    )
```

### BLP Capability Summary

| Capability | Module | Usage |
|------------|--------|-------|
| Safety Constraints | `SafetyMonitor` | Block unsafe actions |
| Ethical Framework | `EthicalFramework` | Evaluate action ethics |
| Accountability | `AccountabilityModule` | Track all decisions |
| Manipulation Guard | `ManipulationRobustness` | Detect adversarial inputs |
| Autonomy Control | `AutonomyController` | Gate action approval |
| Goal Alignment | `GoalAlignment` | Verify goal compatibility |

---

## REQ Traceability

<!-- @REQ-GA-003: REQ tag annotations | BLP: [A] -->

| REQ ID | Description | Status |
|--------|-------------|--------|
| REQ-GA-001 | Usage recommendations | {check} |
| REQ-GA-002 | Error handling | {check} |
| REQ-GA-003 | REQ traceability | {check} |
| REQ-GA-004 | BLP properties | {check} |
| REQ-GA-005 | LLM Router | {check} |
| REQ-GA-006 | CaMel Security | {check} |
| REQ-GA-007 | Persistent ID | {check} |
| REQ-GA-008 | Nostr identity | {check} |
| REQ-GA-009 | Integration points | {check} |
| REQ-GA-010 | Standard I/O | {check} |

---

## Prompt Definition

```yaml
name: {agent-name}
description: |
  {Detailed description of agent capabilities and behavior}

model: {haiku|sonnet|opus}
tools:
  - {tool-1}
  - {tool-2}
  - {tool-3}

# Agent behavior and instructions follow...
```

{Full agent prompt content here}

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | {date} | Initial golden standard release |

---

**Generated by**: DITD Implementation Agent
**Validated by**: DITD Test Agent
**REQ Coverage**: 10/10 (100%)
**BLP Coverage**: {X}/6 ({Y}%)
