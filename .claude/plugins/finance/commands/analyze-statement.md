# /finance:analyze-statement

Analyze financial statements and extract key insights.

## Usage

```
/finance:analyze-statement "Financial data or file"
/finance:analyze-statement --type income-statement
/finance:analyze-statement --period "Q4 2025" --compare "Q3 2025"
```

## Description

Provides comprehensive financial analysis:
1. Statement parsing and structuring
2. Key metric calculations
3. Trend analysis
4. Ratio analysis
5. Insights and recommendations

## Options

- `--type`: Statement type (income-statement, balance-sheet, cash-flow)
- `--period`: Reporting period
- `--compare`: Comparison period
- `--industry`: Industry for benchmarking
- `--format`: Output format (summary, detailed, executive)

## Output Format

```markdown
## Financial Statement Analysis

### Statement Overview
**Type**: {Income Statement / Balance Sheet / Cash Flow}
**Period**: {Date Range}
**Currency**: {USD}

---

### Income Statement Analysis

#### Revenue Summary
| Line Item | Current | Prior | Change | % Change |
|-----------|---------|-------|--------|----------|
| Total Revenue | $X | $Y | $Z | {%} |
| Cost of Revenue | $X | $Y | $Z | {%} |
| **Gross Profit** | **$X** | **$Y** | **$Z** | **{%}** |

**Gross Margin**: {X}% (Prior: {Y}%)

#### Operating Expenses
| Category | Current | Prior | Change |
|----------|---------|-------|--------|
| R&D | $X | $Y | {%} |
| S&M | $X | $Y | {%} |
| G&A | $X | $Y | {%} |
| **Total OpEx** | **$X** | **$Y** | **{%}** |

**OpEx as % of Revenue**: {X}%

#### Profitability
| Metric | Current | Prior | Change |
|--------|---------|-------|--------|
| Operating Income | $X | $Y | {%} |
| EBITDA | $X | $Y | {%} |
| Net Income | $X | $Y | {%} |

**Operating Margin**: {X}%
**EBITDA Margin**: {X}%
**Net Margin**: {X}%

---

### Key Ratios

| Ratio | Value | Benchmark | Status |
|-------|-------|-----------|--------|
| Gross Margin | {X}% | {Y}% | 🟢/🟡/🔴 |
| Operating Margin | {X}% | {Y}% | 🟢/🟡/🔴 |
| Net Margin | {X}% | {Y}% | 🟢/🟡/🔴 |
| Revenue Growth | {X}% | {Y}% | 🟢/🟡/🔴 |

---

### Key Insights

**Strengths**:
1. {Positive finding with data}
2. {Positive finding with data}

**Concerns**:
1. {Area needing attention with data}
2. {Area needing attention with data}

**Trends**:
1. {Notable trend and implication}

---

### Recommendations

1. **{Area}**: {Specific recommendation}
   - Impact: {Expected benefit}
   - Priority: {High/Medium/Low}

2. **{Area}**: {Specific recommendation}
   - Impact: {Expected benefit}
   - Priority: {High/Medium/Low}
```

## MCP Integration

- **notionApi**: Store analysis in finance database
- **quick-data**: Process financial data files
- **pocket-pick**: Access historical comparisons
