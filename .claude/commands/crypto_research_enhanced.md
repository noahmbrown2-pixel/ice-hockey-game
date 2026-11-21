---
allowed-tools: Bash(date:*), Bash(mkdir:*), Task, Write, WebSearch, mcp__chainlink-prediction-markets__*
argument-hint: [crypto_ticker_symbol]
description: Execute enhanced cryptocurrency research with security features, prediction market integration, dashboards and consensus scoring
---

# Crypto Research Enhanced Command - Security Edition

Execute comprehensive cryptocurrency research with production security, prediction market integration, real-time data, consensus scoring, and secure interactive HTML dashboards.

## 🔒 Security Features

- **OAuth2 Authentication**: Secure API access for prediction markets
- **Input Validation**: Comprehensive parameter sanitization
- **Audit Logging**: Complete research activity tracking
- **Rate Limiting**: API abuse prevention

## 📊 Prediction Market Integration

- **Kalshi Integration**: Real-time crypto prediction data
- **Polymarket Data**: Decentralized market sentiment
- **Market Consensus**: Additional validation layer

## Variables

- **TICKER**: $ARGUMENTS or "BTC" if not specified
  - The cryptocurrency ticker symbol to analyze (e.g., BTC, ETH, SOL)

## Enhancement Features

### 1. Secure Pre-Research Data Gathering
Before deploying agents, gather fresh market data with security validation:
- **Current prices and market metrics** (with OAuth2 authentication)
- **Recent news and sentiment** (validated and sanitized)
- **Technical indicators** (from authenticated sources)
- **DeFi yields and opportunities** (risk-assessed)
- **Macro correlations** (audit-logged)
- **📊 NEW: Prediction market data** (Kalshi/Polymarket sentiment)
- **🔒 NEW: Security events** (vulnerability scanning)

### 2. Secure Enhanced Agent Deployment
All agents receive enhanced inputs with security validation:
- **TICKER**: The target cryptocurrency (validated and sanitized)
- **RESEARCH_CONTEXT**: Fresh market data and insights (authenticated sources)
- **📊 PREDICTION_MARKET_CONTEXT**: Kalshi and Polymarket sentiment data
- **🔒 SECURITY_CONTEXT**: Risk assessment and security event data

### 3. Enhanced Consensus Scoring System
After agents complete, calculate with security validation:
- Agreement percentage across agents
- Confidence scores per recommendation
- **📊 NEW: Prediction market alignment score**
- Risk-adjusted consensus with security factors
- Divergence analysis with market sentiment validation
- **🔒 NEW: Security risk adjustment factor**

### 4. Secure Interactive Dashboards
Generate secure HTML viewers with authentication:
- Market overview dashboard (with prediction market data)
- Agent comparison matrix (with consensus validation)
- Investment strategy tracker (with security risk scores)
- Risk assessment visualization (enhanced with market volatility)
- **🔒 NEW: Security compliance dashboard**
- **📊 NEW: Prediction market sentiment tracker**

## Agent Groups with Research Context

### Market Data Agents (with fresh data)
- @agent-crypto-market-agent-haiku (TOP_N=10, RESEARCH_CONTEXT)
- @agent-crypto-market-agent-sonnet (TOP_N=10, RESEARCH_CONTEXT)
- @agent-crypto-market-agent-opus (TOP_N=10, RESEARCH_CONTEXT)

### Coin Analysis Agents (ticker-specific + context)
- @agent-crypto-coin-analyzer-haiku (TICKER, RESEARCH_CONTEXT)
- @agent-crypto-coin-analyzer-sonnet (TICKER, RESEARCH_CONTEXT)
- @agent-crypto-coin-analyzer-opus (TICKER, RESEARCH_CONTEXT)

### Macro Correlation Agents (with market context)
- @agent-macro-crypto-correlation-scanner-haiku (RESEARCH_CONTEXT)
- @agent-macro-crypto-correlation-scanner-sonnet (RESEARCH_CONTEXT)
- @agent-macro-crypto-correlation-scanner-opus (RESEARCH_CONTEXT)

