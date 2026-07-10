---
name: pr-comments
description: Address every unresolved review comment on a GitHub pull request — one commit per comment, reply with the SHA, resolve the thread. Trigger phrases — "address PR comments", "address review comments", "fix review feedback", "respond to PR review", "/pr-comments", "address the comments on PR #123", "handle the review on this branch". Skip for — opening a new PR (use /pr), editing a PR description (use `gh pr edit`), responding to PR conversations that aren't review feedback (e.g. CI bot comments), or branches with no open PR.
---

> **User-question protocol:** Whenever this skill needs the user to pick between options, confirm an action, or answer a multiple-choice prompt, you MUST call the `AskUserQuestion` tool to render a proper interactive picker. Do NOT print numbered options as plain text and wait for the user to type a number — that produces a degraded UX. Free-form questions (open-ended typing) may be asked in prose, but any time you would write "1) … 2) … 3) …", use `AskUserQuestion` instead.


# pr-comments

Resolve every reviewer thread on a PR with a per-comment commit, a reply, and a resolved thread. Reviewer ends with zero unresolved threads and a clear audit trail.

---

## Arguments

- `reply_lang=en|ja` — force all replies into this language. Default behavior: mirror the reviewer's comment language per thread (Japanese comment → ja reply, English → en reply).
- `auto=true` — skip the Phase 4 approval gate and execute every planned action without confirmation. Default: confirm the plan with the user before any commit/reply/resolve fires. Intended for AFK / unattended runs where a wrapper has already vetted the workflow.

---

## Phase 1 — Locate the PR

Determine the target PR from the user's argument or current branch:

```bash
# explicit number/URL provided
gh pr view <number-or-url> --json number,headRefName,baseRefName,url,state,isDraft

# current branch
gh pr view --json number,headRefName,baseRefName,url,state,isDraft

# issue number provided — find linked PR
gh issue view <number> --json closedByPullRequestsReferences
```

**Exit conditions:**
- PR found and `state=OPEN` → continue.
- No PR for current branch → ask the user for a PR number/URL; do not guess.
- PR is `MERGED` or `CLOSED` → stop and ask the user to confirm.

Checkout the PR branch if not already on it: `gh pr checkout <number>`.

---

## Phase 2 — Fetch ALL comments

Two distinct APIs. Run both — missing one means missing comments.

```bash
PR=<number>
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner)  # e.g. owner/repo
OWNER=${REPO%/*}
NAME=${REPO#*/}

# Inline (review) comments — anchored to a file/line
gh api "repos/$REPO/pulls/$PR/comments" --paginate \
  --jq '.[] | {id, user: .user.login, path, line, body, in_reply_to_id, commit_id, created_at, html_url}'

# PR-level issue comments (top-level conversation, not anchored)
gh api "repos/$REPO/issues/$PR/comments" --paginate \
  --jq '.[] | {id, user: .user.login, body, created_at, html_url}'

# Review threads with resolved state (GraphQL — needed to skip already-resolved)
gh api graphql -f query='
  query($owner:String!,$repo:String!,$pr:Int!){
    repository(owner:$owner,name:$repo){
      pullRequest(number:$pr){
        reviewThreads(first:100){
          nodes{ id isResolved isOutdated comments(first:50){ nodes{ id databaseId body path line author{login} } } }
        }
      }
    }
  }' -f owner=$OWNER -f repo=$NAME -F pr=$PR
```

**Build a worklist** of threads where `isResolved=false`. Skip resolved threads. Note `isOutdated=true` threads — the anchor line may have moved; verify before acting.

**Pagination caps**: `reviewThreads(first:100)` truncates at 100 threads, and `comments(first:50)` truncates at 50 per thread. For larger PRs, also request `pageInfo{hasNextPage endCursor}` and re-query with `after:$cursor` until `hasNextPage=false`. If the first page already returns `hasNextPage=true`, you have not seen all threads — do NOT proceed to Phase 3 with a partial worklist.

