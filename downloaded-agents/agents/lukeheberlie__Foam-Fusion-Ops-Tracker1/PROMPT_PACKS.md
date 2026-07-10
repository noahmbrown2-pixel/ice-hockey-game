# Agent Prompt Packs

**Version:** 1.0 — 2026-05-31
**Purpose:** Compress repeated instructions into named packs. When a prompt references a pack by name, all rules in that pack apply without re-stating them.
**Related:** `AGENT_ORCHESTRATOR.md`, `AGENT_ACTIVATION_MATRIX.md`, `AGENT_PROGRESSIVE_CONTEXT_PROTOCOL.md`, `AGENT_MISSION_PACKS.md`

---

## What a Prompt Pack Is

A prompt pack is a named set of rules, constraints, and required outputs that applies to a specific task class. When a prompt references a pack by name (e.g., "apply Invoice Import Safety Pack"), every rule in that pack is active for the task — without the prompt having to re-state them.

Prompt packs are not agent packs (`AGENT_MISSION_PACKS.md`). Agent packs define which agents + docs to load. Prompt packs define what rules and constraints Claude must follow during execution.

---

## When to Use Prompt Packs

Reference a prompt pack when:
- The same class of rules has appeared in 3+ prompts
- A future prompt would require 10+ lines of constraints that are identical to a prior prompt
- A task is in a known high-risk category that always requires the same constraints

Do NOT use a prompt pack when:
- The task is a one-off with unique constraints
- The pack's rules would conflict with the specific task constraints
- Referencing a pack would hide task-specific forbidden actions that need to be stated explicitly

**Rule:** When a pack is referenced, read this file to load the full pack rules. Do not assume from pack name alone.

---

## Pack Template

```
## Pack [N] — [Name]

**Use when:** [specific trigger condition]
**Does NOT apply when:** [explicit exclusions]

### Required Context
[what must be read or known before the task starts]

### Required Agents
[agent list with activation reason]

### Required Checks
[validation and verification steps that must run]

### Forbidden Actions
[explicit list of what is not allowed under this pack]

### Final Report Requirements
[what the final report must include when this pack is active]
```

---

## Pack 1 — Standard No-Push Runtime Batch Rules

**Use when:** Any runtime code batch where the commit is local-only and the user has not yet said "PUSH THIS BATCH."
**Does NOT apply when:** The task is docs-only (use Pack 2); the user has explicitly said "PUSH THIS BATCH" (use Pack 5).

### Required Context
- Confirm `git status --short` is clean before starting
- Confirm `git log --oneline origin/main..HEAD` shows only the intended uncommitted work
- Read allowed and forbidden files declared in the task prompt

### Required Agents
- `oversight-build-controller` — orchestrates build, enforces Spider Web Rule, produces final delivery report
- Domain specialists as declared in the Orchestrator Card

### Required Checks
- `npx vitest run` — all tests pass
- `NODE_OPTIONS=--max-old-space-size=4096 npx tsc --noEmit --skipLibCheck` — zero TypeScript errors
- `npx next lint` — zero lint errors
- `NODE_OPTIONS="--max-old-space-size=4096" npm run build` — clean build
- `git diff --name-only` — confirms only allowed files changed

### Forbidden Actions
- `git push` — forbidden under any condition in this pack
- Starting the next batch after this one
- Creating new migrations without user direction
- Editing `.env` or any env file
- Editing `prisma/schema.prisma` unless explicitly authorized in task
- Adding `console.log` or debug statements to changed files
- Hardcoding any tenant ID, customer ID, site ID, or portal token

### Final Report Requirements
- Files changed (list with one-line description each)
- Runtime behavior changed: YES / NO (describe if YES)
- Validation: tsc / lint / build / vitest — result for each
- Commit hash (from live `git rev-parse HEAD`)
- Working tree: clean
- Pushed: NO
- Deployment triggered: NO

---

## Pack 2 — Standard Docs-Only Batch Rules

