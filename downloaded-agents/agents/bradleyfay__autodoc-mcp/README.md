# Claude Code Agent Specifications

This directory contains fully-implemented agent specifications for the AutoDocs MCP Server project. Each agent is a specialized AI assistant designed to work within Claude Code's multi-agent ecosystem.

## Available Agents

### 🎯 Project Management & Planning
- **project-planning-steward**: Project organization expert for creating and maintaining comprehensive project documentation, scope definition, and status tracking within the planning folder structure

### 🏗️ Architecture & Design
- **agent-design-architect**: Meta-agent specialist in designing, analyzing, and optimizing multi-agent systems, agent collaboration patterns, and system architecture

### ⚙️ Core Development
- **core-services**: Expert in core business logic, dependency resolution, documentation processing, and performance optimization for the AutoDocs MCP Server
- **mcp-protocol**: Specialist in MCP protocol implementation, tool definitions, server development, and client integrations

### 📚 Documentation & Content
- **docs-integration**: Expert in technical documentation, API documentation, integration guides, and user onboarding materials
- **technical-writer**: Specialist in the Diátaxis documentation framework for user-centered documentation design and content strategy

### 🧪 Testing & Quality
- **testing-specialist**: Expert in comprehensive testing strategies, pytest ecosystem, test automation, and quality assurance

### 🚀 Operations & Product
- **production-ops**: Expert in deployment, monitoring, configuration, security, and production readiness
- **product-manager**: Expert in product strategy, roadmap prioritization, requirements analysis, and stakeholder coordination

### 🔗 Workflow Coordination (Advanced)
- **workflow-orchestrator**: Meta-cognitive agent for task decomposition and multi-agent workflow coordination
- **context-coordinator**: Expert in hierarchical context management and intelligent context sharing across workflows

## Agent File Format

Each agent specification follows this structure:

```yaml
---
name: agent-name
description: Brief description of agent expertise and use cases
tools: [list of available tools]
model: sonnet
color: color-name
---

# Agent content in markdown format
```

## Usage in Claude Code

These agents are designed to be used with Claude Code's Task tool for specialized assistance:

```
Use the Task tool with subagent_type parameter to invoke specific agents:
- For core development: use "core-services"
- For documentation: use "docs-integration" or "technical-writer"
- For testing: use "testing-specialist"
- For deployment: use "production-ops"
- For complex workflows: use "workflow-orchestrator"
```

## Agent Selection Guidelines

- **Single-domain tasks**: Use the appropriate specialist agent directly
- **Multi-step workflows**: Consider using workflow-orchestrator to coordinate multiple agents
- **Project setup/resumption**: Use project-planning-steward for proper organization
- **Architecture decisions**: Use agent-design-architect for system design questions

All agents are fully functional and ready for use in the AutoDocs MCP Server development workflow.
