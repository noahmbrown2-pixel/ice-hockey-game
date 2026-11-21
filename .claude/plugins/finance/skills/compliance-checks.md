# Compliance Checks Skill

Auto-triggered skill for financial compliance and controls.

## Trigger Phrases

- "compliance"
- "audit"
- "GAAP"
- "controls"
- "SOX"

## Compliance Framework

### Key Compliance Areas

```
Financial Compliance
├── Revenue Recognition (ASC 606)
├── Lease Accounting (ASC 842)
├── Stock Compensation (ASC 718)
├── Impairment Testing
└── Fair Value Measurements

Internal Controls
├── Segregation of Duties
├── Authorization Limits
├── Reconciliations
├── Access Controls
└── Documentation

Regulatory
├── SOX (Public Companies)
├── Tax Compliance
├── International Standards (IFRS)
└── Industry-Specific
```

### Revenue Recognition Checklist (ASC 606)

```markdown
## Revenue Recognition Compliance

### 5-Step Model Verification
- [ ] **Step 1**: Identify the contract
  - Written agreement exists
  - Commercial substance confirmed
  - Payment terms defined
  - Rights/obligations identifiable

- [ ] **Step 2**: Identify performance obligations
  - Distinct goods/services identified
  - Series guidance applied if applicable
  - Stand-alone selling prices documented

- [ ] **Step 3**: Determine transaction price
  - Variable consideration estimated
  - Constraining variable consideration
  - Significant financing component considered
  - Non-cash consideration valued

- [ ] **Step 4**: Allocate transaction price
  - SSP determined for each obligation
  - Allocation methodology documented
  - Discount allocation appropriate

- [ ] **Step 5**: Recognize revenue
  - Point in time vs over time determined
  - Recognition criteria met
  - Method of measuring progress defined
```

### Internal Controls Assessment

```markdown
## Internal Controls Review

### Control Categories

#### Authorization Controls
| Process | Control | Owner | Status |
|---------|---------|-------|--------|
| AP | Approval thresholds | Controller | 🟢 |
| Payroll | Manager approval | HR | 🟢 |
| Journal Entries | Dual approval >$X | Controller | 🟡 |

#### Segregation of Duties
| Process | Incompatible Duties | Status |
|---------|---------------------|--------|
| Cash | Custody vs Recording | 🟢 Separated |
| Purchasing | Ordering vs Receiving | 🟢 Separated |
| Payroll | Processing vs Review | 🟡 Review Needed |

#### Reconciliation Controls
| Account | Frequency | Last Completed | Status |
|---------|-----------|----------------|--------|
| Bank | Daily | {date} | 🟢 |
| AR | Monthly | {date} | 🟢 |
| Inventory | Quarterly | {date} | 🟡 |

#### Access Controls
| System | Review Frequency | Last Review | Issues |
|--------|------------------|-------------|--------|
| ERP | Quarterly | {date} | None |
| Bank | Monthly | {date} | None |
| Payroll | Quarterly | {date} | 1 term |
```

### SOX Compliance (if applicable)

```markdown
## SOX Compliance Status

### Key Controls Testing
| Control | Type | Testing Status | Result |
|---------|------|----------------|--------|
| {Control 1} | Preventive | Complete | Effective |
| {Control 2} | Detective | In Progress | TBD |
| {Control 3} | Preventive | Complete | Deficiency |

### Material Weaknesses: {None / Count}
### Significant Deficiencies: {Count}

### Remediation Tracker
| Issue | Owner | Due Date | Status |
|-------|-------|----------|--------|
| {Issue} | {Name} | {Date} | 🟡 In Progress |
```

### Audit Preparation Checklist

```markdown
## Audit Prep Checklist

### Documentation Ready
- [ ] Trial balance
- [ ] Bank reconciliations
- [ ] AR/AP aging reports
- [ ] Fixed asset roll-forward
- [ ] Debt schedule
- [ ] Equity roll-forward
- [ ] Revenue detail by customer
- [ ] Expense support

### Reconciliations Complete
- [ ] All balance sheet accounts
- [ ] Intercompany balances
- [ ] Subsidiary consolidation

### Supporting Schedules
- [ ] Significant estimates documented
- [ ] Related party transactions
- [ ] Subsequent events
```
