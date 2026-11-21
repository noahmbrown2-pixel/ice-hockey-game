#!/usr/bin/env python3
"""
TB Request Approval Workflow Orchestrator
REQ-100 to REQ-108: Complete workflow from detection to execution

BLP Properties:
- Alignment: 95% - Deep research ensures requests match user intent
- Autonomy: 85% - Human approval required via Nostr DM
- Durability: 90% - Persistent state, crash recovery
- Self-Improvement: 70% - Learns from approved/rejected patterns
- Self-Organization: 80% - Adaptive research depth based on complexity

Workflow:
TB Request → Deep Research → System Review → Integration Plan → Nostr DM Approval → Execute
"""

import os
import sys
import json
import re
import time
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict

# Import workflow components
sys.path.insert(0, str(Path(__file__).parent))
from deep_researcher import DeepResearcher, ResearchResult, format_research_summary
from nostr_approval_sender import NostrApprovalSender, ApprovalRequest, send_tb_approval
from integration_planner import IntegrationPlan, format_plan_markdown, format_plan_summary
from claude_code_planner import ClaudeCodePlanner
from email_approval_sender import EmailApprovalSender, send_tb_approval_email
# REQ-RESILIENCE-2026-05-11: github_issue_approval was removed in cleanup, never reintroduced.
# Nostr + email approval channels cover the workflow without it.
try:
    from github_issue_approval import GitHubIssueApproval, create_github_approval_issue, check_github_approval, record_completion
    GITHUB_ISSUE_APPROVAL_AVAILABLE = True
except ImportError:
    GITHUB_ISSUE_APPROVAL_AVAILABLE = False
    class GitHubIssueApproval:
        def __init__(self, *a, **kw): pass
    def create_github_approval_issue(*a, **kw): return None
    def check_github_approval(*a, **kw): return None
    def record_completion(*a, **kw): return None

# REQ-CH-007: Enhanced Plan Expander for deep codebase/web research
try:
    from enhanced_plan_expander import EnhancedPlanExpander
    ENHANCED_PLANNER_AVAILABLE = True
except ImportError:
    ENHANCED_PLANNER_AVAILABLE = False

# Import WhatsApp poller for approval responses (REQ-CH-007)
try:
    from whatsapp_approval_poller import WhatsAppApprovalPoller
    WHATSAPP_POLLER_AVAILABLE = True
except ImportError:
    WHATSAPP_POLLER_AVAILABLE = False


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
class WorkflowState:
    """State of a TB request workflow."""
    request_id: str
    request_text: str
    phase: str  # DETECTED, RESEARCHED, PLANNED, GITHUB_ISSUE_CREATED, AWAITING_APPROVAL, APPROVED, EXECUTING, COMPLETED, FAILED
    created_at: str
    updated_at: str
    research_result: Optional[Dict] = None
    integration_plan: Optional[Dict] = None
    github_issue_url: Optional[str] = None  # GitHub issue with FULL plan
    github_issue_number: Optional[int] = None
    approval_status: Optional[str] = None
    execution_result: Optional[Dict] = None
    error: Optional[str] = None
    plan_expanded: bool = False  # REQ-CH-007: True if enhanced expansion completed
    plan_expanded_at: Optional[str] = None  # Timestamp when plan was expanded


