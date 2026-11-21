# Knowledge Work Plugins Index

Quick reference for all 9 professional knowledge-work plugins (41 commands, 45 skills).

**Full Documentation**: See `.claude/plugins/README.md`

## Plugin Commands Quick Reference

### Productivity (`/productivity:*`)
```
/productivity:start               # Initialize workspace and daily planning
/productivity:update              # Update task status and progress
```

### Data Analytics (`/data:*`)
```
/data:analyze "dataset"           # Analyze datasets with statistical methods
/data:explore-data "source"       # Explore data structure and patterns
/data:write-query "requirement"   # Generate SQL queries
/data:create-viz "data"           # Create data visualizations
/data:build-dashboard "metrics"   # Build interactive dashboards
/data:validate "dataset"          # Validate data quality and integrity
```

### Enterprise Search (`/enterprise-search:*`)
```
/enterprise-search:search "query" # Unified search across all sources
/enterprise-search:digest         # Generate activity digests
```

### Product Management (`/pm:*`)
```
/pm:write-prd "feature"           # Create Product Requirements Document
/pm:prioritize "backlog"          # Prioritize features and backlog
/pm:roadmap "quarter"             # Generate and update roadmaps
/pm:competitor "company"          # Competitive analysis
/pm:user-story "feature"          # Write user stories
/pm:metrics "product"             # Track and analyze product metrics
```

### Sales (`/sales:*`)
```
/sales:call-prep "company"        # Prepare for sales calls
/sales:account-research "account" # Research accounts and prospects
/sales:objection-handler "type"   # Handle sales objections
```

### Customer Support (`/support:*`)
```
/support:triage "ticket"          # Triage support tickets
/support:draft-response "issue"   # Draft customer responses
/support:escalate "ticket"        # Escalate tickets appropriately
/support:kb-search "query"        # Search knowledge base
/support:sentiment "text"         # Analyze customer sentiment
```

### Marketing (`/marketing:*`)
```
/marketing:write-copy "product"   # Write marketing copy
/marketing:campaign-plan "goal"   # Plan marketing campaigns
/marketing:social-post "topic"    # Create social media posts
/marketing:email-sequence "goal"  # Design email sequences
/marketing:seo-optimize "content" # SEO optimization
/marketing:analyze-performance    # Analyze marketing performance
/marketing:persona-create         # Create buyer personas
```

### Finance (`/finance:*`)
```
/finance:analyze-statement "Q4"   # Analyze financial statements
/finance:budget-create "dept"     # Create budgets
/finance:forecast "revenue"       # Financial forecasting
/finance:expense-categorize       # Categorize expenses
/finance:report-generate "type"   # Generate financial reports
```

### Legal (`/legal:*`)
```
/legal:review-contract "doc"      # Review contracts
/legal:draft-policy "type"        # Draft policies
/legal:compliance-check "reg"     # Check regulatory compliance (GDPR, CCPA, etc.)
/legal:summarize-terms "doc"      # Summarize terms and conditions
/legal:clause-library "type"      # Access clause library
```

## Auto-Triggered Skills

Skills activate automatically based on trigger phrases:

| Say this... | Activates... |
|-------------|--------------|
| "prioritize these features" | pm/prioritization-frameworks |
| "help with this SQL query" | data/sql-queries |
| "frustrated customer" | support/empathy-patterns |
| "GDPR compliance" | legal/regulatory-framework |
| "cash flow analysis" | finance/cash-flow-analysis |
| "write marketing copy" | marketing/copywriting-formulas |
| "research this company" | sales/company-research |
| "create a roadmap" | pm/roadmap-visualization |

## MCP Connectors Used

| Connector | Plugins |
|-----------|---------|
| notionApi | All 9 plugins |
| exa | enterprise-search, pm, sales, marketing, legal |
| pocket-pick | 8 plugins (all except data) |
| quick-data | data, finance |
| xai-research | enterprise-search, sales, marketing |
| whatsapp | support |

## File Locations

- **Plugin Registry**: `.claude/plugins/registry.json`
- **Full Documentation**: `.claude/plugins/README.md`
- **Connector Docs**: `.claude/plugins/CONNECTORS.md`
- **Individual Plugins**: `.claude/plugins/{plugin-name}/`

## Plugin Structure

Each plugin contains:
```
.claude/plugins/{plugin-name}/
├── plugin.json          # Plugin manifest with metadata
├── commands/            # Command definitions (*.md)
└── skills/              # Auto-triggered skills (*.md)
```
