# downloaded-agents/ — quarantined public Claude Code agents

A rolling collection of **public** `.claude/agents/*.md` sub-agent definitions that
other GitHub users have shared, downloaded by `fetch_agents.py`.

## ⚠️ Safety model — read this

These files are **untrusted third-party data**. They are NOT installed and NOT run.

- Saved under `agents/<owner>__<repo>/…` — deliberately **outside** the live
  `.claude/agents/` directory so nothing here auto-loads or executes.
- Every file is scanned on download for prompt-injection / trap markers
  (`ignore previous instructions`, hidden system prompts, `curl | bash`,
  zero-width chars, exfiltration language). Hits are recorded in
  `manifest.json` → `flagged` and surfaced in `INDEX.md`. A flag means
  "a human should look before trusting" — most are benign (e.g. a
  pen-tester agent that *describes* exfiltration).
- **Do not copy any of these into `.claude/agents/` without reading them first.**
  Treat an agent `.md` like any script from a stranger.

## Files

- `roam.py` — **one command per roam pass**: runs a few fetch batches, rebuilds the
  index, prints a two-line summary. This is what the `/loop` calls each turn.
- `gen_index.py` — regenerates `INDEX.md` from the manifest (used by `roam.py`).
- `fetch_agents.py` — the downloader. Pulls a batch, dedupes against the manifest,
  scans, and advances its page cursor in `state.json`.
- `manifest.json` — every file collected: repo, path, sha, size, local path, flags.
- `state.json` — per-query page cursor so each run continues where it left off.
- `INDEX.md` — human-browsable table (regenerate anytime from the manifest).
- `agents/` — the downloaded files, one folder per source repo.

## Run manually

```bash
python fetch_agents.py --max 40                       # next batch, default query
python fetch_agents.py --query "path:.claude/agents name" --max 40   # different roam
```

Source: GitHub code search for `path:.claude/agents extension:md` (~200k public files).
