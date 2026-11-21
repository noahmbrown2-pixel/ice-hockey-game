# User Research Skill

Auto-triggered skill for synthesizing user feedback and insights.

## Trigger Phrases

- "user feedback"
- "customer insights"
- "user needs"
- "what do users want"
- "user research"

## Research Methods

### 1. Feedback Synthesis

Aggregate feedback from multiple sources:

```markdown
## User Feedback Summary: {Topic}

### Sources Analyzed
- Support tickets: 45 mentions
- NPS surveys: 23 comments
- User interviews: 8 sessions
- Social media: 12 mentions

### Top Themes

| Theme | Frequency | Sentiment | Priority |
|-------|-----------|-----------|----------|
| {Theme 1} | 35% | Negative | High |
| {Theme 2} | 28% | Mixed | Medium |
| {Theme 3} | 20% | Positive | Low |

### Representative Quotes
> "{Direct user quote}" - {User type}

> "{Direct user quote}" - {User type}

### Insights
1. **{Insight}**: {Supporting evidence}
2. **{Insight}**: {Supporting evidence}

### Recommendations
- {Actionable recommendation}
- {Actionable recommendation}
```

### 2. Persona Development

```markdown
## Persona: {Name}

### Demographics
- **Role**: {job title}
- **Company size**: {range}
- **Industry**: {industry}
- **Technical level**: {low/medium/high}

### Goals
1. {Primary goal}
2. {Secondary goal}
3. {Tertiary goal}

### Pain Points
1. {Frustration or challenge}
2. {Frustration or challenge}

### Behaviors
- Uses product {frequency}
- Prefers {interaction style}
- Values {attribute}

### Quote
> "{Representative quote that captures their perspective}"

### Journey Stage
{Awareness → Consideration → Decision → Onboarding → Active Use → Expansion}
```

### 3. Jobs to Be Done (JTBD)

```markdown
## Job to Be Done: {Job}

### Job Statement
When {situation}, I want to {motivation}, so I can {expected outcome}.

### Context
- **Trigger**: What prompts this job?
- **Constraints**: What limits solutions?
- **Alternatives**: How do they do it today?

### Functional Needs
- {What the product must do}

### Emotional Needs
- {How they want to feel}

### Social Needs
- {How they want to be perceived}

### Success Criteria
- {Measurable outcome}
```

### 4. Interview Synthesis

```markdown
## Interview Summary: {Session ID}

**Participant**: {anonymized identifier}
**Date**: {date}
**Duration**: {time}
**Interviewer**: {name}

### Key Observations
1. {Observation with behavioral evidence}
2. {Observation with behavioral evidence}

### Notable Quotes
> "{Quote}" - Context: {situation}

### Pain Points Identified
- {Pain point}: {Severity 1-5}

### Feature Requests
- {Request}: {Underlying need}

### Satisfaction Signals
- {What they like and why}

### Follow-up Questions
- {Questions for future research}
```

## Analysis Patterns

### Affinity Mapping
Group related feedback into themes:
```
Theme: {Name}
├── Quote 1
├── Quote 2
├── Observation 1
└── Support ticket pattern
```

### Sentiment Analysis
Categorize feedback:
- 😊 Positive (promoter)
- 😐 Neutral (passive)
- 😞 Negative (detractor)

### Impact/Frequency Matrix
```
        High Impact
            │
   Address  │   Priority
   Soon     │   Focus
────────────┼────────────
   Monitor  │   Quick
            │   Wins
            │
        Low Impact
   Low Freq ───── High Freq
```

## MCP Integration

- **notionApi**: Store research findings
- **pocket-pick**: Quick access to personas
- **exa**: External research sources
