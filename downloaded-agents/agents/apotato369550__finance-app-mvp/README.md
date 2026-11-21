# FinanceEd PH Agent System

This directory contains the configuration for the specialized agent system that manages development of FinanceEd PH.

## Agent Overview

### Foreman (You)
**Model:** Claude Sonnet 4.5 (Purple)
**Role:** Project orchestrator and coordination hub
**Manages:** CLAUDE.md, agent delegation, project organization

### Planner
**Model:** Claude Sonnet 4 (Blue)
**Role:** Technical architecture and planning specialist
**Creates:** Detailed implementation plans in `/planner/`
**Config:** `planner.md`

### Builder
**Model:** Claude Haiku (Green)
**Role:** Code implementation specialist
**Creates:** Implementation logs in `/builder/`
**Config:** `builder.md`

### Validator
**Model:** Claude Haiku (Red)
**Role:** Quality assurance and testing specialist
**Creates:** Validation reports in `/validator/`
**Config:** `validator.md`

### Debugger
**Model:** Claude Haiku (Yellow)
**Role:** Bug resolution specialist
**Creates:** Debug logs in `/debugger/`
**Config:** `debugger.md`

## How to Use This System

### For New Features

1. **Request to Foreman:** "I need [feature description]"
2. **Foreman delegates to Planner:** Creates detailed implementation plan
3. **Planner creates plan:** Saves to `/planner/dd-mm-yyyy_feature.md`
4. **Foreman delegates to Builder:** Executes the plan
5. **Builder implements:** Saves log to `/builder/dd-mm-yyyy_feature.md`
6. **Foreman delegates to Validator:** Tests the implementation
7. **Validator verifies:** Saves report to `/validator/dd-mm-yyyy_feature.md`
8. **If issues found, Foreman delegates to Debugger:** Fixes bugs
9. **Debugger resolves:** Saves log to `/debugger/dd-mm-yyyy_feature.md`
10. **Return to Validator** until PASS

### For Bug Fixes

1. **Report bug to Foreman:** "There's a bug in [feature]"
2. **Foreman delegates to Validator:** Reproduces and documents issue
3. **Validator creates report:** Saves to `/validator/dd-mm-yyyy_bug-report.md`
4. **Foreman delegates to Debugger:** Fixes the bug
5. **Debugger resolves:** Saves log to `/debugger/dd-mm-yyyy_bug-fix.md`
6. **Validator verifies fix:** Updates validation report

### For Planning Only

1. **Request to Foreman:** "Can you plan out [feature] but don't implement yet?"
2. **Foreman delegates to Planner:** Creates implementation plan
3. **Planner creates plan:** Saves to `/planner/dd-mm-yyyy_feature.md`
4. **Review plan** before proceeding

## Agent Communication Flow

```
User/Foreman
    ↓
Planner → Creates architectural plans
    ↓
Builder → Implements code
    ↓
Validator → Tests and verifies
    ↓
Debugger → Fixes issues
    ↓
Validator → Re-tests
    ↓
Complete ✓
```

## Project Structure

```
/home/jay/Desktop/Coding Stuff/finance-app-mvp/
├── CLAUDE.md                    # Project context (managed by Foreman)
├── .claude/
│   └── agents/                  # Agent configurations
│       ├── README.md           # This file
│       ├── planner.md          # Planner agent config
│       ├── builder.md          # Builder agent config
│       ├── validator.md        # Validator agent config
│       └── debugger.md         # Debugger agent config
├── planner/                     # Planning logs
│   ├── README.md
│   └── dd-mm-yyyy_*.md
├── builder/                     # Implementation logs
│   ├── README.md
│   └── dd-mm-yyyy_*.md
├── validator/                   # Validation reports
│   ├── README.md
│   └── dd-mm-yyyy_*.md
└── debugger/                    # Debug logs
    ├── README.md
    └── dd-mm-yyyy_*.md
```

## Key Principles

### Context Economy
- Keep logs concise (bullet points preferred)
- Use Gemini for log generation when possible
- CLAUDE.md stays focused on enduring context only
- No implementation details in CLAUDE.md

### Quality Gates
- Builder → Validator (must pass tests)
- Validator → Debugger (must fix critical/major issues)
- Debugger → Validator (must verify fix)

### Dual-Mode Support
- All features must work in dev (mock) mode
- All features must work in production mode
- Agents always test both modes

