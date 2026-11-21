---
allowed-tools: Bash(date:*), Bash(mkdir:*), Task, Write, WebSearch, WebFetch, mcp__just-prompt__prompt, mcp__chainlink-prediction-markets__*
argument-hint: [crypto_ticker_symbol or "portfolio" for full analysis]
description: Execute comprehensive cryptocurrency analysis with production security, prediction market integration, real-time data gathering, multi-agent consensus, and secure interactive dashboards
---

# Crypto Master Orchestrator - Production Security Enhanced

Execute a complete cryptocurrency analysis workflow with production-grade security, prediction market integration, real-time data gathering, multi-agent analysis, consensus scoring, and secure interactive dashboards.

## 🛡️ Security Features

- **OAuth2 Authentication**: Secure API access for all external services
- **Rate Limiting**: DDoS protection and API abuse prevention
- **Input Validation**: Comprehensive sanitization of all user inputs
- **Audit Logging**: Complete trail of all analysis and recommendations
- **Encryption**: Secure storage of sensitive market data
- **Compliance**: GDPR, SOX, and SOC2 compliant operations

## 📊 Prediction Market Integration

- **Kalshi API**: Real-time prediction market data for crypto events
- **Polymarket Integration**: Decentralized prediction market sentiment
- **Market Consensus**: Additional validation layer using betting odds
- **Volatility Analysis**: Prediction market volatility as risk indicator

## Variables

- **TARGET**: $ARGUMENTS or "BTC" if not specified
  - Single ticker: Analyze specific cryptocurrency (e.g., BTC, ETH, SOL)
  - "portfolio": Analyze top 10 cryptocurrencies
  - "defi": Focus on DeFi protocols and yield opportunities
  - "macro": Emphasize macro correlations and market structure

## Execution Modes

- **quick**: Haiku agents only, minimal searches (5-7), basic dashboard
- **standard**: All agent tiers, moderate searches (10-15), full visualization
- **comprehensive**: All features, extensive searches (20+), advanced analytics

## Workflow Phases

For a visual representation of the market analysis and trade execution process, see the [State Machine Diagram](../../chainlink-prediction-markets-mcp-enhanced/STATE_MACHINE.md).

### Phase 0: Security Initialization & Authentication


Initialize production security framework:

```python
security_setup = {
    "oauth2_setup": {
        "kalshi_auth": "Authenticate with Kalshi prediction markets API",
        "polymarket_auth": "Authenticate with Polymarket decentralized platform",
        "api_key_validation": "Validate all external API credentials",
        "token_refresh": "Implement automatic token refresh mechanisms"
    },
    "input_validation": {
        "ticker_sanitization": "Validate and sanitize cryptocurrency symbols",
        "parameter_validation": "Secure validation of all user parameters",
        "injection_prevention": "SQL and script injection protection",
        "rate_limiting": "Implement per-user and per-endpoint rate limits"
    },
    "audit_initialization": {
        "session_id": "Generate unique session identifier",
        "user_tracking": "Log user actions and access patterns",
        "compliance_logging": "Initialize GDPR/SOX/SOC2 audit trails",
        "security_monitoring": "Enable real-time security event detection"
    }
}
```

### Phase 1: Enhanced Web Research & Prediction Market Data Gathering (20+ searches)

Execute targeted searches to gather fresh market intelligence:

