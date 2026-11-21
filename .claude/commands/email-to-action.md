# Email-to-Action - Autonomous ZTE Workflow

<!-- @REQ-WKFL-028: Email triage and action classification | BLP: [Autonomy: 80%, Durability: High, Self-Organization: Learning] -->

**Description:** Processes unread Gmail messages, applies priority filtering, classifies intent, and routes to appropriate actions: Create Notion Task, Schedule Calendar Meeting, or Escalate to TB Command Processor.

**Autonomy Level:** HYBRID (80% autonomous, escalations require TB approval)

**Schedule:** Every 15 minutes

---

## Workflow Steps

### 1. Fetch Unread Emails
<!-- @REQ-WKFL-029: Poll Gmail for unread messages, max 50 per run | BLP: [Autonomy: 100%, Durability: API-backed, Alignment: Filtered] -->

```python
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

def fetch_unread_emails(max_results=50):
    """Fetch unread emails from Gmail."""
    service = build('gmail', 'v1', credentials=credentials)

    # Query: unread, not spam, not in trash
    query = "is:unread -in:spam -in:trash"

    results = service.users().messages().list(
        userId='me',
        q=query,
        maxResults=max_results
    ).execute()

    messages = results.get('messages', [])

    emails = []
    for msg in messages:
        email_data = service.users().messages().get(
            userId='me',
            id=msg['id'],
            format='full'
        ).execute()

        emails.append({
            "id": msg['id'],
            "message_id": extract_message_id(email_data),
            "thread_id": email_data['threadId'],
            "subject": extract_subject(email_data),
            "from": extract_sender(email_data),
            "from_email": extract_sender_email(email_data),
            "to": extract_recipients(email_data),
            "date": extract_date(email_data),
            "snippet": email_data['snippet'],
            "body": extract_body(email_data),
            "labels": email_data['labelIds']
        })

    return emails
```

### 2. Noise Filter
<!-- @REQ-WKFL-030: Skip auto-replies, newsletters, and known noise | BLP: [Autonomy: 100%, Durability: Heuristic, Self-Organization: Learning] -->

**Filtering Heuristics:**
```python
def is_noise(email: Dict) -> bool:
    """
    Detect and filter out noise emails.

    Filters:
    - Auto-replies (headers: Auto-Submitted, X-Autoreply)
    - Newsletters (List-Unsubscribe header)
    - Known senders (noreply@, no-reply@, notifications@)
    - Calendar notifications (from Google Calendar)
    - Social media notifications (from facebook, twitter, linkedin)
    """
    # Check headers
    headers = email.get('headers', {})
    if headers.get('Auto-Submitted') or headers.get('X-Autoreply'):
        return True

    if 'List-Unsubscribe' in headers:
        return True

    # Check sender
    from_email = email['from_email'].lower()
    noise_patterns = [
        'noreply@', 'no-reply@', 'notifications@', 'donotreply@',
        'calendar-notification@google.com',
        'facebookmail.com', 'twitter.com', 'linkedin.com'
    ]

    if any(pattern in from_email for pattern in noise_patterns):
        return True

    # Check subject patterns
    subject_lower = email['subject'].lower()
    noise_subjects = [
        'unsubscribe', 'newsletter', 'weekly digest', 'daily summary',
        'automatic reply', 'out of office'
    ]

    if any(pattern in subject_lower for pattern in noise_subjects):
        return True

    return False
```

**Noise Handling:**
```python
filtered_emails = []
noise_emails = []

for email in all_emails:
    if is_noise(email):
        noise_emails.append(email)
        # Mark as processed but don't take action
        mark_email_processed(email['id'], action="ignored_noise")
    else:
        filtered_emails.append(email)

logger.info(f"Filtered {len(noise_emails)} noise emails, processing {len(filtered_emails)}")
```

### 3. LLM-Based Classification
<!-- @REQ-WKFL-031: Classify email intent and required action | BLP: [Autonomy: 100%, Durability: Structured, Self-Organization: Feedback-Learning] -->

