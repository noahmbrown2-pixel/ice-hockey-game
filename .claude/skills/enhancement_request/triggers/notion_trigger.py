#!/usr/bin/env python3
"""
Notion Trigger - Poll Notion database for enhancement requests.
"""

import os
from dataclasses import dataclass
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta

try:
    import requests
    REQUESTS_AVAILABLE = True
except ImportError:
    REQUESTS_AVAILABLE = False


@dataclass
class NotionRequest:
    """An enhancement request from Notion."""
    page_id: str
    title: str
    description: str
    status: str
    priority: str = "medium"
    created_at: Optional[datetime] = None


class NotionTrigger:
    """
    Poll Notion database for new enhancement requests.
    """

    NOTION_API_URL = "https://api.notion.com/v1"
    NEW_STATUSES = ["new", "requested", "needs planning", "backlog"]
    POLL_INTERVAL = 300  # 5 minutes
    LOOKBACK_HOURS = 24

    def __init__(self, database_id: Optional[str] = None):
        self.database_id = database_id or os.getenv("NOTION_ENHANCEMENT_DB_ID")
        self.token = os.getenv("NOTION_TOKEN")
        self.headers = {
            "Authorization": f"Bearer {self.token}" if self.token else "",
            "Notion-Version": "2022-06-28",
            "Content-Type": "application/json"
        }

    def poll(self) -> List[NotionRequest]:
        """
        Poll for new enhancement requests.

        Returns:
            List of new NotionRequest objects
        """
        if not self.database_id or not self.token:
            return []

        if not REQUESTS_AVAILABLE:
            return []

        try:
            cutoff = datetime.utcnow() - timedelta(hours=self.LOOKBACK_HOURS)

            query = {
                "filter": {
                    "and": [
                        {
                            "property": "Status",
                            "select": {"equals": status}
                        } for status in self.NEW_STATUSES[:1]  # Primary status
                    ]
                },
                "sorts": [{"property": "Created", "direction": "descending"}]
            }

            response = requests.post(
                f"{self.NOTION_API_URL}/databases/{self.database_id}/query",
                headers=self.headers,
                json=query,
                timeout=30
            )

            if response.status_code != 200:
                return []

            data = response.json()
            return self._parse_results(data.get("results", []))

        except Exception:
            return []

    def _parse_results(self, results: List[Dict[str, Any]]) -> List[NotionRequest]:
        """Parse Notion API results into NotionRequest objects."""
        requests_list = []

        for item in results:
            try:
                props = item.get("properties", {})

                # Extract title
                title_prop = props.get("Name", props.get("Title", {}))
                title = ""
                if "title" in title_prop:
                    title = "".join(t.get("plain_text", "") for t in title_prop["title"])

                # Extract description
                desc_prop = props.get("Description", {})
                description = ""
                if "rich_text" in desc_prop:
                    description = "".join(t.get("plain_text", "") for t in desc_prop["rich_text"])

                # Extract status
                status_prop = props.get("Status", {})
                status = status_prop.get("select", {}).get("name", "unknown")

                # Extract priority
                priority_prop = props.get("Priority", {})
                priority = priority_prop.get("select", {}).get("name", "medium")

                requests_list.append(NotionRequest(
                    page_id=item["id"],
                    title=title,
                    description=description,
                    status=status,
                    priority=priority.lower()
                ))

            except Exception:
                continue

        return requests_list

    def mark_processing(self, page_id: str) -> bool:
        """Mark a request as being processed."""
        if not REQUESTS_AVAILABLE or not self.token:
            return False

        try:
            response = requests.patch(
                f"{self.NOTION_API_URL}/pages/{page_id}",
                headers=self.headers,
                json={
                    "properties": {
                        "Status": {"select": {"name": "Planning"}}
                    }
                },
                timeout=30
            )
            return response.status_code == 200
        except Exception:
            return False


# Standard I/O Pattern compliance
if __name__ == "__main__":
    trigger = NotionTrigger()
    print("SUCCESS: notion_trigger module loaded")
    print(f"Database ID configured: {bool(trigger.database_id)}")
    print(f"Token configured: {bool(trigger.token)}")
    print(f"Poll interval: {trigger.POLL_INTERVAL}s")
    print(f"Lookback: {trigger.LOOKBACK_HOURS}h")
    print(f"New statuses: {trigger.NEW_STATUSES}")
