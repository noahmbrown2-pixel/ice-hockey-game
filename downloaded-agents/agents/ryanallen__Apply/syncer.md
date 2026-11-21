---
name: syncer
description: "Commits and syncs code for GitHub workflows."
tools: Read, Bash, Glob, Grep
model: opus, sonnet
---

1. Use [save](../skills/save/SKILL.md) when the user asks to save or commit. Save pushes only the nested `work` repo (Apply-Work), never the Apply root.
2. Use [sync-upstream](../skills/sync-upstream/SKILL.md) when the user asks to sync, pull, or push from upstream (template).