---

## Phase 3 — Plan (fan out subagents in plan mode)

For each unresolved thread, in order from oldest to newest, **dispatch `pr-comment-resolver` with `mode: plan`** (via `Agent(subagent_type=pr-comment-resolver)`). The subagent reads the file, classifies the comment, drafts a fix summary + reply text, and returns a plan record. It does NOT commit, reply, or resolve in this phase.

**Pass to the subagent** (per invocation):

```
PR_NUMBER: <number>
REPO: <owner/repo>
BASE_REF: <base branch name>
mode: plan

THREAD:
  threadNodeId: <GraphQL node id from Phase 2>
  isOutdated: <bool>
  rootCommentId: <REST id of the first comment — for in_reply_to>
  rootCommentDatabaseId: <database id>
  path: <file path or null>
  line: <line number or null>
  author: <github login>
  body: <comment markdown>
  isInline: <true for file-anchored, false for PR-level>
  reply_lang: <"en" | "ja" — only when the user passed reply_lang=...; omit otherwise to let the subagent detect from the comment language>
```

**The subagent returns a plan record:**

```json
{
  "status": "planned" | "cannot-plan" | "error",
  "threadNodeId": "<id>",
  "rootCommentId": "<id>",
  "classification": "change_request" | "question" | "nit" | "stale" | "declined",
  "plannedAction": "fix-and-reply" | "reply-only" | "decline",
  "fixSummary": "<one-line description of the code change, or null if no fix>",
  "filesToTouch": ["<path>"],
  "draftReply": "<exact body to send in Phase 5 — use {sha} as placeholder for the commit SHA in fix-and-reply replies>",
  "replyLang": "en" | "ja",
  "notes": "<one-liner for the parent's report>"
}
```

Collect plan records into a worklist. If any record returns `status: "error"`, surface to the user immediately and stop. `status: "cannot-plan"` records (file missing, anchor unresolvable) are carried forward to Phase 4 as informational — they cannot be approved/executed.

**Why fan out?** Each plan call is a self-contained read + reasoning over one comment and its file context. Doing this inline would accumulate file-read context in the parent's window across all threads; per-thread isolation keeps the parent at a constant size regardless of PR size.

**Why sequential?** Plan mode is read-only, so parallel fan-out is technically safe. Sequential is simpler to reason about and avoids inflating gh API rate-limit pressure. For 30+ threads where throughput matters, parallel plan calls are acceptable — execute (Phase 5) MUST stay sequential.

---

## Phase 4 — Approval gate

**If the skill was invoked with `auto=true`, skip this phase entirely** and proceed to Phase 5 with every `status: "planned"` record.

Otherwise, present the plan worklist to the user via `AskUserQuestion`. Show one block per thread, including the full draft reply so the user can vet wording before it lands on the PR:

```
#1 src/utils/user.ts:42 [change_request] → fix-and-reply [ja]
   fix:   extract formatUserName() helper from line 42
   reply: {sha} で修正しました — formatUserName() に切り出しました。

#2 README.md:10 [nit] → decline [en]
   reply: Preference disagreement — leaving as is.

#3 src/api.ts:88 [question] → reply-only [en]
   reply: Memoization would help, but the input set is unbounded — see comment for tradeoff.
```

Offer three options:

- **Approve all** — execute every `planned` thread as-is.
- **Approve subset** — user picks thread numbers to execute (e.g. `1,3`). Unpicked threads remain unresolved.
- **Abort** — stop the skill. Nothing was written; no cleanup needed.

If `cannot-plan` records exist, list them separately and note that they require manual handling (the subagent could not derive a plan; the user may need to inspect the thread directly).

---

## Phase 5 — Execute (fan out subagents in execute mode)

For each approved thread, in order from oldest to newest, **dispatch `pr-comment-resolver` with `mode: execute`**. Pass the plan record produced in Phase 3 — the subagent does NOT re-classify; it applies the agreed `fixSummary` and sends `draftReply` (with `{sha}` substituted post-commit).

