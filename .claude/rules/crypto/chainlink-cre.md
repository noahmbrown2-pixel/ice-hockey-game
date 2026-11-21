---
paths:
  - "chainlink-prediction-markets-mcp*/**"
  - "blindoracle-*/**"
  - "contracts/**"
  - "chainlink-agent-swarm-demo/**"
---

# Chainlink CRE & BlindOracle Development Rules

## BlindOracle Platform
- CRE-integrated prediction market platform with 25 agents
- Main codebase: `chainlink-prediction-markets-mcp-enhanced/`
- Privacy-first architecture with confidential prediction markets

## Chainlink BUILD Application
- **Status**: Submitted 2026-02-26, awaiting initial screening (2-4 weeks)
- **Vertical**: Infrastructure (Privacy & Confidentiality crossover)
- **Token commitment**: 3-4% of future token supply (planned Q3-Q4 2026)
- **Key docs**: `chainlink-prediction-markets-mcp-enhanced/docs/build-typeform-answers.md`
- **Review timeline**: ~3 months total (screening -> deep eval -> decision -> onboarding)

## Agent Swarm Demo
- Convergence 2026 hackathon submission
- Demo: `chainlink-agent-swarm-demo/run_demo.sh` (7 sections, 5 min)
- LLM: Groq/Llama-3.3-70B (free tier: ~9 runs/day), fallbacks: OpenAI, XAI
- LINK payments: Fully simulated, zero on-chain cost

## Smart Contract Rules
- OracleSubscription.sol: OZ v4 (incompatible with v5)
- UnifiedPredictionSubscription.sol + IReceiver.sol: Compile fine
- x402 payment integration mandatory for paid endpoints
- CaMel 4-layer security for all agent operations
