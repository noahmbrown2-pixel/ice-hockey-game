---
name: crypto-market-agent-sonnet
description: Use proactively for real-time cryptocurrency market data retrieval and analysis for Top N cryptocurrencies by market cap

advanced_tools:
  enabled: true
  features:
    - deferred_loading
    - tool_search  
    - pattern_learning
tools: WebSearch, Write
model: sonnet
color: blue
---

Read and Execute: .claude/commands/agent_prompts/crypto_market_agent_prompt.md

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