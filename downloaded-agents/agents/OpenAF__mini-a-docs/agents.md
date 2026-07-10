---
layout: page
title: Agent Files
permalink: /agents/
---

Agent files let you package an entire mini-a configuration — model, capabilities, tools, rules, knowledge, and persona — into a single **portable markdown file**. Instead of passing dozens of flags on every run, you write a `.agent.md` file once and reuse it across sessions, projects, and teammates.

---

## Quick Start

```bash
# Run with an agent file
mini-a agent=my-agent.agent.md goal="your goal here"

# Goal can also live inside the file (see Body as Goal below)
mini-a agent=my-agent.agent.md

# Print a fully-annotated starter template
mini-a --agent

# Inline agent — no file required
mini-a agent="---\nname: quick\ncapabilities:\n  - useutils\n---" goal="summarize"
```

`agentfile=` is a backward-compatible alias for `agent=`.

---

## File Structure

An agent file is a Markdown document with a **YAML frontmatter block** at the top. The frontmatter defines how mini-a is configured; everything after the closing `---` becomes the **default goal** when no `goal=` flag is passed on the command line.

```
┌─ YAML frontmatter ──────────────────────────────────────────────────────┐
│ ---                                                                      │
│ name: my-agent                                                           │
│ description: What this agent does                                       │
│ model: "(type: anthropic, model: claude-sonnet-4-20250514, key: '...')" │
│ capabilities:                                                            │
│   - useutils                                                             │
│   - usetools                                                             │
│ constraints:                                                             │
│   - Always cite sources.                                                 │
│ youare: |                                                                │
│   You are a research assistant specializing in software engineering.    │
│ ---                                                                      │
└──────────────────────────────────────────────────────────────────────────┘
┌─ Body (default goal) ───────────────────────────────────────────────────┐
│                                                                          │
│ Summarize the git log for the past week and highlight breaking changes. │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Frontmatter Reference

### `name` and `description`

Metadata only — used for display, logging, and your own reference. Neither affects runtime behavior.

```yaml
name: changelog-gen
description: Generates structured changelogs from git history
```

---

### `model`

Overrides the `OAF_MODEL` environment variable for this agent. Accepts the same SLON/JSON string format as the CLI `model=` flag. Leave unset to inherit from the environment.

```yaml
model: "(type: openai, model: gpt-4o, key: 'sk-...')"
```

```yaml
model: "(type: anthropic, model: claude-opus-4-20250514, key: 'sk-...')"
```

```yaml
model: "(type: ollama, model: llama3)"
```

See [Getting Started]({{ '/getting-started' | relative_url }}) for all supported provider types.

---

### `capabilities`

Enables built-in capability bundles. Values can be a YAML list or a single string.

| Capability | Effect |
|------------|--------|
| `useutils` | File operations, math, time, and user-input tools (`mini-a-utils.js`) |
| `usetools` | Activates MCP tool registration (required for the `tools` section) |
| `usetoolslc` | Registers MCP tools only on the low-cost model tier |
| `useshell` | Allows the agent to execute POSIX shell commands — **disabled by default for security** |
| `readwrite` | Grants file read/write access when `useshell=true` |

```yaml
capabilities:
  - useutils
  - usetools
  # - usetoolslc  # uncomment to register MCP tools only on the LC model
  # - useshell    # uncomment to allow shell execution
  # - readwrite   # uncomment to allow file read/write via shell
```

Capabilities set in the agent file only apply when the corresponding CLI flag has not already been set. CLI flags always take precedence.

---

### `tools`

A list of MCP server connections to expose to the agent. Entries are merged into the `mcp=` parameter. Setting any `tools` entry automatically enables `usetools` unless it is already set.

#### Connection Types

**`ojob`** — built-in MCP server launched as a local OpenAF oJob process:

```yaml
tools:
  - type: ojob
    options:
      job: mcps/mcp-time.yaml
```

See `mcps/README.md` inside the mini-a installation for the full built-in catalog (filesystem, time, HTTP, databases, Kubernetes, and more).

**`stdio`** — any MCP-compatible process launched via standard I/O:

```yaml
tools:
  - type: stdio
    cmd: npx -y @modelcontextprotocol/server-filesystem /tmp
```

Relative `cmd` paths are resolved from the directory containing the agent file, so the file is fully portable.

**`remote`** — Streamable HTTP MCP server:

```yaml
tools:
  - type: remote
    url: http://localhost:9090/mcp
