# Claude Integration Guide

Complete guide for integrating Claude AI agents into your development workflow (2026).

## Table of Contents

1. [Overview](#overview)
2. [Claude Models](#claude-models)
3. [Setup and Configuration](#setup-and-configuration)
4. [API Integration](#api-integration)
5. [Prompt Engineering](#prompt-engineering)
6. [Tool Use (Function Calling)](#tool-use-function-calling)
7. [Best Practices](#best-practices)
8. [Common Patterns](#common-patterns)
9. [Cost Optimization](#cost-optimization)

## Overview

Claude is Anthropic's family of AI models, excellent for:
- Code generation and review
- Technical documentation
- Complex reasoning tasks
- Long-context understanding (up to 200K tokens)
- Safe and helpful responses

### Why Claude for AI Agents?

- **Extended context**: Handle entire codebases
- **Tool use**: Native function calling for agent actions
- **Safety**: Built-in guardrails and responsible AI practices
- **Reasoning**: Strong analytical and problem-solving capabilities
- **Code understanding**: Trained on diverse code repositories

## Claude Models

### Available Models (March 2026)

| Model | Context Window | Best For | Cost |
|-------|---------------|----------|------|
| Claude Opus 4 | 200K tokens | Complex reasoning, architecture decisions | $$$ |
| Claude Sonnet 4.5 | 200K tokens | Balanced performance, general development | $$ |
| Claude Haiku 4 | 200K tokens | Fast, simple tasks, code reviews | $ |

### Model Selection Guide

```python
# For complex refactoring and architecture
model = "claude-opus-4"
temperature = 0.3

# For code review and documentation
model = "claude-sonnet-4.5"
temperature = 0.4

# For quick syntax checks and simple tasks
model = "claude-haiku-4"
temperature = 0.2
```

## Setup and Configuration

### 1. Install SDK

```bash
pip install anthropic
```

### 2. Environment Setup

```bash
# .env file
ANTHROPIC_API_KEY=sk-ant-api03-...
ANTHROPIC_MODEL=claude-sonnet-4.5
ANTHROPIC_MAX_TOKENS=4000
```

### 3. Basic Configuration

```python
import os
from anthropic import Anthropic

client = Anthropic(
    api_key=os.environ.get("ANTHROPIC_API_KEY")
)
```

## API Integration

### Basic Message API

```python
from anthropic import Anthropic

client = Anthropic()

def generate_code_review(code: str) -> str:
    message = client.messages.create(
        model="claude-sonnet-4.5",
        max_tokens=4000,
        temperature=0.3,
        system="You are an expert code reviewer. Focus on security, performance, and best practices.",
        messages=[
            {
                "role": "user",
                "content": f"Review this code:\n\n```python\n{code}\n```"
            }
        ]
    )
    
    return message.content[0].text
```

### Streaming Responses

```python
def stream_code_generation(prompt: str):
    with client.messages.stream(
        model="claude-sonnet-4.5",
        max_tokens=4000,
        messages=[{"role": "user", "content": prompt}]
    ) as stream:
        for text in stream.text_stream:
            print(text, end="", flush=True)
```

### Conversation Memory

```python
class ClaudeConversation:
    def __init__(self):
        self.client = Anthropic()
        self.messages = []
        self.system_prompt = "You are a helpful coding assistant."
    
    def add_message(self, role: str, content: str):
        self.messages.append({"role": role, "content": content})
    
    def generate_response(self):
        response = self.client.messages.create(
            model="claude-sonnet-4.5",
            max_tokens=4000,
            system=self.system_prompt,
            messages=self.messages
        )
        
        assistant_message = response.content[0].text
        self.add_message("assistant", assistant_message)
        
        return assistant_message

# Usage
conversation = ClaudeConversation()
conversation.add_message("user", "Explain async/await in Python")
response = conversation.generate_response()
print(response)

conversation.add_message("user", "Show me an example")
response = conversation.generate_response()
print(response)
```

## Prompt Engineering

### System Prompts

#### Code Review Agent
```python
SYSTEM_PROMPT = """You are an expert code reviewer with deep knowledge of software engineering best practices.

Your responsibilities:
1. Identify security vulnerabilities
2. Suggest performance optimizations
3. Check for code smells and anti-patterns
4. Ensure adherence to style guides
5. Recommend improvements

Format your reviews as:
- CRITICAL: Must fix before merge
- WARNING: Should fix soon
- SUGGESTION: Nice to have improvements

Always provide specific line references and actionable suggestions."""
```

#### Documentation Agent
```python
SYSTEM_PROMPT = """You are a technical documentation expert.

Guidelines:
- Write clear, concise documentation
- Include code examples where relevant
- Use proper markdown formatting
- Target audience: developers with intermediate knowledge
- Follow Google developer documentation style guide

Structure:
1. Brief overview
2. Detailed explanation
3. Code examples
4. Common pitfalls
5. Related resources"""
```

#### Refactoring Agent
```python
SYSTEM_PROMPT = """You are a refactoring specialist focused on code quality.

Principles:
- Preserve existing behavior
- Improve readability and maintainability
- Follow SOLID principles
- Use appropriate design patterns
- Consider performance implications

Always:
1. Explain the rationale for changes
2. Show before/after code
3. Highlight potential risks
4. Suggest testing approaches"""
```

### Effective Prompt Templates

#### Task-Specific Prompts

```python
# Code Review Template
REVIEW_TEMPLATE = """Review the following {language} code for:
- Security vulnerabilities
- Performance issues
- Best practices violations
- Code maintainability

Code:
```{language}
{code}
```

Context:
- Project: {project_name}
- Framework: {framework}
- Purpose: {purpose}

Provide specific, actionable feedback."""

# Refactoring Template
REFACTOR_TEMPLATE = """Analyze and refactor this {language} code.

Original Code:
```{language}
{code}
```

Requirements:
- Improve readability
- Apply design patterns where appropriate
- Maintain backwards compatibility
- Add type hints (if applicable)

Provide:
1. List of issues found
2. Refactored code
3. Explanation of changes"""

# Test Generation Template
TEST_TEMPLATE = """Generate comprehensive tests for this function.

Function:
```{language}
{function_code}
```

Test Framework: {framework}

Include:
1. Happy path tests
2. Edge cases
3. Error conditions
4. Integration scenarios (if applicable)

Use descriptive test names and proper assertions."""
```

### Few-Shot Learning

```python
FEW_SHOT_EXAMPLES = """Here are examples of good code reviews:

Example 1:
Code: `password = request.GET['password']`
Review: CRITICAL - Security vulnerability. Never pass passwords via GET parameters. Use POST with HTTPS and hash the password before storage.

Example 2:
Code: `for i in range(len(items)): item = items[i]`
Review: SUGGESTION - Use pythonic iteration: `for item in items:`

Now review this code:
{code}
"""
```

## Tool Use (Function Calling)

### Define Tools

```python
tools = [
    {
        "name": "read_file",
        "description": "Read the contents of a file from the codebase",
        "input_schema": {
            "type": "object",
            "properties": {
                "file_path": {
                    "type": "string",
                    "description": "Path to the file to read"
                }
            },
            "required": ["file_path"]
        }
    },
    {
        "name": "write_file",
        "description": "Write content to a file",
        "input_schema": {
            "type": "object",
            "properties": {
                "file_path": {
                    "type": "string",
                    "description": "Path to the file"
                },
                "content": {
                    "type": "string",
                    "description": "Content to write"
                }
            },
            "required": ["file_path", "content"]
        }
    },
    {
        "name": "run_tests",
        "description": "Execute test suite",
        "input_schema": {
            "type": "object",
            "properties": {
                "test_path": {
                    "type": "string",
                    "description": "Path to tests"
                }
            },
            "required": ["test_path"]
        }
    }
]
```

### Agent with Tool Use

```python
class ClaudeAgent:
    def __init__(self):
        self.client = Anthropic()
        self.tools = tools
    
    def process_tool_call(self, tool_name: str, tool_input: dict):
        """Execute the requested tool"""
        if tool_name == "read_file":
            return self.read_file(tool_input["file_path"])
        elif tool_name == "write_file":
            return self.write_file(tool_input["file_path"], tool_input["content"])
        elif tool_name == "run_tests":
            return self.run_tests(tool_input["test_path"])
    
    def run_agent_loop(self, user_message: str):
        messages = [{"role": "user", "content": user_message}]
        
        while True:
            response = self.client.messages.create(
                model="claude-sonnet-4.5",
                max_tokens=4000,
                tools=self.tools,
                messages=messages
            )
            
            # Check if Claude wants to use a tool
            if response.stop_reason == "tool_use":
                # Process tool calls
                tool_results = []
                for content in response.content:
                    if content.type == "tool_use":
                        result = self.process_tool_call(
                            content.name,
                            content.input
                        )
                        tool_results.append({
                            "type": "tool_result",
                            "tool_use_id": content.id,
                            "content": result
                        })
                
                # Add assistant response and tool results to messages
                messages.append({"role": "assistant", "content": response.content})
                messages.append({"role": "user", "content": tool_results})
            else:
                # Final response
                return response.content[0].text
    
    def read_file(self, file_path: str) -> str:
        with open(file_path, 'r') as f:
            return f.read()
    
    def write_file(self, file_path: str, content: str) -> str:
        with open(file_path, 'w') as f:
            f.write(content)
        return f"Successfully wrote to {file_path}"
    
    def run_tests(self, test_path: str) -> str:
        import subprocess
        result = subprocess.run(['pytest', test_path], capture_output=True, text=True)
        return result.stdout

# Usage
agent = ClaudeAgent()
response = agent.run_agent_loop("Review the authentication module and update the tests")
print(response)
```

## Best Practices

### 1. Context Management

```python
def build_context(file_path: str, max_context_lines: int = 500) -> str:
    """Build focused context for Claude"""
    context_parts = []
    
    # Add file structure
    context_parts.append("Project Structure:\n" + get_project_structure())
    
    # Add relevant imports
    context_parts.append("\nRelevant Imports:\n" + get_imports(file_path))
    
    # Add main code (truncated if needed)
    code = read_file(file_path)
    if len(code.splitlines()) > max_context_lines:
        code = truncate_with_summary(code, max_context_lines)
    context_parts.append(f"\nCode:\n{code}")
    
    # Add related files
    related = get_related_files(file_path)
    if related:
        context_parts.append("\nRelated Files:\n" + "\n".join(related))
    
    return "\n".join(context_parts)
```

### 2. Error Handling

```python
import backoff
from anthropic import APIError, RateLimitError

class RobustClaudeAgent:
    @backoff.on_exception(
        backoff.expo,
        RateLimitError,
        max_tries=5
    )
    def call_claude(self, messages):
        try:
            response = self.client.messages.create(
                model="claude-sonnet-4.5",
                max_tokens=4000,
                messages=messages
            )
            return response
        except APIError as e:
            self.logger.error(f"API Error: {e}")
            raise
        except Exception as e:
            self.logger.error(f"Unexpected error: {e}")
            return self.fallback_response()
```

### 3. Response Validation

```python
def validate_code_response(response: str, language: str) -> bool:
    """Validate generated code"""
    # Check for code blocks
    if f"```{language}" not in response:
        return False
    
    # Extract code
    code = extract_code_block(response, language)
    
    # Basic syntax check
    if language == "python":
        try:
            compile(code, '<string>', 'exec')
            return True
        except SyntaxError:
            return False
    
    return True
```

### 4. Token Management

```python
import tiktoken

class TokenAwareAgent:
    def __init__(self):
        self.client = Anthropic()
        # Claude uses a similar tokenizer to GPT
        self.tokenizer = tiktoken.get_encoding("cl100k_base")
    
    def count_tokens(self, text: str) -> int:
        return len(self.tokenizer.encode(text))
    
    def truncate_to_fit(self, text: str, max_tokens: int) -> str:
        tokens = self.tokenizer.encode(text)
        if len(tokens) <= max_tokens:
            return text
        
        truncated = self.tokenizer.decode(tokens[:max_tokens])
        return truncated + "\n... (truncated)"
    
    def prepare_prompt(self, user_input: str, context: str):
        total_budget = 180000  # Leave room for response
        system_tokens = self.count_tokens(self.system_prompt)
        user_tokens = self.count_tokens(user_input)
        
        available_for_context = total_budget - system_tokens - user_tokens - 1000
        
        if self.count_tokens(context) > available_for_context:
            context = self.truncate_to_fit(context, available_for_context)
        
        return context
```

## Common Patterns

### Pattern 1: Iterative Refinement

```python
class IterativeRefinementAgent:
    def refine_code(self, initial_code: str, iterations: int = 3):
        code = initial_code
        
        for i in range(iterations):
            review = self.review_code(code)
            
            if review.is_acceptable():
                break
            
            code = self.improve_code(code, review.suggestions)
        
        return code
    
    def review_code(self, code: str):
        prompt = f"Review this code and identify issues:\n{code}"
        return self.call_claude(prompt)
    
    def improve_code(self, code: str, suggestions: list):
        prompt = f"""Improve this code based on feedback:

Code:
{code}

Feedback:
{suggestions}

Provide the improved code."""
        return self.call_claude(prompt)
```

### Pattern 2: Self-Critique

```python
def generate_with_critique(task: str) -> str:
    # Generate initial solution
    solution = client.messages.create(
        model="claude-sonnet-4.5",
        max_tokens=4000,
        messages=[{"role": "user", "content": task}]
    ).content[0].text
    
    # Self-critique
    critique = client.messages.create(
        model="claude-sonnet-4.5",
        max_tokens=2000,
        messages=[
            {"role": "user", "content": task},
            {"role": "assistant", "content": solution},
            {"role": "user", "content": "Critically review your solution. What could be improved?"}
        ]
    ).content[0].text
    
    # Refine based on critique
    final_solution = client.messages.create(
        model="claude-sonnet-4.5",
        max_tokens=4000,
        messages=[
            {"role": "user", "content": task},
            {"role": "assistant", "content": solution},
            {"role": "user", "content": f"Improve based on this critique:\n{critique}"}
        ]
    ).content[0].text
    
    return final_solution
```

### Pattern 3: Multi-Step Reasoning

```python
def complex_task_with_chain_of_thought(task: str) -> str:
    prompt = f"""Task: {task}

Let's solve this step by step:
1. First, understand the requirements
2. Break down the problem
3. Design the solution
4. Implement the code
5. Add tests

Please work through each step explicitly."""

    response = client.messages.create(
        model="claude-opus-4",  # Use Opus for complex reasoning
        max_tokens=8000,
        temperature=0.3,
        messages=[{"role": "user", "content": prompt}]
    )
    
    return response.content[0].text
```

## Cost Optimization

### 1. Model Selection

```python
def choose_model(task_complexity: str) -> str:
    """Select most cost-effective model"""
    if task_complexity == "simple":
        return "claude-haiku-4"  # Fastest, cheapest
    elif task_complexity == "moderate":
        return "claude-sonnet-4.5"  # Balanced
    else:
        return "claude-opus-4"  # Most capable
```

### 2. Caching

```python
from functools import lru_cache
import hashlib

class CachedClaudeAgent:
    def __init__(self):
        self.client = Anthropic()
        self.cache = {}
    
    def get_cache_key(self, prompt: str) -> str:
        return hashlib.md5(prompt.encode()).hexdigest()
    
    def call_with_cache(self, prompt: str):
        cache_key = self.get_cache_key(prompt)
        
        if cache_key in self.cache:
            return self.cache[cache_key]
        
        response = self.client.messages.create(
            model="claude-sonnet-4.5",
            max_tokens=4000,
            messages=[{"role": "user", "content": prompt}]
        )
        
        result = response.content[0].text
        self.cache[cache_key] = result
        
        return result
```

### 3. Batch Processing

```python
def batch_review_files(file_paths: list[str], batch_size: int = 5):
    """Review multiple files in one request"""
    results = []
    
    for i in range(0, len(file_paths), batch_size):
        batch = file_paths[i:i + batch_size]
        
        prompt = "Review these files:\n\n"
        for path in batch:
            code = read_file(path)
            prompt += f"\n---{path}---\n{code}\n"
        
        review = client.messages.create(
            model="claude-sonnet-4.5",
            max_tokens=8000,
            messages=[{"role": "user", "content": prompt}]
        ).content[0].text
        
        results.append(review)
    
    return results
```

### 4. Usage Tracking

```python
class CostTracker:
    # Approximate costs (check current pricing)
    COSTS = {
        "claude-opus-4": {"input": 0.015, "output": 0.075},
        "claude-sonnet-4.5": {"input": 0.003, "output": 0.015},
        "claude-haiku-4": {"input": 0.00025, "output": 0.00125}
    }
    
    def __init__(self):
        self.usage = []
    
    def track_call(self, model: str, input_tokens: int, output_tokens: int):
        cost = (
            input_tokens * self.COSTS[model]["input"] / 1000 +
            output_tokens * self.COSTS[model]["output"] / 1000
        )
        
        self.usage.append({
            "model": model,
            "input_tokens": input_tokens,
            "output_tokens": output_tokens,
            "cost": cost
        })
    
    def total_cost(self) -> float:
        return sum(u["cost"] for u in self.usage)
```

## Production Considerations

### 1. Rate Limiting

```python
from ratelimit import limits, sleep_and_retry

class ProductionClaudeAgent:
    @sleep_and_retry
    @limits(calls=50, period=60)  # 50 calls per minute
    def call_api(self, messages):
        return self.client.messages.create(
            model="claude-sonnet-4.5",
            max_tokens=4000,
            messages=messages
        )
```

### 2. Monitoring

```python
import logging
from datetime import datetime

class MonitoredAgent:
    def __init__(self):
        self.client = Anthropic()
        self.logger = logging.getLogger(__name__)
    
    def call_claude(self, messages):
        start_time = datetime.now()
        
        try:
            response = self.client.messages.create(
                model="claude-sonnet-4.5",
                max_tokens=4000,
                messages=messages
            )
            
            duration = (datetime.now() - start_time).total_seconds()
            
            self.logger.info(f"Claude call successful", extra={
                "duration": duration,
                "input_tokens": response.usage.input_tokens,
                "output_tokens": response.usage.output_tokens,
                "model": "claude-sonnet-4.5"
            })
            
            return response
        except Exception as e:
            self.logger.error(f"Claude call failed: {e}")
            raise
```

### 3. Graceful Degradation

```python
class ResilientAgent:
    def call_with_fallback(self, messages):
        try:
            # Try primary model
            return self.client.messages.create(
                model="claude-sonnet-4.5",
                messages=messages
            )
        except RateLimitError:
            # Fall back to cheaper model
            return self.client.messages.create(
                model="claude-haiku-4",
                messages=messages
            )
        except Exception:
            # Return cached or default response
            return self.get_cached_response(messages)
```

## Testing Claude Agents

```python
import pytest
from unittest.mock import Mock, patch

def test_code_review_agent():
    agent = CodeReviewAgent()
    
    # Mock Claude API
    with patch.object(agent.client, 'messages') as mock_messages:
        mock_messages.create.return_value = Mock(
            content=[Mock(text="Code looks good!")]
        )
        
        result = agent.review_code("def hello(): pass")
        
        assert "good" in result.lower()
        mock_messages.create.assert_called_once()

def test_agent_handles_errors():
    agent = CodeReviewAgent()
    
    with patch.object(agent.client, 'messages') as mock_messages:
        mock_messages.create.side_effect = APIError("Rate limit")
        
        with pytest.raises(APIError):
            agent.review_code("code")
```

## Resources

- [Anthropic API Documentation](https://docs.anthropic.com/)
- [Claude Prompt Library](https://docs.anthropic.com/claude/prompt-library)
- [Tool Use Guide](https://docs.anthropic.com/claude/docs/tool-use)
- [Best Practices](https://docs.anthropic.com/claude/docs/best-practices)

## Next Steps

1. Review [agents.md](agents.md) for general agent patterns
2. Check [agent_configs/](agent_configs/) for specific configurations
3. Try the examples in [examples/](examples/)
4. Explore [prompts/](prompts/) for reusable templates

---

*Last Updated: March 2026*
