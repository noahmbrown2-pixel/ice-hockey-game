# Autonomous ZTE Workflows - Detailed Architecture Specification

**Version:** 1.0.0
**Date:** 2025-12-13
**Status:** Design Complete
**BLP Compliance:** Full (Autonomy, Durability, Self-Organization)

---

## Table of Contents

1. [Overview](#overview)
2. [Workflow 1: TB Command Processor](#workflow-1-tb-command-processor)
3. [Workflow 2: Daily Intelligence Aggregator](#workflow-2-daily-intelligence-aggregator)
4. [Workflow 3: Email-to-Action](#workflow-3-email-to-action)
5. [Workflow 4: GitHub Starred to Research](#workflow-4-github-starred-to-research)
6. [Workflow 5: X Bookmarks to Insights](#workflow-5-x-bookmarks-to-insights)
7. [BLP Property Mappings](#blp-property-mappings)
8. [Multi-Channel Delivery Patterns](#multi-channel-delivery-patterns)
9. [Exception Handling Framework](#exception-handling-framework)
10. [Implementation Requirements](#implementation-requirements)

---

## Overview

This document defines the complete architecture for 5 autonomous workflows designed to minimize human intervention while maximizing system reliability and self-optimization capabilities.

### Core Design Principles

1. **Approval-Gated Autonomy**: Critical actions require human approval via Notion, but non-critical operations proceed autonomously
2. **Multi-Channel Resilience**: All outputs delivered through multiple channels with fallback mechanisms
3. **State Persistence**: All workflows maintain complete audit trails and support resume-from-failure
4. **Adaptive Routing**: System learns from success/failure patterns to optimize execution paths
5. **Zero-Downtime Operation**: Designed for continuous 24/7 operation with self-healing capabilities

---

## Workflow 1: TB Command Processor

**Purpose:** Detect "TheBaby" (TB) commands from lifelogs, seek approval, execute via ZTE pipeline
**Autonomy Level:** APPROVAL-GATED (High-risk actions require confirmation)
**Schedule:** Real-time (triggered on lifelog ingestion)

### State Machine Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     TB COMMAND PROCESSOR WORKFLOW                        │
└─────────────────────────────────────────────────────────────────────────┘

[START]
   │
   ▼
┌─────────────────────┐
│  LIFELOG_MONITOR    │ ◄─────────────────┐
│  Poll every 5 min   │                   │ (Loop)
└──────────┬──────────┘                   │
           │                              │
           ▼                              │
    ┌──────────────┐                     │
    │ TB_DETECTION │                     │
    │ Regex match  │                     │
    └──────┬───────┘                     │
           │                              │
           ├─── No TB ────────────────────┘
           │
           ▼ TB Detected
    ┌────────────────────┐
    │ PARSE_COMMAND      │
    │ Extract: action,   │
    │   context, params  │
    └─────────┬──────────┘
              │
              ▼
    ┌────────────────────────┐
    │ CREATE_APPROVAL_PAGE   │
    │ Notion DB entry with:  │
    │  - Command text        │
    │  - Risk level          │
    │  - Estimated impact    │
    │  - Approval checkbox   │
    └─────────┬──────────────┘
              │
              ▼
    ┌─────────────────────────┐
    │ SEND_NOTIFICATIONS      │
    │ → Nostr DM (with link)  │
    │ → WhatsApp (with link)  │
    └─────────┬───────────────┘
              │
              ▼
    ┌─────────────────────────┐
    │ WAIT_FOR_APPROVAL       │◄──────┐
    │ Poll Notion every 30s   │       │
    │ Timeout: 24 hours       │       │
    └─────────┬───────────────┘       │
              │                       │
              ├─── Pending ───────────┘
              │
              ├─── Approved ──────────┐
              │                       │
              │                       ▼
              │              ┌──────────────────┐
              │              │ EXECUTE_VIA_ZTE  │
              │              │ Create GH issue  │
              │              │ Label: zte-pipe  │
              │              └────────┬─────────┘
              │                       │
              │                       ▼
              │              ┌──────────────────┐
              │              │ MONITOR_ZTE      │
              │              │ Track DITD phases│
              │              └────────┬─────────┘
              │                       │
              │                       ▼
              │              ┌──────────────────┐
              │              │ DELIVER_RESULTS  │
              │              │ All channels     │
              │              └────────┬─────────┘
              │                       │
              │                       ▼
              │                    [SUCCESS]
              │
              ├─── Rejected ──────────┐
              │                       ▼
              │              ┌──────────────────┐
              │              │ LOG_REJECTION    │
              │              │ Update Notion    │
              │              └────────┬─────────┘
              │                       │
              │                       ▼
              │                    [REJECTED]
              │
              ▼ Timeout
    ┌─────────────────┐
    │ HANDLE_TIMEOUT  │
    │ Mark expired    │
    │ Notify user     │
    └────────┬────────┘
             │
             ▼
         [EXPIRED]
```

### Requirement Mappings

| Requirement ID | Component | Implementation |
|---------------|-----------|----------------|
| REQ-WKFL-001 | TB Detection | Regex: `(?i)(tb|thebaby)[,:]?\s+(.+)` on lifelog text |
| REQ-WKFL-002 | Risk Assessment | NLP model scores command danger (0-1.0) |
| REQ-WKFL-003 | Notion Approval | Template: "TB Command Approval" database |
| REQ-WKFL-004 | Multi-Channel Notify | Nostr DM + WhatsApp with Notion link |
| REQ-WKFL-005 | Polling Interval | 30s for approval, 5min for lifelog |
| REQ-WKFL-006 | Timeout Handling | 24hr max wait, auto-expire with notification |
| REQ-WKFL-007 | ZTE Integration | Create GH issue with parsed command as body |
| REQ-WKFL-008 | Result Delivery | Dashboard + WhatsApp + Email + Notion update |

### Data Structures

```python
@dataclass
class TBCommand:
    """Parsed TheBaby command from lifelog."""
    id: str  # UUID
    source: str  # "lifelog"
    raw_text: str
    parsed_action: str
    context: str
    parameters: Dict[str, Any]
    risk_score: float  # 0.0-1.0
    detected_at: str  # ISO timestamp
    lifelog_entry_id: str

@dataclass
class ApprovalRequest:
    """Notion approval page structure."""
    command_id: str
    title: str  # "TB Command: {action}"
    description: str
    risk_level: str  # "low", "medium", "high", "critical"
    estimated_impact: str
    approval_status: str  # "pending", "approved", "rejected", "expired"
    approved_by: Optional[str]
    approved_at: Optional[str]
    notion_page_id: str
    notion_url: str

@dataclass
class ZTEExecution:
    """ZTE pipeline execution tracking."""
    command_id: str
    github_issue_number: int
    github_issue_url: str
    current_phase: str  # "design", "implement", "test", "deploy"
    phase_results: List[Dict]
    dashboard_url: Optional[str]
    completed_at: Optional[str]
    success: bool
```

### Exception Handling

| Exception Type | Detection | Recovery Strategy | Notification |
|---------------|-----------|-------------------|--------------|
| LifelogAPIDown | HTTP 5xx, timeout | Retry 3x with exponential backoff, skip cycle | Log only (no alert) |
| TBParseError | Regex match but parse fails | Save raw text, mark for manual review | WhatsApp notification |
| NotionAPIFailure | 429 rate limit, 5xx | Queue request, retry after delay | Email if queue > 10 |
| NotificationFailure | Nostr/WhatsApp error | Store in DB for retry, proceed to approval wait | Log warning |
| ApprovalTimeout | 24hr elapsed | Auto-expire, update Notion, notify user | WhatsApp + Email |
| ZTEFailure | GH issue creation fails | Retry 3x, fallback to direct execution | WhatsApp urgent |
| ResultDeliveryFail | All channels fail | Store in filesystem, retry hourly | Email alert |

### BLP Annotations

**Autonomy (BLP-2):**
- Level: APPROVAL-GATED (90% autonomous, 10% human oversight)
- Decision Points: Only command execution requires approval
- Auto-handles: Detection, parsing, notification, result delivery

**Durability (BLP-4):**
- State Persistence: SQLite DB tracks all states
- Resume Capability: Can restart mid-workflow from saved state
- Audit Trail: Complete log of all state transitions

**Self-Organization (BLP-5):**
- Adaptive Timeouts: Learns optimal approval wait times per user
- Risk Scoring: ML model improves with feedback
- Channel Selection: Prioritizes working channels, deprioritizes failing ones

---

## Workflow 2: Daily Intelligence Aggregator

**Purpose:** Synthesize daily intelligence from Gmail, GitHub stars, X bookmarks, lifelogs
**Autonomy Level:** FULLY AUTONOMOUS (No approval required)
**Schedule:** Daily at 06:00 UTC

### State Machine Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│               DAILY INTELLIGENCE AGGREGATOR WORKFLOW                     │
└─────────────────────────────────────────────────────────────────────────┘

[CRON: 06:00 UTC Daily]
   │
   ▼
┌──────────────────────┐
│ INITIALIZE           │
│ Load config          │
│ Set date range       │
│ Initialize channels  │
└───────┬──────────────┘
        │
        ▼
┌──────────────────────────────────────────────┐
│ PARALLEL_COLLECTION (async.gather)          │
│                                              │
│  ┌─────────────────┐  ┌──────────────────┐ │
│  │ FETCH_GMAIL     │  │ FETCH_GH_STARRED │ │
│  │ Unread 24hr     │  │ Last 24hr        │ │
│  └─────────────────┘  └──────────────────┘ │
│                                              │
│  ┌─────────────────┐  ┌──────────────────┐ │
│  │ FETCH_X_BOOKM.  │  │ FETCH_LIFELOGS   │ │
│  │ BTC/AI filter   │  │ Yesterday        │ │
│  └─────────────────┘  └──────────────────┘ │
└────────────┬─────────────────────────────────┘
             │
             ▼
    ┌─────────────────────┐
    │ CATEGORIZE          │
    │ ML: BTC vs AI vs    │
    │   Other             │
    │ Tag: urgent/info    │
    └──────┬──────────────┘
           │
           ▼
    ┌─────────────────────┐
    │ DEDUPLICATION       │
    │ Hash-based          │
    │ URL normalization   │
    └──────┬──────────────┘
           │
           ▼
    ┌─────────────────────┐
    │ PRIORITY_RANKING    │
    │ Score: relevance    │
    │  * recency          │
    │  * source trust     │
    └──────┬──────────────┘
           │
           ▼
    ┌─────────────────────┐
    │ SYNTHESIS           │
    │ LLM summarization   │
    │ Extract insights    │
    │ Generate themes     │
    └──────┬──────────────┘
           │
           ▼
    ┌──────────────────────────────────┐
    │ GENERATE_ARTIFACTS               │
    │  - HTML Dashboard                │
    │  - Email Report (full details)   │
    │  - Nostr Post (headlines only)   │
    │  - WhatsApp Summary              │
    │  - Notion Database Entry         │
    └──────┬───────────────────────────┘
           │
           ▼
    ┌──────────────────────────────────┐
    │ MULTI_CHANNEL_DELIVERY           │
    │  → Email (with full report)      │
    │  → Nostr (public highlights)     │
    │  → WhatsApp (key insights)       │
    │  → Notion (searchable DB)        │
    │  → GitHub (issue comment)        │
    └──────┬───────────────────────────┘
           │
           ├─── All Success ─────┐
           │                     ▼
           │              ┌──────────────┐
           │              │ UPDATE_STATE │
           │              │ Log metrics  │
           │              └──────┬───────┘
           │                     │
           │                     ▼
           │                 [SUCCESS]
           │
           ├─── Partial Fail ────┐
           │                     ▼
           │              ┌───────────────┐
           │              │ RETRY_FAILED  │
           │              │ Queue for 1hr │
           │              └──────┬────────┘
           │                     │
           │                     ▼
           │              ┌───────────────┐
           │              │ LOG_WARNINGS  │
           │              └──────┬────────┘
           │                     │
           │                     ▼
           │              [PARTIAL_SUCCESS]
           │
           ▼ Critical Fail
    ┌─────────────────┐
    │ EMERGENCY_ALERT │
    │ WhatsApp urgent │
    │ Email sysadmin  │
    └────────┬────────┘
             │
             ▼
         [FAILED]
```

### Data Flow

```
Gmail API ──────────┐
                    │
GitHub API ─────────┼──► [ Collection Layer ]
                    │         │
X/Twitter API ──────┤         │
                    │         ▼
Lifelog API ────────┘   [ Deduplication ]
                              │
                              ▼
                        [ Categorization ]
                         (BTC/AI/Other)
                              │
                              ▼
                        [ Priority Scoring ]
                         (0.0 - 1.0)
                              │
                              ▼
                        [ LLM Synthesis ]
                    (Sonnet 4 or Opus 4.5)
                              │
                              ▼
                        [ Artifact Generation ]
                              │
                              ├──► HTML Dashboard
                              ├──► Email Report
                              ├──► Nostr Post
                              ├──► WhatsApp Message
                              └──► Notion Entry
```

### Requirement Mappings

| Requirement ID | Component | Implementation |
|---------------|-----------|----------------|
| REQ-WKFL-009 | Gmail Fetch | Gmail API: unread messages, last 24h |
| REQ-WKFL-010 | GitHub Stars | GitHub API: starred repos, since yesterday |
| REQ-WKFL-011 | X Bookmarks | X API or XAI/Grok: filter BTC/AI keywords |
| REQ-WKFL-012 | Lifelog Fetch | Limitless API: entries from yesterday |
| REQ-WKFL-013 | BTC/AI Filter | NLP model: classify by keywords + context |
| REQ-WKFL-014 | Deduplication | SHA256 hash of (title + URL normalized) |
| REQ-WKFL-015 | Priority Score | `0.4*relevance + 0.3*recency + 0.3*source_trust` |
| REQ-WKFL-016 | Synthesis LLM | Claude Sonnet 4.5 with 200K context |
| REQ-WKFL-017 | Dashboard Gen | HTML template with dark theme, responsive |
| REQ-WKFL-018 | Multi-Channel | Parallel async delivery with timeout 30s each |

### Data Structures

```python
@dataclass
class IntelligenceItem:
    """Single intelligence item from any source."""
    id: str  # UUID
    source: str  # "gmail", "github", "x_bookmark", "lifelog"
    source_id: str  # Original ID from source API
    title: str
    content: str
    url: Optional[str]
    category: str  # "btc", "ai", "other"
    priority_score: float  # 0.0-1.0
    tags: List[str]
    collected_at: str  # ISO timestamp
    published_at: Optional[str]
    metadata: Dict[str, Any]

@dataclass
class DailyIntelligenceReport:
    """Complete daily intelligence synthesis."""
    date: str  # YYYY-MM-DD
    items: List[IntelligenceItem]
    btc_count: int
    ai_count: int
    other_count: int
    total_sources: int
    key_themes: List[str]
    summary: str  # LLM-generated
    top_items: List[IntelligenceItem]  # Top 10 by priority
    dashboard_url: str
    generated_at: str

@dataclass
class DeliveryStatus:
    """Track multi-channel delivery status."""
    report_id: str
    email_sent: bool
    nostr_posted: bool
    whatsapp_sent: bool
    notion_created: bool
    github_commented: bool
    failed_channels: List[str]
    retry_queue: List[str]
```

### Exception Handling

| Exception Type | Detection | Recovery Strategy | Notification |
|---------------|-----------|-------------------|--------------|
| SourceAPIDown | HTTP errors, timeouts | Skip source, proceed with others | Log warning |
| RateLimitHit | 429 response | Wait + retry, or skip if cron window tight | Email if multiple sources |
| EmptyResults | No items collected | Generate "no intelligence" report | WhatsApp info message |
| LLMFailure | Synthesis timeout/error | Use fallback template summary | Log error, proceed |
| DashboardGenFail | Template error | Skip dashboard, deliver text-only | Email warning |
| AllChannelsFail | All delivery attempts fail | Store report in filesystem | WhatsApp URGENT alert |

### BLP Annotations

**Autonomy (BLP-2):**
- Level: FULLY AUTONOMOUS (100% automated)
- Decision Points: None (all synthesis automated)
- Self-Optimization: Learns optimal collection times, source weights

**Durability (BLP-4):**
- State Persistence: JSON checkpoint after each collection phase
- Crash Recovery: Can resume from last checkpoint
- Data Retention: 90 days in database, archives to S3

**Self-Organization (BLP-5):**
- Adaptive Scheduling: Adjusts collection times based on source update patterns
- Source Prioritization: Deprioritizes consistently failing/empty sources
- LLM Selection: Routes to Opus 4.5 for complex synthesis, Sonnet for simple

---

## Workflow 3: Email-to-Action

**Purpose:** Process unread emails, prioritize, escalate to tasks/calendar/TB
**Autonomy Level:** HYBRID (Auto-triage, human confirms escalations)
**Schedule:** Every 15 minutes

### State Machine Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    EMAIL-TO-ACTION WORKFLOW                              │
└─────────────────────────────────────────────────────────────────────────┘

[CRON: */15 * * * *]
   │
   ▼
┌──────────────────┐
│ FETCH_UNREAD     │
│ Gmail API        │
│ Max 50 emails    │
└────────┬─────────┘
         │
         ▼
    ┌──────────────┐
    │ FILTER_NOISE │
    │ Skip: spam,  │
    │  newsletters,│
    │  auto-reply  │
    └───────┬──────┘
            │
            ▼
    ┌──────────────────┐
    │ CLASSIFY         │
    │ LLM determines:  │
    │  - Priority      │
    │  - Intent        │
    │  - Required act. │
    └───────┬──────────┘
            │
            ├─── Low Priority ──────────────┐
            │                               ▼
            │                    ┌────────────────────┐
            │                    │ MARK_READ          │
            │                    │ Add "processed" tag│
            │                    └──────────┬─────────┘
            │                               │
            │                               ▼
            │                           [IGNORED]
            │
            ├─── Medium Priority ───────────┐
            │                               ▼
            │                    ┌────────────────────┐
            │                    │ CREATE_NOTION_TASK │
            │                    │ Link to email      │
            │                    └──────────┬─────────┘
            │                               │
            │                               ▼
            │                    ┌────────────────────┐
            │                    │ NOTIFY_WHATSAPP    │
            │                    │ "New task from     │
            │                    │  email: {subject}" │
            │                    └──────────┬─────────┘
            │                               │
            │                               ▼
            │                           [TASK_CREATED]
            │
            ├─── High Priority (Meeting) ──┐
            │                               ▼
            │                    ┌───────────────────────┐
            │                    │ EXTRACT_MEETING_INFO  │
            │                    │ LLM extracts:         │
            │                    │  - Date/time          │
            │                    │  - Location/link      │
            │                    │  - Participants       │
            │                    └─────────┬─────────────┘
            │                              │
            │                              ▼
            │                    ┌───────────────────────┐
            │                    │ CREATE_CALENDAR_EVENT │
            │                    │ Google Calendar API   │
            │                    └─────────┬─────────────┘
            │                              │
            │                              ▼
            │                    ┌───────────────────────┐
            │                    │ NOTIFY_ALL_CHANNELS   │
            │                    │ Email confirm +       │
            │                    │ WhatsApp + Nostr DM   │
            │                    └─────────┬─────────────┘
            │                              │
            │                              ▼
            │                         [CALENDAR_ADDED]
            │
            ▼ Critical (TB-worthy)
    ┌───────────────────────┐
    │ CREATE_TB_ESCALATION  │
    │ Format as TB command  │
    └─────────┬─────────────┘
              │
              ▼
    ┌───────────────────────┐
    │ TRIGGER_TB_WORKFLOW   │
    │ Hand off to Workflow1 │
    └─────────┬─────────────┘
              │
              ▼
    ┌───────────────────────┐
    │ NOTIFY_ESCALATION     │
    │ WhatsApp URGENT +     │
    │ Email summary         │
    └─────────┬─────────────┘
              │
              ▼
         [TB_ESCALATED]
```

### Email Classification Logic

```python
def classify_email(email: Email) -> EmailClassification:
    """
    LLM-based email classification.

    Prompt template:
    ---
    Analyze this email and classify it:

    From: {sender}
    Subject: {subject}
    Body: {body[:1000]}

    Determine:
    1. Priority (low/medium/high/critical)
    2. Intent (info/request/meeting/urgent)
    3. Required Action (none/task/calendar/escalate)
    4. Extracted Info (if meeting: date, time, location)

    Return JSON:
    {
      "priority": "low|medium|high|critical",
      "intent": "info|request|meeting|urgent",
      "action": "none|task|calendar|escalate",
      "confidence": 0.0-1.0,
      "extracted_info": {...}
    }
    ---
    """
    pass
```

### Requirement Mappings

| Requirement ID | Component | Implementation |
|---------------|-----------|----------------|
| REQ-WKFL-019 | Email Polling | Gmail API: `q="is:unread -in:spam"`, max 50 |
| REQ-WKFL-020 | Noise Filter | Heuristics: auto-reply headers, known senders |
| REQ-WKFL-021 | Classification | Claude Sonnet with structured output |
| REQ-WKFL-022 | Task Creation | Notion API: "Email Tasks" database |
| REQ-WKFL-023 | Calendar Creation | Google Calendar API with parsed datetime |
| REQ-WKFL-024 | TB Escalation | Generate TB command format, trigger WF1 |
| REQ-WKFL-025 | Multi-Notify | WhatsApp for all non-low, Email for critical |
| REQ-WKFL-026 | Mark Processed | Gmail API: mark read + add "processed" label |

### Data Structures

```python
@dataclass
class EmailClassification:
    """LLM classification result."""
    email_id: str
    priority: str  # "low", "medium", "high", "critical"
    intent: str  # "info", "request", "meeting", "urgent"
    action: str  # "none", "task", "calendar", "escalate"
    confidence: float  # 0.0-1.0
    extracted_info: Dict[str, Any]
    classified_at: str

@dataclass
class EmailAction:
    """Action taken on an email."""
    email_id: str
    action_type: str  # "ignored", "task", "calendar", "tb_escalate"
    notion_task_id: Optional[str]
    calendar_event_id: Optional[str]
    tb_command_id: Optional[str]
    notifications_sent: List[str]  # channels
    completed_at: str
    success: bool
```

### Exception Handling

| Exception Type | Detection | Recovery Strategy | Notification |
|---------------|-----------|-------------------|--------------|
| GmailAPIFailure | 5xx, auth errors | Retry 3x, skip cycle if persists | Email sysadmin after 3 failures |
| ClassificationError | LLM timeout/error | Use rule-based fallback classifier | Log warning |
| NotionTaskFail | API error | Queue for retry, notify anyway | WhatsApp with manual link |
| CalendarEventFail | Google API error | Create Notion task instead | Email user with .ics attachment |
| TBTriggerFail | Workflow 1 unavailable | Queue command, retry in 5 min | WhatsApp warning |

### BLP Annotations

**Autonomy (BLP-2):**
- Level: HYBRID (Auto-triage, human confirms escalations via TB approval)
- Decision Points: Low/medium automated, high+ requires notification
- Learning: Classification model improves from user corrections

**Durability (BLP-4):**
- State Persistence: SQLite tracks all processed emails
- Idempotency: Uses email message-id to prevent duplicates
- Crash Recovery: Resumes from last processed message-id

**Self-Organization (BLP-5):**
- Adaptive Classification: Learns sender importance from user actions
- Priority Tuning: Adjusts thresholds based on user feedback
- Channel Selection: Routes urgent to WhatsApp, info to Notion only

---

## Workflow 4: GitHub Starred to Research

**Purpose:** Convert starred GitHub repos into technical briefs and documentation
**Autonomy Level:** FULLY AUTONOMOUS
**Schedule:** Daily at 08:00 UTC

### State Machine Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│              GITHUB STARRED TO RESEARCH WORKFLOW                         │
└─────────────────────────────────────────────────────────────────────────┘

[CRON: 08:00 UTC Daily]
   │
   ▼
┌──────────────────────┐
│ FETCH_NEW_STARS      │
│ GitHub API:          │
│  starred since       │
│  last check          │
└───────┬──────────────┘
        │
        ├─── No new stars ────► [SKIP]
        │
        ▼ Stars found
┌──────────────────────┐
│ CATEGORIZE_REPOS     │
│ By language, domain: │
│  - AI/ML            │
│  - Blockchain       │
│  - DevTools         │
│  - Other            │
└───────┬──────────────┘
        │
        ▼
┌───────────────────────────────────┐
│ PARALLEL_ANALYSIS (per repo)     │
│                                   │
│  ┌─────────────────────────────┐ │
│  │ CLONE_REPO                  │ │
│  │ Shallow clone (depth=1)     │ │
│  └──────┬──────────────────────┘ │
│         │                         │
│         ▼                         │
│  ┌─────────────────────────────┐ │
│  │ EXTRACT_METADATA            │ │
│  │ - README parsing            │ │
│  │ - Language stats            │ │
│  │ - Dependencies              │ │
│  │ - Architecture (dirs)       │ │
│  └──────┬──────────────────────┘ │
│         │                         │
│         ▼                         │
│  ┌─────────────────────────────┐ │
│  │ ANALYZE_CODE                │ │
│  │ LLM with 200K context:      │ │
│  │ - Key features              │ │
│  │ - Design patterns           │ │
│  │ - Novel techniques          │ │
│  └──────┬──────────────────────┘ │
│         │                         │
│         ▼                         │
│  ┌─────────────────────────────┐ │
│  │ GENERATE_BRIEF              │ │
│  │ Technical summary:          │ │
│  │ - Purpose                   │ │
│  │ - Architecture              │ │
│  │ - Use cases                 │ │
│  │ - Learning value            │ │
│  └──────┬──────────────────────┘ │
│         │                         │
└─────────┼─────────────────────────┘
          │
          ▼
┌─────────────────────────┐
│ AGGREGATE_INSIGHTS      │
│ Cross-repo analysis:    │
│  - Common patterns      │
│  - Emerging trends      │
│  - Recommended reading  │
│    order                │
└─────────┬───────────────┘
          │
          ▼
┌─────────────────────────┐
│ CREATE_DOCUMENTATION    │
│ - Markdown docs         │
│ - HTML dashboard        │
│ - Notion database       │
└─────────┬───────────────┘
          │
          ▼
┌─────────────────────────┐
│ PUBLISH_TO_HUB          │
│ Git push to:            │
│  docs/research/         │
│  {category}/{repo}/     │
└─────────┬───────────────┘
          │
          ▼
┌─────────────────────────┐
│ DELIVER_SUMMARY         │
│ → Email (weekly digest) │
│ → Nostr (new brief!)    │
│ → WhatsApp (highlights) │
└─────────┬───────────────┘
          │
          ▼
      [SUCCESS]
```

### Technical Brief Template

```markdown
# {Repo Name} - Technical Brief

**Repository:** {owner}/{name}
**Category:** {ai_ml|blockchain|devtools|other}
**Language:** {primary_language}
**Stars:** {stargazers_count} ⭐
**Analyzed:** {analysis_date}

## Executive Summary

{LLM-generated 2-3 paragraph overview}

## Architecture Overview

{LLM analysis of code structure, key components}

## Key Features

- {Feature 1}
- {Feature 2}
- {Feature 3}

## Design Patterns Identified

1. **{Pattern Name}**: {Description}
2. **{Pattern Name}**: {Description}

## Novel Techniques

{LLM identifies innovative approaches}

## Use Cases

- **{Use Case 1}**: {Description}
- **{Use Case 2}**: {Description}

## Learning Value

**Difficulty:** {Beginner|Intermediate|Advanced}
**Recommended For:** {Target audience}
**Key Takeaways:**
- {Takeaway 1}
- {Takeaway 2}

## Dependencies

```
{Extracted from package.json, requirements.txt, etc.}
```

## Related Repositories

{LLM suggests similar repos from your stars}

## Exploration Roadmap

1. {Suggested exploration step 1}
2. {Suggested exploration step 2}
3. {Suggested exploration step 3}

---

**Auto-generated by GitHub Research Agent**
**Source:** {github_url}
```

### Requirement Mappings

| Requirement ID | Component | Implementation |
|---------------|-----------|----------------|
| REQ-WKFL-027 | Star Tracking | GitHub API: `/user/starred`, since last run |
| REQ-WKFL-028 | Categorization | Heuristics + LLM: language + README keywords |
| REQ-WKFL-029 | Repo Cloning | `git clone --depth 1` to temp dir |
| REQ-WKFL-030 | Metadata Extract | Parse README, package files, dir structure |
| REQ-WKFL-031 | Code Analysis | Opus 4.5 with full codebase in context |
| REQ-WKFL-032 | Brief Generation | Structured prompt with template |
| REQ-WKFL-033 | Documentation Hub | Git repo: `craigmbrown/tech-research` |
| REQ-WKFL-034 | Weekly Digest | Aggregate all briefs, send Friday 17:00 |

### Data Structures

```python
@dataclass
class GitHubRepo:
    """Starred repository metadata."""
    id: int
    full_name: str
    description: str
    url: str
    homepage: Optional[str]
    language: str
    stargazers_count: int
    topics: List[str]
    starred_at: str

@dataclass
class TechnicalBrief:
    """Generated technical brief."""
    repo: GitHubRepo
    category: str
    summary: str
    architecture: str
    key_features: List[str]
    design_patterns: List[Dict[str, str]]
    novel_techniques: List[str]
    use_cases: List[Dict[str, str]]
    learning_value: Dict[str, str]
    dependencies: List[str]
    related_repos: List[str]
    exploration_roadmap: List[str]
    markdown_content: str
    html_content: str
    generated_at: str

@dataclass
class WeeklyDigest:
    """Weekly research digest."""
    week_start: str
    week_end: str
    repos_analyzed: int
    categories: Dict[str, int]
    top_briefs: List[TechnicalBrief]
    emerging_patterns: List[str]
    recommended_order: List[str]  # Repo names in learning order
```

### Exception Handling

| Exception Type | Detection | Recovery Strategy | Notification |
|---------------|-----------|-------------------|--------------|
| GitHubAPIFailure | Rate limit, auth error | Wait + retry, cache results | Email if rate limit exceeded |
| CloneFailure | Private repo, network error | Skip repo, log failure | Log warning only |
| AnalysisTimeout | LLM takes > 5min | Use smaller context, retry | Log warning |
| DocumentationFail | Git push fails | Store locally, retry hourly | Email sysadmin |
| EmptyWeek | No new stars | Skip digest generation | None (silent) |

### BLP Annotations

**Autonomy (BLP-2):**
- Level: FULLY AUTONOMOUS (100%)
- Decision Points: All categorization and analysis automated
- Self-Improvement: Learns better prompts from user feedback

**Durability (BLP-4):**
- State Persistence: Tracks last processed star timestamp
- Crash Recovery: Can resume analysis from checkpoint
- Data Retention: All briefs versioned in Git

**Self-Organization (BLP-5):**
- Adaptive Analysis: Adjusts LLM context size based on repo complexity
- Category Learning: Improves categorization from manual corrections
- Priority Routing: Analyzes high-star repos with Opus, low-star with Sonnet

---

## Workflow 5: X Bookmarks to Insights

**Purpose:** Analyze X/Twitter bookmarks (BTC & AI only) via XAI/Grok, deliver insights
**Autonomy Level:** FULLY AUTONOMOUS
**Schedule:** Daily at 10:00 UTC

### State Machine Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                X BOOKMARKS TO INSIGHTS WORKFLOW                          │
└─────────────────────────────────────────────────────────────────────────┘

[CRON: 10:00 UTC Daily]
   │
   ▼
┌──────────────────────┐
│ FETCH_BOOKMARKS      │
│ X API or XAI/Grok:   │
│  recent bookmarks    │
└───────┬──────────────┘
        │
        ▼
┌──────────────────────┐
│ FILTER_BTC_AI        │
│ Keyword matching:    │
│  BTC: bitcoin, btc,  │
│    crypto, DeFi      │
│  AI: AGI, LLM, GPT,  │
│    Claude, agents    │
└───────┬──────────────┘
        │
        ├─── No matches ────► [SKIP]
        │
        ▼ Matches found
┌──────────────────────────────────┐
│ ENRICH_CONTEXT                   │
│ For each bookmark:               │
│  - Fetch full thread             │
│  - Get linked articles           │
│  - Extract media/images          │
└───────┬──────────────────────────┘
        │
        ▼
┌──────────────────────────────────┐
│ ANALYZE_WITH_GROK                │
│ XAI Grok-4 with 2M context:      │
│  - Sentiment analysis            │
│  - Key claims extraction         │
│  - Trend identification          │
│  - Contradiction detection       │
│  - Meme potential scoring        │
└───────┬──────────────────────────┘
        │
        ▼
┌──────────────────────────────────┐
│ CROSS_REFERENCE                  │
│ Check against:                   │
│  - Previous insights DB          │
│  - Polymarket predictions        │
│  - Recent research papers        │
└───────┬──────────────────────────┘
        │
        ▼
┌──────────────────────────────────┐
│ GENERATE_INSIGHTS                │
│ Structured output:               │
│  - Executive summary             │
│  - BTC trends (if applicable)    │
│  - AI trends (if applicable)     │
│  - Contrarian takes              │
│  - Action items                  │
│  - Meme-worthy moments           │
└───────┬──────────────────────────┘
        │
        ▼
┌──────────────────────────────────┐
│ STORE_IN_DATABASE                │
│ Notion "Insights" database:      │
│  - Searchable by topic           │
│  - Tagged by category            │
│  - Linked to sources             │
└───────┬──────────────────────────┘
        │
        ▼
┌──────────────────────────────────┐
│ DELIVER_TO_ALL_CHANNELS          │
│  → Email (full analysis)         │
│  → Nostr (key insights + links)  │
│  → WhatsApp (TL;DR + top 3)      │
│  → Notion (structured DB entry)  │
└───────┬──────────────────────────┘
        │
        ▼
      [SUCCESS]
```

### Grok-4 Analysis Prompt

```
You are analyzing Twitter/X bookmarks for BTC and AI insights.

Bookmarks:
{bookmark_threads}

Your task:
1. Identify the 3-5 most significant trends or developments
2. Extract key claims and assess their credibility (0-1.0)
3. Detect contradictions between different sources
4. Score meme potential (0-1.0) for each insight
5. Suggest action items based on insights

Return JSON:
{
  "executive_summary": "...",
  "btc_trends": [
    {
      "trend": "...",
      "significance": 0.0-1.0,
      "source_tweets": ["url1", "url2"],
      "credibility": 0.0-1.0
    }
  ],
  "ai_trends": [...],
  "contrarian_takes": [...],
  "contradictions": [
    {
      "claim_a": "...",
      "claim_b": "...",
      "source_a": "...",
      "source_b": "..."
    }
  ],
  "meme_worthy": [
    {
      "content": "...",
      "meme_score": 0.0-1.0,
      "context": "..."
    }
  ],
  "action_items": [...]
}
```

### Requirement Mappings

| Requirement ID | Component | Implementation |
|---------------|-----------|----------------|
| REQ-WKFL-035 | Bookmark Fetch | X API v2 or XAI/Grok API fallback |
| REQ-WKFL-036 | BTC/AI Filter | Regex + keyword lists, min 2 matches |
| REQ-WKFL-037 | Thread Fetch | X API: conversation_id expansion |
| REQ-WKFL-038 | Grok Analysis | XAI API: Grok-4 with full thread context |
| REQ-WKFL-039 | Cross-Reference | Query Notion DB + Polymarket API |
| REQ-WKFL-040 | Insight Storage | Notion "Insights" database template |
| REQ-WKFL-041 | Multi-Channel | Async parallel delivery, 30s timeout |
| REQ-WKFL-042 | Meme Detection | Grok scores absurdity + virality potential |

### Data Structures

```python
@dataclass
class XBookmark:
    """X/Twitter bookmark metadata."""
    tweet_id: str
    author: str
    text: str
    url: str
    created_at: str
    engagement: Dict[str, int]  # likes, retweets, etc.
    media: List[str]
    thread_tweets: List[str]  # If part of thread

@dataclass
class InsightTrend:
    """Single trend/insight."""
    category: str  # "btc" or "ai"
    trend: str
    significance: float  # 0.0-1.0
    credibility: float  # 0.0-1.0
    source_tweets: List[str]
    supporting_evidence: List[str]

@dataclass
class DailyInsights:
    """Complete daily insights report."""
    date: str
    bookmarks_analyzed: int
    btc_trends: List[InsightTrend]
    ai_trends: List[InsightTrend]
    contrarian_takes: List[str]
    contradictions: List[Dict]
    meme_worthy: List[Dict]
    action_items: List[str]
    executive_summary: str
    notion_page_id: str
    generated_at: str
```

### Exception Handling

| Exception Type | Detection | Recovery Strategy | Notification |
|---------------|-----------|-------------------|--------------|
| XAPIRateLimit | 429 response | Wait + retry, or use XAI fallback | Log warning |
| XAIAPIFailure | 5xx, timeout | Retry 3x, fallback to local LLM | Email if all fail |
| EmptyBookmarks | No BTC/AI matches | Generate "no insights" report | Silent skip |
| GrokTimeout | Analysis > 10min | Use smaller context, retry | Log warning |
| CrossRefFailure | Notion/Polymarket down | Skip cross-reference step | Log warning |
| AllDeliveryFail | All channels fail | Store in filesystem, retry 1hr | WhatsApp URGENT |

### BLP Annotations

**Autonomy (BLP-2):**
- Level: FULLY AUTONOMOUS (100%)
- Decision Points: All analysis and delivery automated
- Self-Learning: Improves filter keywords from engagement patterns

**Durability (BLP-4):**
- State Persistence: Tracks last processed bookmark timestamp
- Crash Recovery: Checkpoint after Grok analysis phase
- Data Retention: 180 days in Notion, archives to S3

**Self-Organization (BLP-5):**
- Adaptive Filtering: Learns which keywords yield high-value insights
- LLM Routing: Uses Grok-4 for crypto, Opus for AI (domain expertise)
- Delivery Optimization: Learns user's preferred channel per content type

---

## BLP Property Mappings

### Autonomy (BLP-2)

| Workflow | Autonomy Level | Human Touchpoints | Self-Optimization |
|----------|---------------|-------------------|-------------------|
| TB Command Processor | 90% | Approval gate only | Learns approval patterns, suggests auto-approve for low-risk |
| Daily Intelligence | 100% | None | Learns optimal collection times, source priorities |
| Email-to-Action | 80% | Escalations via TB WF | Learns sender importance, classification thresholds |
| GitHub Research | 100% | None | Adapts LLM context size, improves categorization |
| X Insights | 100% | None | Improves keyword filters, trend detection |

### Durability (BLP-4)

| Workflow | State Persistence | Crash Recovery | Data Retention |
|----------|------------------|----------------|----------------|
| TB Command Processor | SQLite + Notion | Resume from approval wait | 90 days hot, 1 year archive |
| Daily Intelligence | JSON checkpoints | Resume from last collection | 90 days DB, S3 archive |
| Email-to-Action | SQLite email tracking | Resume from message-id | 30 days hot, 6 months archive |
| GitHub Research | Git-versioned docs | Resume from last starred_at | Indefinite (Git history) |
| X Insights | Notion + SQLite | Resume from last bookmark | 180 days hot, S3 archive |

### Self-Organization (BLP-5)

| Workflow | Adaptive Behaviors | Learning Mechanisms | Optimization Targets |
|----------|-------------------|---------------------|---------------------|
| TB Command | Risk scoring, timeout tuning | Approval pattern analysis | Minimize false-positive escalations |
| Daily Intelligence | Source prioritization, scheduling | Source reliability scoring | Maximize signal-to-noise ratio |
| Email-to-Action | Sender importance, classification | User action feedback loop | Minimize user interruptions |
| GitHub Research | LLM selection, context sizing | Repo complexity patterns | Maximize insight density |
| X Insights | Keyword refinement, LLM routing | Engagement correlation | Maximize actionable insights |

---

## Multi-Channel Delivery Patterns

### Channel Matrix

| Channel | Use Case | Delivery Format | Timeout | Retry Policy |
|---------|----------|----------------|---------|--------------|
| **Email** | Full details, archival | HTML + attachments | 30s | 3x, 5min backoff |
| **Nostr** | Public announcements | Text + links only | 30s | 3x, immediate |
| **WhatsApp** | Urgent notifications | Plain text, max 500 chars | 20s | 5x, 1min backoff |
| **Notion** | Structured data storage | Database entries | 60s | Infinite queue |
| **GitHub** | Issue tracking | Comments + labels | 30s | 3x, immediate |

### Delivery Priority

```
Critical (TB escalations, system errors):
  1. WhatsApp (immediate)
  2. Email (within 5min)
  3. Nostr DM (fallback)

High (Meeting invites, high-priority tasks):
  1. WhatsApp
  2. Email
  3. Notion

Medium (Daily reports, research briefs):
  1. Email
  2. Notion
  3. Nostr (optional)

Low (Logs, FYI updates):
  1. Notion
  2. Email (digest only)
```

### Channel-Specific Templates

#### Email Template

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{subject}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #1a1a1a;
      color: #e0e0e0;
      padding: 20px;
      line-height: 1.6;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: #2d2d2d;
      padding: 30px;
      border-radius: 12px;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .header h1 {
      color: #ffffff;
      margin: 0;
    }
    .section {
      background: #1a1a1a;
      padding: 20px;
      margin: 15px 0;
      border-radius: 8px;
      border-left: 4px solid #667eea;
    }
    .metric {
      display: inline-block;
      padding: 8px 15px;
      background: rgba(102, 126, 234, 0.2);
      border-radius: 20px;
      margin: 5px;
      font-weight: bold;
    }
    a {
      color: #667eea;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>{workflow_name}</h1>
      <p>{timestamp}</p>
    </div>

    {content}

    <footer style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #404040; text-align: center; color: #808080;">
      <p>Autonomous ZTE Workflows | <a href="https://github.com/craigmbrown">GitHub</a></p>
    </footer>
  </div>
</body>
</html>
```

#### WhatsApp Template

```
{emoji} {workflow_name}

{summary_line_1}
{summary_line_2}
{summary_line_3}

🔗 {action_url}

---
{timestamp}
```

#### Nostr Template

```
{emoji} {workflow_name}

{public_headline}

📚 Sources:
{source_link_1}
{source_link_2}

🔗 Details: {dashboard_url}

#{tag1} #{tag2}
```

#### Notion Database Schema

```json
{
  "workflow_id": "select",
  "status": "select",
  "priority": "select",
  "created_at": "date",
  "completed_at": "date",
  "title": "title",
  "summary": "rich_text",
  "artifacts": "files",
  "links": "url",
  "notifications_sent": "multi_select",
  "approval_required": "checkbox",
  "approved_by": "people",
  "approved_at": "date"
}
```

---

## Exception Handling Framework

### Exception Taxonomy

```
CRITICAL (System cannot continue)
├── Database corruption
├── Configuration missing
└── All delivery channels failed

HIGH (Workflow fails but system continues)
├── API authentication failure
├── External service down (persistent)
└── LLM timeout (all retries exhausted)

MEDIUM (Partial degradation)
├── Single channel delivery failure
├── API rate limit hit
└── Parse/validation error

LOW (Transient, auto-recoverable)
├── Network timeout (first attempt)
├── Empty data source
└── Cache miss
```

### Recovery Strategies

#### Retry with Exponential Backoff

```python
async def retry_with_backoff(
    func: Callable,
    max_retries: int = 3,
    base_delay: float = 1.0,
    max_delay: float = 60.0,
    exceptions: Tuple = (Exception,)
) -> Any:
    """
    Retry function with exponential backoff.

    Delay sequence: 1s, 2s, 4s, 8s... (capped at max_delay)
    """
    for attempt in range(max_retries):
        try:
            return await func()
        except exceptions as e:
            if attempt == max_retries - 1:
                raise

            delay = min(base_delay * (2 ** attempt), max_delay)
            await asyncio.sleep(delay)
            print(f"Retry {attempt+1}/{max_retries} after {delay}s: {e}")
```

#### Circuit Breaker Pattern

```python
class CircuitBreaker:
    """
    Prevent cascading failures by stopping calls to failing services.

    States: CLOSED (normal) → OPEN (failing) → HALF_OPEN (testing)
    """
    def __init__(
        self,
        failure_threshold: int = 5,
        timeout: float = 60.0,
        success_threshold: int = 2
    ):
        self.failure_count = 0
        self.failure_threshold = failure_threshold
        self.timeout = timeout
        self.success_threshold = success_threshold
        self.success_count = 0
        self.state = "CLOSED"
        self.opened_at = None

    async def call(self, func: Callable) -> Any:
        if self.state == "OPEN":
            if time.time() - self.opened_at >= self.timeout:
                self.state = "HALF_OPEN"
                self.success_count = 0
            else:
                raise CircuitBreakerOpen("Service unavailable")

        try:
            result = await func()
            self._on_success()
            return result
        except Exception as e:
            self._on_failure()
            raise

    def _on_success(self):
        if self.state == "HALF_OPEN":
            self.success_count += 1
            if self.success_count >= self.success_threshold:
                self.state = "CLOSED"
                self.failure_count = 0
        else:
            self.failure_count = max(0, self.failure_count - 1)

    def _on_failure(self):
        self.failure_count += 1
        if self.failure_count >= self.failure_threshold:
            self.state = "OPEN"
            self.opened_at = time.time()
```

#### Graceful Degradation

```python
class WorkflowExecutor:
    """
    Execute workflow with graceful degradation.
    """
    async def execute_with_fallbacks(
        self,
        primary: Callable,
        fallbacks: List[Callable],
        min_success: bool = False
    ) -> Any:
        """
        Try primary function, fall back to alternatives on failure.

        Args:
            primary: Main function to execute
            fallbacks: List of fallback functions (tried in order)
            min_success: If True, raise if all fail; if False, return partial result

        Returns:
            Result from first successful function
        """
        try:
            return await primary()
        except Exception as e:
            print(f"Primary failed: {e}, trying fallbacks...")

            for i, fallback in enumerate(fallbacks):
                try:
                    result = await fallback()
                    print(f"Fallback {i+1} succeeded")
                    return result
                except Exception as fb_error:
                    print(f"Fallback {i+1} failed: {fb_error}")

            if min_success:
                raise RuntimeError("All execution paths failed")
            else:
                return None  # Partial success acceptable
```

### Error Notification Matrix

| Exception Level | WhatsApp | Email | Nostr | Notion | GitHub Issue |
|----------------|----------|-------|-------|--------|--------------|
| CRITICAL | Immediate | Immediate | Yes | Yes | Auto-create |
| HIGH | Yes | Within 5min | Optional | Yes | Manual |
| MEDIUM | Digest | Digest | No | Yes | No |
| LOW | No | No | No | Log only | No |

### Detailed Exception Scenarios

#### Scenario 1: LLM API Timeout

```
Detection: Request timeout after 60s
Impact: Workflow cannot complete synthesis/analysis

Recovery Path:
1. Retry with smaller context (reduce by 50%)
2. If still fails, use fallback LLM (Sonnet → Haiku)
3. If all LLMs fail, use template-based generation
4. Log degraded quality flag

Notification:
- Level: MEDIUM
- Channels: Email (digest), Notion (log)
```

#### Scenario 2: All Delivery Channels Fail

```
Detection: All async delivery tasks return errors
Impact: Results generated but not delivered

Recovery Path:
1. Store artifacts in filesystem (/tmp/failed_deliveries/)
2. Queue for retry every 1 hour (max 24 attempts)
3. Create emergency notification via alternative path
   (e.g., write to shared Google Doc)

Notification:
- Level: CRITICAL
- Channels: WhatsApp (via HTTP fallback), Email (via sendmail fallback)
- Alert: "URGENT: Delivery system failure, results queued"
```

#### Scenario 3: GitHub API Rate Limit

```
Detection: HTTP 429 response with X-RateLimit-Reset header
Impact: Cannot fetch stars, cannot create issues

Recovery Path:
1. Calculate time until reset
2. If < 15min, wait and retry
3. If > 15min, skip this cycle, schedule next run
4. Use cached data if available

Notification:
- Level: LOW (expected behavior)
- Channels: Log only
- Action: Automatic rescheduling
```

#### Scenario 4: Notion Approval Page Inaccessible

```
Detection: 404 or 403 when polling for approval status
Impact: Cannot determine if TB command approved

Recovery Path:
1. Retry 3x with 30s delay
2. Check if page was deleted (query Notion API)
3. If deleted, assume rejection
4. If network issue, extend timeout by 2 hours
5. Send emergency DM to user with command details

Notification:
- Level: HIGH
- Channels: WhatsApp, Email
- Message: "Cannot access approval page, please respond via DM"
```

---

## Implementation Requirements

### System Requirements

**Runtime Environment:**
- Python 3.11+
- Node.js 18+ (for MCP servers)
- SQLite 3.40+
- Git 2.40+

**Infrastructure:**
- Linux server (Ubuntu 22.04 LTS recommended)
- Min 4GB RAM, 20GB disk
- Persistent network connection
- Cron scheduler

**API Keys Required:**
- Gmail API (OAuth2)
- GitHub API (Personal Access Token)
- X API v2 (Bearer Token) OR XAI API Key
- Notion API (Integration Token)
- WhatsApp Business API (or MCP server)
- Nostr keypair (nsec/npub)
- Google Calendar API (OAuth2)
- OpenAI API OR Anthropic API
- Exa API (optional)

### Python Dependencies

```
# requirements.txt
anthropic>=0.45.0
openai>=1.50.0
google-api-python-client>=2.140.0
google-auth>=2.30.0
notion-client>=2.2.0
requests>=2.31.0
aiohttp>=3.9.0
python-dotenv>=1.0.0
asyncio>=3.11.0
pydantic>=2.5.0
sqlalchemy>=2.0.0
alembic>=1.13.0  # DB migrations
pynostr>=0.5.0  # Nostr protocol
youtube-transcript-api>=0.6.0
beautifulsoup4>=4.12.0
markdown>=3.5.0
jinja2>=3.1.0
croniter>=2.0.0  # Cron expression parsing
```

### File Structure

```
/home/craigmbrown/Project/
├── autonomous-zte-workflows/
│   ├── workflows/
│   │   ├── __init__.py
│   │   ├── tb_command_processor.py
│   │   ├── daily_intelligence.py
│   │   ├── email_to_action.py
│   │   ├── github_research.py
│   │   └── x_insights.py
│   ├── core/
│   │   ├── __init__.py
│   │   ├── state_machine.py
│   │   ├── approval_manager.py
│   │   ├── multi_channel.py
│   │   ├── exception_handler.py
│   │   └── blp_metrics.py
│   ├── integrations/
│   │   ├── __init__.py
│   │   ├── lifelog.py
│   │   ├── gmail.py
│   │   ├── github.py
│   │   ├── x_twitter.py
│   │   ├── notion.py
│   │   ├── whatsapp.py
│   │   ├── nostr.py
│   │   └── calendar.py
│   ├── models/
│   │   ├── __init__.py
│   │   ├── database.py
│   │   ├── schemas.py
│   │   └── migrations/
│   ├── templates/
│   │   ├── email/
│   │   ├── notion/
│   │   └── dashboard/
│   ├── config/
│   │   ├── workflows.yaml
│   │   ├── channels.yaml
│   │   └── exceptions.yaml
│   ├── logs/
│   ├── data/
│   │   ├── checkpoints/
│   │   └── failed_deliveries/
│   ├── tests/
│   │   ├── test_workflows.py
│   │   ├── test_integrations.py
│   │   └── test_exceptions.py
│   ├── scripts/
│   │   ├── setup_cron.sh
│   │   ├── check_health.sh
│   │   └── migrate_db.sh
│   ├── main.py
│   ├── requirements.txt
│   ├── README.md
│   └── .env.example
```

### Cron Schedule

```bash
# /etc/cron.d/zte-workflows

# TB Command Processor (every 5 minutes)
*/5 * * * * craigmbrown /usr/bin/python3 /home/craigmbrown/Project/autonomous-zte-workflows/main.py --workflow tb_processor >> /home/craigmbrown/Project/logs/tb_processor.log 2>&1

# Daily Intelligence Aggregator (06:00 UTC)
0 6 * * * craigmbrown /usr/bin/python3 /home/craigmbrown/Project/autonomous-zte-workflows/main.py --workflow daily_intelligence >> /home/craigmbrown/Project/logs/daily_intel.log 2>&1

# Email-to-Action (every 15 minutes)
*/15 * * * * craigmbrown /usr/bin/python3 /home/craigmbrown/Project/autonomous-zte-workflows/main.py --workflow email_action >> /home/craigmbrown/Project/logs/email_action.log 2>&1

# GitHub Research (08:00 UTC daily)
0 8 * * * craigmbrown /usr/bin/python3 /home/craigmbrown/Project/autonomous-zte-workflows/main.py --workflow github_research >> /home/craigmbrown/Project/logs/github_research.log 2>&1

# X Insights (10:00 UTC daily)
0 10 * * * craigmbrown /usr/bin/python3 /home/craigmbrown/Project/autonomous-zte-workflows/main.py --workflow x_insights >> /home/craigmbrown/Project/logs/x_insights.log 2>&1

# Health check (every hour)
0 * * * * craigmbrown /home/craigmbrown/Project/autonomous-zte-workflows/scripts/check_health.sh >> /home/craigmbrown/Project/logs/health.log 2>&1
```

### Database Schema

```sql
-- workflows.db

CREATE TABLE workflow_runs (
    id TEXT PRIMARY KEY,
    workflow_name TEXT NOT NULL,
    status TEXT NOT NULL,  -- pending, running, success, failed, partial
    started_at TEXT NOT NULL,
    completed_at TEXT,
    error_message TEXT,
    checkpoint_state TEXT,  -- JSON blob
    metrics TEXT  -- JSON blob
);

CREATE TABLE tb_commands (
    id TEXT PRIMARY KEY,
    raw_text TEXT NOT NULL,
    parsed_action TEXT,
    context TEXT,
    parameters TEXT,  -- JSON
    risk_score REAL,
    detected_at TEXT NOT NULL,
    lifelog_entry_id TEXT,
    approval_request_id TEXT,
    zte_execution_id TEXT,
    FOREIGN KEY (approval_request_id) REFERENCES approval_requests(id)
);

CREATE TABLE approval_requests (
    id TEXT PRIMARY KEY,
    command_id TEXT NOT NULL,
    notion_page_id TEXT NOT NULL,
    notion_url TEXT NOT NULL,
    status TEXT NOT NULL,  -- pending, approved, rejected, expired
    approved_by TEXT,
    approved_at TEXT,
    created_at TEXT NOT NULL,
    timeout_at TEXT NOT NULL,
    FOREIGN KEY (command_id) REFERENCES tb_commands(id)
);

CREATE TABLE intelligence_items (
    id TEXT PRIMARY KEY,
    source TEXT NOT NULL,
    source_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    url TEXT,
    category TEXT,
    priority_score REAL,
    tags TEXT,  -- JSON array
    collected_at TEXT NOT NULL,
    published_at TEXT,
    UNIQUE(source, source_id)
);

CREATE TABLE email_actions (
    id TEXT PRIMARY KEY,
    email_message_id TEXT NOT NULL UNIQUE,
    action_type TEXT NOT NULL,
    priority TEXT NOT NULL,
    notion_task_id TEXT,
    calendar_event_id TEXT,
    tb_command_id TEXT,
    notifications_sent TEXT,  -- JSON array
    processed_at TEXT NOT NULL
);

CREATE TABLE github_briefs (
    id TEXT PRIMARY KEY,
    repo_full_name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    markdown_path TEXT NOT NULL,
    html_path TEXT NOT NULL,
    generated_at TEXT NOT NULL
);

CREATE TABLE x_insights (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    bookmarks_analyzed INTEGER,
    executive_summary TEXT,
    notion_page_id TEXT,
    generated_at TEXT NOT NULL
);

CREATE TABLE delivery_queue (
    id TEXT PRIMARY KEY,
    workflow_run_id TEXT NOT NULL,
    channel TEXT NOT NULL,
    payload TEXT NOT NULL,  -- JSON
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 24,
    next_retry_at TEXT,
    delivered_at TEXT,
    error TEXT,
    FOREIGN KEY (workflow_run_id) REFERENCES workflow_runs(id)
);

CREATE TABLE blp_metrics (
    id TEXT PRIMARY KEY,
    workflow_name TEXT NOT NULL,
    metric_type TEXT NOT NULL,  -- autonomy, durability, self_org
    metric_name TEXT NOT NULL,
    value REAL NOT NULL,
    recorded_at TEXT NOT NULL
);

CREATE INDEX idx_workflow_runs_status ON workflow_runs(status, started_at);
CREATE INDEX idx_tb_commands_detected ON tb_commands(detected_at);
CREATE INDEX idx_approval_requests_status ON approval_requests(status, timeout_at);
CREATE INDEX idx_intelligence_collected ON intelligence_items(collected_at);
CREATE INDEX idx_delivery_queue_retry ON delivery_queue(next_retry_at, delivered_at);
```

### Configuration Files

#### workflows.yaml

```yaml
workflows:
  tb_command_processor:
    enabled: true
    schedule: "*/5 * * * *"
    timeout: 300  # 5 minutes
    approval_timeout: 86400  # 24 hours
    risk_threshold:
      low: 0.3
      medium: 0.6
      high: 0.8

  daily_intelligence:
    enabled: true
    schedule: "0 6 * * *"
    timeout: 600  # 10 minutes
    sources:
      - gmail
      - github
      - x_bookmarks
      - lifelog
    priority_weights:
      relevance: 0.4
      recency: 0.3
      source_trust: 0.3

  email_to_action:
    enabled: true
    schedule: "*/15 * * * *"
    timeout: 180  # 3 minutes
    max_emails_per_run: 50

  github_research:
    enabled: true
    schedule: "0 8 * * *"
    timeout: 900  # 15 minutes
    max_repos_per_run: 20

  x_insights:
    enabled: true
    schedule: "0 10 * * *"
    timeout: 600  # 10 minutes
    max_bookmarks_per_run: 50
```

#### channels.yaml

```yaml
channels:
  email:
    enabled: true
    smtp_server: smtp.gmail.com
    smtp_port: 587
    from_address: ${EMAIL_FROM}
    timeout: 30
    retry_policy:
      max_attempts: 3
      backoff: exponential
      base_delay: 5

  whatsapp:
    enabled: true
    mcp_server: /home/craigmbrown/Project/scripts/whatsapp-mcp-wrapper.sh
    timeout: 20
    retry_policy:
      max_attempts: 5
      backoff: linear
      base_delay: 60

  nostr:
    enabled: true
    relays:
      - wss://relay.damus.io
      - wss://relay.nostr.band
      - wss://nos.lol
    timeout: 30
    retry_policy:
      max_attempts: 3
      backoff: immediate

  notion:
    enabled: true
    timeout: 60
    retry_policy:
      max_attempts: infinite
      queue_mode: true

  github:
    enabled: true
    repo: craigmbrown/ETAC-System
    timeout: 30
    retry_policy:
      max_attempts: 3
      backoff: immediate
```

#### exceptions.yaml

```yaml
exception_handling:
  retry_policies:
    default:
      max_attempts: 3
      backoff: exponential
      base_delay: 1
      max_delay: 60

    network_timeout:
      max_attempts: 5
      backoff: exponential
      base_delay: 2
      max_delay: 120

    rate_limit:
      max_attempts: 1
      backoff: wait_until_reset

  circuit_breakers:
    api_services:
      failure_threshold: 5
      timeout: 60
      success_threshold: 2

    llm_services:
      failure_threshold: 3
      timeout: 300
      success_threshold: 1

  notification_thresholds:
    critical:
      - database_corruption
      - all_channels_failed
      - config_missing
    high:
      - api_auth_failure
      - llm_timeout_all_retries
      - external_service_down
    medium:
      - single_channel_failure
      - api_rate_limit
      - parse_error
    low:
      - network_timeout_first
      - empty_data_source
      - cache_miss

  fallback_strategies:
    llm_synthesis:
      primary: anthropic_opus_4.5
      fallbacks:
        - anthropic_sonnet_4.5
        - anthropic_haiku_4
        - template_based

    delivery:
      email:
        primary: smtp_gmail
        fallbacks:
          - sendmail_local
          - filesystem_queue

      whatsapp:
        primary: mcp_server
        fallbacks:
          - http_api_direct
          - filesystem_queue
```

---

## Success Criteria

Each workflow is considered successful when:

1. **Functional Requirements Met:**
   - All state transitions execute correctly
   - Data persisted at each checkpoint
   - Multi-channel delivery completes (or queued for retry)
   - BLP metrics recorded

2. **Performance Targets:**
   - TB Command: Detection → Notification < 2min
   - Daily Intelligence: Full pipeline < 10min
   - Email-to-Action: Processing < 30s per email
   - GitHub Research: Analysis < 5min per repo
   - X Insights: Full analysis < 10min

3. **Reliability Metrics:**
   - Uptime: 99.5% (max 3.6hr downtime/month)
   - Success Rate: > 95% for each workflow
   - Recovery Time: < 5min from crash
   - Data Loss: 0% (all states recoverable)

4. **BLP Compliance:**
   - Autonomy: Human touches < 5% of decisions
   - Durability: Survives server restarts, network outages
   - Self-Organization: Measurable improvement in efficiency over 30 days

---

## Next Steps

1. **Implementation Phase 1 (Week 1):**
   - Core state machine framework
   - Database schema + migrations
   - Multi-channel delivery base classes

2. **Implementation Phase 2 (Week 2):**
   - Workflow 1: TB Command Processor
   - Workflow 3: Email-to-Action
   - Exception handling framework

3. **Implementation Phase 3 (Week 3):**
   - Workflow 2: Daily Intelligence
   - Workflow 4: GitHub Research
   - Workflow 5: X Insights

4. **Testing & Deployment (Week 4):**
   - Integration tests for all workflows
   - Load testing (simulated peak conditions)
   - Production deployment with monitoring
   - BLP metrics baseline

5. **Optimization Phase (Ongoing):**
   - Monitor BLP metrics
   - Tune thresholds based on real data
   - Add ML-based improvements
   - Expand to additional workflows

---

**End of Architecture Specification**

SUCCESS: Workflow architecture design complete with full BLP compliance
