# GitHub Starred to Research - Autonomous ZTE Workflow

<!-- @REQ-WKFL-040: Convert starred repos into technical briefs | BLP: [Autonomy: 100%, Durability: High, Self-Organization: Categorizing] -->

**Description:** Processes newly starred GitHub repositories into integration plans. For each new star the autonomous processor conducts internal + external research, calculates CA score projections, generates revenue use cases, produces a Claude Code implementation plan (MD), and sends a rich HTML email with APPROVE / MODIFY / REJECT.

**Autonomy Level:** SEMI-AUTONOMOUS (human approves integration emails; processing is automatic)

**Schedule:** Cron DISABLED 2026-04-07 (noise / queue bloat). Invoke this skill manually.

---

## Primary Implementation

The actual production script:

- **Path:** `/home/craigmbrown/Project/scripts/github_star_autonomous_processor.py`
- **Version:** 2.0.0
- **State file:** `/home/craigmbrown/Project/logs/github_star_processor_state.json`
- **Log:** `/home/craigmbrown/Project/logs/github_star_processor.log`

The script handles the full pipeline end-to-end: state-tracked star detection, research, plan generation, email delivery, skip-list enforcement.

### Configuration (inside the script)

| Key | Default | Purpose |
|---|---|---|
| `from_email` | `babyproject418@gmail.com` | Sender |
| `to_email` | `craigmbrown@gmail.com` | Recipient |
| `max_repos_per_run` | 5 | Cap per invocation |
| `skip_repos` | `["poly-sdk"]` | Already-processed manual exclusions |
| `private_repo` | `ETAC-System` | Integration branch target |
| `integration_branch` | `feat/github-star-integrations` | Branch name |

---

## Usage

### Manual run (process up to 5 new stars)

```bash
/home/craigmbrown/Project/venv/bin/python \
  /home/craigmbrown/Project/scripts/github_star_autonomous_processor.py \
  >> /home/craigmbrown/Project/logs/github_star_processor.log 2>&1
```

### Check what's already been processed

```bash
jq '.processed_repos | length' /home/craigmbrown/Project/logs/github_star_processor_state.json
jq -r '.processed_repos[-10:][]' /home/craigmbrown/Project/logs/github_star_processor_state.json
```

### Review recent outputs

```bash
ls -lt /home/craigmbrown/Project/html-output/PLAN-GH-*-integration.md | head -5
tail -60 /home/craigmbrown/Project/logs/github_star_processor.log
```

### Skip a repo manually

Edit `CONFIG["skip_repos"]` in the processor, or append the `owner/repo` to `processed_repos` in the state JSON before running.

---

## Related Scripts

- `scripts/github_star_detailed_processor.py` — richer research variant (higher cost per repo)
- `scripts/github_star_autonomous_processor.py` — default processor (used by this skill)

---

## Re-enabling the Autonomous Cron

The cron job was disabled 2026-04-07 for noise/queue bloat reasons. To re-enable at a conservative cadence (once daily):

```cron
0 14 * * * cd /home/craigmbrown/Project && /home/craigmbrown/Project/venv/bin/python scripts/github_star_autonomous_processor.py >> /home/craigmbrown/Project/logs/github_star_processor.log 2>&1
```

**Do not re-enable without:** (a) lowering `max_repos_per_run` if needed, (b) confirming skip-list covers current noise, (c) user approval per memory feedback on WhatsApp/email volume.

---

## Exception Handling

- **Gmail token expired:** Re-run `scripts/execution_toolkit.py email --auth` to refresh the pickle at `~/.config/google_api/babyproject_gmail_token.pickle`.
- **Rate limit (gh CLI):** Processor uses REST API; if GraphQL quota hits, wait and retry.
- **State corruption:** Back up `logs/github_star_processor_state.json` before manual edits.

---

## Historical Notes

- **2026-04-07:** Cron disabled for noise; switched to manual-only.
- **2026-04-18:** Slash command rewritten to call the working processor after discovering the original workflow referenced a deleted `autonomous-zte-workflows/main.py` and deleted `multi-source-intelligence/` scripts.

**Version:** 2.0
**Last Updated:** 2026-04-18
