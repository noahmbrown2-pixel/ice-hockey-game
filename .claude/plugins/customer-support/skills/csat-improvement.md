# CSAT Improvement Skill

Auto-triggered skill for improving customer satisfaction scores.

## Trigger Phrases

- "CSAT"
- "satisfaction"
- "improve rating"
- "customer happiness"
- "NPS"

## CSAT Framework

### Key Metrics

| Metric | Definition | Target |
|--------|------------|--------|
| CSAT | % satisfied (4-5 on 5-point scale) | >90% |
| NPS | Promoters - Detractors | >50 |
| CES | Effort score (1-7 scale) | <2 |
| FCR | First Contact Resolution % | >80% |
| ART | Average Response Time | Per SLA |

### CSAT Drivers

```
Customer Satisfaction
├── Resolution Quality
│   ├── Problem fully solved
│   ├── Clear explanation provided
│   └── Correct on first attempt
│
├── Response Speed
│   ├── First response time
│   ├── Time to resolution
│   └── Update frequency
│
├── Agent Quality
│   ├── Knowledge demonstrated
│   ├── Empathy shown
│   └── Communication clarity
│
└── Effort Required
    ├── Channel accessibility
    ├── Number of contacts needed
    └── Self-service available
```

## Improvement Strategies

### For Low CSAT Scores

```markdown
## CSAT Recovery Plan

### Immediate Actions
1. **Review detractor feedback**
   - Identify common themes
   - Categorize by issue type
   - Prioritize quick wins

2. **Address systemic issues**
   - KB gaps → Create articles
   - Process gaps → Update procedures
   - Training gaps → Develop materials

3. **Follow up with detractors**
   - Personal outreach within 24h
   - Listen to specific concerns
   - Offer concrete resolution

### Ongoing Improvements
- Weekly CSAT review meetings
- Agent coaching on low scores
- Process optimization sprints
```

### Response Optimization

**For Higher Satisfaction**:
```
✅ Personalize with customer name
✅ Acknowledge specific issue clearly
✅ Explain what you're doing and why
✅ Set clear expectations on timeline
✅ Proactive follow-up
✅ Confirm satisfaction before closing
```

**Avoid**:
```
❌ Generic template responses
❌ Jargon and acronyms
❌ Blame or defensiveness
❌ Over-promising
❌ Closing without confirmation
```

### Channel-Specific Tips

**Email/Ticket**:
- Use formatting for clarity
- Summarize action items
- Include next steps

**Chat/Real-time**:
- Quick acknowledgment
- Frequent updates during wait
- Clear handoff if transferring

**Phone**:
- Active listening signals
- Verbal summaries
- Follow-up confirmation email

## CSAT Analysis Template

```markdown
## CSAT Analysis Report - {Period}

### Summary
| Metric | This Period | Previous | Change |
|--------|-------------|----------|--------|
| Overall CSAT | {%} | {%} | {+/-%} |
| Response Time | {hrs} | {hrs} | {+/-} |
| FCR Rate | {%} | {%} | {+/-%} |

### Score Distribution
```
5 ⭐⭐⭐⭐⭐  ████████████████  45%
4 ⭐⭐⭐⭐     ████████████     35%
3 ⭐⭐⭐       ██████           12%
2 ⭐⭐         ██               5%
1 ⭐           █                3%
```

### Top Positive Themes
1. {Theme}: {frequency}
   > "{Sample feedback}"

2. {Theme}: {frequency}

### Top Negative Themes
1. {Theme}: {frequency}
   > "{Sample feedback}"
   **Root Cause**: {analysis}
   **Action**: {plan}

### Recommendations
1. **Quick Win**: {low effort, high impact}
2. **Investment**: {higher effort, sustained improvement}
3. **Process Change**: {structural improvement}

### Action Items
| Action | Owner | Due | Impact |
|--------|-------|-----|--------|
| {action} | {name} | {date} | {expected} |
```

## Real-Time Monitoring

### Dashboard Elements
- Current day CSAT trend
- Response time vs target
- Queue depth by priority
- Agent performance scorecard

### Alert Thresholds
- CSAT drops below 80% → Review queue
- Negative feedback → Manager notification
- Long wait times → Reassign resources
