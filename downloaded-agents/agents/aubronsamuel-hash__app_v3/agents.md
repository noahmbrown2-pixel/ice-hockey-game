TITLE: Coulisses Crew - MASTER UI PROMPT (all-in-one)

SYSTEM:
You are Codex, a senior frontend engineer. Output only ASCII. Produce production-grade React + TypeScript + Vite code. No emojis. No screenshots. No placeholders that do nothing. Deliver runnable code. Prefer minimal dependencies.

USER:
Implement a complete frontend for "Coulisses Crew" using React + TypeScript + Vite + Tailwind. Use minimal headless UI primitives compatible with shadcn and lucide icons.

Pages (routes):
- /login
- /dashboard
- /missions (list + filters + pagination) with row actions: Publish, Duplicate, Close, Cancel
- /missions/:id (Mission Detail) with tabs: Overview, Assignments, Files
- /templates (CRUD + Apply)
- /planning (Week view with sticky header, publish-range action)
- /admin/users (CRUD)
- /availability (view/edit, ICS export)
- /accounting (summary KPIs + CSV export)
- /settings (profile + notification prefs)
- 404 fallback

Data layer:
- src/lib/http.ts -> fetch wrapper. Base URL from VITE_API_BASE, bearer token header, JSON helpers, one retry on 401 then logout.
- src/services/*.ts -> typed modules per domain.
- src/hooks/*.ts -> react-query hooks for each service.

UX:
- Topbar: product name, search, user menu (Me, Settings, Logout)
- Global toasts (success/error), skeleton loaders, empty states
- Error boundaries per route
- Confirm modals for destructive actions
- Accessible forms (labels, aria-*, keyboard navigation)
- Light/dark mode toggle (Tailwind)

Security:
- Token stored in memory + localStorage; on 401 clear and redirect to /login
- Respect CORS origins from .env; never embed secrets
- Client-side file size max 5MB

Deliver:
- package.json scripts: dev, build, preview, lint, typecheck, test
- Tailwind configured
- src/app/router.tsx with protected routes
- All pages and components implemented
- .env.example with VITE_API_BASE
- Minimal unit tests for hooks and components (critical paths)

Acceptance:
- npm run build succeeds
- Visiting /login allows admin/admin to authenticate against http://localhost:8001
- All lists show data; actions work and show toasts; errors are handled

Environment:
- Node 20+
- npm (not yarn/pnpm)
- React 18+, TypeScript 5+, Vite 5+, Tailwind 3+, @tanstack/react-query 5+, zustand (or context) for auth store, lucide-react
- Test stack: vitest + @testing-library/react + jsdom

Conventions and Guardrails:
- Strict TypeScript, no any.
- DTO types in src/types map 1:1 to backend responses and inputs.
- http() throws { message, status } on non-2xx.
- Hooks return typed data and surface errors.
- No UI library bloat. Build small primitives in src/components/ui.
- No dead code. No console.log in final output.
- Keep files and symbols small and cohesive.
- Accessibility: all inputs paired with Label, aria-invalid on errors, focus outlines visible.
- Theming via data-theme or class on html/body and Tailwind dark: selector.

Directory (expected):
- index.html
- package.json
- tsconfig.json
- vite.config.ts
- tailwind.config.cjs
- postcss.config.cjs
- .env.example
- src/
  - main.tsx
  - styles.css
  - app/
    - App.tsx
    - router.tsx
    - layouts/DashboardLayout.tsx
    - providers/ApiProvider.tsx
    - providers/ThemeProvider.tsx
    - providers/ToastProvider.tsx
    - store/auth.ts
  - components/
    - ui/ Button.tsx, Input.tsx, Label.tsx, Select.tsx, Textarea.tsx, Badge.tsx, Card.tsx, Table.tsx, Tabs.tsx, Modal.tsx, Toast.tsx, Skeleton.tsx
    - common/ Toolbar.tsx, SearchInput.tsx, Pagination.tsx, EmptyState.tsx, ConfirmDialog.tsx, DateRangePicker.tsx
  - hooks/
    - useAuth.ts
    - useMissions.ts, useMissionActions.ts
    - useTemplates.ts
    - useAssignments.ts
    - usePlanning.ts
    - useFiles.ts
    - useUsers.ts
    - useAvailability.ts
    - useAccounting.ts
  - lib/
    - http.ts
    - download.ts (helpers for ICS/CSV downloads)
    - dates.ts (ISO helpers)
  - pages/
    - Login.tsx
    - Dashboard.tsx
    - Missions.tsx
    - MissionDetail.tsx
    - Templates.tsx
    - Planning.tsx
    - AdminUsers.tsx
    - Availability.tsx
    - Accounting.tsx
    - Settings.tsx
    - NotFound.tsx
  - types/
    - auth.ts, user.ts, mission.ts, assignment.ts, template.ts, files.ts, planning.ts, accounting.ts, common.ts
  - services/
    - auth.ts, users.ts, missions.ts, missionActions.ts, templates.ts, assignments.ts, planning.ts, files.ts, availability.ts, accounting.ts
  - tests/
    - hooks/__tests__/useMissions.test.ts
    - components/ui/__tests__/Button.test.tsx
    - setupTests.ts

Backend contract (assume base http://localhost:8001):
- POST /auth/token-json {username, password} -> {access_token}
- GET /auth/me -> UserOut
- PUT /auth/me/prefs -> 204
- GET /missions (q,status,date_from,date_to,page,per_page) -> {items,total,page,per_page}
- POST /missions -> MissionOut
- GET /missions/:id -> MissionOut
- PUT /missions/:id -> MissionOut
- DELETE /missions/:id -> 204
- POST /missions/:id/publish -> 200
- POST /missions/:id/duplicate -> MissionOut
- POST /missions/:id/close -> 200
- POST /missions/:id/cancel -> 200
- GET /missions/:id/ics -> text/calendar
- GET /missions/:id/files -> FileMeta[]
- POST /missions/:id/files (multipart) -> FileMeta
- DELETE /missions/:id/files/:fid -> 204
- POST /missions/:id/assign -> AssignmentOut
- PUT /assignments/:aid -> AssignmentOut
- GET /templates -> list
- POST /templates -> TemplateOut
- GET /templates/:id -> TemplateOut
- PUT /templates/:id -> TemplateOut
- DELETE /templates/:id -> 204
- POST /templates/:id/apply -> MissionOut
- GET /planning/week?start=ISO -> WeekOut
- POST /planning/publish-range -> 200
- GET /admin/users -> list
- POST /admin/users -> UserOut
- PUT /admin/users/:id -> UserOut
- DELETE /admin/users/:id -> 204
- GET /me/availability -> rules
- PUT /me/availability -> rules
- GET /me/availability.ics -> text/calendar
- GET /accounting/summary?date_from&date_to -> SummaryOut
- GET /accounting/export.csv?date_from&date_to -> text/csv

============================================================
0) MASTER UI PROMPT (all-in-one)
============================================================

SYSTEM:
You are Codex, a senior frontend engineer. Output only ASCII. Produce production-grade React + TypeScript + Vite code. No emojis.

USER:
Build all pages, data layer, routing, UI kit, and tests as specified above. Follow the Directory and Backend contract. Implement light/dark theme, toasts, error boundaries, and protected routes. Do not invent endpoints. If an endpoint returns an error, surface message in a toast and inline form error when relevant.

Acceptance and demo:
- npm run dev on :5173
- .env.example contains VITE_API_BASE=http://localhost:8001
- Login with admin/admin works and redirects to /dashboard
- Lists render real data, actions mutate and show toasts, errors handled.

============================================================
1) SCAFFOLD + CONFIG
============================================================

Create boilerplate:
- package.json scripts: dev, build, preview, lint, typecheck, test
- tsconfig.json (strict true)
- vite.config.ts with React plugin
- index.html wiring #root
- tailwind.config.cjs, postcss.config.cjs, src/styles.css
- src/main.tsx mounts <App/>
- src/app/App.tsx sets providers (QueryClientProvider, ThemeProvider, ToastProvider), Router
- src/app/router.tsx with public /login and protected routes under DashboardLayout
- src/app/layouts/DashboardLayout.tsx with Topbar and container
- src/app/providers/ApiProvider.tsx, ThemeProvider.tsx, ToastProvider.tsx
- .env.example -> VITE_API_BASE=http://localhost:8001

Checks:
- npm run dev renders Topbar with "Coulisses Crew"

============================================================
2) HTTP CLIENT + AUTH STORE
============================================================

Implement:
- src/lib/http.ts
  - export const API_BASE = import.meta.env.VITE_API_BASE
  - export async function http<T>(path: string, opts?: { method?: string; body?: any; headers?: Record<string,string>; }): Promise<T>
  - JSON body/headers auto, parse JSON/text by content-type
  - On 401: attempt single refresh path if available else logout callback, then throw
- src/app/store/auth.ts (zustand or context)
  - state: { token?: string; me?: User; login(u,p): Promise<void>; logout(): void; setPrefs(): Promise<void> }
  - persist token in localStorage, bootstrap on load
- src/hooks/useAuth.ts
  - useLogin -> POST /auth/token-json
  - useMe -> GET /auth/me
  - useUpdatePrefs -> PUT /auth/me/prefs
- UI: Login page form with validation; after login, fetch /auth/me then redirect /dashboard

Checks:
- admin/admin logs in; Topbar shows user name

============================================================
3) SERVICES + HOOKS (typed)
============================================================

- Define DTOs in src/types/*.ts: User, Mission, Assignment, Template, FileMeta, WeekOut, SummaryOut, Pagination<T>, etc.
- Services modules mapping 1:1 to backend endpoints (auth, users, missions, missionActions, templates, assignments, planning, files, availability, accounting).
- Hooks using @tanstack/react-query:
  - useMissionsList(params), useMission(id)
  - useCreateMission, useUpdateMission, useDeleteMission
  - usePublish, useDuplicate, useClose, useCancel
  - useTemplatesList/get/create/update/delete/apply
  - useAssignmentsAdd/update
  - usePlanningWeek(startISO)
  - usePublishRange
  - useFilesList/upload/ics
  - useUsers CRUD
  - useAvailability get/update/ics
  - useAccounting summary/exportCsv

Constraints:
- Throw {message,status} on errors
- Full typing, no any

Checks:
- Typecheck passes; dev console clean

============================================================
4) UI KIT MINIMAL
============================================================

Build primitives:
- src/components/ui/{Button,Input,Label,Select,Textarea,Badge,Card,Table,Tabs,Modal,Toast,Skeleton}.tsx
- src/components/common/{Toolbar,SearchInput,Pagination,EmptyState,ConfirmDialog,DateRangePicker}.tsx
- Use lucide-react icons in Button variants, aria-* props, focus-visible rings

Checks:
- Add route /_dev to showcase components

============================================================
5) MISSIONS LIST
============================================================

Page /missions:
- Toolbar: filters q,status,date_from,date_to + SearchInput + "New mission" button
- Table columns: Title, Start, End, Status, Positions, Actions
- Row actions (dropdown): Publish, Duplicate (dialog {title_suffix, shift_days}), Close, Cancel (both confirm)
- Pagination bottom
- Loading skeleton, EmptyState

Checks:
- Actions call respective endpoints, toast on success/error

============================================================
6) MISSION DETAIL (tabs)
============================================================

Route /missions/:id:
- Tabs: Overview | Assignments | Files

Overview:
- Form fields: Title, Start, End, Location, Notes; Status read-only; Save -> PUT

Assignments:
- Table: User, Role, Status, RespondedAt, Channel
- Add assignment dialog: role_label, user_id or invite by email
- Update status inline or via row menu

Files:
- Thumbnails grid (PDF/JPG/PNG)
- Upload multiple files <= 5MB each
- Delete file
- Export ICS -> download helper

Checks:
- Unsaved changes guard
- Toasters on mutate

============================================================
7) TEMPLATES (CRUD + APPLY)
============================================================

- /templates list with search, New template
- Template form: Title, Positions[] {label, count>=1, skills{}}, Notes
- Row actions: Edit, Delete (confirm), Apply
- Apply dialog: start, end, title_override?, notes? -> navigate to created mission

Checks:
- Validations enforced client-side

============================================================
8) PLANNING WEEK
============================================================

- /planning with week selector (prev/next, date picker)
- Week grid: columns days, compact rows; highlight current day; sticky header; responsive
- Publish Range button -> dialog {start,end,message?} -> POST /planning/publish-range
- Loading skeleton; inline error alerts

============================================================
9) ADMIN USERS
============================================================

- /admin/users table: Name, Email, Role, CreatedAt, Actions
- Create user dialog (email, name, role)
- Edit role inline
- Delete with confirm
- Sort by CreatedAt desc by default

============================================================
10) AVAILABILITY, ACCOUNTING, SETTINGS
============================================================

/availability:
- View/edit rules; PUT /me/availability
- Export ICS button

/accounting:
- KPI cards (missions count, hours, total estimated)
- Date range filters
- Export CSV button

/settings:
- Profile view (name, email read-only if by backend rules)
- Notification prefs: email?, telegram?, telegram_chat_id?
- Save -> PUT /auth/me/prefs
- Logout button

============================================================
11) CROSS-CUTTING: ERRORS, TOASTS, A11Y, THEME
============================================================

- Global ErrorBoundary + per-route error elements
- ToastProvider hooked to mutation outcomes and http errors
- Accessible forms (Label + Input, aria-invalid on errors)
- ThemeProvider with dark mode toggle in Topbar
- 404 NotFound route

============================================================
12) TESTS + COMMANDS + README
============================================================

- Tests:
  - src/hooks/__tests__/useMissions.test.ts: mock http, assert list fetch and error path
  - src/components/ui/__tests__/Button.test.tsx: render variants
- Commands:
  - npm run build -> success
  - npm run typecheck -> no errors
  - npm test -> green
- README:
  - Setup, env (.env with VITE_API_BASE), run, build, routes, troubleshooting

============================================================
Local run reminder
============================================================

Backend: http://localhost:8001
Frontend: http://localhost:5173
.env frontend: VITE_API_BASE=http://localhost:8001

Deliver all code now. Ensure npm run build passes before finishing.