### Documentation
- Plans before implementation
- Logs after implementation
- Issues before debugging
- Verification after debugging

## Example Workflows

### Adding API Endpoint

```
User: "Add a GET /api/user/profile endpoint"
  ↓
Foreman → Planner: "Plan user profile endpoint"
  ↓
Planner: Creates plan with auth, validation, dual-mode support
         Saves to /planner/03-11-2025_user-profile-endpoint.md
  ↓
Foreman → Builder: "Implement user profile endpoint per plan"
  ↓
Builder: Creates route.ts, implements handlers
         Saves log to /builder/03-11-2025_user-profile-endpoint.md
  ↓
Foreman → Validator: "Test user profile endpoint"
  ↓
Validator: Tests both modes, verifies auth, checks responses
           Saves report to /validator/03-11-2025_user-profile-endpoint.md
  ↓
Complete ✓
```

### Fixing a Bug

```
User: "Login button doesn't work on mobile"
  ↓
Foreman → Validator: "Reproduce and document login button issue"
  ↓
Validator: Tests on mobile, documents exact issue
           Saves report to /validator/03-11-2025_login-button-bug.md
  ↓
Foreman → Debugger: "Fix login button mobile issue per validator report"
  ↓
Debugger: Identifies CSS issue, fixes responsive classes
          Saves log to /debugger/03-11-2025_login-button-fix.md
  ↓
Foreman → Validator: "Verify login button fix"
  ↓
Validator: Tests on mobile, confirms fixed
           Updates validation report with PASS
  ↓
Complete ✓
```

## Tips for Working with Agents

### With Planner
- Give complete requirements
- Mention existing patterns to follow
- Specify if performance or security critical
- Request specific implementation approach if needed

### With Builder
- Provide complete plan reference
- Note any urgent or high-priority tasks
- Specify if deviation from plan is OK
- Request specific code patterns if needed

### With Validator
- Provide acceptance criteria clearly
- Specify test environments needed
- Note any edge cases to test
- Request specific validation focus if needed

### With Debugger
- Provide complete Validator report reference
- Note urgency/severity
- Suggest debugging approach if you have insight
- Request escalation to Planner for complex issues

## Common Commands

### Invoking Agents
```
# Direct delegation (as Foreman)
"Planner: Create implementation plan for user dashboard"
"Builder: Implement the user dashboard per the plan"
"Validator: Test the user dashboard implementation"
"Debugger: Fix the authentication issue from validator report"
```

### Checking Progress
```
"What's the status of [feature]?"
"Show me recent logs"
"What issues are outstanding?"
```

### Getting Plans
```
"Plan out [feature] but don't implement yet"
"Show me the implementation plan for [feature]"
```

## Agent Capabilities

### Planner Can:
- Design complex architectures
- Break down ambiguous requirements
- Plan multi-phase implementations
- Optimize for less capable executors
- Identify edge cases and risks

### Builder Can:
- Write production-quality code
- Follow patterns consistently
- Make reasonable implementation decisions
- Handle TypeScript and React complexity
- Delegate docs to Gemini

### Validator Can:
- Run automated test suites
- Perform manual testing
- Test both dev and production modes
- Document bugs systematically
- Fix minor issues independently

### Debugger Can:
- Investigate and reproduce bugs
- Identify root causes
- Implement targeted fixes
- Verify fixes work
- Delegate docs to Gemini

## Quality Standards

All agents follow:
- TypeScript strict mode
- Next.js 14 best practices
- Dual-mode architecture (dev + prod)
- Mobile-first responsive design
- Comprehensive error handling
- Security best practices

## Getting Help

- Read CLAUDE.md for project context
- Read agent config files (.md) for detailed instructions
- Read existing logs for examples
- Check code patterns in similar features
- Ask Foreman for clarification or guidance

## Maintenance

### Updating Agent Configs
Only Foreman updates agent configuration files in `.claude/agents/`

### Updating Project Context
Only Foreman updates CLAUDE.md when architectural principles or project vision changes

### Cleaning Up Logs
Periodically archive old logs if directory gets cluttered (Foreman's discretion)

---

This system is designed for efficient, high-quality software delivery through specialized agents working in coordination. Each agent has specific expertise and responsibilities, creating a complete development pipeline from planning through implementation to testing and debugging.
