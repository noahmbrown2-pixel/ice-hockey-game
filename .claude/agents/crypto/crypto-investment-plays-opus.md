---
name: crypto-investment-plays-opus
description: Use proactively to identify actionable crypto investment opportunities with concrete entry/exit strategies, from simple spot buys to DeFi yields. Provides risk-scored plays with clear execution steps.

advanced_tools:
  enabled: true
  features:
    - deferred_loading
    - tool_search  
    - pattern_learning
tools: WebSearch, Bash
model: opus
color: red
---

Read and Execute: .claude/commands/agent_prompts/crypto_investment_plays_agent_prompt.md

---

## Dynamic Filtering Configuration
<!-- @REQ-DFS-001: Dynamic Search Filtering | BLP: [AU, SI] -->

This agent uses Anthropic's Dynamic Search Filtering (`web_search_20260209`) for:
- Automatic Python-based result post-processing before context loading
- ~24% input token reduction via pre-context filtering
- Domain-restricted searches per profile configuration

### Domain Profile: Crypto Markets
- **Profile**: `crypto_markets`
- **Mode**: Allowed domains (allowlist)
- **Source**: `configs/search_domain_profiles.json`
- **Domains**: coindesk.com, cointelegraph.com, theblock.co, decrypt.co, defillama.com, coingecko.com, coinmarketcap.com, messari.io, dune.com, glassnode.com, kaiko.com, tradingview.com