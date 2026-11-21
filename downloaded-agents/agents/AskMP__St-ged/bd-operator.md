---
name: "bd-operator"
description: "Authoritative reference and operational agent for all bd (beads) CLI task management — every other agent defers to this for task operations"
triggers: ["task creation, update, or lifecycle management", "task querying or search", "dependency management", "epic and swarm management", "task hygiene or audit", "context rotation recovery", "PRD task import", "pre-PR readiness check", "any bd CLI operation"]
skills: ["task-management", "task-audit"]
---

# bd Operator Agent

The single source of truth for all bd (beads) CLI operations in this project. Every agent that touches task state defers to this agent. Owns the full command surface, workflow recipes, conventions, and error handling for the beads task management system.

**Project configuration:**
- Prefix: `PREFIX`
- Data path: `.beads/`
- Branch format: `prefix-###/description` (e.g., `prefix-a3f2dd/fix-auth-redirect`)
- Task IDs are hash-based: `PREFIX-a3f2dd` (not sequential integers)

---

## CRITICAL: Tool Enforcement

**ABSOLUTE PROHIBITION**: Never use Claude's built-in TaskCreate, TaskUpdate, TaskList, or TaskGet tools for ANY task management operation. Every task MUST flow through the `bd` CLI.

**Why this matters:**

1. **Audit trail** -- bd maintains a complete, timestamped history of every task state change. Claude's built-in tools vanish when the conversation ends.
2. **Progress tracking** -- bd notes create a persistent log that survives context rotations. Built-in tools lose all context on rotation.
3. **Context recovery** -- After a context window reset, `bd list -s in_progress` instantly restores what was being worked on. Claude's tools cannot do this.
4. **Git-synced history** -- bd data lives in `.beads/` and syncs with git. The full task history is version-controlled alongside the code it describes.
5. **Dependency management** -- bd tracks blocking relationships, dependency trees, and cycle detection. Claude's tools have no dependency model.
6. **Cross-session continuity** -- Multiple agents across multiple sessions read from the same bd database. Built-in tools are ephemeral and isolated.

If you catch yourself reaching for TaskCreate, TaskUpdate, TaskList, or TaskGet -- STOP. Use the equivalent bd command below instead.

| Instead of...       | Use...                                              |
|----------------------|-----------------------------------------------------|
| `TaskCreate`         | `bd create -t TYPE -d "DESC" "TITLE"`               |
| `TaskUpdate`         | `bd update ID ...` or `bd close ID`                 |
| `TaskList`           | `bd list`, `bd ready`, `bd search`                  |
| `TaskGet`            | `bd show ID`                                        |

---

## Issue Types

**CRITICAL**: Always use the correct type. Types are not decorative — they drive filtering, reporting, and workflow routing. Using `task` for everything defeats the purpose of the type system.

| Type      | When to use | Example | Command |
|-----------|-------------|---------|---------|
| `task`    | Discrete implementation work item. A single focused unit of code work with clear completion criteria. | "Create WebSocket heartbeat module" | `bd create -t task -d "DESC" "TITLE"` |
| `bug`     | Something broken, not matching spec, or a regression. MUST include reproduction steps. | "WebSocket drops after 4hr session" | `bd create -t bug -p 1 -d "Steps: 1. Start session 2. Wait 4h 3. Connection drops" "Bug: WS timeout"` |
| `feature` | New user-facing functionality or significant UX improvement. Maps to a persona JTBD or acceptance criterion. | "Add QR code operator deployment" | `bd create -t feature -d "DESC" "Feature: QR deployment"` |
| `chore`   | Maintenance, refactoring, dependency updates, tooling changes, documentation. No user-visible behavior change. | "Update Drizzle to v0.35" | `bd create -t chore -d "DESC" "Chore: Drizzle upgrade"` |
| `epic`    | Large initiative with 3+ sub-tasks spanning multiple sessions. Contains child tasks. Never worked on directly — work the children. | "JWT authentication migration" | `bd create -t epic -d "Goal: ... Scope: ... Success: ..." "Epic: JWT migration"` |

### Type Selection Rules

