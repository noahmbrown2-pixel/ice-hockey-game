#!/usr/bin/env python3
"""
Scheduled Workflow Engine - Core Scheduler
PLAN-ID: PLAN-WKFL-026

REQ-WKFL-026-001: Cron-based workflow scheduling with timezone support
REQ-WKFL-026-002: Persistent schedule storage with atomic writes

BLP Properties:
- BLP-021: Durable continuous schedule checking without degradation
- BLP-022: Long-lasting schedule persistence across restarts
- BLP-026: Reliable workflow execution guarantees
- BLP-027: Persistent workflow schedule state management

Author: Craig Brown
Created: 2025-12-29
"""

import os
import sys
import json
import logging
import threading
import tempfile
import shutil
from pathlib import Path
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Set, Callable
from dataclasses import dataclass, field, asdict
from enum import Enum
import uuid

# REQ-WKFL-026-001: Timezone support
try:
    import pytz
    PYTZ_AVAILABLE = True
except ImportError:
    PYTZ_AVAILABLE = False
    import warnings
    warnings.warn("pytz not installed. Timezone support limited to UTC.")

# REQ-WKFL-026-001: Cron expression parsing
try:
    from croniter import croniter
    CRONITER_AVAILABLE = True
except ImportError:
    CRONITER_AVAILABLE = False
    import warnings
    warnings.warn("croniter not installed. Will use simplified schedule parsing.")

