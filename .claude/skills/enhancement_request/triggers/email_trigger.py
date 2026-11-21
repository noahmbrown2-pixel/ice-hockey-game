#!/usr/bin/env python3
"""
Email Trigger - Monitor Gmail for enhancement requests.
"""

import os
from dataclasses import dataclass
from typing import List, Optional
from datetime import datetime


@dataclass
class EmailRequest:
    """An enhancement request from email."""
    message_id: str
    subject: str
    body: str
    sender: str
    received_at: datetime
    labels: List[str]


class EmailTrigger:
    """
    Monitor Gmail for enhancement request emails.
    """

    ENHANCEMENT_LABELS = ["enhancement-request", "feature-request", "bug-report"]
    KEYWORDS = ["feature", "enhancement", "bug", "fix", "add", "implement"]

    def __init__(self):
        self.credentials_path = os.getenv("GMAIL_CREDENTIALS_PATH")
        self.token_path = os.getenv("GMAIL_TOKEN_PATH")

    def poll(self) -> List[EmailRequest]:
        """
        Poll Gmail for new enhancement requests.

        Returns:
            List of EmailRequest objects
        """
        # Gmail API integration would go here
        # For now, return empty list (mock)
        return []

    def classify_email(self, subject: str, body: str) -> Optional[str]:
        """
        Classify email as enhancement type.

        Returns:
            Intent type or None
        """
        text = (subject + " " + body).lower()

        if any(word in text for word in ["bug", "error", "crash", "broken"]):
            return "/bug"
        elif any(word in text for word in ["feature", "add", "new"]):
            return "/feature"
        elif any(word in text for word in ["improve", "enhance", "update"]):
            return "/enhancement"
        elif any(word in text for word in ["refactor", "clean", "maintenance"]):
            return "/chore"

        return None

    def has_enhancement_label(self, labels: List[str]) -> bool:
        """Check if email has enhancement-related label."""
        return any(
            label.lower() in [l.lower() for l in labels]
            for label in self.ENHANCEMENT_LABELS
        )


# Standard I/O Pattern compliance
if __name__ == "__main__":
    trigger = EmailTrigger()
    print("SUCCESS: email_trigger module loaded")
    print(f"Labels watched: {trigger.ENHANCEMENT_LABELS}")
    print(f"Keywords: {trigger.KEYWORDS}")

    # Test classification
    tests = [
        ("Bug: Login broken", "Users can't login"),
        ("Feature Request: Dark mode", "Please add dark mode"),
        ("Improve performance", "The app is slow"),
    ]
    for subject, body in tests:
        result = trigger.classify_email(subject, body)
        print(f"'{subject}' -> {result}")
