# Multi-VM Self-Enhancement Requirements Specification

## Document Information
- **Version**: 1.0.0
- **Date**: 2025-12-17
- **Author**: TB Operations Agent
- **BLP Framework**: Alignment, Autonomy, Durability, Self-Improvement, Self-Replication, Self-Organization

---

## Requirements Traceability Matrix

| REQ-ID | Description | BLP Property | File(s) | Status |
|--------|-------------|--------------|---------|--------|
| REQ-001 | VM Fleet Configuration with Active/Standby | D, SR | vm_fleet_config.py | Pending |
| REQ-002 | Model Randomization within Categories | A, AU | model_randomizer.py | Pending |
| REQ-003 | CaMeL Security Layer for Tool Authorization | A | camel_security.py | Pending |
| REQ-004 | Self-Learning Agent with Memory Integration | SI, A | self_learning_agent.py | Pending |
| REQ-005 | Master Orchestrator Response Flow | SO, AU | master_orchestrator.py | Pending |
| REQ-006 | Non-Claude Backup Mode | D, AU | claude_fallback.py | Pending |
| REQ-007 | Cross-VM Knowledge Sync | SR, SO | knowledge_sync_daemon.py | Pending |
| REQ-008 | Full Codebase Deployment Script | SR, D | deploy_full_codebase.sh | Pending |
| REQ-009 | Standard I/O Exception Handling | A | All files | Pending |
| REQ-010 | Fleet Status Dashboard | SO | Generated HTML | Pending |

---

## Detailed Requirements

### REQ-001: VM Fleet Configuration
**BLP**: Durability (D), Self-Replication (SR)
**Description**: Configure all VMs with full codebase in active/standby mode
**Acceptance Criteria**:
- All VMs have identical code deployed
- Primary VM runs as ACTIVE, others as STANDBY
- Automatic failover when primary unavailable
- Optimal task routing based on VM specialization

### REQ-002: Model Randomization
**BLP**: Alignment (A), Autonomy (AU)
**Description**: Randomly select models within use-case categories
**Acceptance Criteria**:
- 5 model categories defined (reasoning, code_generation, analysis, fast_simple, massive_context)
- Weighted random selection based on success rate
- Non-Claude fallback pools for each category
- No single-model dependency

### REQ-003: CaMeL Security Layer
**BLP**: Alignment (A)
**Description**: Capability-aware Model execution Layer for tool authorization
**Acceptance Criteria**:
- Tool categories with risk levels (LOW, MEDIUM, HIGH, CRITICAL)
- Agent-to-capability mapping enforced
- All authorizations logged to audit trail
- Rate limiting per agent

### REQ-004: Self-Learning Agent
**BLP**: Self-Improvement (SI), Alignment (A)
**Description**: Agents learn from execution and update prompts/memory
**Acceptance Criteria**:
- Load learnings from V4 memory system
- Append learnings to agent prompt suffix
- Store new learnings after each execution
- Keep last 10 learnings per agent

### REQ-005: Master Orchestrator
**BLP**: Self-Organization (SO), Autonomy (AU)
**Description**: Central orchestrator receiving all agent responses
**Acceptance Criteria**:
- Dispatch tasks to appropriate agents/VMs
- Aggregate responses from multiple agents
- Sync learnings to all VMs
- Route final response to user (WhatsApp/Email/Nostr)

### REQ-006: Non-Claude Backup
**BLP**: Durability (D), Autonomy (AU)
**Description**: Automatic fallback when Claude Max plan unavailable
**Acceptance Criteria**:
- Monitor Claude API availability
- Trigger fallback after 3 consecutive failures
- Switch all categories to non-Claude model pools
- Notify user via WhatsApp

### REQ-007: Knowledge Sync
**BLP**: Self-Replication (SR), Self-Organization (SO)
**Description**: Cross-VM pattern synchronization
**Acceptance Criteria**:
- Export error patterns from local DB
- Push patterns to all standby VMs
- Import and deduplicate patterns
- Run every 15 minutes via cron

### REQ-008: Full Codebase Deployment
**BLP**: Self-Replication (SR), Durability (D)
**Description**: Deploy complete codebase to all VMs
**Acceptance Criteria**:
- Package skills, llm-router, ETAC-System
- Deploy to chainlink-jobs-x10, craigmbrown-website, intercabalsquabble-website
- Set VM_ROLE and OPTIMAL_FOR environment variables
- Verify deployment with health check

### REQ-009: Standard I/O Exception Handling
**BLP**: Alignment (A)
**Description**: Every exception prints details, every success prints before return
**Acceptance Criteria**:
- All exceptions include full traceback
- All successful responses logged before return
- Standard format for operation logging

### REQ-010: Fleet Status Dashboard
**BLP**: Self-Organization (SO)
**Description**: HTML dashboard showing fleet status
**Acceptance Criteria**:
- VM status (active/standby)
- Model pool usage statistics
- CaMeL audit log summary
- Learning sync status
- Non-Claude backup mode status

---

## BLP Property Definitions

| Property | Code | Description | Impact on Compute Advantage |
|----------|------|-------------|----------------------------|
| Alignment | A | Agent understands domain-specific problem/solution space | ↑Autonomy, ↓Time, ↓Effort |
| Autonomy | AU | Operates independently with minimal human oversight | ↑Autonomy, ↓Time, ↓Effort |
| Durability | D | Long lifespan, continuous operation | ↑Compute Scaling, ↑Monetary Cost |
| Self-Improvement | SI | Learns from experiences, refines approaches | ↑Compute Scaling, ↑Autonomy, ↓Time, ↓Effort |
| Self-Replication | SR | Creates copies/variants across problem domains | ↑Compute Scaling, ↑Autonomy, ↓Time, ↓Effort |
| Self-Organization | SO | Restructures processes for optimization | ↑Compute Scaling, ↑Autonomy, ↓Time, ↓Effort |

---

## Implementation Notes

### Standard I/O Pattern
All functions must follow this pattern:
```python
def function_name(params):
    """Docstring with REQ-ID reference."""
    func_name = "function_name"
    try:
        # Implementation
        result = ...
        print(f"SUCCESS: {func_name} - {result}")  # REQ-009
        return result
    except Exception as e:
        print(f"EXCEPTION: {func_name} - {type(e).__name__}: {e}")  # REQ-009
        print(f"TRACEBACK: {traceback.format_exc()}")
        raise
```

### Comment Tag Format
```python
# REQ-001: VM Fleet Configuration
# BLP: D (Durability), SR (Self-Replication)
```