**Use when:** The entire batch touches only `.claude/agents/*.md`, `docs/**`, or `evals/**` files. No runtime code. No schema. No migrations.
**Does NOT apply when:** Any app code file, component, schema, or env file is in scope (use Pack 1).

### Required Context
- Confirm `git status --short` is clean before starting
- Read the existing files that will be edited before making changes (do not edit files that have not been read)
- Confirm `git diff --name-only` will show only docs/agent files before committing

### Required Agents
- None required for pure docs edits
- `oversight-build-controller` optional for multi-file governance changes
- `release-manager` if the batch is ready for push review (Agent-Only Change Rule applies — skip tsc/build)

### Required Checks
- `git diff --name-only` — confirm only `.claude/agents/`, `docs/`, or `evals/` files changed
- `git diff --check` — no whitespace issues
- No TypeScript, lint, or build required (docs-only exception)
- Read each file before editing (Write tool may not be used without a prior Read)

### Forbidden Actions
- Editing any `app/**`, `components/**`, `prisma/**`, `package.json`, or env file
- Creating new agent files without being explicitly authorized in the task
- Editing existing agent files unless explicitly listed as allowed
- `git push` — forbidden until explicit "PUSH THIS BATCH"

### Final Report Requirements
- Files created/edited (list with one-line description each)
- What each file does
- Validation: `git diff --name-only` result; `git diff --check` result
- Commit hash
- Working tree: clean
- Pushed: NO
- Deployment triggered: NO

---

## Pack 3 — Invoice Import Safety Pack

**Use when:** Task touches any of: `app/api/import/vendor-invoice/`, `app/inventory/import-vendor-invoice/`, `InvoiceImportSession`, `InvoiceLineProposal`, `VendorInvoice`, `VendorInvoiceLine`, `ProductCost`, `SiteInventoryTransaction` (invoice path), `duplicateFingerprint`, `expiresAt` (session), or any related docs or actions.
**Does NOT apply when:** The task is read-only analysis of invoice import code with no changes.

### Required Context
- Read `MISTAKE_MEMORY_LIBRARY.md` — retrieve M-001, M-002, M-003, M-004, M-005 (all invoice import cards)
- Read `MUTATION_CONTRACTS.md` Contract 13 (`commitApprovedVendorInvoice`)
- Read `SECURITY_INVARIANTS.md` INV-INV-001 through INV-INV-004
- Read the specific files being changed

### Required Agents
- `accounting-integrity-reviewer` — primary domain reviewer; Pack 11 always active
- `tenant-security-reviewer` — session/proposal ownership; INV-TENANT-002
- `ai-safety-import-reviewer` — AI/OCR field separation; ai* vs confirmed* fields
- `source-of-truth-data-auditor` — item type classification; resolver correctness
- `release-manager` — when batch is ready for push

### Required Checks

**M-001 (Proposal Load Failure):**
- If server review state fails to load, the final action (Import/Commit) must be disabled — not silently enabled

**M-002 (UI Approval Is Not Enforcement):**
- The commit route must re-query `InvoiceLineProposal` by `proposalId + sessionId + tenantId` from DB at commit time
- `confirmed*` fields sourced from DB — not from client payload
- Proposals with `status ≠ APPROVED` or `confirmedItemType = UNCLASSIFIED` must block commit

**M-003 (Non-Inventory Lines):**
- `SERVICE`, `FREIGHT`, `TAX`, `DISCOUNT`, `LABOR`, `EQUIPMENT` lines must create `VendorInvoiceLine(productId: null)`
- These lines must NOT create `ProductCost`, `SiteInventoryTransaction`, or `upsertInventorySnapshot`

**M-004 (Race Condition):**
- Session status → `COMMITTED` must be the FIRST write in the `$transaction`
- Use `updateMany({ where: { id, tenantId, status: "PENDING_REVIEW" } })` — check `count === 1` — throw on failure

**M-005 (Business Identity):**
- `duplicateFingerprint` must use business identity: `SHA256(tenantId|vendorName|invoiceNumber|grandTotal)`
- `documentKey` (upload identity) is not sufficient for duplicate detection

