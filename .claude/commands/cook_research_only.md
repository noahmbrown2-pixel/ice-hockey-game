Run these 7 sub agent tasks simultaneously in parallel.

**MANDATORY - Domain Filter Injection (@REQ-DFS-002):** When spawning each agent below, APPEND the following domain filter instruction to the end of each task prompt:

- For `crypto-coin-analyzer-*` and `crypto-market-agent-*` agents, append:
  ```
  ---
  MANDATORY SEARCH FILTERING (domain profile: crypto_markets):
  When using the WebSearch tool, you MUST include the allowed_domains parameter with these exact domains: ["coindesk.com", "cointelegraph.com", "theblock.co", "decrypt.co", "defillama.com", "coingecko.com", "coinmarketcap.com", "messari.io", "dune.com", "glassnode.com", "kaiko.com", "tradingview.com"]
  Do NOT search without this parameter.
  ---
  ```

- For `llm-ai-agents-and-eng-research` agent, append:
  ```
  ---
  MANDATORY SEARCH FILTERING (domain profile: ai_ml_research):
  When using the WebSearch tool, you MUST include the allowed_domains parameter with these exact domains: ["arxiv.org", "huggingface.co", "openai.com", "anthropic.com", "deepmind.google", "ai.meta.com", "github.com", "paperswithcode.com", "distill.pub", "lilianweng.github.io"]
  Do NOT search without this parameter.
  ---
  ```

## Tasks

1. crypto-coin-analyzer: Analyze DOGE with full technical and sentiment analysis
2. crypto-coin-analyzer: Analyze SOL with full technical and sentiment analysis
3. crypto-coin-analyzer: Analyze BTC with full technical and sentiment analysis
4. crypto-coin-analyzer: Analyze ETH with full technical and sentiment analysis
5. crypto-coin-analyzer: Analyze BNB with full technical and sentiment analysis
6. crypto-market-agent: Get current market data for all major cryptocurrencies
7. llm-ai-agents-and-eng-research: Find latest AI agent frameworks and LLM engineering best practices