#!/usr/bin/env python3
"""
TB Build Handler — routes BUILD-typed TB commands to GitHub issue creation.

REQ-TB-BUILD (minimal viable, 2026-05-17):
This is a thin wrapper that satisfies the interface tb_command_daemon._handle_tb_build()
expects. It does NOT (yet) spin up an E2B sandbox or kick off a full DITD pipeline —
that is out of scope for the unblock-the-procurement-command turn. What it DOES:

  1. Build a structured extraction dict from the raw command text.
  2. Create a GitHub issue in craigmbrown/ETAC-System via the existing
     scripts/tb_pipeline_v2/issue_creator.IssueCreator (already tested).
  3. Return the {status, issue_number, request_id, sandbox_config} shape that
     _handle_tb_build expects, so the daemon increments approvals_sent and logs
     `PENDING_APPROVAL:BUILD:<request_id>`.
  4. Append an audit line to state/build_requests.jsonl.

Per feedback_scout_auto_approve.md: TB-typed requests are operator-auto-approved.
The issue is labeled `tb-build-request` + `auto-approved` so the downstream
pipeline (or operator review) can pick it up. No draft state — direct open issue
(per approval-workflow rule 4 + feedback_scout_auto_approve.md).

Per approval-workflow rule 11: issue content must be useful and accurate — no
filler. Title contains the actual command text; body contains source channel,
sender, command_id, and the verbatim utterance.
"""

from __future__ import annotations

import json
import logging
import sys
import time
import uuid
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, Optional

logger = logging.getLogger("tb-build-handler")

PROJECT_ROOT = Path("/home/craigmbrown/Project")
STATE_DIR = Path(__file__).parent.parent / "state"
AUDIT_LOG = STATE_DIR / "build_requests.jsonl"

# Import the existing IssueCreator (handles gh CLI + REST fallback + label-create-on-miss)
sys.path.insert(0, str(PROJECT_ROOT / "scripts"))
try:
    from tb_pipeline_v2.issue_creator import IssueCreator
    ISSUE_CREATOR_AVAILABLE = True
except Exception as e:
    logger.warning(f"IssueCreator import failed: {e}")
    ISSUE_CREATOR_AVAILABLE = False


class TBBuildHandler:
    """Routes BUILD commands to GitHub issue creation. Operator-auto-approved."""

    def __init__(self, repo: str = "craigmbrown/ETAC-System"):
        self.repo = repo
        self.creator = IssueCreator(repo=repo) if ISSUE_CREATOR_AVAILABLE else None

    def handle_build_command(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """Create a tb-build-request GH issue from a BUILD command.

        Args:
            context: dict with keys: type, feature, source, sender,
                     original_message, command_id, target

        Returns:
            dict: {status, issue_number, request_id, sandbox_config, ...}
        """
        feature = context.get("feature") or context.get("original_message") or "(no text)"
        source = context.get("source", "transcript")
        sender = context.get("sender", "unknown")
        cmd_id = context.get("command_id", f"build_{int(time.time())}")
        target = context.get("target", "TheBaby")

        request_id = f"tb-build-{uuid.uuid4().hex[:10]}"

        if not self.creator:
            return self._record(
                {
                    "status": "error",
                    "error": "IssueCreator unavailable (tb_pipeline_v2 import failed)",
                    "request_id": request_id,
                    "command_id": cmd_id,
                    "feature": feature,
                }
            )

        # Minimal extraction dict — IssueCreator builds rich body from these fields
        extraction = {
            "request_type": "BUILD",
            "request_summary": feature[:200],
            "urgency": "TODAY",
            "project": {
                "name": target,
                "description": f"BUILD request originating from {source} ({sender})",
                "scope": feature,
            },
            "tasks": [
                {
                    "title": "Execute build request",
                    "description": feature,
                    "priority": "MEDIUM",
                }
            ],
            "todos": [
                {"item": "Operator review (auto-approved per Scout rule)", "done": True},
                {"item": "Plan generation (DITD pipeline)", "done": False},
                {"item": "Implementation", "done": False},
                {"item": "Test", "done": False},
                {"item": "Deploy + completion email", "done": False},
            ],
        }

        try:
            issue_number = self.creator.create_issue(
                extraction=extraction,
                context_window=feature,
                source_type=source,
                source_id=cmd_id,
                speaker=sender,
                timestamp=datetime.utcnow().isoformat() + "Z",
                command_id=cmd_id,
            )
        except Exception as e:
            logger.exception("create_issue raised")
            return self._record(
                {
                    "status": "error",
                    "error": f"create_issue exception: {e}",
                    "request_id": request_id,
                    "command_id": cmd_id,
                    "feature": feature,
                }
            )

        if not issue_number:
            return self._record(
                {
                    "status": "error",
                    "error": "create_issue returned None (gh CLI failed)",
                    "request_id": request_id,
                    "command_id": cmd_id,
                    "feature": feature,
                }
            )

        # Tag as auto-approved per Scout rule (best-effort label add)
        try:
            self.creator._run_gh(
                [
                    "issue",
                    "edit",
                    str(issue_number),
                    "--repo",
                    self.repo,
                    "--add-label",
                    "tb-build-request,auto-approved",
                ]
            )
        except Exception as e:
            logger.warning(f"Could not add auto-approval labels to #{issue_number}: {e}")

        result = {
            "status": "pending_approval",
            "issue_number": issue_number,
            "request_id": request_id,
            "command_id": cmd_id,
            "feature": feature,
            "sandbox_config": {"tier": "deferred", "reason": "E2B provisioning out-of-scope for v0.1 handler"},
            "issue_url": f"https://github.com/{self.repo}/issues/{issue_number}",
        }
        return self._record(result)

    def _record(self, result: Dict[str, Any]) -> Dict[str, Any]:
        """Append result to audit log + return it."""
        STATE_DIR.mkdir(parents=True, exist_ok=True)
        entry = {"ts": datetime.utcnow().isoformat() + "Z", **result}
        try:
            with AUDIT_LOG.open("a") as f:
                f.write(json.dumps(entry) + "\n")
        except Exception as e:
            logger.warning(f"Could not append to audit log: {e}")
        return result


if __name__ == "__main__":
    # Smoke test
    h = TBBuildHandler()
    out = h.handle_build_command(
        {
            "type": "BUILD",
            "feature": "smoke-test: verify TBBuildHandler creates an issue",
            "source": "cli-smoke-test",
            "sender": "craigmbrown",
            "command_id": "smoke-test-001",
        }
    )
    print(json.dumps(out, indent=2))
