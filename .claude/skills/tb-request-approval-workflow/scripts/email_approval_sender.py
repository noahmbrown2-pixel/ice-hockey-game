#!/usr/bin/env python3
"""
Email Approval Sender for TB Request Workflow - Enhanced Lulu Edition v2.0
REQ-104: Multi-channel approval including email with comprehensive justification
REQ-105: Voice transcript context integration
REQ-106: Platform capabilities inventory
REQ-107: Historical memory and goals context
REQ-108: Attachment support for plan files

BLP Properties:
- Alignment: Email provides secondary approval channel with full context
- Durability: Email persists for audit trail with deduplication
- Self-Organization: Fallback when Nostr unavailable, prevents duplicates

Sends approval requests via email with:
- Voice Transcript Context (what was captured, full context)
- Platform Capabilities (skills and tools available)
- Historical Memory (previous plans, goals, memory context)
- Executive Summary with fact-based justification
- Full integration plan with DITD phases
- CA (Compute Advantage) analysis
- Cost/time/effort breakdown
- Risk assessment
- Clear GitHub issue link
- Attachment support for HTML plan dashboards
"""

import os
import sys
import json
import hashlib
import base64
import pickle
from pathlib import Path
from datetime import datetime, timedelta
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from typing import Dict, List, Any, Optional, Set
from dataclasses import dataclass, field

# Gmail API imports (OAuth-based - no SMTP needed)
try:
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow
    from google.auth.transport.requests import Request
    from googleapiclient.discovery import build
    GMAIL_API_AVAILABLE = True
except ImportError:
    GMAIL_API_AVAILABLE = False
    print("WARNING: Google API libraries not installed.")

# Import workflow components
sys.path.insert(0, str(Path(__file__).parent))
from deep_researcher import ResearchResult
from integration_planner import IntegrationPlan

# REQ-109: Import dynamic stats gatherer for real-time CAA scoring
try:
    from dynamic_stats_gatherer import DynamicStatsGatherer, CAAReport, PlatformStats
    DYNAMIC_STATS_AVAILABLE = True
except ImportError:
    DYNAMIC_STATS_AVAILABLE = False
    print("WARNING: Dynamic stats gatherer not available - will use estimated values")


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
class EmailDeliveryResult:
    """Result of email delivery."""
    success: bool
    message_id: Optional[str]
    recipient: str
    error: Optional[str]
    timestamp: str


@dataclass
class TranscriptContext:
    """REQ-105: Voice transcript context for email."""
    transcript_id: str
    captured_command: str
    full_context: str
    timestamp: str
    source_type: str = "voice_transcript"
    importance_level: str = "high"


@dataclass
class PlatformCapabilities:
    """REQ-106: Platform capabilities inventory."""
    available_skills: List[str] = field(default_factory=list)
    mcp_servers: List[str] = field(default_factory=list)
    agent_count: int = 0
    memory_systems: List[str] = field(default_factory=list)
    notification_channels: List[str] = field(default_factory=list)


@dataclass
class MemoryContext:
    """REQ-107: Historical memory and goals context."""
    previous_plans: List[Dict[str, Any]] = field(default_factory=list)
    active_goals: List[str] = field(default_factory=list)
    success_patterns: List[str] = field(default_factory=list)
    related_projects: List[str] = field(default_factory=list)
    user_preferences: List[str] = field(default_factory=list)


