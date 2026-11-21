# HOP Evaluate Nano Agents

Using the nano-agent mcp server, execute the following nano agents with their respective prompts, models, and providers then rank the results based on the `Response Format`. 

## Instructions

- We'll use the grading system S, A, B, C, D, F where S is the best and F is the worst. 
- The prompt in the `Evaluation Details` contains the exact prompt to execute for your nano-agents. 
- IMPORTANT: Execute each nano-agent in parallel (batch processing with max 5 concurrent for load balancing).
- IMPORTANT: Here we're delegating work to the nano-agents, do not do any work yourself on behalf of the nano-agents.
- IMPORTANT: When you write the prompt for the nano-agents, be absolutely clear not to change the prompt in anyway unless you are specifying the model to make the results unique.
- IMPORTANT: You're calling the respective claude code sub agents - do not call the `mcp__nano-agent__prompt_nano_agent` tool directly, let the sub agent's handle that.
- IMPORTANT: You MUST test ALL specified models before stopping. Do not skip any models.
- IMPORTANT: Save intermediate results to JSON files for data persistence.

## Evaluation Details

Read and Execute: $ARGUMENTS

## Data Collection & Archiving

### Directory Structure:
All test artifacts should be organized in a well-named directory structure:
```
/home/craigmbrown/Project/html-output/{date}-{test_name}/
├── reports/
│   ├── initial_report.html
│   └── comprehensive_dashboard.html
├── data/
│   ├── final_results.json
│   ├── batch1_results.json
│   ├── batch2_results.json
│   └── ...
├── logs/
│   ├── {model_name_1}.log
│   ├── {model_name_2}.log
│   └── ...
└── assets/
    └── test_specification.md (copy of the test file)
```

### Required Steps:
1. **Create test directory**: `/home/craigmbrown/Project/html-output/{YYYYMMDD}-{test_name}/`
   - Example: `/home/craigmbrown/Project/html-output/20250825-file_operations_test/`
2. **Save batch results**: Store in `data/batch{N}_results.json` files
3. **Track all responses**: Include raw outputs, parsed responses, and error details
4. **Log individual model outputs**: Save to `logs/{model_name}.log`
5. **Generate final_results.json**: Comprehensive JSON in `data/` directory

### JSON Result Structure:
```json
{
  "test_name": "Test Name",
  "test_date": "ISO-8601 Date",
  "total_models": N,
  "models_tested": N,
  "expected_output": "Description",
  "grading_rubric": {},
  "detailed_results": {
    "model_name": {
      "success": true/false,
      "execution_time": N,
      "token_usage": {},
      "grading": {},
      "detailed_notes": []
    }
  },
  "summary_statistics": {}
}
```

## HTML Report Generation

### Create Two HTML Reports:

1. **Initial Report** (`{date}-{test_name}_initial_report.html`):
   - Test overview and objectives
   - Grading rubric explanation
   - Performance summary cards
   - Grade distribution chart
   - Top performers showcase
   - Common issues section

2. **Comprehensive Dashboard** (`{date}-{test_name}_comprehensive_dashboard.html`):
   - Full sortable data table with ALL metrics
   - Columns: Rank, Model, Provider, Grade, Score, Time, Cost, Cost/Point, Status, Notes
   - Interactive filters (by grade, provider, status)
   - Search functionality
   - CSV export button
   - Cost efficiency analysis
   - Speed vs accuracy trade-off charts
   - Provider performance comparison
   - Links to all JSON files and logs

### HTML Requirements:
- Save to organized test directory: `/home/craigmbrown/Project/html-output/{YYYYMMDD}-{test_name}/reports/`
- Use date format: YYYYMMDD (e.g., 20250825)
- Include complete inline CSS (no external dependencies)
- Modern, professional design with gradient backgrounds
- Color-coded grades (A=green, B=blue, C=yellow, D=orange, F=red)
- Responsive layout for all screen sizes
- Summary statistics at the top
- Interactive elements (sorting, filtering, hover effects)
- Use relative paths to link to data files within the test directory

## Response Format

IMPORTANT: Based on the response from the `Evaluation Details` step, format your response into the following format and display it back to the user.
Be sure not to make any changes to the responses from the nano-agents.

### Agent Responses

| Model      | Response        |
| ---------- | --------------- |
| model_name | actual_response |

### Results Summary

| Model      | Performance Grade | Speed Grade | Cost Grade | Overall Grade |
| ---------- | ----------------- | ----------- | ---------- | ------------- |
| model_name | S-F               | S-F         | S-F        | S-F           |

### Performance Metrics

| Model      | Execution Time | Total Tokens | Total Cost | Input Tokens | Output Tokens | Cost/Token |
| ---------- | -------------- | ------------ | ---------- | ------------ | ------------- | ---------- |
| model_name | X.XXs          | XXX          | $X.XXXXX   | XXX          | XXX           | $X.XXXXXX  |

### Grading Criteria

- **Performance**: Combines accuracy and conciseness of the response
- **Speed**: Relative ranking (fastest = S, slowest = worst grade)
- **Cost**: Relative ranking (cheapest = S, most expensive = worst grade)
- **Overall**: Weighted average considering all factors

### Final Ranking

1. **1st Place**: model_name (Overall Grade: X) - [Key strength]
2. **2nd Place**: model_name (Overall Grade: X) - [Key strength]
3. **3rd Place**: model_name (Overall Grade: X) - [Key strength]

### Output Files

- **JSON Results**: `/home/craigmbrown/Project/nano_agent_test_results/final_results.json`
- **HTML Reports**: 
  - Initial: `/home/craigmbrown/Project/html-output/{date}-{test_name}_initial_report.html`
  - Dashboard: `/home/craigmbrown/Project/html-output/{date}-{test_name}_comprehensive_dashboard.html`
- **Model Logs**: `/home/craigmbrown/Project/nano_agent_test_results/logs/`

## Completion Checklist

Before marking the evaluation as complete, ensure:
- [ ] All specified models have been tested
- [ ] Batch results saved to JSON files
- [ ] Individual model logs created
- [ ] final_results.json generated with complete data
- [ ] Initial HTML report created
- [ ] Comprehensive dashboard created with data table
- [ ] All files properly linked in the dashboard
- [ ] Summary statistics calculated and displayed
- [ ] Cost efficiency analysis completed
- [ ] Final ranking determined