**Classification Prompt:**
```python
def classify_email(email: Dict) -> Dict:
    """
    Use LLM to classify email priority, intent, and required action.

    Returns:
    {
      "priority": "low|medium|high|critical",
      "intent": "info|request|meeting|urgent",
      "action": "none|task|calendar|escalate",
      "confidence": 0.0-1.0,
      "extracted_info": {...}
    }
    """
    prompt = f"""
Analyze this email and classify it for automated processing:

FROM: {email['from']}
SUBJECT: {email['subject']}
DATE: {email['date']}

BODY:
{email['body'][:1500]}

Determine:

1. **Priority** (low/medium/high/critical):
   - LOW: FYI, newsletters, general updates
   - MEDIUM: Requests that can wait, informational
   - HIGH: Time-sensitive requests, meeting invitations
   - CRITICAL: Urgent issues, escalations, deadlines within 24hr

2. **Intent** (info/request/meeting/urgent):
   - INFO: Just providing information
   - REQUEST: Asking for something (action, response, decision)
   - MEETING: Scheduling or discussing a meeting
   - URGENT: Immediate action required

3. **Required Action** (none/task/calendar/escalate):
   - NONE: No action needed (mark read)
   - TASK: Create Notion task with deadline
   - CALENDAR: Schedule meeting in Google Calendar
   - ESCALATE: Hand off to TB Command Processor (complex/urgent)

4. **Confidence** (0.0-1.0): How certain are you about this classification?

5. **Extracted Info**: If MEETING or TASK, extract:
   - Date/time (ISO format)
   - Location or meeting link
   - Participants (if meeting)
   - Deadline (if task)
   - Key action items

Return JSON ONLY:
{{
  "priority": "low|medium|high|critical",
  "intent": "info|request|meeting|urgent",
  "action": "none|task|calendar|escalate",
  "confidence": 0.0-1.0,
  "extracted_info": {{
    "datetime": "ISO timestamp or null",
    "location": "string or null",
    "participants": ["email1", "email2"],
    "deadline": "ISO date or null",
    "action_items": ["item1", "item2"],
    "summary": "Brief summary of what's needed"
  }}
}}
"""

    # Use Claude Sonnet 4.5 for fast classification
    response = anthropic_sonnet_4_5(
        prompt=prompt,
        max_tokens=1000,
        temperature=0.3  # Low temperature for consistent classification
    )

    classification = json.loads(response)
    return classification
```

### 4. Action Routing
<!-- @REQ-WKFL-032: Route emails to appropriate handlers based on classification | BLP: [Autonomy: 100%, Durability: State-tracked, Alignment: User-Intent] -->

```python
async def process_emails(emails: List[Dict]):
    """Process all emails and route to appropriate actions."""
    results = {
        "ignored": [],
        "tasks_created": [],
        "meetings_scheduled": [],
        "escalated": [],
        "errors": []
    }

    for email in emails:
        try:
            # Classify email
            classification = classify_email(email)

            # Route based on action
            if classification['action'] == 'none':
                await handle_low_priority(email, classification)
                results['ignored'].append(email)

            elif classification['action'] == 'task':
                await handle_task_creation(email, classification)
                results['tasks_created'].append(email)

            elif classification['action'] == 'calendar':
                await handle_calendar_event(email, classification)
                results['meetings_scheduled'].append(email)

            elif classification['action'] == 'escalate':
                await handle_tb_escalation(email, classification)
                results['escalated'].append(email)

        except Exception as e:
            logger.error(f"Error processing email {email['id']}: {e}")
            results['errors'].append({"email": email, "error": str(e)})

    return results
```

### 5. Action Handlers

#### 5.1 Low Priority (Mark Read)
<!-- @REQ-WKFL-033: Mark low-priority emails as processed | BLP: [Autonomy: 100%, Durability: Tracked, Alignment: Clean-Inbox] -->

