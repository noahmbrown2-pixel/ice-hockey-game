# Agent Guidelines for mj-opencode

<CRITICAL_INSTRUCTION>
**DO NOT MODIFY GLOBAL CONFIGURATION.**
When instructed to update skills, commands, or configuration, you MUST modify the files within **this current repository**.
Do not touch files in `~/.config/opencode` or any other global location unless explicitly instructed to perform an installation or symlink setup.
</CRITICAL_INSTRUCTION>

This repository contains configuration, skills, and commands for the OpenCode agent. While primarily configuration-based today, it may include source code (e.g., plugins) in the future.

## 1. Build, Lint, and Test

### Configuration Testing
Since this is largely a configuration repository, "testing" often involves verifying the configuration within an OpenCode environment.

1.  **Verify Installation**:
    Check if the repo is symlinked correctly:
    ```bash
    # Example check for global install
    ls -l ~/.config/opencode/skills/mj-opencode
    ls -l ~/.config/opencode/commands/interview.md
    ```

2.  **Test a Command**:
    *   Execute the command in the agent interface: `/command-name`
    *   Example: `/interview`
    *   Verify the agent follows the instructions defined in `commands/command-name.md`.

3.  **Test a Skill**:
    *   Load the skill using the `skill` tool or by invoking it: `mj-opencode/skill-name`.
    *   Verify the agent successfully loads the context and can answer questions or perform tasks related to that skill.

### Future Code Testing
If/when plugins or other code components are added:
*   Follow standard build/test procedures relevant to the language (e.g., `npm test`, `cargo test`).
*   Ensure CI checks pass.

### Linting
*   **Markdown**: Ensure all `.md` files follow standard Markdown syntax.
*   **Frontmatter**: Verify valid YAML frontmatter in commands and skills.

---

## 2. Code Style & Conventions

### General
*   **Format**: All configuration is written in **Markdown**.
*   **Tone**: Instructions within commands and skills should be clear, direct, and imperative. Use "You must..." or "Instructions:".

### Commands (`commands/*.md`)
Commands define slash-commands available to the user.

*   **Frontmatter**: Must include a `description` field.
    ```markdown
    ---
    description: A brief description of what the command does.
    ---
    ```
*   **Structure**:
    1.  **Role**: Define the agent's persona (e.g., "You are an expert interviewer").
    2.  **Instructions**: Step-by-step logic for the command.
    3.  **Tools**: Explicitly mandate tool usage where necessary.
        *   **Interactive Inputs**: ALWAYS use the `question` tool for user interaction. DO NOT ask questions in plain text.
    4.  **Termination**: Define how and when the command ends.

### Skills (`skills/*/SKILL.md`)
Skills provide domain-specific knowledge or workflows.

*   **Directory Structure**:
    ```
    skills/
      skill-name/
        SKILL.md      # Main definition
        docs/         # Documentation files (optional)
    ```
*   **Frontmatter**:
    ```markdown
    ---
    name: skill-name
    description: When to use this skill.
    ---
    ```
*   **Content**:
    *   **Overview**: High-level summary.
    *   **Workflow**: Step-by-step guide on how the agent should apply the skill.
    *   **Constraints**: What the agent should NOT do.
    *   **Documentation**: If the skill relies on docs, place them in a `docs/` subdirectory and instruct the agent to search there.

### Implementation Plans (`docs/plans/*.md`)
When planning changes, use the standard plan format.

*   **Filename**: `YYYY-MM-DD-feature-name.md`
*   **Header**:
    ```markdown
    # [Feature Name] Implementation Plan
    **Goal**: ...
    **Architecture**: ...
    **Tech Stack**: ...
    ```
*   **Tasks**: Break down work into atomic steps (Modify, Test, Verify).

---

## 3. Cursor & Copilot Rules

*(No specific .cursorrules or .github/copilot-instructions.md found in this repository. Follow the general guidelines above.)*

## 4. Development Workflow

1.  **Plan**: Create a plan in `docs/plans/` for significant changes.
2.  **Implement**: Edit the markdown files.
3.  **Verify**:
    *   For **Commands**: Run the command and verify interaction flow.
    *   For **Skills**: Load the skill and test its triggers.
4.  **Commit**: descriptive commit messages.