**Canary checks (must be listed in Outcome Receipt):**
- C-INV-001: Direct commit without sessionId blocked
- C-INV-002: Wrong-tenant session blocked
- C-INV-003: PENDING/REJECTED/UNCLASSIFIED proposal blocked
- C-INV-004: Expired session blocked
- C-INV-005: Duplicate fingerprint blocked
- C-INV-006: Same-session double-submit allows only one success
- C-INV-007: Non-inventory line records detail only

### Forbidden Actions
- Writing to any `ai*` field from an approval or commit action
- Sourcing `confirmed*` values from client payload (must come from DB)
- Removing the `sessionId` requirement from the commit route
- Skipping the `accounting-integrity-reviewer` verdict
- Proceeding if any canary from C-INV-001 through C-INV-007 fails

### Final Report Requirements
- Files changed
- M-001 through M-005 rules applied: YES / NO per card
- Canary checks: C-INV-001 through C-INV-007 — PASS / FAIL / DEFERRED per mission
- `accounting-integrity-reviewer` verdict: CLEAR / NEEDS REVIEW / BLOCKED
- `tenant-security-reviewer` verdict: SAFE / NEEDS FIX / BLOCKED
- `ai-safety-import-reviewer` verdict: CLEAR / NEEDS REVIEW / BLOCKED
- Validation: tsc / lint / build / vitest — result for each
- Commit hash
- Working tree: clean
- Pushed: NO (unless PUSH THIS BATCH received and Pack 5 applied)

---

## Pack 4 — Protected Mutation Validation Pack

**Use when:** The task adds a new DB write (`create`, `update`, `updateMany`, `upsert`, `delete`) to a route or action that previously had zero DB writes in its happy path (Gate 3.5 trigger). Also applies when changing the role gate, tenant scope, or transaction boundary of any existing protected mutation.
**Does NOT apply when:** The write is best-effort observability-only with no downstream enforcement dependency.

### Required Context
- Read `MUTATION_CONTRACTS.md` to check if a contract already exists for this mutation
- Read `SECURITY_INVARIANTS.md` for the relevant domain (INV-TENANT-*, INV-INV-*, INV-ORDER-*, etc.)
- Read `NEGATIVE_PERMISSIONS.md` — confirm the mutation does not violate any "may never" rule
- Read the specific route/action being changed

### Required Agents
- `tenant-security-reviewer` — ownership verification; `requireSession()` before any try/catch
- `source-of-truth-data-auditor` — if the new write involves financial, inventory, or resolver fields
- `accounting-integrity-reviewer` — if the write touches Pack 11 domain
- `oversight-build-controller` — implements the fix

### Required Checks

**Permission Sentence:**
State the full Permission Sentence before implementing:
> Only [role(s)] can [action] on [resource] within [scope] when [state] is true, and [audit] records the result.

**Source-of-truth declaration:**
Which DB field is authoritative for each value being written? List field → source.

**Tenant scope declaration:**
- `tenantId` sourced from `session.user.activeCompanyId` or `portalLink.tenantId` — never client input
- Every client-submitted record ID verified with `findFirst({ where: { id, tenantId } })`

**Role gate declaration:**
- Minimum required role stated; NEGATIVE_PERMISSIONS.md checked; AI_SYSTEM not granted approval

**Audit log declaration:**
- AuditLog event type, required fields, and transaction boundary confirmed

**Failure behavior:**
- If the new write fails: does the route return 2xx (fail-open) or 4xx/5xx (fail-closed)?
- Is the write REQUIRED for the response to be correct, or BEST-EFFORT?
- If required and downstream-enforced: must be fail-closed

**Idempotency:**
- Is it safe to run this mutation twice? If not: idempotency key or claim lock required

**Mutation Contract:**
- Does a contract exist in `MUTATION_CONTRACTS.md`? If yes: update it. If no and BR-3+: create it.

