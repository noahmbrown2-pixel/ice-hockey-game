#!/usr/bin/env python3
"""
Retry Manager - Exponential Backoff Retry Logic for Workflow Execution

BLP Coverage:
- BLP-021 (Durability): Persistent retry state across restarts
- BLP-022 (Error Recovery): Automatic retry with exponential backoff
- BLP-031 (Self-Improvement): Learn from failure patterns to optimize retries
- BLP-023 (State Persistence): Track retry attempts and outcomes

Requirements Traceability:
- REQ-WKFL-026-003: Implement retry logic with exponential backoff
- REQ-WKFL-026-003a: Configurable max_retries, base_delay, max_delay, backoff_factor
- REQ-WKFL-026-003b: Jitter (±20%) to prevent thundering herd
- REQ-WKFL-026-003c: Retry state tracking with timestamps and error messages

Author: DITD Implementation Agent
Created: 2025-12-29
"""

import json
import os
import random
import threading
import time
from dataclasses import dataclass, field, asdict
from datetime import datetime, timedelta
from enum import Enum
from pathlib import Path
from typing import Any, Callable, Dict, List, Optional, Tuple
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class RetryStatus(Enum):
    """Status of a retry attempt."""
    PENDING = "pending"          # Waiting for retry
    IN_PROGRESS = "in_progress"  # Currently executing
    SUCCESS = "success"          # Completed successfully
    FAILED = "failed"            # Failed, will retry
    EXHAUSTED = "exhausted"      # All retries exhausted
    CANCELLED = "cancelled"      # Manually cancelled


class RetryPolicy(Enum):
    """Different retry policies for various failure types."""
    EXPONENTIAL = "exponential"      # Standard exponential backoff
    LINEAR = "linear"                # Linear backoff (delay * attempt)
    CONSTANT = "constant"            # Fixed delay between retries
    FIBONACCI = "fibonacci"          # Fibonacci sequence delays
    IMMEDIATE = "immediate"          # No delay (for transient errors)


