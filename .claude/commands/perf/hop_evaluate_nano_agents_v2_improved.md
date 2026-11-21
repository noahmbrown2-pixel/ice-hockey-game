# HOP Evaluate Nano Agents - Version 2.0 with Self-Learning Improvements

This evaluation includes self-learning improvements from previous test analysis, with enhanced error handling, API fallbacks, and format validation.

## Pre-Execution Validation

Before running tests, the system will:
1. Verify all API keys are loaded from .env file
2. Check provider availability and apply fallbacks if needed
3. Validate MCP server connectivity
4. Confirm output directory permissions

## Instructions

- Grading system: S, A, B, C, D, F (S = best, F = worst)
- Execute each nano-agent in parallel for optimal performance
- Apply automatic retries with exponential backoff for transient failures
- Use provider fallbacks when primary provider is unavailable
- Validate all outputs against JSON schema before processing
- IMPORTANT: Source the .env file to ensure all API keys are available
- IMPORTANT: Do not modify the prompt when passing to nano-agents except for MODEL_NAME substitution

## Error Handling Configuration

```json
{
  "retry_policy": {
    "max_attempts": 3,
    "initial_delay_ms": 1000,
    "backoff_multiplier": 2,
    "max_delay_ms": 10000
  },
  "provider_fallbacks": {
    "deepseek": ["openai", "anthropic"],
    "o3": ["o1", "gpt-4"],
    "grok-2": ["grok-3", "gemini"],
    "ollama": ["groq", "venice"]
  },
  "timeout_configuration": {
    "default_seconds": 30,
    "complex_task_seconds": 60,
    "max_timeout_seconds": 120
  }
}
```

## Evaluation Details

Read and Execute: $ARGUMENTS

## JSON Output Validation Schema

All responses MUST conform to this schema:
```json
{
  "type": "object",
  "required": ["success", "result", "error", "metadata", "execution_time_seconds"],
  "properties": {
    "success": {"type": "boolean"},
    "result": {"type": ["string", "object", "null"]},
    "error": {"type": ["null", "string"]},
    "metadata": {
      "type": "object",
      "required": ["model", "provider", "total_tokens", "total_cost", "execution_time"],
      "properties": {
        "model": {"type": "string"},
        "provider": {"type": "string"},
        "total_tokens": {"type": "number"},
        "total_cost": {"type": "number"},
        "execution_time": {"type": "number"},
        "retry_count": {"type": "number"},
        "fallback_used": {"type": "boolean"}
      }
    },
    "execution_time_seconds": {"type": "number"}
  }
}
```

## Response Format

### Agent Responses

| Model      | Response        | Validation | Retries | Fallback |
| ---------- | --------------- | ---------- | ------- | -------- |
| model_name | actual_response | ✓/✗        | 0-3     | Yes/No   |

### Performance Analysis

| Model      | Performance Grade | Speed Grade | Cost Grade | Overall Grade | Success Rate |
| ---------- | ----------------- | ----------- | ---------- | ------------- | ------------ |
| model_name | S-F               | S-F         | S-F        | S-F           | XX.X%        |

### Detailed Metrics

| Model      | Execution Time | Total Tokens | Total Cost | Input Tokens | Output Tokens | Retry Count | Fallback Used |
| ---------- | -------------- | ------------ | ---------- | ------------ | ------------- | ----------- | ------------- |
| model_name | X.XXs          | XXX          | $X.XXXXX   | XXX          | XXX           | 0-3         | Yes/No        |

### Error Analysis & Recovery

| Model      | Error Type     | Error Message          | Recovery Action        | Resolution Status |
| ---------- | -------------- | ---------------------- | --------------------- | ----------------- |
| model_name | API/Model/Config | Specific error details | Retry/Fallback/Skip  | Resolved/Failed   |

### Self-Learning Insights

| Pattern Detected | Frequency | Recommended Action | Priority |
| --------------- | --------- | ------------------ | -------- |
| API Timeout     | X times   | Increase timeout   | High     |
| Format Error    | X times   | Update validation  | Medium   |

### Grading Criteria

- **Performance**: Accuracy + conciseness + format compliance
- **Speed**: Response time relative to complexity (normalized)
- **Cost**: Token efficiency and pricing optimization
- **Overall**: Weighted (40% performance, 30% speed, 30% cost)

### Final Ranking

1. **1st Place**: model_name (Grade: X, Success: XX%, Avg Time: X.Xs)
2. **2nd Place**: model_name (Grade: X, Success: XX%, Avg Time: X.Xs)
3. **3rd Place**: model_name (Grade: X, Success: XX%, Avg Time: X.Xs)

### System Health Check

| Component        | Status | Issues | Action Required |
| ---------------- | ------ | ------ | -------------- |
| API Keys         | ✓/✗    | List   | Details        |
| MCP Server       | ✓/✗    | List   | Details        |
| Provider Access  | ✓/✗    | List   | Details        |
| Output Directory | ✓/✗    | List   | Details        |

### Test Execution Summary

- **Start Time**: ISO 8601 timestamp
- **End Time**: ISO 8601 timestamp
- **Total Duration**: XX.X seconds
- **Tests Completed**: X of Y
- **Tests Failed**: X
- **Tests Skipped**: X
- **Fallbacks Used**: X
- **Total Retries**: X
- **Self-Learning Rules Applied**: X

## Post-Execution Actions

1. Save all results to `benchmark_results_{timestamp}.json`
2. Generate self-learning rules from failures
3. Update provider fallback configuration
4. Create improvement recommendations report
5. Archive logs for future analysis