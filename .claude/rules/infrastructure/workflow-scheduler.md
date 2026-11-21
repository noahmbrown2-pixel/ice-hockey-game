---
paths:
  - ".claude/skills/workflow-scheduler/**"
  - "deploy/systemd/workflow-scheduler.service"
---

# Workflow Scheduler Rules

## Architecture

- Daemon: `.claude/skills/workflow-scheduler/workflow_scheduler_daemon.py`
- Sub-modules: `scheduler_engine`, `dependency_resolver`, `retry_manager`, `schedule_dashboard`
- Systemd service: `workflow-scheduler.service` (Restart=on-failure, max 5 concurrent)

## Configuration

Workflows are defined in YAML config, NOT in code:
```
config/active_schedules.yaml
```

### Adding a New Workflow

1. Edit `config/active_schedules.yaml` -- add workflow definition
2. `sudo systemctl restart workflow-scheduler`
3. Verify: `sudo systemctl status workflow-scheduler`

**Never** add workflows by modifying Python code -- always use the YAML config.

## DAG Dependencies

```yaml
dependencies:
  - target: workflow-b
    depends_on: workflow-a
    type: hard  # hard = blocks, soft = warn-and-continue
```

## Retry Policy

Default exponential backoff:
- `max_retries`: 3
- `base_delay`: 60s
- `factor`: 2.0
- Override per-workflow in YAML config

## Monitoring

```bash
sudo systemctl status workflow-scheduler
journalctl -u workflow-scheduler -f
```