**Pass to the subagent** (per invocation):

```
PR_NUMBER: <number>
REPO: <owner/repo>
BASE_REF: <base branch name>
mode: execute

THREAD:
  threadNodeId, rootCommentId, rootCommentDatabaseId, path, line, isInline
  (same fields as Phase 3 input)

PLAN:
  classification: <from Phase 3>
  plannedAction: <from Phase 3>
  fixSummary: <from Phase 3>
  filesToTouch: <from Phase 3>
  draftReply: <from Phase 3 — sent verbatim after {sha} substitution>
  replyLang: <from Phase 3>
```

**The subagent's contract in execute mode** (see `pr-comment-resolver`):
- Trust the plan. Do NOT re-classify, do NOT rewrite `draftReply` text.
- `fix-and-reply` → apply the fix, commit (one commit per thread), substitute `{sha}` in `draftReply`, reply, resolve.
- `reply-only` → reply with `draftReply` as-is, resolve.
- `decline` → reply with `draftReply` as-is, do NOT resolve.
- Return a structured execute record.

**Why sequential, not parallel?** All threads commit to the same branch. Parallel commits race on `git index.lock` and blow up the one-commit-per-comment audit trail.

After each subagent returns, record its result. If `status: "error"`, surface immediately and stop — do not auto-retry. Threads that already succeeded stay committed/replied/resolved.

**Manual fallback** — if the subagent isn't available or the thread is unusually complex (multi-comment back-and-forth requiring context the subagent can't be briefed with), fall back to running plan + execute inline:

### 5a. Ground the fix
- Read the file at the comment's `path` and `line`.
- Run `git log <base>..HEAD -- <path>` to see what this branch already changed there.
- If the anchor is stale (line shifted, code rewritten), re-read surrounding context and confirm the comment still applies. If it doesn't, note this for the reply (don't silently skip).

### 5b. Classify and decide
- **Change request, question, or nit?** A question may not want code touched at all; a nit may want acknowledgement, not action.
- **Outcome that satisfies the reviewer?** Pick theirs, or push back explicitly.
- **Does the question imply a fix?** If reviewer asks "why not X?" and X is obviously better, the question IS the change request. If X is a tradeoff, answer and let them decide.
- **Is the nit worth a commit?** Trivial → fix. Stylistic disagreement → reply, decline, leave unresolved.

### 5c. Apply the fix (when needed)
Edit only what this comment is about. No drive-by refactors.

### 5d. Commit (one per addressed comment)
```bash
git add <files>
git commit -m "address review: <short summary> (#<thread-id-or-anchor>)"
```
One thread = one commit. Multi-file fixes for one comment still = one commit. No code change → no commit.

### 5e. Reply and resolve
```bash
# Inline reply — REST
gh api "repos/$REPO/pulls/$PR/comments" -f body="<reply text>" -F in_reply_to=<comment-id> -X POST

# Resolve the thread — GraphQL (use the thread node id from Phase 2)
gh api graphql -f query='mutation($id:ID!){ resolveReviewThread(input:{threadId:$id}){ thread{ id isResolved } } }' -f id=<thread-node-id>
```

Reply text:
- **Fixed**: one short sentence + commit SHA. Example: `Fixed in abc1234 — extracted to formatUserName().`
- **Question only**: answer directly.
- **Declined**: explain briefly; do NOT auto-resolve.

Reply language (manual fallback): mirror the reviewer's comment language. If `reply_lang` was passed, use it instead.

---

## Phase 6 — Push and verify

```bash
git push
```

**If the push is rejected** (non-fast-forward — common after the reviewer rebased main into the PR branch): STOP. Run `git fetch` and report the divergence to the user. Do NOT auto-`--force-with-lease` or auto-rebase — ask the user how they want to reconcile. Force-pushing during an active review can drop reviewer commits or invalidate review state.

Then verify zero unresolved, non-declined threads remain:

