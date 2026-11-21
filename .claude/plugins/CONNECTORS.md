# MCP Connector Mapping for Knowledge Work Plugins

This document maps existing MCP servers to Knowledge Work Plugin requirements.

## Available Connectors

| Connector | Status | Type | Plugins Using |
|-----------|--------|------|---------------|
| `notionApi` | Active | MCP | Productivity, Product-Mgmt, Enterprise-Search, Customer-Support, Marketing, Finance, Legal |
| `whatsapp` | Active | MCP | Customer-Support, Sales (notifications) |
| `quick-data` | Active | MCP | Data, Finance |
| `exa` | Active | MCP | Enterprise-Search, Sales, Marketing |
| `elevenlabs` | Active | MCP | Marketing (voice content) |
| `pocket-pick` | Active | MCP | Productivity, Enterprise-Search |
| `xai-research` | Active | MCP | Enterprise-Search |
| `just-prompt` | Active | MCP | Cross-plugin AI routing |
| `nano-agent` | Active | MCP | Complex task execution |
| `context7` | Active | MCP | Documentation lookup |

## Plugin Connector Requirements

### Productivity
- **Required**: `notionApi` (task storage, knowledge base)
- **Optional**: `pocket-pick` (quick data retrieval)

### Data Analytics
- **Required**: `quick-data` (SQL queries, analytics)
- **Optional**: `notionApi` (result storage)

### Enterprise Search
- **Required**: `notionApi` (document search), `exa` (web search)
- **Optional**: `pocket-pick`, `xai-research`

### Product Management
- **Required**: `notionApi` (specs, roadmaps)
- **Optional**: `exa` (competitive research)

### Sales
- **Required**: `exa` (account research)
- **Optional**: `notionApi`, `whatsapp`

### Customer Support
- **Required**: `notionApi` (knowledge base)
- **Optional**: `whatsapp` (escalation notifications)

### Marketing
- **Required**: `exa` (SEO, competitive research)
- **Optional**: `elevenlabs` (voice), `notionApi`

### Finance
- **Required**: `quick-data` (financial analysis)
- **Optional**: `notionApi` (report storage)

### Legal
- **Required**: None (operates on uploaded documents)
- **Optional**: `notionApi` (contract storage)

## Fallback Strategies

When a required connector is unavailable:

1. **notionApi unavailable**: Use local file storage in `.claude/plugins/data/`
2. **quick-data unavailable**: Basic Python pandas for data operations
3. **exa unavailable**: Use WebSearch tool directly
4. **whatsapp unavailable**: Log notifications to file, no real-time alerts

## Adding New Connectors

To add a new MCP connector:

1. Add server configuration to `.mcp.json`
2. Update `registry.json` connector section
3. Update plugin `plugin.json` connector requirements
4. Test connector availability

## Connector Health Check

```bash
# Check MCP server status
claude mcp status

# Test specific connector
claude mcp test notionApi
```
