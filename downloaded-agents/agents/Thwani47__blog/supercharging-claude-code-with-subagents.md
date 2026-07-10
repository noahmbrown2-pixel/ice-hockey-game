+++
title = "Super-charging Claude Code with sub-agents"
tags = [
 "ai",
 "claude-code",
]
date = "2025-07-28"
toc = true
+++

In this post, we will explore how to enhance Claude Code's capabilities by integrating sub-agents. Sub-agents can help manage complex tasks, improve efficiency, and provide specialized expertise within a larger workflow.

## Table of Contents

- [Table of Contents](#table-of-contents)
- [What is Claude Code?](#what-is-claude-code)
- [What are Sub-agents?](#what-are-sub-agents)
- [Creating Sub-agents](#creating-sub-agents)
- [Example Sub-agent Configuration](#example-sub-agent-configuration)
- [Conclusion](#conclusion)

## What is Claude Code?

Claude Code is an agentic tool from Anthropic that runs directly on the terminal, making it a powerful ally for developers. It comes with a range of powerful capabilities, including code generation, debugging, writing documentation, and more. It is particularly effective at analyzing large codebases, automating repetitive tasks, and even generating entire applications. On top of these features, another selling point of Claude Code is its customizability and extensibility. Claude Code allows users to add MCP servers to enable LLMs to access external tools and data, enhancing Claude Code's capabilities even further.

## What are Sub-agents?

Claude Code allows us to create and use **sub-agents**. Sub-agents are specialized AI agents that are created for task-specific workflows. Sub-agents can be invoked to handle specific tasks. They are pre-configured AI personalities that Claude Code can delegate tasks to, allowing for more efficient and organized workflows.

Each sub-agent

- Has its specific purpose and area of expertise.
- Runs in its own context window, which is separate from the main conversation window.
- Can be configured to access a list of available tools, including configured MCP servers
- Includes its own custom prompt to guide its behavior and responses.

When Claude Code encounters a task that matches the sub-agent's expertise, it can delegate the task to the sub-agent. The sub-agent will run independently, using its own context and tools, and return the results to Claude Code. This allows for a more modular and efficient approach to task management. Claude Code delegates tasks to sub-agents based on the description of the request, the sub-agent's description, and the current context and available tools.

Sub-agents can be configured on a project level, allowing teams to define specific workflows and tool access for different sub-agents based on the project's needs. They can also be created on a user level, allowing the agents to be accessible across different projects.

## Creating Sub-agents

Each sub-agent is defined in a Markdown file that follows this structure:

```markdown
---
name: <sub-agent-name> # The name of the sub-agent, using lowercase letters and hyphens
description: <sub-agent-description> # A brief description of the sub-agent's purpose and capabilities
tools: [<tool1>, <tool2>, ...] # Optional - if omitted, the sub-agent will have access to all tools available in the current context
---

<sub-agent-prompt> # The custom prompt that guides the sub-agent's behavior and responses. Make the prompt as specific as possible to ensure the sub-agent behaves as expected. Clearly define the agent's role, its capabilities, and approach to tasks.
```

There are two ways to create sub-agents in Claude Code:

- **Using the `/agents` command (Recommended)** - We can create the sub-agent directly in the terminal using the `/agents` command. This command will enable us to view existing agents, edit agents, and create new agents. When creating new agents, the command will prompt us to enter the sub-agent's name, description, and tools.
- **Manually creating agent configuration files** - We can manually create a Markdown file in the `.claude/agents` directory for project-level agents and in the `~/.claude/agents` directory for user-level agents. The file should follow the structure outlined above.

Claude Code also enables us to manually invoke sub-agents on the command line. For example, we can run the following command to invoke a sub-agent named `test-runner`:

```bash
Use the test-runner sub-agent to fix the failing tests
```

Claude Code can also chain sub-agents together, allowing us to create complex workflows. For example, we can invoke a sub-agent to generate code, and then immediately invoke another sub-agent to test that code. This allows for a more modular and efficient approach to task management.

Anthropic recommends we follow these best practices when creating sub-agents:

- **Use Claude-generated sub-agents** - It is recommended we use the `/agents` command to create sub-agents, as this gives us a great starting point when creating new agents. Claude Code will use the agent's description to generate a custom prompt that guides the agent's behavior and responses, which we can edit as needed.
- **Keep sub-agents focused** - Each sub-agent should have a clear and specific purpose. This makes it easier to manage and invoke them as needed. Avoid creating agents that do 'everything' or are too broad in scope.
- **Use detailed prompts** - The custom prompt for each sub-agent should be as detailed and specific as possible. This helps ensure the sub-agent behaves as expected and can handle tasks effectively. Clearly define the agent's role, its capabilities, and its approach to tasks.
- **Limit tool access** - Only grant sub-agents access to the tools they need for their specific tasks. This helps maintain security and prevents unintended actions. If a sub-agent does not need access to certain tools, do not include them in the `tools` list.
- **Version control** - Include sub-agent configuration files in version control to track changes and ensure consistency across team members.

## Example Sub-agent Configuration

Example sub-agent configuration file:

I created a custom sub-agent called `pgp-confluence-agent` that uses the [Confluence MCP Server](https://github.com/sooperset/mcp-atlassian) to get information from my BU's Confluence space. The sub-agent is designed to query data from Confluence, create pages, summarize content, and more. Here is the configuration file for the sub-agent:

```markdown
---
name: pgp-confluence-agent
description: Use this agent when you need to work with PGP documentation on Confluence. This includes finding information in the PGP Confluence space, writing or editing Confluence documents, summarizing existing page content, or creating documentation that follows PGP standards and practices. Examples: <example>Context: User needs to find specific information about PGP processes or systems. user: "Can you help me find information about the PGP head of departments on Confluence?" assistant: "I'll use the pgp-confluence-agent to search the PGP Confluence space for the business unit organogram and return the head of departments."</example> <example>Context: User wants to create or update PGP documentation. user: "Can you summarize the 'some-project' project plan?" assistant: "Let me use the pgp-confluence-agent to summarize the ' some-project' project."</example> <example>Context: User needs a summary of existing PGP Confluence content. user: "Can you find the distribution link (DL) for the "team name" team?" assistant: "I'll use the pgp-confluence-agent to find the DL for the "team name" team."</example>
tools: Task, ExitPlanMode, Read, Edit, MultiEdit, Write, NotebookRead, NotebookEdit, WebFetch, TodoWrite, WebSearch, mcp__confluence-mcp__confluence_search, mcp__confluence-mcp__confluence_get_page, mcp__confluence-mcp__confluence_get_page_children, mcp__confluence-mcp__confluence_get_comments, mcp__confluence-mcp__confluence_get_labels, mcp__confluence-mcp__confluence_add_label, mcp__confluence-mcp__confluence_create_page, mcp__confluence-mcp__confluence_update_page, mcp__confluence-mcp__confluence_delete_page, mcp__confluence-mcp__confluence_add_comment, mcp__confluence-mcp__confluence_search_user
color: orange
---

You are an expert documentation specialist for the PGP business unit (BU). You have extensive experience working with Confluence documentation systems and deep knowledge of the PGP BU's processes, systems, and standards.

Your primary expertise includes:

- Navigating and finding information within the PGP Confluence Space (<Confluence Space URL here>)
- Writing clear, concise, and well-structured Confluence documents that follow PGP documentation standards
- Summarizing complex Confluence page content while maintaining complete accuracy and preserving key technical details
- Understanding PGP-specific terminology, processes, and BU context
- Creating documentation that serves both technical and non-technical stakeholders within the PGP BU
- All PGP administration-related details (including team's distribution links, birthdays, books and library details, and more) are available in the `<Page name>` Confluence page and child pages (<Confluence Page URL here>)
- The organogram for PGP is available in the `<Page name>` Confluence page (<Confluence Page URL here>)
- The list of portfolios and their teams is available in the `<Page name>` Confluence page (<Confluence Page URL here>)

When you receive a request related to PGP documentation, you will:

When working with Confluence content, you will:

1. Always reference the PGP Confluence Space as your primary source of truth
2. Maintain the accuracy and integrity of all information when summarizing or referencing existing content
3. Follow established PGP documentation patterns and formatting standards
4. Ensure all documentation is clear, concise, and accessible to the intended audience
5. Preserve important technical details and context when summarizing complex information
6. Use appropriate Confluence markup and formatting for optimal readability
7. Cross-reference related PGP documentation when relevant to provide comprehensive context

Your responses should demonstrate deep familiarity with PGP processes and systems while maintaining professional documentation standards. When you cannot find specific information in the PGP Confluence space, clearly state this limitation and suggest appropriate next steps for obtaining the required information.

Always prioritize accuracy over speed, and ensure that any documentation you create or modify aligns with PGP's BU goals and technical standards.
```

I invoked the sub-agent to query some data from the Confluence space, and I got this
![confluence-sub-agent](/images/claude-code-sub-agents-demo.png)

Anthropic provides a few examples of sub-agents that can be used to get started. They can be found in the [Claude Code Sub agents page](https://docs.anthropic.com/en/docs/claude-code/sub-agents#example-sub-agents)

There's also a new repository created that contains a collection of useful sub-agents that can be used to Supercharge Claude Code's capabilities. You can find it here: [awesome-claude-agents](https://github.com/vijaythecoder/awesome-claude-agents)

## Conclusion

Sub-agents are a powerful feature of Claude Code that can help us manage complex tasks, improve efficiency, and provide specialized expertise within a larger workflow. By creating and using sub-agents, we can enhance Claude Code's capabilities and create more modular and efficient workflows.
