# Source Management Skill

Auto-triggered skill for managing and configuring search sources.

## Trigger Phrases

- "which sources"
- "connect"
- "available sources"
- "search sources"
- "add source"

## Source Registry

### Available Sources

| Source | Status | Connector | Capabilities |
|--------|--------|-----------|--------------|
| Notion | Active | notionApi | Pages, databases, properties |
| Web Search | Active | exa | Semantic search, content extraction |
| X/Twitter | Active | xai-research | Posts, trends, user analysis |
| Pocket Pick | Active | pocket-pick | Key-value storage, quick access |
| Sessions | Active | Local | Chat history, decisions |

### Source Health Check

```markdown
## Source Status

✅ **Notion** - Connected
   - Last sync: 2 minutes ago
   - Databases accessible: 12
   - Rate limit: 85% available

✅ **exa** - Connected
   - API status: Healthy
   - Daily quota: 450/500 searches

✅ **X/Twitter** - Connected
   - Via xai-research MCP
   - Features: posts, grokopedia, trends

✅ **pocket-pick** - Connected
   - Items stored: 156
   - Categories: 8

✅ **Sessions** - Local
   - Sessions indexed: 45
   - Date range: Jan 1 - Feb 4, 2026
```

## Source Configuration

### Adding New Sources

To integrate a new source:
1. Verify MCP connector availability
2. Configure authentication
3. Map data schema to unified format
4. Set refresh/sync schedule
5. Test with sample queries

### Source Preferences

```yaml
search_preferences:
  default_sources:
    - notion
    - sessions

  exclude_from_quick_search:
    - web  # Only include when explicitly requested

  source_weights:
    notion: 1.0
    sessions: 0.9
    web: 0.7
    x_twitter: 0.6
```

## Deduplication Rules

When same content appears in multiple sources:
1. Prefer primary source (where content originated)
2. Show most recent version
3. Note other locations in metadata
4. Merge complementary information

## Rate Limiting

Respect per-source limits:
- Notion: 3 requests/second
- exa: 500 searches/day
- xai-research: Based on API tier
- pocket-pick: No limit (local)
