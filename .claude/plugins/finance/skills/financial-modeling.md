# Financial Modeling Skill

Auto-triggered skill for building financial models and valuations.

## Trigger Phrases

- "model"
- "DCF"
- "valuation"
- "projection"
- "financial model"

## Model Types

### Three-Statement Model

```
Income Statement
├── Revenue Drivers
├── Cost Structure
├── Operating Expenses
└── Tax & Interest

     ↓ Feeds into ↓

Balance Sheet
├── Working Capital
├── PP&E / CapEx
├── Debt Schedule
└── Equity

     ↓ Feeds into ↓

Cash Flow Statement
├── Operating CF
├── Investing CF
└── Financing CF
```

### Key Modeling Principles

1. **Build from drivers, not outputs**
2. **Separate inputs, calculations, outputs**
3. **One formula per row/column**
4. **Check with historical data**
5. **Build in error checks**

### Revenue Model Framework

```markdown
## Revenue Model

### Driver-Based Approach
| Driver | Current | Y1 | Y2 | Y3 |
|--------|---------|-----|-----|-----|
| Customers | {N} | {N} | {N} | {N} |
| Growth Rate | - | {%} | {%} | {%} |
| ARPU | ${X} | ${X} | ${X} | ${X} |
| **Revenue** | **${X}** | **${X}** | **${X}** | **${X}** |

### Cohort Model (SaaS)
| Cohort | Start | End Y1 | End Y2 | End Y3 |
|--------|-------|--------|--------|--------|
| Existing | {N} | {N} | {N} | {N} |
| New Y1 | - | {N} | {N} | {N} |
| New Y2 | - | - | {N} | {N} |
| **Total** | **{N}** | **{N}** | **{N}** | **{N}** |

Assumptions:
- Churn: {X}% annually
- Expansion: {X}% annually
- New customer growth: {X}% annually
```

### DCF Model Framework

```markdown
## DCF Valuation

### Projected Free Cash Flows
| Year | Revenue | EBITDA | FCF |
|------|---------|--------|-----|
| Y1 | $X | $X | $X |
| Y2 | $X | $X | $X |
| Y3 | $X | $X | $X |
| Y4 | $X | $X | $X |
| Y5 | $X | $X | $X |

### Terminal Value
Method: {Perpetuity Growth / Exit Multiple}

Perpetuity: FCF × (1 + g) / (WACC - g)
- Terminal Growth (g): {X}%
- WACC: {X}%
- Terminal Value: ${X}

Exit Multiple: EBITDA × Multiple
- Exit Multiple: {X}x
- Terminal Value: ${X}

### WACC Calculation
| Component | Value | Weight | Contribution |
|-----------|-------|--------|--------------|
| Cost of Equity | {X}% | {X}% | {X}% |
| Cost of Debt | {X}% | {X}% | {X}% |
| **WACC** | | | **{X}%** |

### Valuation Summary
| Component | Value |
|-----------|-------|
| PV of Cash Flows | $X |
| PV of Terminal Value | $X |
| **Enterprise Value** | **$X** |
| Less: Net Debt | ($X) |
| **Equity Value** | **$X** |
| Shares Outstanding | {N} |
| **Value per Share** | **${X}** |

### Sensitivity Analysis
| | WACC 8% | WACC 10% | WACC 12% |
|---|---------|----------|----------|
| g=2% | $X | $X | $X |
| g=3% | $X | $X | $X |
| g=4% | $X | $X | $X |
```

### LBO Model Framework

```markdown
## LBO Returns Analysis

### Transaction Structure
| Item | Amount |
|------|--------|
| Purchase Price | $X |
| Debt | $X ({X}x EBITDA) |
| Equity | $X |

### Debt Schedule
| Year | Beginning | Interest | Principal | Ending |
|------|-----------|----------|-----------|--------|
| Y1 | $X | $X | $X | $X |
| Y2 | $X | $X | $X | $X |

### Returns Analysis
| Exit Year | Exit EV | Equity Value | MoM | IRR |
|-----------|---------|--------------|-----|-----|
| Y3 | $X | $X | {X}x | {X}% |
| Y4 | $X | $X | {X}x | {X}% |
| Y5 | $X | $X | {X}x | {X}% |
```
