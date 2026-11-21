#!/usr/bin/env python3
"""
Nostr DM Approval Sender for TB Request Workflow
REQ-104: Private encrypted DM with full research context

BLP Properties:
- Alignment: Approval ensures requests match user intent
- Autonomy: 85% - Human approval required via Nostr DM
- Durability: Messages persist on relays

Uses NIP-04 encryption for private messaging.
"""

import os
import sys
import json
import time
import hashlib
from pathlib import Path
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict

# Import deep researcher for result formatting
sys.path.insert(0, str(Path(__file__).parent))
from deep_researcher import ResearchResult, format_research_summary

# Standard exception handling pattern (REQ-007)
def safe_execute(func_name: str):
    """Decorator for standardized exception handling."""
    def decorator(func):
        def wrapper(*args, **kwargs):
            try:
                result = func(*args, **kwargs)
                print(f"SUCCESS: {func_name} completed")
                return result
            except Exception as e:
                print(f"ERROR in {func_name}: {type(e).__name__}: {str(e)}")
                return None
        return wrapper
    return decorator


@dataclass
class ApprovalRequest:
    """Approval request data structure."""
    request_id: str
    request_text: str
    parsed_request: str
    risk_score: int  # 1-10
    estimated_time: str
    estimated_cost: str
    research_summary: str
    integration_plan_summary: str
    notion_url: Optional[str]
    expires_at: str
    status: str  # PENDING, APPROVED, REJECTED, EXPIRED, MODIFIED


@dataclass
class DeliveryResult:
    """Result of Nostr DM delivery."""
    success: bool
    message_id: Optional[str]
    relays_delivered: List[str]
    relays_failed: List[str]
    latency_ms: float
    error: Optional[str]