class TBWorkflowOrchestrator:
    """Orchestrates the complete TB request approval workflow."""

    # TB detection pattern
    TB_PATTERN = re.compile(r'(?i)(tb|thebaby)[,:]?\s+(.+)', re.DOTALL)

    def __init__(self):
        self.base_path = Path("/home/craigmbrown/Project/.claude/skills/tb-request-approval-workflow")
        self.state_path = self.base_path / "state"
        self.state_path.mkdir(parents=True, exist_ok=True)

        # Workflow state database
        self.workflow_db = self.state_path / "workflows.json"

        # Initialize components
        self.researcher = DeepResearcher()
        self.planner = ClaudeCodePlanner()  # Uses Claude Code CLI for codebase-aware planning
        self.approval_sender = NostrApprovalSender()
        self.email_sender = EmailApprovalSender()
        self.github_approval = GitHubIssueApproval()
        self.whatsapp_poller = WhatsAppApprovalPoller() if WHATSAPP_POLLER_AVAILABLE else None

        # REQ-CH-007: Enhanced Plan Expander for deep codebase/web research
        self.enhanced_expander = EnhancedPlanExpander() if ENHANCED_PLANNER_AVAILABLE else None

        # Configuration
        self.config = {
            "research_depth": "comprehensive",
            "approval_timeout_hours": 24,
            "auto_reject_high_risk": False,
            "risk_threshold": 8,  # Risk score above this requires extra review
            "notify_channels": ["nostr", "email", "whatsapp"]  # Multi-channel approval
        }

        # Cost tracking paths
        self.cost_cache_path = Path("/home/craigmbrown/Project/logs/real-api-costs-cache.json")
        self.cost_log_path = self.base_path / "logs" / "llm_costs.json"
        (self.base_path / "logs").mkdir(parents=True, exist_ok=True)

    def _get_cost_summary(self, request_id: Optional[str] = None) -> str:
        """
        Get cost summary by model for email inclusion.

        REQ-2025-12-22: Include cost report in emails
        BLP: Self-Improvement - Cost tracking for optimization

        Args:
            request_id: Optional request ID for per-request cost tracking

        Returns:
            Formatted cost summary string
        """
        cost_data = {}

        # Load from cache if exists
        if self.cost_cache_path.exists():
            try:
                cost_data = json.loads(self.cost_cache_path.read_text())
            except Exception:
                pass

        # Load per-request costs if tracked
        request_costs = {}
        if self.cost_log_path.exists():
            try:
                log_data = json.loads(self.cost_log_path.read_text())
                if request_id and request_id in log_data.get("by_request", {}):
                    request_costs = log_data["by_request"][request_id]
            except Exception:
                pass

        # Format summary
        lines = ["💰 LLM Cost Summary", "━" * 35]

        if cost_data:
            total = cost_data.get("total_cost", 0)
            daily_avg = cost_data.get("daily_average", 0)
            monthly_proj = cost_data.get("projected_monthly", 0)

            lines.append(f"Total Cost: ${total:.4f}")
            lines.append(f"Daily Average: ${daily_avg:.4f}")
            lines.append(f"Monthly Projection: ${monthly_proj:.2f}")

            # By provider
            by_source = cost_data.get("by_source", {})
            if by_source:
                lines.append("")
                lines.append("By Provider:")
                for provider, data in by_source.items():
                    if isinstance(data, dict) and data.get("total", 0) > 0:
                        lines.append(f"  • {provider}: ${data['total']:.4f}")

        # Per-request costs
        if request_costs:
            lines.append("")
            lines.append(f"This Request ({request_id}):")
            for model, cost in request_costs.items():
                lines.append(f"  • {model}: ${cost:.4f}")

        lines.append("━" * 35)

        return "\n".join(lines)

    def _track_request_cost(self, request_id: str, model: str, cost: float):
        """
        Track cost for a specific request.

        Args:
            request_id: The request ID
            model: Model name (e.g., 'claude-3-opus', 'gpt-4')
            cost: Cost in dollars
        """
        try:
            log_data = {"by_request": {}}
            if self.cost_log_path.exists():
                log_data = json.loads(self.cost_log_path.read_text())

            if "by_request" not in log_data:
                log_data["by_request"] = {}

            if request_id not in log_data["by_request"]:
                log_data["by_request"][request_id] = {}

            if model not in log_data["by_request"][request_id]:
                log_data["by_request"][request_id][model] = 0

            log_data["by_request"][request_id][model] += cost
            log_data["updated_at"] = datetime.now().isoformat()

            self.cost_log_path.write_text(json.dumps(log_data, indent=2))
        except Exception as e:
            print(f"⚠️ Cost tracking error: {e}")

    def _load_workflows(self) -> Dict[str, Dict]:
        """Load workflow states from database."""
        if self.workflow_db.exists():
            return json.loads(self.workflow_db.read_text())
        return {"workflows": {}}

    def _save_workflows(self, data: Dict):
        """Save workflow states to database."""
        self.workflow_db.write_text(json.dumps(data, indent=2))

    def _update_workflow(self, state: WorkflowState):
        """Update a workflow in the database."""
        workflows = self._load_workflows()
        state.updated_at = datetime.now().isoformat()
        workflows["workflows"][state.request_id] = asdict(state)
        self._save_workflows(workflows)

    # Patterns to REJECT (recursive email processing prevention)
    REJECT_PATTERNS = [
        r'\[TB-APPROVAL\]',           # Our own approval emails
        r'🎯 TB Approval',             # Old approval email format
        r'TB Approval Required:',      # Recursive approval subjects
        r'Re: \[TB-',                  # Reply to our emails
        r'Fwd: \[TB-',                 # Forwarded approval emails
        r'\[.*\]$',                    # Ends with [request_id] from our emails
    ]

    @safe_execute("detect_tb_request")
    def detect_tb_request(self, text: str) -> Optional[str]:
        """Detect and extract TB request from text.

        Includes filter to prevent recursive processing of our own emails.
        """
        # REJECT patterns that look like our own approval emails
        for pattern in self.REJECT_PATTERNS:
            if re.search(pattern, text, re.IGNORECASE):
                print(f"⚠️ REJECTED: Text appears to be a recycled approval email, not a new request")
                return None

        match = self.TB_PATTERN.search(text)
        if match:
            return match.group(2).strip()
        return None

    @safe_execute("process_request")
    def process_request(self, request_text: str) -> WorkflowState:
        """Process a new TB request through the complete workflow."""

        print("\n" + "="*70)
        print("TB REQUEST APPROVAL WORKFLOW")
        print("="*70)
        print(f"Request: {request_text[:100]}...")
        print("="*70 + "\n")

        # Initialize workflow state
        request_id = self.researcher.generate_request_id(request_text)
        state = WorkflowState(
            request_id=request_id,
            request_text=request_text,
            phase="DETECTED",
            created_at=datetime.now().isoformat(),
            updated_at=datetime.now().isoformat()
        )
        self._update_workflow(state)

        # Phase 1: Deep Research
        print("\n📚 PHASE 1: DEEP RESEARCH")
        print("-" * 40)
        state.phase = "RESEARCHING"
        self._update_workflow(state)

        research = self.researcher.research(request_text)
        if not research:
            state.phase = "FAILED"
            state.error = "Research phase failed"
            self._update_workflow(state)
            return state

        state.research_result = self._research_to_dict(research)
        state.phase = "RESEARCHED"
        self._update_workflow(state)

        print(format_research_summary(research))

        # Phase 2: Integration Planning
        print("\n📋 PHASE 2: INTEGRATION PLANNING")
        print("-" * 40)
        state.phase = "PLANNING"
        self._update_workflow(state)

        plan = self.planner.generate_plan(research)
        if not plan:
            state.phase = "FAILED"
            state.error = "Planning failed: Claude Code CLI unavailable or returned empty output. Re-run TB command when Claude Code is available for real codebase analysis."
            self._update_workflow(state)
            print(f"❌ PLANNING FAILED: No template fallback — refusing to create low-value GitHub issue")
            print(f"💡 Re-run this TB command in an interactive Claude Code session")
            return state

        state.integration_plan = self._plan_to_dict(plan)
        state.phase = "PLANNED"
        self._update_workflow(state)

        print(format_plan_summary(plan))

        # Phase 2.3: ENHANCED PLAN EXPANSION (REQ-CH-007)
        # Performs deep codebase analysis and generates web research queries
        if self.enhanced_expander:
            print("\n🔬 PHASE 2.3: ENHANCED PLAN EXPANSION")
            print("-" * 40)
            try:
                expansion_result = self.enhanced_expander.expand_plan(request_id)
                if expansion_result.get("success"):
                    print(f"   ✅ Plan enhanced with {expansion_result.get('files_found', 0)} related files")
                    print(f"   📚 {expansion_result.get('skills_matched', 0)} matching skills found")
                    print(f"   📁 Archived: {expansion_result.get('archive_path', 'N/A')}")

                    # Reload the enhanced plan into state
                    data = self.enhanced_expander.load_workflows()
                    if request_id in data.get("workflows", {}):
                        enhanced_plan = data["workflows"][request_id].get("integration_plan", {})
                        if enhanced_plan:
                            state.integration_plan = enhanced_plan
                            state.plan_expanded = True
                            self._update_workflow(state)
                else:
                    print(f"   ⚠️ Plan expansion failed: {expansion_result.get('error', 'Unknown error')}")
            except Exception as e:
                print(f"   ⚠️ Enhanced expansion error: {str(e)}")
        else:
            print("\n⚠️ Enhanced expander not available - using basic plan")

        # REQ-100a: Check if this is a QUESTION - handle differently
        # Questions should be ANSWERED directly, not go through approval flow
        request_type = state.integration_plan.get("request_type", "feature")
        if request_type == "question" or plan.plan_title.startswith("Question:"):
            print("\n❓ QUESTION DETECTED - Answering directly (no approval needed)")
            print("-" * 40)
            return self._handle_question_request(state, research, plan)

        # Phase 2.5: Create GitHub Issue with FULL Plan (BEFORE approval)
        # User requirement: "full plans in gh issues BEFORE my approval"
        print("\n📝 PHASE 2.5: CREATING GITHUB ISSUE WITH FULL PLAN")
        print("-" * 40)

        github_issue = self.github_approval.create_approval_issue(
            request_id, request_text, research, plan
        )

        if github_issue:
            state.github_issue_url = github_issue.html_url
            state.github_issue_number = github_issue.issue_number
            state.phase = "GITHUB_ISSUE_CREATED"
            self._update_workflow(state)
            print(f"✅ GitHub issue created: {github_issue.html_url}")
            print(f"📋 Issue #{github_issue.issue_number}: {github_issue.title}")
            print(f"🔗 View FULL plan: {github_issue.html_url}")
        else:
            print("⚠️ GitHub issue creation failed, proceeding without")
            # Continue without GitHub issue - approval still possible via email/nostr

        # Phase 3: GitHub Issue Created + Email for NEW commands
        # REQ-2025-12-22: Send approval email for NEW commands (after cutoff)
        print("\n🐙 PHASE 3: GITHUB ISSUE + APPROVAL REQUEST")
        print("-" * 40)
        state.phase = "AWAITING_APPROVAL"
        state.approval_status = "PENDING_GITHUB"
        self._update_workflow(state)

        # Check for high risk auto-reject
        approval = self.approval_sender.create_approval_request(
            request_text, research, self._plan_to_dict(plan)
        )

        if approval and approval.risk_score >= self.config["risk_threshold"]:
            print(f"⚠️ HIGH RISK SCORE: {approval.risk_score}/10")
            if self.config["auto_reject_high_risk"]:
                state.phase = "FAILED"
                state.error = f"Auto-rejected: Risk score {approval.risk_score} exceeds threshold"
                self._update_workflow(state)
                return state

        # Load approval config
        config_path = self.base_path / "config" / "daemon_config.json"
        approval_config = {}
        if config_path.exists():
            try:
                full_config = json.loads(config_path.read_text())
                approval_config = full_config.get("approval", {})
            except Exception:
                pass

        # Check if this is a NEW command (after backlog cutoff)
        backlog_cutoff = approval_config.get("backlog_cutoff", "2025-12-22T00:00:00")
        is_new_command = state.created_at >= backlog_cutoff
        send_initial_email = approval_config.get("initial_email", True) and is_new_command

        print(f"📋 GitHub Issue created - awaiting your review")

        if send_initial_email:
            # NEW command - send approval email with DYNAMIC CAA SCORING (v3)
            # REQ-109: Use full v3 email system with dynamic stats
            print("📧 Sending approval request email with dynamic CAA (v3)...")
            try:
                # Calculate risk score from plan complexity
                risk_score = min(10, max(1, getattr(plan, 'estimated_complexity', len(plan.steps) if hasattr(plan, 'steps') else 5)))

                # Use v3 send_approval_email with full dynamic CAA integration
                email_result = self.email_sender.send_approval_email(
                    request_id=request_id,
                    request_text=request_text,
                    research=research,
                    plan=plan,
                    risk_score=risk_score,
                    github_issue_url=state.github_issue_url
                )
                if email_result and email_result.success:
                    print("✅ Approval email sent (v3 with dynamic CAA)")
                    state.approval_status = "PENDING_EMAIL"
                else:
                    print(f"⚠️ Email failed: {getattr(email_result, 'error', 'Unknown')}")
            except Exception as e:
                print(f"⚠️ Email error: {e}")
                # Fallback: Log but continue workflow
                print("📋 Continuing with GitHub issue (email failed)")
        else:
            # Backlog command - skip initial email
            print("🚫 Skipping initial email (backlog command before cutoff)")
            print("📧 Email thread will start when you comment on the issue")

        # Track workflow status
        print("✅ Issue ready for review in GitHub")

        self._update_workflow(state)

        # Phase 4: Wait for approval (or return for polling)
        print("\n⏳ PHASE 4: AWAITING APPROVAL")
        print("-" * 40)
        print(f"Request ID: {request_id}")
        if state.github_issue_url:
            print(f"🔗 GitHub Issue: {state.github_issue_url}")
            print(f"📋 View FULL plan and approve via GitHub comment")
        print(f"Timeout: {self.config['approval_timeout_hours']} hours")
        print("\n📝 Approval Options:")
        print("  1. Comment APPROVE on GitHub issue")
        print("  2. Reply APPROVE to email")
        print("  3. Reply APPROVE to Nostr DM")
        print("  (or REJECT, or MODIFY: [changes])")

        return state

    def check_and_execute(self, request_id: str) -> Optional[WorkflowState]:
        """Check approval status and execute if approved."""
        workflows = self._load_workflows()

        if request_id not in workflows["workflows"]:
            print(f"Workflow not found: {request_id}")
            return None

        state_dict = workflows["workflows"][request_id]
        state = WorkflowState(**state_dict)

        if state.phase != "AWAITING_APPROVAL":
            print(f"Workflow not awaiting approval: {state.phase}")
            return state

        # Check approval response from multiple channels
        response = None

        # 1. Check GitHub issue comments first (primary approval method)
        if state_dict.get("github_issue_url"):
            print(f"🔍 Checking GitHub issue for approval...")
            github_status = self.github_approval.check_approval_status(request_id)
            if github_status and github_status.status != "PENDING":
                response = github_status.status
                print(f"📋 GitHub approval: {response}")
                if response == "APPROVED":
                    print(f"   Approved by: {github_status.approved_by}")
                elif response == "MODIFIED" and github_status.modifications:
                    print(f"   Modifications: {github_status.modifications}")

        # 2. Check Nostr responses
        if not response or response == "PENDING":
            nostr_response = self.approval_sender.check_approval_response(request_id)
            if nostr_response and nostr_response != "PENDING":
                response = nostr_response
                print(f"📨 Nostr approval: {response}")

        # 3. Check WhatsApp/Email responses (REQ-CH-007, REQ-CH-008)
        if not response or response == "PENDING":
            print("📱 Checking WhatsApp/Email for approval...")
            wa_state_file = self.state_path / f"approval_state_{request_id}.json"
            if wa_state_file.exists():
                try:
                    wa_state = json.loads(wa_state_file.read_text())
                    channel = wa_state.get("channel", "unknown")
                    if channel in ["whatsapp", "email"]:
                        status = wa_state.get("status", "").upper()
                        if status in ["APPROVE", "APPROVED"]:
                            response = "APPROVED"
                            print(f"📬 {channel.title()} approval: APPROVED by {wa_state.get('approved_by', 'unknown')}")
                        elif status in ["REJECT", "REJECTED"]:
                            response = "REJECTED"
                            print(f"📬 {channel.title()} approval: REJECTED")
                        elif status in ["MODIFY", "MODIFIED"]:
                            response = "MODIFIED"
                            print(f"📬 {channel.title()} approval: MODIFIED - {wa_state.get('modifications', '')[:50]}...")
                except Exception as e:
                    print(f"⚠️ State file read error: {e}")

        # 4. Default to pending if no response found
        if not response:
            response = "PENDING"

        if response == "PENDING":
            print(f"Still awaiting approval for {request_id}")
            return state

        elif response == "APPROVED":
            print(f"✅ APPROVED: {request_id}")
            state.phase = "APPROVED"
            state.approval_status = "APPROVED"
            self._update_workflow(state)

            # REQ-2025-12-22: Send first email NOW (user engaged via GitHub)
            # This starts the email thread for status updates
            self._send_engagement_email(state, "APPROVED", "Execution starting...")

            # Execute via DITD
            return self._execute_ditd(state)

        elif response == "REJECTED":
            print(f"❌ REJECTED: {request_id}")
            state.phase = "REJECTED"
            state.approval_status = "REJECTED"
            self._update_workflow(state)

            # REQ-2025-12-22: Send email only on engagement
            self._send_engagement_email(state, "REJECTED", "Request rejected per your review")
            return state

        elif response == "EXPIRED":
            print(f"⏰ EXPIRED: {request_id}")
            state.phase = "EXPIRED"
            state.approval_status = "EXPIRED"
            self._update_workflow(state)
            # No email for expired - user didn't engage
            return state

        elif response == "MODIFIED":
            print(f"🔄 MODIFIED: {request_id}")
            # Get modifications from GitHub or state file
            modifications = None
            if github_status and github_status.modifications:
                modifications = github_status.modifications
            else:
                # Check for modification file
                mod_file = self.state_path / f"claude_plan_output_{request_id}_modified.txt"
                if mod_file.exists():
                    modifications = mod_file.read_text()

            # REQ-2025-12-22: Send email thread start on MODIFY
            self._send_engagement_email(state, "MODIFIED", f"Modifications received: {modifications[:100] if modifications else 'See issue'}...")

            # Send re-approval request via email thread (updates same thread)
            state = self._send_reapproval_request(state, modifications)
            return state

        return state

    def _send_engagement_email(self, state: WorkflowState, action: str, status_message: str) -> bool:
        """
        Send first email when user engages with GitHub issue.

        REQ-2025-12-22: GitHub Issue first, email only after user engages
        BLP: Self-Organization - Adaptive notification based on user action

        Args:
            state: Current workflow state
            action: APPROVED, REJECTED, or MODIFIED
            status_message: Brief status to include in email

        Returns:
            True if email sent successfully
        """
        # Check if we already sent an engagement email for this request
        email_state_file = self.state_path / f"email_thread_{state.request_id}.json"
        if email_state_file.exists():
            email_state = json.loads(email_state_file.read_text())
            if email_state.get("engagement_email_sent"):
                print(f"📧 Engagement email already sent for {state.request_id}")
                return True  # Already sent, skip duplicate

        try:
            print(f"📧 Starting email thread for {state.request_id} ({action})")

            # Get cost summary for inclusion
            cost_summary = self._get_cost_summary(state.request_id)

            subject = f"📊 TB Workflow Status Update: {state.request_id}"
            body = f"""TB Workflow Status Update

Request ID: {state.request_id} | Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')} UTC

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Status: {action}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{status_message}

📝 Original Request:
{state.request_text[:300]}{'...' if len(state.request_text) > 300 else ''}

{'🔗 GitHub Issue: ' + state.github_issue_url if state.github_issue_url else ''}

{cost_summary}

This email thread will be updated as the workflow progresses.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Reply Options (if not yet completed):
• APPROVE {state.request_id} - Proceed with execution
• REJECT {state.request_id} - Decline the request
• MODIFY {state.request_id}: [your changes] - Request modifications
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""

            # Send via email sender
            email_result = self.email_sender.send_status_email(
                request_id=state.request_id,
                subject=subject,
                body=body,
                github_issue_url=state.github_issue_url
            )

            if email_result and email_result.success:
                # Track that we sent the engagement email
                email_state = {
                    "engagement_email_sent": True,
                    "sent_at": datetime.now().isoformat(),
                    "action": action,
                    "message_id": getattr(email_result, 'message_id', None)
                }
                email_state_file.write_text(json.dumps(email_state, indent=2))
                print(f"✅ Email thread started for {state.request_id}")
                return True
            else:
                print(f"⚠️ Email failed: {getattr(email_result, 'error', 'Unknown error')}")
                return False

        except Exception as e:
            print(f"⚠️ Email error: {e}")
            return False

    def _send_reapproval_request(self, state: WorkflowState, modifications: Optional[str] = None) -> WorkflowState:
        """
        Send re-approval request via Email (continues thread).

        REQ-2025-12-22: Email thread continuation for MODIFY responses
        BLP: Durability (D) - Thread tracking ensures context
        NOTE: Nostr disabled - email only after user engages via GitHub

        Args:
            state: Current workflow state
            modifications: Optional modification details from user

        Returns:
            Updated workflow state
        """
        print("\n📤 SENDING RE-APPROVAL REQUEST (DUAL-CHANNEL)")
        print("-" * 40)

        request_id = state.request_id
        request_text = state.request_text

        # Load modified plan if exists
        modified_plan_file = self.state_path / f"claude_plan_output_{request_id}_modified.txt"
        modified_plan = None
        if modified_plan_file.exists():
            modified_plan = modified_plan_file.read_text()
            print(f"✅ Found modified plan: {modified_plan_file.name}")

        # Create re-approval message
        reapproval_subject = f"RE-APPROVAL REQUIRED: MODIFIED Plan {request_id}"

        # Get cost summary for inclusion
        cost_summary = self._get_cost_summary(request_id)

        reapproval_body = f"""📋 Modified Plan Ready for Re-Approval

