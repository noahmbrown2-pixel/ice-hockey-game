# DryDock Runtime System

**Autonomous execution for sophisticated DryDock agents**

This directory contains Claude Code subagents that enable autonomous execution of DryDock agent configurations. The runtime system allows you to leverage DryDock's sophisticated agent workflows, decision logic, and quality gates in autonomous, task-completing mode.

---

## What is DryDock Runtime?

**DryDock Runtime** is an execution engine that:
- Loads DryDock agent configurations from the `output/` directory
- Executes their capabilities autonomously without user interaction
- Applies workflows, decision logic, and quality gates
- Returns comprehensive, high-quality results

Think of it as: **DryDock agents = sophisticated configuration | Runtime = autonomous executor**

---

## Available Subagents

### 1. drydock-runtime.md
**The main autonomous execution engine**

- **Purpose:** Loads and executes DryDock agent configurations autonomously
- **Tools:** Read, Write, Edit, Bash, Grep, Glob, WebSearch, WebFetch
- **Use When:** You have a well-defined task and want autonomous execution to completion

**Example usage:**
```
"Use drydock-runtime to review this authentication code for security issues"
```

The runtime will:
1. Identify the task (code review with security focus)
2. Load the appropriate agent (Developer)
3. Extract the code_review capability
4. Apply decision logic (auth code → prioritize security)
5. Execute the workflow autonomously
6. Return comprehensive security review

### 2. drydock-selector.md
**Agent discovery and recommendation helper**

- **Purpose:** Helps you find and select the right DryDock agent
- **Tools:** Read, Glob
- **Use When:** You're unsure which agent to use or want to see what's available

**Example usage:**
```
"Use drydock-selector to show me what agents I have"
"Use drydock-selector to recommend an agent for project planning"
```

---

## How It Works

### Architecture

```
User Request
    ↓
Claude Code Subagent (drydock-runtime)
    ↓
Loads DryDock Agent Config (output/[agent]/)
    ↓
Parses: capabilities, workflows, decision logic, quality gates
    ↓
Maps permissions → Claude Code tools
    ↓
Executes workflow autonomously
    ↓
Returns comprehensive result
```

### Execution Flow

1. **Task Analysis** - Runtime identifies task type and domain
2. **Agent Selection** - Chooses appropriate DryDock agent
3. **Configuration Loading** - Reads agent's core configuration file
4. **Capability Matching** - Finds the right capability for the task
5. **Workflow Execution** - Follows the workflow pattern (sequential, parallel, iterative, etc.)
6. **Quality Enforcement** - Applies quality gates at validation points
7. **Result Delivery** - Returns complete, professional output

---

## Usage Modes

### Interactive Mode (Traditional DryDock)
```
User: Provide output/developer/developer.activationkey
Agent: [Presents menu, asks questions, guides step-by-step]
```

**Best for:**
- Exploratory tasks
- When you want control over each step
- Learning agent capabilities
- Building complex configurations interactively

### Autonomous Mode (Runtime)
```
User: "Use drydock-runtime to [task]"
Runtime: [Loads config, executes autonomously, returns result]
```

**Best for:**
- Well-defined tasks
- Batch operations
- Autonomous execution to completion
- When you want results without interaction

**Both modes use the same agent configuration - you choose based on your needs.**

---

## Task-to-Agent Mapping

The runtime automatically selects the right agent based on your task:

| Task Type | DryDock Agent | Example |
|-----------|---------------|---------|
| Code tasks | Developer | "Review this code", "Fix this bug", "Write tests" |
| Project tasks | Project Manager | "Plan this project", "Create timeline" |
| QA tasks | QA Engineer | "Test this feature", "Create test plan" |
| Documentation | Technical Writer | "Document this API", "Write user guide" |
| Analysis | Business Analyst | "Analyze requirements", "Create report" |
| Infrastructure | DevOps Engineer | "Deploy this app", "Set up CI/CD" |
| Security | Security Engineer | "Security audit", "Vulnerability scan" |
| Design | Product Designer | "Design this feature", "Create wireframes" |

---

## Prerequisites

### Required: DryDock Agents
The runtime needs DryDock agents to execute. To create agents:

1. **Activate DryDock:**
   ```
   Provide drydock.activationkey to Claude
   ```

2. **Select a template or build custom:**
   - Quick Start: Choose from 20 pre-built templates
   - Custom Build: Define your own agent from scratch

3. **Generate the agent:**
   - DryDock creates files in `output/[agent_name]/`
   - Includes `.activationkey` and `_core.[extension]` files

4. **Now use runtime:**
   ```
   "Use drydock-runtime to [your task]"
   ```

### Agent Status Check
To see what agents you have:
```
"Use drydock-selector to list available agents"
```

---

## Examples

### Example 1: Code Security Review
```
User: "Use drydock-runtime to review this authentication function for vulnerabilities"

Runtime Execution:
1. Loads: output/developer/developer_core.developer
2. Capability: code_review
3. Decision Logic: "if_auth_code" → prioritize_security_analysis
4. Workflow: Sequential with security quality gates
5. Tools: Read (code), Grep (patterns), Bash (if needed)
6. Output: Comprehensive security review with findings

Result: Detailed security assessment with:
- Vulnerability analysis (SQL injection, auth bypass, etc.)
- Input validation check
- Session management review
- Specific recommendations
```

