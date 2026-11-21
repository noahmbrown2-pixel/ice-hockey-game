---
paths:
  - "scripts/unified_email_responder.py"
  - "scripts/*email*"
  - "gmail_manager.py"
---

# Email Communication Patterns

## Two-Tier Email System

| Tier | Script | Use Case |
|------|--------|----------|
| Basic | `gmail_manager.py` | Simple send, search, unread listing (no threading) |
| Threaded | `scripts/unified_email_responder.py` | Replies needing threading, full HTML templates |

**Rule**: Always use `unified_email_responder.py` for replies that need threading or rich HTML formatting.

## Theme (Mandatory)

All outbound emails MUST use the green-on-black theme:
- Background: `#0a0a0a`
- Text: `#00ff41`
- Font sizes: 16-28px (mobile readability)
- Full rich HTML always, minimal truncation
- Never plain text for research/report emails

## Multi-Account Support

| Account | Role |
|---------|------|
| `craigmbrown@gmail.com` | Primary (default for all outbound) |
| `babyproject418@gmail.com` | Secondary (TB system account) |

## OAuth

- Token: `~/.config/google_api/gmail_full_token.pickle`
- Re-auth: `python3 scripts/gmail_oauth_setup.py`
- Scopes: full Gmail access (read, send, modify, labels)

## Key Constraints

- **Never expose raw IPs** in emails -- always use `craigmbrown.com` domain URLs
- Research/analysis emails need **NO approval** (per @.claude/rules/approval-workflow.md)
- DITD execution emails require approval
- Completion emails: always send success/failure at end of DITD execution
