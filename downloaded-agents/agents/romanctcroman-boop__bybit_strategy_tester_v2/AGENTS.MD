# 🤖 Global Agent Rules - Bybit Strategy Tester v2

> **CRITICAL**: These rules apply to ALL agent interactions in this workspace.
> Read this file at the start of every conversation.

---

## Claude Code — Agent Routing

> This section is for **Claude Code CLI** (`.claude/agents/`). Copilot/Gemini: skip to next section.

### Which agent to use

| Task | Agent | Notes |
|------|-------|-------|
| Implement feature / fix bug / refactor | `implementer` | `isolation: worktree`, auto-runs reviewer after |
| Investigate engine/adapter/parity issue | `backtesting-expert` | Read-only, cite file:line |
| Debug optimizer / Optuna / scoring | `optimizer-expert` | Read-only, cite file:line |
| Debug LangGraph / agent memory / consensus | `agent-system-expert` | Read-only, cite file:line |
| Code review before merge | `reviewer` | Runs in background |
| Write/fix tests | `tdd` | Use after implementer |
| Project status / server / DB health | `bybit-strategy-navigator` | Quick health check |

### Agent handoff pattern

```
User task → implementer (implements + /review)
                       ↓ if tests needed
                       tdd
                       ↓ if engine investigation needed
                       backtesting-expert (read-only analysis)
                       ↓ implementer again if fix needed
```

### Critical invariants ALL agents must respect

- `commission_value = 0.0007` — NEVER change without explicit approval
- Engine = `FallbackEngineV4` — default for backtests (not V2/V3)
- `DATA_START_DATE` — import from `backend/config/database_policy.py`, never hardcode
- Bash is broken (Cygwin fork errors) — use Read/Grep/Glob/Edit/Write tools

---

## 🎛️ Multi-Model Support

### Model-Specific Configuration Files

| Model             | Config File             | Mode                         |
| ----------------- | ----------------------- | ---------------------------- |
| **Claude Opus 4** | `.agent/Claude.md`      | Planning (Extended Thinking) |
| **Gemini 3 Pro**  | `.agent/Gemini.md`      | Auto                         |
| **Any Model**     | `AGENTS.MD` (this file) | Universal                    |

### Optimizations by Model

- **Claude Opus 4**: Use Planning mode, extended thinking for complex tasks
- **Gemini 3 Pro**: Use Fast mode for quick tasks, Planning for complex
- **Both**: Maximum terminal autonomy, auto-documentation

### Priority Order

1. Model-specific file (`.agent/Claude.md` or `.agent/Gemini.md`)
2. Global rules (`AGENTS.MD`)
3. Project skills (`.github/skills/`)
4. Knowledge Items

---

## 🧠 Memory & Context Persistence

### Before Starting ANY Work:

