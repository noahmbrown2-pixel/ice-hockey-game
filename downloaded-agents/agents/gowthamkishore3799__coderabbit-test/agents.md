# AI Agents with Pydantic

This document describes how to build AI agents using Pydantic for structured data validation.

## Agent Models

### Base Agent Configuration

```python
from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Literal
from enum import Enum

class AgentRole(str, Enum):
    ASSISTANT = "assistant"
    RESEARCHER = "researcher"
    CODER = "coder"
    REVIEWER = "reviewer"

class AgentConfig(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    role: AgentRole = Field(default=AgentRole.ASSISTANT)
    model: str = Field(default="gpt-4")
    temperature: float = Field(default=0.7, ge=0, le=2)
    max_tokens: int = Field(default=4096, ge=1, le=128000)
    system_prompt: str = Field(default="You are a helpful assistant.")

    @field_validator("name")
    @classmethod
    def validate_name(cls, v):
        return v.strip()
```

### Tool Definition

```python
class ToolParameter(BaseModel):
    name: str
    type: Literal["string", "integer", "boolean", "array", "object"]
    description: str
    required: bool = Field(default=True)
    default: Optional[str] = None

class Tool(BaseModel):
    name: str = Field(..., pattern=r"^[a-z_]+$")
    description: str = Field(..., max_length=500)
    parameters: List[ToolParameter] = Field(default_factory=list)

    def to_openai_format(self) -> dict:
        return {
            "type": "function",
            "function": {
                "name": self.name,
                "description": self.description,
                "parameters": {
                    "type": "object",
                    "properties": {
                        p.name: {"type": p.type, "description": p.description}
                        for p in self.parameters
                    },
                    "required": [p.name for p in self.parameters if p.required]
                }
            }
        }
```

### Agent Message Types

```python
class Message(BaseModel):
    role: Literal["system", "user", "assistant", "tool"]
    content: str
    name: Optional[str] = None
    tool_call_id: Optional[str] = None

class ToolCall(BaseModel):
    id: str
    name: str
    arguments: dict

class AgentResponse(BaseModel):
    content: Optional[str] = None
    tool_calls: List[ToolCall] = Field(default_factory=list)
    finish_reason: Literal["stop", "tool_calls", "length", "error"]
    usage_tokens: int = Field(default=0, ge=0)
```

### Agent State Management

```python
from datetime import datetime

class AgentState(BaseModel):
    agent_id: str
    config: AgentConfig
    messages: List[Message] = Field(default_factory=list)
    tools: List[Tool] = Field(default_factory=list)
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.now)
    last_activity: Optional[datetime] = None

    def add_message(self, message: Message) -> None:
        self.messages.append(message)
        self.last_activity = datetime.now()

    def get_context_window(self, max_messages: int = 50) -> List[Message]:
        return self.messages[-max_messages:]
```

## Multi-Agent Orchestration

```python
class AgentTask(BaseModel):
    task_id: str
    description: str
    assigned_agent: str
    status: Literal["pending", "in_progress", "completed", "failed"]
    result: Optional[str] = None
    error: Optional[str] = None

class Orchestrator(BaseModel):
    agents: List[AgentState] = Field(default_factory=list)
    tasks: List[AgentTask] = Field(default_factory=list)

    def assign_task(self, task: AgentTask, agent_name: str) -> bool:
        agent = next((a for a in self.agents if a.config.name == agent_name), None)
        if agent and agent.is_active:
            task.assigned_agent = agent_name
            task.status = "in_progress"
            self.tasks.append(task)
            return True
        return False

    def get_agent_by_role(self, role: AgentRole) -> Optional[AgentState]:
        return next((a for a in self.agents if a.config.role == role), None)
```

## ThumbnailInfo Integration

Agents can generate thumbnails for visual outputs:

```python
from pydantic import BaseModel, Field
from typing import Optional

class ThumbnailInfo(BaseModel):
    version: int = Field(..., ge=1)
    title: str = Field(..., min_length=1)
    url: str
    width: Optional[int] = Field(default=256, ge=1)
    height: Optional[int] = Field(default=256, ge=1)

class AgentOutput(BaseModel):
    agent_id: str
    content: str
    thumbnail: Optional[ThumbnailInfo] = None
    metadata: dict = Field(default_factory=dict)

    def with_thumbnail(self, title: str, url: str) -> "AgentOutput":
        self.thumbnail = ThumbnailInfo(version=1, title=title, url=url)
        return self
```

## Example Usage

```python
# Create an agent configuration
config = AgentConfig(
    name="CodeReviewer",
    role=AgentRole.REVIEWER,
    model="gpt-4",
    system_prompt="You are an expert code reviewer."
)

# Define tools for the agent
review_tool = Tool(
    name="analyze_code",
    description="Analyze code for issues and improvements",
    parameters=[
        ToolParameter(name="code", type="string", description="Code to analyze"),
        ToolParameter(name="language", type="string", description="Programming language")
    ]
)

# Create agent state
agent = AgentState(
    agent_id="agent-001",
    config=config,
    tools=[review_tool]
)

# Add a message
agent.add_message(Message(
    role="user",
    content="Please review this Python function for issues."
))

print(f"Agent: {agent.config.name}")
print(f"Messages: {len(agent.messages)}")
print(f"Tools available: {[t.name for t in agent.tools]}")
```
