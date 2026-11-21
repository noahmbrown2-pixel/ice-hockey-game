# Problem #2: Basic File Reading Test - All Models

## Instructions

- Pass the prompt into each nano-agent AS IS. Do not change the prompt in any way.
- Each agent should execute the task independently.
- This test includes ALL available models sorted by version (higher versions first).

## Variables

PROMPT: "Read the README.md file. Provide exactly the first 10 lines and the last 10 lines of the file. Format your response as follows:
FIRST 10 LINES:
[lines here]

LAST 10 LINES:
[lines here]

Respond with your entire JSON response structure as is."

## Agents

IMPORTANT: You're calling the respective claude code sub agents - do not call the `mcp__nano-agent__prompt_nano_agent` tool directly, let the sub agent's handle that.

### OpenAI Models (16 agents)
@agent-nano-agent-gpt-5 PROMPT
@agent-nano-agent-gpt-5-mini PROMPT
@agent-nano-agent-gpt-5-nano PROMPT
@agent-nano-agent-o4-mini PROMPT
# @agent-nano-agent-o3 PROMPT
# @agent-nano-agent-o3-mini PROMPT
# @agent-nano-agent-o1-pro PROMPT
# @agent-nano-agent-o1 PROMPT
# @agent-nano-agent-o1-mini PROMPT
@agent-nano-agent-gpt-4-1 PROMPT
@agent-nano-agent-gpt-4-1-mini PROMPT
@agent-nano-agent-gpt-4-1-nano PROMPT
@agent-nano-agent-gpt-4-turbo PROMPT
# @agent-nano-agent-gpt-4o PROMPT
# @agent-nano-agent-gpt-4o-mini PROMPT
@agent-nano-agent-gpt-3-5-turbo PROMPT

### Anthropic Models (8 agents)
@agent-nano-agent-claude-opus-4-1 PROMPT
@agent-nano-agent-claude-opus-4 PROMPT
@agent-nano-agent-claude-sonnet-4 PROMPT
@agent-nano-agent-claude-3-7-sonnet PROMPT
@agent-nano-agent-claude-3-5-sonnet PROMPT
@agent-nano-agent-claude-3-5-haiku PROMPT
@agent-nano-agent-claude-3-opus PROMPT
@agent-nano-agent-claude-3-haiku PROMPT

### Gemini Models (4 agents)
# @agent-nano-agent-gemini-2-5-flash PROMPT
@agent-nano-agent-gemini-2-0-flash PROMPT
@agent-nano-agent-gemini-1-5-pro PROMPT
@agent-nano-agent-gemini-1-5-flash PROMPT

### XAI Models (8 agents)
@agent-nano-agent-grok-4 PROMPT
@agent-nano-agent-grok-3 PROMPT
@agent-nano-agent-grok-3-fast PROMPT
@agent-nano-agent-grok-3-mini PROMPT
@agent-nano-agent-grok-3-mini-fast PROMPT
# @agent-nano-agent-grok-2-1212 PROMPT
# @agent-nano-agent-grok-2-vision-1212 PROMPT
# @agent-nano-agent-grok-2-image-1212 PROMPT

### Venice Models (9 agents)
@agent-nano-agent-llama-3-3-70b PROMPT
@agent-nano-agent-llama-3-2-3b PROMPT
@agent-nano-agent-llama-3-1-405b PROMPT
@agent-nano-agent-deepseek-r1-671b PROMPT
@agent-nano-agent-qwen-2-5-qwq-32b PROMPT
@agent-nano-agent-qwen-2-5-coder-32b PROMPT
@agent-nano-agent-qwen-2-5-vl PROMPT
@agent-nano-agent-dolphin-2-9-2-qwen2-72b PROMPT
@agent-nano-agent-venice-uncensored PROMPT

### Groq Models (4 agents)
@agent-nano-agent-llama-3-1-70b-versatile PROMPT
@agent-nano-agent-llama-3-1-8b-instant PROMPT
@agent-nano-agent-mixtral-8x7b-32768 PROMPT
@agent-nano-agent-gemma2-9b-it PROMPT

### DeepSeek Models (4 agents) - COMMENTED OUT DUE TO API ISSUES
# @agent-nano-agent-deepseek-reasoner PROMPT
# @agent-nano-agent-deepseek-reasoner-lite PROMPT
# @agent-nano-agent-deepseek-chat PROMPT
# @agent-nano-agent-deepseek-coder-v2 PROMPT

### Ollama Models (2 agents) - COMMENTED OUT DUE TO SERVICE NOT RUNNING
# @agent-nano-agent-gpt-oss-120b PROMPT
# @agent-nano-agent-gpt-oss-20b PROMPT

## Expected Output

Read the first and last 10 lines of the README.md file yourself and grade the agents based on the `Grading rubric` below.

IMPORTANT: All agents must will respond with this JSON structure. Don't change the structure or add any additional fields. Output it as the given structure as raw JSON for each agent with no preamble.

```json
{
    "success": true,
    "result": "<the formatted first and last 10 lines>",
    "error": null,
    "metadata": {
        ...keep all fields given
    },
    "execution_time_seconds": X.XX
}
```

## Grading rubric

- Did the agent correctly identify and return the first and last 10 lines? How close?
- Did the agent follow the specified format exactly? How well?
- Did the agent successfully use the file reading tool?
- Was the response concise and accurate?