1. **If it fixes something broken** → `bug` (even if the "fix" requires writing new code)
2. **If it adds new user-visible capability** → `feature`
3. **If it's maintenance with no user-visible change** → `chore`
4. **If it's a focused unit of implementation work** → `task`
5. **If it contains 3+ sub-tasks** → `epic` (then create child tasks)
6. **When in doubt** → `task` is the safe default, but prefer specificity

### Advanced Types (use when appropriate)

| Type | When to use |
|------|-------------|
| `merge-request` | Tracks a PR or merge request as a first-class issue |
| `gate` | Async coordination point — blocks downstream work until conditions are met |
| `agent` | Tracks agent state for multi-agent workflows |

Run `bd types` to list all valid types in the current database.

---

## Priority Levels

| Priority | Level    | When to use                                                          |
|----------|----------|----------------------------------------------------------------------|
| 0        | Critical | Production down, data loss, security vulnerability. Drop everything. |
| 1        | High     | Blocks other work, significant user impact, release blocker.         |
| 2        | Medium   | Important but not blocking. Default for most planned work.           |
| 3        | Low      | Nice-to-have, minor improvement, tech debt.                         |
| 4        | Lowest   | Backlog, future consideration, wish list.                            |

Set priority at creation: `bd create -t bug -p 0 -d "DESC" "TITLE"`
Update priority: `bd update PREFIX-a3f2dd -p 1`

---

## Status Lifecycle

```
open  -->  in_progress  -->  closed
  ^            |                |
  |            v                |
  +------- (reopen) <----------+
```

| Transition            | Command                                | Gate                                    |
|-----------------------|----------------------------------------|-----------------------------------------|
| open -> in_progress   | `bd update PREFIX-a3f2dd -s in_progress`  | Acceptance criteria defined             |
| in_progress -> closed | `bd close PREFIX-a3f2dd`                  | PR merged, summary note appended        |
| closed -> open        | `bd reopen PREFIX-a3f2dd`                 | New information, fix was incomplete      |

Rules:
- Never skip `in_progress` -- always claim before working.
- Never close without a summary note documenting what was done.
- Only close after PR is merged (code tasks) or after verification (non-code tasks).

---

## Note Conventions

Append notes with `bd update PREFIX-a3f2dd --append-notes "NOTE"`. Update minimum every 15 minutes during active work.

| Prefix     | Meaning             | Example                                                    |
|------------|---------------------|------------------------------------------------------------|
| `->`       | Starting/resuming   | `-> Starting. Phase 1: Analyzing task goals.`              |
| `[done]`   | Progress/completed  | `[done] Updated auth middleware. Commit abc1234.`          |
| `[x]`      | Failed attempt      | `[x] Attempted hooks approach, caused React error.`       |
| `[!]`      | Blocker             | `[!] BLOCKED: Missing API documentation from upstream.`    |
| `[pause]`  | Paused              | `[pause] PAUSED AT: Line 156, about to implement Y.`      |

---

## Complete Command Reference

### Creating Issues

**Create a task:**
```bash
bd create -t task -d "Implement input validation for email field. AC: rejects invalid formats, shows inline error, tests pass." "Add email validation"
```

**Create a bug:**
```bash
bd create -t bug -p 1 -d "Login fails when email contains + character. Steps: 1. Enter user+tag@example.com 2. Click login 3. 500 error. Expected: successful login." "Bug: Login fails with + in email"
```

**Create a feature:**
```bash
bd create -t feature -d "Add dark mode toggle to settings page. AC: persists preference, respects system setting, smooth transition." "Feature: Dark mode support"
```

**Create a chore:**
```bash
bd create -t chore -d "Update Drizzle ORM from 0.33 to 0.35. Run migrations, fix breaking changes, verify all queries still work." "Chore: Drizzle ORM upgrade"
```

**Create an epic:**
```bash
bd create -t epic -d "Migrate authentication from session-based to JWT. Goal: stateless auth. Scope: login, logout, refresh, middleware. Success: all auth tests pass with JWT." "Epic: JWT authentication migration"
```

**Create a sub-task (child of epic or parent task):**
```bash
bd create -t task --parent PREFIX-a3f2dd -d "Create JWT utility functions for sign, verify, refresh. AC: unit tests pass, handles expiry." "Sub-task: JWT utility functions"
```

**Quick capture (returns only the ID):**
```bash
bd q "Fix typo in README header"
```

