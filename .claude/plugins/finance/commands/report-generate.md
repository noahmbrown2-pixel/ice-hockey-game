# /finance:report-generate

Generate financial reports and summaries.

## Usage

```
/finance:report-generate "Report type"
/finance:report-generate "Monthly close" --period "January 2026"
/finance:report-generate "Board deck" --format presentation
```

## Description

Generates various financial reports:
1. Monthly/Quarterly close reports
2. Board financial packages
3. Investor updates
4. Department summaries
5. Executive dashboards

## Options

- `--type`: Report type (close, board, investor, department, executive)
- `--period`: Reporting period
- `--format`: Output format (narrative, dashboard, presentation)
- `--audience`: Target audience
- `--comparison`: Comparison period

## Report Templates

### Monthly Close Report

```markdown
## Monthly Financial Report
### {Month Year}

---

### Executive Summary

**Key Highlights**:
- Revenue: ${X} ({+/-}% vs plan, {+/-}% vs prior year)
- EBITDA: ${X} ({X}% margin)
- Cash Position: ${X}
- ARR: ${X} (if applicable)

**Notable Items**:
- {Significant event or variance}
- {Significant event or variance}

---

### Income Statement Summary

| Line Item | Actual | Budget | Var $ | Var % | PY | YoY |
|-----------|--------|--------|-------|-------|-----|-----|
| Revenue | $X | $X | $X | {%} | $X | {%} |
| COGS | $X | $X | $X | {%} | $X | {%} |
| Gross Profit | $X | $X | $X | {%} | $X | {%} |
| OpEx | $X | $X | $X | {%} | $X | {%} |
| EBITDA | $X | $X | $X | {%} | $X | {%} |
| Net Income | $X | $X | $X | {%} | $X | {%} |

---

### Revenue Analysis

**By Product/Segment**:
| Segment | Actual | Budget | Var |
|---------|--------|--------|-----|
| {Seg 1} | $X | $X | {%} |
| {Seg 2} | $X | $X | {%} |

**By Region**:
| Region | Actual | Budget | Var |
|--------|--------|--------|-----|
| {Reg 1} | $X | $X | {%} |
| {Reg 2} | $X | $X | {%} |

---

### Expense Analysis

**Significant Variances**:
| Category | Actual | Budget | Var | Explanation |
|----------|--------|--------|-----|-------------|
| {Cat} | $X | $X | $X | {reason} |

---

### Balance Sheet Highlights

| Item | Current | Prior Month | Change |
|------|---------|-------------|--------|
| Cash | $X | $X | $X |
| AR | $X | $X | $X |
| AP | $X | $X | $X |

---

### Cash Flow Summary

| Category | Amount |
|----------|--------|
| Operating Cash Flow | $X |
| Investing Cash Flow | ($X) |
| Financing Cash Flow | $X |
| **Net Change** | **$X** |
| Ending Cash | $X |

---

### Key Metrics

| Metric | Actual | Target | Status |
|--------|--------|--------|--------|
| Gross Margin | {X}% | {Y}% | 🟢/🟡/🔴 |
| Operating Margin | {X}% | {Y}% | 🟢/🟡/🔴 |
| DSO | {X} days | {Y} days | 🟢/🟡/🔴 |
| Burn Rate | $X/mo | $Y/mo | 🟢/🟡/🔴 |
| Runway | {X} months | {Y} months | 🟢/🟡/🔴 |

---

### Outlook

**Rest of Quarter**:
{Commentary on expected performance}

**Key Risks**:
- {Risk 1}
- {Risk 2}

**Action Items**:
- {Action from finance}

---

*Prepared by: {Name} | Date: {Date}*
```

### Board Financial Package

```markdown
## Board Financial Package
### {Period}

### Section 1: Financial Highlights
[Executive summary with key metrics]

### Section 2: P&L Review
[Detailed income statement analysis]

### Section 3: Balance Sheet
[Key balance sheet items]

### Section 4: Cash & Liquidity
[Cash position and runway]

### Section 5: Metrics & KPIs
[Key performance indicators]

### Section 6: Forecast Update
[Current forecast vs plan]

### Section 7: Capital & Financing
[Any capital-related items]

### Appendix
[Detailed schedules]
```

## MCP Integration

- **notionApi**: Store reports and access data
- **pocket-pick**: Report templates and configurations
