# Spawn Strategic Analysis Team

Spawn a skill-aware team for market research, competitive intelligence, and strategic planning.

## Team Composition

This team includes 3 specialized agents with plugin skill mappings:

| Agent | Role | Plugin | Skills |
|-------|------|--------|--------|
| Market Researcher | Lead | pm | market-analysis |
| Financial Modeler | Analyst | finance | financial-modeling |
| Intelligence Synthesizer | Researcher | enterprise-search | knowledge-synthesis |

## Required Plugins

- `pm` - Market analysis and OKR tracking
- `finance` - Financial modeling and forecasting
- `enterprise-search` - Knowledge synthesis from multiple sources

## Recommended Commands

After spawning, use these plugin commands:

```bash
/pm:competitor "market landscape"
/finance:forecast "revenue projections"
/enterprise-search:search "industry trends"
/enterprise-search:digest "competitive intel"
```

## Workflows

1. Intelligence Synthesizer -> Market Researcher (research data)
2. Market Researcher -> Financial Modeler (market insights)

## Checklist

- [ ] Competitive landscape mapped
- [ ] Market trends identified
- [ ] Financial projections created
- [ ] Strategic recommendations formulated
- [ ] Intelligence brief compiled

## Usage

```bash
# Via Super Orchestrator
/super spawn strategic-analysis team

# Direct invocation
from super_orchestrator import SuperOrchestrator
orchestrator = SuperOrchestrator()
team = orchestrator.spawn_team("strategic-analysis-team")
```

## Auto-Triggered Skills

When you say phrases like:
- "market analysis" -> market-analysis skill activated
- "competitor research" -> market-analysis skill activated
- "financial forecast" -> financial-modeling skill activated
- "aggregate intelligence" -> knowledge-synthesis skill activated

## BLP Properties

- **BLP-041-050** (Self-Replication): Dynamic team spawning with skill-aware composition
- **BLP-001-010** (Alignment): Agents matched to strategic analysis requirements
- **BLP-051-060** (Self-Organization): Coordinated intelligence gathering and synthesis