```python
search_categories = {
    "real_time_prices": [
        "[TICKER] current price USD live",
        "[TICKER] market cap volume 24h change",
        "cryptocurrency prices real-time top 10"
    ],
    "market_sentiment": [
        "[TICKER] crypto news today sentiment",
        "crypto fear greed index current",
        "[TICKER] social media sentiment analysis"
    ],
    "technical_analysis": [
        "[TICKER] technical indicators RSI MACD",
        "[TICKER] support resistance levels",
        "[TICKER] price prediction analysis 2025"
    ],
    "defi_yields": [
        "best DeFi yields APY current",
        "[TICKER] staking rewards rates",
        "liquidity pool returns comparison"
    ],
    "macro_correlations": [
        "bitcoin correlation stock market SPY",
        "crypto macro factors Fed interest rates",
        "dollar index DXY bitcoin correlation"
    ],
    "whale_activity": [
        "[TICKER] whale transactions large transfers",
        "crypto exchange inflows outflows",
        "[TICKER] on-chain metrics active addresses"
    ],
    "regulatory_news": [
        "crypto regulation news latest",
        "[TICKER] regulatory updates compliance",
        "SEC crypto enforcement actions recent"
    ],
    "prediction_markets": [
        "[TICKER] prediction market betting odds Kalshi",
        "[TICKER] polymarket prediction market sentiment",
        "crypto prediction market consensus [TICKER]",
        "prediction market volatility [TICKER] events",
        "betting odds cryptocurrency [TICKER] price targets"
    ],
    "security_events": [
        "[TICKER] security incidents hacks exploits",
        "cryptocurrency security alerts [TICKER]",
        "[TICKER] smart contract vulnerabilities",
        "crypto exchange security [TICKER] deposits"
    ]
}
```

### Phase 2: Multi-Agent Analysis Orchestra

Deploy specialized agents with fresh research context.

**MANDATORY - Domain Filter Injection (@REQ-DFS-002):** When spawning each agent, APPEND the appropriate domain filter to the task prompt. See `configs/search_domain_profiles.json` for the source of truth, or use `python3 scripts/domain_filter_injector.py --agent AGENT_NAME` to get the injection text.

- **All crypto agents** (coin-analyzer, market-agent, investment-plays, movers, news-scanner, price-check): Append `allowed_domains: ["coindesk.com", "cointelegraph.com", "theblock.co", "decrypt.co", "defillama.com", "coingecko.com", "coinmarketcap.com", "messari.io", "dune.com", "glassnode.com", "kaiko.com", "tradingview.com"]`
- **Macro correlation agents**: Append `blocked_domains: ["pinterest.com", "instagram.com", "tiktok.com", "facebook.com", "linkedin.com"]`

#### Market Overview Agents (3 tiers)
- @agent-crypto-market-agent-haiku (with RESEARCH_CONTEXT)
- @agent-crypto-market-agent-sonnet (with RESEARCH_CONTEXT)
- @agent-crypto-market-agent-opus (with RESEARCH_CONTEXT)

#### Coin Deep Dive Agents (3 tiers)
- @agent-crypto-coin-analyzer-haiku (TICKER + RESEARCH_CONTEXT)
- @agent-crypto-coin-analyzer-sonnet (TICKER + RESEARCH_CONTEXT)
- @agent-crypto-coin-analyzer-opus (TICKER + RESEARCH_CONTEXT)

#### Macro Analysis Agents (3 tiers)
- @agent-macro-crypto-correlation-scanner-haiku (with RESEARCH_CONTEXT)
- @agent-macro-crypto-correlation-scanner-sonnet (with RESEARCH_CONTEXT)
- @agent-macro-crypto-correlation-scanner-opus (with RESEARCH_CONTEXT)

#### Investment Strategy Agents (3 tiers)
- @agent-crypto-investment-plays-haiku (with RESEARCH_CONTEXT)
- @agent-crypto-investment-plays-sonnet (with RESEARCH_CONTEXT)
- @agent-crypto-investment-plays-opus (with RESEARCH_CONTEXT)

#### Additional Specialized Agents
- @agent-crypto-movers (identify biggest gainers/losers)
- @agent-crypto-news-scanner (latest breaking news)
- @agent-crypto-price-check (quick price verification)

#### 🔒 Security & Prediction Market Agents (NEW)
- @agent-prediction-market-analyzer (Kalshi/Polymarket sentiment analysis)
- @agent-security-risk-assessor (vulnerability and threat analysis)
- @agent-compliance-monitor (regulatory and compliance tracking)
- @agent-audit-trail-generator (comprehensive activity logging)

### Phase 3: Enhanced Consensus Synthesis & Security Validation

Create a synthesis agent that:
1. Analyzes all agent outputs for agreement/divergence
2. Calculates consensus scores (0-100) for each recommendation
3. **NEW**: Validates recommendations using prediction market sentiment
4. **NEW**: Performs security risk assessment for each recommendation
5. Identifies high-confidence opportunities (consensus > 75%)
6. Flags contradictions requiring human review
7. **NEW**: Logs all recommendations for audit compliance
8. Generates executive summary with clear BUY/HOLD/SELL signals