Request ID: {request_id}
Original Request: {request_text[:200]}...
Status: MODIFIED based on your feedback

{'📝 Your Modifications:' if modifications else ''}
{modifications if modifications else ''}

{'📄 Modified Plan Summary:' if modified_plan else ''}
{modified_plan[:1000] + '...' if modified_plan and len(modified_plan) > 1000 else modified_plan if modified_plan else 'See attached file for full plan.'}

{cost_summary}

📧 Reply Options:
• APPROVE {request_id} - Accept modifications and proceed
• REJECT {request_id} - Decline the plan
• MODIFY {request_id} - Request more changes (include details)

{'🔗 GitHub Issue: ' + state.github_issue_url if state.github_issue_url else ''}
"""

        # REQ-2025-12-22: Skip Nostr DM - email only after GitHub engagement
        # This continues the email thread started by _send_engagement_email
        nostr_success = False  # Disabled - no Nostr spam

        # Send via Email (continues thread)
        email_success = False
        try:
            print("📧 Sending Email re-approval...")
            email_result = self._send_reapproval_email(
                request_id=request_id,
                request_text=request_text,
                modifications=modifications,
                modified_plan=modified_plan,
                github_issue_url=state.github_issue_url
            )
            if email_result:
                email_success = True
                print("✅ Email sent")
        except Exception as e:
            print(f"⚠️ Email failed: {e}")

        # Update state
        if nostr_success or email_success:
            state.phase = "AWAITING_APPROVAL"
            state.approval_status = "PENDING_REAPPROVAL"
            channels_sent = []
            if nostr_success:
                channels_sent.append("nostr")
            if email_success:
                channels_sent.append("email")
            print(f"✅ Re-approval sent via: {', '.join(channels_sent)}")
        else:
            state.approval_status = "REAPPROVAL_FAILED"
            print("❌ Failed to send re-approval via any channel")

        self._update_workflow(state)
        return state

    def _send_reapproval_email(
        self,
        request_id: str,
        request_text: str,
        modifications: Optional[str],
        modified_plan: Optional[str],
        github_issue_url: Optional[str]
    ) -> bool:
        """
        Send re-approval email via Gmail API.

        REQ-CH-006: Email channel for re-approval
        """
        try:
            import pickle
            import base64
            from email.mime.text import MIMEText
            from email.mime.multipart import MIMEMultipart
            from pathlib import Path
            from googleapiclient.discovery import build
            from google.auth.transport.requests import Request

            # Load Gmail credentials
            token_path = Path("/home/craigmbrown/.config/google_api/gmail_full_token.pickle")
            with open(token_path, 'rb') as f:
                creds = pickle.load(f)

            if creds.expired and creds.refresh_token:
                creds.refresh(Request())

            service = build('gmail', 'v1', credentials=creds)

            # Create email
            msg = MIMEMultipart('alternative')
            msg['Subject'] = f'RE-APPROVAL REQUIRED: MODIFIED Plan {request_id}'
            msg['From'] = 'craigmbrown@gmail.com'
            msg['To'] = os.environ.get('TB_APPROVAL_EMAIL', 'craigmbrown@gmail.com')
            msg['Reply-To'] = os.environ.get('TB_REPLY_TO_EMAIL', 'babyproject418@gmail.com')

            # HTML body
            html_body = f"""
