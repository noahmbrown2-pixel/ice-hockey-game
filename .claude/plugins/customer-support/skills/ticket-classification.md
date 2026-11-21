# Ticket Classification Skill

Auto-triggered skill for categorizing and routing tickets.

## Trigger Phrases

- "categorize"
- "classify"
- "ticket type"
- "priority"
- "route ticket"

## Classification Taxonomy

### Primary Categories

```
├── Bug Report
│   ├── Functional (feature not working as expected)
│   ├── Performance (slow, timeout)
│   ├── Display/UI (visual issues)
│   └── Data (incorrect data, sync issues)
│
├── Feature Request
│   ├── New functionality
│   ├── Enhancement
│   └── Integration request
│
├── How-To / Question
│   ├── Getting started
│   ├── Configuration
│   ├── Best practices
│   └── General inquiry
│
├── Account / Access
│   ├── Login issues
│   ├── Permission changes
│   ├── Account settings
│   └── Security concerns
│
├── Billing
│   ├── Charge inquiry
│   ├── Refund request
│   ├── Plan change
│   └── Invoice request
│
└── Feedback
    ├── Compliment
    ├── Complaint
    └── Suggestion
```

### Priority Matrix

```
         Impact
         High   │   Medium   │   Low
    ┌───────────┼────────────┼───────────┐
H   │    P1     │    P2      │    P3     │
i U │  Critical │   High     │  Medium   │
g r │           │            │           │
h g ├───────────┼────────────┼───────────┤
  e │    P2     │    P3      │    P4     │
M n │   High    │  Medium    │   Low     │
e c ├───────────┼────────────┼───────────┤
d y │    P3     │    P4      │    P4     │
    │  Medium   │   Low      │   Low     │
L   │           │            │           │
    └───────────┴────────────┴───────────┘
```

### Priority Definitions

| Priority | SLA | Criteria |
|----------|-----|----------|
| **P1 - Critical** | 1h response | Service down, data loss, security breach, revenue impact |
| **P2 - High** | 4h response | Major feature broken, significant impact, no workaround |
| **P3 - Medium** | 24h response | Feature degraded, workaround exists, moderate impact |
| **P4 - Low** | 48h response | Minor issue, cosmetic, enhancement, general question |

## Auto-Classification Rules

### Keyword Patterns

**P1 Indicators**:
```
- "down", "outage", "can't access", "emergency"
- "data loss", "deleted", "missing data"
- "security", "breach", "unauthorized"
- "urgent", "critical", "ASAP"
```

**Bug Indicators**:
```
- "error", "bug", "broken", "not working"
- "crash", "freeze", "stuck"
- Error codes/messages
```

**Billing Indicators**:
```
- "charge", "invoice", "payment"
- "refund", "cancel", "subscription"
- Dollar amounts
```

**How-To Indicators**:
```
- "how do I", "how to", "can I"
- "help with", "guide", "tutorial"
- Question marks without error reports
```

## Routing Rules

```markdown
## Routing Matrix

| Category | Sub-Category | Route To | Escalation Path |
|----------|--------------|----------|-----------------|
| Bug | Functional | Product Support | Engineering |
| Bug | Performance | Product Support | Infrastructure |
| Bug | Security | Security Team | Security Lead |
| Feature | Any | Product Team | Product Manager |
| Account | Access | General Support | Security |
| Account | Security | Security Team | Security Lead |
| Billing | Refund | Billing Team | Finance |
| Billing | Dispute | Billing Team | Legal |
| How-To | Any | General Support | Product Support |
```

## Classification Output

```markdown
## Ticket Classification: #{id}

### Primary Classification
- **Category**: {category}
- **Sub-category**: {sub-category}
- **Confidence**: {percentage}

### Priority Assessment
- **Priority**: P{1-4}
- **Urgency**: {High/Medium/Low}
- **Impact**: {High/Medium/Low}
- **Customer Tier**: {Enterprise/Pro/Free}

### Routing
- **Assign To**: {queue/team}
- **Skill Required**: {skill tags}

### Flags
- [ ] Potential escalation
- [ ] Requires engineering
- [ ] Legal/security sensitive
- [ ] VIP customer
```
