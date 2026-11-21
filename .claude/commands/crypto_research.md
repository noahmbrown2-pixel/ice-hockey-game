---
allowed-tools: Bash(date:*), Bash(mkdir:*), Task, Write
argument-hint: [crypto_ticker_symbol]
description: Execute comprehensive cryptocurrency research using all crypto agents
---

# Crypto Research Command

Think hard and execute comprehensive cryptocurrency research by calling all crypto analysis agents in parallel.

## Variables

- **TICKER**: $ARGUMENTS or "BTC" if not specified
  - The cryptocurrency ticker symbol to analyze (e.g., BTC, ETH, SOL)
  - Used by: crypto-coin-analyzer agents

## Agent Groups

### Market Data Agents
- @agent-crypto-market-agent-haiku
- @agent-crypto-market-agent-sonnet
- @agent-crypto-market-agent-opus

### Coin Analysis Agents
- @agent-crypto-coin-analyzer-haiku (analyze TICKER)
- @agent-crypto-coin-analyzer-sonnet (analyze TICKER)
- @agent-crypto-coin-analyzer-opus (analyze TICKER)

### Macro Correlation Agents
- @agent-macro-crypto-correlation-scanner-haiku
- @agent-macro-crypto-correlation-scanner-sonnet
- @agent-macro-crypto-correlation-scanner-opus

### Investment Plays Agents
- @agent-crypto-investment-plays-haiku
- @agent-crypto-investment-plays-sonnet
- @agent-crypto-investment-plays-opus

## Domain Filter Injection (@REQ-DFS-002)

**MANDATORY:** When spawning each agent, APPEND the appropriate domain filter to the task prompt:

- **All crypto agents** (coin-analyzer, market-agent, investment-plays, movers): Append to prompt:
  ```
  ---
  MANDATORY SEARCH FILTERING (domain profile: crypto_markets):
  When using the WebSearch tool, you MUST include the allowed_domains parameter with these exact domains: ["coindesk.com", "cointelegraph.com", "theblock.co", "decrypt.co", "defillama.com", "coingecko.com", "coinmarketcap.com", "messari.io", "dune.com", "glassnode.com", "kaiko.com", "tradingview.com"]
  Do NOT search without this parameter.
  ---
  ```

- **Macro correlation agents**: Append to prompt:
  ```
  ---
  MANDATORY SEARCH FILTERING (domain profile: sentiment_social):
  When using the WebSearch tool, you MUST include the blocked_domains parameter with these exact domains: ["pinterest.com", "instagram.com", "tiktok.com", "facebook.com", "linkedin.com"]
  Do NOT search without this parameter.
  ---
  ```

## Execution Instructions

1. Run `date +"%Y-%m-%d_%H-%M-%S"` to get a human-readable timestamp (e.g., 2025-01-08_14-30-45)
2. Create base output directory: `outputs/<timestamp>/`
3. Set the TICKER variable to the desired cryptocurrency (e.g., BTC, ETH, SOL)
4. Call all 12 agents listed above in parallel, appending the domain filter injection from above
5. Coin analyzer agents (crypto-coin-analyzer-haiku, crypto-coin-analyzer-sonnet, crypto-coin-analyzer-opus) will receive the TICKER parameter for focused analysis
6. Each agent should execute their respective analysis based on their specialized prompts
7. IMPORTANT: Write the complete, unmodified output from each agent to its designated file
8. Write outputs to organized directory structure:
   - `outputs/<timestamp>/crypto_market/<agent-name>.md` for market agents
   - `outputs/<timestamp>/crypto_analysis/<agent-name>.md` for coin analyzers
   - `outputs/<timestamp>/crypto_macro/<agent-name>.md` for macro correlation scanners
   - `outputs/<timestamp>/crypto_plays/<agent-name>.md` for investment plays agents

## Output Format

IMPORTANT: Write each agent's complete response directly to its respective file with NO modifications, NO summarization, and NO changes to the output whatsoever. The exact response from each agent must be preserved.

Each agent's output should be written to its respective file with no modifications. The directory structure ensures organized research results:

```
outputs/
└── 2025-01-08_14-30-45/    # Example timestamp
    ├── crypto_market/
    │   ├── crypto-market-agent-haiku.md
    │   ├── crypto-market-agent-sonnet.md
    │   └── crypto-market-agent-opus.md
    ├── crypto_analysis/
    │   ├── crypto-coin-analyzer-haiku.md
    │   ├── crypto-coin-analyzer-sonnet.md
    │   └── crypto-coin-analyzer-opus.md
    ├── crypto_macro/
    │   ├── macro-crypto-correlation-scanner-haiku.md
    │   ├── macro-crypto-correlation-scanner-sonnet.md
    │   └── macro-crypto-correlation-scanner-opus.md
    └── crypto_plays/
        ├── crypto-investment-plays-haiku.md
        ├── crypto-investment-plays-sonnet.md
        └── crypto-investment-plays-opus.md
```

## Enhanced Report

When all agents are complete, provide comprehensive reporting:

**Basic Metrics:**
- Path to the outputs/<timestamp>/ directory
- Number of successful/total agents based on file existence
- Execution time and performance metrics

**🔒 Security Report:**
- OAuth2 authentication status
- Input validation results
- Audit logging completion
- Security compliance status
- Any security issues detected

**📊 Prediction Market Report:**
- Prediction market data retrieval status
- Basic sentiment analysis results
- Market consensus vs. agent consensus comparison
- Data source availability (Kalshi/Polymarket)

**Enhanced Success Criteria:**
- ✅ All 12 agents completed successfully
- ✅ Security validation passed
- ✅ Audit trail generated
- ✅ Prediction market context integrated
- ✅ No security violations detected
- ✅ Basic market sentiment analysis completed

## Basic Configuration

```python
BASIC_SECURITY_CONFIG = {
    # Core Settings
    "AGENT_TIMEOUT": 35,                   # Extended for security checks
    "ENABLE_BASIC_AUTH": True,             # OAuth2 for prediction markets
    "INPUT_VALIDATION": True,              # Basic input sanitization
    "AUDIT_LOGGING": True,                 # Basic audit trail
    
    # Prediction Market Settings (Basic)
    "KALSHI_INTEGRATION": True,            # Basic Kalshi sentiment
    "POLYMARKET_INTEGRATION": True,        # Basic Polymarket data
    "PREDICTION_WEIGHT": 0.10,             # Minimal weight in analysis
    "MARKET_TIMEOUT": 10,                  # Quick market data retrieval
}

# Required Environment Variables (Minimal)
REQUIRED_ENV_VARS = [
    "KALSHI_API_KEY",
    "POLYMARKET_API_KEY"
]
```

## Usage Examples

```bash
# Basic analysis with security and prediction markets
claude --commands crypto_research.md --message "BTC"
# Features: OAuth2 auth, basic market sentiment, audit logging

# Ethereum analysis with enhancements
claude --commands crypto_research.md --message "ETH"
# Includes: Input validation, basic prediction market context

# Default Bitcoin analysis
claude --commands crypto_research.md
# Enhanced: Core security + basic prediction market integration
```

This command provides essential security and basic prediction market features while maintaining the core multi-agent research functionality.