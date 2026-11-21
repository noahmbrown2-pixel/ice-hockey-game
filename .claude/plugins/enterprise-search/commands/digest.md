# /enterprise-search:digest

Generate daily or weekly activity summaries across all sources.

## Usage

```
/enterprise-search:digest
/enterprise-search:digest --daily
/enterprise-search:digest --weekly
/enterprise-search:digest --project "Project Aurora"
```

## Description

Aggregates activity across sources to provide:
1. What happened summary
2. Action items discovered
3. Decisions made
4. Mentions of you or your interests

## Options

- `--daily`: Summarize last 24 hours (default)
- `--weekly`: Summarize last 7 days
- `--project NAME`: Focus on specific project
- `--mentions`: Highlight mentions of you
- `--decisions`: Focus on decisions made

## Output Format

```markdown
## Activity Digest - February 4, 2026

### Summary
- 15 Notion pages updated
- 3 relevant sessions
- 8 web articles of interest

### Key Updates

#### Notion Activity
- **Project Aurora Spec** updated with Phase 3 requirements
- **Q1 Roadmap** marked 2 items complete
- New page: **API Rate Limiting Design**

#### Session Highlights
- Discussed plugin integration strategy
- Agreed on MCP connector approach
- Action: Create registry.json structure

#### Web/Research
- Anthropic released new knowledge-work-plugins repo
- XAI announced Grok-4 with 2M context

### Action Items Found
1. [ ] Review PR #42 by Friday
2. [ ] Schedule architecture review
3. [ ] Update documentation with new patterns

### Decisions Made
1. **Plugin namespace**: Use `plugin:command` format
2. **MCP mapping**: Leverage existing 14 servers

### Mentions
- Craig mentioned in "Budget Planning" discussion
- Tagged in "Code Review" request

---
*Generated from: Notion, Sessions, Web*
*Coverage: Feb 3-4, 2026*
```

## Weekly Digest Format

```markdown
## Weekly Digest - Jan 29 to Feb 4, 2026

### This Week's Highlights
- Completed 12 tasks
- 3 major decisions made
- 2 new projects started

### By Project

#### Project Aurora
- Moved from Phase 1 to Phase 2
- Key decision: Use microservices architecture
- Next milestone: Feb 15

#### Plugin Integration
- Started Feb 4
- Progress: 20% complete
- On track

### Trending Topics
1. MCP integration (mentioned 15 times)
2. Performance optimization (mentioned 10 times)
3. Documentation updates (mentioned 8 times)

### Upcoming
- Feb 5: Architecture review
- Feb 7: Sprint planning
- Feb 10: Demo day
```

## MCP Integration

Pulls from all available sources:
- notionApi: Page updates, database changes
- Sessions: Conversation highlights
- exa: Relevant web updates
- pocket-pick: Tracked items