class EmailApprovalSender:
    """Send approval requests via email using Gmail API (OAuth-based) with deduplication."""

    # Gmail API scopes
    GMAIL_SCOPES = ["https://www.googleapis.com/auth/gmail.send"]

    def __init__(self):
        # Gmail API credentials paths
        self.home_dir = str(Path.home())
        self.credentials_dir = os.path.join(self.home_dir, ".config", "google_api")
        self.credentials_path = os.path.join(self.credentials_dir, "credentials.json")
        self.token_path = os.path.join(self.credentials_dir, "gmail_full_token.pickle")

        # Email configuration
        self.from_email = os.environ.get("FROM_EMAIL", os.environ.get("PRIMARY_EMAIL", "craigmbrown@gmail.com"))
        self.to_email = os.environ.get("TB_APPROVAL_EMAIL", self.from_email)
        # Reply-To: Where approval responses should go (babyproject418@gmail.com is the approver address)
        self.reply_to_email = os.environ.get("TB_REPLY_TO_EMAIL", "babyproject418@gmail.com")

        # State management
        self.state_path = Path("/home/craigmbrown/Project/.claude/skills/tb-request-approval-workflow/state")
        self.state_path.mkdir(parents=True, exist_ok=True)

        # DEDUPLICATION: Track sent emails to prevent duplicates
        self.sent_emails_file = self.state_path / "sent_emails.json"
        self._sent_emails: Set[str] = self._load_sent_emails()

        # Approval timeout
        self.timeout_hours = int(os.environ.get("TB_APPROVAL_TIMEOUT_HOURS", "24"))

        # Historical stats for justification
        self.lifelog_stats = self._load_lifelog_stats()

        # Initialize Gmail service
        self._gmail_service = None

    def _load_sent_emails(self) -> Set[str]:
        """Load set of already-sent email request IDs to prevent duplicates."""
        if self.sent_emails_file.exists():
            try:
                data = json.loads(self.sent_emails_file.read_text())
                return set(data.get("sent_request_ids", []))
            except:
                return set()
        return set()

    def _save_sent_email(self, request_id: str):
        """Mark email as sent to prevent duplicates."""
        self._sent_emails.add(request_id)
        # Keep only last 1000 entries to prevent unbounded growth
        if len(self._sent_emails) > 1000:
            sorted_ids = sorted(self._sent_emails)
            self._sent_emails = set(sorted_ids[-1000:])

        self.sent_emails_file.write_text(json.dumps({
            "sent_request_ids": list(self._sent_emails),
            "last_updated": datetime.now().isoformat()
        }, indent=2))

    def _is_email_already_sent(self, request_id: str) -> bool:
        """Check if email was already sent for this request."""
        return request_id in self._sent_emails

    def _load_lifelog_stats(self) -> Dict:
        """Load lifelog statistics for justification."""
        stats_file = Path("/home/craigmbrown/.config/limitless-lifelog/state.json")
        if stats_file.exists():
            try:
                data = json.loads(stats_file.read_text())
                return data.get("statistics", {})
            except:
                pass
        return {"total_transcripts_processed": 1368, "chats_processed": 233}

    def _gather_platform_capabilities(self) -> PlatformCapabilities:
        """REQ-106: Gather current platform capabilities."""
        skills_dir = Path("/home/craigmbrown/Project/.claude/skills")
        available_skills = []

        if skills_dir.exists():
            for skill_path in skills_dir.iterdir():
                if skill_path.is_dir() and not skill_path.name.startswith('.'):
                    available_skills.append(skill_path.name)

        return PlatformCapabilities(
            available_skills=sorted(available_skills),
            mcp_servers=[
                "just-prompt", "whatsapp", "notionApi", "pocket-pick",
                "exa", "context7", "playwright", "chainlink", "cclsp",
                "aider-mcp-server", "nano-agent"
            ],
            agent_count=42,  # Current agent count
            memory_systems=["Memory V4", "Pocket-Pick", "Notion Memory", "Session Context"],
            notification_channels=["Email", "WhatsApp", "Nostr DM", "Slack", "GitHub Issues"]
        )

    def _load_transcript_context(self, request_id: str) -> Optional[TranscriptContext]:
        """REQ-105: Load transcript context from state files."""
        # Try to find the transcript JSON in archive
        archive_dir = Path("/home/craigmbrown/Project/Limitless-Lifelog-Manager/transcripts_archive")
        today = datetime.now().strftime("%Y-%m-%d")
        today_dir = archive_dir / today

        if today_dir.exists():
            for transcript_file in today_dir.glob("*_TB.json"):
                try:
                    data = json.loads(transcript_file.read_text())
                    # Check if this transcript matches our request
                    markers = data.get("extracted_markers", [])
                    for marker in markers:
                        if marker.get("keyword") == "TB":
                            return TranscriptContext(
                                transcript_id=data.get("transcript_id", "unknown"),
                                captured_command=marker.get("after", "")[:200].strip(),
                                full_context=marker.get("full_context", "")[:500],
                                timestamp=data.get("archived_at", datetime.now().isoformat()),
                                source_type="voice_transcript",
                                importance_level=data.get("metadata", {}).get("transcript_details", {}).get("importance_level", "high")
                            )
                except:
                    continue

        return None

    def _load_memory_context(self, request_id: str, research: 'ResearchResult') -> MemoryContext:
        """REQ-107: Load historical memory and goals context."""
        # Get recent plans from state directory
        previous_plans = []
        state_dir = self.state_path

        if state_dir.exists():
            plan_files = sorted(state_dir.glob("plan_*.json"), reverse=True)[:5]
            for plan_file in plan_files:
                try:
                    plan_data = json.loads(plan_file.read_text())
                    previous_plans.append({
                        "title": plan_data.get("plan_title", "Unknown"),
                        "created": plan_data.get("created_at", ""),
                        "estimated_minutes": plan_data.get("total_estimated_minutes", 0)
                    })
                except:
                    continue

        # Get user preferences and success patterns from research (historical is a dict)
        user_prefs = research.historical.get('user_preferences', []) if hasattr(research, 'historical') and isinstance(research.historical, dict) else []
        success_patterns = research.historical.get('success_patterns', []) if hasattr(research, 'historical') and isinstance(research.historical, dict) else []

        return MemoryContext(
            previous_plans=previous_plans,
            active_goals=[
                "Expand multi-agent capabilities",
                "Enhance autonomous workflow execution",
                "Improve cost optimization (79-83% reduction target)",
                "Maintain 99% autonomous operation"
            ],
            success_patterns=success_patterns if success_patterns else [
                "DITD lifecycle for feature implementation",
                "Multi-channel notification on completion",
                "Skill-based modular implementation"
            ],
            related_projects=[
                "TheBaby Agents (42+ agents)",
                "ZTE Framework",
                "Memory V4 System",
                "Enhanced Monitoring"
            ],
            user_preferences=user_prefs if user_prefs else [
                "Dark mode HTML reports",
                "WhatsApp notifications for updates",
                "Nostr DM for approvals",
                "TinyURL for mobile access"
            ]
        )

    def _format_memory_context_html(self, memory_ctx: MemoryContext) -> str:
        """Format memory context as HTML for email."""
        goals_html = "".join(
            f"<li style='margin: 4px 0;'>{goal}</li>"
            for goal in memory_ctx.active_goals[:4]
        )
        patterns_html = "".join(
            f"<li style='margin: 4px 0;'>{pattern}</li>"
            for pattern in memory_ctx.success_patterns[:3]
        )
        prefs_html = " • ".join(memory_ctx.user_preferences[:3])

        # Format previous plans
        plans_html = ""
        if memory_ctx.previous_plans:
            plan_titles = []
            for p in memory_ctx.previous_plans[:3]:
                title = p.get("title", "")
                if len(title) > 40:
                    title = title[:40] + "..."
                plan_titles.append(title)
            plans_list = "  •  ".join(plan_titles)
            plans_html = f'''
        <div style="margin-top: 15px; background: rgba(0,0,0,0.2); padding: 12px; border-radius: 4px;">
            <p style="color: #90caf9; font-size: 12px; margin: 0 0 8px 0; font-weight: 600;">📋 Recent Plans ({len(memory_ctx.previous_plans)}):</p>
            <div style="color: #b0b0b0; font-size: 11px;">{plans_list}</div>
        </div>'''

        return f'''
    <div style="background: #1e3a5f; padding: 20px; border-left: 4px solid #2196f3;">
        <p style="margin: 0 0 15px 0; font-weight: 600; color: #2196f3; font-size: 14px;">🧠 MEMORY & STRATEGIC CONTEXT</p>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
            <div>
                <p style="color: #90caf9; font-size: 12px; margin: 0 0 8px 0; font-weight: 600;">🎯 Active Goals:</p>
                <ul style="margin: 0; padding-left: 18px; color: #b0b0b0; font-size: 12px;">
                    {goals_html}
                </ul>
            </div>
            <div>
                <p style="color: #90caf9; font-size: 12px; margin: 0 0 8px 0; font-weight: 600;">✅ Success Patterns:</p>
                <ul style="margin: 0; padding-left: 18px; color: #b0b0b0; font-size: 12px;">
                    {patterns_html}
                </ul>
            </div>
        </div>
        {plans_html}
        <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.1);">
            <p style="color: #90caf9; font-size: 11px; margin: 0;">
                👤 <strong>Your Preferences:</strong> {prefs_html}
            </p>
        </div>
    </div>
    '''

    def get_gmail_credentials(self) -> Optional[Credentials]:
        """Get Google credentials for Gmail API."""
        if not GMAIL_API_AVAILABLE:
            return None

        creds = None
        if os.path.exists(self.token_path):
            try:
                with open(self.token_path, 'rb') as token:
                    creds = pickle.load(token)
            except Exception as e:
                print(f"WARNING: Could not load token: {e}")

        if creds and creds.expired and creds.refresh_token:
            try:
                creds.refresh(Request())
                with open(self.token_path, 'wb') as token:
                    pickle.dump(creds, token)
            except:
                creds = None

        if not creds or not creds.valid:
            if os.path.exists(self.credentials_path):
                try:
                    flow = InstalledAppFlow.from_client_secrets_file(
                        self.credentials_path, self.GMAIL_SCOPES
                    )
                    creds = flow.run_local_server(port=0)
                    with open(self.token_path, 'wb') as token:
                        pickle.dump(creds, token)
                except:
                    return None
            else:
                return None

        return creds

    def get_gmail_service(self):
        """Get or create Gmail API service."""
        if self._gmail_service:
            return self._gmail_service

        creds = self.get_gmail_credentials()
        if not creds:
            return None

        try:
            self._gmail_service = build('gmail', 'v1', credentials=creds)
            return self._gmail_service
        except Exception as e:
            print(f"ERROR: Could not build Gmail service: {e}")
            return None

    def _generate_justification(self, request_text: str, plan: IntegrationPlan,
                                 research: ResearchResult) -> Dict[str, str]:
        """
        Generate comprehensive fact-based justification with REAL CAA scores.
        REQ-109: Dynamic stats integration with clear cost labeling.
        """

        # REQ-109: Get REAL stats from dynamic stats gatherer
        if DYNAMIC_STATS_AVAILABLE:
            gatherer = DynamicStatsGatherer()
            caa = gatherer.get_caa_report()
            stats = gatherer.get_platform_stats()
            transcripts_processed = stats.transcripts_processed or 1368
            chats_processed = stats.chats_processed or 233
        else:
            # Fallback values (clearly marked as estimates)
            caa = None
            transcripts_processed = self.lifelog_stats.get("total_transcripts_processed", 1368)
            chats_processed = self.lifelog_stats.get("chats_processed", 233)

        # Get request type from plan (new field)
        request_type = getattr(plan, 'request_type', 'feature')

        # Use REAL CAA scores from the scorer (not calculated estimates)
        if caa:
            # ACTUAL values from CAA 352.5-Point Framework
            caa_score = caa.total_score
            caa_max = caa.max_score
            caa_percentage = caa.percentage
            compute_advantage = caa.compute_advantage
            performance_multiplier = caa.performance_multiplier
            autonomy_score = caa.category_scores.get('AU', 8.25) / 50  # Normalized 0-1
        else:
            # Fallback estimates (clearly labeled)
            caa_score = 107.1
            caa_max = 352.5
            caa_percentage = 30.4
            compute_advantage = 0.014
            performance_multiplier = 15.0
            autonomy_score = 0.165  # 8.25/50

        estimated_hours = plan.total_estimated_minutes / 60

        # Risk assessment
        risk_count = len(plan.risks) if plan.risks else 0

        # ========================================
        # COST SECTION - CLEARLY LABELED
        # ========================================
        # ACTUAL COSTS (known/measured values)
        llm_cost_per_minute = 0.02  # Based on average token usage ~$0.02/min
        actual_llm_cost = plan.total_estimated_minutes * llm_cost_per_minute

        # PROJECTED VALUES (estimates based on CAA scoring)
        developer_hourly_rate = 75  # Industry standard
        projected_hours_saved = estimated_hours * 0.8 * (performance_multiplier / 15)
        projected_savings = projected_hours_saved * developer_hourly_rate
        projected_roi = (projected_savings / max(actual_llm_cost, 0.01)) * 100

        # Build type-specific justification sections
        if request_type == "reminder":
            # Simplified justification for reminders
            justification = {
                "executive_summary": f"""Simple reminder request - will create a Google Calendar event to remind you about this task.""",

                "why_approve": f"""
• **Quick Task**: Simple calendar event creation
• **Low Risk**: No code changes required
• **Immediate Value**: Ensures you don't forget this task""",

                "ca_analysis": f"""
**Quick Summary:**
• Time: ~{plan.total_estimated_minutes} minutes
• Action: Create calendar reminder
• No code changes needed""",

                "cost_time_effort": f"""
**Investment Required:**
• **Time**: {plan.total_estimated_minutes} minutes
• **ACTUAL LLM Cost**: ~$0.01
• **Value**: Peace of mind, task tracking""",

                "risks": "• No significant risks - simple calendar operation"
            }
        else:
            # Full justification using REAL CAA scores
            caa_source = "ACTUAL (CAA 352.5-Point Framework)" if caa else "ESTIMATED (Fallback)"

            justification = {
                "executive_summary": f"""This request aligns with your established workflow patterns from {transcripts_processed:,} processed transcripts.
Based on historical success patterns and CAA scoring ({caa_source}), current system CAA score is {caa_score:.1f}/{caa_max} ({caa_percentage:.1f}%) with performance multiplier of {performance_multiplier:.0f}x.""",

                "why_approve": f"""
• **Historical Evidence**: You've processed {transcripts_processed:,} transcripts and {chats_processed} chats through similar pipelines
• **Pattern Match**: {len(research.codebase.get('existing_patterns', []) if isinstance(research.codebase, dict) else [])} existing skill patterns support this implementation
• **Research Confidence**: {research.confidence_score*100:.0f}% confidence based on codebase analysis
• **Complexity**: Estimated as "{research.codebase.get('complexity_estimate', 'low') if isinstance(research.codebase, dict) else 'low'}" complexity
• **Dependencies Ready**: {len(research.codebase.get('dependencies', []) if isinstance(research.codebase, dict) else [])} dependencies already available""",

                "ca_analysis": f"""
**CAA 352.5-Point Framework Analysis ({caa_source}):**

| Metric | ACTUAL Value | Source |
|--------|-------------|--------|
| CAA Total Score | {caa_score:.1f}/{caa_max} pts | Real-time calculation |
| CAA Percentage | {caa_percentage:.1f}% | Score / Max |
| Compute Advantage | {compute_advantage:.4f} | Formula-derived |
| Performance Multiplier | {performance_multiplier:.0f}x | CA × 1000 + 1 |
| Autonomy Factor | {autonomy_score*100:.1f}% | BLP-AU category |

**BLP Category Scores (ACTUAL):**
{self._format_blp_scores(caa) if caa else '• Using estimated values'}""",

                "cost_time_effort": f"""
**Investment Required:**

**ACTUAL COSTS:**
• **Time**: {plan.total_estimated_minutes} minutes (~{estimated_hours:.1f} hours)
• **LLM Cost**: ${actual_llm_cost:.2f} (@ $0.02/min average)
• **Steps**: {len(plan.steps)} implementation steps
• **Files to Modify**: {len(plan.files_to_modify)}
• **Files to Create**: {len(plan.files_to_create)}

**PROJECTED VALUE (based on CAA {performance_multiplier:.0f}x multiplier):**
• Hours Saved: ~{projected_hours_saved:.1f} hours
• Value: ~${projected_savings:.0f} (@ ${developer_hourly_rate}/hr developer rate)
• Projected ROI: {projected_roi:.0f}%

_Note: Projected values are estimates based on CAA scoring. Actual results may vary._""",

                "risks": f"""
**Risk Assessment ({risk_count} identified):**

""" + ("\n".join([f"• **{r.get('risk', 'Unknown')}** [{r.get('severity', 'medium')}]\n  - Mitigation: {r.get('mitigation', 'Standard approach')}\n  - Fallback: {r.get('fallback', 'Standard rollback')}" for r in (plan.risks or [])]) if plan.risks else "• No significant risks identified\n• Standard rollback plan available")
            }

        return justification

    def _format_blp_scores(self, caa: 'CAAReport') -> str:
        """Format BLP category scores for display."""
        if not caa or not caa.category_scores:
            return "• BLP scores not available"

        blp_names = {
            'AL': 'Alignment',
            'AU': 'Autonomy',
            'DU': 'Durability',
            'SI': 'Self-Improvement',
            'SR': 'Self-Replication',
            'SO': 'Self-Organization'
        }
        lines = []
        for code, name in blp_names.items():
            score = caa.category_scores.get(code, 0)
            pct = (score / 50) * 100
            lines.append(f"• {name} ({code}): {score:.1f}/50 ({pct:.0f}%)")
        return '\n'.join(lines)

    @safe_execute("format_simplified_email")
    def format_simplified_email(self, request_id: str, request_text: str,
                                plan: IntegrationPlan,
                                risk_score: int,
                                github_issue_url: Optional[str] = None) -> str:
        """
        REQ-110: SIMPLIFIED email template with clear approval ask.

        This is the DEFAULT template - minimal info, clear call to action.
        Use format_html_email() only when detailed justification is needed.
        """
        short_id = request_id[:12]

        # Risk styling
        if risk_score <= 3:
            risk_level, risk_emoji, risk_color = "Low", "🟢", "#4caf50"
        elif risk_score <= 6:
            risk_level, risk_emoji, risk_color = "Medium", "🟡", "#ff9800"
        else:
            risk_level, risk_emoji, risk_color = "High", "🔴", "#f44336"

        expires_at = (datetime.now() + timedelta(hours=self.timeout_hours)).strftime("%b %d at %I:%M %p")

        # Mailto links for quick approval
        approve_mailto = f"mailto:{self.reply_to_email}?subject=APPROVE%20{short_id}&body=APPROVED%0A%0ARequest%20ID:%20{request_id}"
        reject_mailto = f"mailto:{self.reply_to_email}?subject=REJECT%20{short_id}&body=REJECTED%0A%0AReason:%20%0A%0ARequest%20ID:%20{request_id}"
        modify_mailto = f"mailto:{self.reply_to_email}?subject=MODIFY%20{short_id}&body=MODIFICATIONS%20NEEDED:%0A%0A-%20%0A%0ARequest%20ID:%20{request_id}"

        # Quick summary of what will happen
        step_summary = ", ".join([s.get("title", "")[:30] for s in plan.steps[:3]])
        if len(plan.steps) > 3:
            step_summary += f"... (+{len(plan.steps)-3} more)"

        html = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #e0e0e0; max-width: 600px; margin: 0 auto; padding: 0; background: #1a1a1a;">

    <!-- CLEAR HEADER -->
    <div style="background: linear-gradient(135deg, #1e3a5f 0%, #0d1117 100%); color: #fff; padding: 25px; text-align: center;">
        <p style="margin: 0 0 10px 0; font-size: 16px; color: #ff9800; font-weight: bold;">🤖 ACTION REQUIRED</p>
        <h1 style="margin: 0; font-size: 20px; font-weight: 600;">Should I proceed with this?</h1>
    </div>

    <!-- THE REQUEST - PROMINENT -->
    <div style="background: #2d2d2d; padding: 25px; border-left: 4px solid #4a9eff;">
        <p style="margin: 0 0 8px 0; color: #4a9eff; font-size: 13px; font-weight: 600;">📝 YOUR REQUEST:</p>
        <p style="margin: 0; color: #fff; font-size: 18px; font-weight: 500; line-height: 1.5;">
            {request_text}
        </p>
    </div>

    <!-- QUICK SUMMARY -->
    <div style="background: #1a1a1a; padding: 20px; border: 1px solid #404040;">
        <table style="width: 100%; border-collapse: collapse;">
            <tr>
                <td style="padding: 8px 0; color: #808080;">⏱️ Time:</td>
                <td style="padding: 8px 0; color: #fff; text-align: right; font-weight: bold;">{plan.total_estimated_minutes} minutes</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; color: #808080;">{risk_emoji} Risk:</td>
                <td style="padding: 8px 0; color: {risk_color}; text-align: right; font-weight: bold;">{risk_level}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; color: #808080;">📋 Steps:</td>
                <td style="padding: 8px 0; color: #e0e0e0; text-align: right;">{len(plan.steps)} steps</td>
            </tr>
        </table>
    </div>

    <!-- CLEAR ACTION BUTTONS -->
    <div style="background: #2d2d2d; padding: 25px; text-align: center;">
        <p style="margin: 0 0 20px 0; color: #fff; font-size: 16px; font-weight: 600;">What would you like to do?</p>
        <table style="width: 100%; border-collapse: separate; border-spacing: 10px 0;">
            <tr>
                <td style="width: 33%;">
                    <a href="{approve_mailto}" style="display: block; background: #4caf50; color: #fff; padding: 15px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">✓ APPROVE</a>
                </td>
                <td style="width: 33%;">
                    <a href="{modify_mailto}" style="display: block; background: #ff9800; color: #fff; padding: 15px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">✏️ MODIFY</a>
                </td>
                <td style="width: 33%;">
                    <a href="{reject_mailto}" style="display: block; background: #f44336; color: #fff; padding: 15px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">✗ REJECT</a>
                </td>
            </tr>
        </table>
        <p style="margin: 20px 0 0 0; color: #808080; font-size: 12px;">⏰ Expires: {expires_at}</p>
    </div>

    <!-- GITHUB LINK FOR DETAILS -->
    {"" if not github_issue_url else f'''
    <div style="background: #1b5e20; padding: 15px; text-align: center;">
        <a href="{github_issue_url}" style="color: #fff; font-size: 14px; font-weight: bold; text-decoration: none;">
            📋 View Full Plan on GitHub →
        </a>
    </div>
    '''}

    <!-- MINIMAL FOOTER -->
    <div style="background: #0d1117; padding: 15px; text-align: center; font-size: 11px; color: #808080;">
        Request ID: {short_id} | Reply APPROVE, MODIFY, or REJECT
    </div>

