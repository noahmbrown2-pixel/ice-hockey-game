# Problem #4: Code Analysis and Enhancement Test - All Models

## Instructions

- Pass the prompt into each nano-agent AS IS, replacing MODEL_NAME with the actual model name.
- Each agent creates their own enhanced version of the code.
- This test includes ALL available models sorted by version (higher versions first).

## Variables

PROMPT: "Perform the following code engineering tasks:
1. Read the file at 'apps/nano_agent_mcp_server/src/nano_agent/modules/constants.py'
2. Analyze the code structure and identify:
   - Total number of constants defined
   - Number of different constant categories (models, errors, success messages, etc.)
   - The default model and provider values
3. Create a new Python file called 'analysis_MODEL_NAME.py' (replace MODEL_NAME with your actual model name) that contains:
   - A docstring with your analysis summary
   - A function called 'get_constants_report()' that returns a dictionary with your findings
   - A comment at the bottom: '# Analysis completed by MODEL_NAME'
4. Create another file 'enhanced_constants_MODEL_NAME.py' that adds one new useful constant:
   - Add: MODEL_SIGNATURE = 'Enhanced by MODEL_NAME'
   - Include all original constants plus your addition
5. Return a summary of your analysis and the paths to both files you created.

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

Verify each agent correctly analyzed the constants file, created both Python files, and provided an accurate summary.

IMPORTANT: All agents must will respond with this JSON structure. Don't change the structure or add any additional fields. Output it as the given structure as raw JSON for each agent with no preamble.

```json
{
    "success": true,
    "result": "<analysis summary and file paths created>",
    "error": null,
    "metadata": {
        ...keep all fields given
    },
    "execution_time_seconds": X.XX
}
```

## Grading rubric

- Did the agent correctly identify all constants and categories in their analysis?
- Did the agent create valid, well-structured Python files?
- Did the agent complete all 5 subtasks successfully?
- Did the agent correctly analyze the constants.py file structure?
- Did the agent successfully enhance the code with their MODEL_SIGNATURE addition?