---
name: pipeline-health
description: Diagnose multi-pipeline failures (calendar, TB voice-cmd, GH email, YT, MCP, X-likes) with structured checks for OAuth expiry, zombie jobs, wrong-folder ingestion, missing trigger words, and lazy-loaded MCP misdiagnosis. Use when the operator says "X stopped working" or asks for a fleet health check.
allowed-tools: Read, Bash, Grep, Glob
version: 1.0.0
---

# /pipeline-health

**Role:** You are the fleet pipeline diagnostician — you run the structured failure-mode checks for the named pipeline (OAuth expiry, zombie jobs, wrong-folder ingestion, trigger drift, lazy-loaded MCP) and propose the one-line fix. You diagnose only; you do not rewrite working code on a hunch.

**Output / Termination:** Return one diagnosis block — `{symptom, root_cause, evidence, fix_command}` — for the reported symptom, then STOP. Do not run the full suite or expand scope unless asked.

Structured diagnostic playbook for the multi-pipeline operations fleet. Codifies the failure-mode pattern library from `/insights` (27 buggy-code incidents, 18 wrong-approach), so we stop rediscovering the same failure classes (OAuth expiry, zombie jobs, wrong-folder transcripts, missing trigger words, lazy-loaded MCPs misread as down).

## When to invoke

- "X pipeline stopped working" — calendar / TB voice / GH email / YT / MCP / X-likes
- "Why did all these things stop simultaneously?" (system-wide failure)
- Routine fleet health check (cron-driven or operator-initiated)
- Before claiming a pipeline is healthy

## The 5 most common pipeline failure modes (with detection)

### 1. OAuth token expired or wrong path

Symptom: pipeline ran successfully yesterday, now silently fails. Logs show "credentials not refreshed" or 401/403.

```bash
# Check Gmail token age
ls -la /home/craigmbrown/.config/google_api/gmail_full_token.pickle
ls -la ~/.gmail_calendar_credentials*.pickle 2>/dev/null

# Calendar token (often a different path than Gmail)
find /home/craigmbrown -maxdepth 4 -name "*calendar*token*" -o -name "*calendar*pickle*" 2>/dev/null | head -5

# Test token actually works (don't trust file existence)
python3 -c "
import pickle
from pathlib import Path
for p in Path('/home/craigmbrown/.config/google_api').glob('*token*.pickle'):
    try:
        with open(p, 'rb') as f: creds = pickle.load(f)
        print(p, 'expired:', getattr(creds, 'expired', '?'))
    except Exception as e:
        print(p, 'ERROR:', e)
"
```

Fix: re-auth flow. The relevant script depends on which pipeline (gmail_oauth_setup.py for Gmail, calendar-specific setup for Calendar).

### 2. Cron entry references nonexistent script

Symptom: pipeline appears to be on cron but no log activity. Logs are empty or have no recent timestamps.

```bash
# Find broken cron refs
crontab -l | grep -oE "/home/craigmbrown/Project/scripts/[^ ]+\.py" | sort -u | while read f; do
  test -f "$f" || echo "MISSING: $f"
done
```

Fix: `bash scripts/patch_rq150_crontab.sh` for the RQ-150 case; generally, repoint or remove the cron line.

### 3. Zombie job / stale lockfile

Symptom: cron entry exists, script exists, but it never runs. `flock` is blocking forever because a previous instance hung.

```bash
# Find stale locks
ls -la /tmp/*.lock 2>/dev/null | head -10
# Check if process holding the lock is alive
for lock in /tmp/*.lock; do
  PID=$(fuser "$lock" 2>/dev/null | tr -d ' ')
  if [ -n "$PID" ]; then
    if ! ps -p "$PID" > /dev/null 2>&1; then
      echo "STALE LOCK (pid $PID dead): $lock"
    fi
  fi
done
```

Fix: `rm /tmp/<stale>.lock` and verify the next cron tick fires. Long-term: scripts should use `flock -n` (non-blocking) and exit cleanly if locked, not wait forever.

### 4. Wrong-folder ingestion

Symptom: TB voice commands stopped processing, calendar agent shows no new events, YT-likes pipeline produces nothing despite new likes.

```bash
# For each ingest pipeline, verify the watched folder matches reality
ls /home/craigmbrown/Project/data/limitless_transcripts/ | tail -5  # Limitless drops
ls /home/craigmbrown/Project/data/youtube_likes/ 2>/dev/null | tail -5
# Then grep the script for which folder it actually watches
grep -n "TRANSCRIPT_DIR\|LIKES_DIR\|WATCH" /home/craigmbrown/Project/scripts/tb-command-daemon.py 2>/dev/null | head -3
```

Fix: align the folder in the script with where data actually lands. The "TB voice command silently stopped" issue traced to a folder rename a month earlier.

### 5. Missing trigger word / regex drift

Symptom: TB voice commands run but the orchestrator never picks anything up. Transcripts contain commands but the trigger detection doesn't fire.

```bash
# Grep current trigger words
grep -n "TB ACTION\|TB BUILD\|TB STATUS\|trigger_words\|TRIGGER_RE" \
  /home/craigmbrown/Project/scripts/tb-command-daemon.py \
  /home/craigmbrown/Project/scripts/tb_pipeline_v2/*.py 2>/dev/null | head -10
# Then grep a recent transcript for what commands it actually contains
tail -50 /home/craigmbrown/Project/data/limitless_transcripts/$(ls -t /home/craigmbrown/Project/data/limitless_transcripts/ | head -1) | grep -i "TB \|tb action\|tb build"
```

Fix: update the trigger regex OR teach the operator the canonical words. Often the operator has drifted ("TB action" vs "TB-action" vs "tee bee action").

### 6. MCP server lazy-load misread as "down"

Symptom: MCP tool calls fail with "server disconnected" but the server is actually fine — it just hasn't been called yet this session.

```bash
# DO NOT assume "tool not available" means "server down"
# Test directly:
ls /home/craigmbrown/.claude/projects/*/.mcp-state 2>/dev/null | head -3
# Check the MCP config
cat /home/craigmbrown/.claude.json 2>/dev/null | jq '.mcpServers | keys' 2>/dev/null
```

This was the pattern that led to "rewrote 4 broken MCP servers" — at least one was lazy-loaded, not broken. Always test before rewriting.

## Phase-checkpoint after diagnostic

After running checks for the symptom, STOP and post:
1. Pipeline checked
2. Failure mode identified (which of the 5 above, or "new")
3. Evidence (specific file paths, log entries, lock state)
4. Proposed fix (one-liner or "needs more investigation")
5. Risk if applied (does it touch shared state? other pipelines?)

Then wait for operator go. Do NOT auto-apply fixes for failure-mode 3 (stale lock) or 5 (trigger regex) — both can have side effects.

## Verify-before-claim

When concluding "this pipeline is healthy" or "this pipeline is broken":
- Show recent log lines (not just absence of errors)
- Show last successful run timestamp
- Show next scheduled run + lock state
- If claiming a script is missing, grep across the codebase first (it may have moved)

Per CLAUDE.md `## Pre-Implementation Verification`: if operator says "it was working at one point," that's authoritative. Search harder before concluding otherwise.

## Anti-patterns this skill prevents

| Failure mode | What this catches |
|---|---|
| Assuming MCP is "down" without testing | §6 lazy-load check |
| Restarting cron without checking the script exists | §2 ref-validity sweep |
| Tracking down a hang that's actually a stale lock | §3 stale-lock detect |
| Claiming "no replies" when the ingester is the broken part | §4 wrong-folder + §5 trigger drift |
| Re-authing every pipeline because one OAuth broke | §1 isolated token check |
