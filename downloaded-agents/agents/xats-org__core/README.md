# xats Agent Collection

A comprehensive collection of specialized AI agents for the xats (eXtensible Academic Text Standard) project, designed to manage schema development, support third-party developers, and ensure quality across the ecosystem.

## Overview

This repository contains specialized agents that support the xats project through various roles: standards board members, core development team, third-party developers, and extension creators. Each agent is configured with specific Claude models based on task complexity.

## Agent Categories

### 🎓 xats Standards Board

The xats Standards Board consists of 15 specialized agents representing diverse stakeholder perspectives:

#### Executive Committee
- **[xats-project-steward](xats-project-steward.md)** - Project management, community liaison, strategic lead (opus)
- **[xats-schema-engineer](xats-schema-engineer.md)** - Technical implementation and JSON Schema expertise (opus)
- **[xats-doc-writer](xats-doc-writer.md)** - Documentation management and technical writing (sonnet)

#### Technical Committee
- **[xats-validation-engineer](xats-validation-engineer.md)** - Quality assurance and testing (sonnet)
- **[xats-standards-analyst](xats-standards-analyst.md)** - Research and alignment with existing standards (sonnet)
- **[xats-lms-integrator](xats-lms-integrator.md)** - Platform integration and interoperability (sonnet)
- **[xats-ai-education-expert](xats-ai-education-expert.md)** - AI and future technology alignment (opus)

#### Educational Committee
- **[xats-pedagogy-architect](xats-pedagogy-architect.md)** - Learning science and instructional design (opus)
- **[xats-assessment-specialist](xats-assessment-specialist.md)** - Assessment and psychometrics (sonnet)
- **[xats-content-author](xats-content-author.md)** - Content creation and authoring workflows (sonnet)
- **[xats-student-advocate](xats-student-advocate.md)** - Student experience and needs (sonnet)

#### Quality & Inclusion Committee
- **[xats-accessibility-champion](xats-accessibility-champion.md)** - Accessibility and universal design (opus)
- **[xats-international-liaison](xats-international-liaison.md)** - Global perspectives and localization (sonnet)

#### Strategic Advisory
- **[xats-academic-administrator](xats-academic-administrator.md)** - Institutional governance and strategy (sonnet)
- **[xats-publishing-expert](xats-publishing-expert.md)** - Commercial viability and market adoption (sonnet)

### 💻 Core Development Team

Development team agents that implement and maintain the xats schema:

- **[xats-dev-lead](xats-dev-lead.md)** - Technical lead coordinating implementation efforts (opus)
- **[xats-test-coordinator](xats-test-coordinator.md)** - Coordinates all testing efforts and quality assurance (sonnet)

### 🏗️ Third-Party Developers (Consumers)

Agents representing developers who use the xats schema:

- **[xats-consumer-advocate](xats-consumer-advocate.md)** - Represents third-party developers building educational content (sonnet)
- **[xats-implementation-guide](xats-implementation-guide.md)** - Helps developers implement xats in their applications (sonnet)

### 🔌 Extension Ecosystem

Agents supporting the extension ecosystem:

- **[xats-extension-developer](xats-extension-developer.md)** - Creates extensions and plugins for xats (sonnet)
- **[xats-extension-reviewer](xats-extension-reviewer.md)** - Reviews and approves submitted extensions (sonnet)

### 🛠️ General Development & Architecture

Non-xats-specific development agents available for general tasks:

#### Development & Architecture
- **[backend-architect](backend-architect.md)** - Design RESTful APIs, microservice boundaries, and database schemas
- **[frontend-developer](frontend-developer.md)** - Build React components, implement responsive layouts
- **[ui-ux-designer](ui-ux-designer.md)** - Create interface designs, wireframes, and design systems
- **[mobile-developer](mobile-developer.md)** - Develop React Native or Flutter apps
- **[graphql-architect](graphql-architect.md)** - Design GraphQL schemas and resolvers
- **[architect-reviewer](architect-reviewer.md)** - Reviews code for architectural consistency

#### Language Specialists
- **[python-pro](python-pro.md)** - Python development with advanced features
- **[ruby-pro](ruby-pro.md)** - Ruby with metaprogramming and Rails patterns
- **[golang-pro](golang-pro.md)** - Go with goroutines and channels
- **[rust-pro](rust-pro.md)** - Rust with ownership patterns
- **[c-pro](c-pro.md)** - C with memory management
- **[cpp-pro](cpp-pro.md)** - Modern C++ with STL
- **[javascript-pro](javascript-pro.md)** - Modern JavaScript and Node.js
- **[typescript-pro](typescript-pro.md)** - TypeScript with advanced types
- **[php-pro](php-pro.md)** - Modern PHP development
- **[java-pro](java-pro.md)** - Java with streams and concurrency
- **[elixir-pro](elixir-pro.md)** - Elixir with OTP patterns
- **[csharp-pro](csharp-pro.md)** - C# with .NET optimization
- **[scala-pro](scala-pro.md)** - Enterprise Scala development
- **[flutter-expert](flutter-expert.md)** - Flutter development
- **[unity-developer](unity-developer.md)** - Unity game development
- **[minecraft-bukkit-pro](minecraft-bukkit-pro.md)** - Minecraft plugin development
- **[ios-developer](ios-developer.md)** - Native iOS development
- **[swift-macos-expert](swift-macos-expert.md)** - Swift and macOS desktop application development
- **[sql-pro](sql-pro.md)** - SQL optimization

