---
name: workflow-scheduler
description: Cron-based workflow execution engine with dependency resolution and retries.
category: workflow
subcategory: scheduling
version: 1.0.0
---

# Workflow Scheduler Skill

**Role:** You are the workflow-scheduler engine — you resolve workflow dependencies, execute steps in order, and retry failed steps on a cron cadence. You schedule and run workflows defined in `config/active_schedules.yaml`; you do not author new workflow definitions in code.

**PLAN ID**: PLAN-WKFL-026
**Version**: 1.0.0
**Status**: Production Ready
**Created**: 2025-12-29

## Overview

The Workflow Scheduler is a sophisticated cron-based workflow execution engine that provides:
- **Cron Expression Scheduling** with timezone support
- **Dependency Graph Resolution** for ordered execution
- **Exponential Backoff Retry Logic** with configurable policies
- **Real-time Status Dashboard** with metrics and alerting
- **Systemd Service Integration** for production deployment

## BLP Coverage

| Property | ID | Implementation |
|----------|-----|----------------|
| Autonomy | BLP-011 | Continuous daemon operation |
| Durability | BLP-021 | Persistent state across restarts |
| Error Recovery | BLP-022 | Exponential backoff retry logic |
| State Persistence | BLP-023 | JSON-based state management |
| Graceful Shutdown | BLP-024 | Signal handling and cleanup |
| Self-Improvement | BLP-031 | Failure pattern learning |
| Observability | BLP-032 | HTML dashboard generation |
| Metrics | BLP-033 | Comprehensive performance metrics |
| Alerting | BLP-034 | Alert condition detection |
| Self-Organization | BLP-051 | Dependency-aware scheduling |

## Quick Start

### 1. Install Dependencies

```bash
pip install croniter pytz pyyaml
```

### 2. Start the Daemon

```bash
# Start directly
cd /home/craigmbrown/Project/.claude/skills/workflow-scheduler
python workflow_scheduler_daemon.py start

# Or install as system service
sudo ./scripts/install_service.sh install
```

### 3. View Dashboard

Access the generated dashboard at:
```
http://34.58.12.50:8080/YYYYMMDD-workflow-scheduler-dashboard.html
```

## Components

### 1. Scheduler Engine (`scheduler_engine.py`)

Core cron-based scheduling with timezone support.

```python
from scheduler_engine import CronScheduler

scheduler = CronScheduler()

# Add a schedule
scheduler.add_schedule(
    workflow_id="daily-report",
    workflow_name="Daily Report Generator",
    cron_expression="0 9 * * *",  # 9 AM daily
    timezone="America/New_York",
    enabled=True
)

# Check for due schedules
due = scheduler.get_due_schedules(tolerance_seconds=60)
for schedule in due:
    print(f"Due: {schedule.workflow_name}")
```

**Features**:
- Cron expression validation
- Timezone-aware scheduling (pytz)
- Next/previous run calculation
- Execution history tracking
- Atomic state persistence

### 2. Dependency Resolver (`dependency_resolver.py`)

DAG-based dependency management with topological sorting.

```python
from dependency_resolver import DependencyResolver, Dependency, DependencyType

resolver = DependencyResolver()

# Add workflows with dependencies
resolver.add_workflow(
    workflow_id="dashboard-refresh",
    workflow_name="Dashboard Refresh",
    dependencies=[
        Dependency(
            workflow_id="health-check",
            dependency_type=DependencyType.HARD,
            required=True
        )
    ]
)

# Validate graph (detect cycles)
is_valid, error = resolver.validate_graph()

# Get execution order
order = resolver.resolve_execution_order(["dashboard-refresh", "health-check"])
# Returns: ["health-check", "dashboard-refresh"]

# Get parallel execution groups
groups = resolver.get_parallel_groups(order)
```

