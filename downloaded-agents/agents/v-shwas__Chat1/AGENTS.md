# Claude Code Agents

This project includes six specialized subagents located in `.claude/agents/`. Each agent is invoked via the Agent tool or by Claude Code automatically when the task matches the agent's description.

---

## Available Agents

| Agent | Model | Purpose |
|---|---|---|
| `test-writer` | Sonnet | Write unit, integration, and e2e tests |
| `code-reviewer` | Sonnet | Review code for bugs, security, and quality |
| `doc-generator` | Haiku | Generate docs, READMEs, and inline comments |
| `architecture-reviewer` | Sonnet | Review system design and module structure |
| `compliance-reviewer` | Sonnet | Audit for security standards and privacy regulations |
| `agent-watcher` | Opus | Oversee, coordinate, and synthesize other agent outputs |

---

## How to Use

### Invoking an agent in a prompt

Ask Claude Code to use a specific agent by name:

```
Use the test-writer agent to write tests for src/controllers/authController.js
```

```
Run the code-reviewer agent on the latest changes in src/routes/
```

```
Have the compliance-reviewer audit src/middleware/ for GDPR issues
```

### Automatic invocation

Claude Code will automatically select the right agent when the task description matches. For example, asking "write tests for this file" may automatically route to `test-writer`.

### Chaining agents (via agent-watcher)

The `agent-watcher` agent is designed to orchestrate multi-agent workflows:

```
Use agent-watcher to coordinate a full review: run code-reviewer and 
compliance-reviewer on src/auth/, then synthesize their findings.
```

---

## Agent Details

### test-writer
- **Model**: claude-sonnet-4-6
- **When to use**: Adding test coverage, writing tests for new features, generating test suites for existing untested code
- **Input**: A file path, function, or module to test
- **Output**: A complete, runnable test file

### code-reviewer
- **Model**: claude-sonnet-4-6
- **When to use**: Pre-merge reviews, auditing a PR diff, checking a new file before committing
- **Input**: A file, diff, or set of files to review
- **Output**: Structured review with Critical / Important / Minor findings

### doc-generator
- **Model**: claude-haiku-4-5-20251001
- **When to use**: Generating README files, adding JSDoc/TSDoc comments, creating API reference docs
- **Input**: A file, module, or API surface to document
- **Output**: Ready-to-use documentation in the project's existing format

### architecture-reviewer
- **Model**: claude-sonnet-4-6
- **When to use**: Evaluating a new system design, reviewing module boundaries, assessing a significant refactor
- **Input**: A description of the system, or a set of files representing an architectural layer
- **Output**: Structured assessment with strengths, concerns (High/Medium/Low), and recommendations

### compliance-reviewer
- **Model**: claude-sonnet-4-6
- **When to use**: Security audits, GDPR/privacy reviews, checking for OWASP vulnerabilities, license scanning
- **Input**: Files, configs, or directories to audit
- **Output**: Findings grouped by compliance area with severity, location, regulation, and remediation

### agent-watcher
- **Model**: claude-opus-4-6
- **When to use**: Multi-agent workflows, quality-gating other agents' outputs, synthesizing findings from several reviews
- **Input**: Outputs from one or more other agents, or a complex task requiring coordination
- **Output**: Cross-agent assessment with conflicts, gaps, and a final verdict on whether work is ready to act on

---

## File Structure

```
.claude/
└── agents/
    ├── AGENTS.md               ← this file
    ├── test-writer.md
    ├── code-reviewer.md
    ├── doc-generator.md
    ├── architecture-reviewer.md
    ├── compliance-reviewer.md
    └── agent-watcher.md
```