### Example 2: Project Planning
```
User: "Use drydock-runtime to create a project plan for implementing SSO"

Runtime Execution:
1. Loads: output/project_manager/project_manager_core.projectmanager
2. Capability: project_planning
3. Workflow: Coordinator with task decomposition
4. Tools: Write (plan document), Read (context)
5. Quality Gates: Completeness, realistic estimates, clear dependencies
6. Output: Complete project plan

Result: Detailed plan with:
- Timeline and milestones
- Task breakdown with dependencies
- Resource allocation
- Risk assessment
- Success metrics
```

### Example 3: API Documentation
```
User: "Use drydock-runtime to generate API docs for the user service"

Runtime Execution:
1. Loads: output/technical_writer/technical_writer_core.technicalwriter
2. Capability: api_documentation
3. Workflow: Sequential with clarity and completeness gates
4. Tools: Read (analyze code), Write (generate docs)
5. Quality Gates: Clear descriptions, complete examples, proper formatting
6. Output: Complete API documentation

Result: Professional docs with:
- Endpoint descriptions
- Request/response schemas
- Authentication details
- Code examples
- Error handling
```

---

## Integration with DryDock

### Preservation of Existing System
The runtime is **100% additive** - no changes to existing DryDock:

- All 20 templates unchanged
- Core builder logic unchanged
- Interactive Q&A workflow unchanged
- Validation engine unchanged
- File generation unchanged

**New Addition:**
- `library/tool_mappings.library` - Maps permissions to tools (reference only)
- `.claude/agents/` - Runtime subagents (optional feature)

### Coexistence
Both modes work with the same agent configurations:

**Same Agent, Two Modes:**
- Interactive: Activate `.activationkey` → Menu-driven Q&A
- Autonomous: Invoke runtime → Autonomous execution

**Choice Based on Task:**
- Exploratory, learning → Interactive mode
- Well-defined, batch → Autonomous mode

---

## Technical Details

### Permission-to-Tool Mapping
DryDock agents define abstract permissions. Runtime maps them to Claude Code tools:

| Permission | Tools | Usage |
|------------|-------|-------|
| `read_code` | Read, Grep, Glob | Code analysis |
| `write_code` | Write, Edit | Code generation |
| `execute_tests` | Bash | Test execution |
| `generate_docs` | Write, Read | Documentation |
| `search_web` | WebSearch, WebFetch | Research |
| `analyze_security` | Read, Grep, Bash | Security analysis |

*See `library/tool_mappings.library` for complete mappings*

### Workflow Execution
Runtime handles all DryDock workflow patterns:

1. **Sequential** - Steps in order
2. **Parallel** - Concurrent execution
3. **Iterative** - Refinement loops
4. **Conditional** - Branch-based routing
5. **Pipeline** - Multi-stage with gates
6. **Coordinator** - Sub-workflow orchestration
7. **Feedback Loop** - Continuous improvement
8. **Event-Driven** - Condition-based response

### Quality Gate Enforcement
Runtime applies quality gates from agent configs:

**Security Gates:**
- No SQL injection
- Proper authentication
- Input validation

**Performance Gates:**
- No N+1 queries
- Efficient algorithms
- Optimized resources

**Maintainability Gates:**
- Clear naming
- Adequate documentation
- Modular design

---

## Troubleshooting

### Agent Not Found
```
WARNING: The [Agent Name] agent hasn't been built yet.

Solution:
1. Activate DryDock: provide drydock.activationkey
2. Select the appropriate template
3. Generate the agent
4. Retry your task
```

### Unexpected Behavior
- Check agent config is valid (well-formed JSON)
- Ensure all required tools are available
- Verify agent has the needed capability
- Review runtime execution logs

### Performance
- Runtime caches loaded configs per session
- Reuses agent config for multiple tasks
- Reloads only when different agent needed

---

## Future Enhancements

**Planned Features:**
- Multi-agent orchestration (coordinate multiple DryDock agents)
- Learning system (improve based on execution history)
- Visual workflow builder (GUI for agent workflows)
- Performance analytics (track agent execution metrics)
- Community marketplace (share runtime-compatible agents)

---

## Contributing

To extend the runtime system:

1. **Add new tool mappings:**
   - Edit `library/tool_mappings.library`
   - Add permission → tool mappings
   - Document usage patterns

2. **Enhance runtime logic:**
   - Modify `.claude/agents/drydock-runtime.md`
   - Add new workflow patterns
   - Improve decision logic

3. **Create helper subagents:**
   - Add specialized helpers to `.claude/agents/`
   - Follow same YAML frontmatter format
   - Document purpose and usage

---

## License

DryDock Runtime is part of the DryDock project.

**GPL-3.0 Licensed** - Free to use, modify, and distribute with attribution.

Copyright 2025 Savannah Goring

---

## Quick Reference

**List available agents:**
```
"Use drydock-selector to show available agents"
```

**Get agent recommendation:**
```
"Use drydock-selector to recommend an agent for [task]"
```

**Execute task autonomously:**
```
"Use drydock-runtime to [your task]"
```

**Interactive mode:**
```
Provide: output/[agent]/[agent].activationkey
```
