# Search Strategy Skill

Auto-triggered skill for optimizing search queries across sources.

## Trigger Phrases

- "find"
- "search for"
- "where is"
- "look up"
- "locate"

## Strategy Selection

### 1. Query Analysis

**Intent Detection**:
```
- Factual lookup → Direct search
- Exploratory → Broad multi-source
- Specific document → Targeted with filters
- Historical → Date-bounded search
```

**Entity Extraction**:
```
- Person names → Author/mention filters
- Dates → Time range bounds
- Project names → Project tag filters
- Technical terms → Content-specific sources
```

### 2. Source Prioritization

Based on query type, prioritize sources:

| Query Type | Primary Source | Secondary Sources |
|------------|----------------|-------------------|
| Documentation | Notion | Sessions, Web |
| Current events | Web (exa) | X/Twitter |
| Personal notes | Sessions | Notion |
| Stored data | pocket-pick | Notion |
| Social/trends | X/Twitter | Web |

### 3. Query Transformation

**Natural Language → Structured Query**:
```
Input: "What did we decide about the API last week?"
Output:
- Keywords: "API", "decision", "decided"
- Date range: last 7 days
- Sources: Sessions, Notion
- Type: meeting notes, discussions
```

**Filter Generation**:
```
Input: "Craig's budget documents from January"
Output:
- from:craig
- type:document
- about:budget
- after:2026-01-01
- before:2026-02-01
```

## Search Optimization

### Iterative Refinement
1. Execute initial broad search
2. Analyze result distribution
3. Add specificity if too many results
4. Broaden if too few results
5. Surface best matches with explanations

### Result Scoring
```
Relevance Score = (
  keyword_match * 0.3 +
  recency * 0.2 +
  source_authority * 0.2 +
  context_match * 0.3
)
```

## MCP Integration

- **notionApi**: Database queries with filters
- **exa**: Semantic web search
- **xai-research**: X/Twitter search
- **pocket-pick**: Key-value lookups
