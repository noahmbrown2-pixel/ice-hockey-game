# /legal:review-contract

Review contracts and identify key terms, risks, and issues.

## Usage

```
/legal:review-contract "Contract text or file"
/legal:review-contract --type nda
/legal:review-contract "Contract" --focus risks --party vendor
```

## Description

Provides comprehensive contract review:
1. Key terms extraction
2. Risk identification
3. Comparison to standards
4. Issue flagging
5. Negotiation recommendations

## Options

- `--type`: Contract type (nda, msa, saas, employment, vendor)
- `--party`: Our position (customer, vendor, licensor, licensee)
- `--focus`: Review focus (risks, compliance, negotiation, summary)
- `--playbook`: Apply specific negotiation playbook
- `--redline`: Generate suggested redlines

## Output Format

```markdown
## Contract Review: {Contract Type}

### Document Overview
**Parties**: {Party A} and {Party B}
**Type**: {Contract Type}
**Effective Date**: {Date}
**Term**: {Duration}
**Governing Law**: {Jurisdiction}

---

### Executive Summary

**Overall Assessment**: {Favorable / Standard / Unfavorable / Requires Significant Negotiation}

**Key Concerns**:
1. {Critical issue}
2. {Important issue}

**Recommended Actions**:
1. {Must negotiate}
2. {Should negotiate}
3. {Consider negotiating}

---

### Key Commercial Terms

| Term | Contract Says | Market Standard | Assessment |
|------|---------------|-----------------|------------|
| Payment Terms | {X} | {Y} | 🟢/🟡/🔴 |
| Term Length | {X} | {Y} | 🟢/🟡/🔴 |
| Auto-Renewal | {X} | {Y} | 🟢/🟡/🔴 |
| Termination Rights | {X} | {Y} | 🟢/🟡/🔴 |
| Price Escalation | {X} | {Y} | 🟢/🟡/🔴 |

---

### Risk Analysis

#### High Risk Items 🔴
| Issue | Section | Risk | Recommendation |
|-------|---------|------|----------------|
| {Issue} | §{X} | {Description} | {Action} |

#### Medium Risk Items 🟡
| Issue | Section | Risk | Recommendation |
|-------|---------|------|----------------|
| {Issue} | §{X} | {Description} | {Action} |

#### Acceptable Items 🟢
- {Standard provision 1}
- {Standard provision 2}

---

### Key Clauses Analysis

#### Limitation of Liability (§{X})
**Current**: {Summary of clause}
**Assessment**: {Analysis}
**Recommendation**: {Suggested change}

#### Indemnification (§{X})
**Current**: {Summary}
**Assessment**: {Analysis}
**Recommendation**: {Suggested change}

#### Intellectual Property (§{X})
**Current**: {Summary}
**Assessment**: {Analysis}
**Recommendation**: {Suggested change}

#### Confidentiality (§{X})
**Current**: {Summary}
**Assessment**: {Analysis}
**Recommendation**: {Suggested change}

#### Data Protection (§{X})
**Current**: {Summary}
**Assessment**: {Analysis}
**Recommendation**: {Suggested change}

---

### Missing Provisions

The following standard provisions are missing:
- [ ] {Provision 1} - {Why it matters}
- [ ] {Provision 2} - {Why it matters}

---

### Negotiation Priority

| Priority | Item | Position | Fallback |
|----------|------|----------|----------|
| Must Have | {X} | {Our position} | {Minimum} |
| Important | {X} | {Our position} | {Minimum} |
| Nice to Have | {X} | {Our position} | Accept as-is |

---

### Suggested Redlines

**Section {X}**: {Current text}
**Proposed**: {Revised text}
**Rationale**: {Why}

---

*Note: This review is for business evaluation purposes. Consult qualified legal counsel before signing.*
```

## MCP Integration

- **notionApi**: Store reviews and clause library
- **pocket-pick**: Access standard positions and playbooks
