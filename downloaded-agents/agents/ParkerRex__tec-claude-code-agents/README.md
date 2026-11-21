# Debug Workflow Agents

Automated end-to-end debugging system that takes you from incident report to merged PR with comprehensive documentation.

## Overview

The debug workflow consists of specialized agents that work together to:
1. **Analyze** the root cause of bugs
2. **Design** comprehensive solutions
3. **Implement** fixes with tests
4. **Automate** code quality checks, PR creation, and changelog updates

## Quick Start

```bash
/debug "Users getting logged out after 5 minutes" auth-token-expiry
```

This single command will:
- ✅ Conduct root cause analysis
- ✅ Design solution architecture
- ✅ Implement fixes with tests
- ✅ Run linting and formatting
- ✅ Create a branch and commit changes
- ✅ Push and create a PR with full documentation
- ✅ Update CHANGELOG.md
- ✅ Notify you when complete

## Agents

### Core Workflow Agents

#### 1. debug-rca-agent
**Purpose:** Root cause analysis specialist

**Input:**
- Problem report description
- Bug name (3-word hyphenated identifier)

**Output:**
- Comprehensive RCA document at `.agents/debugging/{bug_name}/{bug_name}-rca.md`
- Event sequence diagrams
- Multi-angle analysis (technical, operational, environmental, monitoring)
- Prevention recommendations

#### 2. debug-solution-agent
**Purpose:** Solution architecture designer

**Input:**
- Path to RCA document

**Output:**
- Detailed solution architecture at `.agents/debugging/{bug_name}/{bug_name}-solution.md`
- Technical design specifications
- Integration & deployment plan
- Monitoring & observability strategy
- Risk assessment

#### 3. debug-implement-agent
**Purpose:** Implementation engineer

**Input:**
- Path to solution document

**Output:**
- Implementation plan at `.agents/debugging/{bug_name}/{bug_name}-plan.md`
- Code changes across repository
- Tests and validation
- Implementation log with detailed notes

### Support Agents

#### 4. debug-orchestrator-agent
**Purpose:** Workflow coordinator

Manages the entire pipeline:
- Coordinates all agents
- Handles intervention points
- Executes post-processing hooks
- Manages state and error recovery

#### 5. pr-description-generator-agent
**Purpose:** PR documentation synthesizer

Generates comprehensive PR descriptions by combining:
- RCA findings
- Solution design
- Implementation details
- Testing results

#### 6. changelog-updater-agent
**Purpose:** CHANGELOG maintainer

