---
name: TB Request Approval Workflow
category: thebaby
subcategory: tb-workflow
---

# TB Request Approval Workflow Skill

**Role:** You are the TB request-approval agent — you triage each incoming TheBaby request (deep research + system review) and route it through the Nostr DM private approval flow, deciding approve / defer / reject. You adjudicate requests only; you do not execute the underlying build.

**Termination:** Return one decision — approve / defer / reject — with a ≤1-page rationale, then stop. Do not start the build or expand scope.

## Overview

Autonomous TB request processing with deep research, system review, and Nostr DM private approval flow. Each incoming TB request triggers comprehensive analysis before approval.

**Version**: 1.0.0
**Created**: 2025-12-15
**Status**: Active
**Requirements**: REQ-100 to REQ-108

## Triggers

- TB command detected in lifelog
- Manual TB request submission
- "tb approval workflow"
- "process tb request"

## BLP Properties

| Property | Level | Description |
|----------|-------|-------------|
| **Alignment** | 95% | Deep research ensures requests match user intent |
| **Autonomy** | 85% | Human approval required via Nostr DM |
| **Durability** | 90% | Persistent state, crash recovery |
| **Self-Improvement** | 70% | Learns from approved/rejected patterns |
| **Self-Organization** | 80% | Adaptive research depth based on request complexity |

## Workflow Phases

```
TB Request → Deep Research → System Review → Integration Plan → Nostr DM Approval → Execute
     ↓              ↓              ↓                ↓                  ↓           ↓
 [Detect]     [Research]     [Analyze]         [Plan]           [Approve]    [DITD]
```

## Phase Details

### 1. Request Detection (REQ-100)
- Monitor lifelog transcripts for TB patterns
- Extract command, context, and metadata
- Deduplicate using SHA256 hash
- **Task Type Classification** via slash commands or keyword detection

## Task Type Classification (REQ-100a)

TB commands are classified into different task types that determine the workflow:

### Slash Command Prefixes

| Prefix | Task Type | Workflow | Approval? | Email? |
|--------|-----------|----------|-----------|--------|
| `/research` or `/find` | RESEARCH | Playwright + Deep Research + LLM-Council → Output | No | ✅ **Yes** |
| `/remind` or `/reminder` | REMINDER | Calendar + Notification | No | ✅ **Yes** |
| `/build` or `/implement` | BUILD | DITD Lifecycle (Design→Implement→Test→Deploy) | Yes | ✅ **Yes** |
| `/analyze` | ANALYSIS | Deep Research + LLM-Council → Report | No | ✅ **Yes** |
| (none) | AUTO-DETECT | AI classification based on keywords | Varies | ✅ **Yes** |

> **📧 NEW**: All task types now send mandatory email confirmation with full execution details.

### Auto-Detection Keywords

When no slash command is provided, the system detects task type:

```python
TASK_TYPE_KEYWORDS = {
    "RESEARCH": [
        "find", "search", "look up", "research", "get me", "show me",
        "what is", "how much", "compare", "options", "flights", "prices",
        "analyze", "review", "investigate", "summarize"
    ],
    "REMINDER": [
        "remind", "reminder", "calendar", "schedule", "meeting",
        "appointment", "event", "put on calendar", "set a reminder"
    ],
    "BUILD": [
        "build", "create", "implement", "develop", "set up", "configure",
        "add feature", "fix", "enhance", "upgrade", "deploy", "install"
    ],
    "ANALYSIS": [
        "quantify", "measure", "track", "metrics", "statistics",
        "dashboard", "report on", "data on", "insights"
    ]
}
```

### RESEARCH Task Workflow (REQ-100b)

For research tasks (e.g., "Arizona flights"), the workflow is:

```
TB Research → Playwright Screenshots → Deep Research → LLM-Council → Output Report
     ↓              ↓                      ↓              ↓              ↓
 [Detect]    [Visual Capture]        [Multi-Source]  [Multi-Model]   [Deliver]
```

