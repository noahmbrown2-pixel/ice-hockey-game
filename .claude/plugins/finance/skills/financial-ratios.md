# Financial Ratios Skill

Auto-triggered skill for calculating and interpreting financial ratios.

## Trigger Phrases

- "ratio"
- "liquidity"
- "profitability"
- "solvency"
- "financial health"

## Ratio Categories

### Profitability Ratios

| Ratio | Formula | What It Measures |
|-------|---------|------------------|
| Gross Margin | (Revenue - COGS) / Revenue | Pricing power, cost efficiency |
| Operating Margin | Operating Income / Revenue | Operational efficiency |
| Net Margin | Net Income / Revenue | Overall profitability |
| EBITDA Margin | EBITDA / Revenue | Cash profitability |
| ROA | Net Income / Total Assets | Asset utilization |
| ROE | Net Income / Shareholders' Equity | Return to shareholders |
| ROIC | NOPAT / Invested Capital | Capital efficiency |

**Benchmarks**:
- Gross Margin: Varies by industry (SaaS: 70-80%, Retail: 25-35%)
- Operating Margin: 15-25% is healthy
- Net Margin: 10-20% is good

### Liquidity Ratios

| Ratio | Formula | What It Measures |
|-------|---------|------------------|
| Current Ratio | Current Assets / Current Liabilities | Short-term solvency |
| Quick Ratio | (Current Assets - Inventory) / Current Liabilities | Immediate liquidity |
| Cash Ratio | Cash / Current Liabilities | Cash coverage |
| Working Capital | Current Assets - Current Liabilities | Operational liquidity |

**Benchmarks**:
- Current Ratio: 1.5-2.0 is healthy
- Quick Ratio: >1.0 is good
- Cash Ratio: Varies, but >0.2 is comfortable

### Solvency Ratios

| Ratio | Formula | What It Measures |
|-------|---------|------------------|
| Debt-to-Equity | Total Debt / Total Equity | Leverage level |
| Debt-to-Assets | Total Debt / Total Assets | Asset financing |
| Interest Coverage | EBIT / Interest Expense | Debt service ability |
| Debt Service Coverage | NOI / Total Debt Service | Loan repayment ability |

**Benchmarks**:
- Debt-to-Equity: <1.0 is conservative, 1-2 is moderate
- Interest Coverage: >3x is healthy

### Efficiency Ratios

| Ratio | Formula | What It Measures |
|-------|---------|------------------|
| Asset Turnover | Revenue / Total Assets | Asset efficiency |
| Inventory Turnover | COGS / Average Inventory | Inventory management |
| Receivables Turnover | Revenue / Average AR | Collection efficiency |
| Payables Turnover | COGS / Average AP | Payment practices |
| DSO | 365 / Receivables Turnover | Days to collect |
| DPO | 365 / Payables Turnover | Days to pay |
| DIO | 365 / Inventory Turnover | Days inventory held |
| Cash Conversion Cycle | DSO + DIO - DPO | Working capital cycle |

### SaaS/Tech Metrics

| Metric | Formula | Benchmark |
|--------|---------|-----------|
| ARR Growth | (Current ARR - Prior ARR) / Prior ARR | >100% early, >30% mature |
| Net Revenue Retention | (Starting + Expansion - Churn) / Starting | >100% is good, >120% is excellent |
| CAC Payback | CAC / (ARPU × Gross Margin) | <12 months |
| LTV/CAC | LTV / CAC | >3x is healthy |
| Rule of 40 | Growth Rate + Profit Margin | >40% |
| Magic Number | Net New ARR / Prior Quarter S&M | >0.75 is efficient |

## Ratio Analysis Output

```markdown
## Financial Ratio Analysis: {Company/Period}

### Profitability
| Ratio | Value | Benchmark | Trend | Status |
|-------|-------|-----------|-------|--------|
| Gross Margin | {X}% | {Y}% | ↑/↓ | 🟢/🟡/🔴 |
| Operating Margin | {X}% | {Y}% | ↑/↓ | 🟢/🟡/🔴 |
| Net Margin | {X}% | {Y}% | ↑/↓ | 🟢/🟡/🔴 |
| ROE | {X}% | {Y}% | ↑/↓ | 🟢/🟡/🔴 |

**Analysis**: {Interpretation}

### Liquidity
| Ratio | Value | Benchmark | Status |
|-------|-------|-----------|--------|
| Current Ratio | {X} | {Y} | 🟢/🟡/🔴 |
| Quick Ratio | {X} | {Y} | 🟢/🟡/🔴 |

**Analysis**: {Interpretation}

### Solvency
| Ratio | Value | Benchmark | Status |
|-------|-------|-----------|--------|
| Debt/Equity | {X} | {Y} | 🟢/🟡/🔴 |
| Interest Coverage | {X}x | {Y}x | 🟢/🟡/🔴 |

**Analysis**: {Interpretation}

### Key Insights
1. {Insight based on ratio analysis}
2. {Insight based on ratio analysis}
```