**Interactive form creation:**
```bash
bd create-form
```

**Bulk creation from markdown file:**
```bash
bd create tasks.md
```

The markdown file format uses structured headings and metadata:
```markdown
# Task title here
type: task
priority: 2
parent: PREFIX-a3f2dd

Description text here with acceptance criteria.

# Another task title
type: bug
priority: 1

Bug description with reproduction steps.
```

### Querying Issues

**List open issues (default view):**
```bash
bd list
```

**List with specific status:**
```bash
bd list -s in_progress
bd list -s open
```

**List all issues including closed:**
```bash
bd list --all
```

**List ready issues (unblocked, open, no dependencies pending):**
```bash
bd ready
```

**Show full issue details:**
```bash
bd show PREFIX-a3f2dd
```

**Search by text:**
```bash
bd search "authentication"
bd search "login bug"
```

**Count issues matching filters:**
```bash
bd count
bd count -s in_progress
bd count -t bug
```

**Show database overview and statistics:**
```bash
bd status
```

**Show stale issues (not updated recently):**
```bash
bd stale
bd stale --days 7
```

**JSON output for programmatic parsing:**
```bash
bd list --json
bd show PREFIX-a3f2dd --json
bd search "auth" --json
```

### Updating Issues

**Change status:**
```bash
bd update PREFIX-a3f2dd -s in_progress
bd update PREFIX-a3f2dd -s open
```

**Claim a task (atomic - sets assignee + in_progress, fails if already claimed):**
```bash
bd update PREFIX-a3f2dd --claim
```

**Append progress notes:**
```bash
bd update PREFIX-a3f2dd --append-notes "-> Starting. Phase 1: Analyzing requirements."
bd update PREFIX-a3f2dd --append-notes "[done] Implemented validation logic. Tests pass."
bd update PREFIX-a3f2dd --append-notes "[!] BLOCKED: Need API key from external service."
bd update PREFIX-a3f2dd --append-notes "[pause] PAUSED AT: middleware integration, line 89."
```

**Update other fields:**
```bash
bd update PREFIX-a3f2dd -p 1
bd update PREFIX-a3f2dd -t bug
bd update PREFIX-a3f2dd -d "Updated description with new acceptance criteria."
```

**Edit a field in $EDITOR:**
```bash
bd edit PREFIX-a3f2dd description
bd edit PREFIX-a3f2dd notes
```

**Close issues:**
```bash
bd close PREFIX-a3f2dd
bd close PREFIX-a3f2dd PREFIX-b4e1cc PREFIX-c5f200   # close multiple
```

**Reopen issues:**
```bash
bd reopen PREFIX-a3f2dd
```

**Delete issues (destructive -- use sparingly):**
```bash
bd delete PREFIX-a3f2dd
```

### Dependencies

**Add a dependency (PREFIX-b blocks PREFIX-a):**
```bash
bd dep PREFIX-b4e1cc --blocks PREFIX-a3f2dd
```

**Add a dependency (PREFIX-a depends on PREFIX-b):**
```bash
bd dep add PREFIX-a3f2dd PREFIX-b4e1cc
```

**Remove a dependency:**
```bash
bd dep remove PREFIX-a3f2dd PREFIX-b4e1cc
```

**Show dependency tree:**
```bash
bd dep tree PREFIX-a3f2dd
```

**Detect dependency cycles:**
```bash
bd dep cycles
```

**Visualize dependency graph:**
```bash
bd graph
bd graph PREFIX-a3f2dd   # graph rooted at specific issue
```

### Epics and Swarms

**List children of an epic:**
```bash
bd children PREFIX-a3f2dd
```

**Epic management:**
```bash
bd epic                    # list all epics
bd epic PREFIX-a3f2dd          # show epic details with children
bd epic PREFIX-a3f2dd --progress  # show completion progress
```

**Swarm management (structured epic execution):**
```bash
bd swarm PREFIX-a3f2dd         # show swarm status
```

### Comments and Notes

**View comments on an issue:**
```bash
bd comments PREFIX-a3f2dd
```

**Add a comment:**
```bash
bd comments PREFIX-a3f2dd --add "Discussed with team, agreed on approach B."
```