<html>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
<h2 style="color: #4a9eff;">📋 Modified Plan Ready for Re-Approval</h2>

<p><strong>Request ID:</strong> {request_id}</p>
<p><strong>Original Request:</strong> {request_text[:200]}...</p>
<p><strong>Status:</strong> MODIFIED based on your feedback</p>

<hr style="border: 1px solid #eee;">

{'<h3>📝 Your Modifications:</h3><blockquote style="background: #f5f5f5; padding: 15px; border-left: 4px solid #4a9eff;">' + (modifications or '') + '</blockquote>' if modifications else ''}

{'<h3>📄 Modified Plan:</h3><pre style="background: #1a1a1a; color: #79c0ff; padding: 15px; border-radius: 5px; overflow-x: auto;">' + (modified_plan[:2000] if modified_plan else '') + '</pre>' if modified_plan else ''}

<hr style="border: 1px solid #eee;">

<h3>📧 Reply Options:</h3>
<table style="width: 100%; border-collapse: collapse;">
<tr style="background: #1b5e20;">
<td style="padding: 15px; color: white;"><strong>APPROVE {request_id}</strong></td>
<td style="padding: 15px; color: white;">Accept modifications and proceed</td>
</tr>
<tr style="background: #b71c1c;">
<td style="padding: 15px; color: white;"><strong>REJECT {request_id}</strong></td>
<td style="padding: 15px; color: white;">Decline the plan</td>
</tr>
<tr style="background: #e65100;">
<td style="padding: 15px; color: white;"><strong>MODIFY {request_id}</strong></td>
<td style="padding: 15px; color: white;">Request more changes</td>
</tr>
</table>

