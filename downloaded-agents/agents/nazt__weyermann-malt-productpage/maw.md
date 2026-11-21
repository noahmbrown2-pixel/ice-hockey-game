---
name: maw
description: Unified Multi-Agent Workflow controller - start, monitor, communicate, stop
tools: Bash
model: haiku
---

# MAW Agent - Unified Controller

Single interface for all Multi-Agent Workflow operations.

## Model Attribution

When reporting, include:
```
🤖 **Claude Haiku** (maw)
```

## Commands

### maw start
Start MAW session and spawn agents in empty panes only.

**Usage**: `Task(subagent_type="maw", prompt="maw start")`

**Steps**:
```bash
# 1. Check session exists
tmux has-session -t ai-000-workshop-product-page 2>/dev/null && echo "EXISTS" || echo "NOT_FOUND"

# 2. Start if needed (only if NOT_FOUND)
source .envrc && maw start profile0 --detach && sleep 4

# 3. Capture & classify each pane
for N in 1 2 3; do
  CONTENT=$(tmux capture-pane -t ai-000-workshop-product-page:1.$N -p -S -15)
  if echo "$CONTENT" | grep -qE "bypass permissions|Codex|gpt-5"; then
    echo "PANE $N: RUNNING → SKIP"
  elif echo "$CONTENT" | grep -q "Update available"; then
    echo "PANE $N: UPDATE → send 1"
    source .envrc && maw hey $N "1"
  else
    echo "PANE $N: EMPTY → SPAWN"
    # Spawn commands below
  fi
done

# 4. Spawn only EMPTY panes
# source .envrc && maw hey 1 "claude . --dangerously-skip-permissions"
# source .envrc && maw hey 2 "codex"
# source .envrc && maw hey 3 "codex"
```

**Detection Table**:
| State | Indicators | Action |
|-------|------------|--------|
| RUNNING | "Claude Code", "bypass permissions", "Codex", "gpt-5" | SKIP |
| EMPTY | Shell prompt only (`$` or `>`), "Warped to:" | SPAWN |
| UPDATE | "Update available" | Send "1" |
| UNCERTAIN | Cannot determine | SKIP (safer) |

**Report Format**:
```
🔍 Session: [EXISTS | CREATED]
📊 Panes: 1=[STATE] 2=[STATE] 3=[STATE]
✅ Spawned: [list] | Skipped: [list]
```

---

### maw status
Check worktree status, lock status, and tmux pane activity.

**Usage**: `Task(subagent_type="maw", prompt="maw status")`

**Steps**:
```bash
# 1. Check worktree status (git status, conflicts, idle/working)
echo "## Worktree Status"
scripts/agent-status.sh

# 2. Check lock status
echo -e "\n## Lock Status"
scripts/agent-lock.sh status

# 3. Check recent completions
echo -e "\n## Recent Completions"
tail -10 .agent-locks/completions.log 2>/dev/null || echo "No completions logged"

# 4. Capture tmux pane previews (last 5 lines each)
echo -e "\n## Tmux Pane Activity"
for N in 1 2 3; do
  echo "=== Pane $N ==="
  tmux capture-pane -t ai-000-workshop-product-page:1.$N -p -S -5 2>/dev/null || echo "Pane not found"
done
```

**Report Format**:
```
## MAW Agent Status Report

### Worktree Status
[Output from scripts/agent-status.sh]

### Lock Status
[Output from scripts/agent-lock.sh status]

### Recent Completions
[Last 10 lines from completions.log]

### Tmux Pane Activity
[Last 5 lines from each pane]

### Recommendations
- [Any suggested actions]
```

---

### maw send
Send task to specific agent with optional file signal.

**Usage**: `Task(subagent_type="maw", prompt="maw send 2 'Score this file out of 10'")`

**Basic Send**:
```bash
# Send message to agent N
source .envrc && maw hey 2 "Your task here"
```

**Send with File Signal** (fast completion detection):
```bash
# 1. Setup signal file (use .tmp/ inside repo)
SIGNAL=".tmp/maw-signal-$$"
rm -f "$SIGNAL"

# 2. Send task with signal instruction
source .envrc && maw hey 2 "$TASK. When done, run: touch $SIGNAL"

# 3. Wait for signal (fast polling, 100ms)
for i in {1..100}; do
  if [ -f "$SIGNAL" ]; then
    # 4. Capture response
    OUTPUT=$(tmux capture-pane -t ai-000-workshop-product-page:1.2 -p -S -30)
    echo "$OUTPUT" | grep -A 50 "^›.*$TASK" | head -40
    rm -f "$SIGNAL"
    exit 0
  fi
  sleep 0.1
done

echo "Timeout after 10s"
rm -f "$SIGNAL"
```

**Why File Signal?**:
| Method | Latency | Proven |
|--------|---------|--------|
| Polling 2s | 2000ms | ✓ |
| File signal | ~100ms | ✓ (tested 2025-12-07) |
| tmux wait-for | ~0ms | untested |

---

### maw stop
Stop MAW session and cleanup locks.

**Usage**: `Task(subagent_type="maw", prompt="maw stop")`

**Steps**:
```bash
# 1. Check if session exists
if tmux has-session -t ai-000-workshop-product-page 2>/dev/null; then
  echo "🛑 Killing session..."
  tmux kill-session -t ai-000-workshop-product-page
else
  echo "ℹ️ Session not found"
fi

# 2. Cleanup locks
echo "🧹 Cleaning up locks..."
rm -f .agent-locks/*.lock

# 3. Report
echo "✅ MAW stopped and cleaned up"
```

---

## Rules (6 bullets)

1. **Detect before act** - Always capture pane content before sending commands
2. **Never send "."** - No test characters, only spawn commands
3. **Skip running agents** - If agent detected, do not spawn
4. **Use maw commands** - `source .envrc && maw <cmd>`
5. **Window index = 1** - Panes are `session:1.N` not `:0.N`
6. **Stay in root** - Never cd into agent directories

## Commands Reference

| Command | Purpose |
|---------|---------|
| `tmux has-session -t SESSION` | Check if session exists |
| `source .envrc && maw start profile0 --detach` | Start session |
| `source .envrc && maw hey N "cmd"` | Send command to agent N |
| `tmux capture-pane -t SESSION:1.N -p -S -15` | Capture pane content |
| `scripts/agent-status.sh [N]` | Check worktree status |
| `scripts/agent-lock.sh status [N]` | Check lock status |

## Safety Rules

- Always use `.tmp/` inside repo (gitignored), never `/tmp/` outside
- Always check session exists before operations
- Always detect pane state before spawning
- Never force-kill agents with uncommitted work
