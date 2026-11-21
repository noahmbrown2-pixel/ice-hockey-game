#!/usr/bin/env python3
"""
ZTE Client - Subprocess interface to production ZTE pipeline.

Calls ZTE via subprocess, never modifying the production code.
"""

import subprocess
import json
import os
from dataclasses import dataclass, field
from typing import Optional, Dict, Any, List
from enum import Enum
from datetime import datetime
from pathlib import Path


class ZTEPhase(Enum):
    """ZTE pipeline phases."""
    PLAN = "plan"
    BUILD = "build"
    TEST = "test"
    REVIEW = "review"
    DOCUMENT = "document"
    SHIP = "ship"
    COMPLETE = "complete"
    FAILED = "failed"


@dataclass
class ZTEResult:
    """Result from ZTE execution."""
    success: bool
    phase: ZTEPhase
    issue_number: int
    worktree_path: Optional[str] = None
    pr_url: Optional[str] = None
    error_message: Optional[str] = None
    execution_time: float = 0.0
    logs: List[str] = field(default_factory=list)


class ZTEClient:
    """
    Client for executing ZTE pipeline via subprocess.

    Maintains production ZTE integrity by calling it externally.
    """

    ZTE_SCRIPT = "/home/craigmbrown/Project/.claude/skills/autonomous-workflows/tac-adw-system/adw_sdlc_zte_iso.py"

    def __init__(
        self,
        repo_path: str = "/home/craigmbrown/Project",
        timeout: int = 3600,
        dry_run: bool = False
    ):
        self.repo_path = repo_path
        self.timeout = timeout
        self.dry_run = dry_run
        self.last_result: Optional[ZTEResult] = None

    def execute(
        self,
        issue_number: int,
        phases: Optional[List[str]] = None,
        env_vars: Optional[Dict[str, str]] = None
    ) -> ZTEResult:
        """
        Execute ZTE pipeline for an issue.

        Args:
            issue_number: GitHub issue number
            phases: Optional list of phases to run
            env_vars: Additional environment variables

        Returns:
            ZTEResult with execution details
        """
        start_time = datetime.now()

        # Build command
        cmd = ["python3", self.ZTE_SCRIPT, "--issue", str(issue_number)]

        if phases:
            cmd.extend(["--phases", ",".join(phases)])

        if self.dry_run:
            cmd.append("--dry-run")

        # Set environment
        env = os.environ.copy()
        env["ZTE_REPO_PATH"] = self.repo_path
        if env_vars:
            env.update(env_vars)

        try:
            if self.dry_run:
                # Simulate execution
                return ZTEResult(
                    success=True,
                    phase=ZTEPhase.COMPLETE,
                    issue_number=issue_number,
                    logs=["DRY RUN: Would execute ZTE"],
                    execution_time=0.0
                )

            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=self.timeout,
                cwd=self.repo_path,
                env=env
            )

            execution_time = (datetime.now() - start_time).total_seconds()

            if result.returncode == 0:
                zte_result = ZTEResult(
                    success=True,
                    phase=ZTEPhase.COMPLETE,
                    issue_number=issue_number,
                    execution_time=execution_time,
                    logs=result.stdout.split('\n') if result.stdout else []
                )
            else:
                zte_result = ZTEResult(
                    success=False,
                    phase=ZTEPhase.FAILED,
                    issue_number=issue_number,
                    error_message=result.stderr,
                    execution_time=execution_time,
                    logs=result.stdout.split('\n') if result.stdout else []
                )

            self.last_result = zte_result
            return zte_result

        except subprocess.TimeoutExpired:
            return ZTEResult(
                success=False,
                phase=ZTEPhase.FAILED,
                issue_number=issue_number,
                error_message=f"ZTE execution timed out after {self.timeout}s"
            )
        except Exception as e:
            return ZTEResult(
                success=False,
                phase=ZTEPhase.FAILED,
                issue_number=issue_number,
                error_message=str(e)
            )

    def get_worktree_path(self, issue_number: int) -> Optional[str]:
        """Get the worktree path for an issue."""
        worktree_base = Path(self.repo_path) / "trees"
        for path in worktree_base.glob(f"*-{issue_number}"):
            if path.is_dir():
                return str(path)
        return None

    def check_zte_available(self) -> bool:
        """Check if ZTE script is available."""
        return Path(self.ZTE_SCRIPT).exists()


# Standard I/O Pattern compliance
if __name__ == "__main__":
    client = ZTEClient(dry_run=True)
    print(f"SUCCESS: zte_client module loaded")
    print(f"ZTE Script: {client.ZTE_SCRIPT}")
    print(f"Available: {client.check_zte_available()}")
    print(f"Phases: {[p.value for p in ZTEPhase]}")