```python
async def handle_low_priority(email: Dict, classification: Dict):
    """Mark email as read and log as processed."""
    # Mark as read in Gmail
    gmail_service.users().messages().modify(
        userId='me',
        id=email['id'],
        body={'removeLabelIds': ['UNREAD']}
    ).execute()

    # Add "processed" label
    gmail_service.users().messages().modify(
        userId='me',
        id=email['id'],
        body={'addLabelIds': ['Label_Processed']}
    ).execute()

    # Log to database
    db.insert("email_actions", {
        "email_message_id": email['message_id'],
        "action_type": "ignored",
        "priority": classification['priority'],
        "processed_at": datetime.now().isoformat()
    })
```

#### 5.2 Task Creation (Notion)
<!-- @REQ-WKFL-034: Create Notion task with email context and deadline | BLP: [Autonomy: 100%, Durability: Persistent, Alignment: Actionable] -->

```python
async def handle_task_creation(email: Dict, classification: Dict):
    """Create Notion task from email."""
    extracted = classification['extracted_info']

    # Create Notion task
    notion_task = {
        "parent": {"database_id": NOTION_EMAIL_TASKS_DB_ID},
        "properties": {
            "Title": {
                "title": [{"text": {"content": f"Email: {email['subject'][:100]}"}}]
            },
            "Status": {"select": {"name": "To Do"}},
            "Priority": {"select": {"name": classification['priority'].capitalize()}},
            "Deadline": {
                "date": {"start": extracted.get('deadline')} if extracted.get('deadline') else None
            },
            "Source": {"url": f"https://mail.google.com/mail/u/0/#inbox/{email['id']}"},
            "From": {"rich_text": [{"text": {"content": email['from']}}]}
        },
        "children": [
            {
                "object": "block",
                "type": "heading_2",
                "heading_2": {"rich_text": [{"text": {"content": "Email Summary"}}]}
            },
            {
                "object": "block",
                "type": "paragraph",
                "paragraph": {"rich_text": [{"text": {"content": extracted.get('summary', email['snippet'])}}]}
            },
            {
                "object": "block",
                "type": "heading_3",
                "heading_3": {"rich_text": [{"text": {"content": "Action Items"}}]}
            },
            {
                "object": "block",
                "type": "bulleted_list_item",
                "bulleted_list_item": {
                    "rich_text": [{"text": {"content": item}}]
                }
            } for item in extracted.get('action_items', [])
        ]
    }

    notion_response = notion_client.pages.create(**notion_task)
    notion_task_id = notion_response['id']
    notion_url = notion_response['url']

    # Send WhatsApp notification
    await send_whatsapp(f"""
📧 New Task from Email

{email['subject']}

From: {email['from']}
Priority: {classification['priority']}
Deadline: {extracted.get('deadline', 'None')}

📝 Task: {notion_url}
""")

    # Mark email as processed
    mark_email_processed(email['id'], action="task_created", notion_task_id=notion_task_id)

    logger.info(f"Created Notion task for email: {email['subject']}")
```

#### 5.3 Calendar Event (Google Calendar)
<!-- @REQ-WKFL-035: Schedule meeting in Google Calendar with parsed details | BLP: [Autonomy: 100%, Durability: Synced, Alignment: Time-Management] -->