Re-run the Phase 2 `reviewThreads` GraphQL query and assert that every thread node has `isResolved=true` OR is on the declined-list reported above. Any other unresolved thread means a comment was missed — return to Phase 3 for it.

Report to the user: number of threads addressed, number of commits made, number of replies sent, language breakdown of replies (e.g. "8 en, 2 ja"), and any threads left intentionally unresolved (declined nits) with rationale.

---

## Phase 7 — Optional simplify pass

After all comment commits land and the push succeeds, offer to run `/simplify` on the cumulative diff to catch duplication or smell drift that may have been introduced across per-comment fixes.

Ask via `AskUserQuestion`:
- **Run /simplify** — review the cumulative diff and apply fixes for duplication / smell drift.
- **Skip** (recommended unless you noticed repeated patterns across threads).

Default to **Skip** if the user does not respond — do not auto-run. The user explicitly invoked `/pr-comments` to address review feedback; auto-running a separate skill produces a moving diff they didn't ask for.

---

## NEVER

- **NEVER bundle multiple comment fixes into one commit**
  **Instead:** One commit per addressed comment, even if commits touch the same file. Use the comment's gist in the subject.
  **Why:** The user picked one-commit-per-comment so reviewers can map each commit back to the thread that drove it. A combined commit destroys that audit trail.

- **NEVER reply without resolving (when you fixed it) or resolve without replying**
  **Instead:** Fix → commit → reply with the commit SHA → resolve. All four, in that order.
  **Why:** A resolved-but-silent thread reads as dismissive; a replied-but-unresolved thread leaves the reviewer wondering if you're still working on it.

- **NEVER act on a thread without checking it's still unresolved**
  **Instead:** Use the GraphQL `reviewThreads.isResolved` field from Phase 2; skip resolved threads entirely.
  **Why:** Re-fixing already-resolved comments creates noise commits and confuses the reviewer about what changed since their last pass.

- **NEVER skip the inline-comments API and rely on `gh pr view`**
  **Instead:** Hit both `pulls/:n/comments` (inline) AND `issues/:n/comments` (top-level). `gh pr view --comments` shows only the latter.
  **Why:** Inline review comments are the bulk of review feedback and live on a different endpoint. Missing them means addressing a fraction of the review.

- **NEVER auto-resolve a thread you declined**
  **Instead:** Reply with the rationale and leave `isResolved=false` for the reviewer to resolve.
  **Why:** Some teams treat thread resolution as the reviewer's signal of acceptance. Self-resolving a decline overrides that signal and erodes trust.

- **NEVER opportunistically edit unrelated code while in the file**
  **Instead:** Stay in the scope of the comment. If you spot something else, mention it in the report at the end.
  **Why:** Drive-by edits inflate the per-comment commit, hide unrelated changes from review, and break the one-commit-per-comment promise.

- **NEVER act on stale/outdated thread anchors without verifying the comment still applies**
  **Instead:** Re-read the current code at that path. If the concern is no longer relevant, reply explaining and resolve. If it's moved, address it at the new location.
  **Why:** After rebases or earlier fixes, an anchor can point to code that no longer matches what the reviewer was critiquing — fixing the new code is a non-sequitur.

- **NEVER auto-run /simplify after Phase 6**
  **Instead:** Ask explicitly in Phase 7 and default to Skip.
  **Why:** The user invoked `/pr-comments` to address review feedback, not to refactor. Surprise edits at the end produce a moving diff and conflict with the reviewer's mental model of what each commit fixed.

- **NEVER skip Phase 3 plan or Phase 4 approval unless `auto=true` was explicitly passed**
  **Instead:** Always run Phase 3 to produce plan records, then Phase 4 to confirm with the user. Only `auto=true` (skill argument) skips Phase 4 — never both phases, and never silently.
  **Why:** Plan + approval is the user-facing audit trail. Bypassing it without explicit opt-in means committing to a PR branch and notifying the reviewer without the user vetting what's being written.