Enhanced Consensus Formula:
```
consensus_score = (
    agent_agreement_percentage * 0.30 +
    confidence_average * 0.25 +
    prediction_market_alignment * 0.20 +
    data_freshness_score * 0.15 +
    security_risk_adjustment * 0.10
)

security_adjusted_score = consensus_score * (1 - security_risk_factor)
```

### Phase 4: Secure Interactive Dashboard Generation

Create 8 interactive HTML viewers with security features:

1. **crypto_market_dashboard.html**
   - Real-time price ticker
   - Market cap rankings
   - 24h volume charts
   - Sentiment indicators

2. **agent_consensus_matrix.html**
   - Side-by-side agent comparisons
   - Agreement heatmap
   - Confidence scores per agent
   - Divergence analysis

3. **investment_strategy_tracker.html**
   - Active plays with entry/exit points
   - Risk/reward visualization
   - Portfolio allocation models
   - Performance tracking

4. **technical_analysis_viewer.html**
   - Price charts with indicators
   - Support/resistance levels
   - Pattern recognition results
   - Volume analysis

5. **risk_assessment_matrix.html**
   - Risk scores by category
   - Correlation matrices
   - Volatility analysis
   - Black swan scenarios

6. **security_compliance_dashboard.html** 🔒 **NEW**
   - Real-time security event monitoring
   - Compliance status indicators (GDPR/SOX/SOC2)
   - Audit trail summary and access logs
   - Rate limiting status and API health
   - Security risk scores and alerts

7. **prediction_markets_dashboard.html** 📊 **NEW**
   - Kalshi prediction market data and trends
   - Polymarket sentiment analysis and betting odds
   - Market consensus vs. agent consensus comparison
   - Prediction accuracy tracking and validation
   - Market volatility indicators and alerts

8. **cc_genui_crypto_master_summary_[TIMESTAMP].html**
   - Executive overview with security status
   - Key metrics dashboard with prediction market data
   - Consensus recommendations with security validation
   - Quick action items with risk assessments
   - Navigation to all viewers including security dashboards

### Phase 5: Secure Structured Data Outputs

Generate encrypted JSON files for programmatic consumption with audit trails:

```json
// consensus_analysis.json
{
  "timestamp": "2025-01-08T14:30:45Z",
  "target": "BTC",
  "consensus_score": 82,
  "recommendation": "BUY",
  "confidence": "HIGH",
  "key_factors": [...],
  "agent_agreement": {...},
  "risk_assessment": {...}
}

// investment_decisions.json
{
  "plays": [
    {
      "id": "play_001",
      "type": "spot_buy",
      "asset": "BTC",
      "entry": "$118,000-$120,000",
      "target": "$135,000",
      "stop_loss": "$115,000",
      "risk_score": 6,
      "consensus_support": 85
    }
  ]
}

// market_signals.json
{
  "bullish_signals": [...],
  "bearish_signals": [...],
  "neutral_factors": [...],
  "alerts": [...],
  "prediction_market_signals": {
    "kalshi_sentiment": "bullish",
    "polymarket_odds": 0.72,
    "market_consensus": "buy",
    "volatility_index": 0.34
  }
}

// security_audit_log.json 🔒 NEW
{
  "session_id": "session_2025-01-08_14-30-45",
  "user_actions": [...],
  "api_calls": [...],
  "security_events": [...],
  "compliance_status": {
    "gdpr_compliant": true,
    "sox_audit_trail": "complete",
    "soc2_security_validated": true
  }
}

// prediction_market_analysis.json 📊 NEW
{
  "kalshi_data": {...},
  "polymarket_data": {...},
  "market_sentiment_analysis": {...},
  "prediction_accuracy_metrics": {...},
  "volatility_analysis": {...}
}
```

### Phase 6: Enhanced Security & Quality Assurance

