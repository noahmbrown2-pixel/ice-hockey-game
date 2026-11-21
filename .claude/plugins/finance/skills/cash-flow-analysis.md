# Cash Flow Analysis Skill

Auto-triggered skill for cash flow and working capital analysis.

## Trigger Phrases

- "cash flow"
- "working capital"
- "runway"
- "burn rate"

## Cash Flow Framework

### Cash Flow Statement Structure

```
Operating Activities
├── Net Income
├── + Depreciation/Amortization
├── + Stock-Based Compensation
├── +/- Working Capital Changes
│   ├── Accounts Receivable
│   ├── Inventory
│   ├── Prepaid Expenses
│   ├── Accounts Payable
│   └── Accrued Expenses
└── = Cash from Operations

Investing Activities
├── Capital Expenditures
├── Acquisitions
├── Investment Purchases/Sales
└── = Cash from Investing

Financing Activities
├── Debt Issuance/Repayment
├── Equity Issuance
├── Dividends
├── Stock Repurchases
└── = Cash from Financing

Net Change in Cash = Operating + Investing + Financing
```

### Key Metrics

| Metric | Formula | What It Means |
|--------|---------|---------------|
| Operating Cash Flow | Net income + Non-cash + WC changes | Cash from operations |
| Free Cash Flow | Operating CF - CapEx | Available cash |
| Cash Conversion Ratio | Operating CF / Net Income | Earnings quality |
| Burn Rate | (Starting - Ending Cash) / Months | Cash consumption |
| Runway | Current Cash / Monthly Burn | Months of cash left |

### Working Capital Analysis

```markdown
## Working Capital Analysis

### Summary
| Item | Current | Prior | Change |
|------|---------|-------|--------|
| Current Assets | $X | $X | $X |
| Current Liabilities | $X | $X | $X |
| **Working Capital** | **$X** | **$X** | **$X** |

### Components
| Component | Days | Trend | Benchmark |
|-----------|------|-------|-----------|
| DSO | {X} days | ↑/↓ | {Y} days |
| DIO | {X} days | ↑/↓ | {Y} days |
| DPO | {X} days | ↑/↓ | {Y} days |
| **CCC** | **{X} days** | | |

### Cash Conversion Cycle
```
DSO ({X} days) + DIO ({Y} days) - DPO ({Z} days) = CCC ({N} days)

Cash tied up in operations: ${amount}
```

### Working Capital Efficiency
- AR Collection: {Improving/Declining}
- Inventory Management: {Improving/Declining}
- AP Optimization: {Opportunity exists / Optimized}
```

### Burn Rate & Runway Analysis

```markdown
## Runway Analysis

### Current Position
| Metric | Value |
|--------|-------|
| Cash & Equivalents | $X |
| Monthly Burn Rate | $X |
| Runway | {X} months |

### Burn Rate Trend
| Month | Cash | Burn | Runway |
|-------|------|------|--------|
| Jan | $X | $X | {N} mo |
| Feb | $X | $X | {N} mo |
| Mar | $X | $X | {N} mo |

### Scenarios
| Scenario | Monthly Burn | Runway |
|----------|--------------|--------|
| Current | $X | {N} months |
| Reduced (-20%) | $X | {N} months |
| Growth (+30%) | $X | {N} months |

### Cash Conservation Options
1. {Option}: Save ${X}/month, extend {Y} months
2. {Option}: Save ${X}/month, extend {Y} months
```

### Free Cash Flow Analysis

```markdown
## Free Cash Flow Analysis

### FCF Calculation
| Item | Amount |
|------|--------|
| Operating Cash Flow | $X |
| Less: CapEx | ($X) |
| **Free Cash Flow** | **$X** |

### FCF Margin
FCF / Revenue = {X}%

### FCF Trend
```
$2M │                        ╭──────
    │                  ╭─────╯
$0M │────────────╭─────╯
    │      ╭─────╯
-$2M│──────╯
    └─────────────────────────────
      Q1   Q2   Q3   Q4   Q1   Q2
```

### FCF Uses
- Debt repayment: ${X}
- Dividends: ${X}
- Buybacks: ${X}
- M&A/Investments: ${X}
- Cash accumulation: ${X}
```
