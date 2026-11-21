#!/usr/bin/env python3
"""
Constants for nano agent performance evaluation.
"""

# List of all nano agents to evaluate
NANO_AGENTS = [
    # OpenAI models
    "@agent-nano-agent-gpt-5-nano",
    "@agent-nano-agent-gpt-5-mini",
    "@agent-nano-agent-gpt-5",
    "@agent-nano-agent-gpt-4o",
    "@agent-nano-agent-o1",
    "@agent-nano-agent-o3",
    "@agent-nano-agent-gpt-4-turbo",
    
    # Anthropic models
    "@agent-nano-agent-claude-opus-4-1",
    "@agent-nano-agent-claude-opus-4",
    "@agent-nano-agent-claude-sonnet-4",
    "@agent-nano-agent-claude-3-haiku",
    "@agent-nano-agent-claude-3-7-sonnet",
    "@agent-nano-agent-claude-3-5-haiku",
    
    # Gemini models
    "@agent-nano-agent-gemini-1-5-pro",
    "@agent-nano-agent-gemini-1-5-flash",
    "@agent-nano-agent-gemini-2-0-flash",
    # "@agent-nano-agent-gemini-2-5-flash",
    
    # DeepSeek models
    "@agent-nano-agent-deepseek-reasoner",
    "@agent-nano-agent-deepseek-chat",
    "@agent-nano-agent-deepseek-coder-v2",
    
    # XAI models
    "@agent-nano-agent-grok-code-fast-1",  # NEW code-specialized model
    "@agent-nano-agent-grok-2-1212",
    "@agent-nano-agent-grok-2-vision-1212",
    "@agent-nano-agent-grok-2-image-1212",
    "@agent-nano-agent-grok-3",
    "@agent-nano-agent-grok-3-fast",
    "@agent-nano-agent-grok-3-mini",
    "@agent-nano-agent-grok-3-mini-fast",
    "@agent-nano-agent-grok-4",
    "@agent-nano-agent-grok-4-eu",
    
    # Venice models
    "@agent-nano-agent-llama-3-3-70b",
    "@agent-nano-agent-deepseek-r1-671b",
    "@agent-nano-agent-qwen-2-5-qwq-32b",
    
    # Ollama models
    "@agent-nano-agent-gpt-oss-20b",
    "@agent-nano-agent-gpt-oss-120b",
]

# Agent model mappings for reference
AGENT_MODEL_MAPPING = {
    # OpenAI
    "gpt-5-nano": {"model": "gpt-5-nano", "provider": "openai"},
    "gpt-5-mini": {"model": "gpt-5-mini", "provider": "openai"},
    "gpt-5": {"model": "gpt-5", "provider": "openai"},
    "gpt-4o": {"model": "gpt-4o", "provider": "openai"},
    "o1": {"model": "o1", "provider": "openai"},
    "o3": {"model": "o3", "provider": "openai"},
    "gpt-4-turbo": {"model": "gpt-4-turbo", "provider": "openai"},
    
    # Anthropic
    "claude-opus-4-1": {"model": "claude-opus-4-1-20250805", "provider": "anthropic"},
    "claude-opus-4": {"model": "claude-opus-4-20250514", "provider": "anthropic"},
    "claude-sonnet-4": {"model": "claude-sonnet-4-20250514", "provider": "anthropic"},
    "claude-3-haiku": {"model": "claude-3-haiku-20240307", "provider": "anthropic"},
    "claude-3-7-sonnet": {"model": "claude-3-7-sonnet-20250219", "provider": "anthropic"},
    "claude-3-5-haiku": {"model": "claude-3-5-haiku-20241022", "provider": "anthropic"},
    
    # Gemini
    "gemini-1-5-pro": {"model": "gemini-1.5-pro", "provider": "gemini"},
    "gemini-1-5-flash": {"model": "gemini-1.5-flash", "provider": "gemini"},
    "gemini-2-0-flash": {"model": "gemini-2.0-flash", "provider": "gemini"},
    "gemini-2-5-flash": {"model": "gemini-2.5-flash-preview-04-17", "provider": "gemini"},
    
    # DeepSeek
    "deepseek-reasoner": {"model": "deepseek-reasoner", "provider": "deepseek"},
    "deepseek-chat": {"model": "deepseek-chat", "provider": "deepseek"},
    "deepseek-coder-v2": {"model": "deepseek-coder-v2", "provider": "deepseek"},
    
    # XAI
    "grok-code-fast-1": {"model": "grok-code-fast-1", "provider": "xai"},
    "grok-2-1212": {"model": "grok-2-1212", "provider": "xai"},
    "grok-2-vision-1212": {"model": "grok-2-vision-1212", "provider": "xai"},
    "grok-2-image-1212": {"model": "grok-2-image-1212", "provider": "xai"},
    "grok-3": {"model": "grok-3", "provider": "xai"},
    "grok-3-fast": {"model": "grok-3-fast", "provider": "xai"},
    "grok-3-mini": {"model": "grok-3-mini", "provider": "xai"},
    "grok-3-mini-fast": {"model": "grok-3-mini-fast", "provider": "xai"},
    "grok-4": {"model": "grok-4-0709", "provider": "xai"},
    "grok-4-eu": {"model": "grok-4-0709-eu", "provider": "xai"},
    
    # Venice
    "llama-3-3-70b": {"model": "llama-3.3-70b", "provider": "venice"},
    "deepseek-r1-671b": {"model": "deepseek-r1-671b", "provider": "venice"},
    "qwen-2-5-qwq-32b": {"model": "qwen-2.5-qwq-32b", "provider": "venice"},
    
    # Ollama
    "gpt-oss-20b": {"model": "gpt-oss:20b", "provider": "ollama"},
    "gpt-oss-120b": {"model": "gpt-oss:120b", "provider": "ollama"},
}

# Grading scale
GRADES = ["S", "A", "B", "C", "D", "F"]

# Weight factors for overall grade calculation
GRADE_WEIGHTS = {
    "performance": 0.5,  # Accuracy and quality
    "speed": 0.3,        # Execution time
    "cost": 0.2          # Token cost
}