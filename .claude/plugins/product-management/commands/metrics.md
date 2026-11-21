# /pm:metrics

Define and track product metrics and KPIs.

## Usage

```
/pm:metrics
/pm:metrics --define "Feature Name"
/pm:metrics --dashboard
/pm:metrics --review weekly
```

## Description

Manages product metrics:
1. Define success metrics for features
2. Set up tracking frameworks
3. Generate metric dashboards
4. Review performance against targets
5. Identify trends and anomalies

## Options

- `--define`: Define metrics for a feature
- `--dashboard`: Generate metrics dashboard
- `--review`: Review period (daily, weekly, monthly, quarterly)
- `--compare`: Compare periods
- `--alert`: Set up metric alerts

## Metric Categories

### Acquisition Metrics
- New user signups
- Traffic sources
- Conversion rates
- Cost per acquisition

### Engagement Metrics
- Daily/Monthly Active Users (DAU/MAU)
- Session duration
- Feature adoption rate
- Return visit frequency

### Retention Metrics
- Churn rate
- Retention curves (D1, D7, D30)
- Net Promoter Score (NPS)
- Customer lifetime value (LTV)

### Business Metrics
- Revenue (MRR/ARR)
- Average Revenue Per User (ARPU)
- Gross margin
- Customer acquisition cost (CAC)

## Output Format

### Metric Definition
```markdown
## Metrics: {Feature Name}

### Primary Metric
**Name**: {metric name}
**Definition**: {exact definition}
**Target**: {specific goal}
**Measurement**: {how it's tracked}
**Frequency**: {how often measured}

### Secondary Metrics
| Metric | Definition | Target | Current |
|--------|------------|--------|---------|
| {metric} | {definition} | {target} | {value} |

### Leading Indicators
- {Indicator that predicts success}

### Guardrail Metrics
- {Metric to ensure we don't break other things}
```

### Metrics Dashboard
```markdown
## Product Metrics Dashboard - {Date}

### Key Performance Indicators

┌─────────────────────────────────────────────────────────┐
│  DAU          MAU          Retention     Revenue       │
│  12.5K        45.2K        68%          $125K MRR     │
│  ↑ 8%         ↑ 12%        ↓ 2%         ↑ 15%         │
└─────────────────────────────────────────────────────────┘

### Trends (Last 30 Days)
```
DAU
15K │                                    ╭──
    │                              ╭─────╯
10K │                    ╭─────────╯
    │          ╭─────────╯
 5K │──────────╯
    └─────────────────────────────────────────
      Week 1    Week 2    Week 3    Week 4
```

### Feature Metrics
| Feature | Adoption | Engagement | Satisfaction |
|---------|----------|------------|--------------|
| Search v2 | 78% | High | 4.2/5 |
| Dashboard | 92% | Medium | 3.8/5 |
| API | 45% | High | 4.5/5 |

### Alerts
⚠️ Retention dropped below 70% threshold
✅ Revenue target achieved for month
```

### Weekly Review
```markdown
## Metrics Review - Week of {Date}

### Highlights
- DAU grew 8% week-over-week
- New feature adoption at 78% in first week
- Revenue on track for quarterly target

### Concerns
- Retention down 2 points
- Support tickets up 15%

### Actions
1. Investigate retention drop in cohort analysis
2. Review support ticket themes
3. A/B test onboarding improvement
```

## MCP Integration

- **notionApi**: Store metric definitions and reports
- **quick-data**: Query and analyze metric data
- **pocket-pick**: Cache frequently accessed metrics
