# Risk Identification Skill

Auto-triggered skill for identifying legal and contractual risks.

## Trigger Phrases

- "risk"
- "liability"
- "indemnity"
- "limitation"
- "exposure"

## Risk Categories

### Contract Risk Matrix

```
                 Likelihood
              Low    Med    High
         ┌────────┬────────┬────────┐
    High │ Medium │  High  │Critical│
Impact   ├────────┼────────┼────────┤
    Med  │  Low   │ Medium │  High  │
         ├────────┼────────┼────────┤
    Low  │  Low   │  Low   │ Medium │
         └────────┴────────┴────────┘
```

### Risk Types

**Financial Risks**
- Unlimited liability exposure
- Uncapped indemnification
- Broad warranty obligations
- Performance penalties
- Price escalation without caps

**Operational Risks**
- Unrealistic SLAs
- Broad acceptance criteria
- Restrictive use limitations
- Audit disruption potential
- Transition difficulties

**Legal/Compliance Risks**
- Regulatory non-compliance
- Data protection gaps
- Jurisdiction concerns
- Inadequate insurance
- IP infringement exposure

**Strategic Risks**
- Vendor lock-in
- Exclusivity constraints
- Non-compete impacts
- Assignment restrictions
- Termination limitations

### Risk Assessment Framework

```markdown
## Risk Assessment: {Contract/Clause}

### Identified Risk
**Risk**: {Description}
**Source**: {Section/Clause reference}
**Category**: {Financial/Operational/Legal/Strategic}

### Assessment
| Factor | Rating | Notes |
|--------|--------|-------|
| Likelihood | {L/M/H} | {Why} |
| Impact | {L/M/H} | {Why} |
| Detectability | {L/M/H} | {Why} |
| **Overall Risk** | **{Score}** | |

### Current Mitigation
{What's already in place, if any}

### Recommended Actions
1. **{Action}**: {Description}
   - Reduces: {Which factor}
   - Effort: {L/M/H}

### Residual Risk
After mitigation: {L/M/H}

### Fallback Position
If cannot mitigate: {Alternative approach}
```

### Common Risk Patterns

**Liability Section**
| Pattern | Risk | Mitigation |
|---------|------|------------|
| No cap | Unlimited exposure | Negotiate cap |
| Cap too low | Inadequate recovery | Raise cap |
| Carve-outs too broad | Cap meaningless | Narrow carve-outs |
| No mutual | One-sided exposure | Make mutual |

**Indemnification**
| Pattern | Risk | Mitigation |
|---------|------|------------|
| Indemnify all claims | Unlimited defense costs | Limit to IP/confidentiality |
| No control over defense | Settlements without consent | Add defense control |
| Broad third-party | Extended exposure | Define third parties |

**Termination**
| Pattern | Risk | Mitigation |
|---------|------|------------|
| For convenience (them only) | Sudden termination | Make mutual or remove |
| Long notice period | Stuck in bad deal | Shorten notice |
| No transition assistance | Operational disruption | Add transition clause |

### Risk Scoring Guide

| Score | Level | Action Required |
|-------|-------|-----------------|
| 1-3 | Low | Monitor |
| 4-6 | Medium | Negotiate if possible |
| 7-8 | High | Must negotiate |
| 9-10 | Critical | Do not proceed without change |

### Risk Register Template

```markdown
## Contract Risk Register

| ID | Risk | Category | Score | Owner | Status |
|----|------|----------|-------|-------|--------|
| R1 | {Risk} | Financial | 8 | Legal | Open |
| R2 | {Risk} | Operational | 5 | Ops | Mitigated |
| R3 | {Risk} | Legal | 3 | Legal | Accepted |
```