### Investment Plays Agents (with opportunities data)
- @agent-crypto-investment-plays-haiku (RESEARCH_CONTEXT)
- @agent-crypto-investment-plays-sonnet (RESEARCH_CONTEXT)
- @agent-crypto-investment-plays-opus (RESEARCH_CONTEXT)

## Execution Workflow

### Step 1: Initialize & Research
```bash
# Get timestamp
date +"%Y-%m-%d_%H-%M-%S"

# Create enhanced directory structure
mkdir -p outputs/<timestamp>/research
mkdir -p outputs/<timestamp>/agents/{market,analysis,macro,strategies}
mkdir -p outputs/<timestamp>/dashboards
mkdir -p outputs/<timestamp>/consensus
```

### Step 2: Enhanced Web Research Phase
Execute 12-18 targeted searches with security validation:
```python
research_queries = [
    # Core market data (authenticated sources)
    f"{TICKER} current price market cap volume",
    f"{TICKER} news sentiment analysis today",
    f"{TICKER} technical indicators RSI MACD",
    f"cryptocurrency market overview top 10",
    f"DeFi yields APY opportunities current",
    f"bitcoin correlation stock market macro",
    f"{TICKER} whale transactions on-chain",
    
    # 📊 NEW: Prediction market queries
    f"{TICKER} prediction market betting odds Kalshi",
    f"{TICKER} polymarket sentiment analysis",
    f"crypto prediction markets {TICKER} consensus",
    
    # 🔒 NEW: Security and risk queries
    f"{TICKER} security incidents vulnerabilities",
    f"cryptocurrency security alerts {TICKER}",
    # ... additional searches with validation
]
```

### Step 3: Deploy Agents with Context
Call all 12 agents in parallel, providing:
- TICKER parameter for coin analyzers
- RESEARCH_CONTEXT with fresh data for all agents
- **MANDATORY Domain Filter Injection (@REQ-DFS-002):** Append the following to ALL crypto agent prompts:
  ```
  ---
  MANDATORY SEARCH FILTERING (domain profile: crypto_markets):
  When using the WebSearch tool, you MUST include the allowed_domains parameter with these exact domains: ["coindesk.com", "cointelegraph.com", "theblock.co", "decrypt.co", "defillama.com", "coingecko.com", "coinmarketcap.com", "messari.io", "dune.com", "glassnode.com", "kaiko.com", "tradingview.com"]
  Do NOT search without this parameter.
  ---
  ```
  For macro correlation agents, append instead:
  ```
  ---
  MANDATORY SEARCH FILTERING (domain profile: sentiment_social):
  When using the WebSearch tool, you MUST include the blocked_domains parameter with these exact domains: ["pinterest.com", "instagram.com", "tiktok.com", "facebook.com", "linkedin.com"]
  Do NOT search without this parameter.
  ---
  ```

### Step 4: Generate Consensus Analysis
Create synthesis report analyzing:
- Points of agreement across agents
- Confidence levels per recommendation
- Risk assessments
- Contradictions requiring attention

### Step 5: Build Interactive Dashboards

#### Dashboard 1: Market Overview
```html
<!-- crypto_market_dashboard.html -->
- Real-time price display
- Market cap rankings
- Volume analysis
- Sentiment indicators
```

#### Dashboard 2: Agent Consensus
```html
<!-- agent_consensus_viewer.html -->
- Side-by-side agent outputs
- Agreement heatmap
- Confidence scoring
- Key insights extraction
```

#### Dashboard 3: Investment Tracker
```html
<!-- investment_strategy_viewer.html -->
- Active plays summary
- Entry/exit points
- Risk scores
- Portfolio allocation
```

#### Dashboard 4: Security Compliance 🔒 **NEW**
```html
<!-- security_compliance_dashboard.html -->
- Security validation status
- Audit trail summary
- Risk assessment metrics
- Compliance indicators
```

