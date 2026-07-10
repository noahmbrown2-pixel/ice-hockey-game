# Claude Agent Team Configuration

This directory contains multi-agent workflow configuration for ng-playground development.

## 📁 Files

| File | Purpose |
|------|---------|
| **frontend-specialist.md** | Frontend Agent specialization: Angular, TypeScript, SCSS, testing |
| **backend-specialist.md** | Backend Agent specialization: .NET 9, C#, APIs, databases |
| **COORDINATION.md** | Team structure, communication protocol, decision matrix |
| **WORKFLOW.md** | How to use agents, invocation patterns, workflow examples |
| **README.md** | This file - quick reference |

## 🚀 Quick Start: Using the Agent Team

### For Frontend Work
```
Frontend Specialist: [Your task description]
```
**Example:**
```
Frontend Specialist: Create a UserDetailComponent that displays a single user's information fetched from GET /api/users/:id
```

### For Backend Work
```
Backend Specialist: [Your task description]
```
**Example:**
```
Backend Specialist: Create a POST /api/users endpoint that accepts name and email, validates the input, and returns the created user with ID
```

### For Architecture Decisions
```
Plan Agent: [Your question]
```
**Example:**
```
Plan Agent: How should we structure error handling across the frontend and backend?
```

### For Code Analysis
```
Explore Agent: [Your analysis request]
```
**Example:**
```
Explore Agent: Find all HTTP service calls in the frontend and identify any that lack error handling
```

## 👥 Agent Team

### Frontend Specialist
- **Focus**: `apps/frontend/` — Angular components, routing, styling
- **Skills**: Angular 19, TypeScript, SCSS, HTTP client, RxJS
- **Typical Tasks**: Components, services, routing, testing, styling

### Backend Specialist
- **Focus**: `apps/backend/` — .NET APIs, data models, business logic
- **Skills**: .NET 9, C#, Minimal APIs, EF Core, Azure SQL
- **Typical Tasks**: Endpoints, models, validation, database, testing

### Plan Agent
- **Focus**: Architecture, design, cross-team decisions
- **Skills**: System design, trade-off analysis, complexity assessment
- **Typical Tasks**: Feature design, refactoring plans, tech decisions

### Explore Agent
- **Focus**: Understanding and analyzing existing code
- **Skills**: Pattern matching, codebase navigation, impact analysis
- **Typical Tasks**: Finding code, understanding patterns, optimization analysis

## 📋 Common Workflows

### Add a New Feature (3 steps)
```
1. Plan Agent: Design the feature and API contract
2. Backend Specialist: Implement the API endpoint
3. Frontend Specialist: Create UI component consuming the endpoint
```

### Fix a Bug (2-3 steps)
```
1. Explore Agent: Locate related code and understand context
2. Specialist Agent: Fix the issue (Frontend or Backend)
3. Both: Verify integration works correctly
```

### Optimize Performance
```
1. Explore Agent: Identify bottlenecks
2. Specialist Agent: Optimize code
3. Plan Agent: Review architectural implications
```

## 🔗 Integration Points

Frontend calls Backend at:
- `http://localhost:5000/api/health` — Health check
- `http://localhost:5000/api/hello` — Sample endpoint

Both services must run simultaneously during development.

## 📚 See Also

- `CLAUDE.md` — Project overview and development guide
- `README.md` — Getting started guide
- `COORDINATION.md` — Detailed team coordination and communication
- `WORKFLOW.md` — Detailed agent usage patterns and examples

## 💡 Tips

- **Be Specific**: Tell agents exactly which component/endpoint/feature
- **Reference Files**: Mention specific file paths when relevant
- **Verify Integration**: When switching agents, ensure both sides work together
- **Use Plan Agent**: Before major changes, consult Plan Agent for architecture review
- **Document Contracts**: When adding APIs, note the request/response format

---

**Version**: 1.0
**Last Updated**: 2026-03-05