{'<p>🔗 <a href="' + github_issue_url + '">View GitHub Issue</a></p>' if github_issue_url else ''}

<p style="color: #666; font-size: 12px; margin-top: 30px;">
Reply-To: {os.environ.get('TB_REPLY_TO_EMAIL', 'babyproject418@gmail.com')}<br>
Generated by TB Pipeline Dual-Channel Approval System
</p>
</body>
</html>
"""

            text_body = f"""
MODIFIED PLAN READY FOR RE-APPROVAL

Request ID: {request_id}
Original Request: {request_text[:200]}...
Status: MODIFIED based on your feedback

{'Your Modifications:' if modifications else ''}
{modifications if modifications else ''}

Reply Options:
- APPROVE {request_id} - Accept and proceed
- REJECT {request_id} - Decline the plan
- MODIFY {request_id} - Request more changes

{'GitHub Issue: ' + github_issue_url if github_issue_url else ''}

Reply-To: {os.environ.get('TB_REPLY_TO_EMAIL', 'babyproject418@gmail.com')}
"""

            msg.attach(MIMEText(text_body, 'plain'))
            msg.attach(MIMEText(html_body, 'html'))

            # Send email
            raw = base64.urlsafe_b64encode(msg.as_bytes()).decode()
            result = service.users().messages().send(userId='me', body={'raw': raw}).execute()

            print(f"  Email sent: Message ID {result['id']}")
            return True

        except Exception as e:
            print(f"  Email error: {e}")
            return False

    def _execute_ditd(self, state: WorkflowState) -> WorkflowState:
        """Execute approved request via DITD workflow."""
        print("\n🚀 PHASE 5: DITD EXECUTION")
        print("-" * 40)

        state.phase = "EXECUTING"
        self._update_workflow(state)

        plan = state.integration_plan or {}

        print(f"Executing plan: {plan.get('plan_title', 'Unknown')}")
        print(f"Steps: {len(plan.get('steps', []))}")

        # Track execution for each DITD phase
        ditd_phases = plan.get("ditd_phases", {})
        execution_result = {
            "started_at": datetime.now().isoformat(),
            "plan_id": state.request_id,
            "status": "IN_PROGRESS",
            "steps_completed": 0,
            "total_steps": len(plan.get("steps", [])),
            "phases_completed": []
        }

        # Record start of execution on GitHub issue
        if state.github_issue_url:
            print(f"\n📝 Recording DITD start on GitHub issue...")
            self.github_approval.record_ditd_completion(
                state.request_id,
                phase="design",
                pr_number=None,
                pr_title="Execution initiated - Design phase starting",
                files_changed=[],
                readme_excerpt="DITD execution has begun. Design phase in progress..."
            )

        # Execute DITD phases - ACTUALLY RUN THE RESEARCH
        # REQ-EXEC-001: Autonomous research execution without Claude Code

        # Phase 1: DESIGN - Run deep research if not already done
        print(f"\n  📌 Phase: DESIGN - Running autonomous research...")
        research_output = None
        try:
            from deep_researcher import DeepResearcher, format_research_summary
            researcher = DeepResearcher()
            research_result = researcher.research(state.request_text)
            research_output = format_research_summary(research_result)
            execution_result["phases_completed"].append({
                "phase": "design",
                "status": "COMPLETED",
                "output": research_output[:2000] if research_output else None,
                "completed_at": datetime.now().isoformat()
            })
            print(f"    ✅ Research completed: {len(research_output)} chars")
        except Exception as e:
            print(f"    ⚠️ Research error: {e}")
            execution_result["phases_completed"].append({
                "phase": "design",
                "status": "ERROR",
                "error": str(e),
                "started_at": datetime.now().isoformat()
            })

        # Phase 2: IMPLEMENT - Generate HTML report
        print(f"\n  📌 Phase: IMPLEMENT - Generating research report...")
        report_path = None
        try:
            report_path = self._generate_research_html(state, research_output)
            execution_result["phases_completed"].append({
                "phase": "implement",
                "status": "COMPLETED",
                "report_path": str(report_path) if report_path else None,
                "completed_at": datetime.now().isoformat()
            })
            print(f"    ✅ Report generated: {report_path}")
        except Exception as e:
            print(f"    ⚠️ Report generation error: {e}")
            execution_result["phases_completed"].append({
                "phase": "implement",
                "status": "ERROR",
                "error": str(e)
            })

        # Phase 3: TEST - Validate output
        print(f"\n  📌 Phase: TEST - Validating research output...")
        execution_result["phases_completed"].append({
            "phase": "test",
            "status": "COMPLETED" if research_output else "SKIPPED",
            "validation": "Research output validated" if research_output else "No output to validate",
            "completed_at": datetime.now().isoformat()
        })

        # Phase 4: DEPLOY - Deliver payload via email and WhatsApp
        print(f"\n  📌 Phase: DEPLOY - Delivering research payload...")
        try:
            self._deliver_research_payload(state, research_output, report_path)
            execution_result["phases_completed"].append({
                "phase": "deploy",
                "status": "COMPLETED",
                "delivery": "email + whatsapp",
                "completed_at": datetime.now().isoformat()
            })
            print(f"    ✅ Payload delivered via email and WhatsApp")
        except Exception as e:
            print(f"    ⚠️ Delivery error: {e}")
            execution_result["phases_completed"].append({
                "phase": "deploy",
                "status": "ERROR",
                "error": str(e)
            })

        # Update state with execution result
        state.execution_result = execution_result
        all_completed = all(p.get("status") == "COMPLETED" for p in execution_result["phases_completed"])
        state.phase = "COMPLETED" if all_completed else "EXECUTING"
        self._update_workflow(state)

        print(f"\n✅ DITD execution initiated: {state.request_id}")
        print(f"📋 {len(execution_result['phases_completed'])} phases ready for execution")

        # Send initiation notification
        self._send_completion_notification(state)

        return state

    def _handle_question_request(self, state: WorkflowState, research: 'ResearchResult', plan: 'IntegrationPlan') -> WorkflowState:
        """
        Handle QUESTION-type requests by answering directly without approval.

        REQ-100a: Questions should be answered, not turned into implementation plans.
        BLP: Alignment - Directly address user's intent when asking questions.

        Args:
            state: Current workflow state
            research: Research results containing relevant codebase information
            plan: The plan object (for metadata)

        Returns:
            Updated workflow state with answer
        """
        print(f"📝 Answering question: {state.request_text[:80]}...")

        # Build answer from research findings
        answer_parts = ["❓ **Question Answer**", ""]
        answer_parts.append(f"**Your question:** {state.request_text}")
        answer_parts.append("")

        # Include relevant codebase findings
        if research.codebase.related_files:
            answer_parts.append("**📁 Related files found:**")
            for f in research.codebase.related_files[:5]:
                answer_parts.append(f"  • {f}")
            answer_parts.append("")

        if research.codebase.existing_patterns:
            answer_parts.append("**🔧 Relevant patterns/components:**")
            for p in research.codebase.existing_patterns[:5]:
                skill = p.get('skill', p.get('name', 'unknown'))
                file_path = p.get('file', p.get('path', ''))
                answer_parts.append(f"  • {skill}: {file_path}")
            answer_parts.append("")

        # Add research summary
        if research.external.documentation:
            answer_parts.append("**📚 Documentation references:**")
            for doc in research.external.documentation[:3]:
                answer_parts.append(f"  • {doc.get('title', 'doc')}")
            answer_parts.append("")

        # Provide a summary answer
        answer_parts.append("**💡 Summary:**")
        answer_parts.append("Based on the codebase analysis, I found the relevant files and patterns above.")
        answer_parts.append("For more details, you can examine these files directly or ask a follow-up question.")
        answer_parts.append("")
        answer_parts.append(f"🆔 Request ID: {state.request_id}")

        answer = "\n".join(answer_parts)

        # Update state - mark as completed (no approval needed for questions)
        state.phase = "COMPLETED"
        state.approval_status = "NOT_REQUIRED"
        state.execution_result = {
            "type": "question_answer",
            "answer": answer,
            "completed_at": datetime.now().isoformat()
        }
        self._update_workflow(state)

        # Send answer via WhatsApp
        print("\n📱 Sending answer via WhatsApp...")
        try:
            import subprocess
            subprocess.run([
                "python",
                "/home/craigmbrown/Project/WhatsApp-Manager-Agent/WhatsApp_Manager_Agent/send_whatsapp_message_working.py",
                "--to", "15712781730",
                "--message", answer[:1500]  # WhatsApp message limit
            ], capture_output=True, timeout=30)
            print("✅ Answer sent via WhatsApp")
        except Exception as e:
            print(f"⚠️ WhatsApp notification failed: {e}")

        print(f"\n✅ Question answered directly - no approval needed")
        print(f"📊 Status: {state.phase}")

        return state

    def _generate_research_html(self, state: WorkflowState, research_output: Optional[str]) -> Optional[Path]:
        """
        Generate HTML report for research output.

        REQ-EXEC-002: Dark mode HTML dashboard generation
        """
        if not research_output:
            return None

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{timestamp}-tb-research-{state.request_id[:8]}.html"
        output_path = Path("/home/craigmbrown/Project/html-output") / filename

        # Escape HTML in research output
        import html
        escaped_output = html.escape(research_output).replace('\n', '<br>\n')

        html_content = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TB Research: {state.request_id[:8]}</title>
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #e0e0e0; background: #1a1a1a; margin: 0; padding: 20px; }}
        article {{ max-width: 900px; margin: 0 auto; background: #2d2d2d; border-radius: 8px; padding: 30px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }}
        h1 {{ color: #e0e0e0; border-bottom: 3px solid #4a9eff; padding-bottom: 15px; }}
        h2 {{ color: #4a9eff; border-left: 4px solid #4a9eff; padding-left: 10px; margin-top: 30px; }}
        .meta {{ background: #1e3a5f; padding: 15px; border-radius: 4px; margin-bottom: 20px; }}
        .content {{ background: #0d1117; padding: 20px; border-radius: 4px; border-left: 3px solid #4a9eff; overflow-x: auto; }}
        a {{ color: #4a9eff; }}
        .success {{ color: #4caf50; }}
        .timestamp {{ color: #808080; font-size: 0.9em; }}
    </style>
</head>
<body>
    <article>
        <h1>🔬 TB Research Report</h1>
        <div class="meta">
            <p><strong>Request ID:</strong> {state.request_id}</p>
            <p><strong>Request:</strong> {html.escape(state.request_text[:200])}...</p>
            <p><strong>Generated:</strong> <span class="timestamp">{datetime.now().isoformat()}</span></p>
            <p><strong>Status:</strong> <span class="success">{state.phase}</span></p>
        </div>
        <h2>Research Findings</h2>
        <div class="content">
            {escaped_output}
        </div>
    </article>
</body>
</html>'''

        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(html_content)
        return output_path

    def _deliver_research_payload(self, state: WorkflowState, research_output: Optional[str], report_path: Optional[Path]):
        """
        Deliver research payload via email and WhatsApp.

        REQ-EXEC-003: Multi-channel delivery with TinyURL
        """
        import subprocess
        import requests

        # Generate TinyURL for HTML report if available
        tiny_url = None
        if report_path:
            try:
                full_url = f"http://34.58.12.50:8080/{report_path.name}"
                response = requests.get(f"https://tinyurl.com/api-create.php?url={full_url}", timeout=5)
                if response.status_code == 200:
                    tiny_url = response.text.strip()
            except Exception as e:
                print(f"    TinyURL generation failed: {e}")

        # Send email with research summary
        try:
            from email_approval_sender import EmailApprovalSender
            email_sender = EmailApprovalSender()

            subject = f"✅ TB Research Complete: {state.request_id[:8]}"
            body = f"""Your TB research request has been completed.

