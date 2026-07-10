# The Actors Office Claude Code Agents and Skills

This folder contains TAO specific Claude Code agents (subagents for delegation).

## Agents (subagents - used by tao-manager for delegation)

- tao-manager: coordinator, discovery first, delegates to implementers and gatekeeper
- tao-gatekeeper: ship gate, reviews proof and invariants, outputs SHIP or NOT SHIP
- tao-cfml: ColdFusion (CFML) implementer for pages and AJAX endpoints
- tao-db: database implementer for schema, indexes, and safe data fixes
- tao-python: Python implementer for scripts, imports, jobs, and integrations
- tao-ui: UI implementer for JS, AJAX flows, and small UX fixes
- tao-test-runner: runs checks and fixes failures with minimal diffs

Agent usage pattern:
1) Start with tao-manager.
2) tao-manager delegates implementation to tao-cfml, tao-db, tao-python, tao-ui as needed.
3) tao-test-runner runs proof commands and fixes failures.
4) tao-gatekeeper reviews and decides SHIP or NOT SHIP.

## Skills (slash commands - user-invoked in .claude/commands/)

- /tao-diagnose: Auto-routing skill. Identifies primary/secondary specialist, then solves using that discipline. Use for any ticket or issue.
- /cf-debug: ColdFusion Bug Hunter. Runtime errors, undefined variables, broken forms, upload failures, scope leaks, silent logic breaks.
- /cf-query: ColdFusion MySQL Query Specialist. SQL queries, joins, filters, duplicate rows, missing records, performance, index awareness.
- /cf-refactor: ColdFusion Legacy Refactor Architect. Old pages, mixed UI/server logic, nested includes, partial modernization, preserving fragile behavior.
- /cf-expert: ColdFusion Expert. General CF syntax, scope handling, application/session/request lifecycle, includes, redirects, version-specific behavior.
- /tao-relationship: TAO Relationship System Expert. Relationships, reminders, follow-up systems, notifications, action sequencing, maintenance auto-start.
- /tao-import: TAO Import / Spreadsheet Debugger. Excel, CSV, VCF uploads, parser failures, workbook format issues, column mapping.
- /tao-admin: TAO Admin UI / AJAX Modernizer. Admin screens, AJAX endpoints, modals, filters, save flows, partial page refresh.

Skill routing quick reference:
- Runtime error / broken form / upload failure > /cf-debug
- SQL / joins / filters / duplicates / performance > /cf-query
- Legacy page / includes / mixed logic / modernization > /cf-refactor
- General CF syntax / scope / lifecycle > /cf-expert
- Relationships / reminders / follow-ups / notifications > /tao-relationship
- Excel / CSV / VCF / imports / parser failures > /tao-import
- Admin screens / AJAX / modals / filters / save buttons > /tao-admin
- Not sure which? > /tao-diagnose (auto-routes)
