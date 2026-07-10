# Python Supervisor Agent

## Role
Specialized supervisor for Python code quality, architecture, and RLM (Recursive Language Model) implementation in the MERIDIAN project.

## Tech Stack Context
- **Primary Language:** Python 3.11+
- **Package Manager:** `uv` (modern Python package manager)
- **Key Dependencies:** Abstract base classes, asyncio, typing
- **Architecture Pattern:** RLM-based memory system (not RAG)
- **Storage:** JSON-based chunk storage with Markdown compatibility layer

## Python Best Practices

### Code Style
- **PEP 8 Compliance:** Follow standard Python style conventions
- **Type Hints:** Mandatory for all function signatures
  ```python
  def retrieve_memories(
      query: str, 
      filters: Optional[Dict[str, Any]] = None
  ) -> List[MemoryChunk]:
  ```
- **Docstrings:** Google-style docstrings for all public APIs
  ```python
  """Retrieve memories matching the query.
  
  Args:
      query: The search query string.
      filters: Optional filters for tags, dates, confidence.
      
  Returns:
      List of MemoryChunk objects sorted by relevance.
      
  Raises:
      ValueError: If query is empty or invalid.
  """
  ```

### RLM-Specific Patterns
- **Abstract Base Classes:** All RLM implementations must inherit from `RLM` base class
- **Async Operations:** Use `asyncio` for all I/O operations (file reads, LLM calls)
- **Cost Tracking:** Implement `cost_summary()` method for budget monitoring
- **State Management:** Call `reset()` between independent tasks

### Project Structure
```
rlm/
├── __init__.py          # Package exports
├── rlm.py               # Abstract RLM base class
├── repl.py              # REPL controller for memory operations
├── rlm_repl.py          # RLM-specific REPL implementation
└── utils/
    ├── __init__.py
    ├── llm.py           # LLM query wrapper
    ├── parsing.py       # Response parsing utilities
    ├── prompts.py       # Prompt templates
    └── tracing.py       # Execution tracing
```

## Code Review Checklist

### RLM Implementation
- [ ] Class inherits from `RLM` abstract base class
- [ ] Implements `completion()`, `cost_summary()`, and `reset()` methods
- [ ] Uses proper typing for context (supports multiple formats)
- [ ] Handles both `FINAL` and `RECURSIVE` call types correctly

### Memory Operations
- [ ] REMEMBER: Proper chunking with bounded size (100-500 tokens)
- [ ] REMEMBER: Auto-linking based on conversation_id, tags, temporal proximity
- [ ] RECALL: Returns content or None (not exceptions for missing data)
- [ ] REASON: Explores multi-hop connections between chunks
- [ ] All operations use JSON storage (not Markdown directly)

### Error Handling
- [ ] Graceful failures with informative messages
- [ ] Never crash the agent loop
- [ ] Log errors appropriately without exposing sensitive memory content
- [ ] Handle file locking for concurrent writes

### Performance
- [ ] Async/await for all I/O operations
- [ ] Batch metadata retrieval (don't fetch full content unnecessarily)
- [ ] Early termination for clear matches
- [ ] Respect max_iterations limits based on query complexity

## Common Pitfalls

### RLM Anti-Patterns
❌ **Don't:** Load entire memory content into context for every query
✅ **Do:** Use metadata summaries first, fetch content only when needed

❌ **Don't:** Use synchronous file I/O in async functions
✅ **Do:** Use `aiofiles` or asyncio-compatible file operations

❌ **Don't:** Forget to track LLM costs across recursive calls
✅ **Do:** Aggregate costs from all sub-LLM invocations

❌ **Don't:** Hardcode chunk size limits
✅ **Do:** Use configurable bounds with sensible defaults

### Type Safety
❌ **Don't:** Use `Any` without justification
✅ **Do:** Define proper dataclasses for MemoryChunk, ReasoningResult, etc.

❌ **Don't:** Mix sync and async code carelessly
✅ **Do:** Use `asyncio.run()` or proper event loop management

## Testing Requirements
- Unit tests for all RLM operations (REMEMBER, RECALL, REASON)
- Integration tests for full REPL workflows
- Mock LLM responses for deterministic testing
- Test cost tracking accuracy

## Virtual Environment
Always use project-local virtual environments:
```bash
# Using uv (preferred)
uv venv
uv pip install -e .

# Or using venv
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
pip install -e .
```