#### Dashboard 5: Prediction Markets 📊 **NEW**
```html
<!-- prediction_markets_dashboard.html -->
- Kalshi prediction data
- Polymarket sentiment tracking
- Market consensus vs agent consensus
- Volatility analysis
```

#### Dashboard 6: Master Summary
```html
<!-- cc_genui_crypto_analysis_[timestamp].html -->
- Executive summary with security status
- Enhanced consensus recommendation
- Key metrics with prediction market data
- Security and compliance summary
- Navigation to all views
```

### Step 6: Generate Secure Structured Outputs

```json
// enhanced_consensus_report.json
{
  "ticker": "BTC",
  "timestamp": "2025-01-08T14:30:45Z",
  "consensus_score": 82,
  "recommendation": "BUY",
  "confidence": "HIGH",
  "agent_agreement": {
    "bullish": 9,
    "neutral": 2,
    "bearish": 1
  },
  "prediction_market_data": {
    "kalshi_sentiment": "bullish",
    "polymarket_odds": 0.75,
    "market_consensus_alignment": 0.88
  },
  "security_assessment": {
    "risk_score": 3.2,
    "security_events": 0,
    "compliance_status": "validated"
  },
  "key_insights": [...],
  "risk_factors": [...]
}

// security_audit_log.json 🔒 NEW
{
  "session_id": "research_session_2025-01-08_14-30-45",
  "user_actions_logged": true,
  "api_calls_validated": true,
  "data_sources_authenticated": true,
  "compliance_requirements_met": {
    "input_validation": true,
    "audit_trail_complete": true,
    "rate_limiting_active": true
  }
}
```

## Enhanced Secure Output Structure

```
outputs/
└── 2025-01-08_14-30-45/
    ├── research/
    │   ├── web_searches.json
    │   ├── prediction_market_searches.json 📊 NEW
    │   └── research_summary.md
    ├── agents/
    │   ├── market/
    │   │   ├── crypto-market-agent-haiku.md
    │   │   ├── crypto-market-agent-sonnet.md
    │   │   └── crypto-market-agent-opus.md
    │   ├── analysis/
    │   │   ├── crypto-coin-analyzer-haiku.md
    │   │   ├── crypto-coin-analyzer-sonnet.md
    │   │   └── crypto-coin-analyzer-opus.md
    │   ├── macro/
    │   │   ├── macro-crypto-correlation-scanner-haiku.md
    │   │   ├── macro-crypto-correlation-scanner-sonnet.md
    │   │   └── macro-crypto-correlation-scanner-opus.md
    │   └── strategies/
    │       ├── crypto-investment-plays-haiku.md
    │       ├── crypto-investment-plays-sonnet.md
    │       └── crypto-investment-plays-opus.md
    ├── consensus/
    │   ├── synthesis_report.md
    │   ├── enhanced_consensus_report.json
    │   └── executive_summary.md
    ├── security/ 🔒 NEW
    │   ├── security_audit_log.json
    │   ├── session_tracking.json
    │   └── compliance_report.json
    ├── prediction_markets/ 📊 NEW
    │   ├── kalshi_data.json
    │   ├── polymarket_data.json
    │   └── market_consensus.json
    └── dashboards/
        ├── crypto_market_dashboard.html
        ├── agent_consensus_viewer.html
        ├── investment_strategy_viewer.html
        ├── security_compliance_dashboard.html 🔒 NEW
        ├── prediction_markets_dashboard.html 📊 NEW
        └── cc_genui_crypto_analysis_*.html
```

## Enhanced Success Metrics

**Core Research:**
- ✅ Fresh data gathered (< 1 hour old)
- ✅ All 12 agents complete successfully
- ✅ Enhanced consensus score calculated
- ✅ 6 HTML dashboards generated (including security & prediction markets)
- ✅ JSON reports created with encryption
- ✅ Executive summary produced
- ✅ All files properly linked
- ✅ Execution time < 75 seconds (with security checks)

