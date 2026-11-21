# /support:triage

Categorize and prioritize support tickets.

## Usage

```
/support:triage "Ticket content or ID"
/support:triage --batch "List of tickets"
/support:triage --queue "Queue name"
```

## Description

Analyzes support tickets to:
1. Categorize by issue type
2. Assess priority and urgency
3. Identify sentiment and frustration level
4. Suggest routing/assignment
5. Flag potential escalations

## Options

- `--batch`: Process multiple tickets
- `--queue`: Triage all tickets in a queue
- `--auto-assign`: Suggest agent assignment
- `--sla`: Check SLA status

## Output Format

```markdown
## Ticket Triage: {Ticket ID}

### Classification
| Field | Value | Confidence |
|-------|-------|------------|
| Category | {Bug/Feature Request/How-To/Billing/Account} | {%} |
| Sub-category | {specific type} | {%} |
| Product Area | {area} | {%} |
| Priority | {P1/P2/P3/P4} | - |

### Priority Assessment
**Score**: {P1-P4}
**Reasoning**:
- Impact: {Single user/Multiple users/All users}
- Urgency: {Blocking/Degraded/Inconvenience}
- Customer tier: {Enterprise/Pro/Free}
- SLA status: {Within SLA/At risk/Breached}

### Sentiment Analysis
**Frustration Level**: {Low/Medium/High/Critical}
**Indicators**:
- {Language pattern indicating sentiment}
- {Escalation signals}

### Suggested Actions
1. **Route to**: {Team/Agent}
2. **Priority**: Respond within {timeframe}
3. **Template**: {Suggested response template}
4. **KB articles**: {Relevant articles}

### Escalation Flags
⚠️ {Flag if applicable}
- {Reason for potential escalation}
```

### Batch Triage Output

```markdown
## Queue Triage Summary

| Ticket | Category | Priority | Sentiment | Suggested Route |
|--------|----------|----------|-----------|-----------------|
| #1234 | Bug | P2 | High | Engineering |
| #1235 | How-To | P3 | Low | General |
| #1236 | Billing | P2 | Medium | Billing Team |

### Urgent Items (Immediate Attention)
- #1234: Customer blocked, high frustration
- #1236: Billing dispute, time-sensitive

### Statistics
- Total: {n} tickets
- P1/P2: {n} ({%})
- High frustration: {n} ({%})
- Potential escalations: {n}
```

## Priority Definitions

| Priority | Response Time | Criteria |
|----------|---------------|----------|
| P1 | 1 hour | Service down, data loss, security |
| P2 | 4 hours | Major feature broken, blocking issue |
| P3 | 24 hours | Degraded function, workaround exists |
| P4 | 48 hours | Minor issue, enhancement request |

## MCP Integration

- **notionApi**: Read/update ticket database
- **pocket-pick**: Access triage rules and patterns