```python
# Enhanced error handling with security features
error_strategies = {
    "web_search_failure": "use_cached_data_with_warning",
    "agent_timeout": "retry_with_fallback_model",
    "consensus_below_threshold": "flag_for_human_review",
    "data_staleness": "trigger_refresh_cycle",
    "contradiction_detected": "generate_detailed_analysis",
    "oauth2_failure": "attempt_token_refresh_or_alert",
    "rate_limit_exceeded": "implement_exponential_backoff",
    "security_violation": "log_incident_and_block_request",
    "prediction_market_unavailable": "fallback_to_traditional_analysis",
    "audit_logging_failure": "alert_compliance_team_immediately"
}

# Enhanced quality checks with security validation
quality_checks = {
    "data_freshness": "< 1 hour old",
    "source_count": ">= 15 unique sources (including prediction markets)",
    "agent_completion": ">= 85% success rate",
    "consensus_threshold": ">= 75% agreement",
    "execution_time": "< 60 seconds (with security checks)",
    "security_validation": "all inputs sanitized and validated",
    "oauth2_status": "all API tokens valid and authenticated",
    "audit_trail_completeness": "100% of actions logged",
    "prediction_market_integration": ">= 2 market sources available",
    "compliance_status": "GDPR/SOX/SOC2 requirements met"
}
```

## Production Configuration Options

```python
# Enhanced production configuration
CONFIG = {
    # Core Analysis Settings
    "SEARCH_COUNT": 20,              # Number of web searches (increased)
    "AGENT_TIMEOUT": 45,              # Seconds per agent (increased for security)
    "CONSENSUS_THRESHOLD": 75,       # Minimum agreement % (increased)
    "RISK_TOLERANCE": "balanced",    # conservative/balanced/aggressive
    "PORTFOLIO_SIZE": 100000,         # USD for allocation
    
    # Security Configuration 🔒 NEW
    "ENABLE_OAUTH2": True,           # OAuth2 authentication required
    "RATE_LIMIT_REQUESTS_PER_MINUTE": 60,  # API rate limiting
    "INPUT_VALIDATION_STRICT": True, # Strict input validation
    "AUDIT_LOGGING_ENABLED": True,   # Comprehensive audit logging
    "ENCRYPTION_ENABLED": True,      # Encrypt sensitive data
    "COMPLIANCE_MODE": "production", # GDPR/SOX/SOC2 compliance
    
    # Prediction Market Integration 📊 NEW
    "KALSHI_INTEGRATION": True,      # Enable Kalshi prediction markets
    "POLYMARKET_INTEGRATION": True,  # Enable Polymarket data
    "PREDICTION_MARKET_WEIGHT": 0.20, # Weight in consensus formula
    "MARKET_VOLATILITY_THRESHOLD": 0.50, # Alert threshold
    
    # Enhanced Features
    "ENABLE_NOTIFICATIONS": True,     # Slack/Discord/WhatsApp alerts
    "SAVE_TO_NOTION": True,          # Create Notion page
    "GENERATE_PDF": True,            # Export as PDF with security watermark
    "CACHE_DURATION": 1800,          # Reduced cache for fresher data
    "ENABLE_REAL_TIME_MONITORING": True, # Live dashboard updates
    "BACKUP_TO_ENCRYPTED_STORAGE": True, # Secure backup
}

# Environment Variables Required
REQUIRED_ENV_VARS = [
    "KALSHI_API_KEY",
    "KALSHI_API_SECRET",
    "POLYMARKET_API_KEY",
    "OAUTH2_CLIENT_ID",
    "OAUTH2_CLIENT_SECRET",
    "ENCRYPTION_KEY",
    "AUDIT_LOG_ENCRYPTION_KEY"
]
```

## Output Structure