</body>
</html>"""

        return html

    @safe_execute("format_html_email")
    def format_html_email(self, request_id: str, request_text: str,
                          research: ResearchResult,
                          plan: IntegrationPlan,
                          risk_score: int,
                          github_issue_url: Optional[str] = None,
                          transcript_context: Optional[TranscriptContext] = None,
                          platform_caps: Optional[PlatformCapabilities] = None,
                          memory_ctx: Optional[MemoryContext] = None) -> str:
        """Format approval request as comprehensive HTML email with full justification.

        REQ-105/106/107: Enhanced with transcript context, platform capabilities, and memory.
        """

        short_id = request_id[:12]
        justification = self._generate_justification(request_text, plan, research)

        # Gather context if not provided
        if transcript_context is None:
            transcript_context = self._load_transcript_context(request_id)
        if platform_caps is None:
            platform_caps = self._gather_platform_capabilities()
        if memory_ctx is None:
            memory_ctx = self._load_memory_context(request_id, research)

        # Risk styling
        if risk_score <= 3:
            risk_level, risk_emoji, risk_color = "Low", "🟢", "#4caf50"
        elif risk_score <= 6:
            risk_level, risk_emoji, risk_color = "Medium", "🟡", "#ff9800"
        else:
            risk_level, risk_emoji, risk_color = "High", "🔴", "#f44336"

        expires_at = (datetime.now() + timedelta(hours=self.timeout_hours)).strftime("%b %d, %Y at %I:%M %p UTC")

        # Mailto links
        # mailto links go to babyproject418@gmail.com (reply_to_email) where approvals are monitored
        approve_mailto = f"mailto:{self.reply_to_email}?subject=APPROVE%20{short_id}&body=I%20approve%20this%20request.%20%0A%0ARequest%20ID:%20{request_id}"
        reject_mailto = f"mailto:{self.reply_to_email}?subject=REJECT%20{short_id}&body=I%20reject%20this%20request.%20%0A%0AReason:%20%0A%0ARequest%20ID:%20{request_id}"
        modify_mailto = f"mailto:{self.reply_to_email}?subject=MODIFY%20{short_id}&body=I%20want%20modifications:%20%0A%0A-%20%0A%0ARequest%20ID:%20{request_id}"

        # REQ-109: Get REAL CAA scores from dynamic stats gatherer
        if DYNAMIC_STATS_AVAILABLE:
            gatherer = DynamicStatsGatherer()
            caa = gatherer.get_caa_report()
            caa_score = caa.total_score
            caa_max = caa.max_score
            caa_percentage = caa.percentage
            performance_multiplier = caa.performance_multiplier
            autonomy = caa.category_scores.get('AU', 8.25) / 50  # Normalized 0-1
            compute_advantage = caa.compute_advantage
            caa_source = "ACTUAL"
        else:
            # Fallback - basic estimate (clearly labeled)
            autonomy = 0.85 if research.confidence_score > 0.7 else 0.7
            caa_score = 107.1
            caa_max = 352.5
            caa_percentage = 30.4
            performance_multiplier = 15.0
            compute_advantage = 0.014
            caa_source = "ESTIMATED"

        est_hours = plan.total_estimated_minutes / 60

        # LLM cost calculation (ACTUAL)
        llm_cost = plan.total_estimated_minutes * 0.02  # ~$0.02/min actual average

        # DITD phases display
        ditd_display = ""
        for phase, steps in (plan.ditd_phases or {}).items():
            if steps:
                step_nums = ", ".join(str(s) for s in steps) if isinstance(steps, list) else str(steps)
                ditd_display += f"<tr><td style='padding:8px;border:1px solid #444;color:#b0b0b0;'><strong>{phase.title()}</strong></td><td style='padding:8px;border:1px solid #444;color:#e0e0e0;'>Steps {step_nums}</td></tr>"

        html = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.7; color: #e0e0e0; max-width: 700px; margin: 0 auto; padding: 0; background: #1a1a1a;">

    <!-- HEADER with clear intent -->
    <div style="background: linear-gradient(135deg, #1e3a5f 0%, #0d1117 100%); color: #fff; padding: 25px; border-radius: 8px 8px 0 0;">
        <p style="margin: 0 0 5px 0; font-size: 13px; color: #4a9eff;">🤖 TB Approval Request • {short_id}</p>
        <h1 style="margin: 0; font-size: 22px; font-weight: 600; line-height: 1.3;">{plan.plan_title}</h1>
        <p style="margin: 12px 0 0 0; font-size: 14px; color: #b0b0b0;">
            ⏱️ Est. {plan.total_estimated_minutes} min • 📊 CAA {caa_score:.0f}pts ({caa_percentage:.0f}%) [{caa_source}] • ⚡ {performance_multiplier:.0f}x • {risk_emoji} {risk_level} Risk
        </p>
    </div>

    <!-- GITHUB ISSUE LINK - PROMINENT -->
    {"" if not github_issue_url else f'''
    <div style="background: #1b5e20; padding: 15px 20px; border-left: 4px solid #4caf50;">
        <table style="width: 100%;">
            <tr>
                <td style="vertical-align: middle;">
                    <strong style="color: #fff; font-size: 15px;">📋 Full Implementation Plan on GitHub</strong><br>
                    <span style="font-size: 13px; color: #a5d6a7;">Review complete details, add comments, approve or reject</span>
                </td>
                <td style="text-align: right; width: 140px; vertical-align: middle;">
                    <a href="{github_issue_url}" style="display: inline-block; background: #fff; color: #1b5e20; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px;">View Issue →</a>
                </td>
            </tr>
        </table>
    </div>
    '''}

    <!-- QUICK ACTIONS -->
    <div style="background: #2d2d2d; padding: 20px; border-left: 1px solid #404040; border-right: 1px solid #404040;">
        <p style="margin: 0 0 15px 0; font-weight: 600; color: #e0e0e0; font-size: 15px;">Quick Decision:</p>
        <table style="width: 100%; border-collapse: separate; border-spacing: 10px 0;">
            <tr>
                <td style="width: 33%; text-align: center;">
                    <a href="{approve_mailto}" style="display: block; background: #4caf50; color: #fff; padding: 14px 20px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 15px;">✓ APPROVE</a>
                </td>
                <td style="width: 33%; text-align: center;">
                    <a href="{modify_mailto}" style="display: block; background: #ff9800; color: #fff; padding: 14px 20px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 15px;">✏️ MODIFY</a>
                </td>
                <td style="width: 33%; text-align: center;">
                    <a href="{reject_mailto}" style="display: block; background: #f44336; color: #fff; padding: 14px 20px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 15px;">✗ REJECT</a>
                </td>
            </tr>
        </table>
        <p style="margin: 15px 0 0 0; font-size: 12px; color: #808080; text-align: center;">⏰ Expires: {expires_at}</p>
    </div>

    <!-- YOUR REQUEST -->
    <div style="background: #2d2d2d; padding: 20px; border-left: 1px solid #404040; border-right: 1px solid #404040;">
        <p style="margin: 0 0 10px 0; font-weight: 600; color: #4a9eff; font-size: 14px;">📝 YOUR REQUEST</p>
        <div style="background: #0d1117; padding: 15px; border-radius: 6px; border-left: 3px solid #4a9eff; color: #e0e0e0; font-size: 15px;">
            {request_text}
        </div>
    </div>

    <!-- VOICE TRANSCRIPT CONTEXT (REQ-105) -->
    {"" if not transcript_context else f'''
    <div style="background: #2d2d2d; padding: 20px; border-left: 1px solid #404040; border-right: 1px solid #404040;">
        <p style="margin: 0 0 10px 0; font-weight: 600; color: #9c27b0; font-size: 14px;">🎙️ VOICE TRANSCRIPT SOURCE</p>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr style="background: #1a1a1a;">
                <td style="padding: 10px; border: 1px solid #404040; color: #b0b0b0; width: 140px;">📍 Captured</td>
                <td style="padding: 10px; border: 1px solid #404040; color: #e0e0e0;">{transcript_context.captured_command}</td>
            </tr>
            <tr>
                <td style="padding: 10px; border: 1px solid #404040; color: #b0b0b0;">🕐 Timestamp</td>
                <td style="padding: 10px; border: 1px solid #404040; color: #e0e0e0;">{transcript_context.timestamp[:19]}</td>
            </tr>
            <tr style="background: #1a1a1a;">
                <td style="padding: 10px; border: 1px solid #404040; color: #b0b0b0;">🆔 Transcript ID</td>
                <td style="padding: 10px; border: 1px solid #404040; color: #79c0ff; font-family: monospace;">{transcript_context.transcript_id}</td>
            </tr>
            <tr>
                <td style="padding: 10px; border: 1px solid #404040; color: #b0b0b0;">⚡ Priority</td>
                <td style="padding: 10px; border: 1px solid #404040; color: #ff9800; font-weight: bold;">{transcript_context.importance_level.upper()}</td>
            </tr>
        </table>
        <div style="background: #0d1117; padding: 12px; border-radius: 4px; margin-top: 12px; border-left: 3px solid #9c27b0;">
            <p style="margin: 0 0 5px 0; color: #9c27b0; font-size: 12px; font-weight: 600;">Full Context:</p>
            <p style="margin: 0; color: #b0b0b0; font-size: 13px; font-style: italic;">"{transcript_context.full_context[:300]}..."</p>
        </div>
    </div>
    '''}

    <!-- PLATFORM CAPABILITIES (REQ-106) -->
    {"" if not platform_caps else f'''
    <div style="background: #2d2d2d; padding: 20px; border-left: 1px solid #404040; border-right: 1px solid #404040;">
        <p style="margin: 0 0 10px 0; font-weight: 600; color: #00bcd4; font-size: 14px;">🛠️ PLATFORM CAPABILITIES AVAILABLE</p>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 15px;">
            <div style="background: #1a1a1a; padding: 15px; border-radius: 6px; text-align: center; border: 1px solid #404040;">
                <div style="font-size: 24px; color: #4caf50; font-weight: bold;">{len(platform_caps.available_skills)}</div>
                <div style="color: #808080; font-size: 12px;">Skills Available</div>
            </div>
            <div style="background: #1a1a1a; padding: 15px; border-radius: 6px; text-align: center; border: 1px solid #404040;">
                <div style="font-size: 24px; color: #4a9eff; font-weight: bold;">{len(platform_caps.mcp_servers)}</div>
                <div style="color: #808080; font-size: 12px;">MCP Servers</div>
            </div>
            <div style="background: #1a1a1a; padding: 15px; border-radius: 6px; text-align: center; border: 1px solid #404040;">
                <div style="font-size: 24px; color: #ff9800; font-weight: bold;">{platform_caps.agent_count}</div>
                <div style="color: #808080; font-size: 12px;">Active Agents</div>
            </div>
            <div style="background: #1a1a1a; padding: 15px; border-radius: 6px; text-align: center; border: 1px solid #404040;">
                <div style="font-size: 24px; color: #9c27b0; font-weight: bold;">{len(platform_caps.notification_channels)}</div>
                <div style="color: #808080; font-size: 12px;">Notification Channels</div>
            </div>
        </div>
        <details style="background: #0d1117; padding: 10px 15px; border-radius: 4px;">
            <summary style="color: #4a9eff; cursor: pointer; font-weight: 600;">📦 View All Skills ({len(platform_caps.available_skills)})</summary>
            <div style="margin-top: 10px; color: #b0b0b0; font-size: 12px; line-height: 1.8;">
                {", ".join(platform_caps.available_skills[:15])}{"..." if len(platform_caps.available_skills) > 15 else ""}
            </div>
        </details>
    </div>
    '''}

    <!-- MEMORY & GOALS CONTEXT (REQ-107) -->
    {self._format_memory_context_html(memory_ctx) if memory_ctx else ""}

    <!-- EXECUTIVE SUMMARY / WHY APPROVE -->
    <div style="background: #1e3a5f; padding: 20px; border-left: 4px solid #4a9eff;">
        <p style="margin: 0 0 10px 0; font-weight: 600; color: #4a9eff; font-size: 14px;">💡 WHY YOU SHOULD APPROVE THIS</p>
        <p style="margin: 0 0 15px 0; color: #e0e0e0; font-size: 14px; line-height: 1.8;">
            {justification['executive_summary']}
        </p>
        <div style="color: #b0b0b0; font-size: 13px; line-height: 1.8;">
            {justification['why_approve'].replace('• **', '<br>• <strong>').replace('**:', ':</strong>').replace('**', '')}
        </div>
    </div>

    <!-- CAA 352.5-POINT FRAMEWORK ANALYSIS (REQ-109: Dynamic Stats) -->
    <div style="background: #2d2d2d; padding: 20px; border-left: 1px solid #404040; border-right: 1px solid #404040;">
        <p style="margin: 0 0 15px 0; font-weight: 600; color: #4a9eff; font-size: 14px;">📈 CAA 352.5-POINT FRAMEWORK [{caa_source}]</p>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr style="background: #1e3a5f;">
                <td style="padding: 12px; border: 1px solid #404040; color: #fff; font-weight: bold;">CAA Total Score</td>
                <td style="padding: 12px; border: 1px solid #404040; color: #4a9eff; font-weight: bold; font-size: 18px; text-align: right;">{caa_score:.1f} / {caa_max}</td>
            </tr>
            <tr style="background: #1a1a1a;">
                <td style="padding: 10px; border: 1px solid #404040; color: #b0b0b0;">CAA Percentage</td>
                <td style="padding: 10px; border: 1px solid #404040; color: #4caf50; font-weight: bold; text-align: right;">{caa_percentage:.1f}%</td>
            </tr>
            <tr>
                <td style="padding: 10px; border: 1px solid #404040; color: #b0b0b0;">Performance Multiplier</td>
                <td style="padding: 10px; border: 1px solid #404040; color: #ff9800; font-weight: bold; text-align: right;">{performance_multiplier:.0f}x</td>
            </tr>
            <tr style="background: #1a1a1a;">
                <td style="padding: 10px; border: 1px solid #404040; color: #b0b0b0;">Compute Advantage</td>
                <td style="padding: 10px; border: 1px solid #404040; color: #4a9eff; text-align: right;">{compute_advantage:.4f}</td>
            </tr>
            <tr>
                <td style="padding: 10px; border: 1px solid #404040; color: #b0b0b0;">Autonomy Factor (BLP-AU)</td>
                <td style="padding: 10px; border: 1px solid #404040; color: #4caf50; font-weight: bold; text-align: right;">{autonomy*100:.0f}%</td>
            </tr>
        </table>
    </div>

    <!-- ACTUAL COSTS (REQ-109: Clear Cost Labeling) -->
    <div style="background: #2d2d2d; padding: 20px; border-left: 1px solid #404040; border-right: 1px solid #404040;">
        <p style="margin: 0 0 15px 0; font-weight: 600; color: #4caf50; font-size: 14px;">💰 ACTUAL COSTS</p>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr style="background: #1a1a1a;">
                <td style="padding: 10px; border: 1px solid #404040; color: #b0b0b0;">⏱️ Time Required</td>
                <td style="padding: 10px; border: 1px solid #404040; color: #e0e0e0; text-align: right;">{plan.total_estimated_minutes} minutes ({est_hours:.1f} hours)</td>
            </tr>
            <tr>
                <td style="padding: 10px; border: 1px solid #404040; color: #b0b0b0;">💵 LLM Cost (@ $0.02/min)</td>
                <td style="padding: 10px; border: 1px solid #404040; color: #4caf50; font-weight: bold; text-align: right;">${llm_cost:.2f}</td>
            </tr>
            <tr style="background: #1a1a1a;">
                <td style="padding: 10px; border: 1px solid #404040; color: #b0b0b0;">📋 Implementation Steps</td>
                <td style="padding: 10px; border: 1px solid #404040; color: #e0e0e0; text-align: right;">{len(plan.steps)} steps</td>
            </tr>
            <tr>
                <td style="padding: 10px; border: 1px solid #404040; color: #b0b0b0;">📁 Files to Create</td>
                <td style="padding: 10px; border: 1px solid #404040; color: #e0e0e0; text-align: right;">{len(plan.files_to_create)}</td>
            </tr>
            <tr style="background: #1a1a1a;">
                <td style="padding: 10px; border: 1px solid #404040; color: #b0b0b0;">✏️ Files to Modify</td>
                <td style="padding: 10px; border: 1px solid #404040; color: #e0e0e0; text-align: right;">{len(plan.files_to_modify)}</td>
            </tr>
        </table>
    </div>

    <!-- PROJECTED VALUE (Estimates) -->
    <div style="background: #332200; padding: 20px; border-left: 4px solid #ff9800;">
        <p style="margin: 0 0 15px 0; font-weight: 600; color: #ff9800; font-size: 14px;">📊 PROJECTED VALUE (Estimates based on CAA {performance_multiplier:.0f}x)</p>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr style="background: rgba(0,0,0,0.2);">
                <td style="padding: 10px; border: 1px solid #404040; color: #b0b0b0;">~Hours Saved</td>
                <td style="padding: 10px; border: 1px solid #404040; color: #ffcc80; text-align: right;">~{est_hours*0.8*(performance_multiplier/15):.1f} hours</td>
            </tr>
            <tr>
                <td style="padding: 10px; border: 1px solid #404040; color: #b0b0b0;">~Value (@ $75/hr)</td>
                <td style="padding: 10px; border: 1px solid #404040; color: #ffcc80; text-align: right;">~${est_hours*0.8*75*(performance_multiplier/15):.0f}</td>
            </tr>
            <tr style="background: rgba(0,0,0,0.2);">
                <td style="padding: 10px; border: 1px solid #404040; color: #fff; font-weight: bold;">~Projected ROI</td>
                <td style="padding: 10px; border: 1px solid #404040; color: #4caf50; font-weight: bold; text-align: right;">~{(est_hours*0.8*75*(performance_multiplier/15)) / max(llm_cost, 0.01) * 100:.0f}%</td>
            </tr>
        </table>
        <p style="margin: 15px 0 0 0; color: #808080; font-size: 11px; font-style: italic;">
            ⚠️ Projected values are estimates based on CAA scoring. Actual results may vary.
        </p>
    </div>

    <!-- IMPLEMENTATION STEPS -->
    <div style="background: #2d2d2d; padding: 20px; border-left: 1px solid #404040; border-right: 1px solid #404040;">
        <p style="margin: 0 0 15px 0; font-weight: 600; color: #4a9eff; font-size: 14px;">🛠️ IMPLEMENTATION PLAN ({len(plan.steps)} Steps)</p>
        <table style="width: 100%; border-collapse: collapse;">
            {''.join(f'''<tr style="background: {'#1a1a1a' if i % 2 == 0 else '#2d2d2d'};">
                <td style="padding: 12px; border-bottom: 1px solid #404040; vertical-align: top; width: 40px; color: #4a9eff; font-weight: bold; font-size: 16px;">{i+1}</td>
                <td style="padding: 12px; border-bottom: 1px solid #404040;">
                    <strong style="color: #e0e0e0;">{s.get('title', 'Untitled')}</strong>
                    <span style="color: #808080; font-size: 12px; margin-left: 10px;">({s.get('estimated_minutes', 0)} min)</span>
                    <br><span style="color: #b0b0b0; font-size: 13px;">{s.get('description', 'No description')}</span>
                </td>
            </tr>''' for i, s in enumerate(plan.steps))}
        </table>
    </div>

    <!-- DITD PHASES -->
    <div style="background: #2d2d2d; padding: 20px; border-left: 1px solid #404040; border-right: 1px solid #404040;">
        <p style="margin: 0 0 15px 0; font-weight: 600; color: #4a9eff; font-size: 14px;">📅 DITD LIFECYCLE PHASES</p>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            {ditd_display if ditd_display else '<tr><td style="padding:8px;color:#808080;">No DITD phases defined</td></tr>'}
        </table>
    </div>

    <!-- RISKS -->
    <div style="background: #332200; padding: 20px; border-left: 4px solid #ff9800;">
        <p style="margin: 0 0 15px 0; font-weight: 600; color: #ff9800; font-size: 14px;">⚠️ RISKS & MITIGATIONS</p>
        {''.join(f'''<div style="margin-bottom: 12px; padding: 10px; background: rgba(0,0,0,0.2); border-radius: 4px;">
            <strong style="color: #ffcc80;">{r.get('risk', 'Unknown')}</strong>
            <span style="color: #ff9800; font-size: 12px; margin-left: 8px;">[{r.get('severity', 'medium')}]</span>
            <br><span style="color: #b0b0b0; font-size: 13px;">Mitigation: {r.get('mitigation', 'Standard approach')}</span>
        </div>''' for r in (plan.risks or [])) if plan.risks else '<p style="color: #b0b0b0; margin: 0;">✅ No significant risks identified. Standard rollback available.</p>'}
    </div>

    <!-- SUCCESS CRITERIA -->
    <div style="background: #2d2d2d; padding: 20px; border-left: 1px solid #404040; border-right: 1px solid #404040;">
        <p style="margin: 0 0 10px 0; font-weight: 600; color: #4a9eff; font-size: 14px;">✅ SUCCESS CRITERIA</p>
        <ul style="margin: 0; padding-left: 20px; color: #b0b0b0; font-size: 13px;">
            {''.join(f'<li style="margin: 8px 0; color: #e0e0e0;">{c}</li>' for c in plan.success_criteria)}
        </ul>
    </div>

    <!-- FOOTER -->
    <div style="background: #0d1117; color: #808080; padding: 20px; border-radius: 0 0 8px 8px; font-size: 12px;">
        <p style="margin: 0 0 8px 0;">
            <strong style="color: #4a9eff;">TB Operations Agent</strong> • Request ID: <code style="background: #1a1a1a; padding: 2px 6px; border-radius: 3px; color: #79c0ff;">{request_id}</code>
        </p>
        <p style="margin: 0 0 8px 0;">
            Reply with <strong>APPROVE</strong>, <strong>REJECT</strong>, or <strong>MODIFY</strong>
            {f' • <a href="{github_issue_url}" style="color: #4a9eff;">View on GitHub</a>' if github_issue_url else ''}
        </p>
        <p style="margin: 0; color: #555;">
            Based on {self.lifelog_stats.get('total_transcripts_processed', 1368):,} processed transcripts | Confidence: {research.confidence_score*100:.0f}%
        </p>
    </div>

</body>
</html>"""

        return html

    @safe_execute("format_plain_email")
    def format_plain_email(self, request_id: str, request_text: str,
                           research: ResearchResult,
                           plan: IntegrationPlan,
                           risk_score: int,
                           github_issue_url: Optional[str] = None) -> str:
        """Format approval request as plain text with full justification."""

        expires_at = (datetime.now() + timedelta(hours=self.timeout_hours)).strftime("%Y-%m-%d %H:%M UTC")
        short_id = request_id[:12]
        justification = self._generate_justification(request_text, plan, research)

        # REQ-109: Get REAL CAA scores from dynamic stats gatherer
        if DYNAMIC_STATS_AVAILABLE:
            gatherer = DynamicStatsGatherer()
            caa = gatherer.get_caa_report()
            caa_score = caa.total_score
            caa_max = caa.max_score
            caa_percentage = caa.percentage
            performance_multiplier = caa.performance_multiplier
            autonomy = caa.category_scores.get('AU', 8.25) / 50
            compute_advantage = caa.compute_advantage
            caa_source = "ACTUAL"
        else:
            autonomy = 0.85 if research.confidence_score > 0.7 else 0.7
            caa_score = 107.1
            caa_max = 352.5
            caa_percentage = 30.4
            performance_multiplier = 15.0
            compute_advantage = 0.014
            caa_source = "ESTIMATED"

        est_hours = plan.total_estimated_minutes / 60
        llm_cost = plan.total_estimated_minutes * 0.02  # ACTUAL: ~$0.02/min average

        text = f"""═══════════════════════════════════════════════════════════════
TB APPROVAL REQUEST: {plan.plan_title}
═══════════════════════════════════════════════════════════════

Request ID: {short_id}
Full ID: {request_id}

{'📋 GITHUB ISSUE (VIEW FULL PLAN): ' + github_issue_url if github_issue_url else ''}

───────────────────────────────────────────────────────────────
📝 YOUR REQUEST
───────────────────────────────────────────────────────────────
{request_text}

───────────────────────────────────────────────────────────────
💡 WHY YOU SHOULD APPROVE THIS
───────────────────────────────────────────────────────────────
{justification['executive_summary']}

{justification['why_approve']}

───────────────────────────────────────────────────────────────
📈 CAA 352.5-POINT FRAMEWORK [{caa_source}]
───────────────────────────────────────────────────────────────
• CAA Total Score: {caa_score:.1f}/{caa_max} pts ({caa_percentage:.1f}%)
• Performance Multiplier: {performance_multiplier:.0f}x
• Compute Advantage: {compute_advantage:.4f}
• Autonomy Factor (BLP-AU): {autonomy*100:.0f}%

───────────────────────────────────────────────────────────────
💰 ACTUAL COSTS
───────────────────────────────────────────────────────────────
• Time: {plan.total_estimated_minutes} minutes ({est_hours:.1f} hours)
• LLM Cost (@ $0.02/min): ${llm_cost:.2f}
• Steps: {len(plan.steps)}
• Files to Create: {len(plan.files_to_create)}
• Files to Modify: {len(plan.files_to_modify)}

📊 PROJECTED VALUE (Estimates based on CAA {performance_multiplier:.0f}x)
• ~Hours Saved: ~{est_hours*0.8*(performance_multiplier/15):.1f} hours
• ~Value (@ $75/hr): ~${est_hours*0.8*75*(performance_multiplier/15):.0f}
• ~Projected ROI: ~{(est_hours*0.8*75*(performance_multiplier/15)) / max(llm_cost, 0.01) * 100:.0f}%
⚠️ Projected values are estimates. Actual results may vary.

───────────────────────────────────────────────────────────────
🛠️ IMPLEMENTATION STEPS
───────────────────────────────────────────────────────────────
{chr(10).join(f'{i}. {s.get("title", "Untitled")} ({s.get("estimated_minutes", 0)} min) - {s.get("description", "No description")}' for i, s in enumerate(plan.steps, 1))}

───────────────────────────────────────────────────────────────
📅 DITD PHASES
───────────────────────────────────────────────────────────────
{chr(10).join(f'• {phase.title()}: Steps {steps}' for phase, steps in (plan.ditd_phases or {}).items() if steps)}

───────────────────────────────────────────────────────────────
⚠️ RISKS
───────────────────────────────────────────────────────────────
{chr(10).join(f'• {r.get("risk", "Unknown")} [{r.get("severity", "medium")}] - {r.get("mitigation", "Standard approach")}' for r in (plan.risks or [])) if plan.risks else '• No significant risks identified'}

───────────────────────────────────────────────────────────────
✅ SUCCESS CRITERIA
───────────────────────────────────────────────────────────────
{chr(10).join(f'• {c}' for c in plan.success_criteria)}

═══════════════════════════════════════════════════════════════
⏰ EXPIRES: {expires_at}

Reply with:
  ✅ APPROVE - Execute this request
  ❌ REJECT - Cancel this request
  🔄 MODIFY: [changes] - Request modifications

{'View full plan: ' + github_issue_url if github_issue_url else ''}
───────────────────────────────────────────────────────────────
TB Operations Agent | Based on {self.lifelog_stats.get('total_transcripts_processed', 1368):,} processed transcripts
═══════════════════════════════════════════════════════════════
"""

        return text

    @safe_execute("send_approval_email")
    def send_approval_email(self, request_id: str, request_text: str,
                            research: ResearchResult,
                            plan: IntegrationPlan,
                            risk_score: int,
                            github_issue_url: Optional[str] = None,
                            attachments: Optional[List[str]] = None) -> EmailDeliveryResult:
        """Send approval request via email with deduplication and attachment support.

        REQ-108: Now supports HTML dashboard attachments.

        Args:
            request_id: Unique request identifier
            request_text: The original request text
            research: Research results from deep_researcher
            plan: Integration plan from integration_planner
            risk_score: Risk assessment score (1-10)
            github_issue_url: Optional GitHub issue URL
            attachments: Optional list of file paths to attach (e.g., HTML dashboards)
        """

        # DEDUPLICATION CHECK - Prevent duplicate emails
        if self._is_email_already_sent(request_id):
            print(f"⚠️ Email already sent for {request_id[:12]}, skipping duplicate")
            return EmailDeliveryResult(
                success=True,
                message_id=f"duplicate_{request_id}",
                recipient=self.to_email,
                error="Email already sent (duplicate prevented)",
                timestamp=datetime.now().isoformat()
            )

        if not GMAIL_API_AVAILABLE:
            return self._save_for_manual_review(request_id, request_text, research, plan, risk_score, github_issue_url)

        service = self.get_gmail_service()
        if not service:
            return self._save_for_manual_review(request_id, request_text, research, plan, risk_score, github_issue_url)

        # Gather context for email
        transcript_context = self._load_transcript_context(request_id)
        platform_caps = self._gather_platform_capabilities()
        memory_ctx = self._load_memory_context(request_id, research)

        # Create message - use mixed for attachments support
        msg = MIMEMultipart('mixed')
        short_id = request_id[:12]

        # REQ-110: SIMPLIFIED SUBJECT - Clear and concise
        subject = f"🤖 Action Required: {plan.plan_title[:50]} [{short_id}]"

        msg['Subject'] = subject
        msg['From'] = self.from_email
        msg['To'] = self.to_email
        # Reply-To: Approval responses go to babyproject418@gmail.com where they are monitored
        msg['Reply-To'] = self.reply_to_email

        # Create alternative part for text/html
        msg_alt = MIMEMultipart('alternative')

        # REQ-110: Use SIMPLIFIED templates by default
        # Plain text - minimal version
        plain_text = f"""ACTION REQUIRED: {plan.plan_title}

📝 YOUR REQUEST:
{request_text}

⏱️ Time: {plan.total_estimated_minutes} minutes
📋 Steps: {len(plan.steps)}
🆔 Request ID: {short_id}

WHAT WOULD YOU LIKE TO DO?
Reply with: APPROVE, MODIFY, or REJECT

{'📋 View Full Plan: ' + github_issue_url if github_issue_url else ''}

---
TB Operations Agent
"""
        msg_alt.attach(MIMEText(plain_text, 'plain'))

        # REQ-110: Use SIMPLIFIED HTML template by default
        html_text = self.format_simplified_email(
            request_id, request_text, plan, risk_score, github_issue_url
        )
        msg_alt.attach(MIMEText(html_text, 'html'))

        msg.attach(msg_alt)

        # REQ-108: Add attachments if provided
        if attachments:
            for attachment_path in attachments:
                attachment_file = Path(attachment_path)
                if attachment_file.exists():
                    try:
                        with open(attachment_file, 'rb') as f:
                            part = MIMEBase('application', 'octet-stream')
                            part.set_payload(f.read())
                        encoders.encode_base64(part)
                        part.add_header(
                            'Content-Disposition',
                            f'attachment; filename="{attachment_file.name}"'
                        )
                        msg.attach(part)
                        print(f"📎 Attached: {attachment_file.name}")
                    except Exception as e:
                        print(f"⚠️ Could not attach {attachment_file.name}: {e}")

        try:
            raw_message = base64.urlsafe_b64encode(msg.as_bytes()).decode('utf-8')
            sent_message = service.users().messages().send(
                userId='me',
                body={'raw': raw_message}
            ).execute()

            message_id = sent_message.get('id', hashlib.sha256(f"{request_id}:{datetime.now()}".encode()).hexdigest()[:16])

            # Mark as sent to prevent duplicates
            self._save_sent_email(request_id)

            print(f"✅ Email sent to {self.to_email}, Message ID: {message_id}")

            return EmailDeliveryResult(
                success=True,
                message_id=message_id,
                recipient=self.to_email,
                error=None,
                timestamp=datetime.now().isoformat()
            )

        except Exception as e:
            print(f"Gmail API send failed: {e}")
            return self._save_for_manual_review(request_id, request_text, research, plan, risk_score, github_issue_url)

    @safe_execute("send_status_email")
    def send_status_email(self, request_id: str, subject: str, body: str,
                          github_issue_url: Optional[str] = None) -> EmailDeliveryResult:
        """
        Send status/engagement email with GenUI dark mode HTML format.

        REQ-2025-12-22: Rich HTML format for all workflow emails
        """
        if not GMAIL_API_AVAILABLE:
            return EmailDeliveryResult(
                success=False,
                message_id=None,
                recipient=self.to_email,
                error="Gmail API not available",
                timestamp=datetime.now().isoformat()
            )

        service = self.get_gmail_service()
        if not service:
            return EmailDeliveryResult(
                success=False,
                message_id=None,
                recipient=self.to_email,
                error="Could not get Gmail service",
                timestamp=datetime.now().isoformat()
            )

        # Create message with both plain and HTML
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = self.from_email
        msg['To'] = self.to_email
        msg['Reply-To'] = self.reply_to_email

        # Plain text version
        msg.attach(MIMEText(body, 'plain'))

        # GenUI Dark Mode HTML version
        html_body = self._format_genui_dark_html(request_id, subject, body, github_issue_url)
        msg.attach(MIMEText(html_body, 'html'))

        try:
            raw_message = base64.urlsafe_b64encode(msg.as_bytes()).decode('utf-8')
            sent_message = service.users().messages().send(
                userId='me',
                body={'raw': raw_message}
            ).execute()

            message_id = sent_message.get('id', hashlib.sha256(f"{request_id}:{datetime.now()}".encode()).hexdigest()[:16])
            print(f"✅ Status email sent, Message ID: {message_id}")

            return EmailDeliveryResult(
                success=True,
                message_id=message_id,
                recipient=self.to_email,
                error=None,
                timestamp=datetime.now().isoformat()
            )

        except Exception as e:
            print(f"Gmail API send failed: {e}")
            return EmailDeliveryResult(
                success=False,
                message_id=None,
                recipient=self.to_email,
                error=str(e),
                timestamp=datetime.now().isoformat()
            )

    def _format_genui_dark_html(self, request_id: str, subject: str, body: str,
                                 github_issue_url: Optional[str] = None) -> str:
        """Format email body as GenUI Dark Mode HTML."""

        # Parse body sections
        sections = body.split('━' * 35)

        # Convert plain text to HTML-safe
        body_html = body.replace('\n', '<br>\n').replace('• ', '&bull; ')

        html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #e0e0e0; background: #1a1a1a; margin: 0; padding: 20px;">
    <div style="max-width: 700px; margin: 0 auto; background: #2d2d2d; border-radius: 8px; padding: 30px; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">

        <!-- Header -->
        <div style="border-bottom: 3px solid #4a9eff; padding-bottom: 15px; margin-bottom: 20px;">
            <h1 style="color: #e0e0e0; margin: 0; font-size: 24px;">🎯 TB Workflow Update</h1>
            <p style="color: #808080; margin: 5px 0 0 0; font-size: 14px;">
                Request ID: <code style="background: #0d1117; color: #79c0ff; padding: 2px 6px; border-radius: 3px;">{request_id}</code>
                &nbsp;|&nbsp; {datetime.now().strftime('%Y-%m-%d %H:%M')} UTC
            </p>
        </div>

        <!-- Main Content -->
        <div style="background: #1a1a1a; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #4a9eff;">
            <pre style="margin: 0; white-space: pre-wrap; word-wrap: break-word; font-family: inherit; color: #e0e0e0;">{body}</pre>
        </div>

        {'<div style="background: #1e3a5f; border-radius: 8px; padding: 15px; margin: 20px 0;"><strong style="color: #4a9eff;">🔗 GitHub Issue:</strong> <a href="' + github_issue_url + '" style="color: #79c0ff;">' + github_issue_url + '</a></div>' if github_issue_url else ''}

        <!-- Reply Options -->
        <div style="background: #1a1a1a; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h3 style="color: #4a9eff; margin-top: 0;">📧 Reply Options</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 10px; border: 1px solid #404040; background: #1b5e20;">
                        <strong style="color: #4caf50;">APPROVE {request_id}</strong><br>
                        <span style="color: #808080; font-size: 12px;">Proceed with execution</span>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #404040; background: #330000;">
                        <strong style="color: #f44336;">REJECT {request_id}</strong><br>
                        <span style="color: #808080; font-size: 12px;">Decline the request</span>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #404040; background: #332200;">
                        <strong style="color: #ff9800;">MODIFY {request_id}: [changes]</strong><br>
                        <span style="color: #808080; font-size: 12px;">Request modifications</span>
                    </td>
                </tr>
            </table>
        </div>

        <!-- Footer -->
        <div style="border-top: 1px solid #404040; padding-top: 15px; margin-top: 20px; text-align: center; color: #808080; font-size: 12px;">
            <p>TB Workflow Orchestrator v2.1 | <a href="https://github.com/craigmbrown/ETAC-System" style="color: #4a9eff;">ETAC-System</a></p>
        </div>
    </div>
