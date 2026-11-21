---
paths:
  - "scripts/*research*"
  - "scripts/topic_research_tool.py"
---

# Research Pipeline Rules

## Topic Research Tool

```bash
python3 scripts/topic_research_tool.py --topic "TOPIC" --depth standard --channels news,deep,sentiment
```

Depth levels: `quick` | `standard` | `comprehensive`

## Golden Agents Workflow

- Script: `scripts/email_golden_agents_workflow.py`
- Triggers multi-agent research from email inputs
- Outputs: HTML dashboard + email summary + optional WhatsApp notification

## 5-Phase Research Workflow

1. **Signal ID** -- identify trending topics and emerging signals
2. **Thesis** -- form initial hypothesis from signals
3. **Deep Research** -- multi-source analysis with citations
4. **Consolidation** -- synthesize findings, resolve contradictions
5. **Final Decision** -- actionable recommendations with confidence scores

## Output Requirements

- Always produce HTML dashboard (dark mode per @.claude/rules/infrastructure/html-dashboards.md)
- Always send email summary (themed per @.claude/rules/communication/email-patterns.md)
- Optional WhatsApp notification to `15712781730`

## Domain Filtering (Mandatory)

When spawning web-search sub-agents, MUST inject domain filters per @.claude/rules/domain-filtering.md:

```python
from scripts.domain_filter_injector import get_prompt_injection
injection = get_prompt_injection("topic-news-scanner-sonnet")
full_prompt = f"{original_prompt}{injection}"
```

Agents do NOT reliably follow domain filters from their .md config -- orchestrator MUST inject.

## V5 Memory Capture (Mandatory)

All research results MUST be captured to V5 knowledge graph:

```python
from scripts.v5_capture_adapters import capture_to_inbox
capture_to_inbox(channel="research", content=results, metadata={"topic": topic, "depth": depth})
```

Never skip V5 capture -- research without capture is lost knowledge.
