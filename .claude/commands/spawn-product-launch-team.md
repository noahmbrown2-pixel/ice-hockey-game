# Spawn Product Launch Team

Spawn a skill-aware team for end-to-end product launch coordination.

## Team Composition

This team includes 4 specialized agents with plugin skill mappings:

| Agent | Role | Plugin | Skills |
|-------|------|--------|--------|
| Product Manager | Lead | pm | prd-templates, prioritization-frameworks, roadmap-visualization |
| Campaign Planner | Builder | marketing | channel-optimization |
| Content Creator | Builder | marketing | copywriting-formulas |
| Sales Enablement | Researcher | sales | value-proposition, company-research |

## Required Plugins

- `pm` - Product management, PRDs, and prioritization
- `marketing` - Copywriting and campaign optimization
- `sales` - Sales enablement and value propositions

## Recommended Commands

After spawning, use these plugin commands:

```bash
/pm:write-prd "Feature Name"
/pm:prioritize "feature backlog"
/marketing:write-copy "product description"
/marketing:campaign-plan "launch strategy"
/sales:call-prep "target customer"
```

## Workflows

1. Product Manager -> Campaign Planner (launch requirements)
2. Campaign Planner -> Content Creator (campaign brief)
3. Product Manager -> Sales Enablement (product positioning)

## Checklist

- [ ] PRD finalized
- [ ] Feature prioritization complete
- [ ] Marketing copy created
- [ ] Campaign channels identified
- [ ] Sales collateral prepared
- [ ] Launch timeline set

## Usage

```bash
# Via Super Orchestrator
/super spawn product-launch team

# Direct invocation
from super_orchestrator import SuperOrchestrator
orchestrator = SuperOrchestrator()
team = orchestrator.spawn_team("product-launch-team")
```

## BLP Properties

- **BLP-041-050** (Self-Replication): Dynamic team spawning with skill-aware composition
- **BLP-001-010** (Alignment): Agents matched to product launch requirements
- **BLP-051-060** (Self-Organization): Coordinated handoffs between agents
