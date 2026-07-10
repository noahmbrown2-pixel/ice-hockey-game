# Rules: agent workflow

These rules apply to all AI coding agents working on NETWAYS projects,
regardless of the project's technology stack.

For rationale, background, and examples, see `docs/conventions/agent-workflow.md`.

## Reading order

Always read this file first.

Always read `ARCHITECTURE.md` (if present) before making changes that
affect behavior.

Always read the project's `CLAUDE.md` (if present) for project-specific
rules.

Always read `.roo/rules/` end to end. The rules are short and imperative.

## Session state lives in `.agent/`

Maintain plans, checklists, decisions, and in-progress notes in a
directory named `.agent/` at the repository root.

`.agent/` is **committed to the repository**. It is project knowledge,
not throwaway state. Plans agents make are useful to the next agent
session, to other agents, and to humans reviewing what was decided and
why.

Never put `.agent/` in `.gitignore`. Never store `.agent/` in
`.git/info/exclude`. Never put it in `/tmp/`. The point is that the
directory survives sessions, machines, and contributors.

## File format

Files in `.agent/` are Markdown.

Plans and checklists use Markdown task list syntax:

    # Plan: remove Elastic Stack 7 support

    ## Status
    In progress, blocked on review of PR #453

    ## Steps
    - [x] Identify all `elasticstack_release | int < 8` conditionals
    - [x] Remove the OSS variant default in defaults/main.yml
    - [ ] Update Molecule scenarios — drop `*-oss` variants
    - [ ] Update README distro/version matrix
    - [ ] Add CHANGELOG entry

    ## Open questions
    - Logstash OSS and Beats OSS remain valid in 8.x — keep them?
      (Answer from Thomas: yes, keep them.)

    ## Decisions
    - 2025-03-15: Drop `elasticstack_variant: oss`. Keep the variable
      for one release with a deprecation warning, then remove.

A file may also be a free-form note. Date-stamp significant entries.

## Resumability

When starting work on a project, an agent must check `.agent/` for
existing plans before starting a new one. If a relevant plan exists,
continue it. If a plan is stale or contradicted by recent commits, mark
it stale rather than deleting it.

When ending a work session — whether finished, interrupted, or blocked —
update the relevant `.agent/` file to reflect the current state. The
next session must be able to pick up from the file alone.

When a plan is complete and the changes are merged, move the file to
`.agent/done/` rather than deleting it. Completed plans are a record of
what was decided.

## Plan before code

Always present a plan before producing non-trivial code or configuration
changes. Wait for approval.

When the user asks for something straightforward and small (a one-line
fix, a typo correction, an answer to a factual question), no plan is
needed. Use judgment; when in doubt, plan.

The plan covers: what will change, why, what will not change, how the
change will be verified, and what risks exist.

## Documentation first

Update documentation before changing behavior, not after.

For Ansible projects, that means updating `ARCHITECTURE.md` and the
role README before changing the role's behavior. For other project
types, update the equivalent: design documents, READMEs, public API
docs.

If a change does not justify a documentation update, it is either too
small to need a plan or it is hiding behavior changes from review.

## English in repositories and online services

All content in repositories and online services is in English: code,
comments, variable names, file names, commit messages, documentation,
issues, pull requests, code review comments, public discussion.

This is non-negotiable. It is what makes the projects accessible to
external contributors and discoverable for users searching for errors.

## Communication follows the user's language

Direct, non-public communication — chat with the user during a working
session, internal team discussion, customer-facing conversation —
follows the user's language.

If a user writes a prompt in German, respond in German. If they switch
to English, switch with them. The code, commits, and pull request
descriptions that result from the conversation are still in English.

## Asking is cheap

When requirements are ambiguous or when a trade-off is unclear, ask.

Specifically:

- Ask before renaming roles, variables, or files.
- Ask before changing the support matrix (distros, software versions,
  language versions).
- Ask before touching `galaxy.yml`, `meta/main.yml`, `meta/runtime.yml`,
  or `CHANGELOG`.
- Ask before bringing in a new external dependency.
- Ask before making a change that crosses role or repository boundaries.

