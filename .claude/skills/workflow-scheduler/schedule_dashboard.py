#!/usr/bin/env python3
"""
Schedule Dashboard - Real-time Workflow Status and Monitoring

BLP Coverage:
- BLP-032 (Observability): Real-time status visibility
- BLP-033 (Metrics): Comprehensive performance metrics
- BLP-034 (Alerting): Status change notifications
- BLP-051 (Self-Organization): Adaptive dashboard views

Requirements Traceability:
- REQ-WKFL-026-004: Enable workflow status dashboard
- REQ-WKFL-026-004a: Real-time schedule status display
- REQ-WKFL-026-004b: Execution history and metrics
- REQ-WKFL-026-004c: Dependency visualization
- REQ-WKFL-026-004d: HTML report generation

Author: DITD Implementation Agent
Created: 2025-12-29
"""

import json
import os
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
import logging

# Local imports
from scheduler_engine import CronScheduler, ScheduleStatus, ScheduleConfig
from dependency_resolver import DependencyResolver, DependencyStatus
from retry_manager import RetryManager, RetryStatus

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@dataclass
class DashboardConfig:
    """Dashboard configuration settings."""
    refresh_interval_seconds: int = 30
    max_history_entries: int = 100
    alert_stale_threshold_minutes: int = 15
    html_output_dir: str = "/home/craigmbrown/Project/html-output"
    enable_notifications: bool = True


@dataclass
class WorkflowSummary:
    """Summary of a single workflow's status."""
    workflow_id: str
    workflow_name: str
    schedule_id: Optional[str] = None
    cron_expression: Optional[str] = None
    timezone: str = "UTC"
    status: str = "unknown"
    last_execution: Optional[str] = None
    next_execution: Optional[str] = None
    success_rate: float = 0.0
    total_executions: int = 0
    avg_duration_seconds: float = 0.0
    dependencies: List[str] = field(default_factory=list)
    dependents: List[str] = field(default_factory=list)
    pending_retries: int = 0
    last_error: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            "workflow_id": self.workflow_id,
            "workflow_name": self.workflow_name,
            "schedule_id": self.schedule_id,
            "cron_expression": self.cron_expression,
            "timezone": self.timezone,
            "status": self.status,
            "last_execution": self.last_execution,
            "next_execution": self.next_execution,
            "success_rate": self.success_rate,
            "total_executions": self.total_executions,
            "avg_duration_seconds": self.avg_duration_seconds,
            "dependencies": self.dependencies,
            "dependents": self.dependents,
            "pending_retries": self.pending_retries,
            "last_error": self.last_error
        }


@dataclass
class SystemHealth:
    """Overall system health metrics."""
    total_workflows: int = 0
    active_schedules: int = 0
    pending_executions: int = 0
    running_executions: int = 0
    failed_last_hour: int = 0
    success_rate_24h: float = 0.0
    avg_latency_seconds: float = 0.0
    pending_retries: int = 0
    circular_dependencies: int = 0
    stale_workflows: int = 0
    last_updated: str = field(default_factory=lambda: datetime.utcnow().isoformat())

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            "total_workflows": self.total_workflows,
            "active_schedules": self.active_schedules,
            "pending_executions": self.pending_executions,
            "running_executions": self.running_executions,
            "failed_last_hour": self.failed_last_hour,
            "success_rate_24h": self.success_rate_24h,
            "avg_latency_seconds": self.avg_latency_seconds,
            "pending_retries": self.pending_retries,
            "circular_dependencies": self.circular_dependencies,
            "stale_workflows": self.stale_workflows,
            "last_updated": self.last_updated
        }

    @property
    def health_status(self) -> str:
        """Determine overall health status."""
        if self.circular_dependencies > 0:
            return "critical"
        if self.failed_last_hour > 5 or self.success_rate_24h < 0.8:
            return "warning"
        if self.pending_retries > 10 or self.stale_workflows > 0:
            return "degraded"
        return "healthy"


