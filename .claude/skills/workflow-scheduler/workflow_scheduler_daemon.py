#!/usr/bin/env python3
"""
Workflow Scheduler Daemon - Continuous Workflow Execution Service

BLP Coverage:
- BLP-011 (Autonomy): Independent continuous operation
- BLP-021 (Durability): Persistent operation with crash recovery
- BLP-022 (Error Recovery): Handle failures gracefully
- BLP-024 (Graceful Shutdown): Clean shutdown with state preservation

Requirements Traceability:
- REQ-WKFL-026-005: Create scheduler daemon for continuous operation
- REQ-WKFL-026-005a: Polling-based schedule checking
- REQ-WKFL-026-005b: Dependency-aware execution ordering
- REQ-WKFL-026-005c: Retry integration for failed executions
- REQ-WKFL-026-005d: Dashboard updates and notifications

Author: DITD Implementation Agent
Created: 2025-12-29
"""

import json
import os
import signal
import subprocess
import sys
import threading
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any, Callable, Dict, List, Optional, Set, Tuple
import logging

# Add skill directory to path for imports
SKILL_DIR = Path(__file__).parent
sys.path.insert(0, str(SKILL_DIR))

from scheduler_engine import CronScheduler, ScheduleStatus, ScheduleConfig
from dependency_resolver import DependencyResolver, DependencyStatus, DependencyType
from retry_manager import RetryManager, RetryConfig, RetryPolicy, RetryStatus
from schedule_dashboard import ScheduleDashboard, DashboardConfig

# Configure logging
LOG_DIR = SKILL_DIR / "logs"
LOG_DIR.mkdir(parents=True, exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(LOG_DIR / "scheduler_daemon.log")
    ]
)
logger = logging.getLogger(__name__)


@dataclass
class DaemonConfig:
    """
    Configuration for the scheduler daemon.

    BLP-011: Configurable autonomy parameters
    """
    # Polling settings
    poll_interval_seconds: int = 1800  # 30 minutes (was 30s, too noisy)
    tolerance_seconds: int = 60

    # Execution settings
    max_concurrent_workflows: int = 5
    workflow_timeout_seconds: int = 3600  # 1 hour default

    # Dashboard settings
    dashboard_refresh_minutes: int = 5
    enable_dashboard: bool = True

    # Notification settings
    enable_whatsapp: bool = True
    whatsapp_recipient: str = "15712781730"
    notification_on_failure: bool = True
    notification_on_success: bool = False

    # State and recovery
    state_file: str = str(SKILL_DIR / "data" / "daemon_state.json")
    pid_file: str = str(SKILL_DIR / "data" / "daemon.pid")

    # Retry defaults
    default_max_retries: int = 3
    default_base_delay: float = 60.0
    default_backoff_factor: float = 2.0

    # Schedule configuration
    schedules_config_file: str = str(SKILL_DIR / "config" / "active_schedules.yaml")

    def to_dict(self) -> Dict[str, Any]:
        """Convert config to dictionary."""
        return {
            "poll_interval_seconds": self.poll_interval_seconds,
            "tolerance_seconds": self.tolerance_seconds,
            "max_concurrent_workflows": self.max_concurrent_workflows,
            "workflow_timeout_seconds": self.workflow_timeout_seconds,
            "dashboard_refresh_minutes": self.dashboard_refresh_minutes,
            "enable_dashboard": self.enable_dashboard,
            "enable_whatsapp": self.enable_whatsapp,
            "whatsapp_recipient": self.whatsapp_recipient,
            "notification_on_failure": self.notification_on_failure,
            "notification_on_success": self.notification_on_success
        }


@dataclass
class WorkflowExecution:
    """Record of a workflow execution."""
    execution_id: str
    schedule_id: str
    workflow_id: str
    workflow_name: str
    started_at: str
    completed_at: Optional[str] = None
    success: bool = False
    result: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None
    retry_context_id: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            "execution_id": self.execution_id,
            "schedule_id": self.schedule_id,
            "workflow_id": self.workflow_id,
            "workflow_name": self.workflow_name,
            "started_at": self.started_at,
            "completed_at": self.completed_at,
            "success": self.success,
            "result": self.result,
            "error_message": self.error_message,
            "retry_context_id": self.retry_context_id
        }