A short exchange that prevents the wrong code from being written is
always cheaper than the cleanup afterwards.

## Scope discipline

Stay within the scope of the current request.

If you discover an unrelated bug or improvement opportunity while
working on a task, note it in `.agent/findings.md` rather than fixing
it inline. Inline scope creep makes pull requests hard to review and
hides real changes among incidental ones.

## Upstream feedback loop

When something surfaces during work that is not a project-local
finding but a gap, error, or ambiguity in the **shared rules
themselves** (this file, `01-coding.md`, language-specific rules files,
`ARCHITECTURE.md`), record it as an upstream candidate.

The rationale: shared rules are written upfront and refined through
use. Things will surface during real work that the rules do not yet
cover, that they cover wrongly, or that they leave ambiguous. Without
a feedback path, the same gap gets re-discovered in every new project.

Apply the generalisation test: would this same issue plausibly appear
in another project with a similar structure? If yes, it is a
candidate. If no, it is a project-local finding and goes in
`.agent/findings.md`.

Triggers — record a candidate when:

- A shared rule turns out to be wrong, outdated, or harmful in
  practice.
- A shared rule has a gap — a case it does not address but should.
- Two shared rules conflict and the conflict is not resolvable by
  reading more carefully.
- A recurring question keeps coming up that the shared rules do not
  answer.
- A tool, library, or platform update makes a rule need adjustment.

If unsure whether a finding meets the bar, write it down anyway.
Rejecting a candidate is cheap; missing one is not.

Record candidates in `.agent/upstream-candidates.md` using this
format:

    ## YYYY-MM-DD: <short title>

    **Status:** open

    **Target file:** <e.g. .roo/rules/01-coding.md, ARCHITECTURE.md,
    or "new file: <name>">

    **Type:** new rule / rule change / rule clarification / rule conflict

    **Proposed rule text:**
    > <Verbatim text matching the target file's style — imperative for
    > rules files, narrative for ARCHITECTURE.md. Self-contained: must
    > be readable without the originating project's context, because
    > the shared rules repository does not have that context.>

    **Why this generalises:**
    <Two to four sentences. The pattern behind the specific case;
    other kinds of project that would also hit this.>

    **Originating context (drop on promotion):**
    <The concrete situation that surfaced the finding. File paths,
    symptom, workaround. Helps the reviewer evaluate; not part of the
    eventual rule.>

The agent **proposes** candidates; a human **decides** whether to
promote, defer, or reject them. Agents do not edit the shared-rules
files based on their own candidates. This separation prevents agent
preferences from leaking into the shared rules without human review.

When a candidate is promoted:

1. The proposed rule text is added to the target shared-rules file
   in the upstream rules repository. Carrying a promoted change into
   that repository is a human responsibility — the project where the
   candidate was raised is not connected to the upstream repository.
2. The candidate entry's status is updated to
   `promoted (link to upstream commit)`.
3. The "Originating context" block is dropped.
4. The candidate is moved from `.agent/upstream-candidates.md` to
   `.agent/upstream-candidates/done/<title>.md` for archival.

When a candidate is rejected:

1. Status updates to `rejected (reason)`.
2. The entry stays in `.agent/upstream-candidates.md`. Rejected
   candidates are not deleted because they prevent the same topic
   from being re-evaluated from scratch in six months.

Cross-project visibility: promoted rules update the upstream rules
files, but those files are not automatically connected to the
projects that consume them. To stay on top of open candidates across
many projects, do periodic reviews: walk through every active
project's `.agent/upstream-candidates.md`, evaluate the open entries,
and promote, defer, or reject. Quarterly is a reasonable cadence; the
right frequency depends on how often projects produce candidates.

A future option, if the manual review becomes too time-consuming, is
to build a small aggregation tool that walks all repositories and
collects open upstream candidates into a single overview. This is not
necessary at the start; the manual approach is enough until the
volume justifies tooling.

## Mistake handling

Own mistakes. When a change turns out to be wrong, say so directly,
explain what was wrong, and propose a fix.

Do not silently produce another plan that pretends the first one was
correct. Update the relevant `.agent/` file with what was learned.