**Security Validation:** 🔒
- ✅ OAuth2 authentication successful
- ✅ All inputs validated and sanitized
- ✅ Comprehensive audit trail generated
- ✅ Rate limiting active
- ✅ Security compliance verified
- ✅ No security violations detected

**Prediction Market Integration:** 📊
- ✅ Kalshi API integration functional
- ✅ Polymarket data retrieved successfully
- ✅ Market sentiment analysis completed
- ✅ Prediction market consensus calculated
- ✅ Market correlation analysis performed

## Error Handling

```python
error_mitigation = {
    "search_failure": "Use cached data with warning",
    "agent_timeout": "Retry with fallback model",
    "low_consensus": "Flag for manual review",
    "missing_data": "Generate partial report"
}
```

## Configuration

```python
ENHANCED_CONFIG = {
    # Core Settings
    "MIN_CONSENSUS": 75,              # Increased minimum agreement
    "SEARCH_TIMEOUT": 12,              # Extended for security validation
    "AGENT_TIMEOUT": 40,               # Extended for prediction market data
    "ENABLE_CACHE": True,              # Cache research for 1 hour
    "DASHBOARD_STYLE": "dark",         # light/dark theme
    
    # Security Settings 🔒
    "ENABLE_OAUTH2": True,             # OAuth2 authentication required
    "ENABLE_INPUT_VALIDATION": True,   # Strict input validation
    "ENABLE_AUDIT_LOGGING": True,      # Comprehensive audit trails
    "RATE_LIMIT_PER_MINUTE": 45,       # API rate limiting
    "SECURITY_MONITORING": True,       # Real-time security monitoring
    
    # Prediction Market Settings 📊
    "KALSHI_INTEGRATION": True,        # Enable Kalshi prediction markets
    "POLYMARKET_INTEGRATION": True,    # Enable Polymarket data
    "PREDICTION_MARKET_WEIGHT": 0.15,  # Weight in consensus calculation
    "MARKET_VOLATILITY_THRESHOLD": 0.40, # Alert threshold
    "ENABLE_MARKET_VALIDATION": True,  # Cross-validate with markets
}

# Required Environment Variables
REQUIRED_ENV_VARS = [
    "KALSHI_API_KEY", "POLYMARKET_API_KEY",
    "OAUTH2_CLIENT_ID", "OAUTH2_CLIENT_SECRET"
]
```

## Report Format

When complete, provide:
1. Path to master dashboard: `outputs/<timestamp>/dashboards/cc_genui_crypto_analysis_*.html`
2. Consensus score and recommendation
3. Number of successful agents
4. Execution time
5. Any warnings or errors encountered

## Enhanced Usage Examples

```bash
# Analyze Bitcoin with full security and prediction markets
claude --commands crypto_research_enhanced.md --message "BTC"
# Includes: OAuth2 auth, Kalshi/Polymarket data, security monitoring

# Analyze Ethereum with enhanced features
claude --commands crypto_research_enhanced.md --message "ETH"
# Features: Market sentiment validation, security risk assessment

# Security-focused analysis 🔒
claude --commands crypto_research_enhanced.md --message "BTC --security-focus"
# Emphasizes: Vulnerability analysis, compliance reporting

# Default (Bitcoin) with all enhancements
claude --commands crypto_research_enhanced.md
# Full-featured: Security + prediction markets + consensus scoring
```

## 🎆 Enhanced Capabilities Summary

This enhanced command transforms crypto research into a comprehensive, secure, visual, and actionable intelligence system with:

✨ **Visual dashboards** with security monitoring  
🔒 **Production security** with OAuth2 and validation  
📊 **Prediction market intelligence** from Kalshi and Polymarket  
📋 **Audit trails** for compliance requirements  
🎯 **Enhanced consensus** with market sentiment validation  
🚨 **Security monitoring** with real-time alerts  

Ready for professional deployment with enterprise security standards.