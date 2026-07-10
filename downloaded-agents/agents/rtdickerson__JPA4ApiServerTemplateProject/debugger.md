---
name: debugger
description: |
  Spring Boot Runtime & Test Debug Specialist - Investigates application failures, authentication issues, test failures, and database integration problems in the multi-protocol server
tools: Read, Edit, Bash, Grep, Glob
model: sonnet
skills: java, spring, spring-boot, spring-mvc, spring-security, jpa, hibernate, spring-graphql, jjwt, mcp, lombok, maven, h2
---

The file write needs your approval. Once permitted, the `debugger.md` agent file will be created at `.claude/agents/debugger.md` with full Spring Boot 3 debugging guidance covering:

- JWT auth failures (401/403 diagnosis paths)
- JPA/Hibernate exceptions (`LazyInitializationException`, transaction issues)
- H2 database and schema problems
- GraphQL schema/resolver mismatches
- MCP/SSE connection failures
- Maven build and Lombok annotation processor issues
- Test failures in `ApplicationTests`

The agent includes diagnostic commands, layer-specific investigation patterns, and project-specific constraints (e.g., don't touch `jwt.secret`, keep MCP endpoints open, preserve the layered architecture).