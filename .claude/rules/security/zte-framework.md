---
paths:
  - "contracts/**"
  - "services/payments/**"
  - "docs/security-infrastructure.md"
---

# Zero Trust Execution & Security Rules

See @docs/security-infrastructure.md for full CaMel 4-layer architecture details.

## ZTE Framework
- Zero Trust Execution: every action verified, no implicit trust
- All deployed code requires DITD lifecycle (Design-Implement-Test-Deploy)
- Byzantine consensus for critical multi-agent decisions

## CaMel 4-Layer Security
1. **Input Validation**: All external inputs sanitized
2. **Agent Isolation**: SFA pattern ensures isolated dependencies
3. **Consensus**: Multi-agent agreement for high-impact actions
4. **Anti-Persuasion**: Resistance to prompt injection and social engineering

## Payment Security
- x402 payments require signed authorization
- Agent payment ledger: `services/payments/agent_payment_ledger.py`
- All transactions logged with audit trail

## Credential Handling
- Never commit .env files or API keys
- Environment priority: env vars > `.env` file > defaults in `utils/config.py`
- Key env groups: `LIMITLESS_*`, `NOTION_*`, `OPENAI_*`, `ANTHROPIC_*`, `GOOGLE_AI_*`