#### Framework Specialists
- **[svelte-development](svelte-development.md)** - Svelte 5+ and SvelteKit development
- **[svelte-testing](svelte-testing.md)** - Svelte/SvelteKit testing with Vitest and Playwright
- **[svelte-storybook](svelte-storybook.md)** - Storybook for SvelteKit components

#### Infrastructure & Operations
- **[devops-troubleshooter](devops-troubleshooter.md)** - Debug production issues
- **[deployment-engineer](deployment-engineer.md)** - Configure CI/CD pipelines
- **[cloud-architect](cloud-architect.md)** - Design cloud infrastructure
- **[azure-devops-specialist](azure-devops-specialist.md)** - Azure DevOps and cloud infrastructure
- **[database-optimizer](database-optimizer.md)** - Optimize database performance
- **[database-admin](database-admin.md)** - Manage database operations
- **[terraform-specialist](terraform-specialist.md)** - Infrastructure as Code
- **[incident-responder](incident-responder.md)** - Handle production incidents
- **[network-engineer](network-engineer.md)** - Debug network connectivity
- **[dx-optimizer](dx-optimizer.md)** - Developer experience optimization
- **[release-manager](release-manager.md)** - Release preparation and deployment
- **[integration-manager](integration-manager.md)** - Cross-platform synchronization

#### Quality & Security
- **[code-reviewer](code-reviewer.md)** - Expert code review
- **[code-auditor](code-auditor.md)** - Proactive code quality assurance
- **[code-quality-pragmatist](code-quality-pragmatist.md)** - Review code for over-engineering
- **[architecture-auditor](architecture-auditor.md)** - Architecture and design patterns
- **[security-auditor](security-auditor.md)** - Security vulnerability analysis
- **[performance-auditor](performance-auditor.md)** - Performance optimization
- **[test-engineer](test-engineer.md)** - Automated test generation
- **[test-automator](test-automator.md)** - Create test suites
- **[performance-engineer](performance-engineer.md)** - Performance optimization
- **[debugger](debugger.md)** - Debug errors and issues
- **[error-detective](error-detective.md)** - Analyze error patterns
- **[search-specialist](search-specialist.md)** - Web research

#### Testing & Validation
- **[ui-comprehensive-tester](ui-comprehensive-tester.md)** - Comprehensive UI testing
- **[task-completion-validator](task-completion-validator.md)** - Verify task completion
- **[Jenny](Jenny.md)** - Verify implementation matches specifications
- **[karen](karen.md)** - Reality-check project completion
- **[claude-md-compliance-checker](claude-md-compliance-checker.md)** - Verify CLAUDE.md compliance

#### Project Management
- **[project-architect](project-architect.md)** - Project initialization and setup
- **[strategic-analyst](strategic-analyst.md)** - Business and technical scenario modeling

#### Data & AI
- **[data-scientist](data-scientist.md)** - Data analysis and insights
- **[data-engineer](data-engineer.md)** - Build data pipelines
- **[ai-engineer](ai-engineer.md)** - Build AI applications
- **[ml-engineer](ml-engineer.md)** - ML model deployment
- **[mlops-engineer](mlops-engineer.md)** - ML infrastructure
- **[prompt-engineer](prompt-engineer.md)** - Optimize AI prompts

#### Documentation
- **[docs-architect](docs-architect.md)** - Create technical documentation
- **[mermaid-expert](mermaid-expert.md)** - Create diagrams
- **[reference-builder](reference-builder.md)** - Build API references
- **[tutorial-engineer](tutorial-engineer.md)** - Create tutorials
- **[api-documenter](api-documenter.md)** - OpenAPI/Swagger specs

#### Business & Support
- **[business-analyst](business-analyst.md)** - Business metrics and KPIs
- **[content-marketer](content-marketer.md)** - Marketing content
- **[sales-automator](sales-automator.md)** - Sales automation
- **[customer-support](customer-support.md)** - Customer service
- **[legal-advisor](legal-advisor.md)** - Legal documentation

#### Specialized Domains
- **[payment-integration](payment-integration.md)** - Payment processing
- **[quant-analyst](quant-analyst.md)** - Financial modeling
- **[risk-manager](risk-manager.md)** - Risk management
- **[legacy-modernizer](legacy-modernizer.md)** - Modernize legacy code
- **[context-manager](context-manager.md)** - Multi-agent coordination

## Model Configuration

Agents are configured with appropriate Claude models:

- **opus** - Complex tasks requiring maximum capability (board leadership, architecture)
- **sonnet** - Standard development and implementation tasks
- **haiku** - Simple tasks and documentation

## Usage

### For xats Development

```bash
# Board activities
claude --command xats:board-meeting --topics "v0.2.0-features"
claude --command xats:issue-triage --milestone "v0.1.0"

# Development tasks
"Have xats-dev-lead review the implementation plan"
"Get xats-test-coordinator to create test suite"

# Consumer support
"Ask xats-consumer-advocate about common use cases"
"Have xats-implementation-guide show validation example"

# Extension development
"Get xats-extension-developer to design custom assessment"
"Have xats-extension-reviewer check compatibility"
```

### For General Development

```bash
# Code quality
"Use code-reviewer to analyze recent changes"
"Have security-auditor scan for vulnerabilities"

# Development
"Get python-pro to optimize this function"
"Have frontend-developer create dashboard"

# Infrastructure
"Use devops-troubleshooter to debug deployment"
"Get cloud-architect to design scalable system"
```

## Contributing

To add new agents:
1. Create a `.md` file with proper frontmatter
2. Include name, description, and model
3. Write clear system prompt
4. Update this README

## License

Part of the xats project - see main repository for license details.