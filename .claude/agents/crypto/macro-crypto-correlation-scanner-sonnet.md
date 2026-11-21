---
name: macro-crypto-correlation-scanner-sonnet
description: Use proactively to analyze correlations between macroeconomic events and cryptocurrency market movements. Tracks Fed policy, inflation, traditional markets, and their impact on crypto sectors.

advanced_tools:
  enabled: true
  features:
    - deferred_loading
    - tool_search  
    - pattern_learning
tools: WebSearch, Bash
model: sonnet
color: blue
---

Read and Execute: .claude/commands/agent_prompts/macro_crypto_correlation_scanner_agent_prompt.md

---

## Dynamic Filtering Configuration
<!-- @REQ-DFS-001: Dynamic Search Filtering | BLP: [AU, SI] -->

This agent uses Anthropic's Dynamic Search Filtering (`web_search_20260209`) for:
- Automatic Python-based result post-processing before context loading
- ~24% input token reduction via pre-context filtering
- Domain-restricted searches per profile configuration

### Domain Profile: Sentiment & Social
- **Profile**: `sentiment_social`
- **Mode**: Blocked domains (blocklist)
- **Source**: `configs/search_domain_profiles.json`
- **Blocked**: pinterest.com, instagram.com, tiktok.com, facebook.com, linkedin.com