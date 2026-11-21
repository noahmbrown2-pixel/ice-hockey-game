# Memory Management Skill

Auto-triggered skill for managing working and long-term memory.

## Trigger Phrases

- "remember this"
- "what did we discuss about X"
- "recall our conversation about"
- "save to memory"
- "memory context for"
- "load context"

## Overview

Two-tier memory system following Anthropic's productivity plugin pattern:
- **Working Memory**: CLAUDE.md and session context for immediate recall
- **Deep Storage**: V4 memory system for long-term knowledge

## Capabilities

### 1. Memory Storage

When user says "remember this" or similar:

```
Action: Store to appropriate tier
- Short-term facts → Session context
- Project knowledge → CLAUDE.md
- Long-term reference → V4 memory database
```

### 2. Memory Retrieval

When user asks "what did we discuss about X":

```
Search Order:
1. Current session context
2. CLAUDE.md working memory
3. V4 memory system (569 session archives)
4. Notion knowledge bases (25K+ pages)
```

### 3. Context Building

For task-focused context:

```
Aggregate:
- Relevant session excerpts
- Related Notion pages
- Cross-references from multiple sources
- Confidence scoring on relevance
```

## Integration with V4 Memory

Leverages existing infrastructure:
- `/unified-communication/v4/memory/memory_types_v4.py`
- `/unified-communication/v4/memory/rag_memory_loader_v4.py`
- Session archives at `~/.claude/projects/-home-craigmbrown-Project/`

## Memory Types Supported

From V4 system:
- Factual, Procedural, Episodic
- Semantic, Working, Conversational
- Contextual, Learned, Reference
- Declarative, Implicit, Metacognitive

## Best Practices

1. **Explicit saves**: "Remember that the API key rotates monthly"
2. **Contextual retrieval**: "What was our decision on caching?"
3. **Gap identification**: "What don't we have documented about X?"

## Output Format

```markdown
## Memory Retrieved

**Query**: "authentication approach"

### Working Memory (CLAUDE.md)
- OAuth2 with refresh tokens preferred
- Session timeout: 30 minutes

### Session Context
- Discussed JWT vs session tokens on 2026-02-01
- Decision: Use JWT for API, session for web

### V4 Memory (Confidence: 0.87)
- Historical pattern: OAuth2 implementations in 3 projects
- Related: Security audit findings from 2025-11
```
