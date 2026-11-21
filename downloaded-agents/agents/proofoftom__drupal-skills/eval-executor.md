---
name: eval-executor
description: |
  DEPRECATED for eval pipeline — use headless `claude -p` instead.
  The agent harness provides implicit knowledge that confounds A/B comparisons.
  Kept for reference only.
model: haiku
permissionMode: bypassPermissions
tools: Read, Write, Edit, Bash, Glob, Grep
---

## DEPRECATED

This agent is **not used** in the eval pipeline. Headless `claude -p` is used instead
because the agent harness (system prompt, tool context, etc.) provides implicit Drupal
knowledge that eliminates the delta between with-skill and without-skill runs.

**Evidence:** Agent-based runs showed 0% delta on caching (8/8 vs 8/8).
Headless runs showed 37.5% delta (8/8 vs 5/8). Session 15 confirmed this.

## Headless Eval Pipeline

The orchestrator (main session) runs code generation via headless `claude -p`:

### Without skill (baseline):
```bash
unset CLAUDECODE
cat <<'PROMPT' | claude -p --model claude-haiku-4-5-20251001 --allowedTools 'Read,Write,Edit,Bash'
[task prompt from evals.json]

Create all files in /tmp/d10-<skill>-without/web/modules/custom/<module_name>/
After creating all files, enable the module by running: cd /tmp/d10-<skill>-without && ddev drush en <module_name> -y && ddev drush cr
Do NOT ask questions -- just create the code.
PROMPT
```

### With skill:
```bash
unset CLAUDECODE
cat <<'PROMPT' | claude -p --model claude-haiku-4-5-20251001 --allowedTools 'Read,Write,Edit,Bash'
First, read the skill file at /path/to/SKILL.md and apply its patterns to the following task.

[task prompt from evals.json]

Create all files in /tmp/d10-<skill>-with/web/modules/custom/<module_name>/
After creating all files, enable the module by running: cd /tmp/d10-<skill>-with && ddev drush en <module_name> -y && ddev drush cr
Do NOT ask questions -- just create the code.
PROMPT
```

### Then grade with eval-grader agent (unchanged):
- eval-browser runs first if skill has `(via eval-browser)` expectations
- eval-grader receives code path + browser report + expectations
