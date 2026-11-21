Based on the transcript, here's the exact structure of Claude Code agent files:

## Claude Code Agent File Structure

```yaml
agent_name: unique_agent_id
description: |
  Clear description of when to call this agent.
  Use PROACTIVELY or MUST BE USED keywords.
  Example: "If they say hi claude or hi CC or hi claude code, use this agent"
  Include instructions for primary agent on HOW to prompt this agent.
tools:
  - tool_name_1
  - tool_name_2
  - etc
color: yellow  # Optional: for terminal output formatting
sub_agent_complete: true  # Indicates this is a sub-agent
```

### System Prompt Section
The content below the YAML frontmatter is the **system prompt** for the sub-agent (NOT a user prompt):

```markdown
# Purpose
Define what this agent does

# Variables (optional)
- username: string
- other_variable: type

# Instructions
Detailed instructions for the agent's behavior

# Report/Response Format
IMPORTANT: Remember you're responding to the primary agent, not the user.
Tell the primary agent how to communicate results to the user.
Example: "Claude, respond to the user with this message: [your response]"

# Best Practices (optional)
- Run only specific tools
- No pleasantries
- Concise responses
```

## Key Points from the Transcript:

1. **File Location**: Agents are stored in an `agents/` directory
2. **File Extension**: Appears to be `.md` files (markdown)
3. **Two Critical Mistakes to Avoid**:
   - The content is a system prompt, not a user prompt
   - Sub-agents respond to the primary agent, not directly to the user

4. **Information Flow**:
   - User → Primary Agent → Sub-agents → Primary Agent → User
   - Sub-agents have no context from the conversation
   - Primary agent must pass all needed context

5. **Important Fields**:
   - `agent_name`: Unique identifier
   - `description`: Most critical - determines when agent is called
   - `tools`: Specific tools available to this agent
   - `color`: Terminal output formatting
   - System prompt content: Defines agent behavior

6. **Best Practices**:
   - Use keywords like "PROACTIVELY" or "MUST BE USED" in descriptions
   - Include specific triggers (e.g., "If they say TTS, TTS summary, use this agent")
   - Add instructions in the description for how the primary agent should prompt this sub-agent
   - Include "IMPORTANT: Remember this agent has no context of any previous conversations between you and the user"
   - Specify exactly which tools the agent should use

This structure enables specialized, reusable agents that operate in isolated contexts for specific tasks.