class WorkflowSchedulerDaemon:
    """
    Daemon process for continuous workflow scheduling and execution.

    BLP-011: Autonomous continuous operation
    BLP-021: Durable operation with persistence
    BLP-022: Integrated error recovery
    BLP-024: Graceful shutdown handling

    Features:
    - Polling-based schedule checking
    - Dependency-aware execution ordering
    - Concurrent workflow execution with limits
    - Retry integration for failures
    - Dashboard generation
    - WhatsApp notifications
    """

    def __init__(self, config: Optional[DaemonConfig] = None):
        """
        Initialize the scheduler daemon.

        Args:
            config: Optional daemon configuration
        """
        self.config = config or DaemonConfig()
        self._running = False
        self._shutdown_event = threading.Event()
        self._lock = threading.RLock()

        # Initialize components
        self.scheduler = CronScheduler()
        self.dependency_resolver = DependencyResolver()
        self.retry_manager = RetryManager(
            default_config=RetryConfig(
                max_retries=self.config.default_max_retries,
                base_delay_seconds=self.config.default_base_delay,
                backoff_factor=self.config.default_backoff_factor
            )
        )
        self.dashboard = ScheduleDashboard(
            scheduler=self.scheduler,
            dependency_resolver=self.dependency_resolver,
            retry_manager=self.retry_manager
        )

        # Thread pool for concurrent execution
        self.executor = ThreadPoolExecutor(
            max_workers=self.config.max_concurrent_workflows,
            thread_name_prefix="workflow_"
        )

        # Track running workflows
        self.running_workflows: Dict[str, WorkflowExecution] = {}
        self.completed_today: List[WorkflowExecution] = []

        # Workflow handlers registry
        self.workflow_handlers: Dict[str, Callable] = {}

        # Set up signal handlers
        signal.signal(signal.SIGTERM, self._handle_signal)
        signal.signal(signal.SIGINT, self._handle_signal)

        # Ensure data directory exists
        Path(self.config.state_file).parent.mkdir(parents=True, exist_ok=True)

        logger.info("WorkflowSchedulerDaemon initialized")

    def _handle_signal(self, signum: int, frame) -> None:
        """
        Handle shutdown signals gracefully.

        BLP-024: Graceful shutdown with state preservation
        """
        signal_name = signal.Signals(signum).name
        logger.info(f"Received {signal_name} signal, initiating graceful shutdown...")
        self.stop()

    def register_workflow_handler(
        self,
        workflow_id: str,
        handler: Callable[[], Dict[str, Any]]
    ) -> None:
        """
        Register a handler function for a workflow.

        Args:
            workflow_id: Workflow identifier
            handler: Function that executes the workflow
        """
        self.workflow_handlers[workflow_id] = handler
        logger.info(f"Registered handler for workflow: {workflow_id}")

    def _execute_workflow(
        self,
        schedule_id: str,
        workflow_id: str,
        workflow_name: str
    ) -> WorkflowExecution:
        """
        Execute a single workflow with retry support.

        BLP-022: Error recovery with retry integration

        Args:
            schedule_id: Schedule identifier
            workflow_id: Workflow identifier
            workflow_name: Workflow name

        Returns:
            WorkflowExecution record
        """
        execution_id = f"exec_{workflow_id}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S_%f')}"

        execution = WorkflowExecution(
            execution_id=execution_id,
            schedule_id=schedule_id,
            workflow_id=workflow_id,
            workflow_name=workflow_name,
            started_at=datetime.utcnow().isoformat()
        )

        logger.info(f"Starting execution: {execution_id} for {workflow_name}")

        # Record execution start in scheduler
        self.scheduler.record_execution_start(schedule_id)

        try:
            # Get workflow handler
            handler = self.workflow_handlers.get(workflow_id)

            if handler:
                # Execute with retry wrapper
                success, result, retry_context = self.retry_manager.execute_with_retry(
                    workflow_id=workflow_id,
                    workflow_name=workflow_name,
                    execute_func=handler
                )

                execution.success = success
                execution.result = result
                execution.retry_context_id = retry_context.context_id

                if not success:
                    execution.error_message = result.get("error_message") if result else "Unknown error"

            else:
                # No handler registered - try skill-based execution
                result = self._execute_skill_workflow(workflow_id)
                execution.success = result.get("success", False)
                execution.result = result
                if not execution.success:
                    execution.error_message = result.get("error_message", "Skill execution failed")

        except Exception as e:
            logger.exception(f"Error executing workflow {workflow_name}")
            execution.success = False
            execution.error_message = str(e)

        execution.completed_at = datetime.utcnow().isoformat()

        # Record execution complete in scheduler
        self.scheduler.record_execution_complete(
            execution_id=schedule_id,  # Using schedule_id as execution tracking
            success=execution.success,
            result=execution.result,
            error_message=execution.error_message
        )

        # Send notification if configured
        if execution.success and self.config.notification_on_success:
            self._send_notification(
                f"✅ Workflow Success: {workflow_name}",
                f"Completed at: {execution.completed_at}"
            )
        elif not execution.success and self.config.notification_on_failure:
            self._send_notification(
                f"❌ Workflow Failed: {workflow_name}",
                f"Error: {execution.error_message}"
            )

        return execution

    def _execute_skill_workflow(self, workflow_id: str) -> Dict[str, Any]:
        """
        Execute a workflow using skill infrastructure.

        Args:
            workflow_id: Workflow identifier (typically skill name)

        Returns:
            Execution result dictionary
        """
        # Try to find and execute a skill
        skill_path = Path(f"/home/craigmbrown/Project/.claude/skills/{workflow_id}/SKILL.md")

        if skill_path.exists():
            try:
                # Execute skill using claude code pattern
                result = subprocess.run(
                    ["claude", "--skill", workflow_id],
                    capture_output=True,
                    text=True,
                    timeout=self.config.workflow_timeout_seconds,
                    cwd="/home/craigmbrown/Project"
                )

                return {
                    "success": result.returncode == 0,
                    "stdout": result.stdout,
                    "stderr": result.stderr,
                    "return_code": result.returncode
                }
            except subprocess.TimeoutExpired:
                return {
                    "success": False,
                    "error_message": f"Workflow timed out after {self.config.workflow_timeout_seconds}s"
                }
            except Exception as e:
                return {
                    "success": False,
                    "error_message": str(e)
                }
        else:
            return {
                "success": False,
                "error_message": f"No handler or skill found for workflow: {workflow_id}"
            }

    def _send_notification(self, title: str, message: str) -> None:
        """
        Send WhatsApp notification.

        Args:
            title: Notification title
            message: Notification message
        """
        if not self.config.enable_whatsapp:
            return

        try:
            full_message = f"""📅 Workflow Scheduler

{title}

{message}

🕐 {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC"""

            # Use WhatsApp sending script
            subprocess.run(
                [
                    "python",
                    "/home/craigmbrown/Project/WhatsApp-Manager-Agent/WhatsApp_Manager_Agent/send_whatsapp_message_working.py",
                    "--to", self.config.whatsapp_recipient,
                    "--message", full_message
                ],
                capture_output=True,
                timeout=30
            )
            logger.info(f"Sent WhatsApp notification: {title}")
        except Exception as e:
            logger.warning(f"Failed to send WhatsApp notification: {e}")

    def _check_dependencies(self, workflow_id: str) -> Tuple[bool, str]:
        """
        Check if workflow dependencies are satisfied.

        Args:
            workflow_id: Workflow to check

        Returns:
            Tuple of (ready, reason)
        """
        node = self.dependency_resolver.workflows.get(workflow_id)
        if not node:
            return True, "No dependencies defined"

        for dep in node.dependencies:
            dep_node = self.dependency_resolver.workflows.get(dep.workflow_id)
            if not dep_node:
                if dep.required:
                    return False, f"Required dependency {dep.workflow_id} not found"
                continue

            if dep.required and dep_node.status != DependencyStatus.COMPLETED:
                return False, f"Required dependency {dep.workflow_id} not completed (status: {dep_node.status.value})"

        return True, "All dependencies satisfied"

    def _poll_and_execute(self) -> None:
        """
        Main polling loop to check and execute due schedules.

        BLP-011: Autonomous operation loop
        """
        logger.debug("Polling for due schedules...")

        # Pre-compute context before checking schedules
        try:
            from precompute_context import precompute_all
            precompute_results = precompute_all()
            fresh_count = sum(1 for v in precompute_results.values() if v.get("status") in ("collected", "cached"))
            logger.debug(f"Pre-computed {fresh_count}/{len(precompute_results)} briefings")
        except ImportError:
            logger.debug("precompute_context not available, skipping pre-compute")
        except Exception as e:
            logger.warning(f"Pre-compute context failed (non-fatal): {e}")

        # Get due schedules
        due_schedules = self.scheduler.get_due_schedules(
            tolerance_seconds=self.config.tolerance_seconds
        )

        if not due_schedules:
            return

        logger.info(f"Found {len(due_schedules)} due schedules")

        # Get workflows in dependency order
        workflow_ids = [s.workflow_id for s in due_schedules]

        try:
            # Resolve execution order based on dependencies
            ordered_workflows = self.dependency_resolver.resolve_execution_order(workflow_ids)
        except Exception as e:
            logger.error(f"Failed to resolve execution order: {e}")
            ordered_workflows = workflow_ids

        # Get parallel groups
        try:
            parallel_groups = self.dependency_resolver.get_parallel_groups(ordered_workflows)
        except Exception:
            # Fallback to sequential if parallel detection fails
            parallel_groups = [[w] for w in ordered_workflows]

        # Execute each group
        for group in parallel_groups:
            if self._shutdown_event.is_set():
                break

            # Filter to only schedules that are actually due
            group_schedules = [
                s for s in due_schedules
                if s.workflow_id in group
            ]

            if not group_schedules:
                continue

            # Check dependencies for each workflow
            ready_schedules = []
            for schedule in group_schedules:
                ready, reason = self._check_dependencies(schedule.workflow_id)
                if ready:
                    ready_schedules.append(schedule)
                else:
                    logger.info(f"Skipping {schedule.workflow_name}: {reason}")

            if not ready_schedules:
                continue

            # Execute group in parallel
            futures = {}
            for schedule in ready_schedules:
                if schedule.schedule_id in self.running_workflows:
                    logger.warning(f"Workflow {schedule.workflow_name} already running, skipping")
                    continue

                future = self.executor.submit(
                    self._execute_workflow,
                    schedule.schedule_id,
                    schedule.workflow_id,
                    schedule.workflow_name
                )
                futures[future] = schedule

            # Wait for group to complete
            for future in as_completed(futures):
                schedule = futures[future]
                try:
                    execution = future.result()
                    self.completed_today.append(execution)

                    # Update dependency status
                    if execution.success:
                        self.dependency_resolver.mark_completed(schedule.workflow_id)
                    else:
                        self.dependency_resolver.mark_failed(
                            schedule.workflow_id,
                            execution.error_message
                        )

                    logger.info(
                        f"Completed {schedule.workflow_name}: "
                        f"{'SUCCESS' if execution.success else 'FAILED'}"
                    )
                except Exception as e:
                    logger.exception(f"Error in workflow execution: {e}")

    def _process_pending_retries(self) -> None:
        """
        Process workflows pending retry.

        BLP-022: Retry processing for error recovery
        """
        pending = self.retry_manager.get_pending_retries()

        for context in pending:
            if self._shutdown_event.is_set():
                break

            logger.info(f"Processing retry for {context.workflow_name}")

            # Start retry attempt
            attempt = self.retry_manager.start_attempt(context.context_id)
            if not attempt:
                continue

            # Wait for delay
            if attempt.delay_applied > 0:
                logger.info(f"Waiting {attempt.delay_applied:.1f}s before retry...")
                time.sleep(min(attempt.delay_applied, 60))  # Cap wait to 60s in daemon

            # Execute retry
            handler = self.workflow_handlers.get(context.workflow_id)
            if handler:
                try:
                    result = handler()
                    success = result.get("success", True)
                    self.retry_manager.complete_attempt(
                        context.context_id,
                        success=success,
                        result=result,
                        error_message=result.get("error_message"),
                        error_type=result.get("error_type")
                    )
                except Exception as e:
                    self.retry_manager.complete_attempt(
                        context.context_id,
                        success=False,
                        error_message=str(e),
                        error_type=type(e).__name__
                    )

    def _generate_dashboard(self) -> None:
        """
        Generate dashboard report.

        BLP-032: Observability through dashboard
        """
        if not self.config.enable_dashboard:
            return

        try:
            report_path = self.dashboard.generate_html_report()
            logger.info(f"Generated dashboard: {report_path}")
        except Exception as e:
            logger.error(f"Failed to generate dashboard: {e}")

    def _save_state(self) -> None:
        """
        Save daemon state for recovery.

        BLP-021: State persistence for durability
        """
        state = {
            "running": self._running,
            "last_poll": datetime.utcnow().isoformat(),
            "running_workflows": {
                k: v.to_dict() for k, v in self.running_workflows.items()
            },
            "completed_today_count": len(self.completed_today),
            "config": self.config.to_dict()
        }

        try:
            state_path = Path(self.config.state_file)
            temp_file = state_path.with_suffix('.tmp')
            with open(temp_file, 'w') as f:
                json.dump(state, f, indent=2)
            temp_file.replace(state_path)
        except Exception as e:
            logger.error(f"Failed to save state: {e}")

    def _write_pid_file(self) -> None:
        """Write PID file for process management."""
        try:
            with open(self.config.pid_file, 'w') as f:
                f.write(str(os.getpid()))
        except Exception as e:
            logger.error(f"Failed to write PID file: {e}")

    def _remove_pid_file(self) -> None:
        """Remove PID file on shutdown."""
        try:
            Path(self.config.pid_file).unlink(missing_ok=True)
        except Exception as e:
            logger.error(f"Failed to remove PID file: {e}")

    def load_schedules_from_config(self) -> int:
        """
        Load schedules from YAML configuration file.

        Returns:
            Number of schedules loaded
        """
        config_path = Path(self.config.schedules_config_file)
        if not config_path.exists():
            logger.warning(f"Schedules config not found: {config_path}")
            return 0

        try:
            import yaml
            with open(config_path) as f:
                config = yaml.safe_load(f)

            loaded = 0
            for schedule_def in config.get("schedules", []):
                # Skip disabled workflows
                if not schedule_def.get("enabled", True):
                    logger.info(f"Skipping disabled workflow: {schedule_def.get('name')}")
                    continue
                try:
                    self.scheduler.add_schedule(
                        workflow_id=schedule_def["workflow_id"],
                        workflow_name=schedule_def["name"],
                        cron_expression=schedule_def["cron"],
                        timezone=schedule_def.get("timezone", "UTC"),
                        description=schedule_def.get("description", ""),
                        metadata=schedule_def.get("metadata", {})
                    )
                    loaded += 1
                except Exception as e:
                    logger.error(f"Failed to load schedule {schedule_def.get('name')}: {e}")

            logger.info(f"Loaded {loaded} schedules from config")
            return loaded

        except Exception as e:
            logger.error(f"Failed to load schedules config: {e}")
            return 0

    def start(self) -> None:
        """
        Start the daemon main loop.

        BLP-011: Begin autonomous operation
        """
        logger.info("Starting Workflow Scheduler Daemon...")

        self._running = True
        self._shutdown_event.clear()
        self._write_pid_file()

        # Load schedules from config
        self.load_schedules_from_config()

        # Track for periodic tasks
        last_dashboard_update = datetime.min
        dashboard_interval = timedelta(minutes=self.config.dashboard_refresh_minutes)

        # Send startup notification
        self._send_notification(
            "🚀 Workflow Scheduler Started",
            f"Poll interval: {self.config.poll_interval_seconds}s\n"
            f"Active schedules: {len(self.scheduler.schedules)}"
        )

        logger.info(
            f"Daemon started with {len(self.scheduler.schedules)} schedules, "
            f"polling every {self.config.poll_interval_seconds}s"
        )

        try:
            while self._running and not self._shutdown_event.is_set():
                cycle_start = datetime.utcnow()

                try:
                    # Main polling
                    self._poll_and_execute()

                    # Process pending retries
                    self._process_pending_retries()

                    # Generate dashboard periodically
                    if datetime.utcnow() - last_dashboard_update > dashboard_interval:
                        self._generate_dashboard()
                        last_dashboard_update = datetime.utcnow()

                    # Save state
                    self._save_state()

                except Exception as e:
                    logger.exception(f"Error in daemon loop: {e}")

                # Calculate sleep time
                cycle_duration = (datetime.utcnow() - cycle_start).total_seconds()
                sleep_time = max(0, self.config.poll_interval_seconds - cycle_duration)

                if sleep_time > 0:
                    self._shutdown_event.wait(timeout=sleep_time)

        except Exception as e:
            logger.exception(f"Fatal error in daemon: {e}")
        finally:
            self._cleanup()

    def stop(self) -> None:
        """
        Stop the daemon gracefully.

        BLP-024: Graceful shutdown
        """
        logger.info("Stopping Workflow Scheduler Daemon...")
        self._running = False
        self._shutdown_event.set()

    def _cleanup(self) -> None:
        """
        Cleanup resources on shutdown.

        BLP-024: Resource cleanup on shutdown
        """
        logger.info("Cleaning up resources...")

        # Wait for running workflows with timeout
        self.executor.shutdown(wait=True, cancel_futures=False)

        # Save final state
        self._save_state()

        # Generate final dashboard
        self._generate_dashboard()

        # Remove PID file
        self._remove_pid_file()

        # Send shutdown notification
        self._send_notification(
            "⏹️ Workflow Scheduler Stopped",
            f"Completed today: {len(self.completed_today)} workflows"
        )

        logger.info("Daemon cleanup complete")

    def status(self) -> Dict[str, Any]:
        """
        Get current daemon status.

        Returns:
            Status dictionary
        """
        return {
            "running": self._running,
            "pid": os.getpid(),
            "schedules": len(self.scheduler.schedules),
            "running_workflows": len(self.running_workflows),
            "completed_today": len(self.completed_today),
            "pending_retries": len(self.retry_manager.get_pending_retries()),
            "health": self.dashboard.get_system_health().to_dict()
        }