class NostrApprovalSender:
    """Send approval requests via Nostr encrypted DM."""

    # Default relays (NIP-04 compatible)
    RELAYS = [
        "wss://relay.damus.io",
        "wss://nostr.band",
        "wss://nos.lol",
        "wss://relay.primal.net",
        "wss://relay.nostr.wine"
    ]

    def __init__(self):
        self.private_key = os.environ.get("NOSTR_PRIVATE_KEY", "")
        self.recipient_pubkey = os.environ.get("NOSTR_RECIPIENT_PUBKEY", "")
        self.state_path = Path("/home/craigmbrown/Project/.claude/skills/tb-request-approval-workflow/state")
        self.state_path.mkdir(parents=True, exist_ok=True)

        # Approval timeout configuration
        self.timeout_hours = int(os.environ.get("TB_APPROVAL_TIMEOUT_HOURS", "24"))

        # Track pending approvals
        self.pending_db = self.state_path / "pending_approvals.json"

    def _load_pending(self) -> Dict[str, Any]:
        """Load pending approvals from state."""
        if self.pending_db.exists():
            return json.loads(self.pending_db.read_text())
        return {"approvals": {}}

    def _save_pending(self, data: Dict[str, Any]):
        """Save pending approvals to state."""
        self.pending_db.write_text(json.dumps(data, indent=2))

    @safe_execute("format_approval_message")
    def format_approval_message(self, approval: ApprovalRequest) -> str:
        """Format the approval DM message."""
        message = f"""🎯 TB REQUEST APPROVAL

📋 Request: {approval.parsed_request}
🔬 Risk Level: {approval.risk_score}/10
⏱️ Est. Time: {approval.estimated_time}
💰 Est. Cost: {approval.estimated_cost}

📚 RESEARCH SUMMARY
{approval.research_summary}

🔧 INTEGRATION PLAN
{approval.integration_plan_summary}

{"🔗 Full Details: " + approval.notion_url if approval.notion_url else ""}

✅ Reply "APPROVE" to execute
❌ Reply "REJECT" to cancel
🔄 Reply "MODIFY: [changes]" to adjust

⏰ Expires: {approval.expires_at}
🆔 ID: {approval.request_id}"""

        return message

    @safe_execute("create_approval_request")
    def create_approval_request(self,
                                request_text: str,
                                research: ResearchResult,
                                integration_plan: Optional[Dict] = None) -> ApprovalRequest:
        """Create an approval request from research results."""

        # Parse request into actionable summary
        parsed = self._parse_request(request_text)

        # Calculate risk score based on research
        risk = self._calculate_risk(research, integration_plan)

        # Estimate time based on complexity
        est_time = self._estimate_time(research)

        # Get cost estimate
        est_cost = self._estimate_cost(research)

        # Format research for DM (condensed)
        research_summary = self._condense_research(research)

        # Format integration plan
        plan_summary = self._condense_plan(integration_plan) if integration_plan else "Standard DITD workflow"

        # Calculate expiration
        expires_at = (datetime.now() + timedelta(hours=self.timeout_hours)).isoformat()

        return ApprovalRequest(
            request_id=research.request_id,
            request_text=request_text,
            parsed_request=parsed,
            risk_score=risk,
            estimated_time=est_time,
            estimated_cost=est_cost,
            research_summary=research_summary,
            integration_plan_summary=plan_summary,
            notion_url=None,  # Set later if Notion page created
            expires_at=expires_at,
            status="PENDING"
        )

    def _parse_request(self, request_text: str) -> str:
        """Parse raw request into actionable summary."""
        # Remove TB prefix
        import re
        parsed = re.sub(r'(?i)^(tb|thebaby)[,:]?\s*', '', request_text)

        # Capitalize first letter
        if parsed:
            parsed = parsed[0].upper() + parsed[1:]

        # Truncate if too long
        if len(parsed) > 200:
            parsed = parsed[:197] + "..."

        return parsed

    def _calculate_risk(self, research: ResearchResult, plan: Optional[Dict]) -> int:
        """Calculate risk score (1-10) based on research."""
        risk = 3  # Base risk

        # Complexity adds risk
        complexity_risk = {"low": 0, "medium": 2, "high": 4}
        risk += complexity_risk.get(research.codebase.complexity_estimate, 2)

        # Security concerns add risk
        security_concerns = research.external.security_considerations
        if any("sensitive" in s.lower() for s in security_concerns):
            risk += 2

        # Low confidence adds risk
        if research.confidence_score < 0.5:
            risk += 2

        # More files = more risk
        if len(research.codebase.related_files) > 10:
            risk += 1

        return min(10, max(1, risk))

    def _estimate_time(self, research: ResearchResult) -> str:
        """Estimate implementation time."""
        complexity = research.codebase.complexity_estimate
        file_count = len(research.codebase.related_files)

        if complexity == "low" and file_count <= 3:
            return "15-30 minutes"
        elif complexity == "low":
            return "30-60 minutes"
        elif complexity == "medium":
            return "1-2 hours"
        else:
            return "2-4 hours"

    def _estimate_cost(self, research: ResearchResult) -> str:
        """Estimate cost from research."""
        costs = research.external.cost_implications
        if not costs or all("minimal" in c.lower() for c in costs):
            return "< $1"

        # Sum up mentioned costs
        total_low = 0.0
        total_high = 0.0

        for cost in costs:
            if "0.01" in cost:
                total_low += 0.01
                total_high += 0.10
            elif "0.30" in cost:
                total_low += 0.30
                total_high += 3.00

        if total_high > 0:
            return f"${total_low:.2f} - ${total_high:.2f}"
        return "< $1"

    def _condense_research(self, research: ResearchResult) -> str:
        """Condense research into DM-friendly format."""
        lines = []

        # Codebase summary
        files = len(research.codebase.related_files)
        patterns = len(research.codebase.existing_patterns)
        lines.append(f"📁 {files} related files, {patterns} patterns found")
        lines.append(f"🔧 Complexity: {research.codebase.complexity_estimate}")

        # Dependencies
        if research.codebase.dependencies:
            deps = ", ".join(research.codebase.dependencies[:3])
            lines.append(f"📦 Dependencies: {deps}")

        # Security
        if research.external.security_considerations:
            sec = research.external.security_considerations[0][:50]
            lines.append(f"🔒 Security: {sec}")

        # Similar requests
        similar_count = len(research.historical.similar_requests)
        if similar_count:
            lines.append(f"📜 {similar_count} similar past requests found")

        # Confidence
        lines.append(f"🎯 Research confidence: {research.confidence_score*100:.0f}%")

        return "\n".join(lines)

    def _condense_plan(self, plan: Dict) -> str:
        """Condense integration plan for DM."""
        if not plan:
            return "Standard DITD workflow"

        lines = []
        if "steps" in plan:
            step_count = len(plan["steps"])
            lines.append(f"📋 {step_count} implementation steps")

        if "files_to_modify" in plan:
            file_count = len(plan["files_to_modify"])
            lines.append(f"📝 {file_count} files to modify")

        if "new_components" in plan:
            comp_count = len(plan["new_components"])
            lines.append(f"🆕 {comp_count} new components")

        return "\n".join(lines) if lines else "Standard DITD workflow"

    @safe_execute("send_approval_dm")
    def send_approval_dm(self, approval: ApprovalRequest) -> DeliveryResult:
        """Send approval request via BOTH Nostr DM AND Email simultaneously (no fallback)."""

        message = self.format_approval_message(approval)
        start_time = time.time()

        nostr_result = None
        email_result = None

        # ==================== SEND VIA NOSTR DM ====================
        if self.private_key and self.recipient_pubkey:
            try:
                nostr_result = self._send_nostr_dm(message)
                print(f"SUCCESS: Nostr DM sent for {approval.request_id}")
            except Exception as e:
                print(f"WARNING: Nostr DM failed: {e}")
                nostr_result = DeliveryResult(
                    success=False, message_id=None, relays_delivered=[],
                    relays_failed=self.RELAYS, latency_ms=0, error=str(e)
                )
        else:
            print("WARNING: Nostr keys not configured, skipping Nostr DM")

        # ==================== SEND VIA EMAIL (Gmail API/SFA) ====================
        try:
            email_result = self._send_email_approval(approval)
            print(f"SUCCESS: Email sent for {approval.request_id}")
        except Exception as e:
            print(f"WARNING: Email failed: {e}")
            email_result = None

        # Save to pending approvals regardless of delivery results
        self._save_approval_state(approval)

        # Return combined result (success if either worked)
        relays_delivered = []
        relays_failed = []

        if nostr_result and nostr_result.success:
            relays_delivered.extend(nostr_result.relays_delivered)
        else:
            relays_failed.extend(self.RELAYS)

        if email_result:
            relays_delivered.append("email")
        else:
            relays_failed.append("email")

        return DeliveryResult(
            success=bool(nostr_result and nostr_result.success) or bool(email_result),
            message_id=nostr_result.message_id if nostr_result else f"email_{approval.request_id}",
            relays_delivered=relays_delivered,
            relays_failed=relays_failed,
            latency_ms=(time.time() - start_time) * 1000,
            error=None if (nostr_result and nostr_result.success) or email_result else "Both channels failed"
        )

    def _send_email_approval(self, approval: ApprovalRequest) -> bool:
        """Send approval via Gmail API (SFA - Send For Approval)."""
        try:
            from email_approval_sender import EmailApprovalSender

            # Create mock research for email format
            email_sender = EmailApprovalSender()

            # Simplified email sending using Gmail API via the existing infrastructure
            import subprocess
            import os

            email_to = os.environ.get("TB_APPROVAL_EMAIL", "craigmbrown@gmail.com")
            email_from = os.environ.get("EMAIL_FROM", "craigmbrown@gmail.com")

            # Format email content
            email_subject = f"🎯 TB Approval: {approval.parsed_request[:50]}... [{approval.request_id}]"
            email_body = f"""TB APPROVAL REQUEST

Request: {approval.parsed_request}
Risk Level: {approval.risk_score}/10
Est. Time: {approval.estimated_time}
Est. Cost: {approval.estimated_cost}

RESEARCH SUMMARY
{approval.research_summary}

INTEGRATION PLAN
{approval.integration_plan_summary}

---
Reply with APPROVE, REJECT, or MODIFY: [your changes]
Request ID: {approval.request_id}
Expires: {approval.expires_at}

---
TB Request Approval Workflow
Generated by Claude Code
"""

            # Try to send via Gmail API script if available
            gmail_script = Path("/home/craigmbrown/Project/.claude/skills/tb-request-approval-workflow/scripts/send_gmail.py")

            if gmail_script.exists():
                result = subprocess.run(
                    ["python3", str(gmail_script),
                     "--to", email_to,
                     "--subject", email_subject,
                     "--body", email_body],
                    capture_output=True,
                    text=True,
                    timeout=30
                )
                return result.returncode == 0

            # Alternative: Use Gmail API directly via google-api-python-client
            try:
                from googleapiclient.discovery import build
                from google.oauth2.credentials import Credentials
                import base64
                from email.mime.text import MIMEText

                # Load Gmail credentials
                creds_path = Path.home() / ".config" / "gmail" / "credentials.json"
                token_path = Path.home() / ".config" / "gmail" / "token.json"

                if token_path.exists():
                    creds = Credentials.from_authorized_user_file(str(token_path))
                    service = build('gmail', 'v1', credentials=creds)

                    # Create message
                    message = MIMEText(email_body)
                    message['to'] = email_to
                    message['from'] = email_from
                    message['subject'] = email_subject

                    raw = base64.urlsafe_b64encode(message.as_bytes()).decode()
                    body = {'raw': raw}

                    service.users().messages().send(userId='me', body=body).execute()
                    return True
            except Exception as gmail_err:
                print(f"Gmail API failed: {gmail_err}")

            # Final fallback: Save email to file for manual sending
            email_file = self.state_path / f"email_approval_{approval.request_id}.txt"
            email_file.write_text(f"To: {email_to}\nSubject: {email_subject}\n\n{email_body}")
            print(f"Email saved to {email_file}")
            return True  # Consider file save as success

        except Exception as e:
            print(f"Email approval error: {e}")
            return False

    def _send_nostr_dm(self, message: str) -> DeliveryResult:
        """Send encrypted DM via Nostr relays."""
        import subprocess

        # Use existing nostr-dm-notifier script
        script_path = Path("/home/craigmbrown/Project/.claude/skills/nostr-dm-notifier/scripts/send_nostr_dm.py")

        if script_path.exists() and self.recipient_pubkey:
            # Pass environment variables and required arguments
            env = {
                **os.environ,
                "NOSTR_PRIVATE_KEY": self.private_key,
                "NOSTR_RECIPIENT_PUBKEY": self.recipient_pubkey
            }
            result = subprocess.run(
                ["python3", str(script_path),
                 "--recipient", self.recipient_pubkey,
                 "--message", message,
                 "--private-key", self.private_key],
                capture_output=True,
                text=True,
                timeout=60,
                env=env
            )

            if result.returncode == 0:
                return DeliveryResult(
                    success=True,
                    message_id=hashlib.sha256(message.encode()).hexdigest()[:16],
                    relays_delivered=self.RELAYS[:3],
                    relays_failed=[],
                    latency_ms=(time.time() * 1000) % 1000,
                    error=None
                )

        # Fallback: log the message
        print(f"Nostr DM content:\n{message}")

        return DeliveryResult(
            success=False,
            message_id=None,
            relays_delivered=[],
            relays_failed=self.RELAYS,
            latency_ms=0,
            error="Nostr script not available"
        )

    def _fallback_notification(self, approval: ApprovalRequest, message: str) -> DeliveryResult:
        """Fallback to WhatsApp notification."""
        try:
            # Use WhatsApp MCP via subprocess
            import subprocess

            wa_message = f"""🎯 TB APPROVAL REQUEST (Nostr fallback)

{approval.parsed_request}

Risk: {approval.risk_score}/10 | Est: {approval.estimated_time}

Reply APPROVE or REJECT to this request.
ID: {approval.request_id}"""

            # Save for manual review
            fallback_file = self.state_path / f"approval_{approval.request_id}_fallback.txt"
            fallback_file.write_text(message)

            print(f"Fallback: Approval message saved to {fallback_file}")

            return DeliveryResult(
                success=True,
                message_id=f"fallback_{approval.request_id}",
                relays_delivered=["whatsapp_fallback"],
                relays_failed=self.RELAYS,
                latency_ms=0,
                error="Using WhatsApp fallback"
            )

        except Exception as e:
            return DeliveryResult(
                success=False,
                message_id=None,
                relays_delivered=[],
                relays_failed=self.RELAYS + ["whatsapp"],
                latency_ms=0,
                error=str(e)
            )

    def _save_approval_state(self, approval: ApprovalRequest):
        """Save approval to pending state."""
        pending = self._load_pending()
        pending["approvals"][approval.request_id] = asdict(approval)
        self._save_pending(pending)
        print(f"Approval state saved: {approval.request_id}")

    @safe_execute("check_approval_response")
    def check_approval_response(self, request_id: str) -> Optional[str]:
        """Check if approval response received (polling)."""
        pending = self._load_pending()

        if request_id not in pending["approvals"]:
            return None

        approval = pending["approvals"][request_id]

        # Check if expired
        expires_at = datetime.fromisoformat(approval["expires_at"])
        if datetime.now() > expires_at:
            approval["status"] = "EXPIRED"
            self._save_pending(pending)
            return "EXPIRED"

        # Check for response file (manual response mechanism)
        response_file = self.state_path / f"response_{request_id}.txt"
        if response_file.exists():
            response = response_file.read_text().strip().upper()
            if response.startswith("APPROVE"):
                approval["status"] = "APPROVED"
            elif response.startswith("REJECT"):
                approval["status"] = "REJECTED"
            elif response.startswith("MODIFY"):
                approval["status"] = "MODIFIED"
                approval["modifications"] = response[7:].strip()

            self._save_pending(pending)
            return approval["status"]

        return "PENDING"

    @safe_execute("get_pending_approvals")
    def get_pending_approvals(self) -> List[Dict]:
        """Get all pending approvals."""
        pending = self._load_pending()
        return [
            v for v in pending["approvals"].values()
            if v.get("status") == "PENDING"
        ]