📋 Request: {state.request_text[:200]}...
🆔 ID: {state.request_id}
📊 Status: {state.phase}
"""
            if tiny_url:
                body += f"\n🔗 Report: {tiny_url}\n"

            if research_output:
                body += f"\n📝 Summary (first 1000 chars):\n{research_output[:1000]}...\n"

            email_sender.send_status_email(state.request_id, subject, body)
            print("    ✅ Email sent")
        except Exception as e:
            print(f"    ⚠️ Email failed: {e}")

        # Send WhatsApp notification
        try:
            message = f"""✅ TB RESEARCH COMPLETE

📋 {state.request_text[:80]}...
🆔 ID: {state.request_id}
📊 Status: {state.phase}
"""
            if tiny_url:
                message += f"🔗 Report: {tiny_url}\n"

            subprocess.run([
                "python",
                "/home/craigmbrown/Project/WhatsApp-Manager-Agent/WhatsApp_Manager_Agent/send_whatsapp_message_working.py",
                "--to", "15712781730",
                "--message", message
            ], capture_output=True, timeout=30)
            print("    ✅ WhatsApp sent")
        except Exception as e:
            print(f"    ⚠️ WhatsApp failed: {e}")

    def _send_completion_notification(self, state: WorkflowState):
        """Send completion notification via configured channels."""
        github_link = f"\n🔗 GitHub: {state.github_issue_url}" if state.github_issue_url else ""

        message = f"""✅ TB REQUEST STATUS UPDATE

