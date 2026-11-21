# Problem #3: File Operations Test - All Models

## Instructions

- Pass the prompt into each nano-agent AS IS, replacing MODEL_NAME with the actual model name.
- Each agent works in isolation by using their unique model name in file paths.
- This test includes ALL available models sorted by version (higher versions first).

## Variables

PROMPT: "Complete the following tasks:
1. Read the .claude/settings.json file and extract all unique hook names (the keys of the 'hooks' object).
2. Create a file called 'summary_MODEL_NAME.json' (replace MODEL_NAME with your actual model name) with the following content:
   {
     'model': 'MODEL_NAME',
     'hook_names': [<array of all unique hook names you found>],
     'test_status': 'completed'
   }
3. Create another file called 'signature_MODEL_NAME.txt' with the content: 'MODEL_NAME was here - Successfully completed file operations test'
4. List the current directory to show your created files exist.

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

Verify each agent created their uniquely named files and that the contents match the specifications.

IMPORTANT: All agents must will respond with this JSON structure. Don't change the structure or add any additional fields. Output it as the given structure as raw JSON for each agent with no preamble.

```json
{
    "success": true,
    "result": "<summary of files created and directory listing>",
    "error": null,
    "metadata": {
        ...keep all fields given
    },
    "execution_time_seconds": X.XX
}
```

## Grading rubric

- Did the agent correctly extract all unique hook names from .claude/settings.json? ["PreToolUse", "PostToolUse", "Notification", "Stop", "SubagentStop", "PreCompact", "UserPromptSubmit", "SessionStart"]
- Did the agent create both files with correct JSON structure and content?
- Did the agent use unique file names to avoid conflicts with other agents?
- Did the agent complete all 4 tasks successfully?
- Did the agent properly handle file reading, JSON parsing, and file writing operations?