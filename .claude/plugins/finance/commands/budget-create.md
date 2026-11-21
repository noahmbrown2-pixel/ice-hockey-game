# /finance:budget-create

Create and manage budgets with variance analysis.

## Usage

```
/finance:budget-create "Department or project"
/finance:budget-create "Marketing" --period "FY2026"
/finance:budget-create "Project Alpha" --template zero-based
```

## Description

Creates comprehensive budgets:
1. Line item budgeting
2. Zero-based budgeting option
3. Historical trend incorporation
4. Variance tracking setup
5. Approval workflow

## Options

- `--period`: Budget period (monthly, quarterly, annual)
- `--template`: Budget template (incremental, zero-based, activity-based)
- `--from-actuals`: Base on historical actuals
- `--scenarios`: Create multiple scenarios

## Output Format

```markdown
## Budget: {Department/Project}

### Budget Overview
**Period**: {FY/Quarter}
**Owner**: {Budget Owner}
**Status**: {Draft/Approved}
**Created**: {Date}

---

### Budget Summary

| Category | Annual Budget | Monthly Avg |
|----------|---------------|-------------|
| Personnel | ${X} | ${X} |
| Technology | ${X} | ${X} |
| Marketing | ${X} | ${X} |
| Operations | ${X} | ${X} |
| Other | ${X} | ${X} |
| **Total** | **${X}** | **${X}** |

---

### Monthly Budget Breakdown

| Month | Personnel | Tech | Marketing | Ops | Total |
|-------|-----------|------|-----------|-----|-------|
| Jan | $X | $X | $X | $X | $X |
| Feb | $X | $X | $X | $X | $X |
| Mar | $X | $X | $X | $X | $X |
| ... | ... | ... | ... | ... | ... |
| **Total** | **$X** | **$X** | **$X** | **$X** | **$X** |

---

### Line Item Detail

#### Personnel (${Total})
| Line Item | Budget | Notes |
|-----------|--------|-------|
| Salaries | $X | {FTE count} |
| Benefits | $X | {X}% of salary |
| Contractors | $X | {projects} |
| Training | $X | {programs} |

#### Technology (${Total})
| Line Item | Budget | Notes |
|-----------|--------|-------|
| SaaS/Subscriptions | $X | {tools} |
| Infrastructure | $X | {services} |
| Equipment | $X | {items} |

#### [Other categories...]

---

### Assumptions

1. **Headcount**: {X} FTEs, {Y} contractors
2. **Inflation**: {X}% applied to applicable items
3. **Growth**: {X}% revenue growth assumed
4. **Key Initiatives**: {List major investments}

---

### Scenarios (if applicable)

| Scenario | Total Budget | vs Base |
|----------|--------------|---------|
| Base Case | $X | - |
| Conservative | $X | -{Y}% |
| Aggressive | $X | +{Y}% |

---

### Variance Tracking Template

| Category | Budget | Actual | Variance | % Var |
|----------|--------|--------|----------|-------|
| Personnel | $X | - | - | - |
| Technology | $X | - | - | - |
| Marketing | $X | - | - | - |
| **Total** | **$X** | - | - | - |

---

### Approval Status

| Approver | Status | Date |
|----------|--------|------|
| {Name} | ⏳ Pending | - |
| {Name} | ⏳ Pending | - |
```

## MCP Integration

- **notionApi**: Store and track budgets
- **pocket-pick**: Access budget templates
