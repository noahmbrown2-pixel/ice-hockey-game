# HOP Evaluate Nano Agents - Top 2 Models Per Provider (Version 3.0)

This evaluation tests the top 2 versioned models from each provider, sorted by version number (highest first).

## Pre-Execution Setup

```bash
# Source environment variables
source .env

# Verify API keys are loaded
echo "Checking API keys..."
[ -n "$OPENAI_API_KEY" ] && echo "✓ OpenAI API key loaded" || echo "✗ OpenAI API key missing"
[ -n "$ANTHROPIC_API_KEY" ] && echo "✓ Anthropic API key loaded" || echo "✗ Anthropic API key missing"
[ -n "$GOOGLE_AI_API_KEY" ] && echo "✓ Google AI API key loaded" || echo "✗ Google AI API key missing"
[ -n "$XAI_API_KEY" ] && echo "✓ XAI API key loaded" || echo "✗ XAI API key missing"
[ -n "$GROQ_API_KEY" ] && echo "✓ Groq API key loaded" || echo "✗ Groq API key missing"
[ -n "$VENICE_API_KEY" ] && echo "✓ Venice API key loaded" || echo "✗ Venice API key missing"
[ -n "$DEEPSEEK_API_KEY" ] && echo "✓ DeepSeek API key loaded" || echo "✗ DeepSeek API key missing"
```

## Instructions

- **IMPORTANT**: First run `source .env` to load all API keys
- Execute each nano-agent in parallel for optimal performance
- Grading system: S, A, B, C, D, F (S = best, F = worst)
- Apply automatic retries for transient failures
- Track version-specific performance metrics
- Validate all outputs against JSON schema

## Model Selection (Top 2 Per Provider by Version)

### OpenAI (Top 2 by version)
- GPT-5 (Latest hypothetical)
- GPT-4-turbo (Latest stable)

### Anthropic (Top 2 by version)
- Claude-Opus-4.1 (Latest)
- Claude-3.5-Sonnet (Stable)

### Google (Top 2 by version)
- Gemini-2.0-Flash (Latest)
- Gemini-1.5-Pro (Stable)

### XAI/Grok (Top 2 by version)
- Grok-4 (Latest hypothetical)
- Grok-3 (Current)

### Groq (Top 2 by version)
- Llama-3.3-70b (Latest)
- Mixtral-8x7b-32768 (Alternative)

### Venice/Proxy (Top 2 by version)
- Llama-3.1-405b (Largest)
- DeepSeek-R1-671b (Reasoning)

### DeepSeek (Top 2 by version - if available)
- DeepSeek-Reasoner (Latest)
- DeepSeek-Chat (Stable)

## Evaluation Details

Execute the following prompt with each model, replacing MODEL_NAME appropriately:

```
Analyze the current state of AI safety research and provide:
1. Three key challenges facing the field
2. Two promising approaches being explored
3. One prediction for the next 12 months

Format your response as structured JSON:
{
    "success": true,
    "result": {
        "challenges": ["challenge1", "challenge2", "challenge3"],
        "approaches": ["approach1", "approach2"],
        "prediction": "your prediction"
    },
    "error": null,
    "metadata": {
        "model": "MODEL_NAME",
        "provider": "provider_name",
        "total_tokens": 0,
        "total_cost": 0.0,
        "execution_time": 0.0
    },
    "execution_time_seconds": 0.0
}

Respond with your entire JSON response structure as is.
```

## Agents to Execute (Top 2 Per Provider)

### OpenAI Models
@agent-nano-agent-gpt-5 $PROMPT
@agent-nano-agent-gpt-4-turbo $PROMPT

### Anthropic Models  
@agent-nano-agent-claude-opus-4-1 $PROMPT
@agent-nano-agent-claude-3-5-sonnet $PROMPT

### Google/Gemini Models
@agent-nano-agent-gemini-2-0-flash $PROMPT
@agent-nano-agent-gemini-1-5-pro $PROMPT

### XAI/Grok Models
@agent-nano-agent-grok-4 $PROMPT
@agent-nano-agent-grok-3 $PROMPT

### Groq Models
@agent-nano-agent-llama-3-3-70b $PROMPT
@agent-nano-agent-mixtral-8x7b-32768 $PROMPT

