# Claude Code Agents Catalog

Specialized agents for task automation, code review, research, documentation, and complete workflows.

## Overview

This directory contains **17 specialized agents** organized into 6 functional categories. Each agent is an autonomous task executor with specific expertise and behavioral patterns.

**Total Agents:** 17
**Categories:** 6
**Last Updated:** 2024-11-24

---

## Quick Reference by Category

| Category | Count | Purpose |
|----------|-------|---------|
| [Review](#review-agents) | 7 | Code review, architecture assessment, security audits, performance analysis |
| [Research](#research-agents) | 4 | Web research, repository analysis, framework documentation, best practices |
| [Documentation](#documentation-agents) | 1 | Creating comprehensive technical documentation |
| [Planning](#planning-agents) | 1 | Refactoring planning and strategy |
| [Error Fixing](#error-fixing-agents) | 1 | Frontend error diagnosis and resolution |
| [Complete Workflows](#complete-workflow-agents) | 3 | End-to-end task automation (data integrity, feedback, patterns) |

---

## Review Agents

**Location:** `_review/`
**Count:** 7 agents
**Purpose:** Systematic review of code, architecture, plans, security, and performance

### architecture-strategist.md

**When to use:** Architecture decisions, system design reviews, scalability planning

**Capabilities:**
- Reviews architectural decisions for alignment with best practices
- Assesses system design patterns and trade-offs
- Evaluates scalability and maintainability
- Identifies architectural anti-patterns
- Recommends design improvements

**Example use case:** "Review the proposed microservices architecture for our healthcare platform"

---

### code-architecture-reviewer.md

**When to use:** Post-implementation code reviews, structural assessments

**Capabilities:**
- Reviews code structure and organization
- Evaluates adherence to SOLID principles
- Identifies coupling and cohesion issues
- Assesses naming conventions and clarity
- Recommends refactoring opportunities

**Example use case:** "Review the patient registration module for architectural consistency"

---

### code-simplicity-reviewer.md

**When to use:** Complexity reduction, readability improvements

**Capabilities:**
- Identifies overly complex code
- Suggests simplification strategies
- Evaluates cognitive load
- Recommends clearer alternatives
- Balances simplicity with functionality

**Example use case:** "Simplify this inventory management logic without losing functionality"

---

### development-plan-reviewer.md

**When to use:** Pre-implementation plan validation, sprint planning, technical specifications

**Capabilities:**
- Reviews development plans for completeness
- Validates resource estimates and timelines
- Identifies risks and mitigation strategies
- Assesses technical feasibility
- Checks standards compliance (WCAG, security, healthcare)

**Example use case:** "Review this 2-week sprint plan for the appointment reminder feature"

---

### every-style-editor.md

**When to use:** Style consistency enforcement, linting, formatting reviews

**Capabilities:**
- Reviews code for style compliance
- Enforces coding standards
- Identifies formatting inconsistencies
- Recommends style improvements
- Applies project-specific conventions

**Example use case:** "Ensure this codebase follows our TypeScript style guide"

---

### performance-oracle.md

**When to use:** Performance optimization, bottleneck identification

**Capabilities:**
- Identifies performance bottlenecks
- Analyzes algorithmic complexity
- Recommends optimization strategies
- Evaluates database query efficiency
- Assesses frontend rendering performance

**Example use case:** "Find and fix performance issues in the patient search functionality"

---

### security-sentinel.md

**When to use:** Security audits, vulnerability assessments, compliance checks

**Capabilities:**
- Identifies security vulnerabilities (OWASP Top 10)
- Reviews authentication/authorization implementations
- Assesses data encryption and protection
- Checks for SQL injection, XSS, CSRF risks
- Validates HIPAA compliance for healthcare apps

**Example use case:** "Audit the patient data API endpoints for security vulnerabilities"

---

## Research Agents

**Location:** `_research/`
**Count:** 4 agents
**Purpose:** Information gathering, analysis, and synthesis

### best-practices-researcher.md

**When to use:** Learning industry standards, finding proven patterns

**Capabilities:**
- Researches best practices for technologies and frameworks
- Synthesizes findings from multiple authoritative sources
- Provides evidence-based recommendations
- Identifies emerging trends
- Compares approaches with trade-offs

**Example use case:** "What are the best practices for implementing real-time notifications in healthcare apps?"

---

### framework-docs-researcher.md

**When to use:** Deep-diving into framework documentation, API references

**Capabilities:**
- Researches official framework documentation
- Extracts relevant API usage patterns
- Identifies breaking changes in updates
- Provides code examples from docs
- Clarifies framework concepts

**Example use case:** "How does React Query handle optimistic updates in version 5?"

---

### repo-research-analyst.md

**When to use:** Analyzing unfamiliar codebases, understanding project structure

**Capabilities:**
- Maps repository structure and organization
- Identifies key architectural patterns
- Extracts coding conventions
- Analyzes dependencies and integrations
- Provides comprehensive project overview

**Example use case:** "Analyze this open-source EMR repository to understand its architecture"

---

### web-research-specialist.md

**When to use:** Researching solutions to technical problems, gathering community insights

**Capabilities:**
- Searches GitHub issues, Stack Overflow, forums
- Finds solutions to specific error messages
- Synthesizes information from multiple sources
- Identifies common pitfalls and workarounds
- Provides sourced recommendations

**Example use case:** "Research solutions for PhilHealth API timeout issues in production"

---

## Documentation Agents

**Location:** `_documentation/`
**Count:** 1 agent
**Purpose:** Creating comprehensive technical documentation

### documentation-architect.md

**When to use:** API docs, user guides, technical specs, README files

**Capabilities:**
- Creates comprehensive technical documentation
- Writes clear API documentation
- Generates user guides and tutorials
- Produces technical specifications
- Ensures documentation completeness

**Example use case:** "Create API documentation for the MYCURE patient registration endpoints"

---

## Planning Agents

**Location:** `_planning/`
**Count:** 1 agent
**Purpose:** Strategic planning for refactoring and system improvements

### refactor-planner.md

**When to use:** Planning large-scale refactoring, technical debt reduction

**Capabilities:**
- Analyzes code for refactoring opportunities
- Creates phased refactoring plans
- Identifies dependencies and risks
- Sequences changes for minimal disruption
- Estimates effort and timeline

**Example use case:** "Plan a refactoring to extract shared inventory logic into a reusable service"

---

## Error Fixing Agents

**Location:** `_error-fixing/`
**Count:** 1 agent
**Purpose:** Diagnosing and fixing frontend errors

### frontend-error-fixer.md

**When to use:** Build errors, runtime errors, console errors, TypeScript errors

**Capabilities:**
- Diagnoses frontend build and runtime errors
- Fixes TypeScript compilation errors
- Resolves React component issues
- Debugs browser console errors
- Handles dependency conflicts

**Example use case:** "Fix the 'Cannot read property of undefined' error in the appointment scheduler"

---

## Complete Workflow Agents

**Location:** `_complete/`
**Count:** 3 agents
**Purpose:** End-to-end autonomous task execution

### data-integrity-guardian.md

**When to use:** Ensuring data consistency, validation, integrity checks

**Capabilities:**
- Implements data validation rules
- Ensures referential integrity
- Validates input/output data
- Prevents data corruption
- Creates integrity test suites

**Example use case:** "Ensure patient medication records maintain integrity across transfers"

---

### feedback-codifier.md

**When to use:** Processing user feedback, creating actionable tasks

**Capabilities:**
- Analyzes user feedback and bug reports
- Categorizes issues by severity and type
- Creates actionable development tasks
- Prioritizes feedback items
- Generates product improvement roadmap

**Example use case:** "Process 50 user feedback submissions into prioritized action items"

---

### pattern-recognition-specialist.md

**When to use:** Identifying code patterns, extracting reusable components

**Capabilities:**
- Identifies repeated code patterns
- Extracts reusable abstractions
- Suggests design pattern applications
- Finds opportunities for DRY refactoring
- Creates pattern libraries

**Example use case:** "Identify repeated form validation patterns across the codebase"

---

## Agent Selection Guide

### "I need to..."

**...review code quality** → `code-architecture-reviewer`, `code-simplicity-reviewer`
**...audit security** → `security-sentinel`
**...validate a development plan** → `development-plan-reviewer`
**...optimize performance** → `performance-oracle`
**...research a technical solution** → `web-research-specialist`, `framework-docs-researcher`
**...understand a repository** → `repo-research-analyst`
**...create documentation** → `documentation-architect`
**...plan a refactoring** → `refactor-planner`
**...fix a frontend error** → `frontend-error-fixer`
**...ensure data integrity** → `data-integrity-guardian`
**...process user feedback** → `feedback-codifier`
**...find code patterns** → `pattern-recognition-specialist`

---

## Usage Guidelines

### Invoking Agents

Agents are invoked by referencing their name in conversation. The system automatically activates the appropriate agent based on context.

### Agent Lifecycle

1. **Activation**: Agent loads when invoked
2. **Context Gathering**: Agent reads relevant files and documentation
3. **Analysis**: Agent applies specialized methodology
4. **Output**: Agent provides findings, recommendations, or completed work
5. **Termination**: Agent concludes and returns control

### Best Practices

**DO:**
- ✅ Use the most specific agent for your task
- ✅ Provide clear context and requirements
- ✅ Specify expected output format
- ✅ Combine agents sequentially for complex workflows

**DON'T:**
- ❌ Use multiple agents simultaneously without clear sequencing
- ❌ Provide vague or incomplete requirements
- ❌ Expect agents to infer unstated assumptions
- ❌ Use review agents for implementation tasks

---

## Multi-Agent Workflows

### Code Review Workflow

1. `code-architecture-reviewer` → Assess structure
2. `code-simplicity-reviewer` → Identify complexity
3. `security-sentinel` → Check vulnerabilities
4. `performance-oracle` → Find bottlenecks

**Use case:** Comprehensive code review before merging PR

---

### Research & Implementation Workflow

1. `web-research-specialist` → Gather solutions
2. `framework-docs-researcher` → Verify API usage
3. `best-practices-researcher` → Validate approach
4. `refactor-planner` → Plan implementation

**Use case:** Implementing a new feature with unfamiliar technology

---

### Planning & Validation Workflow

1. `development-plan-reviewer` → Validate completeness
2. `architecture-strategist` → Assess design alignment
3. `refactor-planner` → Sequence changes
4. `security-sentinel` → Identify security requirements

**Use case:** Pre-implementation validation of major feature

---

## Category Deep Dive

### Review Agents

**Philosophy:** Systematic, thorough analysis with constructive feedback

**Common Patterns:**
- Checklist-based methodology
- Evidence-based recommendations
- Prioritized findings (Critical → High → Medium → Low)
- Clear next steps

**When to use:** Before merging, before deployment, during planning

---

### Research Agents

**Philosophy:** Comprehensive information gathering with source synthesis

**Common Patterns:**
- Multi-source triangulation
- Confidence grading (similar to research-synthesis-guidelines skill)
- Citation of sources
- Trade-off analysis

**When to use:** Before implementation, when encountering unknowns, learning new tools

---

### Complete Workflow Agents

**Philosophy:** Autonomous end-to-end task execution

**Common Patterns:**
- Self-directed problem solving
- Iterative refinement
- Comprehensive output
- Minimal user intervention

**When to use:** Repetitive tasks, well-defined problems, batch operations

---

## Maintenance

### Adding New Agents

1. Create agent `.md` file in appropriate `_category/` subdirectory
2. Include YAML frontmatter with `name` and `description`
3. Add detailed methodology section
4. Include usage examples
5. Update this README.md catalog

### Agent Versioning

Agents evolve based on:
- User feedback and usage patterns
- Framework/technology updates
- Best practice changes
- TOPSI Inc. standards evolution

---

## Related Documentation

- [Skills Catalog](../skills/README.md) - Domain knowledge modules
- [Healthcare UX Guidelines](../skills/_healthcare/healthcare-ux-guidelines/SKILL.md) - WCAG + patient safety
- [Frontend Design](../skills/_frontend/frontend-design/SKILL.md) - UI/UX standards
- [Research Synthesis Guidelines](../skills/_healthcare/research-synthesis-guidelines/SKILL.md) - Evidence grading

---

**Remember:** Agents are specialists. Use the right agent for the task, provide clear context, and expect systematic, thorough results.