### Forbidden Actions
- Adding a new DB write to a protected route without a Permission Sentence
- Using client-submitted `tenantId`
- Sourcing a `confirmed*` value from client payload instead of DB
- Using `findUnique` without `tenantId` filter for client-submitted IDs
- Skipping the audit log for a protected mutation
- Returning 2xx when a REQUIRED write fails and downstream enforces that write

### Final Report Requirements
- Permission Sentence (full text)
- Source-of-truth declaration (field → source for each written field)
- Tenant scope confirmation
- Role gate confirmation
- Audit log fields confirmed
- Failure behavior: fail-open / fail-closed
- Idempotency key or N/A
- Mutation Contract: updated / created / not required (with reason)
- Validation: tsc / lint / build — result for each

---

## Pack 5 — Release Manager Review Pack

**Use when:** The user requests a release-manager review OR the user says "PUSH THIS BATCH."
**Does NOT apply when:** The task is still in active development (batch not yet complete).

### Required Context
- **Always read live state — never from summary memory:**
  - `git status --short`
  - `git log --oneline origin/main..HEAD`
  - `git diff --name-only origin/main..HEAD`
  - `git rev-parse HEAD` and `git rev-parse origin/main`
- Check whether context compaction occurred since the last SAFE TO PUSH LATER verdict (if yes: verdict has expired; rerun all checks)
- Read `AGENT_RELIABILITY_SCORECARD.md` to determine if scorecard is required for this batch

### Required Agents
- `release-manager` — primary
- `oversight-build-controller` — only if a blocking code fix is required

### Required Checks

**Context Resume Check (first):**
- Did compaction/summary/long pause occur since the SAFE TO PUSH verdict? If YES: verdict expired; rerun all live git checks

**Git State:**
- `git branch --show-current` — on `main`?
- `git log --oneline origin/main..HEAD` — commits to push (empty = nothing to push, stop)
- `git diff origin/main --name-only` — expected files only?
- No `.env`, secrets, or credential files in diff

**Security Gates 1–4** (per `release-manager.md`):
- Gate 1: Source Exposure — tenantId session-derived; client IDs ownership-verified; requireSession() before try/catch; no error leaks model name
- Gate 2: Blast radius classified; invariants not violated; mutation contract exists for BR-3+; negative permissions not violated
- Gate 3: Concurrency/stale-write addressed; rollback plan documented
- Gate 4: Security control matrix rows present for new routes/roles/mutations

**App code checks (skip if agent-only diff):**
- `npx vitest run` — pass?
- `npx tsc --noEmit` — clean?
- `npx next lint` — clean?
- `npm run build` — clean?

**Scorecard check:**
- Required for Mode 3/4 work, Agent OS changes, Pack 11/12 activations
- Threshold: ≥31/40 (or ≥23/30 when no compaction)

**SAFE TO PUSH LATER / BLOCKED / NOTHING TO PUSH verdict:**
- Never push based on prior verdict if compaction occurred

### Forbidden Actions
- `git push` without explicit "PUSH THIS BATCH" from user
- Issuing SAFE TO PUSH LATER if any security gate fails
- Issuing SAFE TO PUSH LATER based on summary memory — must be from live checks
- Running full tsc/build/lint for agent-only diffs (Agent-Only Change Rule applies)

### Final Report Requirements
Follow `release-manager.md` Required Output Format fields 1–26:
- Branch, Local HEAD (live), Remote HEAD (live), commits to push, files changed, untracked, .claude/ files, agent-only change, schema changed, env/secrets, hardcoded IDs, app code changed, checks required, vitest, TypeScript, lint, build, Prisma validate, push recommendation, deploy consequence, post-push plan, rollback path, source exposure review, confidence, evidence vs assumptions, remaining risks

**If "PUSH THIS BATCH" received:**
After push, report:
- Push result (remote output)
- New remote HEAD (live)
- Local/remote in sync: YES
- GitHub Actions: status for new deployment only
- Working tree: clean

---

## Pack 6 — Spider Web Rule Pack

**Use when:** Task adds or changes any route, server action, schema field, protected UI flow, accounting/inventory mutation, AI/import workflow, or multi-surface change.
**Does NOT apply when:** Docs-only change; single-field display-only UI change with no mutation path.

