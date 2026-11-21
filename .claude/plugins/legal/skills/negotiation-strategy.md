# Negotiation Strategy Skill

Auto-triggered skill for contract negotiation approaches.

## Trigger Phrases

- "negotiate"
- "redline"
- "counter"
- "fallback"
- "position"

## Negotiation Framework

### Position Planning

```markdown
## Negotiation Position: {Issue}

### Our Positions
| Level | Position | Rationale |
|-------|----------|-----------|
| **Ideal** | {Best outcome} | {Why we want it} |
| **Target** | {Realistic goal} | {Why it's reasonable} |
| **Walkaway** | {Minimum acceptable} | {Below this, no deal} |

### Their Likely Position
**Expected**: {What they'll likely propose}
**Reasoning**: {Why they want it}

### BATNA (Best Alternative)
{What we do if no deal}

### ZOPA (Zone of Possible Agreement)
{Range where agreement is possible}
```

### Negotiation Tactics

**Opening**
- Start with aspirational position
- Anchor high/low depending on side
- Don't reveal walkaway early

**Middle**
- Trade, don't give
- Use "if...then" language
- Package issues for trades

**Closing**
- Summarize agreements
- Confirm understanding
- Document immediately

### Common Strategies by Clause

#### Limitation of Liability
| Their Position | Counter | Fallback |
|----------------|---------|----------|
| No cap | Cap at contract value | Higher cap with carve-outs |
| Low cap | Raise to annual fees | Multi-year fees |
| Broad carve-outs | Narrow to specific events | Mutual carve-outs |

#### Indemnification
| Their Position | Counter | Fallback |
|----------------|---------|----------|
| Broad indemnity | Limit to IP/confidentiality | Add fault requirement |
| Unlimited | Subject to liability cap | Carve-out from cap |
| No defense control | Add defense control | Approval over settlement |

#### Termination
| Their Position | Counter | Fallback |
|----------------|---------|----------|
| Terminate for convenience (them) | Remove or make mutual | Add notice period |
| Short cure period | Extend to 30 days | Tiered by severity |
| No transition help | Add 90-day transition | Paid transition services |

### Redlining Best Practices

**Do**:
- Track changes clearly
- Explain changes in comments
- Propose alternatives, not just deletions
- Be consistent in approach
- Focus on material issues

**Don't**:
- Make too many changes at once
- Redline formatting issues
- Leave unexplained deletions
- Forget to address their concerns
- Negotiate via email alone

### Negotiation Template

```markdown
## Negotiation Summary: {Contract}

### Parties
**Us**: {Our company/role}
**Them**: {Counterparty}

### Key Issues

#### Issue 1: {Liability Cap}
**Their Position**: {What they proposed}
**Our Position**: {What we want}
**Status**: {Agreed/Open/Escalate}
**Resolution**: {If resolved}

#### Issue 2: {Issue Name}
[Same structure]

### Agreed Terms
| Issue | Resolution |
|-------|------------|
| {Issue 1} | {Agreement} |
| {Issue 2} | {Agreement} |

### Open Issues
| Issue | Their Position | Our Position | Next Step |
|-------|----------------|--------------|-----------|
| {Issue} | {Position} | {Position} | {Action} |

### Timeline
- [ ] Send redline by {date}
- [ ] Call scheduled for {date}
- [ ] Target close: {date}
```

### Escalation Framework

**Escalate When**:
- Issue materially affects risk profile
- Standard position is rejected
- Requires business decision
- Time is running out

**Escalation Package**:
1. Issue summary
2. Their position
3. Our standard position
4. Recommended approach
5. Risks of each option
