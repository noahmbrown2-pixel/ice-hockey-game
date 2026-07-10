# PPDO Development Team - Agent Index

> Full-stack Convex + Next.js development team for the Provincial Planning and Development Office (PPDO) management system.

## Quick Reference

| Agent | Specialty | Primary Focus |
|-------|-----------|---------------|
| [Backend/Convex Architect](#1-backendconvex-architect) | Database & API | Convex schema, mutations, queries |
| [Frontend/React Specialist](#2-frontendreact-specialist) | UI Development | Next.js pages, React components |
| [UI/UX Designer](#3-uiux-designer) | Design System | Shadcn/ui, Tailwind, accessibility |
| [Security & Auth Specialist](#4-security--auth-specialist) | Security | Authentication, RBAC, audit logs |
| [Data & Business Logic Engineer](#5-data--business-logic-engineer) | Domain Logic | Aggregations, workflows, calculations |
| [QA & Testing Agent](#6-qa--testing-agent) | Quality | Testing, coverage, bug prevention |
| [Print & Export Specialist](#7-print--export-specialist) | Documents | PDF generation, media, canvas |
| [DevOps & Performance Agent](#8-devops--performance-agent) | Operations | Deployment, CI/CD, monitoring |
| [Product & Documentation Lead](#9-product--documentation-lead) | Product Mgmt | Requirements, docs, PPDO domain |
| [Search Engine Specialist](#10-search-engine-specialist) | Search Systems | Full-text search, facets, indexing |

---

## Team Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    PPDO Development Team                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │  Backend/   │    │  Frontend/  │    │   UI/UX     │         │
│  │   Convex    │◄──►│    React    │◄──►│  Designer   │         │
│  │  Architect  │    │ Specialist  │    │             │         │
│  └──────┬──────┘    └──────┬──────┘    └─────────────┘         │
│         │                  │                                    │
│         ▼                  ▼                                    │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │  Security   │    │    Data     │    │    Print    │         │
│  │   & Auth    │◄──►│  & Business │◄──►│   & Export  │         │
│  │  Specialist  │    │   Logic     │    │ Specialist  │         │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘         │
│         │                  │                  │                │
│         ▼                  ▼                  ▼                │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │     QA      │    │   DevOps    │    │   Search    │         │
│  │  & Testing  │◄──►│ & Perform.  │◄──►│   Engine    │         │
│  │  Agent      │    │    Agent    │    │ Specialist  │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│                                                                 │
│              ┌─────────────────────────┐                        │
│              │  Product & Documentation │                       │
│              │         Lead            │                        │
│              │   (Team Coordinator)    │                        │
│              └─────────────────────────┘                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Agent Details

### 1. Backend/Convex Architect
**File:** [`backend-convex-architect.md`](./backend-convex-architect.md)

**Expertise:**
- Convex schema design & validators
- Mutations, queries, and actions
- Database indexing strategies
- Error handling patterns

**Key Areas:**
```
convex/
├── schema.ts, schema/*.ts    # Database schemas
├── lib/rbac.ts               # Access control
├── lib/*Aggregation.ts       # Data aggregation
└── *.ts                      # API functions
```

**When to Use:** Creating new database tables, writing Convex functions, optimizing queries.

---

### 2. Frontend/React Specialist
**File:** [`frontend-react-specialist.md`](./frontend-react-specialist.md)

**Expertise:**
- Next.js 16 App Router
- React 19 Server/Client Components
- Convex React hooks
- Form handling with react-hook-form + Zod

**Key Areas:**
```
app/
├── layout.tsx, page.tsx      # Root layout/page
├── (auth)/                   # Auth routes
├── (dashboard)/              # Dashboard routes
└── globals.css               # Global styles

components/
├── forms/                    # Form components
└── tables/                   # Data tables
```

**When to Use:** Building pages, creating components, handling navigation, managing state.

---

### 3. UI/UX Designer
**File:** [`ui-ux-designer.md`](./ui-ux-designer.md)

**Expertise:**
- Shadcn/ui component customization
- Radix UI primitives
- Tailwind CSS 4
- Accessibility (WCAG 2.1)
- Framer Motion animations

**Key Areas:**
```
components/ui/                # Shadcn components
├── button.tsx
├── dialog.tsx
├── table.tsx
└── ...

components.json               # Shadcn config
app/globals.css              # CSS variables
```

**When to Use:** Designing UI, creating reusable components, implementing themes, ensuring accessibility.

---

### 4. Security & Auth Specialist
**File:** [`security-auth-specialist.md`](./security-auth-specialist.md)

**Expertise:**
- @convex-dev/auth integration
- Role-Based Access Control (RBAC)
- Password reset flows
- Audit logging
- Account security

**Key Areas:**
```
convex/
├── auth.ts, auth.config.ts   # Authentication
├── lib/rbac.ts               # Permission system
├── permissions.ts            # Permission CRUD
├── loginTrail.ts             # Audit logging
├── passwordReset*.ts         # Password recovery
└── *Access.ts                # Access control

middleware.ts                 # Route protection
```

**When to Use:** Implementing auth, adding permissions, securing endpoints, audit requirements.

---

### 5. Data & Business Logic Engineer
**File:** [`data-business-logic-engineer.md`](./data-business-logic-engineer.md)

**Expertise:**
- PPDO domain knowledge
- Budget/project aggregations
- Fiscal year calculations
- Status workflow management
- Activity tracking

**Key Areas:**
```
convex/
├── lib/budgetAggregation.ts  # Budget calculations
├── lib/projectAggregation.ts # Project summaries
├── lib/statusValidation.ts   # Status rules
├── lib/*ActivityLogger.ts    # Change tracking
├── budgetItems.ts            # Budget operations
├── projects.ts               # Project operations
├── fiscalYears.ts            # Fiscal management
└── trustFunds.ts             # Trust fund ops

constants/                    # Business constants
data/                         # Seed data
```

**When to Use:** Implementing business rules, calculating aggregations, managing workflows.

---

### 6. QA & Testing Agent
**File:** [`qa-testing-agent.md`](./qa-testing-agent.md)

**Expertise:**
- Jest unit testing
- React Testing Library
- Integration testing
- Test fixtures & mocking
- Code quality standards

**Key Areas:**
```
jest.config.js                # Jest config
jest.setup.js                 # Test setup

__tests__/                    # Test directory
├── unit/                     # Unit tests
├── integration/              # Integration tests
├── components/               # Component tests
└── fixtures/                 # Test data
```

**When to Use:** Writing tests, setting up test infrastructure, ensuring code quality.

---

### 7. Print & Export Specialist
**File:** [`print-export-specialist.md`](./print-export-specialist.md)

**Expertise:**
- jsPDF document generation
- html2canvas rendering
- Canvas layer management
- Media uploads (Convex storage)
- Print styling

**Key Areas:**
```
components/
├── print/                    # Print components
│   ├── PrintPreviewModal.tsx
│   └── PrintPreviewToolbar.tsx
├── canvas/                   # Canvas editor
└── export/                   # Export controls

lib/
├── pdf/                      # PDF utilities
└── canvas/                   # Canvas utilities

convex/media.ts               # Media storage
PDF_EXPORT_GUIDE.md           # Documentation
```

**When to Use:** Generating PDFs, implementing print preview, handling file uploads, canvas features.

---

### 8. DevOps & Performance Agent
**File:** [`devops-performance-agent.md`](./devops-performance-agent.md)

**Expertise:**
- Next.js build optimization
- Convex deployment
- GitHub Actions CI/CD
- Performance monitoring
- Error tracking

**Key Areas:**
```
next.config.ts                # Next.js config
tsconfig.json                 # TypeScript config
package.json                  # Scripts/deps

.github/workflows/            # CI/CD pipelines
├── ci.yml
├── deploy-preview.yml
└── deploy-prod.yml

lib/monitoring/               # Monitoring utils
├── logger.ts
└── errorTracking.ts
```

**When to Use:** Deploying, optimizing builds, setting up CI/CD, monitoring production.

---

### 9. Product & Documentation Lead
**File:** [`product-documentation-lead.md`](./product-documentation-lead.md)

**Expertise:**
- Product requirements and PRD creation
- Technical and user documentation
- PPDO domain knowledge and government workflows
- Compliance and audit documentation
- Stakeholder coordination

**Key Areas:**
```
.guide_md/                    # Process guides and standards
DOCS/                         # Project documentation
├── requirements/             # PRDs, BRDs, user stories
├── architecture/             # System documentation
├── user-guides/              # End-user manuals
└── processes/                # SOPs and workflows

*.md                          # Root documentation files
```

**When to Use:** Defining requirements, creating documentation, coordinating features, PPDO domain questions.

---

### 10. Search Engine Specialist
**File:** [`search-engine-specialist.md`](./search-engine-specialist.md)

**Expertise:**
- Polymorphic search index architecture
- Relevance ranking algorithms (TF-IDF + organizational proximity)
- Typeahead/predictive search
- Faceted search with dynamic filters
- URL-first state management
- Real-time search with Convex

**Key Areas:**
```
convex/
├── search/                   # Search queries & indexing
│   ├── index.ts
│   ├── ranking.ts
│   └── facets.ts
├── lib/searchIndex.ts        # Index management
└── schema.ts                 # Search tables

components/search/
├── SearchInput.tsx           # Global typeahead
├── SearchResults.tsx         # Polymorphic feed
├── FacetSidebar.tsx          # Dynamic filters
└── hooks/
    ├── useSearchRouter.ts    # URL state sync
    └── useFacetEngine.ts     # Filter logic

app/(dashboard)/search/       # Search page
```

**When to Use:** Building search functionality, implementing filters, optimizing search performance, relevance tuning.

---

## Agent Collaboration Matrix

Shows which agents commonly work together:

| Task | Primary Agent | Supporting Agents |
|------|---------------|-------------------|
| New database table | Backend Architect | Security, Data Engineer |
| New page/route | Frontend Specialist | UI/UX, Backend Architect |
| New component | UI/UX Designer | Frontend Specialist |
| Add authentication | Security Specialist | Backend, Frontend |
| Business calculations | Data Engineer | Backend Architect |
| PDF export feature | Print Specialist | Frontend, Data Engineer |
| **Search functionality** | **Search Specialist** | **Backend, Frontend, UI/UX** |
| Write tests | QA Agent | All agents |
| Deploy to production | DevOps Agent | All agents |
| Define requirements | Product Lead | All agents |
| Create documentation | Product Lead | QA Agent |

---

## Technology Stack Reference

### Frontend
- **Framework:** Next.js 16 (App Router)
- **UI Library:** React 19
- **Styling:** Tailwind CSS 4
- **Components:** Shadcn/ui + Radix UI
- **Forms:** react-hook-form + Zod
- **Animation:** Framer Motion

### Backend
- **Database:** Convex
- **Auth:** @convex-dev/auth
- **File Storage:** Convex Storage

### Search
- **Architecture:** Polymorphic index with sharded verticals
- **Ranking:** TF-IDF + Organizational Proximity + Recency
- **UI Pattern:** Three-pane layout (Typeahead, Sidebar, Feed)

### Export/Media
- **PDF:** jsPDF
- **Screenshots:** html2canvas, dom-to-image-more
- **Media:** Puppeteer (server-side)

### DevOps
- **Build:** Next.js
- **Deploy:** Vercel + Convex Cloud
- **CI/CD:** GitHub Actions

---

## Usage Guidelines

### Starting a New Feature

1. **Identify the primary agent** based on the feature type
2. **Read the agent's documentation** for patterns and best practices
3. **Check integration points** to see which other agents may be involved
4. **Follow the code patterns** provided in each agent file

### Example: Adding a New Budget Report

1. **Data Engineer** - Define aggregation logic
2. **Backend Architect** - Create Convex query
3. **Frontend Specialist** - Build report page
4. **Print Specialist** - Add PDF export
5. **QA Agent** - Write tests
6. **DevOps Agent** - Deploy

### Example: Implementing Global Search

1. **Search Specialist** - Design index schema and ranking algorithm
2. **Backend Architect** - Implement search indexes in Convex
3. **UI/UX Designer** - Design search interface components
4. **Frontend Specialist** - Build search page with URL state
5. **Security Agent** - Add RBAC to search results
6. **QA Agent** - Test search functionality
7. **DevOps Agent** - Monitor search performance

---

## Quick Commands

```bash
# Development
npm run dev              # Start frontend + backend
npm run dev:frontend     # Start Next.js only
npm run dev:backend      # Start Convex only

# Build & Deploy
npm run build            # Build for production
npm run lint             # Run ESLint

# Testing (when configured)
npm test                 # Run all tests
npm test -- --coverage   # With coverage report
```

---

## Contact & Resources

- **Convex Docs:** https://docs.convex.dev
- **Next.js Docs:** https://nextjs.org/docs
- **Shadcn/ui:** https://ui.shadcn.com
- **Tailwind CSS:** https://tailwindcss.com
- **Search Architecture Reference:** See `docs/search-system/` documentation

---

*Last updated: February 2025*
*Team size: 10 specialized agents*
*Project: PPDO Next.js + Convex with Facebook-class Search*