@dataclass
class RetryConfig:
    """
    Configuration for retry behavior.

    BLP-022: Configurable retry parameters for error recovery
    """
    max_retries: int = 3                # Maximum number of retry attempts
    base_delay_seconds: float = 60.0    # Initial delay between retries
    max_delay_seconds: float = 3600.0   # Maximum delay cap
    backoff_factor: float = 2.0         # Multiplier for exponential backoff
    jitter_range: float = 0.2           # ±20% jitter to prevent thundering herd
    policy: RetryPolicy = RetryPolicy.EXPONENTIAL

    # Advanced options
    retry_on_exceptions: List[str] = field(default_factory=lambda: [
        "TimeoutError",
        "ConnectionError",
        "ServiceUnavailable",
        "RateLimitExceeded"
    ])

    # Don't retry on these errors (permanent failures)
    no_retry_exceptions: List[str] = field(default_factory=lambda: [
        "AuthenticationError",
        "PermissionDenied",
        "InvalidConfiguration",
        "ResourceNotFound"
    ])

    def to_dict(self) -> Dict[str, Any]:
        """Convert config to dictionary."""
        return {
            "max_retries": self.max_retries,
            "base_delay_seconds": self.base_delay_seconds,
            "max_delay_seconds": self.max_delay_seconds,
            "backoff_factor": self.backoff_factor,
            "jitter_range": self.jitter_range,
            "policy": self.policy.value,
            "retry_on_exceptions": self.retry_on_exceptions,
            "no_retry_exceptions": self.no_retry_exceptions
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "RetryConfig":
        """Create config from dictionary."""
        if "policy" in data and isinstance(data["policy"], str):
            data["policy"] = RetryPolicy(data["policy"])
        return cls(**data)


@dataclass
class RetryAttempt:
    """
    Record of a single retry attempt.

    BLP-023: Comprehensive attempt tracking for state persistence
    """
    attempt_number: int
    started_at: str
    completed_at: Optional[str] = None
    status: RetryStatus = RetryStatus.PENDING
    delay_applied: float = 0.0          # Actual delay used (with jitter)
    error_message: Optional[str] = None
    error_type: Optional[str] = None
    result: Optional[Dict[str, Any]] = None

    def to_dict(self) -> Dict[str, Any]:
        """Convert attempt to dictionary."""
        return {
            "attempt_number": self.attempt_number,
            "started_at": self.started_at,
            "completed_at": self.completed_at,
            "status": self.status.value,
            "delay_applied": self.delay_applied,
            "error_message": self.error_message,
            "error_type": self.error_type,
            "result": self.result
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "RetryAttempt":
        """Create attempt from dictionary."""
        data["status"] = RetryStatus(data["status"])
        return cls(**data)


@dataclass
class RetryContext:
    """
    Complete retry context for a workflow execution.

    BLP-021: Full context for durability across restarts
    """
    context_id: str
    workflow_id: str
    workflow_name: str
    schedule_id: Optional[str] = None
    execution_id: Optional[str] = None
    config: RetryConfig = field(default_factory=RetryConfig)
    attempts: List[RetryAttempt] = field(default_factory=list)
    created_at: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    last_updated: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    status: RetryStatus = RetryStatus.PENDING
    next_retry_at: Optional[str] = None
    final_result: Optional[Dict[str, Any]] = None
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        """Convert context to dictionary."""
        return {
            "context_id": self.context_id,
            "workflow_id": self.workflow_id,
            "workflow_name": self.workflow_name,
            "schedule_id": self.schedule_id,
            "execution_id": self.execution_id,
            "config": self.config.to_dict(),
            "attempts": [a.to_dict() for a in self.attempts],
            "created_at": self.created_at,
            "last_updated": self.last_updated,
            "status": self.status.value,
            "next_retry_at": self.next_retry_at,
            "final_result": self.final_result,
            "metadata": self.metadata
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "RetryContext":
        """Create context from dictionary."""
        data["config"] = RetryConfig.from_dict(data["config"])
        data["attempts"] = [RetryAttempt.from_dict(a) for a in data["attempts"]]
        data["status"] = RetryStatus(data["status"])
        return cls(**data)

    @property
    def current_attempt(self) -> int:
        """Get current attempt number (0-indexed)."""
        return len(self.attempts)

    @property
    def can_retry(self) -> bool:
        """Check if more retries are available."""
        return (
            self.current_attempt < self.config.max_retries and
            self.status not in (RetryStatus.SUCCESS, RetryStatus.EXHAUSTED, RetryStatus.CANCELLED)
        )

    @property
    def total_execution_time(self) -> float:
        """Calculate total time spent on all attempts."""
        total = 0.0
        for attempt in self.attempts:
            if attempt.started_at and attempt.completed_at:
                start = datetime.fromisoformat(attempt.started_at)
                end = datetime.fromisoformat(attempt.completed_at)
                total += (end - start).total_seconds()
        return total


class RetryManager:
    """
    Manages retry logic for workflow executions with exponential backoff.

    BLP-021: Persistent retry state for durability
    BLP-022: Automatic retry with configurable backoff strategies
    BLP-031: Track failure patterns for optimization

    Features:
    - Multiple backoff policies (exponential, linear, constant, fibonacci)
    - Configurable jitter to prevent thundering herd
    - Persistent state for recovery after restarts
    - Exception-based retry decisions
    - Comprehensive attempt tracking
    """

    def __init__(
        self,
        state_file: str = "/home/craigmbrown/Project/.claude/skills/workflow-scheduler/data/retry_state.json",
        default_config: Optional[RetryConfig] = None
    ):
        """
        Initialize the Retry Manager.

        Args:
            state_file: Path to persistent state file
            default_config: Default retry configuration
        """
        self.state_file = Path(state_file)
        self.default_config = default_config or RetryConfig()
        self._lock = threading.RLock()
        self.contexts: Dict[str, RetryContext] = {}

        # Fibonacci cache for fibonacci backoff
        self._fib_cache = [1, 1]

        # Failure pattern tracking for BLP-031
        self.failure_patterns: Dict[str, Dict[str, int]] = {}

        # Ensure data directory exists
        self.state_file.parent.mkdir(parents=True, exist_ok=True)

        # Load existing state
        self._load_state()

        logger.info(f"RetryManager initialized with {len(self.contexts)} active contexts")

    def _load_state(self) -> None:
        """Load retry state from persistent storage. BLP-021"""
        with self._lock:
            if self.state_file.exists():
                try:
                    with open(self.state_file, 'r') as f:
                        data = json.load(f)

                    self.contexts = {
                        cid: RetryContext.from_dict(ctx)
                        for cid, ctx in data.get("contexts", {}).items()
                    }
                    self.failure_patterns = data.get("failure_patterns", {})

                    logger.info(f"Loaded {len(self.contexts)} retry contexts from state")
                except Exception as e:
                    logger.error(f"Error loading retry state: {e}")
                    self.contexts = {}
                    self.failure_patterns = {}

    def _save_state(self) -> None:
        """Save retry state atomically. BLP-021"""
        with self._lock:
            try:
                state = {
                    "contexts": {cid: ctx.to_dict() for cid, ctx in self.contexts.items()},
                    "failure_patterns": self.failure_patterns,
                    "last_saved": datetime.utcnow().isoformat()
                }

                # Atomic write
                temp_file = self.state_file.with_suffix('.tmp')
                with open(temp_file, 'w') as f:
                    json.dump(state, f, indent=2)
                temp_file.replace(self.state_file)

            except Exception as e:
                logger.error(f"Error saving retry state: {e}")

    def _get_fibonacci(self, n: int) -> int:
        """Get nth Fibonacci number with caching."""
        while len(self._fib_cache) <= n:
            self._fib_cache.append(
                self._fib_cache[-1] + self._fib_cache[-2]
            )
        return self._fib_cache[n]

    def calculate_delay(
        self,
        attempt: int,
        config: RetryConfig
    ) -> float:
        """
        Calculate delay for next retry attempt.

        BLP-022: Implements multiple backoff strategies with jitter

        Args:
            attempt: Current attempt number (0-indexed)
            config: Retry configuration

        Returns:
            Delay in seconds with jitter applied
        """
        # Calculate base delay based on policy
        if config.policy == RetryPolicy.EXPONENTIAL:
            delay = config.base_delay_seconds * (config.backoff_factor ** attempt)
        elif config.policy == RetryPolicy.LINEAR:
            delay = config.base_delay_seconds * (attempt + 1)
        elif config.policy == RetryPolicy.CONSTANT:
            delay = config.base_delay_seconds
        elif config.policy == RetryPolicy.FIBONACCI:
            delay = config.base_delay_seconds * self._get_fibonacci(attempt)
        elif config.policy == RetryPolicy.IMMEDIATE:
            return 0.0
        else:
            delay = config.base_delay_seconds * (config.backoff_factor ** attempt)

        # Apply max delay cap
        delay = min(delay, config.max_delay_seconds)

        # Apply jitter (±jitter_range%)
        jitter_amount = delay * config.jitter_range
        jitter = random.uniform(-jitter_amount, jitter_amount)
        delay = max(0, delay + jitter)

        return delay

    def should_retry(
        self,
        context: RetryContext,
        error_type: Optional[str] = None
    ) -> Tuple[bool, str]:
        """
        Determine if execution should be retried.

        BLP-022: Smart retry decision based on error type and configuration

        Args:
            context: Retry context
            error_type: Type of error that occurred

        Returns:
            Tuple of (should_retry, reason)
        """
        # Check if retries exhausted
        if context.current_attempt >= context.config.max_retries:
            return False, f"Max retries ({context.config.max_retries}) exhausted"

        # Check if already succeeded or cancelled
        if context.status == RetryStatus.SUCCESS:
            return False, "Execution already succeeded"
        if context.status == RetryStatus.CANCELLED:
            return False, "Execution was cancelled"
        if context.status == RetryStatus.EXHAUSTED:
            return False, "Retries already exhausted"

        # Check error type against no-retry list
        if error_type and error_type in context.config.no_retry_exceptions:
            return False, f"Error type '{error_type}' is not retryable"

        # Check error type against retry list (if specified)
        if error_type and context.config.retry_on_exceptions:
            if error_type not in context.config.retry_on_exceptions:
                # Log pattern for learning - BLP-031
                self._track_failure_pattern(context.workflow_id, error_type, False)
                return False, f"Error type '{error_type}' not in retry list"

        return True, "Retry permitted"

    def _track_failure_pattern(
        self,
        workflow_id: str,
        error_type: str,
        retried: bool
    ) -> None:
        """Track failure patterns for optimization. BLP-031"""
        with self._lock:
            if workflow_id not in self.failure_patterns:
                self.failure_patterns[workflow_id] = {}

            key = f"{error_type}:{'retried' if retried else 'not_retried'}"
            self.failure_patterns[workflow_id][key] = \
                self.failure_patterns[workflow_id].get(key, 0) + 1

            self._save_state()

    def create_context(
        self,
        workflow_id: str,
        workflow_name: str,
        schedule_id: Optional[str] = None,
        execution_id: Optional[str] = None,
        config: Optional[RetryConfig] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> RetryContext:
        """
        Create a new retry context for a workflow execution.

        BLP-023: Initialize comprehensive retry tracking

        Args:
            workflow_id: Unique workflow identifier
            workflow_name: Human-readable workflow name
            schedule_id: Optional schedule that triggered this
            execution_id: Optional execution ID from scheduler
            config: Optional custom retry configuration
            metadata: Optional additional metadata

        Returns:
            New RetryContext instance
        """
        with self._lock:
            context_id = f"retry_{workflow_id}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S_%f')}"

            context = RetryContext(
                context_id=context_id,
                workflow_id=workflow_id,
                workflow_name=workflow_name,
                schedule_id=schedule_id,
                execution_id=execution_id,
                config=config or self.default_config,
                metadata=metadata or {}
            )

            self.contexts[context_id] = context
            self._save_state()

            logger.info(f"Created retry context: {context_id} for workflow {workflow_name}")
            return context

    def start_attempt(self, context_id: str) -> Optional[RetryAttempt]:
        """
        Start a new retry attempt.

        BLP-022: Track attempt start for error recovery

        Args:
            context_id: Retry context identifier

        Returns:
            New RetryAttempt instance or None if cannot retry
        """
        with self._lock:
            context = self.contexts.get(context_id)
            if not context:
                logger.error(f"Context not found: {context_id}")
                return None

            if not context.can_retry:
                logger.warning(f"Cannot retry context {context_id}: {context.status.value}")
                return None

            # Calculate delay for this attempt
            delay = self.calculate_delay(context.current_attempt, context.config)

            attempt = RetryAttempt(
                attempt_number=context.current_attempt,
                started_at=datetime.utcnow().isoformat(),
                status=RetryStatus.IN_PROGRESS,
                delay_applied=delay
            )

            context.attempts.append(attempt)
            context.status = RetryStatus.IN_PROGRESS
            context.last_updated = datetime.utcnow().isoformat()

            self._save_state()

            logger.info(
                f"Started attempt {attempt.attempt_number + 1}/{context.config.max_retries} "
                f"for {context.workflow_name} (delay: {delay:.1f}s)"
            )

            return attempt

    def complete_attempt(
        self,
        context_id: str,
        success: bool,
        result: Optional[Dict[str, Any]] = None,
        error_message: Optional[str] = None,
        error_type: Optional[str] = None
    ) -> Tuple[bool, Optional[float]]:
        """
        Complete current retry attempt and determine next steps.

        BLP-022: Process attempt result and schedule next retry if needed

        Args:
            context_id: Retry context identifier
            success: Whether the attempt succeeded
            result: Optional result data
            error_message: Optional error message if failed
            error_type: Optional error type for retry decision

        Returns:
            Tuple of (will_retry, next_delay_seconds)
        """
        with self._lock:
            context = self.contexts.get(context_id)
            if not context or not context.attempts:
                logger.error(f"Invalid context or no attempts: {context_id}")
                return False, None

            # Update current attempt
            attempt = context.attempts[-1]
            attempt.completed_at = datetime.utcnow().isoformat()
            attempt.result = result
            attempt.error_message = error_message
            attempt.error_type = error_type

            if success:
                attempt.status = RetryStatus.SUCCESS
                context.status = RetryStatus.SUCCESS
                context.final_result = result
                context.next_retry_at = None

                logger.info(f"Attempt succeeded for {context.workflow_name}")
                self._save_state()
                return False, None

            # Attempt failed
            attempt.status = RetryStatus.FAILED

            # Track pattern for learning
            if error_type:
                self._track_failure_pattern(context.workflow_id, error_type, True)

            # Check if should retry
            should_retry, reason = self.should_retry(context, error_type)

            if should_retry:
                # Calculate next delay
                next_delay = self.calculate_delay(context.current_attempt, context.config)
                next_retry_time = datetime.utcnow() + timedelta(seconds=next_delay)
                context.next_retry_at = next_retry_time.isoformat()
                context.status = RetryStatus.PENDING

                logger.info(
                    f"Will retry {context.workflow_name} in {next_delay:.1f}s "
                    f"(attempt {context.current_attempt + 1}/{context.config.max_retries})"
                )

                self._save_state()
                return True, next_delay
            else:
                # Retries exhausted or not retryable
                context.status = RetryStatus.EXHAUSTED
                context.next_retry_at = None

                logger.warning(
                    f"Retries exhausted for {context.workflow_name}: {reason}"
                )

                self._save_state()
                return False, None

    def cancel_retry(self, context_id: str) -> bool:
        """
        Cancel pending retries for a context.

        Args:
            context_id: Retry context identifier

        Returns:
            True if cancelled successfully
        """
        with self._lock:
            context = self.contexts.get(context_id)
            if not context:
                logger.error(f"Context not found: {context_id}")
                return False

            if context.status in (RetryStatus.SUCCESS, RetryStatus.EXHAUSTED):
                logger.warning(f"Cannot cancel context in state: {context.status.value}")
                return False

            context.status = RetryStatus.CANCELLED
            context.next_retry_at = None
            context.last_updated = datetime.utcnow().isoformat()

            self._save_state()
            logger.info(f"Cancelled retries for {context.workflow_name}")
            return True

    def get_pending_retries(self) -> List[RetryContext]:
        """
        Get all contexts that are pending retry and ready to execute.

        Returns:
            List of RetryContext instances ready for retry
        """
        with self._lock:
            now = datetime.utcnow()
            pending = []

            for context in self.contexts.values():
                if context.status != RetryStatus.PENDING:
                    continue

                if context.next_retry_at:
                    retry_time = datetime.fromisoformat(context.next_retry_at)
                    if retry_time <= now:
                        pending.append(context)
                else:
                    # No scheduled time, ready for immediate retry
                    pending.append(context)

            return sorted(pending, key=lambda c: c.next_retry_at or c.created_at)

    def get_context(self, context_id: str) -> Optional[RetryContext]:
        """Get a retry context by ID."""
        return self.contexts.get(context_id)

    def get_contexts_by_workflow(self, workflow_id: str) -> List[RetryContext]:
        """Get all retry contexts for a workflow."""
        return [
            ctx for ctx in self.contexts.values()
            if ctx.workflow_id == workflow_id
        ]

    def get_active_contexts(self) -> List[RetryContext]:
        """Get all active (non-terminal) retry contexts."""
        terminal_states = {RetryStatus.SUCCESS, RetryStatus.EXHAUSTED, RetryStatus.CANCELLED}
        return [
            ctx for ctx in self.contexts.values()
            if ctx.status not in terminal_states
        ]

    def get_failure_stats(self) -> Dict[str, Any]:
        """
        Get failure statistics for monitoring.

        BLP-031: Provide data for self-improvement

        Returns:
            Dictionary with failure statistics
        """
        with self._lock:
            total_contexts = len(self.contexts)

            status_counts = {}
            for ctx in self.contexts.values():
                status = ctx.status.value
                status_counts[status] = status_counts.get(status, 0) + 1

            total_attempts = sum(len(ctx.attempts) for ctx in self.contexts.values())
            successful_first_try = sum(
                1 for ctx in self.contexts.values()
                if ctx.status == RetryStatus.SUCCESS and len(ctx.attempts) == 1
            )

            return {
                "total_contexts": total_contexts,
                "status_distribution": status_counts,
                "total_attempts": total_attempts,
                "successful_first_try": successful_first_try,
                "first_try_success_rate": (
                    successful_first_try / total_contexts if total_contexts > 0 else 0
                ),
                "failure_patterns": self.failure_patterns,
                "active_contexts": len(self.get_active_contexts()),
                "pending_retries": len(self.get_pending_retries())
            }

    def cleanup_old_contexts(self, max_age_days: int = 7) -> int:
        """
        Clean up old completed/exhausted contexts.

        Args:
            max_age_days: Maximum age in days for completed contexts

        Returns:
            Number of contexts cleaned up
        """
        with self._lock:
            cutoff = datetime.utcnow() - timedelta(days=max_age_days)
            terminal_states = {RetryStatus.SUCCESS, RetryStatus.EXHAUSTED, RetryStatus.CANCELLED}

            to_remove = []
            for cid, ctx in self.contexts.items():
                if ctx.status in terminal_states:
                    created = datetime.fromisoformat(ctx.created_at)
                    if created < cutoff:
                        to_remove.append(cid)

            for cid in to_remove:
                del self.contexts[cid]

            if to_remove:
                self._save_state()
                logger.info(f"Cleaned up {len(to_remove)} old retry contexts")

            return len(to_remove)

    def execute_with_retry(
        self,
        workflow_id: str,
        workflow_name: str,
        execute_func: Callable[[], Dict[str, Any]],
        config: Optional[RetryConfig] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Tuple[bool, Optional[Dict[str, Any]], RetryContext]:
        """
        Execute a function with automatic retry handling.

        Convenience method that handles the full retry lifecycle.

        Args:
            workflow_id: Unique workflow identifier
            workflow_name: Human-readable workflow name
            execute_func: Function to execute (returns dict with 'success' key)
            config: Optional custom retry configuration
            metadata: Optional additional metadata

        Returns:
            Tuple of (success, result, context)
        """
        context = self.create_context(
            workflow_id=workflow_id,
            workflow_name=workflow_name,
            config=config,
            metadata=metadata
        )

        while context.can_retry:
            attempt = self.start_attempt(context.context_id)
            if not attempt:
                break

            # Apply delay if not first attempt
            if attempt.attempt_number > 0 and attempt.delay_applied > 0:
                logger.info(f"Waiting {attempt.delay_applied:.1f}s before retry...")
                time.sleep(attempt.delay_applied)

            try:
                result = execute_func()
                success = result.get("success", True)
                error_message = result.get("error_message")
                error_type = result.get("error_type")

                will_retry, _ = self.complete_attempt(
                    context.context_id,
                    success=success,
                    result=result,
                    error_message=error_message,
                    error_type=error_type
                )

                if success:
                    return True, result, context

                if not will_retry:
                    break

            except Exception as e:
                error_type = type(e).__name__
                error_message = str(e)

                will_retry, _ = self.complete_attempt(
                    context.context_id,
                    success=False,
                    error_message=error_message,
                    error_type=error_type
                )

                if not will_retry:
                    break

        # Return final state
        final_context = self.get_context(context.context_id)
        return (
            final_context.status == RetryStatus.SUCCESS,
            final_context.final_result,
            final_context
        )


# Export main classes
__all__ = [
    "RetryManager",
    "RetryConfig",
    "RetryContext",
    "RetryAttempt",
    "RetryStatus",
    "RetryPolicy"
]


if __name__ == "__main__":
    # Demo/test of retry manager
    import sys

    manager = RetryManager()

    # Test with a simulated failing function
    attempt_count = [0]

    def flaky_function():
        attempt_count[0] += 1
        if attempt_count[0] < 3:
            raise ConnectionError("Simulated connection failure")
        return {"success": True, "data": "Operation completed"}

    config = RetryConfig(
        max_retries=5,
        base_delay_seconds=1.0,
        backoff_factor=2.0,
        policy=RetryPolicy.EXPONENTIAL
    )

    print("Testing retry manager with flaky function...")
    success, result, context = manager.execute_with_retry(
        workflow_id="test_workflow",
        workflow_name="Test Flaky Workflow",
        execute_func=flaky_function,
        config=config
    )

    print(f"\nResult: {'SUCCESS' if success else 'FAILED'}")
    print(f"Total attempts: {len(context.attempts)}")
    print(f"Result data: {result}")

    # Print stats
    print("\nRetry Statistics:")
    stats = manager.get_failure_stats()
    for key, value in stats.items():
        if key != "failure_patterns":
            print(f"  {key}: {value}")