```python
async def handle_calendar_event(email: Dict, classification: Dict):
    """Create Google Calendar event from email."""
    extracted = classification['extracted_info']

    # Parse datetime
    if not extracted.get('datetime'):
        logger.warning(f"No datetime extracted for calendar event: {email['subject']}")
        # Fallback to task creation
        await handle_task_creation(email, classification)
        return

    event_start = parse_iso(extracted['datetime'])
    event_end = event_start + timedelta(hours=1)  # Default 1-hour meeting

    # Create calendar event
    calendar_event = {
        "summary": email['subject'],
        "description": f"From: {email['from']}\n\n{extracted.get('summary', email['snippet'])}\n\nEmail: https://mail.google.com/mail/u/0/#inbox/{email['id']}",
        "start": {
            "dateTime": event_start.isoformat(),
            "timeZone": "UTC"
        },
        "end": {
            "dateTime": event_end.isoformat(),
            "timeZone": "UTC"
        },
        "attendees": [{"email": p} for p in extracted.get('participants', [])],
        "location": extracted.get('location', ''),
        "reminders": {
            "useDefault": False,
            "overrides": [
                {"method": "email", "minutes": 60},
                {"method": "popup", "minutes": 15}
            ]
        }
    }

    calendar_service = build('calendar', 'v3', credentials=credentials)
    event_response = calendar_service.events().insert(
        calendarId='primary',
        body=calendar_event
    ).execute()

    event_id = event_response['id']
    event_link = event_response['htmlLink']

    # Send multi-channel notification
    await asyncio.gather(
        send_whatsapp(f"""
📅 Meeting Scheduled

{email['subject']}

⏰ {event_start.strftime('%Y-%m-%d %H:%M UTC')}
📍 {extracted.get('location', 'No location')}
👥 {', '.join(extracted.get('participants', []))}

🔗 {event_link}
"""),
        send_email_confirmation(email, event_link),
        post_to_nostr_dm(f"📅 Meeting scheduled: {email['subject']} at {event_start.strftime('%Y-%m-%d %H:%M')}")
    )

    # Mark email as processed
    mark_email_processed(email['id'], action="calendar_created", calendar_event_id=event_id)

    logger.info(f"Created calendar event for email: {email['subject']}")
```

#### 5.4 TB Escalation
<!-- @REQ-WKFL-036: Format email as TB command and trigger TB Auto Processor | BLP: [Autonomy: 90%, Durability: Handoff, Alignment: Complex-Routing] -->

```python
async def handle_tb_escalation(email: Dict, classification: Dict):
    """Escalate email to TB Command Processor."""
    extracted = classification['extracted_info']

    # Format as TB command
    tb_command_text = f"""
TB, handle this email:

FROM: {email['from']}
SUBJECT: {email['subject']}
RECEIVED: {email['date']}

REQUEST: {extracted.get('summary', email['snippet'])}

ACTION ITEMS:
{chr(10).join(f"- {item}" for item in extracted.get('action_items', []))}

EMAIL LINK: https://mail.google.com/mail/u/0/#inbox/{email['id']}
"""

    # Create TB command record in database
    tb_command_id = str(uuid.uuid4())
    db.insert("tb_commands", {
        "id": tb_command_id,
        "raw_text": tb_command_text,
        "parsed_action": "email_escalation",
        "context": json.dumps({"email_id": email['id'], "classification": classification}),
        "risk_score": 0.7,  # Medium-high risk for email escalations
        "detected_at": datetime.now().isoformat(),
        "lifelog_entry_id": None  # Email source, not lifelog
    })

    # Trigger TB Auto Processor workflow
    # This will create Notion approval page and wait for human approval
    subprocess.run([
        "python3",
        "/home/craigmbrown/Project/autonomous-zte-workflows/main.py",
        "--workflow", "tb_processor",
        "--command-id", tb_command_id
    ], check=True)

    # Send urgent notification
    await asyncio.gather(
        send_whatsapp(f"""
🚨 Email Escalated to TB

{email['subject']}

From: {email['from']}
Priority: {classification['priority']}

⚠️ Requires approval before execution

Approval will be sent via Nostr DM + WhatsApp
"""),
        send_email(
            to="craigmbrown@gmail.com",
            subject=f"TB Escalation: {email['subject']}",
            body=f"Email from {email['from']} has been escalated to TB Command Processor. You will receive an approval request shortly."
        )
    )

    # Mark email as processed
    mark_email_processed(email['id'], action="tb_escalated", tb_command_id=tb_command_id)

    logger.info(f"Escalated email to TB: {email['subject']}")
```