### Required Context
- Identify the change surface (route, action, schema field, UI trigger)
- Read the files being changed
- Check `MISTAKE_MEMORY_LIBRARY.md` for patterns matching this domain

### Required Agents
- `spider-web-qa-reviewer` — connected-path regression check
- `oversight-build-controller` — implements after trace is complete

### Required Checks

Answer all 9 Spider Web questions before committing:

| # | Question | Required answer |
|---|---|---|
| 1 | What sends this data? | Upstream producer: which client, route, or action calls this |
| 2 | What receives this data? | Downstream consumer: what reads the output |
| 3 | What DB fields are read/written? | Full mutation surface — list every model and field |
| 4 | What tenant/role rules apply? | Auth gate — which roles, which tenant scope, which invariants |
| 5 | What transaction/rollback behavior exists? | What is atomic together; what rolls back on failure |
| 6 | What audit log records it? | AuditLog event type and required fields |
| 7 | What UI/report/dashboard depends on it? | Frontend consumers that could break silently |
| 8 | What could silently break? | Non-obvious regression paths |
| 9 | What prior mistake pattern is similar? | Matching M-xxx from MISTAKE_MEMORY_LIBRARY.md |

**Safe-to-skip paths:**
List any of the 9 questions that are N/A for this change — with documented reason.

### Forbidden Actions
- Committing a protected workflow change without answering all applicable Spider Web questions
- Treating "small change" as a reason to skip the trace
- Skipping question 9 (mistake memory lookup)

### Final Report Requirements
- All 9 Spider Web answers (or N/A with reason for each skipped question)
- Connected paths: any silent breakage paths identified?
- Deferred risks: list paths identified but not fixed (must appear in Outcome Receipt)

---

## Pack 7 — Competitor / Product Strategy Pack

**Use when:** Task involves public website positioning, competitor research, product roadmap, pricing strategy, enterprise buyer framing, or any buyer-facing language about OverSight's capabilities.
**Does NOT apply when:** Task is internal ops UI, admin UI, or any surface not visible to prospects or buyers.

### Required Context
- Read `docs/market/COMPETITOR_RESEARCH_PROTOCOL.md` before any competitor research
- Read `docs/market/COMPETITOR_RESEARCH_INDEX.md` for existing evidence cards
- Read `docs/strategy/BUILD_COPY_AVOID_WATCH.md` for positioning guard rails
- For any competitor: require a `COMPANY_EVIDENCE_CARD_TEMPLATE.md` entry before deep analysis

### Required Agents
- `enterprise-buyer-strategy-reviewer` — positioning, claim accuracy, buyer trust
- `legal-compliance-risk-reviewer` — any public/customer-facing security, compliance, or AI capability claim (Pack 12)
- `ui-ux-product-designer` — copy and layout quality

### Required Checks

**Product system declaration:**
Which OverSight module or system does this positioning represent?

**User / persona:**
Which buyer type is this for? (Car wash owner / GM / CFO / IT / Operations)

**Business outcome:**
What measurable outcome does this claim or feature deliver to that buyer?

**Competitor classification (per company):**

| Classification | Meaning |
|---|---|
| Ignore | Not a real threat to OverSight's target buyer |
| Match | Must reach feature parity |
| Beat | Should exceed on this dimension |
| Differentiate | Take a different angle — don't compete directly |
| Defer | Not in current product scope |

**Claim control status (per claim):**

| Status | Meaning |
|---|---|
| Live | Feature exists and works in production |
| In build | Committed to current or next batch |
| Roadmap | Planned but not committed |
| Researching | Under evaluation |
| Not supported | Explicitly not in scope |

**Overclaiming check:**
- No claim about a Roadmap or Not Supported feature may be presented as Live
- No security/compliance claim without `legal-compliance-risk-reviewer` CLEAR verdict
- No AI capability claim without a Proof Type defined