### Venice Proxy Models
@agent-nano-agent-llama-3-1-405b $PROMPT
@agent-nano-agent-deepseek-r1-671b $PROMPT

### DeepSeek Models (if API key available)
# @agent-nano-agent-deepseek-reasoner $PROMPT
# @agent-nano-agent-deepseek-chat $PROMPT

## Response Format

### Performance Matrix

| Provider | Model | Version | Success | Time(s) | Tokens | Cost($) | Grade |
|----------|-------|---------|---------|---------|--------|---------|-------|
| OpenAI | GPT-5 | 5.0 | ✓/✗ | X.XX | XXX | X.XXX | S-F |
| OpenAI | GPT-4-Turbo | 4.0 | ✓/✗ | X.XX | XXX | X.XXX | S-F |
| Anthropic | Claude-Opus-4.1 | 4.1 | ✓/✗ | X.XX | XXX | X.XXX | S-F |
| Anthropic | Claude-3.5-Sonnet | 3.5 | ✓/✗ | X.XX | XXX | X.XXX | S-F |
| Google | Gemini-2.0-Flash | 2.0 | ✓/✗ | X.XX | XXX | X.XXX | S-F |
| Google | Gemini-1.5-Pro | 1.5 | ✓/✗ | X.XX | XXX | X.XXX | S-F |
| XAI | Grok-4 | 4.0 | ✓/✗ | X.XX | XXX | X.XXX | S-F |
| XAI | Grok-3 | 3.0 | ✓/✗ | X.XX | XXX | X.XXX | S-F |
| Groq | Llama-3.3-70b | 3.3 | ✓/✗ | X.XX | XXX | X.XXX | S-F |
| Groq | Mixtral-8x7b | 8.7 | ✓/✗ | X.XX | XXX | X.XXX | S-F |
| Venice | Llama-3.1-405b | 3.1 | ✓/✗ | X.XX | XXX | X.XXX | S-F |
| Venice | DeepSeek-R1-671b | 1.0 | ✓/✗ | X.XX | XXX | X.XXX | S-F |

### Provider Comparison

| Provider | Avg Success Rate | Avg Time | Avg Cost | Best Model | Overall Grade |
|----------|-----------------|----------|----------|------------|---------------|
| OpenAI | XX% | X.XXs | $X.XXX | Model Name | S-F |
| Anthropic | XX% | X.XXs | $X.XXX | Model Name | S-F |
| Google | XX% | X.XXs | $X.XXX | Model Name | S-F |
| XAI | XX% | X.XXs | $X.XXX | Model Name | S-F |
| Groq | XX% | X.XXs | $X.XXX | Model Name | S-F |
| Venice | XX% | X.XXs | $X.XXX | Model Name | S-F |

### Version Analysis

| Version Range | Models Count | Avg Performance | Trend |
|--------------|--------------|-----------------|-------|
| 5.x | X | XX% | ↑/↓/→ |
| 4.x | X | XX% | ↑/↓/→ |
| 3.x | X | XX% | ↑/↓/→ |
| 2.x | X | XX% | ↑/↓/→ |
| 1.x | X | XX% | ↑/↓/→ |

### Quality Metrics

- **Response Quality**: Evaluate comprehensiveness and accuracy
- **Format Compliance**: JSON structure validation
- **Speed Efficiency**: Response time relative to complexity
- **Cost Effectiveness**: Token usage optimization
- **Version Performance**: Higher versions vs lower versions

### Final Rankings

1. **Best Overall**: [Model] - [Provider] v[X.X] (Grade: X)
2. **Most Cost-Effective**: [Model] - [Provider] v[X.X] ($/token: X.XXX)
3. **Fastest Response**: [Model] - [Provider] v[X.X] (Time: X.XXs)
4. **Best Quality**: [Model] - [Provider] v[X.X] (Quality Score: XX/100)

### Test Metadata

- **Execution Start**: [ISO 8601 timestamp]
- **Execution End**: [ISO 8601 timestamp]
- **Total Duration**: XX.X seconds
- **Environment**: API keys sourced from .env
- **Parallel Execution**: Yes/No
- **Retry Policy**: 3 attempts with exponential backoff
- **Validation**: JSON schema compliance checked