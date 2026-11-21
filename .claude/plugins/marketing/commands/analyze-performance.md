# /marketing:analyze-performance

Analyze marketing campaign and channel performance.

## Usage

```
/marketing:analyze-performance
/marketing:analyze-performance --campaign "Campaign Name"
/marketing:analyze-performance --channel email --period "last 30 days"
```

## Description

Provides performance analysis:
1. Channel performance metrics
2. Campaign ROI analysis
3. Conversion funnel analysis
4. Trend identification
5. Optimization recommendations

## Options

- `--campaign`: Specific campaign to analyze
- `--channel`: Specific channel (email, social, paid, organic)
- `--period`: Time period
- `--compare`: Compare to previous period
- `--benchmark`: Include industry benchmarks

## Output Format

```markdown
## Marketing Performance Analysis

**Period**: {date range}
**Compared To**: {previous period}

---

### Executive Summary

**Overall Performance**: {Good/Needs Attention/Critical}

**Key Highlights**:
- {Top performing metric/channel}
- {Notable trend}
- {Area of concern}

---

### Channel Performance

| Channel | Spend | Revenue | ROI | vs Prior |
|---------|-------|---------|-----|----------|
| Paid Search | ${X} | ${X} | {X}% | {+/-}% |
| Paid Social | ${X} | ${X} | {X}% | {+/-}% |
| Email | ${X} | ${X} | {X}% | {+/-}% |
| Organic | ${X} | ${X} | {X}% | {+/-}% |
| **Total** | **${X}** | **${X}** | **{X}%** | |

### Channel Trends
```
Revenue by Channel (Last 6 Months)
$50K │                              ╭──
     │                        ╭─────╯
$25K │              ╭─────────╯
     │    ╭─────────╯
$0K  │────╯
     └─────────────────────────────────
       Jan   Feb   Mar   Apr   May   Jun

── Paid Search  ── Email  ── Organic
```

---

### Campaign Performance

| Campaign | Impressions | Clicks | CTR | Conv | CPA |
|----------|-------------|--------|-----|------|-----|
| {Campaign 1} | {X}K | {X} | {X}% | {X} | ${X} |
| {Campaign 2} | {X}K | {X} | {X}% | {X} | ${X} |

**Top Performer**: {Campaign name}
- Why: {Analysis of success factors}

**Needs Attention**: {Campaign name}
- Issue: {What's underperforming}
- Recommendation: {Action to take}

---

### Conversion Funnel

```
Impressions:     100,000 ████████████████████
                              ↓ 2.0% CTR
Clicks:            2,000 ████
                              ↓ 25% Conv Rate
Leads:               500 █
                              ↓ 10% Close Rate
Customers:            50 ▌
```

**Funnel Analysis**:
- Top of funnel: {Assessment}
- Middle of funnel: {Assessment}
- Bottom of funnel: {Assessment}

**Biggest Drop-off**: {Stage} → {Stage}
**Recommendation**: {How to improve}

---

### Content Performance

| Content | Views | Engagement | Conversions |
|---------|-------|------------|-------------|
| {Blog 1} | {X}K | {X}% | {X} |
| {Blog 2} | {X}K | {X}% | {X} |
| {Video 1} | {X}K | {X}% | {X} |

**Top Content**: {Title}
**Content Gap**: {Topic we should cover}

---

### Recommendations

#### Immediate Actions (This Week)
1. **{Action}**: {Expected impact}
2. **{Action}**: {Expected impact}

#### Short-term (This Month)
1. **{Action}**: {Expected impact}

#### Strategic (Next Quarter)
1. **{Action}**: {Expected impact}

---

### Key Metrics Summary

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Total Revenue | ${X} | ${X} | 🟢/🟡/🔴 |
| Marketing ROI | {X}% | {X}% | 🟢/🟡/🔴 |
| CAC | ${X} | ${X} | 🟢/🟡/🔴 |
| Lead Volume | {X} | {X} | 🟢/🟡/🔴 |
| Conversion Rate | {X}% | {X}% | 🟢/🟡/🔴 |
```

## MCP Integration

- **notionApi**: Access campaign data and store reports
- **pocket-pick**: Retrieve benchmarks and targets
