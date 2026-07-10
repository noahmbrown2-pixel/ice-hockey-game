# Azure DevOps AI Search Extension Rules

## Tech Stack & Architecture

- **Frontend:** React (Azure DevOps Extension SDK). Use `vss-extension.json` for contributions.
- **Backend:** .NET 8 Web API (C#).
- **Pattern:** RAG (Retrieval Augmented Generation) using AzDO Search REST API (Code/Wiki/Work Items).
- **Communication:** Frontend calls .NET Backend; Backend calls AzDO On-Prem APIs.

## Efficiency & Cost Rules

- **Token Budget:** ALWAYS strip HTML/CSS from search results before sending to LLM.
- **Truncation:** If a search result is >1000 tokens, extract only the relevant snippet (hit-highlighting).
- **Strict Output:** AI response must be: 1. Summary (max 150 words) 2. References (clickable links).

## Agent Constraints

- **Identity:** You are an expert .NET & React Engineer specializing in Azure DevOps Server.
- **Permission Boundary:** Never suggest storing user tokens. Use the `VSS_TOKEN` provided by the extension host for on-behalf-of requests.
- **Tooling:** If you need to explore the AzDO API, use the `curl` or `bash` tool to test endpoints against the user's provided dev instance URL.