# Export main class
__all__ = ["WorkflowSchedulerDaemon", "DaemonConfig"]


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Workflow Scheduler Daemon")
    parser.add_argument("command", choices=["start", "stop", "status", "reload"],
                        help="Daemon command")
    parser.add_argument("--poll-interval", type=int, default=30,
                        help="Poll interval in seconds")
    parser.add_argument("--no-whatsapp", action="store_true",
                        help="Disable WhatsApp notifications")
    parser.add_argument("--no-dashboard", action="store_true",
                        help="Disable dashboard generation")

    args = parser.parse_args()

    pid_file = SKILL_DIR / "data" / "daemon.pid"

    if args.command == "start":
        # Check if already running
        if pid_file.exists():
            try:
                with open(pid_file) as f:
                    pid = int(f.read().strip())
                os.kill(pid, 0)  # Check if process exists
                print(f"Daemon already running with PID {pid}")
                sys.exit(1)
            except (ProcessLookupError, ValueError):
                # PID file stale, remove it
                pid_file.unlink(missing_ok=True)

        config = DaemonConfig(
            poll_interval_seconds=args.poll_interval,
            enable_whatsapp=not args.no_whatsapp,
            enable_dashboard=not args.no_dashboard
        )

        daemon = WorkflowSchedulerDaemon(config)
        daemon.start()

    elif args.command == "stop":
        if pid_file.exists():
            try:
                with open(pid_file) as f:
                    pid = int(f.read().strip())
                os.kill(pid, signal.SIGTERM)
                print(f"Sent SIGTERM to PID {pid}")
            except (ProcessLookupError, ValueError) as e:
                print(f"Error stopping daemon: {e}")
        else:
            print("Daemon not running (no PID file)")

    elif args.command == "status":
        if pid_file.exists():
            try:
                with open(pid_file) as f:
                    pid = int(f.read().strip())
                os.kill(pid, 0)
                print(f"Daemon running with PID {pid}")

                # Load state for details
                state_file = SKILL_DIR / "data" / "daemon_state.json"
                if state_file.exists():
                    with open(state_file) as f:
                        state = json.load(f)
                    print(f"Last poll: {state.get('last_poll', 'unknown')}")
                    print(f"Running workflows: {len(state.get('running_workflows', {}))}")
                    print(f"Completed today: {state.get('completed_today_count', 0)}")
            except ProcessLookupError:
                print("Daemon not running (PID file stale)")
        else:
            print("Daemon not running (no PID file)")

    elif args.command == "reload":
        if pid_file.exists():
            try:
                with open(pid_file) as f:
                    pid = int(f.read().strip())
                os.kill(pid, signal.SIGHUP)
                print(f"Sent SIGHUP to PID {pid}")
            except (ProcessLookupError, ValueError) as e:
                print(f"Error reloading daemon: {e}")
        else:
            print("Daemon not running (no PID file)")
