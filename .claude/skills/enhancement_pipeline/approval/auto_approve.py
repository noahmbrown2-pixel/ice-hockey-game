#!/usr/bin/env python3
"""
Auto Approve - Automatic approval based on confidence thresholds.
"""

from dataclasses import dataclass
from typing import Optional, List
from enum import Enum


class ApprovalStatus(Enum):
    """Approval status types."""
    AUTO_APPROVED = "auto_approved"
    NEEDS_HUMAN = "needs_human"
    REJECTED = "rejected"


@dataclass
class ApprovalDecision:
    """Result of approval evaluation."""
    status: ApprovalStatus
    reason: str
    confidence: float
    thresholds_met: List[str]
    thresholds_failed: List[str]


class AutoApprover:
    """
    Evaluate plans for automatic approval.
    """

    DEFAULT_CONFIDENCE_THRESHOLD = 0.85
    DEFAULT_AGREEMENT_THRESHOLD = 0.60

    def __init__(
        self,
        confidence_threshold: float = DEFAULT_CONFIDENCE_THRESHOLD,
        agreement_threshold: float = DEFAULT_AGREEMENT_THRESHOLD
    ):
        self.confidence_threshold = confidence_threshold
        self.agreement_threshold = agreement_threshold

    def evaluate(
        self,
        confidence: float,
        agreement_score: float = 1.0,
        intent: str = "/enhancement",
        priority: str = "medium"
    ) -> ApprovalDecision:
        """
        Evaluate whether a plan can be auto-approved.

        Args:
            confidence: Planning confidence score (0-1)
            agreement_score: Multi-model agreement score (0-1)
            intent: Request intent type
            priority: Request priority

        Returns:
            ApprovalDecision with status and reasoning
        """
        thresholds_met = []
        thresholds_failed = []

        # Check confidence threshold
        if confidence >= self.confidence_threshold:
            thresholds_met.append(f"confidence >= {self.confidence_threshold:.0%}")
        else:
            thresholds_failed.append(f"confidence {confidence:.0%} < {self.confidence_threshold:.0%}")

        # Check agreement threshold
        if agreement_score >= self.agreement_threshold:
            thresholds_met.append(f"agreement >= {self.agreement_threshold:.0%}")
        else:
            thresholds_failed.append(f"agreement {agreement_score:.0%} < {self.agreement_threshold:.0%}")

        # High priority always needs human review
        if priority == "high":
            thresholds_failed.append("high priority requires human review")

        # Bug fixes get more scrutiny
        if intent == "/bug" and confidence < 0.90:
            thresholds_failed.append("bug fixes require higher confidence")

        # Determine status
        if not thresholds_failed:
            status = ApprovalStatus.AUTO_APPROVED
            reason = "All thresholds met for auto-approval"
        else:
            status = ApprovalStatus.NEEDS_HUMAN
            reason = f"Human review needed: {', '.join(thresholds_failed)}"

        return ApprovalDecision(
            status=status,
            reason=reason,
            confidence=confidence,
            thresholds_met=thresholds_met,
            thresholds_failed=thresholds_failed
        )

    def can_auto_approve(
        self,
        confidence: float,
        agreement_score: float = 1.0
    ) -> bool:
        """Quick check if auto-approval is possible."""
        return (
            confidence >= self.confidence_threshold and
            agreement_score >= self.agreement_threshold
        )


# Standard I/O Pattern compliance
if __name__ == "__main__":
    approver = AutoApprover()
    print("SUCCESS: auto_approve module loaded")
    print(f"Confidence threshold: {approver.confidence_threshold:.0%}")
    print(f"Agreement threshold: {approver.agreement_threshold:.0%}")

    # Test cases
    tests = [
        (0.90, 0.80, "/feature", "medium"),
        (0.75, 0.70, "/feature", "medium"),
        (0.85, 0.90, "/bug", "medium"),
        (0.95, 0.90, "/feature", "high"),
    ]

    print("\nTest evaluations:")
    for conf, agree, intent, priority in tests:
        result = approver.evaluate(conf, agree, intent, priority)
        print(f"  {conf:.0%}/{agree:.0%}/{intent}/{priority} -> {result.status.value}")
