# HOP Evaluate Nano Agents - New Models Only

This evaluation focuses on testing the new models that were not successful in the previous evaluation. It sources all API keys from the .env file.

## Instructions

- We'll use the grading system S, A, B, C, D, F where S is the best and F is the worst. 
- The prompt in the `Evaluation Details` contains the exact prompt to execute for your nano-agents. 
- IMPORTANT: Execute each nano-agent in parallel.
- IMPORTANT: Here we're delegating work to the nano-agents, do not do any work yourself on behalf of the nano-agents.
- IMPORTANT: When you write the prompt for the nano-agents, be absolutely clear not to change the prompt in anyway unless you are specifying the model to make the results unique.
- IMPORTANT: You're calling the respective claude code sub agents - do not call the `mcp__nano-agent__prompt_nano_agent` tool directly, let the sub agent's handle that.
- IMPORTANT: Source the .env file to ensure all API keys are available.

## Pre-Execution Setup

Before executing the agents, ensure the environment is properly configured:
1. All API keys are loaded from .env file
2. The nano-agent MCP server is running with updated configurations
3. All provider configurations are properly set up

## Evaluation Details

Read and Execute: $ARGUMENTS

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

| Model      | Execution Time | Total Tokens | Total Cost | Input Tokens | Output Tokens |
| ---------- | -------------- | ------------ | ---------- | ------------ | ------------- |
| model_name | X.XXs          | XXX          | $X.XXXXX   | XXX          | XXX           |

### Error Analysis

| Model      | Error Type     | Error Message                  | Resolution Needed              |
| ---------- | -------------- | ------------------------------ | ------------------------------ |
| model_name | API/Model/Config | Specific error details        | What needs to be fixed         |

### Grading Criteria

- **Performance**: Combines accuracy and conciseness of the response
- **Speed**: Relative ranking (fastest = S, slowest = worst grade)
- **Cost**: Relative ranking (cheapest = S, most expensive = worst grade)
- **Overall**: Weighted average considering all factors

### Final Ranking

1. **1st Place**: model_name (Overall Grade: X)
2. **2nd Place**: model_name (Overall Grade: X)
3. **3rd Place**: model_name (Overall Grade: X)

### Configuration Status

| Provider | API Key Status | Models Available | Configuration Issues |
| -------- | -------------- | ---------------- | -------------------- |
| provider | Present/Missing | X of Y          | Any issues          |