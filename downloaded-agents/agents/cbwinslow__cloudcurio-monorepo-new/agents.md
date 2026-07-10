# CloudCurio Monorepo - AI Agents Guide

**Version:** 1.0.0  
**Last Updated:** 2026-02-13  
**Repository:** cloudcurio-monorepo-new

---

## 📖 Table of Contents

- [Overview](#overview)
- [Agent Architecture](#agent-architecture)
- [Agent Categories](#agent-categories)
- [Agent Development Lifecycle](#agent-development-lifecycle)
- [Agent Specifications](#agent-specifications)
- [Tool Integration](#tool-integration)
- [Runtime Adapters](#runtime-adapters)
- [Testing & Evaluation](#testing--evaluation)
- [Best Practices](#best-practices)
- [Agent Catalog](#agent-catalog)

---

## 🎯 Overview

The CloudCurio Monorepo provides a comprehensive AI agent framework designed for production-grade automation. This guide covers everything you need to know about developing, deploying, and managing AI agents within this ecosystem.

### What is an Agent?

An **agent** is an autonomous AI entity that can:
- Execute specific tasks based on natural language instructions
- Use tools to interact with external systems
- Make decisions based on context and configuration
- Coordinate with other agents for complex workflows
- Learn from evaluations and feedback

### Core Philosophy

1. **Declarative Specs**: Define agents in human-friendly YAML
2. **Type Safety**: Pydantic validation ensures correctness
3. **Framework Agnostic**: Support multiple runtime adapters
4. **Local-First**: Everything runs locally; cloud services optional
5. **Production-Grade**: Built with standards of serious AI companies

---

## 🏗️ Agent Architecture

### Agent Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│ 1. AUTHOR         → 2. VALIDATE → 3. COMPILE              │
│ (YAML Spec)         (Schema Check) (JSON Artifact)         │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. EXECUTE        → 5. EVALUATE → 6. ITERATE               │
│ (Runtime)           (Golden Tests) (Improvements)           │
└─────────────────────────────────────────────────────────────┘
```

### Agent Components

```
┌──────────────────────────────────────────────────────────┐
│                         AGENT                             │
├──────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────────┐   │
│ │              METADATA                              │   │
│ │  - Name, Version, Tags                             │   │
│ └────────────────────────────────────────────────────┘   │
│                                                           │
│ ┌────────────────────────────────────────────────────┐   │
│ │              MODEL POLICY                          │   │
│ │  - Preferred Model                                 │   │
│ │  - Fallback Models                                 │   │
│ └────────────────────────────────────────────────────┘   │
│                                                           │
│ ┌────────────────────────────────────────────────────┐   │
│ │              PROMPTS                               │   │
│ │  - System Prompt                                   │   │
│ │  - User Prompt Templates                           │   │
│ └────────────────────────────────────────────────────┘   │
│                                                           │
│ ┌────────────────────────────────────────────────────┐   │
│ │              TOOLS                                 │   │
│ │  - Tool References                                 │   │
│ │  - Tool Configurations                             │   │
│ └────────────────────────────────────────────────────┘   │
│                                                           │
│ ┌────────────────────────────────────────────────────┐   │
│ │              RUNTIME                               │   │
│ │  - Supported Runtimes                              │   │
│ │  - Execution Configuration                         │   │
│ └────────────────────────────────────────────────────┘   │
│                                                           │
│ ┌────────────────────────────────────────────────────┐   │
│ │              EVALUATION                            │   │
│ │  - Golden Test Suites                              │   │
│ │  - Quality Metrics                                 │   │
│ └────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
```

---

## 📁 Agent Categories

### 1. Specialized Domain Agents

**Purpose**: Expert agents for specific domains

- **Audio Engineer** (`audio_engineer_agent`)
  - Professional audio processing and mixing
  - Audio enhancement and mastering
  - Format conversion and normalization

- **Video Editor** (`video_editing_agent`)
  - Video editing and post-production
  - Scene detection and transitions
  - Effects and color grading

- **Social Media Manager** (`social_media_agent`)
  - Multi-platform social media automation
  - Content scheduling and posting
  - Analytics and engagement tracking

- **Transcription Agent** (`transcription_agent`)
  - Audio/video transcription with speaker diarization
  - Multi-language support
  - Subtitle generation

- **GitHub Agent** (`github_agent`)
  - Repository management and code operations
  - Issue and PR automation
  - Code review assistance

- **Content Analyst** (`content_analyst_agent`)
  - Content quality and SEO analysis
  - Readability scoring
  - Engagement optimization

### 2. System Agents

**Purpose**: Code quality, testing, and system operations

- **Testing Agent** (`testing_agent`)
  - Automated test generation
  - Test execution and reporting
  - Coverage analysis

- **Quality Agent** (`quality_agent`)
  - Code quality analysis
  - Style enforcement
  - Technical debt detection

- **Security Agent** (`security_agent`)
  - Security vulnerability scanning
  - Dependency auditing
  - Secret detection

- **Performance Agent** (`performance_agent`)
  - Performance profiling
  - Bottleneck identification
  - Optimization recommendations

- **Documentation Agent** (`documentation_agent`)
  - Automated documentation generation
  - API reference creation
  - README maintenance

- **Refactoring Agent** (`refactoring_agent`)
  - Code refactoring suggestions
  - Modernization recommendations
  - Design pattern application

### 3. Orchestration Agents

**Purpose**: Multi-agent coordination and workflow management

- **Mission Control** (`mission_control_agent`)
  - High-level multi-agent coordination
  - Strategic task planning
  - Resource allocation

- **Swarm Orchestrator** (`swarm_orchestrator_agent`)
  - Distributed agent task management
  - Load balancing across agents
  - Fault tolerance and recovery

- **Multi-Agent Coordinator** (`multi_agent_coordinator`)
  - Agent communication protocols
  - State synchronization
  - Conflict resolution

### 4. Utility Modules

**Purpose**: Supporting infrastructure and monitoring

- **Health Check Module** (`health_check_module`)
  - System health monitoring
  - Service availability checks
  - Diagnostic reporting

- **Diagnostic System** (`diagnostic_system`)
  - Automated troubleshooting
  - Error analysis
  - Solution recommendations

- **Telemetry Manager** (`telemetry_manager`)
  - Metrics collection
  - Performance monitoring
  - Usage analytics

- **Observability Manager** (`observability_manager`)
  - Distributed tracing integration
  - Log aggregation
  - Alert management

---

## 🔄 Agent Development Lifecycle

### Step 1: Create (Scaffolding)

```bash
# Scaffold a new agent
./bin/cbw-capture agent my_new_agent

# This creates:
# - agents/specs/my_new_agent.agent.yaml
# - agents/evals/my_new_agent/golden_test.yaml
# - Templates for prompts and tools
```

### Step 2: Author (YAML Spec)

Edit the generated `agents/specs/my_new_agent.agent.yaml`:

```yaml
api_version: v1
kind: Agent
metadata:
  name: my_new_agent
  version: 1.0.0
  tags: [automation, production]
  description: "Brief description of agent purpose"

spec:
  model_policy:
    preferred:
      provider: ollama
      model: qwen2.5-coder
    fallbacks:
      - provider: openrouter
        model: qwen/qwen-2.5-coder-32b-instruct

  prompts:
    system: prompts/my_new_agent_system.md

  tools:
    - name: file_processor
      config:
        max_size: 10485760  # 10MB
    - name: api_client
      config:
        base_url: https://api.example.com
        timeout: 30

  runtime:
    supported: [local, langchain, crewai]
    config:
      timeout: 300
      retries: 3

  eval:
    suites:
      - agents/evals/my_new_agent/golden_test.yaml
```

### Step 3: Validate (Schema Check)

```bash
# Validate the agent specification
./bin/cbw-agent validate agents/specs/my_new_agent.agent.yaml

# Check for:
# - YAML syntax errors
# - Schema validation
# - Tool reference validation
# - Runtime compatibility
```

### Step 4: Test (Golden Tests)

Create golden tests in `agents/evals/my_new_agent/golden_test.yaml`:

```yaml
name: my_new_agent_golden_test
version: 1.0.0
description: "Golden test suite for my_new_agent"

cases:
  - id: basic_functionality
    description: "Test basic agent functionality"
    input:
      task: "Process this test input"
      context: {}
    expected_output:
      status: success
      result_contains: ["processed", "success"]

  - id: error_handling
    description: "Test error handling with invalid input"
    input:
      task: ""
    expected_error: "Task cannot be empty"

  - id: tool_usage
    description: "Test agent uses tools correctly"
    input:
      task: "Use file processor tool"
    expected_tools_used: ["file_processor"]
```

### Step 5: Compile (JSON Artifact)

```bash
# Compile YAML spec to optimized JSON
./bin/cbw-agent compile agents/specs/my_new_agent.agent.yaml --out dist/agents

# Generates: dist/agents/my_new_agent.agent.json
```

### Step 6: Execute (Runtime)

```bash
# Run the agent locally
./bin/cbw-agent run agents/specs/my_new_agent.agent.yaml \
  --input "test input" \
  --runtime local

# Run with different runtime
./bin/cbw-agent run agents/specs/my_new_agent.agent.yaml \
  --input "test input" \
  --runtime langchain
```

### Step 7: Evaluate (Golden Tests)

```bash
# Run golden test evaluation
./bin/cbw-agent eval agents/evals/my_new_agent/golden_test.yaml

# Results include:
# - Pass/fail for each test case
# - Performance metrics
# - Quality scores
```

### Step 8: Iterate (Improvements)

Based on evaluation results:
1. Update agent spec for better performance
2. Add more tools if needed
3. Refine system prompts
4. Add more test cases
5. Repeat validation and evaluation

---

## 📝 Agent Specifications

### Metadata Section

```yaml
metadata:
  name: agent_name                    # Required: lowercase_snake_case
  version: 1.0.0                      # Required: Semantic versioning
  tags: [domain, type, environment]   # Optional: Classification tags
  description: "Agent description"    # Optional: Brief description
  author: "author_name"               # Optional: Agent creator
  license: "MIT"                      # Optional: License type
```

### Model Policy Section

```yaml
model_policy:
  preferred:
    provider: ollama              # Primary provider
    model: qwen2.5-coder         # Primary model
    config:                       # Optional model-specific config
      temperature: 0.7
      max_tokens: 2000
  
  fallbacks:                      # Optional fallback chain
    - provider: openrouter
      model: qwen/qwen-2.5-coder-32b-instruct
    - provider: openai
      model: gpt-4-turbo
      config:
        temperature: 0.8
```

**Supported Providers:**
- `ollama` - Local models via Ollama (recommended)
- `openai` - OpenAI API (GPT-4, GPT-3.5)
- `anthropic` - Claude models
- `openrouter` - OpenRouter aggregation service
- `cohere` - Cohere models
- `together` - Together AI
- `replicate` - Replicate platform

### Prompts Section

```yaml
prompts:
  system: prompts/agent_name_system.md    # System prompt file
  user_template: prompts/user_template.md # Optional user prompt template
  examples:                               # Optional few-shot examples
    - input: "example input"
      output: "example output"
```

### Tools Section

```yaml
tools:
  - name: tool_name
    config:
      option1: value1
      option2: value2
    required: true               # Optional: mark as required
  
  - name: another_tool
    config: {}
    required: false
```

### Runtime Section

```yaml
runtime:
  supported: [local, langchain, crewai]  # Supported runtimes
  config:
    timeout: 300                          # Execution timeout (seconds)
    retries: 3                            # Retry attempts on failure
    max_concurrent: 1                     # Max concurrent executions
    memory_limit: "1GB"                   # Memory limit
```

### Evaluation Section

```yaml
eval:
  suites:
    - agents/evals/agent_name/golden_test.yaml
    - agents/evals/agent_name/integration_test.yaml
  
  quality_thresholds:
    accuracy: 0.90              # Minimum accuracy
    latency_p95: 2.0           # Max 95th percentile latency (seconds)
    error_rate: 0.05           # Max error rate (5%)
```

---

## 🔧 Tool Integration

### Creating Custom Tools

Tools are implemented in `agents/tools/` and follow this pattern:

```python
#!/usr/bin/env python3
"""Custom Tool Module.

Description of what this tool does.
"""

from typing import Any
from pydantic import BaseModel, Field


class ToolConfig(BaseModel):
    """Configuration for Custom Tool."""
    
    api_key: str = Field(description="API key for service")
    timeout: int = Field(default=30, gt=0, description="Request timeout")
    retries: int = Field(default=3, ge=0, le=10, description="Retry attempts")


class CustomTool:
    """Tool for specific purpose."""
    
    name: str = "custom_tool"
    description: str = "Brief description for agent use"
    
    def __init__(self, config: ToolConfig) -> None:
        """Initialize tool with configuration."""
        self.config = config
    
    def execute(self, **kwargs: Any) -> dict[str, Any]:
        """Execute tool operation.
        
        Args:
            **kwargs: Tool-specific parameters
        
        Returns:
            Tool execution result
        
        Raises:
            ValueError: If required parameters missing
            RuntimeError: If execution fails
        """
        try:
            # Tool implementation
            result = self._process(**kwargs)
            return {
                "status": "success",
                "result": result,
                "metadata": {"tool": self.name}
            }
        except Exception as e:
            return {
                "status": "error",
                "error": str(e),
                "metadata": {"tool": self.name}
            }
    
    def _process(self, **kwargs: Any) -> Any:
        """Internal processing logic."""
        # Implementation details
        pass
```

### Registering Tools

Add tool to `agents/tools/__init__.py`:

```python
from .custom_tool import CustomTool
from .existing_tool import ExistingTool

__all__ = [
    "CustomTool",
    "ExistingTool",
]
```

### Using Tools in Agents

Reference tools in agent spec:

```yaml
tools:
  - name: custom_tool
    config:
      api_key: ${CUSTOM_TOOL_API_KEY}
      timeout: 60
      retries: 5
```

### Tool Best Practices

1. **Configuration Validation**: Use Pydantic for all tool configs
2. **Error Handling**: Return structured error responses
3. **Idempotency**: Tools should be idempotent when possible
4. **Documentation**: Clear docstrings with examples
5. **Testing**: Unit tests for all tool methods

---

## 🚀 Runtime Adapters

### Supported Runtimes

#### 1. Local Runtime ✅

**Status**: Fully implemented  
**Use Case**: Lightweight local execution  
**Provider**: Built-in

```bash
./bin/cbw-agent run spec.yaml --runtime local --input "test"
```

**Features**:
- Direct model inference
- Minimal overhead
- Full tool support
- Local model caching

#### 2. LangChain Runtime 🔄

**Status**: Adapter stub  
**Use Case**: LangChain framework integration  
**Provider**: LangChain

```bash
./bin/cbw-agent run spec.yaml --runtime langchain --input "test"
```

**Planned Features**:
- LangChain agent chains
- Memory persistence
- Callback handlers
- LangSmith integration

#### 3. CrewAI Runtime 🔄

**Status**: Adapter stub  
**Use Case**: Multi-agent collaboration  
**Provider**: CrewAI

```bash
./bin/cbw-agent run spec.yaml --runtime crewai --input "test"
```

**Planned Features**:
- Crew composition
- Role-based agents
- Task delegation
- Collaborative workflows

#### 4. PydanticAI Runtime 🔄

**Status**: Adapter stub  
**Use Case**: Type-safe agent definitions  
**Provider**: PydanticAI

```bash
./bin/cbw-agent run spec.yaml --runtime pydanticai --input "test"
```

**Planned Features**:
- Full type safety
- Pydantic validation
- Structured outputs
- Error handling

### Implementing Custom Runtimes

Create adapter in `src/cbw_foundry/runtime/adapters.py`:

```python
from typing import Any, Dict
from cbw_foundry.spec import AgentSpec


class CustomRuntime:
    """Custom runtime adapter."""
    
    def __init__(self, config: Dict[str, Any]) -> None:
        self.config = config
    
    def execute(self, agent_spec: AgentSpec, input_data: dict) -> dict:
        """Execute agent with custom runtime.
        
        Args:
            agent_spec: Agent specification
            input_data: Input data for agent
        
        Returns:
            Execution result
        """
        # Runtime implementation
        return {
            "status": "success",
            "result": "output",
            "metadata": {"runtime": "custom"}
        }
```

---

## 🧪 Testing & Evaluation

### Golden Test Format

```yaml
name: agent_name_golden_test
version: 1.0.0
description: "Test suite description"

metadata:
  author: "test_author"
  tags: [integration, regression]

cases:
  - id: test_case_1
    description: "Test case description"
    input:
      task: "Task description"
      context:
        key: value
    expected_output:
      status: success
      result_contains: ["expected", "phrases"]
      result_not_contains: ["error", "failed"]
    expected_tools_used: ["tool1", "tool2"]
    quality_thresholds:
      min_confidence: 0.8
      max_latency: 2.0

  - id: test_case_2
    description: "Error handling test"
    input:
      task: ""
    expected_error: "Task cannot be empty"
    expected_status: error
```

### Running Evaluations

```bash
# Run all golden tests
make eval

# Run specific test suite
./bin/cbw-agent eval agents/evals/agent_name/golden_test.yaml

# Run with verbose output
./bin/cbw-agent eval agents/evals/agent_name/golden_test.yaml --verbose

# Generate evaluation report
./bin/cbw-agent eval agents/evals/agent_name/golden_test.yaml --report output/eval_report.json
```

### Evaluation Metrics

Metrics collected during evaluation:

- **Accuracy**: Percentage of tests passed
- **Latency**: P50, P95, P99 response times
- **Error Rate**: Percentage of failed executions
- **Tool Usage**: Tools used per test case
- **Quality Score**: Overall quality rating (0.0-1.0)

---

## 💡 Best Practices

### 1. Agent Design

- **Single Responsibility**: Each agent should have one clear purpose
- **Clear Interface**: Well-defined inputs and outputs
- **Error Handling**: Graceful degradation and clear error messages
- **Documentation**: Comprehensive description of capabilities and limitations

### 2. System Prompts

- **Be Specific**: Clearly define agent role and responsibilities
- **Provide Examples**: Include few-shot examples for complex tasks
- **Set Boundaries**: Explicitly state what agent should/shouldn't do
- **Use Markdown**: Structure prompts with headings and lists

Example system prompt:

```markdown
# Audio Engineer Agent

You are an expert audio engineer specializing in podcast production.

## Responsibilities
- Audio enhancement and noise reduction
- Volume normalization and compression
- Format conversion and export
- Quality assessment and recommendations

## Capabilities
- Process audio files up to 2 hours in length
- Support formats: WAV, MP3, FLAC, AAC
- Apply professional-grade audio processing
- Generate detailed quality reports

## Guidelines
1. Always prioritize audio quality over processing speed
2. Preserve original files before making changes
3. Provide clear explanations of applied effects
4. Recommend industry-standard settings

## Limitations
- Cannot process video-only files
- Maximum file size: 500MB
- Cannot repair severely corrupted audio

## Examples
...
```

### 3. Tool Selection

- **Minimal Tools**: Only include necessary tools to reduce complexity
- **Tool Documentation**: Clearly document each tool's purpose
- **Configuration**: Provide sensible defaults with override options
- **Error Recovery**: Handle tool failures gracefully

### 4. Testing Strategy

- **Unit Tests**: Test individual agent methods
- **Integration Tests**: Test agent with tool interactions
- **Golden Tests**: Validate expected behavior with real scenarios
- **Regression Tests**: Prevent behavioral regressions

### 5. Performance Optimization

- **Lazy Loading**: Load models and resources on demand
- **Caching**: Cache expensive operations when possible
- **Async Operations**: Use async for I/O-bound tasks
- **Resource Limits**: Set appropriate timeouts and memory limits

### 6. Monitoring & Observability

- **Logging**: Comprehensive logging at appropriate levels
- **Metrics**: Track key performance indicators
- **Tracing**: Distributed tracing for multi-agent workflows
- **Alerts**: Configure alerts for failures and anomalies

---

## 📚 Agent Catalog

### Complete Agent Directory

```
agents/
├── library/                 # Pre-built agent modules (30+)
│   ├── audio_engineer_agent.py
│   ├── video_editing_agent.py
│   ├── social_media_agent.py
│   ├── transcription_agent.py
│   ├── github_agent.py
│   ├── content_analyst_agent.py
│   ├── testing_agent.py
│   ├── quality_agent.py
│   ├── security_agent.py
│   ├── performance_agent.py
│   ├── documentation_agent.py
│   ├── refactoring_agent.py
│   └── ... (18 more)
│
├── specs/                   # YAML agent specifications
│   ├── examples/           # Example agent specs
│   │   ├── hello_world.agent.yaml
│   │   └── basic_assistant.agent.yaml
│   └── production/         # Production agent specs
│
├── evals/                   # Golden test suites
│   ├── golden/             # Regression tests
│   └── integration/        # Integration tests
│
├── tools/                   # Reusable tool implementations
│   ├── file_processor.py
│   ├── api_client.py
│   ├── database_connector.py
│   └── __init__.py
│
├── toolsets/                # Domain-specific tool collections
│   └── jcsnotfunny/        # Content creation toolset
│
├── orchestrator/            # Multi-agent coordination
│   ├── mission_control.py
│   └── swarm_orchestrator.py
│
├── crewai/                  # CrewAI framework integration
│   └── crew_definitions.py
│
└── specialized/             # Domain-expert agents
    └── media_production/
```

---

## 🔗 Additional Resources

### Documentation
- [Agent Development Guide](docs/AGENT_DEVELOPMENT.md)
- [Tool Development Guide](docs/TOOL_DEVELOPMENT.md)
- [Runtime Adapters Guide](docs/RUNTIME_ADAPTERS.md)
- [Testing Guide](docs/TESTING_GUIDE.md)

### Runbooks
- [Using the Repo](kb/runbooks/using_the_repo.md)
- [Adding New Agents](kb/runbooks/adding_new_agent.md)

### Examples
- [Example Agents](agents/specs/examples/)
- [Tool Examples](agents/tools/)
- [Workflow Examples](workflows/)

---

## 🤝 Contributing

We welcome contributions! To contribute an agent:

1. Follow the [Agent Development Lifecycle](#agent-development-lifecycle)
2. Ensure all tests pass (`make test`)
3. Validate agent spec (`make validate`)
4. Create golden tests
5. Submit PR with:
   - Agent spec YAML
   - Implementation module (if custom logic)
   - Golden test suite
   - Documentation updates

---

**Version:** 1.0.0  
**Maintained by:** @cbwinslow  
**Last Updated:** 2026-02-13

*This guide is your comprehensive resource for working with AI agents in the CloudCurio Monorepo. Keep it handy as you develop and deploy agents!*