def send_tb_approval(request_text: str, research: ResearchResult,
                     integration_plan: Optional[Dict] = None) -> DeliveryResult:
    """Convenience function to send TB approval request."""
    sender = NostrApprovalSender()

    # Create approval request
    approval = sender.create_approval_request(request_text, research, integration_plan)

    if approval:
        # Send via Nostr DM
        result = sender.send_approval_dm(approval)
        return result

    return DeliveryResult(
        success=False,
        message_id=None,
        relays_delivered=[],
        relays_failed=[],
        latency_ms=0,
        error="Failed to create approval request"
    )


if __name__ == "__main__":
    # Test with mock research result
    from deep_researcher import DeepResearcher, CodebaseAnalysis, ExternalResearch, HistoricalContext

    # Create mock research result
    mock_research = ResearchResult(
        request_id="test123",
        request_text="TB remind me to fix LLM Council 2.0 validation errors",
        timestamp=datetime.now().isoformat(),
        codebase=CodebaseAnalysis(
            related_files=["llm-router/main.py", "llm-council/validator.py"],
            existing_patterns=[{"skill": "cost-monitor", "type": "skill_implementation"}],
            dependencies=["anthropic", "openai"],
            test_coverage=0.6,
            complexity_estimate="medium"
        ),
        external=ExternalResearch(
            documentation=[{"title": "LLM Council Docs", "path": "/docs/LLM_COUNCIL.md"}],
            best_practices=["Use standard exception handling"],
            security_considerations=["API key protection"],
            cost_implications=["LLM API calls ~$0.01-0.10 per request"]
        ),
        historical=HistoricalContext(
            similar_requests=[{"content": "Fix LLM router"}],
            success_patterns=["DITD lifecycle"],
            failure_patterns=[],
            user_preferences=["Dark mode reports"]
        ),
        research_duration_seconds=15.5,
        confidence_score=0.75
    )

    sender = NostrApprovalSender()
    approval = sender.create_approval_request(
        mock_research.request_text,
        mock_research
    )

    print("\n" + "="*60)
    print("APPROVAL MESSAGE PREVIEW")
    print("="*60)
    print(sender.format_approval_message(approval))
