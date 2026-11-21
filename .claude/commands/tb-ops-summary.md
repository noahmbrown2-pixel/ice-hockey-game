# TB Ops 6-Hour Summary

**Description:** Generates a comprehensive 6-hourly system health, cost, and ecosystem status summary. Replaces the legacy tb-ops-agent-daemon.py with a lightweight on-demand skill.

**Schedule:** Every 6 hours at 0:00, 6:00, 12:00, 18:00 EST via workflow-scheduler

**BLP:** [Autonomy: 80%, Durability: High, Self-Organization: Adaptive]

---

## Instructions

You are generating a TB Ops 6-Hour Summary. Follow these steps exactly:

### Step 1: Gather System Metrics

Run the metrics gathering script:

```bash
python3 /home/craigmbrown/Project/.claude/skills/tb-ops-summary/scripts/gather_metrics.py
```

This outputs a JSON object with: cpu, memory, disk, vm_count, daily_cost, monthly_cost, blp_metrics, ecosystem_status, recent_log_events, uptime info.

### Step 2: Read the JSON Output

Read the output JSON from `/tmp/tb-ops-summary-metrics.json`.

### Step 3: Determine Health Status

Based on the metrics:
- **GREEN**: All services healthy, cost < 80% daily budget, CPU < 80%, disk < 85%
- **YELLOW**: 1-2 services unhealthy, OR cost 80-100% daily budget, OR CPU 80-90%
- **RED**: 3+ services unhealthy, OR cost > 100% daily budget, OR CPU > 90%, OR disk > 90%

### Step 4: Generate HTML Dashboard

Create a dark-mode HTML dashboard file at:
`/home/craigmbrown/Project/html-output/YYYYMMDD-tb-ops-summary.html`

Use the standard GenUI dark mode template. Include:
- Health status badge (GREEN/YELLOW/RED)
- System metrics grid (CPU, Memory, Disk, VMs)
- Cost tracker with progress bars (daily vs $50 budget, monthly vs $1000 budget)
- BLP / Compute Advantage metrics
- Ecosystem status table (only show real services with actual health data)
- Recent events from logs (filter out repetitive health checks, show real events only)
- Timestamp and uptime

**IMPORTANT**: Only generate ONE HTML file per execution. Use format `YYYYMMDD-tb-ops-summary.html` (no HH:MM suffix).

### Step 5: Generate TinyURL

```bash
EXTERNAL_URL="http://34.58.12.50:8080/$(basename HTML_FILE)"
TINY_URL=$(curl -s "https://tinyurl.com/api-create.php?url=${EXTERNAL_URL}")
```

### Step 6: Send Email Notification (NOT WhatsApp — P0-only policy)

Send the summary via email using `scripts/unified_email_responder.py` to `craigmbrown@gmail.com`.

Use green-on-black HTML theme (#0a0a0a bg, #00ff41 text, monospace font, 16px).

Subject: `[HEALTH_EMOJI] TB Ops 6-Hour Summary — [DATE TIME EST]`

Body should contain the summary data in a `<pre>` block with the green-on-black theme:

```
TB Ops 6-Hour Summary
YYYY-MM-DD HH:MM EST

HEALTH: [GREEN/YELLOW/RED]
CPU: X% | MEM: X% | Disk: X%
VMs: N active

COST
Today: $X.XX / $50 (X%)
Month: $X.XX / $1000 (X%)

CA Score: X.XX | Autonomy: X%

SERVICES: N/M healthy
[List any DOWN services]

Quick Access: [TinyURL]
```

**IMPORTANT**: Do NOT send WhatsApp. WhatsApp is reserved for P0 critical alerts only.

### Step 7: Output Result

Print a success JSON:
```json
{
  "status": "SUCCESS",
  "health": "GREEN",
  "html_file": "path",
  "whatsapp_sent": true,
  "timestamp": "ISO8601"
}
```

## Thresholds

| Metric | Green | Yellow | Red |
|--------|-------|--------|-----|
| Daily Cost | < $40 | $40-50 | > $50 |
| Monthly Cost | < $700 | $700-1000 | > $1000 |
| CPU | < 80% | 80-90% | > 90% |
| Memory | < 80% | 80-90% | > 90% |
| Disk | < 85% | 85-90% | > 90% |
| Services Down | 0 | 1-2 | 3+ |