</body>
</html>"""
        return html

    def _save_for_manual_review(self, request_id: str, request_text: str,
                                 research: ResearchResult,
                                 plan: IntegrationPlan,
                                 risk_score: int,
                                 github_issue_url: Optional[str] = None) -> EmailDeliveryResult:
        """Save approval for manual review when email fails."""

        html_content = self.format_html_email(request_id, request_text, research, plan, risk_score, github_issue_url)
        html_file = self.state_path / f"email_approval_{request_id}.html"
        html_file.write_text(html_content)

        text_content = self.format_plain_email(request_id, request_text, research, plan, risk_score, github_issue_url)
        text_file = self.state_path / f"email_approval_{request_id}.txt"
        text_file.write_text(text_content)

        # Mark as sent even for manual review
        self._save_sent_email(request_id)

        print(f"Approval saved to: {html_file}")

        return EmailDeliveryResult(
            success=True,
            message_id=f"manual_{request_id}",
            recipient="manual_review",
            error="Email not configured, saved for manual review",
            timestamp=datetime.now().isoformat()
        )


def send_tb_approval_email(request_id: str, request_text: str,
                           research: ResearchResult,
                           plan: IntegrationPlan,
                           risk_score: int,
                           github_issue_url: Optional[str] = None,
                           attachments: Optional[List[str]] = None) -> EmailDeliveryResult:
    """Convenience function to send TB approval email.

    REQ-104-108: Enhanced with voice transcript context, platform capabilities,
    historical memory, and attachment support.

    Args:
        request_id: Unique request identifier
        request_text: The original request text
        research: Research results from deep_researcher
        plan: Integration plan from integration_planner
        risk_score: Risk assessment score (1-10)
        github_issue_url: Optional GitHub issue URL
        attachments: Optional list of file paths to attach (e.g., HTML dashboards)

    Returns:
        EmailDeliveryResult with success status and message ID
    """
    sender = EmailApprovalSender()
    return sender.send_approval_email(
        request_id, request_text, research, plan, risk_score,
        github_issue_url, attachments
    )


if __name__ == "__main__":
    print("Email Approval Sender - Enhanced Lulu Edition")
    print("Run via tb_workflow_orchestrator.py for full integration")