```
outputs/
└── 2025-01-08_14-30-45/
    ├── research/
    │   ├── web_searches.json
    │   ├── search_results_raw.json
    │   └── research_summary.md
    ├── agents/
    │   ├── market/
    │   ├── analysis/
    │   ├── macro/
    │   └── strategies/
    ├── consensus/
    │   ├── synthesis_report.md
    │   ├── consensus_scores.json
    │   └── executive_summary.md
    ├── dashboards/
    │   ├── crypto_market_dashboard.html
    │   ├── agent_consensus_matrix.html
    │   ├── investment_strategy_tracker.html
    │   ├── technical_analysis_viewer.html
    │   ├── risk_assessment_matrix.html
    │   ├── security_compliance_dashboard.html 🔒 NEW
    │   ├── prediction_markets_dashboard.html 📊 NEW
    │   └── cc_genui_crypto_master_summary_*.html
    ├── security/ 🔒 NEW
    │   ├── audit_logs.encrypted
    │   ├── session_tracking.json
    │   ├── security_events.log
    │   └── compliance_report.pdf
    ├── prediction_markets/ 📊 NEW
    │   ├── kalshi_data.json
    │   ├── polymarket_data.json
    │   ├── market_consensus.json
    │   └── volatility_analysis.json
    └── exports/
        ├── consensus_analysis.json
        ├── investment_decisions.json
        ├── market_signals.json
        ├── security_audit_log.json 🔒 NEW
        ├── prediction_market_analysis.json 📊 NEW
        └── notion_page_link.txt
```

## Enhanced Success Criteria

**Core Analysis:**
- ✅ 20+ web searches completed with fresh data (including prediction markets)
- ✅ All agents execute with research context
- ✅ Enhanced consensus score calculated (target > 75%)
- ✅ 8 interactive HTML viewers generated (including security & prediction dashboards)
- ✅ Clear BUY/HOLD/SELL recommendation with security validation
- ✅ Comprehensive risk assessment completed
- ✅ Structured JSON outputs created with encryption
- ✅ Execution time < 60 seconds (with security checks)
- ✅ All navigation links functional
- ✅ Data freshness < 1 hour

**Security Validation:** 🔒
- ✅ OAuth2 authentication successful for all APIs
- ✅ All inputs validated and sanitized
- ✅ Rate limiting active and functional
- ✅ Comprehensive audit trail generated
- ✅ Security events monitoring active
- ✅ GDPR/SOX/SOC2 compliance requirements met
- ✅ Encrypted storage of sensitive data
- ✅ No security violations detected

**Prediction Market Integration:** 📊
- ✅ Kalshi API integration successful
- ✅ Polymarket data retrieval functional
- ✅ Market sentiment analysis completed
- ✅ Prediction market consensus calculated
- ✅ Volatility analysis from betting data
- ✅ Market correlation analysis performed
- ✅ Prediction accuracy metrics generated

## Quick Start Examples

### Basic Analysis (Single Coin)
```bash
claude --commands crypto_master_orchestrator.md --message "BTC"
# Includes: OAuth2 auth, prediction markets, security monitoring
```

### Portfolio Analysis (Top 10)
```bash
claude --commands crypto_master_orchestrator.md --message "portfolio"
# Enhanced: Multi-coin prediction market correlation analysis
```

### DeFi Focus
```bash
claude --commands crypto_master_orchestrator.md --message "defi"
# Advanced: DeFi protocol security analysis + yield prediction markets
```

### Macro Correlation Study
```bash
claude --commands crypto_master_orchestrator.md --message "macro"
# Professional: Economic indicators + prediction market sentiment
```

### Security-First Analysis 🔒 **NEW**
```bash
claude --commands crypto_master_orchestrator.md --message "BTC --security-focus"
# Emphasizes: Security events, vulnerability analysis, compliance
```

### Prediction Market Focus 📊 **NEW**
```bash
claude --commands crypto_master_orchestrator.md --message "ETH --prediction-focus"
# Prioritizes: Kalshi/Polymarket data, betting odds analysis
```

### Custom Multi-Ticker
```bash
claude --commands crypto_master_orchestrator.md --message "BTC ETH SOL"
# Full-featured: All security + prediction market capabilities
```

## Enhanced Execution Steps

1. **Security Initialization** 🔒
   - Initialize OAuth2 authentication for all APIs
   - Validate and sanitize all input parameters
   - Initialize audit logging and session tracking
   - Activate rate limiting and security monitoring

2. **Parse arguments and determine analysis mode**
   - Validate ticker symbols and analysis parameters
   - Apply security constraints based on user permissions
   - Log user request and analysis mode selection

