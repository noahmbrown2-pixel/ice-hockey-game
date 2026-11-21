#!/usr/bin/env python3
"""
Process Request - Main entry point for handling enhancement requests.
"""

import sys
from pathlib import Path
from dataclasses import dataclass
from typing import Optional, List, Any
from datetime import datetime

# Add parent to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from triggers.notion_trigger import NotionTrigger, NotionRequest
from triggers.email_trigger import EmailTrigger, EmailRequest
from triggers.tb_trigger import TBTrigger, TBRequest
from triggers.github_trigger import GitHubTrigger, GitHubRequest
from classifier.intent_classifier import IntentClassifier, ClassificationResult


@dataclass
class ProcessedRequest:
    """A processed enhancement request ready for planning."""
    source: str  # notion, email, tb, github
    source_id: str
    title: str
    description: str
    intent: str
    priority: str
    confidence: float
    raw_data: Any
    processed_at: datetime


class RequestProcessor:
    """
    Process enhancement requests from all sources.
    """

    def __init__(self):
        self.notion_trigger = NotionTrigger()
        self.email_trigger = EmailTrigger()
        self.tb_trigger = TBTrigger()
        self.github_trigger = GitHubTrigger()
        self.classifier = IntentClassifier()

    def poll_all_sources(self) -> List[ProcessedRequest]:
        """
        Poll all sources for new requests.

        Returns:
            List of ProcessedRequest objects
        """
        requests = []

        # Poll Notion
        for req in self.notion_trigger.poll():
            processed = self._process_notion(req)
            if processed:
                requests.append(processed)

        # Poll GitHub
        for req in self.github_trigger.poll():
            processed = self._process_github(req)
            if processed:
                requests.append(processed)

        # Email and TB are event-driven, handled separately

        return requests

    def process_tb_input(self, input_text: str) -> Optional[ProcessedRequest]:
        """
        Process input from TB pendant.

        Args:
            input_text: Raw TB pendant input

        Returns:
            ProcessedRequest if recognized
        """
        tb_request = self.tb_trigger.parse(input_text)
        if not tb_request:
            return None

        return ProcessedRequest(
            source="tb",
            source_id=f"tb-{datetime.now().timestamp()}",
            title=tb_request.title,
            description=tb_request.description,
            intent=tb_request.intent,
            priority=tb_request.priority,
            confidence=0.9,  # Direct commands have high confidence
            raw_data=tb_request,
            processed_at=datetime.now()
        )

    def _process_notion(self, req: NotionRequest) -> ProcessedRequest:
        """Process a Notion request."""
        classification = self.classifier.classify(req.title, req.description)

        return ProcessedRequest(
            source="notion",
            source_id=req.page_id,
            title=req.title,
            description=req.description,
            intent=classification.intent.value,
            priority=req.priority or classification.priority,
            confidence=classification.confidence,
            raw_data=req,
            processed_at=datetime.now()
        )

    def _process_github(self, req: GitHubRequest) -> ProcessedRequest:
        """Process a GitHub request."""
        intent = self.github_trigger.classify_intent(
            req.labels, req.title, req.body
        )
        classification = self.classifier.classify(req.title, req.body)

        return ProcessedRequest(
            source="github",
            source_id=str(req.issue_number),
            title=req.title,
            description=req.body,
            intent=intent,
            priority=classification.priority,
            confidence=classification.confidence,
            raw_data=req,
            processed_at=datetime.now()
        )


# Standard I/O Pattern compliance
if __name__ == "__main__":
    processor = RequestProcessor()
    print("SUCCESS: process_request module loaded")
    print(f"Sources available:")
    print(f"  - Notion: {processor.notion_trigger.database_id is not None}")
    print(f"  - GitHub: {processor.github_trigger.repo}")
    print(f"  - TB: Ready")
    print(f"  - Email: Ready")

    # Test TB parsing
    test_input = "add a new feature: dark mode for all pages. Make it toggle automatically based on system settings."
    result = processor.process_tb_input(test_input)
    if result:
        print(f"\nTB test result:")
        print(f"  Title: {result.title}")
        print(f"  Intent: {result.intent}")
        print(f"  Priority: {result.priority}")