class ScheduleDashboard:
    """
    Real-time workflow scheduling dashboard.

    BLP-032: Provides comprehensive observability
    BLP-033: Tracks and displays metrics
    BLP-034: Monitors for alerting conditions
    BLP-051: Organizes data for effective presentation

    Features:
    - Real-time status aggregation
    - HTML report generation
    - Metrics calculation
    - Dependency visualization
    - Alert condition detection
    """

    def __init__(
        self,
        scheduler: Optional[CronScheduler] = None,
        dependency_resolver: Optional[DependencyResolver] = None,
        retry_manager: Optional[RetryManager] = None,
        config: Optional[DashboardConfig] = None
    ):
        """
        Initialize the dashboard.

        Args:
            scheduler: CronScheduler instance
            dependency_resolver: DependencyResolver instance
            retry_manager: RetryManager instance
            config: Dashboard configuration
        """
        self.scheduler = scheduler or CronScheduler()
        self.dependency_resolver = dependency_resolver or DependencyResolver()
        self.retry_manager = retry_manager or RetryManager()
        self.config = config or DashboardConfig()

        # Ensure output directory exists
        Path(self.config.html_output_dir).mkdir(parents=True, exist_ok=True)

        logger.info("ScheduleDashboard initialized")

    def get_workflow_summary(self, workflow_id: str) -> Optional[WorkflowSummary]:
        """
        Get comprehensive summary for a single workflow.

        BLP-032: Aggregate all status information

        Args:
            workflow_id: Workflow identifier

        Returns:
            WorkflowSummary or None if not found
        """
        # Get schedule info
        schedule = None
        for sid, sched in self.scheduler.schedules.items():
            if sched.workflow_id == workflow_id:
                schedule = sched
                break

        # Get dependency info
        dep_node = self.dependency_resolver.nodes.get(workflow_id)

        if not schedule and not dep_node:
            return None

        summary = WorkflowSummary(
            workflow_id=workflow_id,
            workflow_name=schedule.workflow_name if schedule else (
                dep_node.workflow_name if dep_node else workflow_id
            )
        )

        # Add schedule info
        if schedule:
            summary.schedule_id = schedule.schedule_id
            summary.cron_expression = schedule.cron_expression
            summary.timezone = schedule.timezone
            summary.status = schedule.status.value

            if schedule.last_run_time:
                summary.last_execution = schedule.last_run_time

            if schedule.next_run_time:
                summary.next_execution = schedule.next_run_time

            # Calculate success rate from run counts
            summary.total_executions = schedule.run_count
            if schedule.run_count > 0:
                summary.success_rate = schedule.success_count / schedule.run_count

        # Add dependency info
        if dep_node:
            summary.dependencies = list(dep_node.dependencies)
            # Find dependents
            for wid, node in self.dependency_resolver.nodes.items():
                if workflow_id in node.dependencies:
                    summary.dependents.append(wid)

        # Add retry info
        retry_contexts = self.retry_manager.get_contexts_by_workflow(workflow_id)
        summary.pending_retries = sum(
            1 for ctx in retry_contexts
            if ctx.status == RetryStatus.PENDING
        )

        return summary

    def get_all_workflow_summaries(self) -> List[WorkflowSummary]:
        """
        Get summaries for all workflows.

        Returns:
            List of WorkflowSummary instances
        """
        workflow_ids = set()

        # Collect from schedules
        for schedule in self.scheduler.schedules.values():
            workflow_ids.add(schedule.workflow_id)

        # Collect from dependencies
        for workflow_id in self.dependency_resolver.nodes:
            workflow_ids.add(workflow_id)

        summaries = []
        for wid in workflow_ids:
            summary = self.get_workflow_summary(wid)
            if summary:
                summaries.append(summary)

        # Sort by name
        return sorted(summaries, key=lambda s: s.workflow_name)

    def get_system_health(self) -> SystemHealth:
        """
        Calculate overall system health metrics.

        BLP-033: Comprehensive metrics aggregation

        Returns:
            SystemHealth instance
        """
        health = SystemHealth()

        summaries = self.get_all_workflow_summaries()
        health.total_workflows = len(summaries)

        # Count schedule statuses
        for summary in summaries:
            if summary.status == ScheduleStatus.ACTIVE.value:
                health.active_schedules += 1
            elif summary.status == ScheduleStatus.RUNNING.value:
                health.running_executions += 1

        # Get pending executions
        health.pending_executions = len(self.scheduler.get_due_schedules())

        # Check for failures in last hour using execution history
        one_hour_ago = datetime.utcnow() - timedelta(hours=1)
        executions = self.scheduler.get_execution_history(limit=1000)
        for execution in executions:
            if execution.completed_at:
                completed = datetime.fromisoformat(execution.completed_at)
                if completed > one_hour_ago and execution.status == "failed":
                    health.failed_last_hour += 1

        # Calculate 24h success rate
        twenty_four_hours_ago = datetime.utcnow() - timedelta(hours=24)
        total_24h = 0
        success_24h = 0
        total_latency = 0.0

        for execution in executions:
            if execution.completed_at:
                completed = datetime.fromisoformat(execution.completed_at)
                if completed > twenty_four_hours_ago:
                    total_24h += 1
                    if execution.status == "success":
                        success_24h += 1
                    if execution.duration_seconds:
                        total_latency += execution.duration_seconds

        if total_24h > 0:
            health.success_rate_24h = success_24h / total_24h
            health.avg_latency_seconds = total_latency / total_24h

        # Count pending retries
        health.pending_retries = len(self.retry_manager.get_pending_retries())

        # Check for circular dependencies
        if self.dependency_resolver.check_circular_dependencies():
            health.circular_dependencies = 1  # At least one cycle detected

        # Check for stale workflows
        stale_threshold = datetime.utcnow() - timedelta(
            minutes=self.config.alert_stale_threshold_minutes
        )
        for schedule in self.scheduler.schedules.values():
            if schedule.status == ScheduleStatus.RUNNING:
                if schedule.last_run_time:
                    last_run = datetime.fromisoformat(schedule.last_run_time)
                    if last_run < stale_threshold:
                        health.stale_workflows += 1

        health.last_updated = datetime.utcnow().isoformat()

        return health

    def get_execution_timeline(
        self,
        hours: int = 24,
        workflow_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Get execution timeline for visualization.

        Args:
            hours: Number of hours to include
            workflow_id: Optional filter by workflow

        Returns:
            List of execution events
        """
        cutoff = datetime.utcnow() - timedelta(hours=hours)
        events = []

        # Get execution history from scheduler
        executions = self.scheduler.get_execution_history(limit=1000)

        for execution in executions:
            if workflow_id and execution.workflow_id != workflow_id:
                continue

            if execution.started_at:
                started = datetime.fromisoformat(execution.started_at)
                if started > cutoff:
                    # Get schedule for workflow name
                    schedule = self.scheduler.schedules.get(execution.schedule_id)
                    events.append({
                        "workflow_id": execution.workflow_id,
                        "workflow_name": schedule.workflow_name if schedule else execution.workflow_id,
                        "execution_id": execution.execution_id,
                        "started_at": execution.started_at,
                        "completed_at": execution.completed_at,
                        "success": execution.status == "success",
                        "error_message": execution.error_message
                    })

        # Sort by start time
        return sorted(events, key=lambda e: e["started_at"], reverse=True)

    def get_dependency_graph_data(self) -> Dict[str, Any]:
        """
        Get data for dependency graph visualization.

        Returns:
            Dictionary with nodes and edges for graph rendering
        """
        nodes = []
        edges = []

        for workflow_id, node in self.dependency_resolver.nodes.items():
            summary = self.get_workflow_summary(workflow_id)

            nodes.append({
                "id": workflow_id,
                "label": node.workflow_name,
                "status": node.execution_status or "unknown",
                "execution_count": summary.total_executions if summary else 0,
                "success_rate": summary.success_rate if summary else 0
            })

            for dep_id in node.dependencies:
                edges.append({
                    "from": dep_id,
                    "to": workflow_id,
                    "type": "dependency",
                    "required": True
                })

        return {"nodes": nodes, "edges": edges}

    def get_alerts(self) -> List[Dict[str, Any]]:
        """
        Get current alert conditions.

        BLP-034: Detect and report alerting conditions

        Returns:
            List of active alerts
        """
        alerts = []
        health = self.get_system_health()

        # Critical: Circular dependencies
        if health.circular_dependencies > 0:
            alerts.append({
                "level": "critical",
                "type": "circular_dependency",
                "message": "Circular dependency detected in workflow graph",
                "timestamp": datetime.utcnow().isoformat()
            })

        # Warning: High failure rate
        if health.success_rate_24h < 0.8 and health.total_workflows > 0:
            alerts.append({
                "level": "warning",
                "type": "low_success_rate",
                "message": f"24h success rate is {health.success_rate_24h:.1%}",
                "timestamp": datetime.utcnow().isoformat()
            })

        # Warning: Many pending retries
        if health.pending_retries > 10:
            alerts.append({
                "level": "warning",
                "type": "pending_retries",
                "message": f"{health.pending_retries} workflows pending retry",
                "timestamp": datetime.utcnow().isoformat()
            })

        # Warning: Stale executions
        if health.stale_workflows > 0:
            alerts.append({
                "level": "warning",
                "type": "stale_execution",
                "message": f"{health.stale_workflows} workflow(s) appear stale",
                "timestamp": datetime.utcnow().isoformat()
            })

        # Info: High failure count
        if health.failed_last_hour > 5:
            alerts.append({
                "level": "info",
                "type": "failure_spike",
                "message": f"{health.failed_last_hour} failures in the last hour",
                "timestamp": datetime.utcnow().isoformat()
            })

        return alerts

    def generate_html_report(
        self,
        filename: Optional[str] = None
    ) -> str:
        """
        Generate comprehensive HTML dashboard report.

        BLP-032: Create visual observability output

        Args:
            filename: Optional custom filename

        Returns:
            Path to generated HTML file
        """
        if not filename:
            filename = f"{datetime.utcnow().strftime('%Y%m%d')}-workflow-scheduler-dashboard.html"

        filepath = Path(self.config.html_output_dir) / filename

        # Gather all data
        health = self.get_system_health()
        summaries = self.get_all_workflow_summaries()
        timeline = self.get_execution_timeline(hours=24)
        alerts = self.get_alerts()
        graph_data = self.get_dependency_graph_data()
        retry_stats = self.retry_manager.get_failure_stats()

        # Generate HTML
        html = self._generate_html_content(
            health=health,
            summaries=summaries,
            timeline=timeline,
            alerts=alerts,
            graph_data=graph_data,
            retry_stats=retry_stats
        )

        # Write file
        with open(filepath, 'w') as f:
            f.write(html)

        logger.info(f"Generated dashboard report: {filepath}")
        return str(filepath)

    def _generate_html_content(
        self,
        health: SystemHealth,
        summaries: List[WorkflowSummary],
        timeline: List[Dict[str, Any]],
        alerts: List[Dict[str, Any]],
        graph_data: Dict[str, Any],
        retry_stats: Dict[str, Any]
    ) -> str:
        """Generate the HTML content for the dashboard."""

        # Status color mapping
        def get_status_class(status: str) -> str:
            if status in ("success", "healthy", "active"):
                return "success"
            elif status in ("failed", "critical", "exhausted"):
                return "error"
            elif status in ("warning", "degraded", "pending"):
                return "warning"
            else:
                return ""

        # Alert rows
        alert_rows = ""
        for alert in alerts:
            alert_rows += f"""
            <tr class="{alert['level']}">
                <td><span class="{alert['level']}">{alert['level'].upper()}</span></td>
                <td>{alert['type']}</td>
                <td>{alert['message']}</td>
                <td>{alert['timestamp'][:19]}</td>
            </tr>
            """

        if not alerts:
            alert_rows = """
            <tr>
                <td colspan="4" style="text-align: center; color: #4caf50;">
                    ✅ No active alerts
                </td>
            </tr>
            """

        # Workflow rows
        workflow_rows = ""
        for summary in summaries:
            deps_str = ", ".join(summary.dependencies) if summary.dependencies else "None"
            workflow_rows += f"""
            <tr>
                <td><strong>{summary.workflow_name}</strong><br>
                    <small style="color: #808080;">{summary.workflow_id}</small></td>
                <td><span class="{get_status_class(summary.status)}">{summary.status}</span></td>
                <td><code>{summary.cron_expression or 'N/A'}</code></td>
                <td>{summary.timezone}</td>
                <td>{summary.last_execution[:19] if summary.last_execution else 'Never'}</td>
                <td>{summary.next_execution[:19] if summary.next_execution else 'N/A'}</td>
                <td>{summary.success_rate:.1%}</td>
                <td>{summary.total_executions}</td>
                <td>{deps_str}</td>
            </tr>
            """

        if not summaries:
            workflow_rows = """
            <tr>
                <td colspan="9" style="text-align: center; color: #808080;">
                    No workflows configured
                </td>
            </tr>
            """

        # Timeline rows
        timeline_rows = ""
        for event in timeline[:50]:  # Limit to 50 entries
            success_class = "success" if event.get("success") else "error"
            duration = ""
            if event.get("started_at") and event.get("completed_at"):
                start = datetime.fromisoformat(event["started_at"])
                end = datetime.fromisoformat(event["completed_at"])
                duration = f"{(end - start).total_seconds():.1f}s"

            timeline_rows += f"""
            <tr>
                <td>{event['workflow_name']}</td>
                <td>{event['started_at'][:19]}</td>
                <td>{event.get('completed_at', 'Running')[:19] if event.get('completed_at') else 'Running'}</td>
                <td>{duration or 'N/A'}</td>
                <td><span class="{success_class}">{'SUCCESS' if event.get('success') else 'FAILED'}</span></td>
                <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis;">
                    {event.get('error_message', '') or ''}
                </td>
            </tr>
            """

        if not timeline:
            timeline_rows = """
            <tr>
                <td colspan="6" style="text-align: center; color: #808080;">
                    No recent executions
                </td>
            </tr>
            """

        # Health status display
        health_class = get_status_class(health.health_status)

        html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Workflow Scheduler Dashboard</title>
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            line-height: 1.6;
            color: #e0e0e0;
            background: #1a1a1a;
            margin: 0;
            padding: 20px;
        }}
        article {{
            max-width: 1400px;
            margin: 0 auto;
            background: #2d2d2d;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.5);
        }}
        h1, h2, h3 {{
            color: #e0e0e0;
        }}
        h1 {{
            border-bottom: 3px solid #4a9eff;
            padding-bottom: 15px;
        }}
        h2 {{
            border-left: 4px solid #4a9eff;
            padding-left: 10px;
            margin-top: 30px;
        }}
        code {{
            background: #0d1117;
            color: #79c0ff;
            padding: 2px 6px;
            border-radius: 3px;
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }}
        th {{
            background: #1a1a1a;
            color: #e0e0e0;
            padding: 12px;
            text-align: left;
            border: 1px solid #404040;
        }}
        td {{
            padding: 10px;
            border: 1px solid #404040;
        }}
        tr:nth-child(even) {{
            background: #1a1a1a;
        }}
        tr:hover {{
            background: #3a3a3a;
        }}
        .success {{
            background: #1b5e20;
            color: #4caf50;
            padding: 3px 8px;
            border-radius: 3px;
        }}
        .error {{
            background: #330000;
            color: #f44336;
            padding: 3px 8px;
            border-radius: 3px;
        }}
        .warning {{
            background: #332200;
            color: #ff9800;
            padding: 3px 8px;
            border-radius: 3px;
        }}
        .info {{
            background: #1e3a5f;
            color: #4a9eff;
            padding: 3px 8px;
            border-radius: 3px;
        }}
        .critical {{
            background: #4a0000;
            color: #ff5252;
            padding: 3px 8px;
            border-radius: 3px;
        }}
        .metric-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }}
        .metric-card {{
            background: #1a1a1a;
            border: 1px solid #404040;
            padding: 20px;
            border-radius: 8px;
            transition: all 0.3s;
        }}
        .metric-card:hover {{
            background: #3a3a3a;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.5);
        }}
        .metric-value {{
            font-size: 2.5em;
            font-weight: bold;
            color: #4a9eff;
        }}
        .metric-label {{
            color: #808080;
            font-size: 0.9em;
        }}
        .health-badge {{
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-weight: bold;
            text-transform: uppercase;
        }}
        .health-badge.healthy {{
            background: #1b5e20;
            color: #4caf50;
        }}
        .health-badge.degraded {{
            background: #332200;
            color: #ff9800;
        }}
        .health-badge.warning {{
            background: #332200;
            color: #ff9800;
        }}
        .health-badge.critical {{
            background: #4a0000;
            color: #ff5252;
        }}
        .section {{
            margin-bottom: 30px;
        }}
        footer {{
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #404040;
            color: #808080;
            font-size: 0.9em;
        }}
        a {{
            color: #4a9eff;
            text-decoration: none;
        }}
        a:hover {{
            color: #79c0ff;
            text-decoration: underline;
        }}
    </style>
</head>
<body>
    <article>
        <header>
            <h1>📅 Workflow Scheduler Dashboard</h1>
            <p>Real-time status and monitoring for scheduled workflows</p>
            <p><strong>Last Updated:</strong> {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC
               &nbsp;|&nbsp;
               <strong>System Status:</strong>
               <span class="health-badge {health_class}">{health.health_status}</span>
            </p>
        </header>

        <main>
            <section class="section">
                <h2>📊 System Health Metrics</h2>
                <div class="metric-grid">
                    <div class="metric-card">
                        <div class="metric-value">{health.total_workflows}</div>
                        <div class="metric-label">Total Workflows</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">{health.active_schedules}</div>
                        <div class="metric-label">Active Schedules</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">{health.pending_executions}</div>
                        <div class="metric-label">Pending Executions</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">{health.running_executions}</div>
                        <div class="metric-label">Running Now</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">{health.success_rate_24h:.1%}</div>
                        <div class="metric-label">24h Success Rate</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">{health.avg_latency_seconds:.1f}s</div>
                        <div class="metric-label">Avg Duration</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">{health.pending_retries}</div>
                        <div class="metric-label">Pending Retries</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">{health.failed_last_hour}</div>
                        <div class="metric-label">Failures (1h)</div>
                    </div>
                </div>
            </section>

            <section class="section">
                <h2>⚠️ Active Alerts</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Level</th>
                            <th>Type</th>
                            <th>Message</th>
                            <th>Timestamp</th>
                        </tr>
                    </thead>
                    <tbody>
                        {alert_rows}
                    </tbody>
                </table>
            </section>

            <section class="section">
                <h2>📋 Scheduled Workflows</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Workflow</th>
                            <th>Status</th>
                            <th>Schedule</th>
                            <th>Timezone</th>
                            <th>Last Run</th>
                            <th>Next Run</th>
                            <th>Success Rate</th>
                            <th>Executions</th>
                            <th>Dependencies</th>
                        </tr>
                    </thead>
                    <tbody>
                        {workflow_rows}
                    </tbody>
                </table>
            </section>

            <section class="section">
                <h2>📜 Execution Timeline (24h)</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Workflow</th>
                            <th>Started</th>
                            <th>Completed</th>
                            <th>Duration</th>
                            <th>Result</th>
                            <th>Error</th>
                        </tr>
                    </thead>
                    <tbody>
                        {timeline_rows}
                    </tbody>
                </table>
            </section>

            <section class="section">
                <h2>🔄 Retry Statistics</h2>
                <div class="metric-grid">
                    <div class="metric-card">
                        <div class="metric-value">{retry_stats.get('total_contexts', 0)}</div>
                        <div class="metric-label">Total Retry Contexts</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">{retry_stats.get('active_contexts', 0)}</div>
                        <div class="metric-label">Active Contexts</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">{retry_stats.get('total_attempts', 0)}</div>
                        <div class="metric-label">Total Attempts</div>
                    </div>
                    <div class="metric-card">
                        <div class="metric-value">{retry_stats.get('first_try_success_rate', 0):.1%}</div>
                        <div class="metric-label">First-Try Success Rate</div>
                    </div>
                </div>
            </section>

            <section class="section">
                <h2>🔗 Dependency Graph</h2>
                <p><strong>Nodes:</strong> {len(graph_data.get('nodes', []))}</p>
                <p><strong>Edges:</strong> {len(graph_data.get('edges', []))}</p>
                {f'<p class="critical">⚠️ Circular dependency detected!</p>' if health.circular_dependencies > 0 else '<p class="success">✅ No circular dependencies</p>'}
            </section>
        </main>

        <footer>
            <p>🤖 Generated by Workflow Scheduler Dashboard | PLAN-WKFL-026</p>
            <p>BLP Coverage: BLP-032 (Observability), BLP-033 (Metrics), BLP-034 (Alerting), BLP-051 (Self-Organization)</p>
        </footer>
    </article>
</body>
</html>
"""
        return html

    def get_json_report(self) -> Dict[str, Any]:
        """
        Generate JSON report of all dashboard data.

        Returns:
            Dictionary with all dashboard data
        """
        health = self.get_system_health()
        summaries = self.get_all_workflow_summaries()

        return {
            "generated_at": datetime.utcnow().isoformat(),
            "health": health.to_dict(),
            "workflows": [s.to_dict() for s in summaries],
            "alerts": self.get_alerts(),
            "timeline": self.get_execution_timeline(hours=24),
            "dependency_graph": self.get_dependency_graph_data(),
            "retry_stats": self.retry_manager.get_failure_stats()
        }


# Export main classes
__all__ = [
    "ScheduleDashboard",
    "DashboardConfig",
    "WorkflowSummary",
    "SystemHealth"
]


if __name__ == "__main__":
    # Demo mode
    print("Schedule Dashboard Demo")
    print("=" * 50)

    dashboard = ScheduleDashboard()

    # Get health status
    health = dashboard.get_system_health()
    print(f"\nSystem Health: {health.health_status}")
    print(f"Total Workflows: {health.total_workflows}")
    print(f"Active Schedules: {health.active_schedules}")
    print(f"24h Success Rate: {health.success_rate_24h:.1%}")

    # Check alerts
    alerts = dashboard.get_alerts()
    print(f"\nActive Alerts: {len(alerts)}")
    for alert in alerts:
        print(f"  [{alert['level']}] {alert['message']}")

    # Generate HTML report
    report_path = dashboard.generate_html_report()
    print(f"\nHTML Report: {report_path}")
