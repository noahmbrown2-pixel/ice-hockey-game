# Contract Analysis Skill

Auto-triggered skill for systematic contract review.

## Trigger Phrases

- "contract"
- "agreement"
- "terms"
- "clause"
- "provision"

## Analysis Framework

### Contract Components

```
Contract Structure
├── Preamble
│   ├── Parties
│   ├── Recitals
│   └── Effective Date
│
├── Definitions
│   └── Key term definitions
│
├── Operative Provisions
│   ├── Scope & Services
│   ├── Payment Terms
│   ├── Term & Termination
│   └── Performance Standards
│
├── Risk Allocation
│   ├── Representations & Warranties
│   ├── Indemnification
│   ├── Limitation of Liability
│   └── Insurance
│
├── Compliance
│   ├── Confidentiality
│   ├── Data Protection
│   ├── Regulatory
│   └── Audit Rights
│
├── Intellectual Property
│   ├── Ownership
│   ├── Licenses
│   └── Work Product
│
└── General Provisions
    ├── Assignment
    ├── Notices
    ├── Amendments
    ├── Severability
    ├── Entire Agreement
    └── Governing Law
```

### Key Questions by Section

**Scope & Services**
- Is the scope clearly defined?
- Are deliverables specific and measurable?
- Are acceptance criteria included?
- Who is responsible for what?

**Payment**
- What are payment terms?
- Are there price protections?
- What triggers payment?
- What are late payment consequences?

**Term & Termination**
- What is the initial term?
- Does it auto-renew?
- What are termination rights?
- What happens post-termination?

**Liability**
- What's the cap?
- What's excluded from the cap?
- Are there carve-outs?
- Is it mutual?

### Red Flags Checklist

**High Risk** 🔴
- [ ] Unlimited liability
- [ ] One-sided indemnification
- [ ] Broad IP assignment
- [ ] Unrestricted audit rights
- [ ] Termination without cause (one-sided)
- [ ] Automatic renewal with price increases

**Medium Risk** 🟡
- [ ] Vague scope definitions
- [ ] Ambiguous acceptance criteria
- [ ] Short cure periods
- [ ] Broad confidentiality exceptions
- [ ] Restrictive non-compete

**Best Practice** 🟢
- [ ] Mutual obligations
- [ ] Clear definitions
- [ ] Reasonable caps
- [ ] Balanced termination rights
- [ ] Appropriate carve-outs

### Contract Types Quick Reference

| Type | Focus Areas | Key Clauses |
|------|-------------|-------------|
| SaaS | Availability, data, license | SLA, data protection, IP |
| Services | Scope, deliverables, acceptance | SOW, acceptance, warranties |
| NDA | Information, obligations | Definition, exclusions, term |
| Employment | Terms, compensation, IP | Non-compete, IP assignment |
| Vendor | Performance, payment, liability | SLAs, indemnification, limits |

## Analysis Output Template

```markdown
### Contract Analysis Summary

**Document**: {Name}
**Type**: {Contract type}
**Review Date**: {Date}

**Overall Assessment**: {Score/Rating}

**Critical Items**:
1. {Must address}
2. {Must address}

**Negotiation Priorities**:
1. {High priority}
2. {Medium priority}
3. {Low priority}

**Recommendation**: {Proceed / Negotiate / Reject}
```