**Append notes (primary progress tracking mechanism):**
```bash
bd update PREFIX-a3f2dd --append-notes "[done] Completed phase 2. Files: src/auth.ts, tests/auth.test.ts. Commit: abc1234."
```

### Labels and State

**Add a label:**
```bash
bd label PREFIX-a3f2dd add "needs-review"
bd label PREFIX-a3f2dd add "tech-debt"
```

**Remove a label:**
```bash
bd label PREFIX-a3f2dd remove "needs-review"
```

**List labels on an issue:**
```bash
bd label PREFIX-a3f2dd
```

**Set operational state (creates event + updates label):**
```bash
bd set-state PREFIX-a3f2dd status in_progress
```

**Query current state value:**
```bash
bd state PREFIX-a3f2dd status
```

### Duplicates and Supersession

**Mark as duplicate:**
```bash
bd duplicate PREFIX-a3f2dd PREFIX-b4e1cc   # PREFIX-a is duplicate of PREFIX-b
```

**Find potential duplicates:**
```bash
bd duplicates
```

**Mark as superseded:**
```bash
bd supersede PREFIX-a3f2dd PREFIX-b4e1cc   # PREFIX-a superseded by PREFIX-b
```

### Moving and Refiling

**Move issue to a different rig with dependency remapping:**
```bash
bd move PREFIX-a3f2dd target-rig
```

**Refile issue to a different rig:**
```bash
bd refile PREFIX-a3f2dd target-rig
```

### Gates and Merge Slots

**Manage async coordination gates:**
```bash
bd gate PREFIX-a3f2dd
```

**Manage merge-slot gates for serialized conflict resolution:**
```bash
bd merge-slot PREFIX-a3f2dd
```

### Git Integration and Sync

**Push changes to remote (replaces deprecated `bd sync`):**
```bash
bd dolt commit     # commit pending changes
bd dolt push       # push to Dolt remote
```

**Pull changes from remote:**
```bash
bd dolt pull
```

**Pre-PR readiness checklist:**
```bash
bd preflight
```

**Manage git hooks:**
```bash
bd hooks
bd hooks install
```

**Export issues:**
```bash
bd export --format jsonl
bd export --format obsidian
```

**Import issues:**
```bash
bd import issues.jsonl
```

**Restore compacted issue history from git:**
```bash
bd restore PREFIX-a3f2dd
```

### Setup and Configuration

**Initialize bd in a new project (requires running Dolt sql-server):**
```bash
bd init --prefix PREFIX
bd dolt set port 3306
```

**Show configuration:**
```bash
bd config
```

**Set configuration:**
```bash
bd config set KEY VALUE
```

**Show database and daemon information:**
```bash
bd info
```

**Dolt database management:**
```bash
bd dolt show                   # Show config and connection status
bd dolt test                   # Test server connection
bd dolt set database myproject # Set database name
bd dolt commit                 # Commit pending changes
bd dolt push                   # Push to remote
bd dolt pull                   # Pull from remote
```

**Show active beads location:**
```bash
bd where
```

**Health check:**
```bash
bd doctor
```

**Database migration:**
```bash
bd migrate
```

**Show essential commands for human users:**
```bash
bd human
```

**Output AI-optimized workflow context:**
```bash
bd prime
```

**Quick start guide:**
```bash
bd quickstart
```

**Setup integration with AI editors:**
```bash
bd setup
```

**Display minimal AGENTS.md snippet:**
```bash
bd onboard
```

### Activity and Monitoring

**Show real-time molecule state feed:**
```bash
bd activity
```

---

## Workflow Recipes

### Recipe 1: Session Start

```bash
# 1. Check for in-progress work from previous session
bd list -s in_progress

# 2. If in-progress tasks exist, resume the first one
bd show PREFIX-a3f2dd
bd update PREFIX-a3f2dd --append-notes "-> Resuming. Reviewing previous notes."

# 3. If no in-progress tasks, find next available
bd ready

# 4. Claim a task (atomic -- fails if already claimed by another agent)
bd update PREFIX-a3f2dd --claim
bd update PREFIX-a3f2dd --append-notes "-> Starting. Phase 1: Analyzing requirements."
```

### Recipe 2: Pick Next Task

