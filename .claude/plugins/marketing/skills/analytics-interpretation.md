# Analytics Interpretation Skill

Auto-triggered skill for understanding and acting on marketing data.

## Trigger Phrases

- "metrics"
- "analytics"
- "performance"
- "ROI"
- "conversion"

## Key Metrics Framework

### Acquisition Metrics

| Metric | Definition | Good Benchmark |
|--------|------------|----------------|
| Traffic | Total visitors | Trending up |
| Traffic Sources | Where visitors come from | Diversified |
| Cost Per Click (CPC) | Paid ad cost per click | Industry varies |
| Cost Per Acquisition (CPA) | Cost to acquire customer | < LTV/3 |
| Click-Through Rate (CTR) | Clicks / Impressions | 2-5% (varies) |

### Engagement Metrics

| Metric | Definition | Good Benchmark |
|--------|------------|----------------|
| Bounce Rate | Single-page visits | <40% |
| Time on Site | Average session duration | >2 min |
| Pages per Session | Depth of visit | >2 pages |
| Scroll Depth | How far users scroll | >50% |
| Social Engagement | Likes, comments, shares | Industry varies |

### Conversion Metrics

| Metric | Definition | Good Benchmark |
|--------|------------|----------------|
| Conversion Rate | Conversions / Visitors | 2-5% |
| Lead Conversion | Leads / Visitors | 1-3% |
| MQL to SQL | Marketing to Sales qualified | 20-30% |
| Sales Conversion | Closed / Opportunities | 20-30% |
| Cart Abandonment | Abandoned / Started | <70% |

### Revenue Metrics

| Metric | Definition | Good Benchmark |
|--------|------------|----------------|
| Revenue | Total sales | Growing |
| ROAS | Return on Ad Spend | >4:1 |
| ROI | Return on Investment | >100% |
| LTV | Lifetime Value | >3× CAC |
| CAC Payback | Months to recoup CAC | <12 months |

## Analysis Patterns

### Trend Analysis
```
Look for:
- Sustained directional changes
- Seasonality patterns
- Anomalies requiring investigation

Questions:
- What changed when trend shifted?
- Is this expected (seasonality)?
- What external factors exist?
```

### Cohort Analysis
```
Compare groups over time:
- Acquisition cohorts (when acquired)
- Behavioral cohorts (actions taken)
- Demographic cohorts (characteristics)

Example:
Jan cohort: 30% retained at Day 30
Feb cohort: 35% retained at Day 30
→ Feb improvements working
```

### Funnel Analysis
```
Identify drop-off points:
Homepage → 100%
    ↓ 40% proceed
Product Page → 40%
    ↓ 25% proceed
Cart → 10%
    ↓ 60% proceed
Checkout → 6%
    ↓ 50% complete
Purchase → 3%

Biggest drop: Homepage → Product (60% loss)
Action: Improve navigation or product discovery
```

### Attribution Analysis
```
Understand channel contribution:
- First touch: What introduced them?
- Last touch: What converted them?
- Multi-touch: Full journey view

Example finding:
Social introduces, Email converts
→ Both channels valuable, different roles
```

## Dashboard Essentials

### Daily Monitoring
- Traffic (vs yesterday, vs same day last week)
- Conversions
- Revenue
- Spend (if running paid)

### Weekly Review
- All daily metrics + trends
- Channel performance comparison
- Top content performance
- Campaign performance

### Monthly Deep Dive
- Full funnel analysis
- Cohort comparisons
- Attribution review
- ROI by channel
- Recommendations

## Interpreting Changes

### Metric Increased - Good or Bad?
```
Traffic ↑ + Conversion ↓ = Quality issue
Traffic ↑ + Conversion ↑ = Success
Traffic ↓ + Conversion ↑ = Efficiency gain
Traffic ↓ + Conversion ↓ = Problem
```

### Root Cause Investigation
1. When did change start?
2. What else changed then?
3. Is it isolated or widespread?
4. What segments are affected?
5. Is it statistically significant?

## Reporting Best Practices

### Executive Summary
- Lead with key insight
- Show trend, not just number
- Compare to goal/benchmark
- One clear recommendation

### Visualization Guidelines
- Line charts for trends
- Bar charts for comparisons
- Pie charts sparingly (parts of whole)
- Tables for detailed data
