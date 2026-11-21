# /support:escalate

Prepare escalation briefs for complex issues.

## Usage

```
/support:escalate "Ticket ID or content"
/support:escalate "Ticket ID" --to engineering
/support:escalate "Ticket ID" --priority urgent
```

## Description

Creates comprehensive escalation packages:
1. Issue summary for receiving team
2. Full context and history
3. Customer impact assessment
4. Steps already taken
5. Recommended actions

## Options

- `--to`: Target team (engineering, billing, management, legal)
- `--priority`: Escalation priority (normal, high, urgent, critical)
- `--template`: Use specific escalation template
- `--include-logs`: Request technical logs

## Output Format

```markdown
## Escalation Brief

### Escalation Details
| Field | Value |
|-------|-------|
| Ticket ID | {id} |
| Customer | {name/company} |
| Tier | {subscription level} |
| Escalating To | {team} |
| Priority | {level} |
| Escalation Reason | {reason} |

---

### Issue Summary
**One-line**: {Concise problem statement}

**Full Description**:
{Detailed explanation of the issue}

### Customer Impact
- **Severity**: {Critical/High/Medium/Low}
- **Users Affected**: {number/scope}
- **Business Impact**: {description}
- **Duration**: {how long issue has persisted}

### Timeline
| Date/Time | Event |
|-----------|-------|
| {date} | Customer first reported issue |
| {date} | {Action taken} |
| {date} | {Escalation trigger} |

### Troubleshooting Completed
- [x] {Step 1} - Result: {outcome}
- [x] {Step 2} - Result: {outcome}
- [x] {Step 3} - Result: {outcome}
- [ ] {Step not yet attempted} - Reason: {why}

### Technical Details
```
{Error messages, logs, configuration details}
```

### Customer Communication History
**Last Response**: {date}
**Sentiment**: {current sentiment}
**Key Quotes**:
> "{Relevant customer statement}"

### Requested Action
{What the escalation team should do}

### Recommended Resolution
{Suggested approach if known}

### SLA Status
- **Current Response Time**: {time}
- **SLA Target**: {target}
- **Status**: {Within SLA/At Risk/Breached}

---

### For Engineering Escalations
**Reproduction Steps**:
1. {Step to reproduce}
2. {Step to reproduce}

**Expected Behavior**: {what should happen}
**Actual Behavior**: {what is happening}

**Environment**:
- Product version: {version}
- Browser/OS: {details}
- Account ID: {id}

### For Management Escalations
**Business Context**:
- Account value: {ARR/MRR}
- Renewal date: {date}
- Risk level: {churn risk}
- Previous escalations: {count}
```

## Escalation Triggers

### Auto-Escalate When
- P1 issue > 2 hours unresolved
- Customer explicitly requests escalation
- Legal/security concerns identified
- Data loss or breach suspected
- Enterprise customer blocked

### Consider Escalation When
- Multiple tickets for same issue
- Troubleshooting exhausted
- Product bug confirmed
- Policy exception needed

## MCP Integration

- **notionApi**: Log escalation in database
- **whatsapp**: Alert on-call for urgent escalations
