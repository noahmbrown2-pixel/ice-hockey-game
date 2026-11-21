# Common Agent Rules (MIDAS Framework - Atlassian Integrated - Rev 4)

## Global Rules

*   **Workflow Handoffs:**
    *   **Synchronous (Primary):** Handoffs between core sequential roles (PO -> Coder, Coder -> Tester) are triggered **directly** by the sending agent calling `new_task` *after* setting the appropriate Jira status (`Ready for Dev`, `Ready for Test`).
    *   **Orchestrator-Driven (Secondary):** The MIDAS Orchestrator Agent initiates the *first* agent task (e.g., PO for a 'Needs Refinement' Epic) and triggers review/side-tasks (Architect, Security, UX, DevOps) by detecting specific Jira statuses (`Needs Arch Review`, `Ready for Deploy`, etc.) via polling (`jira_search`).
*   **Avoid Duplication (Issues Management):** When creating new Jira issues (Epics, Stories, Tasks, Bugs, Vulnerabilities), **FIRST** check for existing ones linked to the parent or related context using `jira_search` (JQL). Clearly state the rationale. If similar items exist, reference/update them (`jira_update_issue`, `jira_add_comment`) instead of creating new ones.
*   **Avoid Duplication (Documentation Management):** Before creating new Confluence pages (Specs, ADRs, diagrams, guides), **FIRST** check the Memory Bank page and use `confluence_search` for existing relevant pages linked in Jira or the Memory Bank. Clearly state the rationale. If relevant pages exist, update them (`confluence_update_page`) or reference them instead.
*   **Intra-Task Persona Shifts:** `switch_mode` is ONLY for temporary perspective changes *within the same task instance*, NOT for handoffs or simulating other roles.

## MANDATORY RULES

*   **Explain Your Actions:** Clearly state the rationale behind significant actions or tool calls.
*   **Tool Usage:** Use appropriate tools: `read_file`, `execute_command`, `mcp-atlassian` (`jira_*`, `confluence_*`), `github` (`create_pull_request`, `merge_pull_request`). Always check tool output. Log errors via `jira_add_comment`.
*   **`MIDAS Agent Lock` Protocol:**
    1.  **Check:** Before starting primary work on a Jira issue (`issue_key`), use `jira_get_issue` to check the `MIDAS Agent Lock` custom field.
    2.  **Abort if Locked:** If the field has a value, log a conflict comment on the issue and **STOP** processing for this task instance.
    3.  **Lock:** If clear, IMMEDIATELY call `jira_update_issue` to set the `MIDAS Agent Lock` field to your unique identifier (e.g., `midas-coder:PROJ-123:timestamp`).
    4.  **Abort if Lock Fails:** If the lock update fails (e.g., race condition), log a conflict comment and **STOP**.
    5.  **Unlock:** Upon successful completion OR encountering any error that terminates processing, your **final action** must be to clear the `MIDAS Agent Lock` field using `jira_update_issue`.
*   **Confluence Memory Bank Interaction:**
    1.  Retrieve the Memory Bank page URL from the `MIDAS Memory Bank URL` custom field of the root Jira issue using `jira_get_issue`.
    2.  Use `confluence_get_page` to read the *entire current* content.
    3.  Parse content; modify relevant sections or append new sections *in memory*. Include agent role and timestamp for new entries. Update the `_Last Updated_` line.
    4.  Use `confluence_update_page` with the *entire modified content* to save changes atomically. Implement basic retry (re-fetch, re-apply, re-update) if the update fails once due to potential conflict.
*   **Standard Error Handling Protocol:**
    1.  If a tool call or internal logic fails:
    2.  Log a detailed error message via `jira_add_comment` on the relevant Jira issue (include action attempted, error details).
    3.  Transition the Jira issue to a 'Failed' or 'Blocked' status via `jira_transition_issue`.
    4.  **Unlock:** Clear the `MIDAS Agent Lock` field via `jira_update_issue`.
    5.  **Terminate** the current task instance.
*   **`execute_command` Safety:** ALWAYS check the return code and capture stdout/stderr. If the command fails, follow the Standard Error Handling Protocol immediately. Do NOT proceed assuming success.
*   **Keep Jira Issues Updated:** Add relevant comments (`jira_add_comment`), link related issues (`jira_create_issue_link`), link Confluence pages/PRs (via comments), and update status (`jira_transition_issue`) accurately.
*   **Confluence Template Usage:** For standard docs (ADRs, Specs), load template (`read_file`), populate placeholders, provide final Markdown to `confluence_create_page`.
*   **Jira Issue Structure:** Structure `description` fields clearly (Goals, AC, Notes). Provide required fields (`project_key`, `summary`, `issue_type`). Link parent issues correctly during creation (`additional_fields`).
*   **Git Workflow Adherence:** Use PRs for changes. Link PRs via `jira_add_comment` (e.g., `PR Ready: [URL]`).
*   **Context Retrieval:** On activation (`new_task` payload is minimal: `issue_key`, sometimes `branch`/`pr_url`), retrieve full context:
    *   `jira_get_issue` for details, fields, comments, parent links, and `MIDAS Memory Bank URL`.
    *   `confluence_get_page` to read the Memory Bank content.
    *   Potentially `confluence_get_page` for other linked docs.
*   **Clarification:** If input/context is ambiguous, **STOP** and use `ask_followup_question` or `jira_add_comment`.
*   **Task Input Validation (CRITICAL):** All agents (except designated planning agents receiving initial structuring tasks from the Orchestrator) **MUST** validate their input payload upon activation (`new_task`). The payload **MUST** contain a valid `issue_key`. If the payload lacks an `issue_key` or contains raw specifications instead, the agent **MUST** reject the task, log an error comment on a relevant Jira issue (if possible) or via internal logging, stating that the task did not follow the standard Jira workflow, and **TERMINATE**. This prevents bypassing the required planning and structuring phase.