---
paths:
  - "llm-router/**"
  - "llm-router-xai-2m/**"
  - "llm-council/**"
---

# LLM Routing Rules

## Tiered Model Selection

| Tier | Use Case | Models |
|------|----------|--------|
| Cheap | Simple tasks, classification, extraction | Haiku, GPT-4o-mini, DeepSeek |
| Standard | Complex reasoning, code generation | Sonnet, GPT-4o |
| Premium | High-stakes decisions, architecture | Opus, GPT-4 Turbo |
| Massive context | 100K+ token inputs | XAI/Grok (2M token window) |

**Rule**: Never use premium models for trivial tasks. The complexity classifier determines tier.

## Complexity Classifier

- Location: `llm-router/llm_router/core/complexity_classifier.py`
- 6 features: token count, task type, domain complexity, reasoning depth, output format, stakes level
- Output: tier assignment + confidence score

## Fallback Chains

Every routing decision needs 3 levels:
```
primary -> secondary -> tertiary
```

Example: `Opus -> Sonnet -> Haiku` (graceful degradation on rate limits or errors)

## Cost Target

79-83% reduction over single-model baseline. Monitor via cost tracking in MCP wrappers.

## XAI/Grok Strategy

- Smart chunking: 10% overlap at semantic boundaries
- 75% cache discount on repeated prefixes
- Use for: massive document analysis, full codebase scans, long transcript processing

## LLM Council

- Location: `llm-council/`
- Multi-model consensus for high-stakes decisions
- Minimum 3 models must agree for consensus
- Used in: security reviews, architecture decisions, financial analysis

## Blocked Packages (Supply Chain Security)

The following packages are **PROHIBITED** — never install or import them:

| Package | Reason | Authority |
|---------|--------|-----------|
| `litellm` | Third-party LLM routing intermediary — MITM attack surface for tool call interception, model substitution, credential theft, and forced fallback exploitation | arxiv:2604.08407; `feedback_block_litellm.md` |
| `openrouter` | Same attack class — proxies all provider calls through a third-party service with no audit trail | arxiv:2604.08407 |

**Enforcement**: `pre_tool_use.py` hook blocks `pip install litellm`, `uv add litellm`, `pip install openrouter`, and equivalents at the shell level with exit code 2.

**Alternative**: Use direct provider SDKs — `anthropic`, `openai`, `google-generativeai`, `xai-sdk`. Never route through a third-party aggregator.

**Attack vectors (per arxiv:2604.08407)**:
1. Tool parameter interception — intermediary rewrites tool call arguments
2. Function call redirection — swap benign tool for malicious one mid-chain
3. Model substitution — replace requested model with weaker/compromised model
4. Forced exception fallback — trigger errors in primary path to downgrade to less-monitored model
