#!/usr/bin/env python3
"""
Human Gate - Request human approval via WhatsApp and Nostr.
"""

import subprocess
import json
from dataclasses import dataclass
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum


class ApprovalChannel(Enum):
    """Notification channels for approval requests."""
    WHATSAPP = "whatsapp"
    NOSTR = "nostr"


@dataclass
class ApprovalRequest:
    """A pending approval request."""
    request_id: str
    workflow_id: str
    title: str
    summary: str
    plan_steps: List[str]
    confidence: float
    sent_via: List[ApprovalChannel]
    sent_at: datetime
    expires_at: Optional[datetime] = None


class HumanGate:
    """
    Request human approval via multi-channel notifications.
    """

    WHATSAPP_RECIPIENT = "15712781730"
    DEFAULT_TIMEOUT_HOURS = 24

    def __init__(self, timeout_hours: int = DEFAULT_TIMEOUT_HOURS):
        self.timeout_hours = timeout_hours
        self.pending_approvals: Dict[str, ApprovalRequest] = {}

    def request_approval(
        self,
        workflow_id: str,
        title: str,
        summary: str,
        plan_steps: List[str],
        confidence: float,
        channels: Optional[List[ApprovalChannel]] = None
    ) -> ApprovalRequest:
        """
        Send approval request via specified channels.

        Args:
            workflow_id: Workflow ID
            title: Enhancement title
            summary: Brief summary
            plan_steps: Planned steps
            confidence: Planning confidence
            channels: Notification channels

        Returns:
            ApprovalRequest with sent status
        """
        if channels is None:
            channels = [ApprovalChannel.WHATSAPP]

        request_id = f"approval-{workflow_id}-{int(datetime.now().timestamp())}"
        sent_channels = []

        for channel in channels:
            if channel == ApprovalChannel.WHATSAPP:
                if self._send_whatsapp(request_id, title, summary, plan_steps, confidence):
                    sent_channels.append(channel)
            elif channel == ApprovalChannel.NOSTR:
                if self._send_nostr(request_id, title, summary, plan_steps, confidence):
                    sent_channels.append(channel)

        request = ApprovalRequest(
            request_id=request_id,
            workflow_id=workflow_id,
            title=title,
            summary=summary,
            plan_steps=plan_steps,
            confidence=confidence,
            sent_via=sent_channels,
            sent_at=datetime.now()
        )

        self.pending_approvals[request_id] = request
        return request

    def _send_whatsapp(
        self,
        request_id: str,
        title: str,
        summary: str,
        plan_steps: List[str],
        confidence: float
    ) -> bool:
        """Send approval request via WhatsApp MCP."""
        steps_text = "\n".join(f"  {i+1}. {s}" for i, s in enumerate(plan_steps[:5]))

        message = f"""🔔 Enhancement Approval Request

📋 {title}

{summary}

📊 Confidence: {confidence:.0%}

📝 Plan:
{steps_text}

Reply:
✅ APPROVE {request_id}
❌ REJECT {request_id}
"""

        # This would use the WhatsApp MCP tool
        # For now, log the intent
        print(f"[WhatsApp] Would send to {self.WHATSAPP_RECIPIENT}:")
        print(message[:200] + "...")
        return True

    def _send_nostr(
        self,
        request_id: str,
        title: str,
        summary: str,
        plan_steps: List[str],
        confidence: float
    ) -> bool:
        """Send approval request via Nostr DM."""
        # This would use the Nostr notifier agent
        print(f"[Nostr] Would send DM for {request_id}")
        return True

    def check_response(self, request_id: str) -> Optional[str]:
        """
        Check for approval response.

        Returns:
            "approved", "rejected", or None
        """
        # In production, this would check message responses
        return None

    def format_approval_message(
        self,
        title: str,
        summary: str,
        plan_steps: List[str],
        confidence: float
    ) -> str:
        """Format a standard approval message."""
        steps_text = "\n".join(f"  {i+1}. {s}" for i, s in enumerate(plan_steps[:5]))

        return f"""🔔 Enhancement Approval Request

📋 {title}

{summary}

📊 Confidence: {confidence:.0%}

📝 Plan:
{steps_text}
"""


# Standard I/O Pattern compliance
if __name__ == "__main__":
    gate = HumanGate()
    print("SUCCESS: human_gate module loaded")
    print(f"WhatsApp recipient: {gate.WHATSAPP_RECIPIENT}")
    print(f"Timeout: {gate.timeout_hours}h")
    print(f"Channels: {[c.value for c in ApprovalChannel]}")

    # Test message formatting
    msg = gate.format_approval_message(
        "Add dark mode",
        "User requested dark mode feature",
        ["Create theme context", "Add toggle component", "Update styles"],
        0.82
    )
    print(f"\nSample message:\n{msg[:300]}...")