```

**`sse`** — Server-Sent Events MCP server:

```yaml
tools:
  - type: sse
    url: http://localhost:9090/mcp
```

Multiple entries of any mix of types are allowed:

```yaml
tools:
  - type: ojob
    options:
      job: mcps/mcp-time.yaml
  - type: ojob
    options:
      job: mcps/mcp-db.yaml
      jdbc: "jdbc:postgresql://localhost/mydb"
  - type: stdio
    cmd: npx -y @modelcontextprotocol/server-github
  - type: remote
    url: http://worker-1:9090/mcp
```

---

### `rules`

Behavioral rules for the agent's system prompt. Used only when no `rules=` flag is provided on the command line.

```yaml
rules: |
  Always validate inputs before processing.
  Never expose API keys in output.
```

---

### `constraints`

Like `rules`, but always **appended** to whatever rules are already active — from the CLI or from `rules`. Useful for adding guardrails on top of a base configuration.

```yaml
constraints:
  - Prefer tool-grounded answers over assumptions.
  - Be explicit when information is missing or uncertain.
  - Never output internal reasoning or tool call details.
```

Each entry becomes a bullet point appended to the agent's rules section.

---

### `knowledge`

Static context injected into the system prompt. Accepts a literal string, a multiline YAML block, or a filename prefixed with `@` to load from a file.

```yaml
knowledge: |
  This project uses PostgreSQL 15, deployed on AWS RDS.
  All migrations are managed with Flyway.
  The schema lives in db/migrations/.
```

Load from a file (path resolved relative to the agent file):

```yaml
knowledge: "@docs/project-context.md"
```

`youare` can also load from a file:

```yaml
youare: "@docs/persona.md"
```

---

### `youare`

Replaces the default opening sentence in the agent's system prompt. Use this to define a specialized persona or role.

```yaml
youare: |
  You are a senior DevOps engineer specializing in Kubernetes and CI/CD pipelines.
  You prioritize reliability and always verify changes before applying them.
```

---

### `mini-a:`

A key–value map where **any** mini-a CLI parameter can be set. These values override mode defaults but are themselves overridden by explicit CLI flags.

```yaml
mini-a:
  useplanning: true
  usestream: true
  maxsteps: 30
  format: json
  outfile: result.json
```

Common `mini-a:` overrides:

| Key | Example | Description |
|-----|---------|-------------|
| `useplanning` | `true` | Enable task planning |
| `usestream` | `true` | Stream tokens as they arrive |
| `maxsteps` | `30` | Hard limit on agent steps |
| `maxcycles` | `5` | Hard limit on total cycles |
| `format` | `json` | Output format: `md`, `json`, `yaml`, `slon`, or `toon` |
| `outfile` | `result.json` | Write final answer to a file |
| `valgoal` | `"Must be valid JSON"` | Post-run assertion |
| `lcbudget` | `100000` | Token budget for the low-cost model |
| `maxcontext` | `60000` | Trim context at this token count |
| `usehistory` | `true` | Persist conversation history |
| `usememory` | `true` | Enable structured working memory |
| `deepresearch` | `true` | Iterative research-validate loop |
| `usedelegation` | `true` | Enable parallel sub-agent delegation |

The `agent` and `agentfile` keys are ignored inside `mini-a:` (they cannot self-reference).

---

## Body as Goal

Any content after the closing `---` of the frontmatter becomes the **default goal**. When you run the agent without `goal=`, mini-a uses this body text as the goal.

```markdown
---
name: changelog-gen
capabilities:
  - useshell
  - readwrite
---

