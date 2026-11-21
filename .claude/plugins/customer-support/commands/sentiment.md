# /support:sentiment

Analyze customer sentiment and frustration level.

## Usage

```
/support:sentiment "Customer message"
/support:sentiment --ticket "Ticket ID"
/support:sentiment --thread "Conversation thread"
```

## Description

Analyzes customer communications to:
1. Detect sentiment and frustration level
2. Identify escalation signals
3. Track sentiment changes over conversation
4. Suggest appropriate response tone
5. Flag at-risk customers

## Options

- `--ticket`: Analyze by ticket ID
- `--thread`: Analyze full conversation thread
- `--compare`: Compare sentiment over time
- `--alerts`: Set up sentiment alerts

## Sentiment Levels

| Level | Description | Response Strategy |
|-------|-------------|-------------------|
| 😊 Positive | Happy, grateful | Maintain momentum, ask for feedback |
| 😐 Neutral | Factual, calm | Professional, solution-focused |
| 😟 Concerned | Worried, uncertain | Reassure, provide clear path |
| 😤 Frustrated | Annoyed, impatient | Empathize, prioritize resolution |
| 😡 Angry | Very upset, escalating | De-escalate, acknowledge, act fast |

## Output Format

```markdown
## Sentiment Analysis

### Current Message
**Sentiment**: {Positive/Neutral/Concerned/Frustrated/Angry}
**Frustration Score**: {1-10}
**Confidence**: {percentage}

### Indicators Detected

**Negative Signals**:
- "{quoted phrase}" → {interpretation}
- "{quoted phrase}" → {interpretation}

**Positive Signals**:
- "{quoted phrase}" → {interpretation}

**Escalation Flags**:
- ⚠️ {Flag}: {evidence}
- ⚠️ {Flag}: {evidence}

---

### Thread Analysis (if applicable)

```
Sentiment Over Time:
Message 1: 😐 Neutral     ████████░░ 8/10 Frustration
Message 2: 😟 Concerned   ██████████ 10/10
Message 3: 😤 Frustrated  ████████░░ 8/10 (slight improvement)
           ↓
Trend: {Improving/Stable/Declining}
```

### Customer Context
- **Previous Interactions**: {sentiment history}
- **Account Status**: {tier, tenure}
- **Churn Risk**: {Low/Medium/High}

---

### Recommended Response

**Tone**: {Recommended tone}
**Priority**: {Elevated/Normal}

**Opening Statement Suggestions**:
> "{Empathetic opening appropriate to sentiment}"
> "{Alternative opening}"

**Avoid**:
- {Phrases to avoid given sentiment}
- {Approaches to avoid}

---

### Action Items
- [ ] {Immediate action if high frustration}
- [ ] {Follow-up action}
- [ ] {Manager notification if needed}
```

## Escalation Triggers

### Auto-Alert When
- Frustration score ≥ 8
- Explicit escalation request
- Threat to cancel/leave
- Legal language detected
- Multiple frustrated messages in thread

### Keywords Flagged
```
High Priority: "cancel", "lawsuit", "lawyer", "BBB", "refund", "fraud"
Medium: "unacceptable", "disappointed", "worst", "never again"
Escalation: "manager", "supervisor", "escalate", "CEO"
```

## Trend Tracking

```markdown
## Customer Sentiment History: {Customer ID}

| Date | Ticket | Sentiment | Resolution |
|------|--------|-----------|------------|
| {date} | #{id} | 😐 Neutral | Resolved |
| {date} | #{id} | 😤 Frustrated | Escalated |
| {date} | #{id} | 😊 Positive | Resolved |

**Overall Trend**: {Improving/Stable/Concerning}
**Recommended Action**: {Proactive outreach/Monitor/Standard}
```

## MCP Integration

- **notionApi**: Access ticket history
- **pocket-pick**: Store sentiment rules
