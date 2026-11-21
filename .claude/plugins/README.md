# Knowledge Work Plugins for ETAC System

This directory contains plugins adapted from Anthropic's [knowledge-work-plugins](https://github.com/anthropics/knowledge-work-plugins) repository, integrated with the ETAC Multi-Agent System's existing MCP infrastructure.

## Overview

9 professional knowledge-work plugins providing specialized commands and skills for various business functions. Each plugin uses the ETAC system's existing MCP connectors (notionApi, exa, whatsapp, quick-data, pocket-pick, xai-research).

## Installed Plugins

| Plugin | Namespace | Commands | Skills | Status |
|--------|-----------|----------|--------|--------|
| Productivity | `productivity` | 2 | 2 | ✅ Active |
| Data | `data` | 6 | 6 | ✅ Active |
| Enterprise Search | `enterprise-search` | 2 | 3 | ✅ Active |
| Product Management | `pm` | 6 | 6 | ✅ Active |
| Sales | `sales` | 3 | 6 | ✅ Active |
| Customer Support | `support` | 5 | 5 | ✅ Active |
| Marketing | `marketing` | 7 | 5 | ✅ Active |
| Finance | `finance` | 5 | 6 | ✅ Active |
| Legal | `legal` | 5 | 6 | ✅ Active |

**Total**: 41 Commands, 45 Skills

## Quick Start

### Using Commands

Commands use namespace prefixes:

```
/productivity:start               # Initialize workspace
/data:analyze "Sales Q4"          # Analyze data
/pm:write-prd "Feature X"         # Create PRD
/sales:call-prep "Acme Corp"      # Prepare for sales call
/support:triage "Ticket content"  # Triage support ticket
/marketing:write-copy "Product"   # Generate marketing copy
/finance:forecast "Revenue"       # Financial forecast
/legal:review-contract "..."      # Review contract
/enterprise-search:search "query" # Search all sources
```

### Skills Auto-Trigger

Skills activate automatically based on trigger phrases:

| Say this... | Activates... |
|-------------|--------------|
| "prioritize these features" | pm/prioritization-frameworks |
| "help with this SQL query" | data/sql-queries |
| "frustrated customer" | support/empathy-patterns |
| "GDPR compliance" | legal/regulatory-framework |
| "cash flow analysis" | finance/cash-flow-analysis |

## Plugin Details

### Productivity (`/productivity:*`)
Daily workflow optimization and task management.
- **Commands**: `start`, `update`
- **Skills**: memory-management, task-management
- **Connectors**: notionApi, pocket-pick

### Data (`/data:*`)
Data analysis, visualization, and dashboard creation.
- **Commands**: `analyze`, `explore-data`, `write-query`, `create-viz`, `build-dashboard`, `validate`
- **Skills**: sql-queries, data-exploration, data-visualization, statistical-analysis, data-validation, interactive-dashboard-builder
- **Connectors**: quick-data, notionApi

### Enterprise Search (`/enterprise-search:*`)
Unified search across all connected sources.
- **Commands**: `search`, `digest`
- **Skills**: search-strategy, source-management, knowledge-synthesis
- **Connectors**: notionApi, exa, pocket-pick, xai-research

### Product Management (`/pm:*`)
PRD writing, prioritization, and roadmap management.
- **Commands**: `write-prd`, `prioritize`, `roadmap`, `competitor`, `user-story`, `metrics`
- **Skills**: prd-templates, prioritization-frameworks, roadmap-visualization, market-analysis, user-research, okr-tracking
- **Connectors**: notionApi, exa, pocket-pick

### Sales (`/sales:*`)
Call preparation, account research, and sales enablement.
- **Commands**: `call-prep`, `account-research`, `objection-handler`
- **Skills**: company-research, stakeholder-mapping, competitor-positioning, value-proposition, sales-methodology, follow-up-templates
- **Connectors**: exa, notionApi, xai-research, pocket-pick

### Customer Support (`/support:*`)
Ticket triage, response drafting, and knowledge management.
- **Commands**: `triage`, `draft-response`, `escalate`, `kb-search`, `sentiment`
- **Skills**: empathy-patterns, troubleshooting-trees, ticket-classification, kb-article-writing, csat-improvement
- **Connectors**: notionApi, whatsapp, pocket-pick

### Marketing (`/marketing:*`)
Content creation, campaign planning, and analytics.
- **Commands**: `write-copy`, `campaign-plan`, `social-post`, `email-sequence`, `seo-optimize`, `analyze-performance`, `persona-create`
- **Skills**: copywriting-formulas, channel-optimization, content-calendar, ab-testing, analytics-interpretation
- **Connectors**: exa, notionApi, xai-research, pocket-pick

### Finance (`/finance:*`)
Financial analysis, budgeting, and reporting.
- **Commands**: `analyze-statement`, `budget-create`, `forecast`, `expense-categorize`, `report-generate`
- **Skills**: financial-ratios, variance-analysis, cash-flow-analysis, financial-modeling, compliance-checks, tax-optimization
- **Connectors**: notionApi, quick-data, pocket-pick

### Legal (`/legal:*`)
Contract review, policy drafting, and compliance.
- **Commands**: `review-contract`, `draft-policy`, `compliance-check`, `summarize-terms`, `clause-library`
- **Skills**: contract-analysis, risk-identification, regulatory-framework, negotiation-strategy, ip-protection, employment-law
- **Connectors**: notionApi, pocket-pick, exa

## MCP Connector Mapping

| Connector | Plugins Using It |
|-----------|------------------|
| notionApi | All plugins |
| exa | enterprise-search, pm, sales, marketing, legal |
| pocket-pick | All except data |
| quick-data | data, finance |
| xai-research | enterprise-search, sales, marketing |
| whatsapp | support |

## Directory Structure

```
.claude/plugins/
├── README.md                 # This file
├── registry.json             # Plugin registry
├── CONNECTORS.md             # Connector documentation
├── productivity/
│   ├── plugin.json
│   ├── commands/
│   └── skills/
├── data/
│   ├── plugin.json
│   ├── commands/
│   └── skills/
├── enterprise-search/
│   ├── plugin.json
│   ├── commands/
│   └── skills/
├── product-management/
│   ├── plugin.json
│   ├── commands/
│   └── skills/
├── sales/
│   ├── plugin.json
│   ├── commands/
│   └── skills/
├── customer-support/
│   ├── plugin.json
│   ├── commands/
│   └── skills/
├── marketing/
│   ├── plugin.json
│   ├── commands/
│   └── skills/
├── finance/
│   ├── plugin.json
│   ├── commands/
│   └── skills/
└── legal/
    ├── plugin.json
    ├── commands/
    └── skills/
```

## Integration with ETAC System

These plugins leverage:
- **V4 Memory System**: For context persistence and cross-reference
- **BLP Framework**: Skills align with Base Level Properties
- **Multi-Agent Architecture**: Commands can spawn specialized agents
- **MCP Infrastructure**: All 14 existing MCP servers available

## License

Apache-2.0 (adapted from Anthropic's knowledge-work-plugins)

## Credits

- Original plugins: [Anthropic knowledge-work-plugins](https://github.com/anthropics/knowledge-work-plugins)
- Adaptation for ETAC: Integrated with existing MCP connectors and V4 Memory System
