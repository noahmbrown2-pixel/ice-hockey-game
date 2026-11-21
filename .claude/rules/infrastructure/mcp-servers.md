---
paths:
  - "*-mcp*/**"
  - "mcp-manager/**"
  - "pocket-pick/**"
  - "notion-mcp-server/**"
---

# MCP Server Infrastructure Rules

## Server Setup
MCP servers use UV for package management:
```bash
for dir in *-mcp*/; do cd "$dir" && uv sync && cd ..; done
```

## Available MCP Servers (10+)
- Pocket-Pick: Personal engineering knowledge base (SQLite-backed)
- Quick Data: Dataset analysis and visualization
- Playwright: Browser automation
- XAI Research: X/Twitter research via Grok
- ElevenLabs: Text-to-speech
- Firecrawl: Web scraping
- Nano Agent: Multi-model LLM routing
- WhatsApp Bridge: Message sending

## Cost Tracking
- MCP Wrapper Pattern: cost-tracked interface for external tools
- All MCP calls should log usage for cost optimization
- Target: 79-83% cost reduction through intelligent model routing

## Development Pattern
- Each MCP server is self-contained with its own UV environment
- Follow the MCP Wrapper Pattern for new integrations
- Include cost tracking in all new MCP server implementations
