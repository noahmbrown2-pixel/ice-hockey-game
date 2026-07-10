---
trigger: always_on
---

### EXECUTION PHASE

- After each individual edit, clearly indicate progress:
  "✅ Completed edit [#] of [total]. Ready for next edit?"
- If you discover additional needed changes during editing:
  - STOP and update the plan

### Pre-QA Verification

- Before concluding a task and generating the QA review information, perform basic checks to ensure the implemented code is syntactically correct, passes linting rules, and the core functionality for the specific task appears to be working as expected in a basic test scenario (if applicable and feasible without external tools).

---

## Communication Guidelines

- Be concise and do not repeat yourself.
- Be conversational but professional.
- Refer to the `USER` in the second person ("you") and yourself in the first person ("I").
- Refrain from constant apologies for unexpected results; explain circumstances if necessary.
- Confirm that you've read and understand the instructions for all your outputs/chat responses. Failure to do so will indicate to the user that you are not following the instructions for that output.
- **Inter-Agent Communication:** When a task requires coordination or dependencies on other AI agents (e.g., waiting for a backend change before completing frontend), communicate this need clearly in your plan and update the user on the status of these dependencies.

---

## Search and Reading Guidelines

- Gather more information (via tools, clarifying questions, reviewing codebase) if unsure about the answer or how to fulfill a request.
- If search results are insufficient, consider using more tools.
- If an edit might only partially satisfy the request, gather more information or use more tools before finishing.
- Bias towards finding answers yourself rather than asking the user for help.
- **Context Loading:** Before beginning work on a task, especially in unfamiliar or complex areas, ensure relevant files (identified in the plan), documentation, and architectural context are loaded and considered.

---

## PROPOSED EDIT PLAN

Working with: [filename]
Total planned edits: [number]

---

## Making Code Changes Guidelines

- **NEVER** output code directly to the `USER` unless requested. Use code edit tools instead.
- Always add the line number and the filename when you reference code.
- Always consider client hooks (`\client\src\hooks`), utility files (`\client\src\utils`) and functions, redux files (`\client\src\features`) and components (`\client\src\components`) and pages (`\client\src\pages`) when debugging and making changes. This is not a complete list of all the files, but it is a good starting point. You should always be aware of the entire codebase and how everything works together.
- Show clear "before" and "after" snippets when proposing changes.
- Include concise explanations of what changed and why.
- Always check if the edit maintains the project's coding style.
- Generated code should be runnable, including necessary imports/dependencies, or clearly indicate any required placeholder/follow-up steps.
  - Add necessary import statements, dependencies, and endpoints.
  - For new web apps, give it a beautiful and modern UI, imbued with best UX practices.
- For existing codebases, apps and projects, UI/UX is a major priority. Instead of just implementing code fixes and updates or creating new features, always review the UI/UX for consistency and improvements. UI/UX is the number one priority for production sites. Always ensure that layouts, flows, contrasts and all other UI/UX considerations are providing the best possible experience to the users. Review UI/UX for improvements, inconsistencies and errors when first thing entering a file for any reason and do a second review as your last thing before finishing in a file. Keep a vast context of the the whole applications (all files) UI/UX at all times. Your reviews should always be comparing the UI/UX to the rest of the application for consistency, ensuring best practices are being exceeded and looking for ways to build and improve an ever expanding design system for the application. Report your findings when necessary and provide suggestions. We will likely make it a priority.
- Unless making a small, simple edit or creating a new file, you **MUST** read the relevant file section before editing.
- If you've introduced (linter) errors, please try to fix them. But, do **NOT** loop more than 3 times when doing this. On the third time, ask the user if you should keep going.
- If you've suggested a reasonable `code_edit` that wasn't followed by the apply model, you should try reapplying the edit.

---

### REFACTORING GUIDANCE

When refactoring large files or identifying opportunities for code improvement:

- Break work into logical, independently functional chunks.
- Ensure each intermediate state maintains functionality.
- Consider temporary duplication as a valid interim step.
- Always indicate the refactoring pattern being applied.
- **Proactive Refactoring Suggestion:** During code review or implementation, if you identify significant code smells, excessive complexity, or duplication, propose a refactoring plan to the user, explaining the benefits (maintainability, performance, readability).

---

### Accessibility

- Always suggest:
  - Labels for form fields.
  - Proper **ARIA** roles and attributes.
  - Adequate color contrast.
  - Keyboard navigation support.
  - Accessible error messages.

---

## HTML/CSS Requirements

- Use responsive design practices.
- Include `loading="lazy"` on images where applicable.
- Prioritize semantic HTML structure.

