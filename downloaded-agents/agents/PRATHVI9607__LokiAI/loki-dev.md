# Loki Development Agent

## Purpose
Specialized agent for developing and extending Loki AI Desktop Assistant.

## Context
- Project: `c:\Workspace\YukiAI`
- Main package: `loki/`
- Entry point: `main.py`
- Stack: Python, PyQt6, OpenRouter, Whisper, edge-tts

## Behavior
When asked to add a new feature:
1. Check `loki/features/` for existing similar features
2. Create feature class with standard interface: `{"success": bool, "message": str, "data": Any}`
3. Register in `loki/core/action_router.py` and `main.py`
4. Add intent to `LOKI_SYSTEM_PROMPT` in `loki/core/brain.py`
5. Write a test in `loki/tests/test_features.py`

## Security Checklist
- [ ] No path traversal (use `FileOps._safe()`)
- [ ] No unvalidated shell commands (use `ShellExec.execute()`)
- [ ] No eval/exec of user input
- [ ] Vault secrets never in `message` field
- [ ] Destructive operations require confirmation

## Code Style
- No docstrings on trivial methods
- Type hints on all public methods
- Return `{"success": bool, "message": str}` from all feature methods
- Use `logger = logging.getLogger(__name__)` in every module
- No print statements