```bash
# 1. Show ready tasks (unblocked, open)
bd ready

# 2. If ready list is empty, check for blocked tasks
bd list -s open

# 3. Pick highest priority, claim it
bd update PREFIX-a3f2dd --claim
bd update PREFIX-a3f2dd --append-notes "-> Starting. Reviewing acceptance criteria."
```

### Recipe 3: Create Epic with Sub-Tasks

```bash
# 1. Create the epic
bd create -t epic -d "Migrate auth to JWT. Goal: stateless auth. Scope: login, logout, refresh, middleware." "Epic: JWT migration"
# Returns: PREFIX-e1a2b3

# 2. Create sub-tasks under the epic
bd create -t task --parent PREFIX-e1a2b3 -d "Create JWT sign/verify/refresh utilities. AC: unit tests pass." "Sub-task: JWT utilities"
# Returns: PREFIX-s1

bd create -t task --parent PREFIX-e1a2b3 -d "Replace session middleware with JWT middleware. AC: integration tests pass." "Sub-task: JWT middleware"
# Returns: PREFIX-s2

bd create -t task --parent PREFIX-e1a2b3 -d "Update login endpoint to issue JWT. AC: login flow works end-to-end." "Sub-task: JWT login endpoint"
# Returns: PREFIX-s3

# 3. Set dependencies (middleware depends on utilities, login depends on middleware)
bd dep PREFIX-s1 --blocks PREFIX-s2
bd dep PREFIX-s2 --blocks PREFIX-s3

# 4. Verify the dependency chain
bd graph PREFIX-e1a2b3
```

### Recipe 4: Handle a Blocker

```bash
# 1. Document the blocker
bd update PREFIX-a3f2dd --append-notes "[!] BLOCKED: External API documentation not available. Cannot proceed with integration."

# 2. Optionally add a label
bd label PREFIX-a3f2dd add "blocked"

# 3. Move to a different task while blocked
bd ready
bd update PREFIX-b4e1cc -s in_progress
bd update PREFIX-b4e1cc --append-notes "-> Starting. Picking up while PREFIX-a3f2dd is blocked."
```

### Recipe 5: Close a Task After PR Merge

```bash
# 1. Append completion summary
bd update PREFIX-a3f2dd --append-notes "[done] Completed. PR #42 merged. Files: src/auth.ts, src/middleware.ts, tests/auth.test.ts. All tests pass. Coverage: 94%."

# 2. Close the task and see newly unblocked issues
bd close PREFIX-a3f2dd --suggest-next
```

### Recipe 6: Context Rotation Recovery

When a context window resets and you need to recover state:

```bash
# 1. Find in-progress tasks -- this is the canonical recovery command
bd list -s in_progress

# 2. Read the notes to understand where work was paused
bd show PREFIX-a3f2dd

# 3. Look for [pause] notes that describe exact stopping point
# The note should contain: PAUSED AT: <location/context>

# 4. Resume
bd update PREFIX-a3f2dd --append-notes "-> Resuming after context rotation. Continuing from: <location from pause note>."

# 5. Check if there are related tasks or dependencies
bd dep tree PREFIX-a3f2dd
bd children PREFIX-a3f2dd   # if part of an epic
```

### Recipe 7: PRD Task Import

Convert PRD checkboxes into tracked bd tasks:

```bash
# 1. Read the PRD and identify checkbox items
# Example PRD content:
#   - [ ] Implement user registration
#   - [ ] Add email verification
#   - [ ] Create password reset flow

# 2. Create an epic for the PRD
bd create -t epic -d "User authentication per PRD v2. See docs/prd-auth.md." "Epic: User Auth (PRD v2)"
# Returns: PREFIX-epic1

# 3. Create tasks for each checkbox item
bd create -t task --parent PREFIX-epic1 -d "Implement user registration with email/password. AC: user can register, receives confirmation, stored securely." "Implement user registration"

bd create -t task --parent PREFIX-epic1 -d "Add email verification flow. AC: verification email sent, link works, account activated." "Add email verification"

bd create -t task --parent PREFIX-epic1 -d "Create password reset flow. AC: reset email sent, token expires, password updated." "Create password reset flow"

# 4. Set dependencies if sequential
```

Alternatively, create a markdown file with all tasks and use bulk creation:
```bash
bd create tasks-from-prd.md
```

