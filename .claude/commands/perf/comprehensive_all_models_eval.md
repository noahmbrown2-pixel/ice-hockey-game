---
command: comprehensive_all_models_eval
description: Run comprehensive evaluation on ALL available models with throttling and interactive dashboard
category: performance
---

# Comprehensive All Models Evaluation

Evaluates ALL available models across all providers with intelligent throttling to prevent API overload and generates an interactive dashboard with filters.

## Usage

```bash
# Run default comprehensive evaluation
/perf:comprehensive_all_models_eval

# Run with custom prompt
/perf:comprehensive_all_models_eval --prompt "Your custom AI safety prompt here"

# Run with different throttling settings
/perf:comprehensive_all_models_eval --max-concurrent 5 --delay 0.5

# Run specific provider only
/perf:comprehensive_all_models_eval --provider openai

# Run specific category only
/perf:comprehensive_all_models_eval --category frontier
```

## What It Does

1. **Tests 50+ models** across all major providers:
   - OpenAI (GPT-3.5, GPT-4, GPT-5, O1, O3 series)
   - Anthropic (Claude 3/4 series, Haiku, Sonnet, Opus)
   - Google (Gemini 1.5/2.0/2.5 series)
   - XAI (Grok 2/3/4 series)
   - Groq (Llama models, Gemma)
   - DeepSeek (Chat, Coder, Reasoner)
   - Venice (Proxy models)
   - Qwen (2.5 series)
   - Ollama (Local models)

2. **Intelligent Throttling**:
   - Max 3 concurrent requests by default
   - Per-provider rate limiting
   - Automatic retry with backoff
   - Resource-aware execution

3. **Strict Evaluation Criteria** (100 points total):
   - Format Compliance: 25 points
   - Completeness: 25 points
   - Quality (AI Safety Terms): 25 points
   - Accuracy: 15 points
   - Speed: 10 points

4. **Interactive Dashboard Features**:
   - Filter by Provider
   - Filter by Grade (S/A/B/C/D/F)
   - Filter by Category (Frontier/Open/Local/Specialized/Efficient)
   - Sort by Score/Speed/Provider
   - Search by model name
   - Export results to CSV
   - Real-time statistics
   - Performance percentiles

## Configuration

Edit throttling in `evaluate_all_models_comprehensive.py`:

```python
THROTTLE_CONFIG = {
    'max_concurrent': 3,  # Max concurrent requests
    'delay_between_requests': 1.0,  # Seconds between requests
    'provider_limits': {  # Rate limits per provider
        'openai': {'max_per_minute': 20, 'concurrent': 2},
        'anthropic': {'max_per_minute': 15, 'concurrent': 2},
        # ... more providers
    }
}
```

## Output Files

- **JSON Results**: `html-output/TIMESTAMP-comprehensive_evaluation_results.json`
- **HTML Dashboard**: `html-output/TIMESTAMP-comprehensive_evaluation_dashboard.html`
- **CSV Export**: Available via dashboard export button

## Dashboard Features

The interactive dashboard includes:
- **Live Filtering**: Real-time filter updates without page reload
- **Multi-Select Filters**: Select multiple providers/grades/categories
- **Performance Metrics**: Percentile rankings, speed analysis
- **AI Safety Analysis**: Track which terms each model uses
- **Export Options**: CSV, JSON, or copy to clipboard
- **Responsive Design**: Works on mobile and desktop
- **Dark Mode**: Toggle for comfortable viewing

## Running the Script

```bash
# Standard run with UV environment
cd /home/craigmbrown/Project
uv run python evaluate_all_models_comprehensive.py

# Run and generate dashboard immediately
cd /home/craigmbrown/Project
uv run python evaluate_all_models_comprehensive.py && \
python generate_comprehensive_dashboard.py

# Run with timeout protection (recommended for full suite)
cd /home/craigmbrown/Project
timeout 1800 uv run python evaluate_all_models_comprehensive.py
```

## Custom Benchmark Tests

To add new benchmark tests, modify the prompt in the script:

```python
# Example: Test code generation capabilities
prompt = '''Generate a Python function that implements binary search.
Return as JSON:
{
    "result": {
        "function": "def binary_search(...)",
        "complexity": "O(log n)",
        "test_cases": ["test1", "test2"]
    }
}'''
```

## Estimated Runtime

- **Full Suite** (~50 models): 15-20 minutes with throttling
- **Single Provider** (~10 models): 3-5 minutes
- **Quick Test** (top 5 models): 1-2 minutes

## Troubleshooting

1. **Rate Limit Errors**: Increase delays in THROTTLE_CONFIG
2. **Timeout Issues**: Use timeout wrapper or reduce concurrent requests
3. **API Key Issues**: Ensure all API keys are set in `.env`
4. **Memory Issues**: Process in batches using provider filter

## Re-running Previous Tests

Results are saved with timestamps. To compare runs:

```bash
# Compare two evaluation runs
python compare_evaluations.py \
  --run1 html-output/20250827-comprehensive_evaluation_results.json \
  --run2 html-output/NEW_TIMESTAMP-comprehensive_evaluation_results.json
```

## Notes

- Some models may be deprecated or require specific API keys
- Local Ollama models require Ollama service running
- Venice models are proxies and may have different availability
- Throttling prevents API bans but increases runtime
- Dashboard requires modern browser with JavaScript enabled