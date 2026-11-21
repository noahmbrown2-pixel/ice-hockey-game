# Spawn Customer Success Team

Spawn a skill-aware team for customer satisfaction, retention, and support excellence.

## Team Composition

This team includes 4 specialized agents with plugin skill mappings:

| Agent | Role | Plugin | Skills |
|-------|------|--------|--------|
| Ticket Triage | Lead | support | ticket-classification |
| Response Drafter | Builder | support | empathy-patterns |
| Customer Analyst | Analyst | data | statistical-analysis |
| Satisfaction Optimizer | Coordinator | support | csat-improvement, analytics-interpretation |

## Required Plugins

- `support` - Ticket classification, empathy patterns, CSAT improvement
- `data` - Statistical analysis and customer insights
- `marketing` - Analytics interpretation (shared skill)

## Recommended Commands

After spawning, use these plugin commands:

```bash
/support:triage "customer ticket content"
/support:draft-response "frustrated customer message"
/support:sentiment "customer feedback batch"
/data:analyze "churn data"
```

## Workflows

1. Ticket Triage -> Response Drafter (classified ticket)
2. Customer Analyst -> Satisfaction Optimizer (customer insights)
3. Response Drafter -> Satisfaction Optimizer (response metrics)

## Checklist

- [ ] Tickets triaged and prioritized
- [ ] Customer responses drafted
- [ ] Sentiment analysis completed
- [ ] CSAT trends analyzed
- [ ] Improvement actions identified

## Usage

```bash
# Via Super Orchestrator
/super spawn customer-success team

# Direct invocation
from super_orchestrator import SuperOrchestrator
orchestrator = SuperOrchestrator()
team = orchestrator.spawn_team("customer-success-team")
```

## Auto-Triggered Skills

When you say phrases like:
- "frustrated customer" -> empathy-patterns skill activated
- "triage tickets" -> ticket-classification skill activated
- "improve CSAT" -> csat-improvement skill activated

## BLP Properties

- **BLP-041-050** (Self-Replication): Dynamic team spawning with skill-aware composition
- **BLP-001-010** (Alignment): Agents matched to customer success requirements
- **BLP-031-040** (Self-Improvement): Learns from response metrics and satisfaction scores