Generate a structured changelog from the git log since the last tag.
Include sections for breaking changes, new features, and bug fixes.
```

Running:
```bash
mini-a agent=changelog-gen.agent.md
```

is equivalent to:
```bash
mini-a agent=changelog-gen.agent.md goal="Generate a structured changelog..."
```

A `goal=` argument on the command line always takes precedence over the body.

If `agent=` is a bare filename (for example `agent=reviewer.md`), mini-a also resolves it from `~/.openaf-mini-a/agents/`.

---

## Relative File References

Paths in the following fields are resolved **relative to the directory containing the agent file** — not the current working directory:

- `knowledge: "@relative/path.md"` — file to load as knowledge
- `youare: "@relative/persona.md"` — file to load as persona
- `mini-a:` string values that point to existing files
- `tools[].cmd` paths in `type: stdio` entries

This makes agent files fully self-contained and portable: place them alongside their companion files and they work regardless of where you invoke them from.

---

## Precedence

When the same parameter is set in multiple places, the order of precedence is:

```
CLI flags  >  agent file (mini-a: overrides)  >  mode defaults
```

For example, if the agent file sets `useplanning: true` under `mini-a:`, passing `useplanning=false` on the command line overrides it. Capabilities (`useshell`, `readwrite`, `useutils`, `usetools`, `usetoolslc`) and `model` follow the same rule: the CLI value wins.

---

## Naming Convention

By convention, agent files use the `.agent.md` extension, which signals to editors and tooling that the file is a mini-a profile rather than a plain document. Any extension works — the file is identified by content, not name.

```
my-project/
├── agents/
│   ├── changelog.agent.md
│   ├── reviewer.agent.md
│   └── summarizer.agent.md
└── docs/
    └── context.md
```

---

## Complete Example

```markdown
---
name: code-reviewer
description: Reviews pull requests and flags issues by severity
model: "(type: anthropic, model: claude-opus-4-20250514, key: 'sk-...')"
capabilities:
  - useutils
  - usetools
  - useshell
tools:
  - type: ojob
    options:
      job: mcps/mcp-time.yaml
  - type: stdio
    cmd: npx -y @modelcontextprotocol/server-github
constraints:
  - Always cite file and line numbers when flagging issues.
  - Categorize findings as: critical, warning, or suggestion.
  - Do not suggest stylistic changes unless explicitly asked.
knowledge: "@docs/coding-standards.md"
youare: |
  You are a senior software engineer performing a thorough code review.
  You prioritize correctness and security over style.
mini-a:
  useplanning: true
  usestream: true
  maxsteps: 25
  format: json
  outfile: review.json
---

Review the staged changes in the current git repository.
```

Run it:
```bash
mini-a agent=agents/code-reviewer.agent.md
```

Or override the goal:
```bash
mini-a agent=agents/code-reviewer.agent.md goal="Review only the files in src/auth/"
```

---

## Generating a Starter Template

Run:
```bash
mini-a --agent
```

This prints a fully-annotated template with every section commented and documented. Redirect to a file to create your starting point:

```bash
mini-a --agent > my-agent.agent.md
```

---

## oJob-Based Agents

For agents that need multi-step orchestration, post-processing, parallelism, or integration with the broader [OpenAF](https://openaf.io) / [oJob](https://docs.openaf.io/guides/ojob/) ecosystem, you can write the agent as an **oJob YAML file** instead of a Markdown profile.

An oJob agent includes `mini-a.yaml` and delegates execution to the built-in `MiniAgent` job. This gives you the full oJob feature set alongside mini-a's LLM capabilities.

### When to use an oJob agent instead of `.agent.md`

| Need | `.agent.md` | oJob YAML |
|------|-------------|-----------|
| Reusable agent persona/config | Yes | Yes |
| Single-goal execution | Yes | Yes |
| Multi-step pipelines (sequential/parallel jobs) | No | Yes |
| Post-processing output (convert md → html, xlsx, etc.) | No | Yes |
| Input validation with typed parameters | No | Yes |
| Conditional logic and branching | No | Yes |
| Embedding charts, diagrams, spreadsheets | No | Yes |
| oPack dependencies (Mermaid, plugin-XLS, etc.) | No | Yes |
| Reuse via `jobsInclude` across projects | No | Yes |

### Minimal oJob agent

```yaml
ojob:
  logToConsole: true
  opacks:
  - mini-a

jobsInclude:
- mini-a.yaml

todo:
- My Agent

jobs:
- name : My Agent
  args:
    useutils: true
    usetools: true
    format  : md
    outfile : result.md
    youare  : |
      You are a specialized agent for <domain>.
    goal    : |
      Summarize the current directory contents.
  to:
  - MiniAgent
