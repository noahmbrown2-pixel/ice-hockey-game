---
allowed-tools: Bash(date:*), Bash(mkdir:*), Task, Write, mcp__chainlink-prediction-markets__*
argument-hint: [crypto_ticker_symbol]
description: Execute lightweight cryptocurrency research with essential security using haiku agents
---

# Crypto Research Haiku Command - Secure Lightweight

Execute lightweight cryptocurrency research with essential security features by calling only haiku versions of crypto analysis agents in parallel.

## 🔒 Essential Security

- **Basic Input Validation**: Sanitize ticker symbols
- **Minimal Audit Logging**: Track basic research activity
- **Essential Authentication**: OAuth2 for prediction market APIs (when available)

## Variables

- **TICKER**: $ARGUMENTS (validated and sanitized)
  - The cryptocurrency ticker symbol to analyze (e.g., BTC, ETH, SOL)
  - **Security**: Basic input validation applied
  - Used by: crypto-coin-analyzer-haiku agent

## Agents

### All Haiku Agents (Security Enhanced)
- @agent-crypto-market-agent-haiku (with basic security context)
- @agent-crypto-coin-analyzer-haiku (analyze validated TICKER)
- @agent-macro-crypto-correlation-scanner-haiku (with security validation)
- @agent-crypto-investment-plays-haiku (with minimal audit logging)

## Secure Execution Instructions

1. **Basic Security Setup** 🔒
   - Initialize minimal OAuth2 authentication (if prediction markets available)
   - Validate and sanitize TICKER input parameter
   - Initialize basic audit logging

2. **Timestamp and Directory Setup**
   - Run `date +"%Y-%m-%d_%H-%M-%S"` to get timestamp
   - Create secure base output directory: `outputs/<timestamp>/haiku/`
   - Set up basic security subdirectory for audit logs

3. **Input Validation**
   - Validate TICKER variable (e.g., BTC, ETH, SOL)
   - Apply basic sanitization to prevent injection
   - Log validation results

4. **Lightweight Agent Deployment**
   - Call all 4 haiku agents listed above in parallel
   - Coin analyzer agent receives validated TICKER parameter
   - All agents operate with minimal security context
   - Monitor basic execution metrics

5. **Secure Output Processing**
   - Write complete, unmodified agent output to designated files
   - Apply basic security validation to outputs
   - Log agent completion status

6. **Organized Directory Structure**:
   - `outputs/<timestamp>/haiku/crypto_market/crypto-market-agent-haiku.md` for market agent
   - `outputs/<timestamp>/haiku/crypto_analysis/crypto-coin-analyzer-haiku.md` for coin analyzer
   - `outputs/<timestamp>/haiku/crypto_macro/macro-crypto-correlation-scanner-haiku.md` for macro correlation scanner
   - `outputs/<timestamp>/haiku/crypto_plays/crypto-investment-plays-haiku.md` for investment plays agent
   - **🔒 NEW**: `outputs/<timestamp>/haiku/security/basic_audit.json` for minimal security tracking

## Output Format

IMPORTANT: Write each agent's complete response directly to its respective file with NO modifications, NO summarization, and NO changes to the output whatsoever. The exact response from each agent must be preserved.

**🔒 Security Note**: All agent outputs undergo basic security validation for compliance, but content remains unmodified.

Each agent's output should be written to its respective file with no modifications. The enhanced directory structure ensures organized, secure research results:

```
outputs/
└── 2025-01-08_14-30-45/    # Example timestamp
    └── haiku/
        ├── crypto_market/
        │   └── crypto-market-agent-haiku.md
        ├── crypto_analysis/
        │   └── crypto-coin-analyzer-haiku.md
        ├── crypto_macro/
        │   └── macro-crypto-correlation-scanner-haiku.md
        ├── crypto_plays/
        │   └── crypto-investment-plays-haiku.md
        └── security/ 🔒 NEW
            ├── basic_audit.json
            └── validation_log.json
```

## Lightweight Security Report

When all agents are complete, provide basic reporting:

**Core Metrics:**
- Path to the outputs/<timestamp>/haiku/ directory
- Number of successful/total agents (4 haiku agents)
- Basic execution time

**🔒 Essential Security Status:**
- Input validation results
- Basic audit logging completion
- OAuth2 status (if applicable)
- Any basic security issues detected

**Minimal Success Criteria:**
- ✅ All 4 haiku agents completed successfully
- ✅ Input validation passed
- ✅ Basic audit trail generated
- ✅ No critical security violations detected

## Lightweight Configuration

```python
MINIMAL_CONFIG = {
    # Core Settings (Lightweight)
    "AGENT_TIMEOUT": 25,              # Reduced timeout for speed
    "ENABLE_BASIC_VALIDATION": True,  # Essential input validation only
    "MINIMAL_AUDIT_LOGGING": True,    # Basic activity tracking
    "LIGHTWEIGHT_AUTH": True,         # OAuth2 only if available
}

# Optional Environment Variables
OPTIONAL_ENV_VARS = [
    "KALSHI_API_KEY",     # Only if prediction market integration desired
    "POLYMARKET_API_KEY"  # Only if prediction market integration desired
]
```

## Usage Examples

```bash
# Lightweight Bitcoin analysis with essential security
claude --commands crypto_research_haiku.md --message "BTC"
# Features: Input validation, basic audit logging

# Quick Ethereum analysis
claude --commands crypto_research_haiku.md --message "ETH"
# Fast execution with minimal security overhead

# Default Bitcoin analysis
claude --commands crypto_research_haiku.md
# Optimized: Speed-first with essential security features
```

## 🎆 Lightweight Summary

This lightweight command provides fast cryptocurrency research with essential security features:

⚡ **Speed optimized** with haiku agents only  
🔒 **Essential security** with input validation  
📋 **Minimal auditing** for compliance  
🏃 **Quick execution** with reduced overhead  
✨ **Clean output** with organized structure  

Perfect for rapid analysis with security essentials.