---

## Exception Handling

<!-- @REQ-WKFL-037: Handle all failure scenarios gracefully | BLP: [Durability: Self-Healing, Alignment: Reliable] -->

### Gmail API Failure
- **Detection:** 5xx errors, auth failures, timeouts
- **Recovery:** Retry 3x with exponential backoff, skip cycle if persists
- **Notification:** Email sysadmin after 3 consecutive failures
- **Degradation:** None (critical to maintain email processing)

### Classification Error
- **Detection:** LLM timeout, invalid JSON response
- **Recovery:** Use rule-based fallback classifier
- **Notification:** Log warning
- **Degradation:** Basic heuristic classification (subject keywords)

**Fallback Classifier:**
```python
def fallback_classify(email: Dict) -> Dict:
    """Rule-based classification when LLM fails."""
    subject_lower = email['subject'].lower()
    body_lower = email['body'].lower()

    # Meeting detection
    if any(kw in subject_lower for kw in ['meeting', 'call', 'zoom', 'schedule']):
        return {
            "priority": "high",
            "intent": "meeting",
            "action": "calendar",
            "confidence": 0.6,
            "extracted_info": {}
        }

    # Urgent detection
    if any(kw in subject_lower for kw in ['urgent', 'asap', 'critical', 'emergency']):
        return {
            "priority": "critical",
            "intent": "urgent",
            "action": "escalate",
            "confidence": 0.7,
            "extracted_info": {}
        }

    # Default: create task
    return {
        "priority": "medium",
        "intent": "request",
        "action": "task",
        "confidence": 0.5,
        "extracted_info": {}
    }
```

### Notion Task Creation Failure
- **Detection:** Notion API error, rate limit
- **Recovery:** Queue for retry, notify user anyway
- **Notification:** WhatsApp with manual Gmail link
- **Degradation:** Provide direct email link for manual processing

### Calendar Event Creation Failure
- **Detection:** Google Calendar API error
- **Recovery:** Create Notion task instead with meeting details
- **Notification:** Email user with .ics attachment as fallback
- **Degradation:** Manual calendar addition from .ics file

### TB Escalation Trigger Failure
- **Detection:** TB workflow unavailable or subprocess error
- **Recovery:** Queue command for retry in 5 minutes
- **Notification:** WhatsApp warning
- **Degradation:** Store command for manual review

---

## State Persistence

<!-- @REQ-WKFL-038: Idempotent processing with message-id tracking | BLP: [Durability: Idempotent, Alignment: No-Duplicates] -->

**Database Schema:**
```sql
CREATE TABLE email_actions (
    id TEXT PRIMARY KEY,
    email_message_id TEXT NOT NULL UNIQUE,  -- RFC message-id
    gmail_id TEXT NOT NULL,
    subject TEXT,
    from_email TEXT,
    action_type TEXT NOT NULL,  -- ignored, task, calendar, tb_escalate
    priority TEXT NOT NULL,
    classification TEXT,  -- JSON blob
    notion_task_id TEXT,
    calendar_event_id TEXT,
    tb_command_id TEXT,
    notifications_sent TEXT,  -- JSON array of channels
    processed_at TEXT NOT NULL,
    UNIQUE(email_message_id)  -- Prevent duplicate processing
);

CREATE INDEX idx_email_processed_at ON email_actions(processed_at);
```

**Idempotency Check:**
```python
def is_already_processed(email_message_id: str) -> bool:
    """Check if email already processed."""
    result = db.query(
        "SELECT id FROM email_actions WHERE email_message_id = ?",
        (email_message_id,)
    )
    return len(result) > 0

# Before processing
if is_already_processed(email['message_id']):
    logger.info(f"Skipping already processed email: {email['subject']}")
    continue
```

---

## BLP Metrics

<!-- @REQ-WKFL-039: Track classification accuracy and user satisfaction | BLP: [Self-Organization: Learning, Alignment: Improving] -->

