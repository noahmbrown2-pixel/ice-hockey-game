#!/usr/bin/env python3
"""
GitHub Trigger - Watch GitHub issues for enhancement requests.
"""

import subprocess
import json
from dataclasses import dataclass
from typing import List, Optional
from datetime import datetime


@dataclass
class GitHubRequest:
    """An enhancement request from GitHub."""
    issue_number: int
    title: str
    body: str
    labels: List[str]
    author: str
    created_at: Optional[datetime] = None


class GitHubTrigger:
    """
    Watch GitHub issues for enhancement-related labels.
    """

    PLANNING_LABELS = ["needs-planning", "enhancement", "feature-request", "bug"]
    REPO = "craigmbrown/ETAC-System"

    def __init__(self, repo: Optional[str] = None):
        self.repo = repo or self.REPO

    def poll(self) -> List[GitHubRequest]:
        """
        Poll GitHub for issues needing planning.

        Returns:
            List of GitHubRequest objects
        """
        requests_list = []

        for label in self.PLANNING_LABELS:
            issues = self._fetch_issues_by_label(label)
            requests_list.extend(issues)

        # Deduplicate by issue number
        seen = set()
        unique = []
        for req in requests_list:
            if req.issue_number not in seen:
                seen.add(req.issue_number)
                unique.append(req)

        return unique

    def _fetch_issues_by_label(self, label: str) -> List[GitHubRequest]:
        """Fetch issues with a specific label using gh CLI."""
        cmd = [
            "gh", "issue", "list",
            "--repo", self.repo,
            "--label", label,
            "--state", "open",
            "--json", "number,title,body,labels,author",
            "--limit", "20"
        ]

        try:
            result = subprocess.run(
                cmd, capture_output=True, text=True, timeout=30
            )

            if result.returncode != 0:
                return []

            issues = json.loads(result.stdout)
            return [
                GitHubRequest(
                    issue_number=issue["number"],
                    title=issue["title"],
                    body=issue.get("body", ""),
                    labels=[l["name"] for l in issue.get("labels", [])],
                    author=issue.get("author", {}).get("login", "unknown")
                )
                for issue in issues
            ]

        except Exception:
            return []

    def classify_intent(self, labels: List[str], title: str, body: str) -> str:
        """
        Classify issue intent from labels and content.

        Returns:
            Intent type (/feature, /bug, /chore, /enhancement)
        """
        labels_lower = [l.lower() for l in labels]

        if any("bug" in l for l in labels_lower):
            return "/bug"
        elif any("feature" in l for l in labels_lower):
            return "/feature"
        elif any("chore" in l or "maintenance" in l for l in labels_lower):
            return "/chore"
        elif any("enhancement" in l for l in labels_lower):
            return "/enhancement"

        # Fallback to content analysis
        text = (title + " " + body).lower()
        if "bug" in text or "error" in text or "fix" in text:
            return "/bug"
        elif "feature" in text or "add" in text:
            return "/feature"

        return "/enhancement"

    def add_planning_label(self, issue_number: int) -> bool:
        """Add 'planning' label to an issue."""
        cmd = [
            "gh", "issue", "edit",
            str(issue_number),
            "--repo", self.repo,
            "--add-label", "zte-planning"
        ]

        try:
            result = subprocess.run(cmd, capture_output=True, timeout=30)
            return result.returncode == 0
        except Exception:
            return False


# Standard I/O Pattern compliance
if __name__ == "__main__":
    trigger = GitHubTrigger()
    print("SUCCESS: github_trigger module loaded")
    print(f"Repository: {trigger.repo}")
    print(f"Planning labels: {trigger.PLANNING_LABELS}")

    # Test classification
    tests = [
        (["bug"], "Login broken", ""),
        (["feature-request"], "Add dark mode", ""),
        (["enhancement"], "Improve performance", ""),
    ]
    for labels, title, body in tests:
        result = trigger.classify_intent(labels, title, body)
        print(f"Labels {labels} -> {result}")
