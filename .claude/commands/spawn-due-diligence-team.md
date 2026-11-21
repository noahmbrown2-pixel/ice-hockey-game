# Spawn Due Diligence Team

Spawn a skill-aware team for comprehensive due diligence operations.

## Team Composition

This team includes 4 specialized agents with plugin skill mappings:

| Agent | Role | Plugin | Skills |
|-------|------|--------|--------|
| Contract Reviewer | Lead | legal | contract-analysis, risk-identification |
| Financial Analyst | Analyst | finance | financial-ratios, variance-analysis |
| Data Validator | Researcher | data | data-validation |
| Compliance Checker | Validator | legal | regulatory-framework |

## Required Plugins

- `legal` - Contract analysis and regulatory compliance
- `finance` - Financial statement analysis and ratios
- `data` - Data quality validation and verification

## Recommended Commands

After spawning, use these plugin commands:

```bash
/legal:review-contract "agreement.pdf"
/finance:analyze-statement "financials.xlsx"
/data:validate "data_claims.csv"
/legal:compliance-check "vendor policies"
```

## Workflows

1. Contract Reviewer -> Financial Analyst (contract terms)
2. Financial Analyst -> Compliance Checker (financial analysis)
3. Data Validator -> Compliance Checker (data validation report)

## Checklist

- [ ] Contract terms reviewed for red flags
- [ ] Financial ratios analyzed
- [ ] Data quality verified
- [ ] Regulatory compliance checked
- [ ] Risk assessment completed

## Usage

```bash
# Via Super Orchestrator
/super spawn due-diligence team

# Direct invocation
from super_orchestrator import SuperOrchestrator
orchestrator = SuperOrchestrator()
team = orchestrator.spawn_team("due-diligence-team")
```

## BLP Properties

- **BLP-041-050** (Self-Replication): Dynamic team spawning with skill-aware composition
- **BLP-001-010** (Alignment): Agents matched to due diligence requirements