### Forbidden Actions
- Making buyer-facing security or compliance claims without legal review (Pack 12 blocker)
- Researching more than 3 competitor companies in a single batch
- Inferring URLs or features for companies with no confirmed official source (mark NOT FOUND)
- Using `[INFERRED]` evidence as `[FACT]` in any positioning document

### Final Report Requirements
- Product system(s) covered
- Buyer persona(s) addressed
- Competitor classifications (company → Ignore/Match/Beat/Differentiate/Defer)
- Claims with status (Live/In build/Roadmap/Researching/Not supported)
- Legal review verdict (CLEAR / NEEDS REVIEW / BLOCKED)
- No overclaiming: confirmed YES

---

## Pack 8 — Enterprise Trust Pack

**Use when:** Task involves enterprise buyer trust, security posture documentation, auditability claims, data ownership, AI governance, SOC 2 / compliance readiness, SSO/SCIM, rollout risk, or any trust evidence intended for enterprise buyers or procurement reviewers.
**Does NOT apply when:** Task is internal feature work with no external trust documentation impact.

### Required Context
- Read `docs/security/enterprise-security-overview.md`
- Read `docs/security/vendor-security-questionnaire-map.md`
- Read `docs/security/tenant-isolation-model.md`
- Read `docs/security/audit-logging-model.md`
- Read `docs/security/access-control-rbac.md`

### Required Agents
- `tenant-security-reviewer` — tenant isolation accuracy
- `legal-compliance-risk-reviewer` — any compliance claim (Pack 12)
- `enterprise-buyer-strategy-reviewer` — buyer positioning, trust narrative
- `source-of-truth-data-auditor` — if data export or accounting claims are involved

### Required Checks

**Tenant isolation claim:**
- Can enterprise buyers verify that their data is isolated from other tenants? Confirm via ALS middleware + Prisma middleware chain + row-level ownership verification
- Is there a written tenant isolation model? (`docs/security/tenant-isolation-model.md`)

**Role model claim:**
- Which roles exist? (ADMIN, OPS, PORTAL_CUSTOMER, INSTALL_CREW, INSTALL_MANAGER, DRIVER, ACCOUNTING, EMPLOYEE)
- Is RBAC documented? (`docs/security/access-control-rbac.md`)

**Auditability claim:**
- Which mutations write AuditLog? Is the audit log schema documented? (`docs/security/audit-logging-model.md`)
- Can an enterprise buyer export or review audit logs?

**Data export / ownership claim:**
- Can the buyer export their data on request?
- Is data portability addressed in the retention policy? (`docs/storage-retention-strategy.md`)

**AI authority boundary claim:**
- AI-generated fields (`ai*`) are immutable after parse
- AI may not write to protected accounting/inventory records without human approval gate
- AI autonomy level for all protected workflows: ≤L2
- All AI claims must reference this boundary explicitly

**Rollout risk check:**
- Any claim that triggers a compliance requirement (SOC 2, GDPR, HIPAA, etc.) must be reviewed before being made public
- `legal-compliance-risk-reviewer` verdict required for any compliance statement

**Proof needed before public claim:**
List each claim and its proof type:
- Tenant isolation: code review + ALS middleware trace
- Auditability: AuditLog schema + sample events
- AI governance: code review showing human approval gate
- Data ownership: retention policy doc + export capability

### Forbidden Actions
- Publishing a compliance claim (SOC 2, GDPR, etc.) without `legal-compliance-risk-reviewer` CLEAR verdict
- Asserting AI "never makes autonomous decisions" without referencing the specific approval gate in code
- Presenting OverSight as "enterprise-ready" without confirming tenant isolation, RBAC, and audit trail are documented and accurate
- Making claims about features that are Roadmap or Not Supported status (per Pack 7)

### Final Report Requirements
- Trust claims made (list)
- Proof type for each claim (code review / doc reference / live audit log)
- Tenant isolation: confirmed YES / NO (with evidence)
- Role model: documented YES / NO
- Auditability: documented YES / NO
- AI authority boundary: documented YES / NO
- Legal review verdict: CLEAR / NEEDS REVIEW / BLOCKED
- Overclaiming check: none found / found (list)