**Features**:
- Hard and soft dependencies
- Circular dependency detection (DFS)
- Topological sort (Kahn's algorithm)
- Parallel execution group detection
- Dynamic status tracking

### 3. Retry Manager (`retry_manager.py`)

Configurable retry logic with multiple backoff strategies.

```python
from retry_manager import RetryManager, RetryConfig, RetryPolicy

manager = RetryManager()

# Configure retry behavior
config = RetryConfig(
    max_retries=3,
    base_delay_seconds=60,
    backoff_factor=2.0,
    jitter_range=0.2,  # ±20% jitter
    policy=RetryPolicy.EXPONENTIAL
)

# Execute with automatic retries
success, result, context = manager.execute_with_retry(
    workflow_id="my-workflow",
    workflow_name="My Workflow",
    execute_func=my_function,
    config=config
)
```

**Retry Policies**:
- `EXPONENTIAL`: delay × (factor ^ attempt)
- `LINEAR`: delay × (attempt + 1)
- `CONSTANT`: Fixed delay
- `FIBONACCI`: Fibonacci sequence delays
- `IMMEDIATE`: No delay (transient errors)

**Features**:
- Configurable jitter (prevents thundering herd)
- Exception-based retry decisions
- Comprehensive attempt tracking
- Failure pattern learning (BLP-031)

### 4. Schedule Dashboard (`schedule_dashboard.py`)

Real-time status visualization and metrics.

```python
from schedule_dashboard import ScheduleDashboard

dashboard = ScheduleDashboard(
    scheduler=scheduler,
    dependency_resolver=resolver,
    retry_manager=manager
)

# Get system health
health = dashboard.get_system_health()
print(f"Status: {health.health_status}")
print(f"24h Success Rate: {health.success_rate_24h:.1%}")

# Get active alerts
alerts = dashboard.get_alerts()
for alert in alerts:
    print(f"[{alert['level']}] {alert['message']}")

# Generate HTML report
report_path = dashboard.generate_html_report()
```

**Metrics Provided**:
- Total workflows and active schedules
- Pending and running executions
- 24-hour success rate
- Average execution duration
- Pending retries count
- Failure counts (last hour)

**Alert Types**:
- Circular dependency detection (critical)
- Low success rate (warning)
- Stale executions (warning)
- Pending retry backlog (warning)
- Failure spikes (info)

### 5. Scheduler Daemon (`workflow_scheduler_daemon.py`)

Production daemon for continuous operation.

```bash
# Start daemon
python workflow_scheduler_daemon.py start

# Stop daemon
python workflow_scheduler_daemon.py stop

# Check status
python workflow_scheduler_daemon.py status

# View logs
python workflow_scheduler_daemon.py logs
```

**Features**:
- Signal handling (SIGTERM, SIGINT)
- PID file management
- Concurrent workflow execution (ThreadPoolExecutor)
- Dependency-aware execution ordering
- Retry integration
- Dashboard auto-generation
- WhatsApp notifications

## Configuration

### Schedule Configuration (`config/default_schedules.yaml`)

```yaml
schedules:
  - workflow_id: "daily-intelligence"
    name: "Daily Intelligence Aggregator"
    cron: "0 6 * * *"
    timezone: "America/New_York"
    enabled: true
    priority: high
    dependencies:
      - workflow_id: "system-health-check"
        type: "soft"
        required: false
    retry:
      max_retries: 3
      base_delay_seconds: 300
```

### Daemon Configuration

```python
from workflow_scheduler_daemon import DaemonConfig

config = DaemonConfig(
    poll_interval_seconds=30,
    max_concurrent_workflows=5,
    workflow_timeout_seconds=3600,
    enable_whatsapp=True,
    notification_on_failure=True
)
```

## Service Management

### Install as Systemd Service

```bash
sudo ./scripts/install_service.sh install
```

### Service Commands

```bash
# Start/stop/restart
sudo systemctl start workflow-scheduler
sudo systemctl stop workflow-scheduler
sudo systemctl restart workflow-scheduler

# View status
sudo systemctl status workflow-scheduler

# View logs
sudo journalctl -u workflow-scheduler -f

# Enable auto-start
sudo systemctl enable workflow-scheduler
```

## File Structure

```
workflow-scheduler/
├── SKILL.md                       # This documentation
├── scheduler_engine.py            # Core cron scheduler
├── dependency_resolver.py         # DAG dependency manager
├── retry_manager.py               # Retry logic engine
├── schedule_dashboard.py          # Dashboard generator
├── workflow_scheduler_daemon.py   # Production daemon
├── config/
│   └── default_schedules.yaml     # Schedule definitions
├── data/
│   ├── scheduler_state.json       # Scheduler state
│   ├── dependency_state.json      # Dependency state
│   ├── retry_state.json           # Retry state
│   └── daemon_state.json          # Daemon state
├── logs/
│   └── scheduler_daemon.log       # Daemon logs
├── scripts/
│   └── install_service.sh         # Installation script
├── systemd/
│   └── workflow-scheduler.service # Systemd unit file
└── tests/
    └── test_scheduler.py          # Integration tests
```

## API Reference

### CronScheduler

| Method | Description |
|--------|-------------|
| `add_schedule()` | Add a new scheduled workflow |
| `remove_schedule()` | Remove a schedule |
| `enable_schedule()` | Enable a disabled schedule |
| `disable_schedule()` | Disable a schedule |
| `get_due_schedules()` | Get schedules ready to run |
| `record_execution_start()` | Record execution start |
| `record_execution_complete()` | Record execution result |

### DependencyResolver

| Method | Description |
|--------|-------------|
| `add_workflow()` | Add workflow with dependencies |
| `validate_graph()` | Check for cycles |
| `resolve_execution_order()` | Get topological order |
| `get_parallel_groups()` | Get parallel execution groups |
| `get_ready_workflows()` | Get workflows ready to run |
| `mark_completed()` | Mark workflow as done |
| `mark_failed()` | Mark workflow as failed |

### RetryManager

| Method | Description |
|--------|-------------|
| `create_context()` | Create retry tracking context |
| `start_attempt()` | Begin a retry attempt |
| `complete_attempt()` | Record attempt result |
| `execute_with_retry()` | Execute with automatic retries |
| `get_pending_retries()` | Get workflows pending retry |
| `get_failure_stats()` | Get failure statistics |

### ScheduleDashboard

| Method | Description |
|--------|-------------|
| `get_workflow_summary()` | Get single workflow status |
| `get_all_workflow_summaries()` | Get all workflow statuses |
| `get_system_health()` | Get overall health metrics |
| `get_alerts()` | Get active alerts |
| `generate_html_report()` | Generate HTML dashboard |
| `get_json_report()` | Get JSON status data |

## Troubleshooting

### Common Issues

**1. Daemon won't start**
```bash
# Check for stale PID file
rm /home/craigmbrown/Project/.claude/skills/workflow-scheduler/data/daemon.pid
```

**2. Schedules not executing**
```bash
# Verify cron expressions
python -c "from croniter import croniter; print(croniter('0 6 * * *').get_next())"

# Check logs
tail -f logs/scheduler_daemon.log
```

**3. Dependency deadlock**
```bash
# Validate dependency graph
python -c "from dependency_resolver import DependencyResolver; r=DependencyResolver(); r.load_state(); print(r.validate_graph())"
```

### Debug Mode

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## Performance

- **Poll Overhead**: <100ms per cycle
- **Concurrent Workflows**: Up to 5 (configurable)
- **State Persistence**: Atomic JSON writes
- **Memory Usage**: <100MB typical
- **Dashboard Generation**: <500ms

## Related Skills

- `tb-request-approval-workflow`: TB command processing
- `daily-intelligence`: Daily intelligence aggregation
- `email-to-action`: Email processing workflow

## Changelog

### v1.0.0 (2025-12-29)
- Initial release
- Full DITD lifecycle implementation
- 10/10 BLP coverage
- Production-ready daemon with systemd support