### Autonomy Metrics
- **Auto-Classification Rate:** % of emails classified without fallback
- **Action Distribution:** none vs task vs calendar vs escalate
- **User Override Rate:** % of actions manually changed by user

### Durability Metrics
- **Processing Success Rate:** % of emails successfully processed
- **Idempotency:** 0 duplicate actions
- **Recovery Time:** Seconds to resume after Gmail API failure

### Self-Organization Metrics
- **Sender Importance Learning:** Track which senders lead to high-priority actions
- **Classification Accuracy:** Correlation between LLM classification and user actions
- **Optimal Polling Interval:** Learn best check frequency based on email volume

**Metric Recording:**
```python
metrics.record({
    "workflow": "email_to_action",
    "run_timestamp": datetime.now().isoformat(),
    "emails_processed": len(emails),
    "autonomy_classification_success_rate": successful_classifications / total_emails,
    "durability_processing_success_rate": successful_actions / total_emails,
    "self_org_sender_importance_accuracy": calculate_sender_accuracy(),
    "action_distribution": {
        "ignored": len(results['ignored']),
        "tasks": len(results['tasks_created']),
        "calendar": len(results['meetings_scheduled']),
        "escalated": len(results['escalated'])
    }
})
```

---

## Configuration

**Location:** `/home/craigmbrown/Project/autonomous-zte-workflows/config/workflows.yaml`

```yaml
email_to_action:
  enabled: true
  schedule: "*/15 * * * *"  # Every 15 minutes
  timeout: 180  # 3 minutes

  gmail:
    max_emails_per_run: 50
    noise_filter:
      enabled: true
      skip_auto_replies: true
      skip_newsletters: true
      known_noise_patterns:
        - "noreply@"
        - "notifications@"
        - "calendar-notification@google.com"

  classification:
    llm_model: "anthropic_sonnet_4.5"
    temperature: 0.3
    max_tokens: 1000
    fallback_to_rules: true

  actions:
    notion_tasks:
      database_id: "{NOTION_EMAIL_TASKS_DB_ID}"
      default_status: "To Do"

    google_calendar:
      calendar_id: "primary"
      default_duration_hours: 1
      reminder_minutes: [15, 60]

    tb_escalation:
      default_risk_score: 0.7
      auto_trigger: true

  notifications:
    whatsapp: true
    email_confirmation: true
    nostr_dm: false  # Only for high-priority
```

---

## Usage

**Manual Trigger:**
```bash
# Process emails now
python3 /home/craigmbrown/Project/autonomous-zte-workflows/main.py \
  --workflow email_to_action

# Test classification on specific email
python3 /home/craigmbrown/Project/autonomous-zte-workflows/main.py \
  --workflow email_to_action \
  --test-email-id <gmail_id>

# Retry failed actions
python3 /home/craigmbrown/Project/autonomous-zte-workflows/main.py \
  --workflow email_to_action \
  --retry-failed

# Show metrics
python3 /home/craigmbrown/Project/autonomous-zte-workflows/main.py \
  --workflow email_to_action \
  --metrics --days 7
```

**Cron Schedule:**
```bash
# Automatic execution every 15 minutes
*/15 * * * * /usr/bin/python3 /home/craigmbrown/Project/autonomous-zte-workflows/main.py --workflow email_to_action >> /home/craigmbrown/Project/logs/email_action.log 2>&1
```

---

## Success Criteria

- **Processing Latency:** < 30 seconds per email
- **Classification Accuracy:** > 85% (measured by user override rate)
- **Action Success Rate:** > 95% (successful task/calendar/escalation creation)
- **Idempotency:** 100% (0 duplicate actions)
- **Noise Filtering:** > 90% of noise correctly identified
- **User Interruptions:** < 15% of emails escalate to TB

---

**Auto-generated by Autonomous ZTE Workflows**
**Version:** 1.0.0
**Last Updated:** 2025-12-13
