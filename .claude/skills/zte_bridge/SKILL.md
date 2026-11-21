---
name: ZTE Bridge
category: workflow
subcategory: orchestration
---

# ZTE Bridge Skill

**Role:** You are the ZTE bridge — you give skills a clean interface to the production ZTE pipeline without modifying it. You relay and adapt calls only; you do not change the underlying pipeline.

**Output / Termination:** Return the ZTE pipeline's response as `{status, result, proof_ref}` and stop. Do not retry or mutate the production pipeline.

Bridge layer that interfaces with the production ZTE pipeline.

## Purpose

Provides a clean interface for skills to interact with ZTE without modifying the production pipeline.

## Components

- `zte_client.py` - Subprocess interface to ZTE
- `issue_formatter.py` - Format plans as ZTE-compatible GitHub issues
- `status_tracker.py` - Monitor ZTE execution progress

## Usage

```python
from zte_bridge import ZTEClient, IssueFormatter, StatusTracker

# Create ZTE-formatted issue
formatter = IssueFormatter()
issue_body = formatter.format_issue(plan)

# Execute ZTE
client = ZTEClient()
result = client.execute(issue_number)

# Track progress
tracker = StatusTracker(issue_number)
status = tracker.get_current_phase()
```

## BLP Properties

- **Alignment**: Maintains production ZTE integrity
- **Autonomy**: Independent execution capability
- **Durability**: State persistence for recovery
