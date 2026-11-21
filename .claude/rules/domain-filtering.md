# Domain Filter Injection Rules

## Critical Pattern
Sub-agents do NOT reliably follow domain filtering instructions from their .md config files.
The orchestrator MUST inject domain filter parameters directly into the task prompt.

## Implementation
- Config source: `configs/search_domain_profiles.json` (7 profiles, 44+ agents)
- Injector utility: `scripts/domain_filter_injector.py`

```python
from scripts.domain_filter_injector import get_prompt_injection
injection = get_prompt_injection("topic-news-scanner-sonnet")
full_prompt = f"{original_prompt}{injection}"
```

```bash
python3 scripts/domain_filter_injector.py --agent topic-news-scanner-sonnet
python3 scripts/domain_filter_injector.py --list  # show all mappings
```

## When Spawning Web-Search Agents
Always append `MANDATORY SEARCH FILTERING` block to every Task tool prompt.
The block specifies exact `allowed_domains` or `blocked_domains` for WebSearch.

## Key Learning
Agent .md configs are guidance, not enforcement. Integration test proved agents
hallucinate domain lists or ignore them entirely (especially Haiku).

## Coding Guidelines
See `.claude/rules/karpathy-coding-guidelines.md` for general coding behavior (think before coding, simplicity first, surgical changes, goal-driven execution).