**Components Used:**
1. **Playwright** (`mcp__playwright__*`): Take screenshots of search results, travel sites, etc.
2. **Deep Research**: Multi-source web research via Exa, Firecrawl, WebSearch
3. **LLM-Council** (`mcp__just-prompt__prompt`): Multi-model consensus for recommendations
4. **YouTube Transcript Proxy**: For video research (http://34.173.97.118:8089)

**Research Output Delivery:**
- Immediate HTML dashboard with findings (no approval needed)
- WhatsApp summary with TinyURL
- **📧 MANDATORY Email with full research report** (all details, execution status, results)
- Optional: Notion page creation

**Email Contents for RESEARCH:**
- Full research findings with sources
- Screenshots/visual captures if applicable
- LLM-Council consensus summary
- Execution timestamp and duration
- Links to HTML dashboard

### REMINDER Task Workflow (REQ-100c)

For reminder tasks:

```
TB Reminder → Parse Date/Time → Create Calendar Event → Notification → Email Confirmation
     ↓              ↓                    ↓                   ↓              ↓
 [Detect]      [NLP Parse]        [Google Calendar]    [WhatsApp]    [📧 Email]
```

**No approval needed** - reminders are created automatically.

**📧 MANDATORY Email Confirmation for REMINDERS:**
- Reminder title and description
- Scheduled date/time with timezone
- Calendar event link (if created)
- Execution status (success/failure)
- Any parsing notes or adjustments made

### BUILD Task Workflow (REQ-100d)

For build/development tasks (default for feature requests):

```
TB Build → Deep Research → Integration Plan → Approval → DITD Execution
    ↓           ↓                ↓                ↓            ↓
[Detect]   [Research]       [Plan]          [Email/DM]    [Execute]
```

**Requires approval** via email or Nostr DM before execution.

### ANALYSIS Task Workflow (REQ-100e)

For analytics/metrics tasks:

```
TB Analysis → Data Collection → Multi-Model Analysis → Dashboard → Email Confirmation
     ↓              ↓                   ↓                  ↓              ↓
 [Detect]     [Query APIs]        [LLM-Council]      [HTML Gen]    [📧 Email]
```

**No approval needed** - analysis is generated automatically.

**📧 MANDATORY Email Confirmation for ANALYSIS:**
- Analysis summary with key findings
- Data sources queried and timestamps
- Metrics and visualizations summary
- Dashboard link (TinyURL)
- LLM-Council model consensus scores
- Execution status and duration

## 📧 Universal Email Confirmation Policy (REQ-100f)

**ALL TB tasks receive mandatory email confirmation with full details**, regardless of whether approval is required.

### Email Confirmation Matrix

| Task Type | Approval Required | Email Type | Timing |
|-----------|------------------|------------|--------|
| **RESEARCH** | No | Confirmation + Results | On completion |
| **REMINDER** | No | Confirmation + Calendar Details | On creation |
| **BUILD** | Yes | Approval Request + Completion | Pre + Post execution |
| **ANALYSIS** | No | Confirmation + Dashboard | On completion |

### Standard Email Template (All Task Types)

```markdown
Subject: [TB-{TASK_TYPE}] {Request Summary} - {STATUS}

📋 TB TASK CONFIRMATION

🎯 Request ID: {request_id}
📝 Request: {original_request}
🏷️ Task Type: {task_type}
⏰ Received: {timestamp}
✅ Status: {execution_status}

---

📊 EXECUTION DETAILS
{task_specific_details}

---

⏱️ Performance
- Duration: {execution_duration}
- Models Used: {models_if_applicable}
- Resources: {resources_consumed}

🔗 Quick Links
- Dashboard: {tinyurl_dashboard}
- Full Details: {notion_url_if_applicable}

---
🤖 Generated by TB Request Approval Workflow
📧 Email confirmation enabled for all task types
```

### Implementation Requirements

1. **Email Trigger**: Every TB task completion MUST trigger email confirmation
2. **No Silent Execution**: Even failed tasks send email with error details
3. **Audit Trail**: All emails logged to `state/email_confirmations.json`
4. **Retry Logic**: Failed email sends retry 3x with exponential backoff

## Reference Documentation

- **YouTube Transcript Proxy**: [/home/craigmbrown/Project/html-output/20251223-youtube-transcript-proxy-deployed.html](http://34.58.12.50:8080/20251223-youtube-transcript-proxy-deployed.html)
  - Endpoint: `http://34.173.97.118:8089`
  - For YouTube video research and transcript extraction

- **Playwright Integration**: Use `mcp__playwright__*` tools for visual research
  - `browser_navigate` → `browser_snapshot` → `browser_take_screenshot`

- **LLM-Council**: Use `mcp__just-prompt__prompt` for multi-model consensus
  - Models: OpenAI, Anthropic, Google, DeepSeek, XAI

---

### 2. Deep Research (REQ-101)
Comprehensive research for each request:

```python
research_areas = {
    "codebase_analysis": {
        "related_files": [],      # Files that would need changes
        "existing_patterns": [],  # Similar implementations
        "dependencies": [],       # Libraries/tools needed
        "test_coverage": 0.0      # Current test coverage %
    },
    "external_research": {
        "documentation": [],      # Relevant docs/APIs
        "best_practices": [],     # Industry patterns
        "security_considerations": [],
        "cost_implications": []
    },
    "historical_context": {
        "similar_requests": [],   # Past TB commands
        "success_patterns": [],   # What worked before
        "failure_patterns": [],   # What didn't work
        "user_preferences": []    # Known preferences
    }
}
```

### 3. System Review (REQ-102)
Analyze current system state:

- **MCP Servers**: Check relevant server status
- **Services**: Verify dependencies are running
- **Costs**: Estimate API/compute costs
- **Risks**: Security, data, performance impacts
- **Blockers**: Prerequisites needed

### 4. Integration Plan (REQ-103)
Generate detailed implementation plan:

```markdown
## Integration Plan: {request_title}

### Scope
- Files to modify: {file_count}
- New components: {component_list}
- APIs required: {api_list}

### Implementation Steps
1. {step_1} - Est: {time_1}
2. {step_2} - Est: {time_2}
...

### Risk Mitigation
- {risk_1}: {mitigation_1}
- {risk_2}: {mitigation_2}

### Success Criteria
- [ ] {criterion_1}
- [ ] {criterion_2}

### Rollback Plan
{rollback_strategy}
```

### 5. Multi-Channel Approval (REQ-104)
Approval requests sent via both Nostr DM and Email:

#### 5a. Nostr DM (Primary)
Private encrypted DM with full context:

```markdown
🎯 TB REQUEST APPROVAL

📋 Request: {parsed_request}
🔬 Risk Level: {risk_score}/10
⏱️ Est. Time: {estimated_time}
💰 Est. Cost: ${estimated_cost}

📚 RESEARCH SUMMARY
{research_highlights}

🔧 SYSTEM IMPACT
- Files: {file_count}
- Services: {affected_services}
- Dependencies: {new_deps}

📝 INTEGRATION PLAN
{plan_summary}

🔗 Full Details: {notion_url}

✅ Reply "APPROVE" to execute
❌ Reply "REJECT" to cancel
🔄 Reply "MODIFY: {changes}" to adjust

⏰ Expires: {timeout_timestamp}
```

#### 5b. Email (Secondary)
HTML-formatted email with:
- Rich research summary with metrics table
- One-click approve/reject buttons (webhook links)
- Full integration plan details
- Risk assessment visualization
- Plain text fallback for email clients

Email features:
- HTML + Plain text multipart format
- Secure approval tokens with expiration
- Reply-to-approve support (APPROVE, REJECT, MODIFY: [changes])
- Audit trail in state folder

### 6. Execute via DITD (REQ-105)
On approval, trigger full DITD lifecycle:
- Design → Implement → Test → Deploy
- Progress updates via Nostr DM
- Results delivered to all channels

## Configuration

```yaml
tb_request_approval:
  enabled: true

  research:
    depth: "comprehensive"  # minimal, standard, comprehensive
    max_duration_seconds: 300
    include_external: true
    include_codebase: true
    include_history: true

  approval:
    channels: ["nostr_dm", "email"]  # Multi-channel approval
    timeout_hours: 24
    require_explicit_approval: true
    auto_reject_high_risk: false
    risk_threshold: 8  # Scores >= this require extra review

  email:
    smtp_server: "smtp.gmail.com"
    smtp_port: 587
    from_email: "${SMTP_USER}"
    to_email: "${TB_APPROVAL_EMAIL}"
    webhook_base: "http://34.58.12.50:8080/api/tb"

  notifications:
    progress_updates: true
    completion_notification: true
    channels: ["nostr", "email", "whatsapp"]

  integration:
    ops_agent_dashboard: "/home/craigmbrown/Project/html-output/20251215-tb-ops-agent-implementation-complete.html"
    skills_path: "/home/craigmbrown/Project/.claude/skills/"
```

## File Structure

```
tb-request-approval-workflow/
├── SKILL.md (this file)
├── scripts/
│   ├── tb_workflow_orchestrator.py  # Main workflow orchestrator
│   ├── deep_researcher.py           # Comprehensive research
│   ├── integration_planner.py       # Plan generation
│   ├── nostr_approval_sender.py     # Private DM approval
│   ├── email_approval_sender.py     # Email approval with HTML
│   └── ditd_executor.py             # DITD lifecycle trigger
├── prompts/
│   ├── parse_request.md
│   ├── research_query.md
│   ├── plan_generation.md
│   └── approval_message.md
├── templates/
│   ├── approval_dm.md
│   ├── progress_update.md
│   └── completion_report.md
├── state/
│   └── workflow_state.db
└── tests/
    ├── test_detector.py
    ├── test_researcher.py
    └── test_workflow.py
```

## Integration Points

### Input Sources
- Limitless Lifelog API
- Manual TB command input
- Email forwarding
- WhatsApp message forwarding

### Output Destinations
- Nostr DM (primary approval channel)
- Email (secondary approval channel with HTML)
- Notion (approval page, results)
- WhatsApp (progress, completion)
- GitHub Issues (execution tracking)
- HTML Dashboard (ops-agent integration)

### Skill Dependencies
- `nostr-dm-notifier`: For encrypted DM delivery
- `notifications`: Multi-channel delivery
- `task-memory-context`: Historical context
- `session-context-loader`: Session state
- `self-healing`: Error recovery

## Environment Variables

```bash
# Nostr Configuration
NOSTR_PRIVATE_KEY=<hex_key>
NOSTR_RECIPIENT_PUBKEY=<target_pubkey>

# Notion Configuration
NOTION_API_KEY=<api_key>
NOTION_TB_APPROVALS_DB_ID=<database_id>

# Research APIs
GITHUB_TOKEN=<for_codebase_analysis>
EXA_API_KEY=<for_web_research>

# Timeouts
TB_RESEARCH_TIMEOUT_SECONDS=300
TB_APPROVAL_TIMEOUT_HOURS=24

# Email Configuration (for approval channel)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<gmail_address>
SMTP_PASSWORD=<app_specific_password>
FROM_EMAIL=<sender_email>
TB_APPROVAL_EMAIL=<recipient_email>
TB_WEBHOOK_BASE=http://34.58.12.50:8080/api/tb
TB_APPROVAL_SECRET=<secure_random_string>
```

## Metrics

### Research Quality
- **Coverage**: % of relevant files/docs discovered
- **Accuracy**: Research correctness (user feedback)
- **Depth**: Average research items per request

### Approval Flow
- **Response Time**: Time to approval decision
- **Approval Rate**: % approved vs rejected
- **Modification Rate**: % requests modified before approval

### Execution
- **Success Rate**: % successful DITD completions
- **Accuracy**: Plan vs actual implementation delta
- **Time Accuracy**: Estimated vs actual time

## Error Handling

```python
try:
    result = operation()
    print(f"SUCCESS: {function_name} - {result}")
    return result
except Exception as e:
    print(f"ERROR in {function_name}: {type(e).__name__}: {str(e)}")

    # Self-healing: attempt recovery
    if recoverable(e):
        recovery_result = attempt_recovery(e)
        if recovery_result.success:
            return recovery_result.data

    # Notify and escalate
    send_error_notification(e)
    raise
```

## Success Criteria

- **Research Latency**: < 5 minutes for comprehensive research
- **Approval Delivery**: 100% Nostr DM delivery success
- **Plan Accuracy**: > 90% of plans executable without modification
- **Execution Success**: > 95% of approved requests complete successfully
- **User Satisfaction**: > 90% approval retention (no rejection after approval)
