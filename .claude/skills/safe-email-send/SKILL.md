---
name: safe-email-send
description: Pre-send verification gate for outbound emails — preview, From-name check, dry-run safety, BCC/reply-to validation. Use whenever sending external cold emails or first-touch outbound. Codifies the operator's "verify-before-send" rule from feedback_verify_external_email_before_send.md and the lessons from the Jesse Pollak bare-gmail incident.
allowed-tools: Read, Write, Edit, Bash
version: 1.0.0
---

# /safe-email-send

**Role:** You are the outbound-email pre-send gate — you run the verification checklist (render, From display-name, light-mode, BCC/reply-to) and return a go/no-go before `--send` fires. You verify and gate only; you never send the email yourself.

**Output / Termination:** Return exactly one verdict — PASS (cleared to send) or BLOCK (with the failing check) — and stop. Do not draft or rewrite the email body.

Pre-send verification checklist for ANY outbound email — particularly external cold outreach. Codifies the operator's hard rule that every external email MUST be rendered, opened in a browser, light-mode-checked, and operator-approved before `--send` fires.

## When to invoke

- Sending a cold outreach email (RQ-150, GTM, partnership emails)
- First-touch email to any external recipient
- Bulk-sending a campaign batch (≥3 emails to external recipients)
- Sending from `babyproject418@gmail.com` or any non-default sender

Skip for: internal status emails to `craigmbrown@gmail.com` (those follow green-on-black theme and don't need the light-mode + browser-render gate).

## The 6-step gate

### Step 1 — Render the email to a file

```bash
TMP=/tmp/preview_$$.html
sed "s/{{recipient_email}}/$RECIPIENT/g" path/to/rendered.html > $TMP
echo "Preview at: $TMP"
```

### Step 2 — Verify From display name (NOT a bare gmail)

```bash
grep -i "^From:\|<strong>From:" $TMP | head -3
```

The From line MUST have a display name. Correct: `"Craig Brown — BlindOracle" <babyproject418@gmail.com>`. Wrong: `babyproject418@gmail.com`. The Jesse Pollak send broke this rule on 2026-05-13.

### Step 3 — Light-mode-check in a browser

```bash
# Operator opens preview file in their browser; checks:
# - text is dark on white (NOT green on black for external cold)
# - subject + body render correctly in default desktop Gmail style
# - all images/links work
```

Internal status emails STAY green-on-black per `feedback_compose_email_before_send.md`. This light-mode rule applies to EXTERNAL recipients only.

### Step 4 — Confirm BCC + reply-to are right

For RQ-150 outbound:
- BCC: `craigmbrown@gmail.com` (NOT CC — light-mode rendering rule, set 2026-05-13)
- Reply-To: `babyproject418@gmail.com`
- From account: `babyproject418`

Generic rule: never CC operator on external cold emails (exposes the audit channel). BCC keeps it private.

### Step 5 — Dry-run guard

NEVER send a real email during a "dry-run" verification. If your script has a `--dry-run` flag, it should:
- Print the rendered body to stdout OR
- Route the SMTP send to a test inbox (e.g., `craigmbrown+drytest@gmail.com`)
- Return success without hitting the real recipient

If unsure whether `--dry-run` is wired correctly: read the script first. The dry-run-sent-real-email incident during a spam-diagnosis session is the canonical anti-pattern.

### Step 6 — Operator confirmation, then send

```bash
read -p "Confirm send to $RECIPIENT? [y/N] " CONFIRM
[ "$CONFIRM" = "y" ] || exit 1

python3 gmail_manager.py send \
    --from babyproject418@gmail.com \
    --to "$RECIPIENT" \
    --bcc craigmbrown@gmail.com \
    --reply-to babyproject418@gmail.com \
    --subject "$SUBJECT" \
    --body "(see HTML body)" \
    --body-file $TMP
```

## Backfill-specific rule

When backfilling email events into CRM/state from `send_log.jsonl`:
- Preserve the ORIGINAL `timestamp` from the log entry
- NEVER stamp with `_now_iso()` — that hides historical age from sequencers and downstream cron jobs
- Fixed in `scripts/outbound_crm.py::backfill` 2026-05-14 after RQ-150 D+14 sequencer broke because backfilled "sent" stages all had today's timestamp

## Tooling

- `scripts/paypal_invoice_helper.py` — for invoicing flows; honors the same gates
- `gmail_manager.py send --bcc --reply-to --body-file` — primary send tool
- `gtm/drafts_20260514/outbound_25_rendered/send_day1.sh` — reference implementation of this skill applied to a batch

## Anti-patterns this skill prevents

| Incident | Date | What broke | Rule that catches it |
|---|---|---|---|
| Jesse Pollak bare-gmail | 2026-05-13 | From field showed `babyproject418@gmail.com` (no display name) → looked like spam | Step 2 |
| Real email during dry-run | session-specific | Spam-diagnosis session sent a real "test" email | Step 5 |
| Backfill stamped-now | 2026-05-14 | All backfilled CRM `sent` stages had today's ts; D+14 sequencer broke | Backfill rule |
| CC operator on cold email | 2026-05-13 | Recipient saw audit address in CC | Step 4 |
| Green-on-black to external | 2026-05-13 | Light-mode Gmail rendered black text on dark bg → invisible | Step 3 |