3. **Create secure timestamped output directory structure**
   - Include security and prediction market subdirectories
   - Set appropriate file permissions for sensitive data
   - Initialize encrypted storage for audit logs

4. **Execute enhanced web research phase (20+ searches)**
   - Include prediction market data sources (Kalshi, Polymarket)
   - Add security event and vulnerability searches
   - Implement rate limiting for external API calls
   - Log all search queries and results for audit trail

5. **Process and structure research data with security validation**
   - Validate and sanitize all external data sources
   - Encrypt sensitive market data and predictions
   - Generate security risk assessment for data sources

6. **Deploy all crypto agents with enhanced context**
   - Include prediction market data in agent context
   - Add security risk factors to analysis context
   - Monitor agent performance and security compliance

7. **Collect and validate agent outputs with security checks**
   - Validate agent outputs for security compliance
   - Log all agent recommendations for audit purposes
   - Check outputs against prediction market consensus

8. **Run enhanced consensus synthesis algorithm**
   - Include prediction market sentiment in consensus calculation
   - Apply security risk adjustments to recommendations
   - Generate confidence scores with market validation

9. **Generate all secure HTML dashboards and viewers (8 total)**
   - Include security compliance and prediction market dashboards
   - Apply security headers and access controls
   - Generate encrypted exports for sensitive data

10. **Create structured JSON exports with encryption**
    - Encrypt sensitive market predictions and trading recommendations
    - Generate comprehensive audit logs
    - Create compliance reports for regulatory requirements

11. **Generate executive summary with security validation**
    - Include security risk assessment summary
    - Add prediction market consensus comparison
    - Provide compliance status and audit trail summary

12. **Security validation and monitoring activation**
    - Activate real-time security monitoring
    - Generate security compliance report
    - Send security status notifications

13. **Open master dashboard in browser**
    - Launch secure dashboard with authentication
    - Enable real-time updates with security monitoring

14. **(Optional) Create Notion page with full analysis**
    - Include security and prediction market sections
    - Apply appropriate access controls and permissions

15. **Report completion metrics and file locations**
    - Include security validation results
    - Report prediction market integration status
    - Provide audit trail and compliance confirmation

## Production Notes

**Performance & Reliability:**
- Uses parallel execution for optimal performance
- Implements smart caching to reduce API calls
- Supports incremental updates for live monitoring
- Includes fallback strategies for all failure modes
- Preserves all raw data for audit trail
- Mobile-responsive HTML dashboards
- All files are self-contained (no external dependencies)

**Security Features:** 🔒
- End-to-end encryption for sensitive data
- OAuth2 authentication for all external APIs
- Comprehensive input validation and sanitization
- Real-time security monitoring and alerting
- Complete audit trails for compliance requirements
- Rate limiting and DDoS protection
- Secure session management and token handling

**Prediction Market Integration:** 📊
- Real-time Kalshi and Polymarket data integration
- Market sentiment analysis and volatility tracking
- Prediction accuracy validation and scoring
- Market consensus correlation with agent recommendations
- Betting odds analysis for risk assessment

**Compliance & Audit:**
- GDPR compliant data handling and user consent
- SOX compliant financial analysis audit trails
- SOC2 security controls and monitoring
- Encrypted backup and disaster recovery
- Regulatory reporting and compliance validation

**Monitoring & Alerting:**
- Real-time dashboard updates with security status
- WhatsApp/Slack notifications for critical alerts
- Security event monitoring and incident response
- Performance metrics and SLA tracking
- Cost optimization and API usage monitoring

---

## 🎆 Enhanced Capabilities Summary

This production-enhanced orchestrator transforms cryptocurrency analysis into a comprehensive, secure, data-driven decision support system with:

✨ **Beautiful visualizations** with real-time security monitoring  
🔒 **Enterprise-grade security** with OAuth2 and encryption  
📊 **Prediction market intelligence** from Kalshi and Polymarket  
📋 **Complete audit trails** for regulatory compliance  
🚨 **Real-time alerting** for security and market events  
🎯 **Actionable insights** with risk-adjusted recommendations  

Ready for production deployment with enterprise security standards.