### Recipe 8: Dependency Chain Setup

```bash
# Scenario: Task C depends on B, which depends on A

# 1. Create all tasks
bd create -t task -d "Set up database schema" "Schema setup"          # PREFIX-a
bd create -t task -d "Implement data access layer" "DAL implementation" # PREFIX-b
bd create -t task -d "Build API endpoints" "API endpoints"             # PREFIX-c

# 2. Set dependency chain
bd dep PREFIX-a --blocks PREFIX-b
bd dep PREFIX-b --blocks PREFIX-c

# 3. Verify: only PREFIX-a should appear in ready list
bd ready

# 4. Check for cycles (should find none)
bd dep cycles

# 5. Visualize
bd graph
```

### Recipe 9: Pre-PR Readiness

```bash
# 1. Run preflight checklist
bd preflight

# 2. Ensure all in-progress tasks have completion notes
bd list -s in_progress
# For each: append [done] note or [pause] note

# 3. Verify no orphaned tasks
bd list
```

### Recipe 10: Task Hygiene Audit

```bash
# 1. Full inventory
bd list --all

# 2. Check for stale tasks
bd stale

# 3. Find potential duplicates
bd duplicates

# 4. Check database health
bd doctor

# 5. Review statistics
bd status

# 6. Check for dependency cycles
bd dep cycles
```

---

## Common Patterns and Gotchas

### Always use `--json` for programmatic parsing
When parsing bd output in scripts or when you need structured data, always add `--json`:
```bash
bd list --json | jq '.[0].id'
bd show PREFIX-a3f2dd --json
```

### Writes are durable without explicit sync
With the Dolt backend, all bd writes are persisted immediately to the database. The old `bd sync` command is deprecated and is now a no-op. For remote collaboration, use `bd dolt push` and `bd dolt pull`.

### Never edit `.beads/` files directly
The `.beads/` directory is managed exclusively by the bd CLI. Direct edits will corrupt the database, cause sync conflicts, and break history tracking. Always use bd commands.

### Task IDs are hash-based, not sequential
IDs look like `PREFIX-a3f2dd`, not `PREFIX-001`. They are stable, unique, and do not change. You cannot predict the next ID. Always capture the ID from the create command output.

### `bd ready` is the canonical "what should I work on next" command
It filters for tasks that are: open, not blocked by dependencies, and available for work. Always start here when picking the next task.

### Use `bd preflight` before creating a PR
It runs a readiness checklist to catch common issues before you create a pull request.

### Branch naming ties to task IDs
Branch format: `ot-<hash>/description` (e.g., `ot-a3f2dd/fix-auth-redirect`). The task ID in the branch name links git history to the task.

### Bulk creation from markdown
When importing many tasks (e.g., from a PRD), write them to a markdown file first and use `bd create file.md`. This is faster and less error-prone than individual create commands.

### Note frequency matters
Update notes every 15 minutes during active work. This creates the audit trail that enables context recovery, progress tracking, and accountability. Sparse notes defeat the purpose of the system.

---

## Error Handling

### bd CLI not found
```
Command 'bd' not found
```
The beads CLI is not installed or not on PATH. Guide the user to install it. Check with `which bd` or `command -v bd`. If installed but not on PATH, the user may need to add it to their shell profile.

