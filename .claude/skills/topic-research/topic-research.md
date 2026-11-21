# Topic Research Tool

<!-- @REQ-TRT-SKILL-001: Claude Code Skill | BLP: [A, AU, D, SI] -->

Direct topic research without email trigger - Enhancement to ETAC Email Research Pipeline v2.0.

## Quick Usage

```bash
# Basic topic research
/project:topic-research --topic "AI agent frameworks 2025"

# Research with URL context
/project:topic-research --topic "Machine economy" --url "https://example.com/article"

# Quick research (faster)
/project:topic-research --topic "Bitcoin trends" --depth quick

# Comprehensive research
/project:topic-research --topic "Quantum computing" --depth comprehensive
```

## Arguments

| Argument | Required | Default | Description |
|----------|----------|---------|-------------|
| `--topic` | Yes | - | Research topic to analyze |
| `--url` | No | - | Optional context URL to analyze |
| `--depth` | No | standard | Research depth: quick, standard, comprehensive |
| `--channels` | No | all | Delivery channels: all, email, whatsapp, html |

## Execution

Execute this command to start topic research:

```bash
python /home/craigmbrown/Project/scripts/topic_research_tool.py \
    --topic "$TOPIC" \
    ${URL:+--url "$URL"} \
    --depth "${DEPTH:-standard}" \
    --channels "${CHANNELS:-all}"
```

## Depth Configurations

| Depth | News Days | Sources | Model | Pages |
|-------|-----------|---------|-------|-------|
| quick | 3 | 5 | haiku | 10 |
| standard | 7 | 10 | sonnet | 25 |
| comprehensive | 30 | 20 | opus | 50 |

## Output Channels

1. **HTML Dashboard**: Dark mode responsive dashboard at `/home/craigmbrown/Project/html-output/`
2. **Email**: Research report sent to craigmbrown@gmail.com
3. **WhatsApp**: Notification with TinyURL to dashboard
4. **State File**: Research history at `/home/craigmbrown/Project/logs/topic_research_state.json`

## Integration with Email Research Pipeline

This skill is an enhancement to the ETAC Email Research Pipeline v2.0 that allows:
- **Direct invocation** without needing to send an email trigger
- **Same research quality** as the email workflow
- **Flexible delivery** to multiple channels
- **URL context** analysis alongside topic research

## BLP Coverage

| Property | Implementation |
|----------|----------------|
| Alignment (A) | Topic-focused research with user intent |
| Autonomy (AU) | Independent execution without email trigger |
| Durability (D) | State persistence and error recovery |
| Self-Improvement (SI) | Research history for pattern learning |

## Examples

### Research a specific topic
```bash
/project:topic-research --topic "The Machine Economy: Why AI Agents Need New Money"
```

### Research with article context
```bash
/project:topic-research --topic "AI economics" --url "https://open.substack.com/pub/visserlabs/p/the-machine-economy-why-ai-agents"
```

### Quick research with email only
```bash
/project:topic-research --topic "Lightning Network adoption" --depth quick --channels email
```

### Comprehensive research to all channels
```bash
/project:topic-research --topic "Quantum resistant cryptography" --depth comprehensive --channels all
```

---

**Skill ID**: `topic-research`
**Version**: 1.0.0
**Author**: ETAC System Enhancement
**Created**: 2026-02-04
