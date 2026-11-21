# Approval Workflow Rules

1. **Emails = full rich HTML always**, minimal truncation, green-on-black theme (#0a0a0a bg, #00ff41 text), 16-28px fonts for mobile
2. **If user asked for it, it's approved** - don't re-ask for confirmation
3. **Only request approval when**: DITD pipeline execution (building/deploying code). Analysis/research emails need NO approval.
4. **Email reply = approval**: "I approve" / "I approve the building of this" in email reply = DITD execution approval. Treat as green light immediately.
5. **If plan changes**: keep user in the loop (notify, don't re-approve everything)
6. **Multiple approvals = ONE consolidated email** with link to dashboard
7. **Dashboard = Q/A form**: multi-choice options + text feedback per question (see design-qa-interactive-form-v3 pattern)
8. **Auto-capture responses**: localStorage + server POST to `http://34.58.12.50:8081`
9. **Generator scripts**: `scripts/approval_dashboard_generator.py` (general), `scripts/plan_review_dashboard.py` (APOS plan QA review)
10. **GH issues: draft allowed for pending plans** - Draft GitHub issues (labeled `pending-approval`) may be created proactively for pipeline visibility. Only convert to open/active after explicit approval or auto-approval (per rules 2-4). Applies to Claude AND all automated scripts.
11. **Issue content must be useful and accurate** - No filler, no hallucinated details. Every field (title, body, labels) must contain verified, actionable information.
12. **Completion email**: Always send success/failure email at end of DITD execution.
13. **APOS plans: P0/P1 require QA review, P2+ auto-approve** - P0/P1 plans go to `pending_review` state requiring operator QA with 3 mandatory questions. P2/P3/P4 plans auto-approve and execute immediately (reported in morning brief for visibility). QA dashboard emailed 3x/day (09:00, 15:00, 21:00 UTC) for P0/P1 plans only. Cron: `scripts/plan_review_dashboard.py`.
14. **Approval-to-MMA Bridge** - `approval-mma-bridge.service` polls every 30s for newly approved plans and submits to MMA Job Server immediately. No cron delay.

## Coding Guidelines
See `.claude/rules/karpathy-coding-guidelines.md` for general coding behavior (think before coding, simplicity first, surgical changes, goal-driven execution).
