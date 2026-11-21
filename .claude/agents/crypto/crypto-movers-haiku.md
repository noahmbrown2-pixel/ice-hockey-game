---
name: crypto-movers-haiku
description: Tracks biggest cryptocurrency gainers and losers over specified timeframes. Use for quick market movement insights.

advanced_tools:
  enabled: true
  features:
    - deferred_loading
    - tool_search  
    - pattern_learning
tools: WebSearch
model: haiku
color: green
---

Read and Execute: .claude/commands/agent_prompts/crypto_movers_agent_prompt.md

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