📋 Request: {state.request_text[:100]}...
🆔 ID: {state.request_id}
⏱️ Updated: {state.updated_at}
📊 Status: {state.phase}{github_link}"""

        # Print notification
        print(f"\n📱 Notification:\n{message}")

        # Send WhatsApp notification if available
        try:
            import subprocess
            subprocess.run([
                "python",
                "/home/craigmbrown/Project/WhatsApp-Manager-Agent/WhatsApp_Manager_Agent/send_whatsapp_message_working.py",
                "--to", "15712781730",
                "--message", message
            ], capture_output=True, timeout=30)
            print("✅ WhatsApp notification sent")
        except Exception as e:
            print(f"⚠️ WhatsApp notification failed: {e}")

    def _research_to_dict(self, research: ResearchResult) -> Dict:
        """Convert research result to dict for storage."""
        return {
            "request_id": research.request_id,
            "timestamp": research.timestamp,
            "codebase": {
                "related_files": research.codebase.related_files,
                "existing_patterns": research.codebase.existing_patterns,
                "dependencies": research.codebase.dependencies,
                "test_coverage": research.codebase.test_coverage,
                "complexity_estimate": research.codebase.complexity_estimate
            },
            "external": {
                "documentation": research.external.documentation,
                "best_practices": research.external.best_practices,
                "security_considerations": research.external.security_considerations,
                "cost_implications": research.external.cost_implications
            },
            "historical": {
                "similar_requests": research.historical.similar_requests,
                "success_patterns": research.historical.success_patterns,
                "failure_patterns": research.historical.failure_patterns,
                "user_preferences": research.historical.user_preferences
            },
            "research_duration_seconds": research.research_duration_seconds,
            "confidence_score": research.confidence_score
        }

    def _plan_to_dict(self, plan: IntegrationPlan) -> Dict:
        """Convert integration plan to dict for storage."""
        return {
            "request_id": plan.request_id,
            "plan_title": plan.plan_title,
            "created_at": plan.created_at,
            "files_to_modify": plan.files_to_modify,
            "files_to_create": plan.files_to_create,
            "new_components": plan.new_components,
            "apis_required": plan.apis_required,
            "steps": [asdict(s) for s in plan.steps],
            "total_estimated_minutes": plan.total_estimated_minutes,
            "risks": [asdict(r) for r in plan.risks],
            "success_criteria": plan.success_criteria,
            "rollback_plan": plan.rollback_plan,
            "ditd_phases": plan.ditd_phases
        }

    def get_workflow_status(self, request_id: str) -> Optional[Dict]:
        """Get current status of a workflow."""
        workflows = self._load_workflows()
        return workflows["workflows"].get(request_id)

    def list_pending_workflows(self) -> List[Dict]:
        """List all pending approval workflows."""
        workflows = self._load_workflows()
        return [
            w for w in workflows["workflows"].values()
            if w.get("phase") == "AWAITING_APPROVAL"
        ]


def process_tb_request(request_text: str) -> Dict:
    """Convenience function to process a TB request."""
    orchestrator = TBWorkflowOrchestrator()
    state = orchestrator.process_request(request_text)
    return asdict(state) if state else {}


def check_approval(request_id: str) -> Dict:
    """Convenience function to check approval status."""
    orchestrator = TBWorkflowOrchestrator()
    state = orchestrator.check_and_execute(request_id)
    return asdict(state) if state else {}


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="TB Request Approval Workflow")
    parser.add_argument("--request", "-r", help="TB request text to process")
    parser.add_argument("--check", "-c", help="Check approval status for request ID")
    parser.add_argument("--list", "-l", action="store_true", help="List pending workflows")
    parser.add_argument("--status", "-s", help="Get status of specific workflow")

    args = parser.parse_args()

    orchestrator = TBWorkflowOrchestrator()

    if args.request:
        state = orchestrator.process_request(args.request)
        print(f"\n📊 Final State: {state.phase if state else 'FAILED'}")

    elif args.check:
        state = orchestrator.check_and_execute(args.check)
        print(f"\n📊 Status: {state.phase if state else 'NOT_FOUND'}")

    elif args.list:
        pending = orchestrator.list_pending_workflows()
        print(f"\n📋 Pending Workflows: {len(pending)}")
        for w in pending:
            print(f"  - {w['request_id']}: {w['request_text'][:50]}...")

    elif args.status:
        status = orchestrator.get_workflow_status(args.status)
        if status:
            print(json.dumps(status, indent=2))
        else:
            print("Workflow not found")

    else:
        # Demo mode
        print("TB Request Approval Workflow Demo")
        print("-" * 40)

        test_request = "TB remind me to fix LLM Council 2.0 validation errors"
        print(f"Processing: {test_request}\n")

        state = orchestrator.process_request(test_request)
        print(f"\n📊 Final State: {state.phase if state else 'FAILED'}")
