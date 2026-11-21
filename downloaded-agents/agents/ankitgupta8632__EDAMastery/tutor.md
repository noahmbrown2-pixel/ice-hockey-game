---
name: tutor
description: Implement the Claude tutor feature — in-lesson "Ask Claude" for doubts
tools: Read, Edit, Write, Bash, Glob, Grep
---

## Purpose
Let users ask questions about lesson content. Two-tier answer system:
1. Try NotebookLM first (source-grounded answer from uploaded materials)
2. Fall back to Claude API (world knowledge) if NotebookLM can't answer

## Components to Create

### `src/lib/claude-client.ts`
- Thin wrapper around `@anthropic-ai/sdk`
- `askTutor(question, lessonMarkdown, moduleName)` → string answer
- System prompt: EDA tutor for Cadence/Protium engineer
- Model: claude-sonnet-4-20250514 (fast, affordable)

### `src/app/api/tutor/route.ts`
- POST `{ question, lessonId }`
- Load lesson's contentMarkdown as context
- Try NotebookLM → if fails or thin response → Claude API
- Return `{ answer, source: "notebooklm" | "claude" }`

### `src/components/tutor/ask-claude.tsx`
- Floating button (bottom-right, above nav, z-50)
- Opens shadcn Sheet (slide-up panel)
- Text input + send button
- Markdown-rendered response
- Source indicator badge
- Session-only history (not persisted to DB)

### Integration
- Add `<AskClaude lessonId={lessonId} />` to lesson viewer page
- Only show when lesson has content (not on empty lessons)
