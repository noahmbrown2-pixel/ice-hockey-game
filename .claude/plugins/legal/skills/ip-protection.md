# IP Protection Skill

Auto-triggered skill for intellectual property matters.

## Trigger Phrases

- "IP"
- "intellectual property"
- "patent"
- "trademark"
- "copyright"

## IP Categories

### Types of Intellectual Property

| Type | Protects | Duration | Registration |
|------|----------|----------|--------------|
| **Patent** | Inventions, processes | 20 years | Required |
| **Copyright** | Creative works | Life + 70 years | Automatic (registration strengthens) |
| **Trademark** | Brand identifiers | Indefinite (if maintained) | Recommended |
| **Trade Secret** | Confidential business info | Indefinite (if protected) | Not applicable |

### IP in Contracts

#### Work Product / Work for Hire
```
Key Questions:
- Who creates the IP?
- Who owns it?
- What licenses are granted?
- Are there exclusions?
```

**Typical Provisions**:
| Scenario | Typical Ownership |
|----------|-------------------|
| Employee creation | Employer owns |
| Contractor creation | Requires assignment |
| Joint development | Specify ownership |
| Customer data | Customer owns |
| Service improvements | Provider owns |

#### License Grants
```markdown
### License Analysis

**Scope**
- What: {Subject matter}
- How: {Permitted uses}
- Where: {Territory}
- When: {Duration}
- Who: {Licensee, sublicensees}

**Restrictions**
- {Restriction 1}
- {Restriction 2}

**Type**
- [ ] Exclusive
- [ ] Non-exclusive
- [ ] Sole

**Revocability**
- [ ] Irrevocable
- [ ] Terminable for cause
- [ ] Terminable at will
```

### IP Clauses Checklist

**Assignment Clauses**
- [ ] Clear ownership statement
- [ ] Moral rights waiver
- [ ] Further assurances
- [ ] Third-party assignments addressed
- [ ] Pre-existing IP carved out

**License Clauses**
- [ ] Scope clearly defined
- [ ] Sublicense rights stated
- [ ] Survival provisions
- [ ] Restrictions listed
- [ ] Audit rights (if applicable)

**Protection Clauses**
- [ ] Confidentiality obligations
- [ ] Non-compete (if applicable)
- [ ] Non-solicitation
- [ ] Return/destruction requirements

### IP Risk Areas

| Risk | Impact | Mitigation |
|------|--------|------------|
| Unclear ownership | Disputes, can't commercialize | Clear assignment language |
| Overly broad assignment | Lose valuable IP | Carve out pre-existing/unrelated |
| Missing license back | Can't use own work | Include license back provision |
| No IP warranty | Infringement exposure | Require IP indemnification |
| Open source contamination | License complications | Require open source disclosure |

### IP Due Diligence

```markdown
## IP Review Checklist

### Ownership Verification
- [ ] Chain of title documented
- [ ] Employee IP agreements in place
- [ ] Contractor assignments obtained
- [ ] No conflicting claims

### Registration Status
| Asset | Type | Registered | Status |
|-------|------|------------|--------|
| {Name} | Patent | Yes/No | {Status} |
| {Name} | Trademark | Yes/No | {Status} |
| {Name} | Copyright | Yes/No | {Status} |

### Third-Party IP
- [ ] Licenses inventory complete
- [ ] Open source audit done
- [ ] Compliance verified

### Protection Measures
- [ ] Trade secrets identified
- [ ] Confidentiality in place
- [ ] Physical/technical controls
```

### Open Source Considerations

| License Type | Can Use? | Key Obligations |
|--------------|----------|-----------------|
| MIT/BSD | Yes | Attribution |
| Apache 2.0 | Yes | Attribution, patent grant |
| LGPL | Carefully | Dynamic linking OK |
| GPL | Caution | Copyleft - derivative works |
| AGPL | Caution | Network copyleft |

**Best Practices**:
- Maintain open source inventory
- Review license compatibility
- Separate proprietary/open source
- Include in due diligence
