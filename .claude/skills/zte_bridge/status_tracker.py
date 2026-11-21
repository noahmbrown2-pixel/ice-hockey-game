#!/usr/bin/env python3
"""
Status Tracker - Monitor ZTE execution progress via GitHub comments.
"""

import subprocess
import json
import re
from dataclasses import dataclass
from typing import Optional, List, Dict, Any
from enum import Enum
from datetime import datetime


class TrackingPhase(Enum):
    """ZTE tracking phases."""
    PENDING = "pending"
    PLAN = "plan"
    BUILD = "build"
    TEST = "test"
    REVIEW = "review"
    DOCUMENT = "document"
    SHIP = "ship"
    COMPLETE = "complete"
    FAILED = "failed"


@dataclass
class PhaseStatus:
    """Status of a single phase."""
    phase: TrackingPhase
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    success: bool = False
    notes: str = ""


@dataclass
class TrackingResult:
    """Complete tracking result for an issue."""
    issue_number: int
    current_phase: TrackingPhase
    phases: List[PhaseStatus]
    pr_url: Optional[str] = None
    overall_success: bool = False


class StatusTracker:
    """
    Track ZTE execution progress by monitoring GitHub issue comments.
    """

    PHASE_PATTERNS = {
        TrackingPhase.PLAN: r"## Plan Phase|Planning complete",
        TrackingPhase.BUILD: r"## Build Phase|Implementation complete",
        TrackingPhase.TEST: r"## Test Phase|Tests passing",
        TrackingPhase.REVIEW: r"## Review Phase|Review complete",
        TrackingPhase.DOCUMENT: r"## Document Phase|Documentation complete",
        TrackingPhase.SHIP: r"## Ship Phase|PR created|Merged to main",
        TrackingPhase.COMPLETE: r"ZTE Complete|Successfully completed",
        TrackingPhase.FAILED: r"FAILED|Error:|Exception:",
    }

    def __init__(self, repo: str = "craigmbrown/ETAC-System"):
        self.repo = repo
        self._cache: Dict[int, TrackingResult] = {}

    def get_status(self, issue_number: int) -> TrackingResult:
        """
        Get current status of ZTE execution for an issue.

        Args:
            issue_number: GitHub issue number

        Returns:
            TrackingResult with current status
        """
        comments = self._fetch_comments(issue_number)
        return self._parse_comments(issue_number, comments)

    def _fetch_comments(self, issue_number: int) -> List[Dict[str, Any]]:
        """Fetch comments from GitHub issue."""
        cmd = [
            "gh", "api",
            f"/repos/{self.repo}/issues/{issue_number}/comments",
            "--jq", ".[].body"
        ]

        try:
            result = subprocess.run(
                cmd, capture_output=True, text=True, check=True
            )
            return [{"body": line} for line in result.stdout.strip().split('\n') if line]
        except subprocess.CalledProcessError:
            return []

    def _parse_comments(
        self,
        issue_number: int,
        comments: List[Dict[str, Any]]
    ) -> TrackingResult:
        """Parse comments to determine current phase."""
        phases = []
        current_phase = TrackingPhase.PENDING
        pr_url = None

        combined_text = "\n".join(c.get("body", "") for c in comments)

        # Check each phase pattern
        for phase, pattern in self.PHASE_PATTERNS.items():
            if re.search(pattern, combined_text, re.IGNORECASE):
                phases.append(PhaseStatus(
                    phase=phase,
                    success=phase != TrackingPhase.FAILED
                ))
                if phase != TrackingPhase.FAILED:
                    current_phase = phase

        # Extract PR URL if present
        pr_match = re.search(r'https://github\.com/[^/]+/[^/]+/pull/\d+', combined_text)
        if pr_match:
            pr_url = pr_match.group()

        return TrackingResult(
            issue_number=issue_number,
            current_phase=current_phase,
            phases=phases,
            pr_url=pr_url,
            overall_success=current_phase == TrackingPhase.COMPLETE
        )

    def post_update(
        self,
        issue_number: int,
        message: str,
        phase: Optional[TrackingPhase] = None
    ) -> bool:
        """
        Post a status update comment to the issue.

        Args:
            issue_number: GitHub issue number
            message: Update message
            phase: Optional phase indicator

        Returns:
            True if successful
        """
        if phase:
            message = f"## {phase.value.title()} Phase\n\n{message}"

        cmd = [
            "gh", "issue", "comment",
            str(issue_number),
            "--repo", self.repo,
            "--body", message
        ]

        try:
            subprocess.run(cmd, capture_output=True, check=True)
            return True
        except subprocess.CalledProcessError:
            return False

    def is_complete(self, issue_number: int) -> bool:
        """Check if ZTE execution is complete."""
        status = self.get_status(issue_number)
        return status.current_phase == TrackingPhase.COMPLETE

    def is_failed(self, issue_number: int) -> bool:
        """Check if ZTE execution failed."""
        status = self.get_status(issue_number)
        return status.current_phase == TrackingPhase.FAILED


# Standard I/O Pattern compliance
if __name__ == "__main__":
    tracker = StatusTracker()
    print("SUCCESS: status_tracker module loaded")
    print(f"Repo: {tracker.repo}")
    print(f"Phases tracked: {[p.value for p in TrackingPhase]}")
