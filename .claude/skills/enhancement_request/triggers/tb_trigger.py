#!/usr/bin/env python3
"""
TB Trigger - Parse TB pendant commands for enhancements.
"""

import re
from dataclasses import dataclass
from typing import Optional, Dict, Any, List
from datetime import datetime


@dataclass
class TBRequest:
    """An enhancement request from TB pendant."""
    command: str
    intent: str
    title: str
    description: str
    priority: str = "medium"
    repository: Optional[str] = None
    raw_input: str = ""


class TBTrigger:
    """
    Parse TB pendant commands for enhancement requests.
    """

    COMMAND_PATTERNS = [
        (r"(?:add|create|implement)\s+(?:a\s+)?(?:new\s+)?feature[:\s]+(.+)", "/feature"),
        (r"fix\s+(?:the\s+)?(?:bug|issue|error)[:\s]+(.+)", "/bug"),
        (r"(?:improve|enhance|update)[:\s]+(.+)", "/enhancement"),
        (r"(?:refactor|clean|maintain)[:\s]+(.+)", "/chore"),
        (r"/(\w+)\s+(.+)", None),  # Direct slash command
    ]

    PRIORITY_KEYWORDS = {
        "high": ["urgent", "critical", "asap", "important", "priority"],
        "low": ["when possible", "nice to have", "eventually", "minor"],
    }

    def __init__(self):
        self.compiled_patterns = [
            (re.compile(pattern, re.IGNORECASE), intent)
            for pattern, intent in self.COMMAND_PATTERNS
        ]

    def parse(self, input_text: str) -> Optional[TBRequest]:
        """
        Parse TB pendant input into a TBRequest.

        Args:
            input_text: Raw input from TB pendant

        Returns:
            TBRequest if recognized, None otherwise
        """
        input_text = input_text.strip()

        for pattern, intent in self.compiled_patterns:
            match = pattern.search(input_text)
            if match:
                if intent is None:
                    # Direct slash command
                    detected_intent = f"/{match.group(1)}"
                    content = match.group(2)
                else:
                    detected_intent = intent
                    content = match.group(1)

                title, description = self._split_title_description(content)

                return TBRequest(
                    command=input_text,
                    intent=detected_intent,
                    title=title,
                    description=description,
                    priority=self._detect_priority(input_text),
                    repository=self._detect_repository(input_text),
                    raw_input=input_text
                )

        return None

    def _split_title_description(self, content: str) -> tuple:
        """Split content into title and description."""
        # Use first sentence as title
        parts = content.split('.', 1)
        title = parts[0].strip()
        description = parts[1].strip() if len(parts) > 1 else ""
        return title, description

    def _detect_priority(self, text: str) -> str:
        """Detect priority from text."""
        text_lower = text.lower()

        for priority, keywords in self.PRIORITY_KEYWORDS.items():
            if any(kw in text_lower for kw in keywords):
                return priority

        return "medium"

    def _detect_repository(self, text: str) -> Optional[str]:
        """Extract repository reference from text."""
        repo_match = re.search(r'(?:repo|repository)[:\s]+(\S+)', text, re.IGNORECASE)
        if repo_match:
            return repo_match.group(1)

        # Check for GitHub-style repo
        gh_match = re.search(r'([a-zA-Z0-9_-]+/[a-zA-Z0-9_-]+)', text)
        if gh_match:
            return gh_match.group(1)

        return None


# Standard I/O Pattern compliance
if __name__ == "__main__":
    trigger = TBTrigger()
    print("SUCCESS: tb_trigger module loaded")
    print(f"Command patterns: {len(trigger.COMMAND_PATTERNS)}")
    print(f"Priority levels: {list(trigger.PRIORITY_KEYWORDS.keys())}")

    # Test parsing
    tests = [
        "add a new feature: dark mode for the dashboard",
        "fix the bug: login fails on mobile",
        "/enhancement add caching to API calls",
        "improve performance of search. It's too slow for large datasets. Urgent!",
    ]
    for test in tests:
        result = trigger.parse(test)
        if result:
            print(f"\nParsed: '{test[:40]}...'")
            print(f"  Intent: {result.intent}, Priority: {result.priority}")
