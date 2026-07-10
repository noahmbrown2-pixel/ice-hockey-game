---
trigger: always_on
---

---

## trigger: when working with devsuite workflows or task tracking

# DevSuite Workspace Path Rules

## When to use this rule

This rule applies when:

- Working with any devsuite workflow (0-task, 1-discovery, 2-design, etc.)
- Referencing current-task.md or other docs paths
- Managing task tracking and development documentation
- Using slash commands (/task, /status, /discovery, etc.)

## Workspace Context Rules

### Always Work in DevSuite Workspace

When executing devsuite workflows, **always ensure you are working within the devsuite workspace** when working with the current-task.md or documentation paths unless specified by the user to work on the project workspace being worked on.

### Current Task File

- **Always use**: docs/development/current-task.md insed the devsuite or windsurf-devsuite workspace folder
- **Never use**: docs/development/current-task.md inside the project the user is working that is not a devsuite folder
- **Context**: Task tracking belongs to the devsuite process, not the specific project

### Documentation Paths

When working with devsuite workflows, all docs paths should be **within the devsuite workspace**:

- **Architecture docs**: `docs/ARCHITECTURE.md` (in devsuite workspace)
- **API docs**: `docs/API.md` (in devsuite workspace)
- **Technical docs**: `docs/technical/[feature-name].md` (in devsuite workspace)
- **User manuals**: `docs/user_manuals/[feature-name].md` (in devsuite workspace)
