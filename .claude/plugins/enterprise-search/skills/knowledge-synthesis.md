# Knowledge Synthesis Skill

Auto-triggered skill for combining and synthesizing search results.

## Trigger Phrases

- "summarize results"
- "combine findings"
- "synthesize"
- "aggregate"
- "what do we know about"

## Synthesis Framework

### 1. Result Aggregation

**Grouping Strategy**:
```
Results grouped by:
├── Topic/Theme
├── Source type
├── Time period
└── Relevance score
```

**Deduplication**:
- Identify overlapping content
- Merge complementary information
- Preserve unique insights from each source

### 2. Information Extraction

**Key Elements**:
- Facts and data points
- Decisions and conclusions
- Action items and tasks
- Questions and unknowns
- Conflicts and contradictions

### 3. Coherent Narrative

Transform scattered results into structured knowledge:

```markdown
## Synthesized Knowledge: {Topic}

### Summary
{2-3 sentence overview}

### Key Facts
1. {Fact with source attribution}
2. {Fact with source attribution}

### Timeline
- {Date}: {Event} [Source]
- {Date}: {Event} [Source]

### Decisions Made
- **{Decision}**: {Context} [Source: {link}]

### Open Questions
- {Question that remains unanswered}

### Conflicting Information
- Source A says: {claim}
- Source B says: {different claim}
- Resolution: {recommendation}
```

## Cross-Reference Validation

### Fact Checking
1. Identify claims from each source
2. Look for corroboration across sources
3. Flag single-source claims
4. Note confidence level

### Confidence Scoring
```
High (85-100%): Multiple authoritative sources agree
Medium (60-84%): Some corroboration or single authoritative source
Low (< 60%): Single non-authoritative source or conflicts exist
```

## Output Formats

### Executive Summary
- 3-5 bullet points
- Key takeaway highlighted
- Action recommendation

### Detailed Report
- Full synthesis with all sources
- Timeline if applicable
- Complete source list

### Quick Answer
- Direct answer to question
- Single source citation
- Confidence indicator

## V4 Memory Integration

Store synthesized knowledge:
- Save to appropriate memory type (Factual, Procedural, Semantic)
- Create cross-references to source documents
- Enable future retrieval without re-searching
