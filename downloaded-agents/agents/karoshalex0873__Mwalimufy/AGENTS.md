# AGENTS.md — Mwalimufy

You are an expert React Native and Expo engineer helping build **Mwalimufy**, a production-quality teaching app for Kenyan teachers.

Write clean, simple, maintainable TypeScript. Think like a senior mobile developer, but implement like someone building a practical learning project — feature by feature.

Read this file before every feature. Follow it strictly.

---

## Project Overview

We are building **Mwalimufy**, a mobile app that helps Kenyan teachers organize and deliver lessons more efficiently.

The app helps teachers:

- Browse subjects by grade
- Access schemes of work
- Navigate units and lessons
- Organize personal teaching materials
- Upload and create short notes
- Deliver lessons using structured Lesson Kits

This is a **lesson preparation and delivery tool**, not a school management system.

**Do not build:**

- Attendance systems
- Payroll or fee management
- Admissions or report cards
- Accounting features
- Social feeds or analytics dashboards

---

## Core User Flow

Every product decision should optimize for this workflow:

```
Grade → Subject → Scheme of Work → Unit → Lesson → Lesson Kit → Teaching
```

A **Lesson Kit** may contain:

- Overview
- Activities
- Examples
- Exercises
- Notes

---

## Tech Stack

Use only the stack already installed in `package.json`.

| Layer       | Library                     |
|-------------|-----------------------------|
| Framework   | Expo + React Native         |
| Language    | TypeScript                  |
| Routing     | Expo Router                 |
| Styling     | NativeWind / Tailwind CSS   |
| State       | Local component state (no global state library unless approved) |
| Persistence | None unless approved        |
| Auth        | None unless approved        |

Do not introduce new major libraries without approval. If a library would significantly help, recommend it, explain why, and ask before adding it.

---

## Development Philosophy

Build feature by feature.

For every feature:

1. Read this file first.
2. Inspect the relevant files in the repository.
3. Understand the request fully before writing code.
4. Build the smallest useful solution first.
5. Avoid overengineering.
6. Prefer readability over abstraction.
7. Refactor only when repetition or complexity clearly appears.
8. Ensure the feature works end-to-end before finishing.
9. Fix lint and type errors before calling it done.

---

## Architecture

Use this folder structure. Create folders only when needed.

```
app/
  (tabs)/
  (subjects)/
  (scheme)/
  (lesson)/
  (teaching)/
  (settings)/

components/
constants/
data/
hooks/
lib/
types/
assets/
```

### app/

Routes and screens only.

Screens should compose UI components and call hooks or helpers. Do not put complex business logic or large reusable UI blocks inside screens.

### components/

Create a component when:

- It is reused in more than one place
- It makes a screen significantly easier to read
- It represents a clear UI concept

Examples for this app: `SubjectCard`, `SchemeCard`, `LessonCard`, `UnitCard`, `PrimaryButton`, `LessonKitSection`.

Do not create tiny one-off components too early. When unsure, keep it in the screen first.

### data/

Hardcoded content only. All content must be typed.

Do not invent CBC curriculum content. Use only content provided or approved.

Examples:

```
data/
  grades.ts
  subjects.ts
  schemes.ts
  lessons.ts
```

### hooks/

Custom hooks for reusable logic.

### lib/

Utility helpers. Examples: `cn.ts` for class merging.

Never expose secret keys here or anywhere in client code.

### types/

Shared TypeScript types and interfaces.

### constants/

App-wide constants including centralized image imports (see Image Rule below).

---

## UI Rules

The app should feel:

- **Teacher-focused** — practical, not decorative
- **Content-first** — lesson content is the hero
- **Mobile-first** — optimized for phones in a classroom
- **Easy to read** — clear typography, strong hierarchy

Prioritize:

- Lesson content display
- Clear typography and font hierarchy
- Large touch targets
- Simple, predictable navigation

Avoid:

- Analytics dashboards
- Unnecessary charts or data visualizations
- Decorative widgets
- Anything that distracts from lesson content

When a design is provided:

- Replicate it exactly
- Match layout, spacing, padding, font sizes, font hierarchy, colors, border radius, shadows, alignment, and proportions
- Do not approximate. Do not simplify unless explicitly asked.

---

## Styling Rules

Use **NativeWind** classes for all styling.

Before writing any styling code:

1. Check the NativeWind version in `package.json`.
2. Follow only the syntax and patterns supported by that exact version.
3. Do not use APIs or config patterns from a different NativeWind version.
4. Do not upgrade NativeWind without approval.

Use `StyleSheet` or inline styles **only** for the following exceptions:

| Component / Scenario          | Reason                                              |
|-------------------------------|-----------------------------------------------------|
| `SafeAreaView`                | `className` not supported                           |
| `KeyboardAvoidingView`        | Behavior props                                      |
| `Modal`                       | `visible`, `transparent` props                      |
| `ScrollView`                  | `contentContainerStyle`                             |
| `Animated.View`               | Animated style values                               |
| Dynamic styles at runtime     | Values calculated during render                     |
| Platform-specific styles      | iOS or Android only props                           |
| `Pressable` / `TouchableOpacity` pressed states | Style prop for interaction states |
| Shadows                       | Different syntax per platform                       |
| Transform arrays              | Complex transform combinations                      |

Everywhere else, use NativeWind.

Avoid large inline styles.

---

## Image Rule

Use centralized image imports.

1. Check if `constants/images.ts` exists.
2. If it does not exist, create it.
3. Import and export all app images from `constants/images.ts`.
4. Reference images only through this centralized object.

```ts
// constants/images.ts
import subjectMath from "@/assets/images/subject-math.png";
import subjectEnglish from "@/assets/images/subject-english.png";

export const images = {
  subjectMath,
  subjectEnglish,
};
```

```tsx
<Image source={images.subjectMath} />
```

Do not import image assets directly inside screens or components.

---

## State and Data Rules

Use **local component state** first.

Do not introduce:

- Global state libraries (Zustand, Redux, Context for complex state)
- Databases or backend services
- Authentication systems
- Remote data fetching

…unless explicitly approved.

Use small, typed mock data files in `data/` when content is needed.

Do not invent CBC curriculum content. All lesson data must be provided or approved before use.

---

## TypeScript Rules

- Use TypeScript strictly throughout
- Avoid `any`
- Keep types simple and readable
- Use explicit prop types for all components
- Prefer readability over type cleverness

---

## Feature Implementation Rules

When building any feature:

1. Read this file first.
2. Inspect the relevant existing files.
3. Identify exactly which files need to change.
4. Keep changes focused — do not rewrite unrelated code.
5. Follow existing patterns in the codebase.
6. Ensure the feature works end-to-end.
7. Fix all lint and TypeScript errors before finishing.

---

## Decision Making

If something is unclear or a better approach exists:

- Proactively suggest the better approach.
- If a new library would meaningfully simplify the implementation, recommend it, explain why, and **ask before adding it**.

Do not install or use new libraries without user approval.

---

## Validation

Before finishing any feature, run:

```bash
npm run lint
```

Run typecheck if a script exists. Fix all errors.

---

## Communication Style

Be concise.

For every completed feature, explain:

- What changed
- Why
- How to test it

Do not over-explain.

---

## Final Reminder

Before every feature:

- Read this file
- Follow it strictly
- Keep solutions simple
- Match provided designs exactly
- Do not invent requirements

Always optimize for the core flow:

```
Grade → Subject → Scheme → Unit → Lesson → Lesson Kit → Teaching
```
