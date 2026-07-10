# Claude Code Specialized Agents

This directory contains specialized agent definitions for Claude Code. Each agent is an expert in a specific domain and can be invoked to handle tasks requiring deep expertise.

## Documentation & Research Agents

### context7-documentation-specialist
**Purpose**: Fetches up-to-date official documentation for any library, framework, or package using the Context7 MCP server.

**When to use**:
- Before implementing features with external libraries
- Verifying API usage and best practices
- Checking for deprecated patterns or breaking changes
- Validating framework-specific implementations

**Capabilities**:
- Resolves library names to Context7 IDs
- Fetches topic-specific documentation
- Compares code against official docs
- Suggests modern alternatives to outdated patterns

**Example**: "Use context7-documentation-specialist to verify the latest Next.js App Router patterns"

---

### tavily-research-specialist
**Purpose**: Performs real-time web research using the Tavily MCP server to find current technical information, official docs, and best practices.

**When to use**:
- Researching latest technology updates
- Verifying current API capabilities
- Finding migration guides and breaking changes
- Troubleshooting errors with known solutions
- Comparing different tools or approaches

**Capabilities**:
- Advanced web search with domain filtering
- Website structure mapping and discovery
- Full content extraction from specific URLs
- Crawling documentation sites

**Example**: "Use tavily-research-specialist to find the latest OpenAI API authentication methods"

---

## Architecture & Design Agents

### api-gateway-architect
**Purpose**: Expert in API gateway design, middleware layers, request/response pipelines, authentication/authorization flows.

**When to use**:
- Designing microservices architecture
- Implementing authentication/authorization
- Setting up rate limiting or load balancing
- Troubleshooting API gateway performance

---

### python-backend-core
**Purpose**: Specialist in core backend Python functionality, including API development, business logic, database operations.

**When to use**:
- Implementing backend services with FastAPI/Flask
- Database operations and ORM usage
- Service architecture design
- Backend code review and optimization

---

## Compliance & Quality Agents

### model-manifest-enforcer
**Purpose**: Ensures all AI model references comply with MODEL_MANIFEST.md, preventing use of deprecated or invalid models.

**When to use**:
- After code references AI models or APIs
- When updating model configurations
- During SDK/API integration
- Before committing model-related changes

**Validates**: Model names, API calls, SDK versions, provider compatibility

---

### railway-compliance-enforcer
**Purpose**: Ensures Railway deployment compatibility, validates configurations, and fixes deployment issues.

**When to use**:
- Before Railway deployments
- When deployment fails
- Setting up new Railway services
- Modifying build configurations

**Checks**: railpack.json, health endpoints, PORT binding, environment variables

---

### theme-enforcer
**Purpose**: Enforces universal theme system compliance, ensures no hardcoded colors, validates WCAG accessibility.

**When to use**:
- Creating new UI components
- Theme system setup
- Accessibility audits
- Code review for styling

**Validates**: CSS custom properties, semantic tokens, contrast ratios, elevation scales

---

### code-quality-enforcer
**Purpose**: Adds/enhances code quality tooling (linters, type checkers), implements error boundaries, sets up routing.

**When to use**:
- Setting up ESLint/TypeScript
- Implementing error boundaries
- Configuring routing infrastructure
- Establishing code quality standards

---

## Project Structure Agents

### nx-project-structure
**Purpose**: Ensures Nx workspace conventions are followed when creating apps/libraries.

**When to use**:
- Creating new Nx applications or libraries
- Reviewing project structure
- Validating naming conventions
- Checking for circular dependencies

**Enforces**: Nx generators, naming conventions, dependency tags, project.json configs

---

### workspace-structure-agent
**Purpose**: Enforces consistent workspace organization, naming conventions (PascalCase/camelCase), and file structure.

**When to use**:
- Creating new projects
- Reorganizing project structure
- Enforcing naming standards
- Configuring Nx workspace

---

### project-structure-enforcer
**Purpose**: Scaffolds and maintains proper project structure for React/Vite, JavaScript modules, and Python scripts.

**When to use**:
- Starting new projects
- Setting up project configuration
- Organizing components and modules
- Creating starter templates

---

## Build & Dependency Agents

### dependency-build-agent
**Purpose**: Manages Yarn 4 with Nx, handles dependencies, configures build processes, optimizes performance.

**When to use**:
- Setting up new workspace with Yarn 4
- Updating or auditing dependencies
- Configuring Nx build targets
- Resolving Railway deployment build issues
- Optimizing build performance

---

## UI & Component Agents

### ui-component-agent
**Purpose**: Creates React components with Tailwind and shadcn/ui, ensures accessibility and design system compliance.

**When to use**:
- Creating new UI components
- Setting up design system
- Fixing theme/styling issues
- Ensuring accessibility compliance

---

### browser-extension-specialist
**Purpose**: Expert in Monkey-Browser extension development, visual feedback, backend integration, and tool execution.

**When to use**:
- Working on browser extension code
- Debugging extension issues
- Implementing new extension features
- Testing extension functionality

---

## Documentation & Maintenance Agents

### docs-roadmap-guardian
**Purpose**: Maintains documentation quality and roadmap alignment, ensures docs stay current with code changes.

**When to use**:
- After merging significant features
- Upgrading major dependencies
- Requesting documentation status reports
- Running pre-commit checks

---

## Usage Notes

1. **Proactive Invocation**: Some agents (marked in their descriptions) should be invoked proactively without explicit user request.

2. **Parallel Execution**: Multiple agents can run concurrently when tasks are independent.

3. **Tool Access**: All agents have access to the full Claude Code toolset (*).

4. **Model Inheritance**: Most agents use `model: inherit` to use the same model as the main assistant.

5. **Specialized Expertise**: Each agent has deep domain knowledge and follows specific workflows optimized for their area.

## Adding New Agents

To add a new agent:

1. Create a new `.md` file in this directory
2. Use the frontmatter format:
   ```yaml
   ---
   name: agent-name
   description: When to use this agent with examples
   model: inherit
   ---
   ```
3. Document the agent's responsibilities, workflow, and critical rules
4. Update this README with the new agent's information

## Best Practices

- Use the most specific agent for each task
- Let agents complete autonomously - they will report back when done
- Trust agent outputs - they are specialized experts
- Combine agents when tasks span multiple domains
- Use documentation/research agents before implementing with external libraries
