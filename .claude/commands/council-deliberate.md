# Council Deliberate Skill

Multi-Model Council with Byzantine Consensus for LLM deliberation.

## Usage

```
/council:deliberate "Your question here"
```

## Description

Replaces llm-council with cost-efficient multi-model voting:

1. **Phase 1**: Cheap models (deepseek, gpt-4o-mini, grok-fast) - $0.0003/1K tokens
2. **Phase 2**: Standard models (claude-sonnet, gpt-4o) - $0.003/1K tokens (if no consensus)
3. **Phase 3**: LLM-as-a-Judge (claude-opus) - $0.015/1K tokens (final arbitration)

## Features

- **Byzantine Consensus**: 67% threshold for fault tolerance
- **Cost Escalation**: Start cheap, escalate only if needed
- **LLM-as-a-Judge**: Premium model arbitration for ties
- **Weighted Voting**: Model quality affects vote weight

## Example

```bash
# Simple deliberation
/council:deliberate "What is the best approach for implementing rate limiting?"

# With context
python /home/craigmbrown/Project/llm-router/multi_model_council.py
```

## BLP Coverage

- BLP-001: Domain Understanding
- BLP-011: Error Recovery
- BLP-031: Performance Tracking
- BLP-051: Workflow Optimization

## Implementation

See: `/home/craigmbrown/Project/llm-router/multi_model_council.py`
