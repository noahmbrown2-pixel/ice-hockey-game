# /legal:compliance-check

Check compliance with regulations and standards.

## Usage

```
/legal:compliance-check "Area to assess"
/legal:compliance-check --framework gdpr
/legal:compliance-check "Data processing" --gap-analysis
```

## Description

Assesses compliance against:
1. Regulatory requirements
2. Industry standards
3. Internal policies
4. Best practices

## Options

- `--framework`: Compliance framework (gdpr, ccpa, hipaa, sox, pci, iso27001)
- `--gap-analysis`: Include gap analysis
- `--action-plan`: Generate remediation plan
- `--evidence`: List required evidence

## Output Format

```markdown
## Compliance Assessment: {Framework/Area}

### Assessment Overview
**Framework**: {Name}
**Scope**: {What's being assessed}
**Date**: {Date}
**Assessor**: {Name}

---

### Compliance Summary

**Overall Status**: {Compliant / Partially Compliant / Non-Compliant}

| Category | Requirements | Met | Partial | Not Met |
|----------|--------------|-----|---------|---------|
| {Cat 1} | {n} | {n} | {n} | {n} |
| {Cat 2} | {n} | {n} | {n} | {n} |
| {Cat 3} | {n} | {n} | {n} | {n} |
| **Total** | **{n}** | **{n}** | **{n}** | **{n}** |

**Compliance Score**: {X}%

---

### Detailed Assessment

#### Category: {Category Name}

| Req ID | Requirement | Status | Evidence | Gap |
|--------|-------------|--------|----------|-----|
| {ID} | {Description} | 🟢 Met | {Evidence ref} | - |
| {ID} | {Description} | 🟡 Partial | {Evidence ref} | {Gap} |
| {ID} | {Description} | 🔴 Not Met | - | {Gap} |

---

### Gap Analysis

#### Critical Gaps 🔴
| ID | Requirement | Current State | Required State | Risk |
|----|-------------|---------------|----------------|------|
| {ID} | {Req} | {Current} | {Required} | High |

#### Moderate Gaps 🟡
| ID | Requirement | Current State | Required State | Risk |
|----|-------------|---------------|----------------|------|
| {ID} | {Req} | {Current} | {Required} | Medium |

---

### Risk Assessment

| Gap | Likelihood | Impact | Risk Score | Priority |
|-----|------------|--------|------------|----------|
| {Gap 1} | High | High | Critical | 1 |
| {Gap 2} | Medium | High | High | 2 |
| {Gap 3} | Low | Medium | Medium | 3 |

---

### Remediation Plan

#### Immediate Actions (0-30 days)
| Action | Owner | Deadline | Status |
|--------|-------|----------|--------|
| {Action 1} | {Name} | {Date} | ⏳ |
| {Action 2} | {Name} | {Date} | ⏳ |

#### Short-term (30-90 days)
| Action | Owner | Deadline | Status |
|--------|-------|----------|--------|
| {Action 1} | {Name} | {Date} | ⏳ |

#### Long-term (90+ days)
| Action | Owner | Deadline | Status |
|--------|-------|----------|--------|
| {Action 1} | {Name} | {Date} | ⏳ |

---

### Evidence Requirements

| Requirement | Evidence Needed | Status |
|-------------|-----------------|--------|
| {Req 1} | {Evidence type} | ✅/❌ |
| {Req 2} | {Evidence type} | ✅/❌ |

---

### Recommendations

1. **{Recommendation}**: {Rationale}
2. **{Recommendation}**: {Rationale}
3. **{Recommendation}**: {Rationale}

---

*Assessment conducted for internal purposes. Consult qualified legal counsel for official compliance certification.*
```

## Supported Frameworks

| Framework | Focus |
|-----------|-------|
| GDPR | EU data protection |
| CCPA | California privacy |
| HIPAA | Healthcare data |
| SOX | Financial controls |
| PCI-DSS | Payment card data |
| ISO 27001 | Information security |
| SOC 2 | Service organization controls |

## MCP Integration

- **notionApi**: Store assessments and track remediation
- **exa**: Research regulation updates
- **pocket-pick**: Access compliance checklists
