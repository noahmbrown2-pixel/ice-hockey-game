# agents.py - Deep Research Agents

```python
import os
from typing import Literal
from tavily import TavilyClient
from deepagents import create_deep_agent
from modules.llm import get_llm

# Set up Tavily client with provided API key
tavily_client = TavilyClient(api_key="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")

def internet_search(
    query: str,
    max_results: int = 5,
    topic: Literal["general", "news", "finance"] = "general",
    include_raw_content: bool = False,
):
    """Run a web search using Tavily API"""
    try:
        return tavily_client.search(
            query,
            max_results=max_results,
            include_raw_content=include_raw_content,
            topic=topic,
        )
    except Exception as e:
        return f"Search error: {str(e)}"

async def run_deep_research(query: str) -> str:
    """Run deep research on a query using LangChain DeepAgents with Tavily search"""
    try:
        # Define research instructions for the agent
        research_instructions = """You are an expert researcher. Your job is to conduct thorough research on the given query and then write a polished, comprehensive report.

You have access to web search tools to gather information. Use the internet_search tool to find relevant, up-to-date information.

## Research Process:
1. **Analyze the query** - Understand what specific information is needed
2. **Plan your research** - Identify key aspects to investigate
3. **Gather information** - Use internet_search to find relevant sources
4. **Synthesize findings** - Combine information from multiple sources
5. **Write comprehensive report** - Structure your response with clear sections

## internet_search Tool:
Use this to run internet searches for information. You can specify:
- query: Your search terms
- max_results: Number of results (default 5, use 3-10 based on needs)
- topic: "general", "news", or "finance" (use "general" unless specifically needed)
- include_raw_content: Set to true if you need full article content

## Response Structure:
Please structure your response with:
1. **Executive Summary** - Brief overview of findings
2. **Key Findings** - Main points and insights
3. **Detailed Analysis** - Supporting evidence and reasoning
4. **Sources** - List of sources used
5. **Limitations** - Any gaps or caveats
6. **Recommendations** - Further exploration suggestions

Be thorough but concise. Use clear headings and bullet points where appropriate."""

        # Get the LLM instance
        llm = get_llm()

        # Create the deep agent with Tavily search capability
        agent = create_deep_agent(
            tools=[internet_search],
            instructions=research_instructions,
            model=llm,  # Use our OpenRouter LLM
        )

        # Define sub-agents for specialized research tasks
        analysis_sub_agent = {
            "name": "analysis-agent",
            "description": "Used to analyze and synthesize complex information",
            "prompt": """You are a specialized analysis agent. Your role is to:
            - Break down complex topics into understandable components
            - Identify key patterns and relationships
            - Provide critical analysis of information
            - Synthesize findings from multiple sources
            Focus on clarity, accuracy, and comprehensive understanding."""
        }

        verification_sub_agent = {
            "name": "verification-agent",
            "description": "Used to verify facts and cross-reference information",
            "prompt": """You are a fact-checking and verification specialist. Your role is to:
            - Verify claims against multiple sources
            - Identify credible vs unreliable information
            - Cross-reference facts across different sources
            - Flag any inconsistencies or controversies
            Ensure all information presented is accurate and well-substantiated."""
        }

        # Add sub-agents to the main agent
        agent = create_deep_agent(
            tools=[internet_search],
            instructions=research_instructions,
            model=llm,
            subagents=[analysis_sub_agent, verification_sub_agent]
        )

        # Invoke the agent with the research query
        result = agent.invoke({
            "messages": [{"role": "user", "content": query}]
        })

        # Extract the final response from the agent result
        if "messages" in result and result["messages"]:
            # Find the last AI message (the final response after tool usage)
            for message in reversed(result["messages"]):
                if hasattr(message, 'type') and message.type == 'ai':
                    if hasattr(message, 'content') and message.content and not message.content.startswith('{'):
                        return message.content
                elif hasattr(message, 'content') and message.content and len(message.content) > 100:
                    # Fallback: any substantial message that looks like a response
                    return message.content

            # If no suitable message found, return the last message
            final_message = result["messages"][-1]
            if hasattr(final_message, 'content'):
                return final_message.content
            else:
                return str(final_message)
        else:
            return "Research completed but no response generated."

    except Exception as e:
        return f"Error in deep research: {str(e)}. Query was: {query}"
```