# Configure logging
LOG_DIR = Path("/home/craigmbrown/Project/logs")
LOG_DIR.mkdir(parents=True, exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s: %(message)s',
    handlers=[
        logging.FileHandler(LOG_DIR / "workflow_scheduler.log"),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger("workflow-scheduler")


class ScheduleStatus(Enum):
    """REQ-WKFL-026-002: Schedule execution states"""
    ACTIVE = "active"
    PAUSED = "paused"
    DISABLED = "disabled"
    RUNNING = "running"
    FAILED = "failed"
    COMPLETED = "completed"


@dataclass
class ScheduleConfig:
    """
    REQ-WKFL-026-001: Cron schedule configuration with timezone support

    BLP-021: Durable schedule configuration
    """
    schedule_id: str
    workflow_id: str
    workflow_name: str
    cron_expression: str
    timezone: str = "UTC"
    enabled: bool = True
    description: str = ""
    dependencies: List[str] = field(default_factory=list)
    retry_config: Dict[str, Any] = field(default_factory=lambda: {
        "max_retries": 3,
        "base_delay": 60,
        "max_delay": 3600,
        "backoff_factor": 2
    })
    metadata: Dict[str, Any] = field(default_factory=dict)
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())
    updated_at: str = field(default_factory=lambda: datetime.now().isoformat())
    last_run_time: Optional[str] = None
    next_run_time: Optional[str] = None
    run_count: int = 0
    success_count: int = 0
    failure_count: int = 0
    status: ScheduleStatus = ScheduleStatus.ACTIVE

    def to_dict(self) -> Dict:
        """Convert to dictionary for serialization"""
        data = asdict(self)
        data['status'] = self.status.value
        return data

    @classmethod
    def from_dict(cls, data: Dict) -> 'ScheduleConfig':
        """Create from dictionary"""
        if 'status' in data and isinstance(data['status'], str):
            data['status'] = ScheduleStatus(data['status'])
        return cls(**data)


@dataclass
class ScheduleExecution:
    """
    REQ-WKFL-026-002: Schedule execution record

    BLP-027: Persistent execution state
    """
    execution_id: str
    schedule_id: str
    workflow_id: str
    started_at: str
    completed_at: Optional[str] = None
    status: str = "running"
    result: Optional[Dict] = None
    error_message: Optional[str] = None
    duration_seconds: Optional[float] = None
    retry_attempt: int = 0


class CronScheduler:
    """
    REQ-WKFL-026-001: Core cron scheduling engine with timezone support

    BLP Properties:
    - BLP-021: Durable continuous schedule checking
    - BLP-022: Long-lasting schedule persistence
    - BLP-024: Consistent performance handling 100+ schedules
    """

    def __init__(self, state_dir: Optional[Path] = None):
        """
        Initialize the cron scheduler.

        Args:
            state_dir: Directory for persistent state storage
        """
        self.state_dir = state_dir or Path("/home/craigmbrown/Project/.claude/skills/workflow-scheduler/state")
        self.state_dir.mkdir(parents=True, exist_ok=True)

        self.registry_file = self.state_dir / "schedule_registry.json"
        self.executions_file = self.state_dir / "schedule_executions.json"

        # In-memory schedule cache
        self.schedules: Dict[str, ScheduleConfig] = {}
        self.executions: List[ScheduleExecution] = []

        # Thread safety
        self._lock = threading.RLock()

        # Execution callbacks
        self.execution_callback: Optional[Callable] = None

        # Load existing state
        self._load_state()

        logger.info(f"CronScheduler initialized with {len(self.schedules)} schedules")

    def _load_state(self):
        """REQ-WKFL-026-002: Load persistent state from disk"""
        try:
            if self.registry_file.exists():
                data = json.loads(self.registry_file.read_text())
                for schedule_id, schedule_data in data.get("schedules", {}).items():
                    try:
                        self.schedules[schedule_id] = ScheduleConfig.from_dict(schedule_data)
                    except Exception as e:
                        logger.warning(f"Failed to load schedule {schedule_id}: {e}")
                logger.info(f"Loaded {len(self.schedules)} schedules from registry")

            if self.executions_file.exists():
                data = json.loads(self.executions_file.read_text())
                for exec_data in data.get("executions", [])[-1000:]:  # Keep last 1000
                    try:
                        self.executions.append(ScheduleExecution(**exec_data))
                    except Exception as e:
                        logger.warning(f"Failed to load execution: {e}")
                logger.info(f"Loaded {len(self.executions)} execution records")

        except Exception as e:
            logger.error(f"Failed to load scheduler state: {e}")

    def _save_state(self):
        """
        REQ-WKFL-026-002: Save state with atomic writes

        BLP-022: Durable state persistence
        """
        with self._lock:
            try:
                # Save schedules registry
                registry_data = {
                    "schedules": {
                        sid: s.to_dict() for sid, s in self.schedules.items()
                    },
                    "updated_at": datetime.now().isoformat(),
                    "version": "1.0.0"
                }
                self._atomic_write(self.registry_file, registry_data)

                # Save executions (keep last 1000)
                executions_data = {
                    "executions": [asdict(e) for e in self.executions[-1000:]],
                    "updated_at": datetime.now().isoformat()
                }
                self._atomic_write(self.executions_file, executions_data)

                logger.debug("Scheduler state saved successfully")

            except Exception as e:
                logger.error(f"Failed to save scheduler state: {e}")
                raise

    def _atomic_write(self, filepath: Path, data: Dict):
        """
        REQ-WKFL-026-002: Atomic file write to prevent corruption

        BLP-022: Safe state persistence
        """
        # Write to temp file first
        fd, temp_path = tempfile.mkstemp(dir=self.state_dir)
        try:
            with os.fdopen(fd, 'w') as f:
                json.dump(data, f, indent=2, default=str)

            # Atomic rename
            shutil.move(temp_path, filepath)
        except Exception:
            # Clean up temp file on failure
            if os.path.exists(temp_path):
                os.unlink(temp_path)
            raise

    def validate_cron_expression(self, cron_expr: str) -> bool:
        """
        REQ-WKFL-026-001: Validate cron expression syntax

        Args:
            cron_expr: Cron expression string (e.g., "0 * * * *")

        Returns:
            True if valid, False otherwise
        """
        if not CRONITER_AVAILABLE:
            # Basic validation without croniter
            parts = cron_expr.split()
            if len(parts) != 5:
                return False
            return True

        try:
            croniter(cron_expr)
            return True
        except (ValueError, KeyError):
            return False

    def validate_timezone(self, tz: str) -> bool:
        """
        REQ-WKFL-026-001: Validate timezone name

        Args:
            tz: Timezone name (e.g., "America/New_York")

        Returns:
            True if valid, False otherwise
        """
        if not PYTZ_AVAILABLE:
            return tz.upper() == "UTC"

        try:
            pytz.timezone(tz)
            return True
        except pytz.exceptions.UnknownTimeZoneError:
            return False

    def add_schedule(
        self,
        workflow_id: str,
        workflow_name: str,
        cron_expression: str,
        timezone: str = "UTC",
        dependencies: Optional[List[str]] = None,
        retry_config: Optional[Dict] = None,
        description: str = "",
        metadata: Optional[Dict] = None
    ) -> str:
        """
        REQ-WKFL-026-001: Add a new workflow schedule

        BLP-021: Durable schedule registration

        Args:
            workflow_id: Unique workflow identifier
            workflow_name: Human-readable workflow name
            cron_expression: Cron schedule expression
            timezone: Timezone for schedule (default UTC)
            dependencies: List of dependent schedule IDs
            retry_config: Retry configuration
            description: Schedule description
            metadata: Additional metadata

        Returns:
            schedule_id: Unique schedule identifier
        """
        with self._lock:
            # Validate cron expression
            if not self.validate_cron_expression(cron_expression):
                raise ValueError(f"Invalid cron expression: {cron_expression}")

            # Validate timezone
            if not self.validate_timezone(timezone):
                logger.warning(f"Invalid timezone '{timezone}', defaulting to UTC")
                timezone = "UTC"

            # Generate schedule ID
            schedule_id = f"schedule_{uuid.uuid4().hex[:12]}"

            # Create schedule config
            schedule = ScheduleConfig(
                schedule_id=schedule_id,
                workflow_id=workflow_id,
                workflow_name=workflow_name,
                cron_expression=cron_expression,
                timezone=timezone,
                dependencies=dependencies or [],
                retry_config=retry_config or {
                    "max_retries": 3,
                    "base_delay": 60,
                    "max_delay": 3600,
                    "backoff_factor": 2
                },
                description=description,
                metadata=metadata or {}
            )

            # Calculate next run time
            schedule.next_run_time = self._calculate_next_run(cron_expression, timezone)

            # Store schedule
            self.schedules[schedule_id] = schedule
            self._save_state()

            logger.info(f"Added schedule {schedule_id} for workflow {workflow_name} ({cron_expression})")
            return schedule_id

    def remove_schedule(self, schedule_id: str) -> bool:
        """
        REQ-WKFL-026-001: Remove a workflow schedule

        Args:
            schedule_id: Schedule identifier to remove

        Returns:
            True if removed, False if not found
        """
        with self._lock:
            if schedule_id in self.schedules:
                del self.schedules[schedule_id]
                self._save_state()
                logger.info(f"Removed schedule {schedule_id}")
                return True
            return False

    def update_schedule(self, schedule_id: str, **updates) -> bool:
        """
        REQ-WKFL-026-001: Update schedule configuration

        Args:
            schedule_id: Schedule to update
            **updates: Fields to update

        Returns:
            True if updated, False if not found
        """
        with self._lock:
            if schedule_id not in self.schedules:
                return False

            schedule = self.schedules[schedule_id]

            # Apply updates
            for key, value in updates.items():
                if hasattr(schedule, key):
                    if key == 'cron_expression' and not self.validate_cron_expression(value):
                        raise ValueError(f"Invalid cron expression: {value}")
                    if key == 'timezone' and not self.validate_timezone(value):
                        raise ValueError(f"Invalid timezone: {value}")
                    setattr(schedule, key, value)

            # Recalculate next run time if schedule changed
            if 'cron_expression' in updates or 'timezone' in updates:
                schedule.next_run_time = self._calculate_next_run(
                    schedule.cron_expression,
                    schedule.timezone
                )

            schedule.updated_at = datetime.now().isoformat()
            self._save_state()

            logger.info(f"Updated schedule {schedule_id}")
            return True

    def get_schedule(self, schedule_id: str) -> Optional[ScheduleConfig]:
        """Get schedule by ID"""
        return self.schedules.get(schedule_id)

    def list_schedules(
        self,
        status: Optional[ScheduleStatus] = None,
        workflow_id: Optional[str] = None
    ) -> List[ScheduleConfig]:
        """
        List all schedules with optional filtering

        Args:
            status: Filter by schedule status
            workflow_id: Filter by workflow ID

        Returns:
            List of matching schedules
        """
        schedules = list(self.schedules.values())

        if status:
            schedules = [s for s in schedules if s.status == status]

        if workflow_id:
            schedules = [s for s in schedules if s.workflow_id == workflow_id]

        return schedules

    def _calculate_next_run(
        self,
        cron_expression: str,
        timezone: str,
        base_time: Optional[datetime] = None
    ) -> str:
        """
        REQ-WKFL-026-001: Calculate next run time with timezone support

        BLP-024: Consistent time calculation
        """
        if not base_time:
            base_time = datetime.now()

        if CRONITER_AVAILABLE and PYTZ_AVAILABLE:
            try:
                tz = pytz.timezone(timezone)
                local_time = base_time.astimezone(tz) if base_time.tzinfo else tz.localize(base_time)

                cron = croniter(cron_expression, local_time)
                next_time = cron.get_next(datetime)

                # Convert back to UTC for storage
                return next_time.astimezone(pytz.UTC).isoformat()
            except Exception as e:
                logger.error(f"Error calculating next run time: {e}")

        # Fallback: simple minute-based calculation
        return (base_time + timedelta(minutes=1)).isoformat()

    def get_next_run_time(self, schedule_id: str) -> Optional[str]:
        """Get next scheduled run time for a schedule"""
        schedule = self.schedules.get(schedule_id)
        if schedule:
            return schedule.next_run_time
        return None

    def is_due_now(self, schedule_id: str, tolerance_seconds: int = 60) -> bool:
        """
        REQ-WKFL-026-001: Check if schedule is due for execution

        BLP-026: Reliable execution timing

        Args:
            schedule_id: Schedule to check
            tolerance_seconds: Time window for "due now" (default 60s)

        Returns:
            True if schedule should execute now
        """
        schedule = self.schedules.get(schedule_id)
        if not schedule or not schedule.enabled:
            return False

        if schedule.status != ScheduleStatus.ACTIVE:
            return False

        if not schedule.next_run_time:
            return False

        try:
            next_run = datetime.fromisoformat(schedule.next_run_time.replace('Z', '+00:00'))
            now = datetime.now(next_run.tzinfo if next_run.tzinfo else None)

            # Check if within tolerance window
            diff = (next_run - now).total_seconds()
            return -tolerance_seconds <= diff <= tolerance_seconds

        except Exception as e:
            logger.error(f"Error checking schedule due time: {e}")
            return False

    def get_due_schedules(self, tolerance_seconds: int = 60) -> List[ScheduleConfig]:
        """
        REQ-WKFL-026-001: Get all schedules that are due for execution

        BLP-024: Efficient batch checking

        Args:
            tolerance_seconds: Time window for "due now"

        Returns:
            List of schedules due for execution
        """
        due_schedules = []

        for schedule_id in self.schedules:
            if self.is_due_now(schedule_id, tolerance_seconds):
                due_schedules.append(self.schedules[schedule_id])

        return due_schedules

    def record_execution_start(
        self,
        schedule_id: str,
        retry_attempt: int = 0
    ) -> Optional[str]:
        """
        REQ-WKFL-026-002: Record start of schedule execution

        BLP-027: Execution state tracking

        Returns:
            execution_id for tracking
        """
        with self._lock:
            schedule = self.schedules.get(schedule_id)
            if not schedule:
                return None

            execution_id = f"exec_{uuid.uuid4().hex[:12]}"

            execution = ScheduleExecution(
                execution_id=execution_id,
                schedule_id=schedule_id,
                workflow_id=schedule.workflow_id,
                started_at=datetime.now().isoformat(),
                retry_attempt=retry_attempt
            )

            self.executions.append(execution)

            # Update schedule state
            schedule.status = ScheduleStatus.RUNNING
            schedule.run_count += 1

            self._save_state()

            logger.info(f"Started execution {execution_id} for schedule {schedule_id}")
            return execution_id

    def record_execution_complete(
        self,
        execution_id: str,
        success: bool,
        result: Optional[Dict] = None,
        error_message: Optional[str] = None
    ):
        """
        REQ-WKFL-026-002: Record completion of schedule execution

        BLP-027: Execution completion tracking
        """
        with self._lock:
            # Find execution
            execution = None
            for e in self.executions:
                if e.execution_id == execution_id:
                    execution = e
                    break

            if not execution:
                logger.warning(f"Execution {execution_id} not found")
                return

            # Update execution record
            now = datetime.now()
            execution.completed_at = now.isoformat()
            execution.status = "success" if success else "failed"
            execution.result = result
            execution.error_message = error_message

            started = datetime.fromisoformat(execution.started_at)
            execution.duration_seconds = (now - started).total_seconds()

            # Update schedule
            schedule = self.schedules.get(execution.schedule_id)
            if schedule:
                schedule.last_run_time = now.isoformat()
                schedule.next_run_time = self._calculate_next_run(
                    schedule.cron_expression,
                    schedule.timezone,
                    now
                )

                if success:
                    schedule.success_count += 1
                    schedule.status = ScheduleStatus.ACTIVE
                else:
                    schedule.failure_count += 1
                    schedule.status = ScheduleStatus.FAILED

            self._save_state()

            logger.info(
                f"Completed execution {execution_id}: "
                f"{'SUCCESS' if success else 'FAILED'} "
                f"({execution.duration_seconds:.2f}s)"
            )

    def get_execution_history(
        self,
        schedule_id: Optional[str] = None,
        limit: int = 50
    ) -> List[ScheduleExecution]:
        """
        Get execution history with optional filtering

        Args:
            schedule_id: Filter by schedule ID
            limit: Maximum number of records to return

        Returns:
            List of execution records
        """
        executions = self.executions.copy()

        if schedule_id:
            executions = [e for e in executions if e.schedule_id == schedule_id]

        # Sort by started_at descending
        executions.sort(key=lambda e: e.started_at, reverse=True)

        return executions[:limit]

    def get_statistics(self) -> Dict[str, Any]:
        """
        REQ-WKFL-026-002: Get scheduler statistics

        BLP-024: Performance monitoring
        """
        total_schedules = len(self.schedules)
        active_schedules = len([s for s in self.schedules.values() if s.enabled])

        total_executions = len(self.executions)
        successful_executions = len([e for e in self.executions if e.status == "success"])
        failed_executions = len([e for e in self.executions if e.status == "failed"])

        # Calculate average duration
        durations = [e.duration_seconds for e in self.executions if e.duration_seconds]
        avg_duration = sum(durations) / len(durations) if durations else 0

        return {
            "total_schedules": total_schedules,
            "active_schedules": active_schedules,
            "paused_schedules": total_schedules - active_schedules,
            "total_executions": total_executions,
            "successful_executions": successful_executions,
            "failed_executions": failed_executions,
            "success_rate": successful_executions / total_executions if total_executions > 0 else 0,
            "average_duration_seconds": avg_duration,
            "schedules_by_status": {
                status.value: len([s for s in self.schedules.values() if s.status == status])
                for status in ScheduleStatus
            },
            "updated_at": datetime.now().isoformat()
        }


# REQ-WKFL-026-001: Convenience functions
def create_scheduler(state_dir: Optional[Path] = None) -> CronScheduler:
    """Create a new CronScheduler instance"""
    return CronScheduler(state_dir)


# Main execution for testing
if __name__ == "__main__":
    # Test the scheduler
    scheduler = CronScheduler()

    # Add a test schedule
    schedule_id = scheduler.add_schedule(
        workflow_id="test_workflow_001",
        workflow_name="Test Workflow",
        cron_expression="*/5 * * * *",  # Every 5 minutes
        timezone="UTC",
        description="Test schedule for validation"
    )

    print(f"Created schedule: {schedule_id}")

    # Get schedule info
    schedule = scheduler.get_schedule(schedule_id)
    print(f"Schedule details: {schedule}")

    # Get statistics
    stats = scheduler.get_statistics()
    print(f"Scheduler statistics: {json.dumps(stats, indent=2)}")

    # Check if due
    is_due = scheduler.is_due_now(schedule_id)
    print(f"Is due now: {is_due}")

    # List all schedules
    schedules = scheduler.list_schedules()
    print(f"Total schedules: {len(schedules)}")
