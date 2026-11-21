# Knowledge Work Plugins Index

Provides documentation for the skill category system (9 plugins, 41 commands, 45 skills).

## Trigger Phrases

- "plugin"
- "knowledge work"
- "productivity command"
- "data command"
- "pm command"
- "sales command"
- "support command"
- "marketing command"
- "finance command"
- "legal command"

## Available Plugins

| Plugin | Namespace | Commands | Skills |
|--------|-----------|----------|--------|
| Productivity | `productivity` | 2 | 2 |
| Data Analytics | `data` | 6 | 6 |
| Enterprise Search | `enterprise-search` | 2 | 3 |
| Product Management | `pm` | 6 | 6 |
| Sales | `sales` | 3 | 6 |
| Customer Support | `support` | 5 | 5 |
| Marketing | `marketing` | 7 | 5 |
| Finance | `finance` | 5 | 6 |
| Legal | `legal` | 5 | 6 |

## Command Examples

### Productivity
```
/productivity:start               # Initialize workspace
/productivity:update              # Update task status
```

### Data Analytics
```
/data:analyze "dataset"           # Analyze data
/data:write-query "requirement"   # Generate SQL
/data:create-viz "data"           # Create visualization
/data:build-dashboard "metrics"   # Build dashboard
```

### Product Management
```
/pm:write-prd "feature"           # Create PRD
/pm:prioritize "backlog"          # Prioritize features
/pm:roadmap "quarter"             # Update roadmap
/pm:competitor "company"          # Competitive analysis
```

### Sales
```
/sales:call-prep "company"        # Prepare for call
/sales:account-research "account" # Research account
/sales:objection-handler "type"   # Handle objections
```

### Customer Support
```
/support:triage "ticket"          # Triage ticket
/support:draft-response "issue"   # Draft response
/support:escalate "ticket"        # Escalate ticket
```

### Marketing
```
/marketing:write-copy "product"   # Write copy
/marketing:campaign-plan "goal"   # Plan campaign
/marketing:social-post "topic"    # Create social post
/marketing:email-sequence "goal"  # Email sequence
```

### Finance
```
/finance:analyze-statement "Q4"   # Analyze statement
/finance:budget-create "dept"     # Create budget
/finance:forecast "revenue"       # Forecast
```

### Legal
```
/legal:review-contract "doc"      # Review contract
/legal:compliance-check "reg"     # Check compliance
/legal:draft-policy "type"        # Draft policy
```

## MCP Connectors

| Connector | Used By |
|-----------|---------|
| notionApi | All 9 plugins |
| exa | enterprise-search, pm, sales, marketing, legal |
| pocket-pick | 8 plugins (all except data) |
| quick-data | data, finance |
| xai-research | enterprise-search, sales, marketing |
| whatsapp | support |

## Full Documentation

- **Plugin Registry**: `.claude/plugins/registry.json`
- **README**: `.claude/plugins/README.md`
- **Connectors**: `.claude/plugins/CONNECTORS.md`
- **Command Index**: `.claude/commands/plugins-index.md`