1. **Read KI Summaries** - Check knowledge items before independent research
2. **Read .agent/docs/** - Understand current architecture and decisions
3. **Check CHANGELOG.md** - Know recent changes and context
4. **Reference DECISIONS.md** - Understand reasoning behind key choices

### After Completing Work:

1. **Update CHANGELOG.md** - Document what changed and why
2. **Update ARCHITECTURE.md** - If structural changes were made
3. **Update DECISIONS.md** - If important decisions were made
4. **Create/Update API.md** - If endpoints changed
5. **Update MODELS.md** - If data models changed

---

## 📝 Documentation Standards

### Code Documentation:

- Generate inline comments for complex logic (not obvious code)
- Use Google-style docstrings for all public functions
- Document edge cases and gotchas
- Reference related Knowledge Items in comments when applicable

### Markdown Documentation:

- Use clear headings and table of contents for long docs
- Include code examples where helpful
- Add timestamps to major updates
- Link related documents together

### Artifact Generation:

- Create implementation_plan artifacts for complex tasks
- Generate task artifacts for multi-step work
- Use walkthrough artifacts for explanations
- Save all generated images as artifacts

---

## 🔧 Workflow Standards

### For Simple Tasks (< 15 minutes):

1. Execute directly
2. Document in CHANGELOG.md
3. Report completion

### For Complex Tasks (> 15 minutes):

1. Create implementation_plan artifact
2. Break into subtasks
3. Execute each subtask
4. Document continuously
5. Generate comprehensive report

### For Research Tasks:

1. Check KIs first (MANDATORY!)
2. If not found, search codebase
3. Document findings in appropriate docs
4. Consider creating new KI if knowledge is reusable

---

## 🎯 Agent Skills Usage

### Always Check Skills First:

- Before implementing common patterns, check `.github/skills/`
- Use existing skills instead of reinventing
- Suggest new skills for reusable patterns

### Skill Locations:

- `.github/skills/` - Project-specific skills (7 skills)
- `.agent/workflows/` - Step-by-step procedures

---

## ⚙️ Technical Standards

### Code Quality:

- Follow existing code style (see pyproject.toml)
- Run ruff/black before committing
- Write tests for new functionality
- Maintain backward compatibility

### Error Handling:

- Never silently swallow errors
- Log with context (loguru format)
- Provide actionable error messages
- Document known issues in DECISIONS.md

### Performance:

- Profile before optimizing
- Document performance-critical paths
- Consider memory usage for large datasets
- Use appropriate data structures

---

## 🔒 Security Rules

### Never:

- Print or log secrets/API keys
- Commit credentials to git
- Execute untrusted code without review
- Expose internal endpoints

### Always:

- Use environment variables for secrets
- Validate user input
- Use parameterized queries
- Follow principle of least privilege

---

## 📊 Project-Specific Knowledge

### Key Architecture Components:

- `backend/` - FastAPI application
- `frontend/` - Static HTML/JS/CSS (no build step)
  - `frontend/js/pages/strategy_builder.js` - thin orchestrator (~1.6k LOC,
    was 13.4k) that composes 25+ factory modules in
    `frontend/js/strategy_builder/`
  - **Pattern**: every module is a factory `createXxx({...deps})` or
    `bindXxx({...deps})` taking injected getters/setters/callbacks. Pure
    helpers are exported alongside the factory for unit tests
    (e.g. `dropPositionToLogical`, `commissionForMarketType`,
    `parseAlignDirection`).
- `backend/backtesting/` - Trading strategy backtesting
- `backend/core/metrics_calculator.py` - 166-metric suite
- `backend/services/adapters/bybit.py` - Bybit API integration

### Strategy Builder Module Topology (post-Phase 7)

`setupEventListeners()` is now pure factory orchestration. When wiring a new
event handler, prefer extracting it into a focused module under
`frontend/js/strategy_builder/` and add a thin `bindXxx({...})` invocation
in `setupEventListeners()`. Examples:

- `BlockLibraryEvents.js` — sidebar drag/click delegation
- `PropertiesPanelEvents.js` — block param change/input dispatch
- `CanvasBlocksEvents.js` — selection / drag / menu / marquee
- `PropertiesHeaderSync.js` — name + symbol + TF + market type
- `DirectionFilter.js` — direction change → drop hidden-port connections
- `LeverageControls.js` — leverage range + position size + capital + wheel
- `ValidationPanelControl.js` — validation panel auto-close + hover
- `MainActionButtons.js` — Validate / Generate Code / Save / Backtest
- `FloatingWindowResponder.js` — slide blocks when side panel toggles
- `FundingRateAutoFetch.js` — Bybit funding-rate annualised average
- `VersionsModalControl.js` — versions modal open/close + backdrop
- `ToolbarBindings.js` — undo/redo/align/auto-layout (legacy + by-id)
- `MiscCanvasListeners.js` — drop zone, data-status retry, block search

Each module has a 1:1 unit-test file in `frontend/tests/components/`.

### TradingView Parity:

- Commission MUST be 0.07% for parity
- Use FallbackEngineV4 as gold standard
- Check calibration script for metric verification

### Database:

- SQLite with SQLAlchemy
- Market data partitioned by symbol
- Use repository pattern for queries

---

## 🚀 Autonomy Guidelines

### Auto-Execute (Safe Commands):

**File Operations:**

- `ls`, `dir`, `cat`, `type`, `head`, `tail`, `find`, `grep`
- `mkdir`, `touch` (creating directories/files)
- `mv`, `cp` (moving/copying files within workspace)
- Reading any file in workspace

**Git Operations (Read & Local):**

- `git status`, `git log`, `git diff`, `git branch`, `git show`
- `git add` (staging changes)
- `git commit` (with descriptive messages)
- `git checkout -b` (creating new branches)
- `git merge` (local merges, not to main/master)
- `git pull`, `git fetch`

**Development Commands:**

- Python 3.11+ required (3.14 recommended). `py -3.14 <script>` for any Python scripts
- `python -m pytest` (all test commands)
- `npm run dev`, `npm run build`, `npm run test`
- `ruff check .`, `ruff format .`
- `mypy .`, `black .`, `isort .`
- `docker-compose up`, `docker-compose down`, `docker-compose logs`
- `docker build`, `docker run` (non-destructive)

**Code Quality:**

- Running linters and formatters
- Fixing linting errors automatically
- Organizing imports
- Formatting code

**Testing & Analysis:**

- Running all tests
- Generating test coverage reports
- Profiling code (`cProfile`, `memory_profiler`)
- Performance benchmarking

**Documentation:**

- Updating CHANGELOG.md
- Adding/updating docstrings
- Creating/updating markdown documentation
- Generating code comments

**Refactoring (Safe):**

- Renaming variables/functions (non-public)
- Extracting methods/classes
- Removing dead code
- Simplifying conditionals
- Fixing typos and formatting
- Applying DRY principle

**Bug Fixes (Low Risk):**

- Fixing syntax errors
- Correcting type hints
- Fixing import errors
- Resolving linter warnings
- Fixing obvious bugs (with tests)

### Ask Before (Moderate Risk):

- `git push` (especially to main/master)
- `git reset --hard`, `git rebase`
- `rm`, `del`, `rmdir` (deleting files/directories)
- Database migrations (schema changes)
- Installing new dependencies (`pip install`, `npm install`)
- Modifying `.gitignore` or CI/CD configs
- Production deployments
- Changing environment variables
- Modifying security-critical code

### Never Auto-Execute:

- `curl`/`wget` to external URLs (without explicit permission)
- Installing global packages
- Modifying system files
- Commands with sudo/admin privileges
- `DROP TABLE`, `TRUNCATE`, destructive database operations
- Formatting disks or system-level operations
- Registry modifications (Windows)
- Network configuration changes

---

## 📋 Self-Check Before Completing

Before saying "task complete":

| Check          | Question                           |
| -------------- | ---------------------------------- |
| ✅ Goal met?   | Did I do exactly what was asked?   |
| ✅ Documented? | Updated all relevant docs?         |
| ✅ Tested?     | Verified the change works?         |
| ✅ Clean?      | No lint errors or warnings?        |
| ✅ Context?    | Left enough info for next session? |
| ✅ Improved?   | Did I improve code quality?        |
| ✅ Secure?     | No security issues introduced?     |

## 🎯 Enhanced Autonomy

### Proactive Actions You Should Take

- **Fix linting errors automatically** - Run `ruff check --fix .` and fix issues
- **Run tests after changes** - Ensure nothing broke
- **Update documentation** - CHANGELOG.md, docstrings, comments
- **Improve code quality** - Refactor when you see opportunities
- **Fix obvious bugs** - If you spot issues, fix them
- **Add missing tests** - For new functionality
- **Optimize performance** - When bottlenecks are obvious
- **Enhance security** - Fix low-risk security issues

### Autonomous Refactoring

You are ENCOURAGED to:

- Extract repeated code
- Rename for clarity (non-public)
- Remove dead code
- Simplify complex logic
- Break down large functions
- Apply DRY principle
- Improve variable names

### Error Recovery

When errors occur:

1. Read error message carefully
2. Check known issues (DECISIONS.md, CHANGELOG.md)
3. Try obvious fixes (max 3 attempts)
4. If still failing, report with suggestions

---

## 🤖 VS Code Agent Mode Configuration

### Required VS Code Settings

Add to your `settings.json` (Ctrl+,):

```json
{
    // Core Agent Mode
    "github.copilot.chat.agent.enabled": true,

    // Maximum Autonomy Settings
    "chat.agent.maxRequests": 25, // Increase iteration limit (default: 5/15)
    "chat.agent.runTasks": true, // Auto-run workspace tasks

    // Tool Approval (CAUTION with autoApprove)
    "chat.tools.autoApprove": false, // Keep false for safety in this project

    // MCP Integration (already configured)
    "github.copilot.chat.experimental.mcpServers": true
}
```

### Agent Mode Capabilities

In Agent Mode, Copilot can:

| Capability                 | Status     | Notes                              |
| -------------------------- | ---------- | ---------------------------------- |
| Iterative error correction | ✅ Enabled | Self-fixes code generation errors  |
| Terminal command execution | ✅ Enabled | Proposes and runs commands         |
| Runtime error analysis     | ✅ Enabled | Self-healing with diagnostics      |
| Auto file detection        | ✅ Enabled | Finds relevant files automatically |
| Multi-file editing         | ✅ Enabled | Works across project               |
| MCP tool access            | ✅ Enabled | 6 tools registered                 |

### MCP Integration

This project has MCP configured at `mcp-server/`:

```
mcp-server/
├── orchestrator/          # Agent orchestration
├── tools/                 # MCP tools (6 registered)
└── config.json           # MCP configuration
```

**Available MCP Tools:**

- Database queries
- Bybit API access
- Backtest execution
- Strategy analysis
- Market data fetching
- Metric calculation

### Recommended Workflow for Maximum Autonomy

1. **Open Copilot Edits panel** (Ctrl+Shift+I)
2. **Select "Agent" mode** from dropdown
3. **Use clear prompts:**

    ```text
    ✅ "Fix all linting errors in backend/api/"
    ✅ "Run backtest for RSI strategy and analyze results"
    ✅ "Update commission rate and verify all usages"

    ❌ "Make it better" (too vague)
    ```

### Safety Boundaries for This Project

**Agent CAN autonomously:**

- Run pytest, ruff, format code
- Edit Python/JS/HTML files
- Start/stop uvicorn server
- Query Bybit API (read-only)
- Run backtests
- Update documentation

**Agent MUST ask before:**

- Changing `commission_rate` (TradingView parity)
- Database migrations
- `git push` to any branch
- Installing new dependencies
- Modifying `.env` or secrets

### Quick Enable Script

Run in PowerShell to configure VS Code:

```powershell
# Enable Agent Mode settings
$settings = @"
{
  "github.copilot.chat.agent.enabled": true,
  "chat.agent.maxRequests": 25,
  "chat.agent.runTasks": true
}
"@
Write-Host "Add these to your VS Code settings.json:"
Write-Host $settings
```

---

_Last Updated: 2026-02-04_
_Version: 1.1_