Updates CHANGELOG.md following [Keep a Changelog](https://keepachangelog.com/) conventions:
- Adds entry to Unreleased section
- Includes root cause and impact
- Links to PR
- Maintains proper formatting

## Commands

### /debug
Main entry point for the workflow

```bash
/debug <problem-report> <bug-name> [--auto]
```

**Arguments:**
- `problem-report`: Description of the bug/incident
- `bug-name`: 3-word hyphenated identifier (e.g., `auth-token-expiry`)
- `--auto`: (Optional) Run in fully automated mode without intervention points

**Examples:**
```bash
# With intervention points (default)
/debug "API returns 500 during high load" api-rate-limit-exceeded

# Fully automated
/debug "Payment fails intermittently" payment-race-condition --auto
```

### Legacy Commands (Still Available)

```bash
/debug-rca <problem-report> <bug-name>
/debug-solution <rca-file-path>
/debug-implement <solution-file-path>
```

These can still be used individually if you want manual control over each phase.

## Workflow

### Default Flow (With Intervention Points)

```
1. Run /debug command
2. 🔍 RCA Agent runs → Creates RCA document
   ⏸️  PAUSE - Review RCA (press Enter to continue)
3. 📐 Solution Agent runs → Creates solution document
   ⏸️  PAUSE - Review solution (press Enter to continue)
4. 🔧 Implementation Agent runs → Implements fixes
   ⏸️  PAUSE - Review changes (press Enter to continue)
5. 🔄 Post-processing hooks:
   - biome lint/format
   - run tests
   - create branch & commit
   - push to remote
   - create PR with generated description
   - update CHANGELOG.md
6. ✅ Done! PR link provided
```

### Auto Mode Flow

```
1. Run /debug command with --auto flag
2. 🔍 RCA Agent runs → Creates RCA document
3. 📐 Solution Agent runs → Creates solution document
4. 🔧 Implementation Agent runs → Implements fixes
5. 🔄 Post-processing hooks (same as above)
6. ✅ Done! PR link provided
```

## Configuration

Configuration file: `claude/agents/debug-workflow-config.json`

```json
{
  "autoMode": false,
  "interventionPoints": {
    "afterRca": true,
    "afterSolution": true,
    "afterImplementation": true
  },
  "hooks": {
    "postImplement": ["biome check --apply", "biome format --write"],
    "postBiome": ["bun test"],
    "postTests": [],
    "postPr": [],
    "postChangelog": []
  },
  "branchNaming": "fix/{bug_name}",
  "commitMessageTemplate": "fix: {summary}\n\nRoot cause: {root_cause}\nFixes issue in {components}\n\nRelated: .agents/debugging/{bug_name}/",
  "changelogFormat": "keep-a-changelog",
  "changelogUnreleased": true
}
```

### Configuration Options

#### autoMode
- `false` (default): Pause at intervention points
- `true`: Run completely automated

#### interventionPoints
Control where to pause for human review:
- `afterRca`: Pause after root cause analysis
- `afterSolution`: Pause after solution design
- `afterImplementation`: Pause after implementation

#### hooks
Commands to run at various stages:
- `postImplement`: After code changes (e.g., linting/formatting)
- `postBiome`: After linting (e.g., tests)
- `postTests`: After tests pass
- `postPr`: After PR creation
- `postChangelog`: After changelog update

#### branchNaming
Template for branch names. Use `{bug_name}` as placeholder.

Examples:
- `"fix/{bug_name}"` → `fix/auth-token-expiry`
- `"bugfix/{bug_name}"` → `bugfix/auth-token-expiry`

#### commitMessageTemplate
Template for commit messages. Available placeholders:
- `{summary}`: One-line bug summary
- `{root_cause}`: Brief root cause description
- `{components}`: Affected components
- `{bug_name}`: Bug identifier

## File Structure

After running a debug workflow for `auth-token-expiry`, you'll have:

```
.agents/
  debugging/
    auth-token-expiry/
      auth-token-expiry-rca.md         # Root cause analysis
      auth-token-expiry-solution.md    # Solution architecture
      auth-token-expiry-plan.md        # Implementation plan
      auth-token-expiry-status.json    # Workflow state
```

## State Management

The orchestrator maintains state in `{bug_name}-status.json`:

```json
{
  "bugName": "auth-token-expiry",
  "status": "completed",
  "currentPhase": "postProcessing",
  "autoMode": false,
  "startedAt": "2025-09-30T10:00:00Z",
  "completedAt": "2025-09-30T11:00:00Z",
  "phases": {
    "rca": { "status": "completed", "filePath": "..." },
    "solution": { "status": "completed", "filePath": "..." },
    "implementation": { "status": "completed", "filePath": "..." },
    "postProcessing": { "status": "completed" }
  },
  "hooks": {
    "biome": { "status": "completed" },
    "tests": { "status": "completed" },
    "pr": { "status": "completed", "prNumber": 123, "prUrl": "..." },
    "changelog": { "status": "completed" }
  }
}
```

## Resumption

If the workflow is interrupted:

1. The status file tracks progress
2. Next time you run `/debug` with same bug name, you'll be asked:
   ```
   Found incomplete workflow for auth-token-expiry.
   Last completed phase: solution
   Resume from implementation? (y/n)
   ```
3. Choose to resume or start fresh

## Error Handling

If any phase fails:

```
❌ Phase failed: implementation

Error: Tests failed - 3 failing tests in auth.test.ts

Options:
  1. View error details
  2. Retry this phase
  3. Skip this phase
  4. Abort workflow
  5. Manual intervention

Choice:
```

## PR Description Format

Generated PR descriptions include:

- **Summary**: High-level overview
- **Root Cause Analysis**: Primary issue, impact, timeline
- **Solution Approach**: Technical design, key changes, benefits
- **Implementation Details**: Files changed, config updates
- **Testing**: Coverage, manual tests, validation
- **Deployment Notes**: Prerequisites, risks, rollback plan
- **Documentation**: Links to full RCA/solution/plan docs
- **Checklist**: Verification items

## CHANGELOG Format

Updates follow [Keep a Changelog](https://keepachangelog.com/):

```markdown
## [Unreleased]

### Fixed
- **auth-token-expiry**: Fixed authentication token expiration handling
  - Root cause: Token refresh logic was not triggered before expiration
  - Impact: Authentication middleware, user session management
  - PR: [#123](https://github.com/user/repo/pull/123)
```

## Best Practices

### Bug Names
Use 3-word hyphenated identifiers:
- ✅ `auth-token-expiry`
- ✅ `payment-race-condition`
- ✅ `db-connection-leak`
- ❌ `bug1`
- ❌ `authentication_issue`
- ❌ `fix-the-login-problem-with-tokens`

### Problem Reports
Be specific and include:
- What's happening
- When it happens
- Who/what is affected
- Any error messages or logs
- Relevant file paths if known

Example:
```bash
/debug "Users are getting automatically logged out after exactly 5 minutes
of inactivity. Error in logs: 'Token expired'. Affects all authenticated
routes. See auth.service.ts and token.middleware.ts" auth-token-expiry
```

### When to Use --auto

Use `--auto` when:
- ✅ You trust the workflow completely
- ✅ Bug is straightforward and well-defined
- ✅ You've used the system successfully before
- ✅ You want to run and check back later

Don't use `--auto` when:
- ❌ Bug is complex or ambiguous
- ❌ First time using the workflow
- ❌ High-risk changes
- ❌ You want to verify each phase

## Troubleshooting

### "Agent not found"
Ensure all agent files exist in `claude/agents/`:
- `debug-rca-agent.md`
- `debug-solution-agent.md`
- `debug-implement-agent.md`
- `debug-orchestrator-agent.md`
- `pr-description-generator-agent.md`
- `changelog-updater-agent.md`

### "Config not found"
Will create default config at `claude/agents/debug-workflow-config.json`

### "biome command not found"
Install biome: `pnpm add -D @biomejs/biome`

### "gh command not found"
Install GitHub CLI: `brew install gh`
Authenticate: `gh auth login`

### Tests failing in hook
Fix the tests, then resume workflow from implementation phase.

### PR creation fails
Check:
- `gh auth status` - Are you authenticated?
- `git remote -v` - Is remote configured?
- Branch permissions in GitHub settings

## Advanced Usage

### Custom Hooks

Add custom post-processing steps in config:

```json
{
  "hooks": {
    "postImplement": [
      "biome check --apply",
      "biome format --write",
      "eslint --fix ."
    ],
    "postBiome": [
      "bun test",
      "bun run type-check"
    ],
    "postTests": [
      "bun run build"
    ]
  }
}
```

### Skip Intervention Points Selectively

```json
{
  "interventionPoints": {
    "afterRca": false,        // Auto-continue after RCA
    "afterSolution": true,     // Pause after solution
    "afterImplementation": true // Pause after implementation
  }
}
```

### Custom Branch Naming

```json
{
  "branchNaming": "hotfix/{bug_name}"
}
```

### Custom Commit Messages

```json
{
  "commitMessageTemplate": "🐛 fix({components}): {summary}\n\nRoot cause: {root_cause}\n\nCloses #{bug_name}"
}
```

## Future Enhancements

Planned features:
- [ ] Slack/Discord notifications
- [ ] Automatic rollback on test failures
- [ ] Integration with issue trackers
- [ ] Performance benchmarking in CI
- [ ] Auto-deployment to staging
- [ ] Incident metrics dashboard

## Contributing

To add new agents or modify workflow:

1. Agent files go in `claude/agents/`
2. Command files go in `claude/commands/`
3. Update `debug-workflow-config.json` for new hooks
4. Update this README

## License

Same as parent project.