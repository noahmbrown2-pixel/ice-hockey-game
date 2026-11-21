---
name: plan_w_team
description: Create detailed implementation plans with team orchestration using Builder/Validator agent pattern
allowed-tools: Read, Glob, Grep, Write, WebSearch
disallowed-tools: Task, EnterPlanMode
model: opus
---

# Plan With Team

Create a detailed implementation plan based on the user's requirements. This produces a specification document that can be used as a blueprint for actual development work.

## Variables
- **prompt**: $ARGUMENTS (The task/feature to plan)

## Purpose

Generate comprehensive engineering plans that:
- Define clear objectives and acceptance criteria
- Identify team members and their roles from `.claude/agents/team/`
- Break work into discrete, assignable tasks
- Establish dependencies and sequencing
- Can be executed by development agents without ambiguity

**IMPORTANT**: Do NOT build, write code, or deploy any agents. This is PLANNING ONLY.

## Workflow

### 1. Requirements Analysis
Parse the user prompt to identify:
- Core problem or opportunity being addressed
- Constraints and requirements
- Success criteria
- Scope boundaries

### 2. Codebase Understanding
Directly analyze the codebase to understand:
- Existing patterns and conventions
- Relevant files and modules
- Integration points
- Technical constraints

Do NOT use subagents for this analysis - perform it directly using Read, Glob, Grep tools.

### 3. Solution Design
Develop the technical approach:
- Architecture decisions
- Component design
- Data flow
- Error handling strategy

### 4. Team Definition
Identify team members from `.claude/agents/team/*.md`:
- **Builder Agent**: Implementation specialist with full tool access
- **Validator Agent**: Read-only code quality checker
- Additional specialists as needed

If team agents don't exist, define the required roles inline.

### 5. Task Definition
Create step-by-step tasks with:
- Clear descriptions
- Assigned team member
- Dependencies on other tasks
- Estimated complexity
- Acceptance criteria

### 6. Plan Generation
Output a comprehensive markdown specification to `specs/` directory.

## Plan Format

Save to `specs/plan-{descriptive-name}.md`:

```markdown
# Plan: {Task Name}

## Metadata
- **Created**: {timestamp}
- **Complexity**: simple | medium | complex
- **Task Type**: feature | refactor | fix | enhancement | chore

## Task Description
{Detailed description of what needs to be accomplished}

## Objective
{Clear statement of success - what does "done" look like?}

## Problem Statement
{For medium/complex tasks: specific problem or opportunity being addressed}

## Solution Approach
{For medium/complex tasks: proposed solution and how it addresses the objective}

## Relevant Files
Files needed to complete this task:

### Existing Files
- `path/to/file.py` - Purpose and relevance
- `path/to/other.py` - Purpose and relevance

### New Files (if needed)
- `path/to/new.py` - What it will contain

## Team Orchestration

### Team Members
{List team members from .claude/agents/team/ or define roles}

| Role | Agent | Responsibility |
|------|-------|----------------|
| Builder | builder-agent | Implementation with full tool access |
| Validator | validator-agent | Read-only code quality validation |

### Coordination Protocol
1. Builder implements each phase
2. Validator reviews after each phase
3. Issues logged and addressed before proceeding

## Implementation Phases
{For medium/complex tasks}

### Phase 1: Foundation
- Setup and prerequisite work
- Dependencies and configuration

### Phase 2: Core Implementation
- Main development work
- Feature implementation

### Phase 3: Integration & Polish
- Integration with existing systems
- Testing and documentation

## Step by Step Tasks

Execute every step in order, top to bottom.

### 1. {First Task Name}
**Assigned to**: Builder Agent
**Depends on**: None
**Complexity**: Low/Medium/High

- [ ] Specific action item
- [ ] Specific action item
- [ ] Validation step

### 2. {Second Task Name}
**Assigned to**: Builder Agent
**Depends on**: Task 1
**Complexity**: Low/Medium/High

- [ ] Specific action item
- [ ] Specific action item

### 3. {Validation Task}
**Assigned to**: Validator Agent
**Depends on**: Tasks 1-2

- [ ] Code quality review
- [ ] Pattern compliance check
- [ ] Security review (if applicable)

{Continue with additional tasks...}

## Testing Strategy
{For features and complex tasks}

- Unit tests for new functionality
- Integration tests for system interactions
- Edge case coverage
- Performance considerations

## Acceptance Criteria

- [ ] Criterion 1: Specific, measurable outcome
- [ ] Criterion 2: Specific, measurable outcome
- [ ] Criterion 3: Specific, measurable outcome

## Validation Commands

Execute these to confirm completion:

```bash
# Compile/syntax check
uv run python -m py_compile path/to/file.py

# Run tests
pytest tests/ -v

# Type checking (if applicable)
mypy path/to/file.py
```

## Verifier

A Python verifier that runs in E2B and returns `(passed, evidence)`. This replaces
LLM-as-judge for the Acceptance Criteria. Hermetic by default (no network).

```python
# verifier-config: timeout=60 ram=512 network=false
from pathlib import Path

REPO = Path("/repo")

def verify() -> tuple[bool, dict]:
    checks = []
    # Example: assert each "Files To Create" path actually exists with non-trivial content
    for p in [REPO / "scripts" / "your_module.py"]:
        ok = p.exists() and p.stat().st_size > 200
        checks.append({"name": f"exists:{p}", "passed": ok})
    passed = all(c["passed"] for c in checks)
    evidence = {"checks": checks}
    if not passed:
        evidence["error"] = "One or more deliverables missing or stub"
    return passed, evidence
```

The verifier block above is automatically saved to `specs/verifiers/plan-rq-NNN-verifier.py`.

## Notes

- Dependencies: Any new packages needed (use `uv add`)
- Risks: Known risks or considerations
- Follow-up: Potential future work
```

## Output

After creating the plan:
1. Save to `specs/plan-{descriptive-name}.md`
2. Return ONLY the path to the created plan file

## Example Usage

User: "Add a caching layer to the LLM router"

Creates: `specs/plan-llm-router-caching.md`

Returns: `/home/craigmbrown/Project/specs/plan-llm-router-caching.md`
