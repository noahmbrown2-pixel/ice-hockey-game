Run these 7 sub agent tasks simultaneously in parallel.

**MANDATORY - Domain Filter Injection (@REQ-DFS-002):** When spawning web-search agents, APPEND domain filter injection to each task prompt. For crypto agents append `allowed_domains: ["coindesk.com","cointelegraph.com","theblock.co","decrypt.co","defillama.com","coingecko.com","coinmarketcap.com","messari.io","dune.com","glassnode.com","kaiko.com","tradingview.com"]`. For llm-research append `allowed_domains: ["arxiv.org","huggingface.co","openai.com","anthropic.com","deepmind.google","ai.meta.com","github.com","paperswithcode.com","distill.pub","lilianweng.github.io"]`. Use `scripts/domain_filter_injector.py --agent NAME` for exact injection text.

1. crypto-coin-analyzer: Analyze DOGE with full technical and sentiment analysis
2. crypto-market-agent: Get current market data for all major cryptocurrencies
3. llm-ai-agents-and-eng-research: Find latest AI agent frameworks and LLM engineering best practices
4. meta-agent: Create a 'security-vulnerability-scanner' agent that scans codebases for OWASP top 10 vulnerabilities
5. meta-agent: Create a 'performance-optimizer' agent that identifies and fixes performance bottlenecks in code
6. meta-agent: Create a 'smart-doc-generator' agent that auto-generates comprehensive documentation from code
7. meta-agent: Create a 'test-coverage-analyzer' agent that analyzes test coverage and suggests missing test cases