# /finance:expense-categorize

Categorize and analyze expenses.

## Usage

```
/finance:expense-categorize "Expense data"
/finance:expense-categorize --period "January 2026"
/finance:expense-categorize --uncategorized-only
```

## Description

Categorizes and analyzes expense data:
1. Automatic categorization
2. Anomaly detection
3. Trend analysis
4. Policy compliance checking
5. Optimization recommendations

## Options

- `--period`: Time period to analyze
- `--uncategorized-only`: Only process uncategorized items
- `--vendor`: Analyze by vendor
- `--employee`: Analyze by employee
- `--policy-check`: Flag policy violations

## Expense Categories

```
Expense Categories
├── Personnel
│   ├── Salaries & Wages
│   ├── Benefits
│   ├── Payroll Taxes
│   └── Contractor Fees
│
├── Operations
│   ├── Rent & Facilities
│   ├── Utilities
│   ├── Insurance
│   └── Office Supplies
│
├── Technology
│   ├── Software/SaaS
│   ├── Hardware
│   ├── Cloud Services
│   └── Telecommunications
│
├── Marketing
│   ├── Advertising
│   ├── Events
│   ├── Content
│   └── Tools & Subscriptions
│
├── Travel & Entertainment
│   ├── Airfare
│   ├── Lodging
│   ├── Meals
│   └── Ground Transportation
│
└── Professional Services
    ├── Legal
    ├── Accounting
    ├── Consulting
    └── Recruiting
```

## Output Format

```markdown
## Expense Analysis: {Period}

### Summary
**Total Expenses**: ${X}
**Transactions**: {count}
**Categories Used**: {count}
**Uncategorized**: {count}

---

### By Category

| Category | Amount | % of Total | vs Budget | vs Prior |
|----------|--------|------------|-----------|----------|
| Personnel | $X | {%} | {+/-}% | {+/-}% |
| Technology | $X | {%} | {+/-}% | {+/-}% |
| Operations | $X | {%} | {+/-}% | {+/-}% |
| Marketing | $X | {%} | {+/-}% | {+/-}% |
| T&E | $X | {%} | {+/-}% | {+/-}% |
| Professional | $X | {%} | {+/-}% | {+/-}% |
| **Total** | **$X** | **100%** | | |

---

### Top Vendors

| Vendor | Category | Amount | Transactions |
|--------|----------|--------|--------------|
| {Vendor 1} | {Cat} | $X | {n} |
| {Vendor 2} | {Cat} | $X | {n} |
| {Vendor 3} | {Cat} | $X | {n} |
| {Vendor 4} | {Cat} | $X | {n} |
| {Vendor 5} | {Cat} | $X | {n} |

---

### Anomalies Detected

⚠️ **Unusual Transactions**:
| Date | Vendor | Amount | Flag |
|------|--------|--------|------|
| {date} | {vendor} | $X | {reason} |

⚠️ **Category Anomalies**:
- {Category} spending {X}% above normal
- {Vendor} charges inconsistent with historical

---

### Policy Compliance

| Policy | Status | Issues |
|--------|--------|--------|
| T&E Limits | 🟢 Compliant | 0 violations |
| Approval Thresholds | 🟡 Warning | 3 pending |
| Vendor Contracts | 🟢 Compliant | 0 issues |

**Violations Found**: {count}
| Date | Description | Policy | Amount |
|------|-------------|--------|--------|
| {date} | {desc} | {policy} | $X |

---

### Trends

```
Monthly Expense Trend
$200K │                              ╭──
      │                        ╭─────╯
$150K │                  ╭─────╯
      │            ╭─────╯
$100K │──────╭─────╯
      └─────────────────────────────────
        Jul  Aug  Sep  Oct  Nov  Dec
```

**Observations**:
- {Trend observation 1}
- {Trend observation 2}

---

### Optimization Opportunities

1. **{Opportunity}**: Save ~$X/month
   - Action: {Recommendation}

2. **{Opportunity}**: Save ~$X/month
   - Action: {Recommendation}

---

### Recently Categorized

| Transaction | Auto-Category | Confidence |
|-------------|---------------|------------|
| {desc} | {category} | {%} |
| {desc} | {category} | {%} |
```

## MCP Integration

- **notionApi**: Store expense data and reports
- **quick-data**: Process expense files
- **pocket-pick**: Vendor and category mappings
