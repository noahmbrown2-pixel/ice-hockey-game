# APOS Control Command

## REQ-APOS-008: Control Interface
## BLP: [Autonomy] - Command interface for APOS control

Control the Autonomous Plan Operationalization System (APOS).

## Usage

```bash
/apos-control <action> [options]
```

## Actions

### start
Start the APOS daemon and begin autonomous plan execution.
```bash
/apos-control start
```

### stop
Stop the APOS daemon gracefully.
```bash
/apos-control stop
```

### pause
Pause execution (complete current plans, don't start new ones).
```bash
/apos-control pause
```

### resume
Resume from pause state.
```bash
/apos-control resume
```

### status
Get current APOS status and queue information.
```bash
/apos-control status
```

### queue
List all plans in the queue with priorities.
```bash
/apos-control queue
```

### execute
Execute a specific plan immediately.
```bash
/apos-control execute --plan <plan_path>
```

### approve
Process approval for a pending plan.
```bash
/apos-control approve --request-id <id> --channel <whatsapp|email>
```

### reject
Reject a pending plan approval.
```bash
/apos-control reject --request-id <id> --reason <reason>
```

### dashboard
Generate and open the status dashboard.
```bash
/apos-control dashboard
```

## Implementation

When this command is invoked, execute the following Python code:

```python
#!/usr/bin/env python3
"""
APOS Control Command

REQ-APOS-008: Control Interface
BLP: [Autonomy] - Command interface for APOS control
"""

import sys
import json
import argparse
from pathlib import Path

# Add project path
sys.path.insert(0, '/home/craigmbrown/Project')

from plan_operationalization import (
    APOSDaemon,
    ExecutionController,
    StatusTracker,
    DualApprovalHandler
)
from plan_operationalization.standard_io import standard_io, log_success, log_exception


class APOSControl:
    """
    REQ-APOS-008: APOS Control Interface
    BLP: [Autonomy] - Command-line control for APOS daemon
    """

    def __init__(self):
        """
        REQ-APOS-008: Initialize control interface.
        BLP: [Autonomy] - Load controller components.
        """
        self.controller = ExecutionController()
        self.tracker = StatusTracker()
        self.approval = DualApprovalHandler()

    @standard_io
    def start(self) -> dict:
        """
        REQ-APOS-008: Start APOS daemon.
        BLP: [Autonomy] - Begin autonomous operation.
        """
        success = self.controller.start()
        return {
            "action": "start",
            "success": success,
            "state": self.controller.state.value
        }

    @standard_io
    def stop(self) -> dict:
        """
        REQ-APOS-008: Stop APOS daemon.
        BLP: [Autonomy] - Graceful shutdown.
        """
        success = self.controller.stop()
        return {
            "action": "stop",
            "success": success,
            "state": self.controller.state.value
        }

    @standard_io
    def pause(self) -> dict:
        """
        REQ-APOS-008: Pause execution.
        BLP: [Autonomy] - Pause without data loss.
        """
        success = self.controller.pause()
        return {
            "action": "pause",
            "success": success,
            "state": self.controller.state.value
        }

    @standard_io
    def resume(self) -> dict:
        """
        REQ-APOS-008: Resume from pause.
        BLP: [Autonomy] - Continue operation.
        """
        success = self.controller.resume()
        return {
            "action": "resume",
            "success": success,
            "state": self.controller.state.value
        }

    @standard_io
    def status(self) -> dict:
        """
        REQ-APOS-008: Get current status.
        BLP: [Self-Improvement] - Status monitoring.
        """
        return {
            "action": "status",
            "controller": self.controller.get_status(),
            "tracker": self.tracker.get_summary(),
            "pending_approvals": self.approval.get_pending_count()
        }

    @standard_io
    def queue(self) -> dict:
        """
        REQ-APOS-008: List queue contents.
        BLP: [Self-Organization] - Queue visibility.
        """
        return {
            "action": "queue",
            "plans": self.controller.get_queue()
        }

    @standard_io
    def execute(self, plan_path: str) -> dict:
        """
        REQ-APOS-008: Execute specific plan.
        BLP: [Autonomy] - Manual override.
        """
        result = self.controller.execute_now(plan_path)
        return {
            "action": "execute",
            "plan_path": plan_path,
            "success": result.success,
            "result": result.__dict__
        }

    @standard_io
    def approve(self, request_id: str, channel: str) -> dict:
        """
        REQ-APOS-008: Process approval.
        BLP: [Autonomy] - Approval handling.
        """
        success, state = self.approval.process_response(channel, request_id, True)
        return {
            "action": "approve",
            "request_id": request_id,
            "channel": channel,
            "success": success,
            "state": state.value
        }

    @standard_io
    def reject(self, request_id: str, reason: str) -> dict:
        """
        REQ-APOS-008: Reject plan.
        BLP: [Autonomy] - Rejection handling.
        """
        success, state = self.approval.process_response("manual", request_id, False)
        return {
            "action": "reject",
            "request_id": request_id,
            "reason": reason,
            "success": success,
            "state": state.value
        }

    @standard_io
    def dashboard(self) -> dict:
        """
        REQ-APOS-008: Generate dashboard.
        BLP: [Self-Improvement] - Visual reporting.
        """
        dashboard_path = self.tracker.generate_dashboard()
        return {
            "action": "dashboard",
            "path": dashboard_path,
            "url": f"http://34.58.12.50:8080/{Path(dashboard_path).name}"
        }


def main():
    """
    REQ-APOS-008: Main entry point.
    BLP: [Autonomy] - CLI interface.
    """
    parser = argparse.ArgumentParser(
        description="APOS Control Interface - REQ-APOS-008"
    )
    subparsers = parser.add_subparsers(dest="action", help="Action to perform")

    # Start
    subparsers.add_parser("start", help="Start APOS daemon")

    # Stop
    subparsers.add_parser("stop", help="Stop APOS daemon")

    # Pause
    subparsers.add_parser("pause", help="Pause execution")

    # Resume
    subparsers.add_parser("resume", help="Resume from pause")

    # Status
    subparsers.add_parser("status", help="Get current status")

    # Queue
    subparsers.add_parser("queue", help="List queue contents")

    # Execute
    execute_parser = subparsers.add_parser("execute", help="Execute specific plan")
    execute_parser.add_argument("--plan", required=True, help="Plan file path")

    # Approve
    approve_parser = subparsers.add_parser("approve", help="Approve pending plan")
    approve_parser.add_argument("--request-id", required=True, help="Request ID")
    approve_parser.add_argument("--channel", required=True, choices=["whatsapp", "email"])

    # Reject
    reject_parser = subparsers.add_parser("reject", help="Reject pending plan")
    reject_parser.add_argument("--request-id", required=True, help="Request ID")
    reject_parser.add_argument("--reason", required=True, help="Rejection reason")

    # Dashboard
    subparsers.add_parser("dashboard", help="Generate status dashboard")

    args = parser.parse_args()

    if not args.action:
        parser.print_help()
        sys.exit(1)

    control = APOSControl()

    try:
        if args.action == "start":
            result = control.start()
        elif args.action == "stop":
            result = control.stop()
        elif args.action == "pause":
            result = control.pause()
        elif args.action == "resume":
            result = control.resume()
        elif args.action == "status":
            result = control.status()
        elif args.action == "queue":
            result = control.queue()
        elif args.action == "execute":
            result = control.execute(args.plan)
        elif args.action == "approve":
            result = control.approve(args.request_id, args.channel)
        elif args.action == "reject":
            result = control.reject(args.request_id, args.reason)
        elif args.action == "dashboard":
            result = control.dashboard()
        else:
            parser.print_help()
            sys.exit(1)

        print(json.dumps(result, indent=2))

    except Exception as e:
        log_exception("main", (args,), {}, e)
        sys.exit(1)


if __name__ == "__main__":
    main()
```

## Examples

### Start APOS and Check Status
```bash
/apos-control start
/apos-control status
```

### Execute a Specific Plan
```bash
/apos-control execute --plan /home/craigmbrown/Project/plans/gemini_world_models_integration_plan.json
```

### Approve a HIGH Priority Plan
```bash
# First, get pending approvals from status
/apos-control status

# Then approve via WhatsApp
/apos-control approve --request-id APOS-20251225-gemini_world --channel whatsapp

# And approve via Email
/apos-control approve --request-id APOS-20251225-gemini_world --channel email
```

### Generate Dashboard
```bash
/apos-control dashboard
# Opens: http://34.58.12.50:8080/20251225-apos-status-dashboard.html
```

## Configuration

Configuration is read from:
`/home/craigmbrown/Project/plan_operationalization/config.yaml`

## Requirements Traceability

| Requirement | Description | Status |
|-------------|-------------|--------|
| REQ-APOS-008 | Control Interface | IMPLEMENTED |

## BLP Coverage

| Property | Implementation |
|----------|----------------|
| Alignment | Domain-specific APOS commands |
| Autonomy | Independent command execution |
| Durability | Persistent state management |
| Self-Improvement | Status monitoring and dashboards |
| Self-Replication | Trigger ZTE/DITD execution |
| Self-Organization | Queue management |

---
*REQ-APOS-008: APOS Control Command*
*BLP: [Autonomy] - Command interface for autonomous plan execution*
