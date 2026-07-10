# Documentation Maintenance Rules

## 1. General Principles

This document serves as an instruction for AI developer agents. The goal is automatic and deterministic updating of all project artifacts. Any code change that completes a task must initiate an update protocol.

To ensure machine readability, `Status` fields have been added to the following documents:
* `backlog.md` (in the User Story table)
* `sprint-plan.md` (in the Task table)

## 2. Documentation Update Triggers

Documentation updates must be initiated when one of the following events occurs:

1.  **Git Commit:** A commit with a message containing the tag `Closes TASK-XXXX-Y`, where `TASK-XXXX-Y` is the `Task ID` from `sprint-plan.md`.
2.  **Task Closure:** A direct command to an AI agent to close a task with its specified `ID`.

### Detecting Git Commit Triggers

To detect Git commit triggers, use the following RooCode approach:

```python
# Example: Extract task ID from commit message
import re

def extract_task_id_from_commit(commit_message):
    """Extract task ID from commit message using regex"""
    pattern = r'Closes\s+(TASK-[A-Z0-9-]+)'
    match = re.search(pattern, commit_message)
    if match:
        return match.group(1)
    return None

# Use search_files to find commit messages
# search_files(path=".", regex="Closes TASK-[A-Z0-9-]+", file_pattern="*.git/COMMIT_EDITMSG")
```

## 3. Update Protocol

When a trigger occurs, the AI agent must execute the following sequence of actions **strictly in order**:

### Step 1: Update `sprint-plan.md`

1.  Extract the `Task ID` (e.g., `TASK-S1-1`) from the trigger.
2.  Find the corresponding row in `sprint-plan.md`.
3.  Change the `Status` of this task to `Done`.

**RooCode Implementation Example:**
```python
# Read the sprint plan file
sprint_content = read_file(path="pages/sprint-plan.md")

# Use search_and_replace to update task status
search_and_replace(
    path="pages/sprint-plan.md",
    search="| TASK-S1-1 | ... | In Progress |",
    replace="| TASK-S1-1 | ... | Done |"
)
```

### Step 2: Update `backlog.md`

1.  Extract the `Story ID` (e.g., `STORY-REARCH-1`) from the updated task in `sprint-plan.md`.
2.  Check **all** tasks in `sprint-plan.md` related to this `Story ID`.
3.  **If** all tasks for this `Story ID` have status `Done`:
    a. Find the corresponding `Story ID` in `backlog.md`.
    b. Change the `Status` of this story to `Done`.

**RooCode Implementation Example:**
```python
# Check all tasks for a story
def check_all_tasks_done(story_id):
    sprint_content = read_file(path="pages/sprint-plan.md")
    # Parse table and check if all tasks for story_id are Done
    # Return True if all Done, False otherwise
    pass

# Update story status if all tasks are done
if check_all_tasks_done("STORY-REARCH-1"):
    search_and_replace(
        path="pages/backlog.md",
        search="| STORY-REARCH-1 | ... | In Progress |",
        replace="| STORY-REARCH-1 | ... | Done |"
    )
```

### Step 3: Update `requirements.md`

1.  **If** the `Status` of a story in `backlog.md` was changed to `Done`:
    a. Extract the `Req. ID` (e.g., `REQ-ARCH-2`) from this story.
    b. Check in `backlog.md` **all** other stories related to this same `Req. ID`.
    c. **If** **all** stories related to this `Req. ID` have status `Done`, then:
        i. Find the `Req. ID` in `requirements.md`.
        ii. Change the `Status` of the requirement to `IMPLEMENTED`.
    d. **Otherwise** (if only some stories for this `Req. ID` are done), then:
        i. Find the `Req. ID` in `requirements.md`.
        ii. Change the `Status` of the requirement to `PARTIAL`.

**RooCode Implementation Example:**
```python
# Check if all stories for a requirement are done
def check_requirement_status(req_id):
    backlog_content = read_file(path="pages/backlog.md")
    # Parse and check all stories for req_id
    # Return "IMPLEMENTED" if all Done, "PARTIAL" if some Done
    pass

# Update requirement status
new_status = check_requirement_status("REQ-ARCH-2")
search_and_replace(
    path="pages/requirements.md",
    search="| REQ-ARCH-2 | ... | PLANNED |",
    replace=f"| REQ-ARCH-2 | ... | {new_status} |"
)
```

## 4. Consistency Check Rules

AI agents must perform the following checks before each Pull Request to prevent documentation desynchronization:

1.  **Backlog and Requirements Integrity:**
    * **Rule:** Every `Req. ID` in `backlog.md` must exist in `requirements.md`.
    * **Action on violation:** Error. Prevent merge until fixed.
    * **RooCode Validation:**
    ```python
    # Validate requirement IDs exist
    backlog_content = read_file(path="pages/backlog.md")
    requirements_content = read_file(path="pages/requirements.md")
    
    # Extract Req. IDs from both files and validate
    backlog_reqs = extract_requirement_ids(backlog_content)
    requirements_reqs = extract_requirement_ids(requirements_content)
    
    missing_reqs = backlog_reqs - requirements_reqs
    if missing_reqs:
        raise ValidationError(f"Missing requirements: {missing_reqs}")
    ```

2.  **Roadmap and Backlog Integrity:**
    * **Rule:** Every `Epic ID` specified in `roadmap.md` must exist in `backlog.md`.
    * **Action on violation:** Error. Prevent merge until fixed.
    * **RooCode Validation:**
    ```python
    # Validate epic IDs exist in backlog
    roadmap_content = read_file(path="pages/roadmap.md")
    backlog_content = read_file(path="pages/backlog.md")
    
    roadmap_epics = extract_epic_ids(roadmap_content)
    backlog_epics = extract_epic_ids(backlog_content)
    
    missing_epics = roadmap_epics - backlog_epics
    if missing_epics:
        raise ValidationError(f"Missing epics in backlog: {missing_epics}")
    ```

3.  **Sprint Plan and Backlog Integrity:**
    * **Rule:** Every `Story ID` in `sprint-plan.md` must exist in `backlog.md`.
    * **Action on violation:** Error. Prevent merge until fixed.
    * **RooCode Validation:**
    ```python
    # Validate story IDs exist in backlog
    sprint_content = read_file(path="pages/sprint-plan.md")
    backlog_content = read_file(path="pages/backlog.md")
    
    sprint_stories = extract_story_ids(sprint_content)
    backlog_stories = extract_story_ids(backlog_content)
    
    missing_stories = sprint_stories - backlog_stories
    if missing_stories:
        raise ValidationError(f"Missing stories in backlog: {missing_stories}")
    ```

4.  **Status Consistency:**
    * **Rule:** If the `Status` of a requirement in `requirements.md` is `IMPLEMENTED`, then the `Status` of all stories related to it in `backlog.md` must be `Done`.
    * **Action on violation:** Warning indicating the inconsistency.
    * **RooCode Validation:**
    ```python
    # Check status consistency
    requirements_content = read_file(path="pages/requirements.md")
    backlog_content = read_file(path="pages/backlog.md")
    
    implemented_reqs = get_implemented_requirements(requirements_content)
    for req_id in implemented_reqs:
        related_stories = get_stories_for_requirement(backlog_content, req_id)
        incomplete_stories = [s for s in related_stories if s.status != "Done"]
        
        if incomplete_stories:
            log_warning(f"Requirement {req_id} is IMPLEMENTED but has incomplete stories: {incomplete_stories}")
    ```

5.  **Assignee Role Validation:**
    * **Rule:** The `assignee` property in User Stories must contain a valid AI agent role from the approved list in `.roo/rules/05-agent_capabilities.md`.
    * **Action on violation:** Error indicating the invalid assignee and listing the valid agent roles.
    * **RooCode Validation:**
    ```python
    # Validate assignee roles
    # The validation script extracts valid roles from .roo/rules/05-agent_capabilities.md
    # and checks that assignee values in User Stories match these roles.
    ```

## 5. Automated Implementation

Use the dedicated script [[scripts/development/update_documentation_status.py|update_documentation_status.py]] to automate this process. The script implements the documentation maintenance protocol triggered by Git commits or direct task completion commands.

### Usage Examples

**Update from commit message:**
```bash
uv run python scripts/development/update_documentation_status.py --commit-message "feat: Add search filters (Closes TASK-S1-1)"
```

**Update specific task:**
```bash
uv run python scripts/development/update_documentation_status.py --task-id TASK-S1-1
```

**Run consistency checks only:**
```bash
uv run python scripts/development/update_documentation_status.py --check-only
```

### Git Hook Integration

Add a pre-commit hook to automatically run consistency checks:

```yaml
# .pre-commit-config.yaml addition
-   repo: local
    hooks:
    -   id: documentation-status-check
        name: Documentation Status Check
        entry: python scripts/development/update_documentation_status.py --check-only
        language: python
        pass_filenames: false
        always_run: true
```

This automated system ensures that all documentation remains synchronized and consistent throughout the development lifecycle.