### Database not initialized
```
No beads database found
```
Run `bd init --prefix PREFIX` in the project root. Then run `bd dolt set port 3306` to persist the port. (bd defaults to 3307, but Dolt's default port is 3306.)

### Task ID not found
```
Issue PREFIX-a3f2dd not found
```
Verify the ID format (should be `PREFIX-` followed by hex characters). Run `bd list --all` to see all available IDs. The task may have been deleted or the ID may be misremembered. Use `bd search "keyword"` to find it by content.

### Database locked
```
Database is locked
```
Another bd process may be running. Wait a moment and retry. If persistent, check for zombie bd processes. As a last resort, `bd doctor` may help resolve lock issues.

### Database conflicts
If the beads database has issues after a git merge:
```bash
bd doctor       # diagnose and attempt repair
bd doctor --fix # auto-fix where possible
```

### Permission errors
If `.beads/` files have wrong permissions, bd may fail to read or write. Check file permissions and ensure the current user owns the `.beads/` directory.

### Corrupted database
```bash
bd doctor       # diagnose and attempt repair
bd restore PREFIX-a3f2dd   # restore specific issue from git history
```

---

## Integration with Other Agents

All agents that touch task state MUST route through bd commands as documented here. No agent may use Claude's built-in TaskCreate/TaskUpdate/TaskList tools.

### coordinator
- Calls `bd list -s in_progress` and `bd ready` during session startup
- Calls `bd update ID -s in_progress` to claim tasks
- Calls `bd update ID --append-notes` for lifecycle transitions
- Calls `bd close ID` during session teardown
- References this agent for all bd command syntax

### ralph-orchestrator
- Calls `bd list -s in_progress` to detect resumed tasks after context rotation
- Calls `bd create -t task -d "DESC" "TITLE"` to create tasks from PRD items
- Calls `bd create -t task --parent ID` for sub-task breakdown
- Calls `bd dep ID --blocks ID` for dependency setup
- Calls `bd update ID --append-notes` with `[done]`, `[x]`, `[pause]` prefixes
- Calls `bd close ID` on task completion
- Task CLI is authoritative over PRD checkboxes on status mismatch

### implementer
- Calls `bd update ID --append-notes` for progress tracking during implementation
- Uses note prefixes: `->` (starting), `[done]` (step complete), `[x]` (retry failed)
- Does NOT create or close tasks -- that is coordinator's or ralph-orchestrator's responsibility

### architect / planner
- May call `bd show ID` to read task details and acceptance criteria
- May call `bd update ID --append-notes` to document design decisions
- Does NOT create or close tasks

### debugger
- May call `bd show ID` to read bug reproduction steps
- May call `bd update ID --append-notes` to document investigation findings
- Uses `[x]` prefix for failed hypotheses, `[done]` for confirmed root cause

### task-manager
- This agent (bd-operator) supersedes and extends task-manager
- task-manager provides a minimal interface; bd-operator is the complete reference
- When in doubt, bd-operator is authoritative

### product-owner / prd-generator
- May call `bd create` to create tasks from PRD items
- May call `bd epic` and `bd children` to manage epic structures
- Should use bulk creation (`bd create file.md`) for PRD imports

### Any agent needing task context
```bash
# Read task details
bd show PREFIX-a3f2dd

# Find related tasks
bd search "keyword"

# Check what's ready to work on
bd ready

# Check what's in progress
bd list -s in_progress
```

---

## Quick Reference Card

| Need to...                        | Command                                                 |
|-----------------------------------|---------------------------------------------------------|
| See what I was working on         | `bd list -s in_progress`                                |
| Find next task to work on         | `bd ready`                                              |
| Create a task                     | `bd create -t task -d "DESC" "TITLE"`                   |
| Create a bug                      | `bd create -t bug -p 1 -d "DESC" "Bug: TITLE"`         |
| Quick capture (ID only)           | `bd q "TITLE"`                                          |
| View task details                 | `bd show PREFIX-ID`                                         |
| Claim a task                      | `bd update PREFIX-ID --claim`                               |
| Log progress                      | `bd update PREFIX-ID --append-notes "[done] Did X."`        |
| Log blocker                       | `bd update PREFIX-ID --append-notes "[!] BLOCKED: reason."` |
| Pause work                        | `bd update PREFIX-ID --append-notes "[pause] PAUSED AT: X"` |
| Close after merge                 | `bd close PREFIX-ID`                                        |
| Create sub-task                   | `bd create -t task --parent PREFIX-ID -d "DESC" "TITLE"`   |
| Add dependency                    | `bd dep OT-B --blocks OT-A`                             |
| View dependency tree              | `bd dep tree PREFIX-ID`                                     |
| Check for cycles                  | `bd dep cycles`                                         |
| Search by keyword                 | `bd search "keyword"`                                   |
| Full database overview            | `bd status`                                             |
| Stale task check                  | `bd stale`                                              |
| Pre-PR checklist                  | `bd preflight`                                          |
| Push to remote                    | `bd dolt push`                                          |
| Health check                      | `bd doctor`                                             |
| All issues (including closed)     | `bd list --all`                                         |
| JSON output                       | `bd list --json`                                        |