```

Run it:
```bash
ojob my-agent.yaml
```

Or pass arguments at the command line (all mini-a parameters are accepted):
```bash
ojob my-agent.yaml outfile=custom.md
```

### Using `((templateArgs))` for dynamic goals

The `((templateArgs)): true` flag enables [Handlebars](https://handlebarsjs.com/) placeholder substitution inside `args` strings. This lets the oJob accept runtime inputs and inject them into the goal, knowledge, and output path — similar to how `.agent.md` body text can reference `goal=`.

```yaml
jobs:
- name : Analyze File
  check:
    in:
      input  : toString.default("")
      outfile: toString.default("result.md")
  ((templateArgs)): true

  args:
    useutils: true
    format  : md
    outfile : "{{outfile}}"
    knowledge: |
      Target file: {{input}}
    goal    : |
      Analyze {{input}} and produce a structured summary.
  to:
  - MiniAgent
```

```bash
ojob analyze.yaml input=src/main.js outfile=analysis.md
```

### Multi-step pipeline example

oJob agents can chain jobs so that one step produces output that the next step consumes. In the example below, mini-a generates a Markdown report and a second job converts it to HTML using `oafp`:

```yaml
ojob:
  logToConsole: true
  opacks:
  - mini-a
  - Mermaid          # required for chart/diagram rendering
  flags:
    MD_DARKMODE: auto
    MD_CHART   : true

jobsInclude:
- mini-a.yaml

todo:
- Build report
- Build report HTML

jobs:
# --- Step 1: generate the report with mini-a ---
- name : Build report
  args:
    useshell       : true
    shellbatch     : true
    shellallowpipes: true
    usediagrams    : true
    usecharts      : true
    readwrite      : true
    format         : md
    outfile        : report.md
    goal           : |
      Analyze the current directory and produce a report with:
      1. A table of all files (name, size in bytes, last modified).
      2. A pie chart (chartjs) of file sizes.
  to:
  - MiniAgent

# --- Step 2: convert to HTML ---
- name : Build report HTML
  to   :
  - (oafp):
      file    : report.md
      in      : md
      out     : html
      htmlopen: "false"
      outfile : report.html
```

```bash
ojob report.yaml
```

### Hardened template with planning and validation

For production agents that need deterministic, evidence-backed output, the `agent-template-v2.yaml` pattern adds explicit planning, tool constraints, structured state, deep research cycles, and output validation:

```yaml
ojob:
  logToConsole: true
  opacks:
  - mini-a

jobsInclude:
- mini-a.yaml

todo:
- Run hardened agent

jobs:
- name : Run hardened agent
  check:
    in:
      input  : toString.default("")
      outfile: toString.default("result.md")
  ((templateArgs)): true

  args:
    format             : md
    outfile            : "{{outfile}}"
    useutils           : true
    usetools           : true
    useshell           : false
    readwrite          : false
    utilsallow         : "filesystemQuery,markdownFiles"
    useplanning        : true
    forceplanning      : true
    planstyle          : simple
    deepresearch       : true
    maxcycles          : 2
    persistlearnings   : true
    validationthreshold: PASS
    state:
      mission    : "describe the objective"
      exclusions : [".git", "node_modules"]
      outputSchema:
        sections : ["Summary", "Findings", "Recommendations"]
    youare: |
      You are a precise, skeptical agent. Prefer tool-grounded evidence.
    knowledge: |
      Input: {{input}}
    goal: |
      Phase 1 — Inspect: read {{input}} and identify relevant files.
      Phase 2 — Collect evidence using available tools.
      Phase 3 — Produce output matching state.outputSchema.sections exactly.
    valgoal: |
      PASS only if all required sections are present and every claim is evidence-backed.
  to:
  - MiniAgent
```

### Key differences from `.agent.md`

- **`jobsInclude: [mini-a.yaml]`** pulls in the `MiniAgent` job definition.
- **`opacks: [mini-a]`** declares the dependency — oJob downloads it automatically if missing.
- All mini-a parameters are set under `args:` of the job that delegates `to: [MiniAgent]`.
- Additional oPacks (`Mermaid`, `plugin-XLS`, etc.) unlock chart rendering, spreadsheet export, and other output capabilities not available in `.agent.md` files.
- oJob orchestration features (parallel execution via `from`/`to` graphs, typed `check:` validation, `((templateArgs))` substitution, daemon mode, cron scheduling) are all available.

### Starter templates

The mini-a distribution ships two ready-to-copy templates:

| File | Purpose |
|------|---------|
| `examples/agent-template.yaml` | General-purpose starter — all options commented for easy customization |
| `examples/agent-template-v2.yaml` | Hardened starter — planning, tool constraints, validation, and structured state enabled by default |

Copy either file and customize the `goal`, `youare`, `knowledge`, and capability flags for your use case.
