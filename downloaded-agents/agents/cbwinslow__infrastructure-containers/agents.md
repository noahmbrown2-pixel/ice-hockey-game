# AI Agents and Coding Tools Documentation

## Overview

This document details the AI agents, coding tools, and automation frameworks available in the infrastructure containers. These tools are designed to assist with development, automation, and AI-powered workflows.

## AI Agents and Frameworks

### 1. Ollama
- **Purpose**: Local LLM runner
- **Port**: 11434
- **Usage**: Run local large language models
- **Models**: Llama2, Llama3, Mistral, Mixtral, and others
- **Configuration**: Pre-configured in dev-tools container
- **Access**: Available via API and CLI

### 2. LocalAI
- **Purpose**: Self-hosted OpenAI-compatible API
- **Usage**: Run AI models locally with OpenAI-compatible endpoints
- **Configuration**: Pre-configured in dev-tools container
- **Benefits**: No external API dependencies, privacy

### 3. CrewAI
- **Purpose**: Multi-agent AI framework
- **Usage**: Create AI agents with specific roles and tools
- **Installation**: Available in future AI agents container
- **Use Cases**: Complex automation, research, data processing

### 4. Crawl4ai
- **Purpose**: Web scraping and data extraction
- **Usage**: Extract clean text, images, and structured data from websites
- **Installation**: Available in future AI agents container
- **Features**: JS rendering, content filtering, structured extraction

### 5. LangChain
- **Purpose**: LLM application development framework
- **Usage**: Build applications with LLMs
- **Installation**: Available in automation and dev-tools containers
- **Features**: Chains, agents, memory, tools

### 6. AutoGen
- **Purpose**: Multi-agent conversation framework
- **Usage**: Enable human productivity using LLMs
- **Installation**: Available in future AI agents container
- **Features**: Conversable agents for complex tasks

## Coding Terminal Agents

### 1. Cursor
- **Purpose**: AI-powered code editor
- **Based on**: VSCode with added AI capabilities
- **Access**: Available via code-server in dev-tools container
- **Features**: AI chat, AI commands, inline editing

### 2. Cline
- **Purpose**: AI coding assistant in terminal
- **Usage**: Natural language to code conversion
- **Installation**: Available in dev-tools container
- **Features**: Terminal-based AI coding assistance

### 3. Codeium
- **Purpose**: AI-powered code acceleration
- **Features**: Code completion, chat, generation
- **Installation**: Available in dev-tools container

### 4. Tabby
- **Purpose**: Self-hosted AI coding assistant
- **Features**: Code completion, chat, similar to GitHub Copilot
- **Installation**: Available in dev-tools container

### 5. Continue
- **Purpose**: VS Code extension for AI pair programming
- **Features**: Natural language coding in editor
- **Installation**: Available as VS Code extension in code-server

## Workflow Automation Agents

### 1. n8n
- **Purpose**: Workflow automation platform
- **Port**: 5678
- **Usage**: Connect different services and automate workflows
- **Features**: Visual workflow builder, 300+ integrations
- **Database**: Configured to use PostgreSQL

### 2. Flowise
- **Purpose**: UI for Langchain
- **Port**: 3001 (inside container: 3000)
- **Usage**: Build Langchain applications with drag-and-drop interface
- **Features**: Customizable chatbot builder

### 3. Dify
- **Purpose**: AI application development platform
- **Usage**: Build, test, and deploy AI applications
- **Features**: No-code solution for AI apps

## AI Development Frameworks

### 1. Hugging Face Transformers
- **Purpose**: State-of-the-art NLP models
- **Installation**: Available in dev-tools container
- **Usage**: Access pre-trained models for NLP tasks
- **Features**: 10,000+ models, 100+ languages

### 2. LlamaIndex
- **Purpose**: Data framework for LLMs
- **Usage**: Build applications with custom data sources
- **Installation**: Available in dev-tools container
- **Features**: Data indexing, query engines, agents

### 3. Vector Databases
- **Pinecone**: Managed vector database (cloud)
- **Chroma**: Open-source embedding database
- **Weaviate**: Vector database for AI applications
- **Qdrant**: Vector similarity search engine

## Configuration and Usage

### Environment Variables
```bash
# Common AI agent configurations
OLLAMA_HOST=11434
OPENAI_API_BASE=http://localhost:11434/v1  # When using Ollama
ANTHROPIC_API_BASE=  # If using Claude
DATABASE_URL=postgresql://user:pass@100.90.23.59:5432/ai_db
```

### Docker Volume Mounts
```yaml
volumes:
  - ./ai-models:/models  # For storing models
  - ./ai-workspace:/workspace  # For project files
  - ./ai-data:/data  # For training data
```

## Best Practices

### Security
- Use API keys and authentication for production
- Limit model access and resource usage
- Regular security updates of AI tools
- Privacy considerations with data handling

### Performance
- GPU acceleration for model inference
- Model quantization for faster inference
- Caching strategies for repeated queries
- Proper resource allocation

### Development
- Use version control for prompts and configurations
- Implement proper error handling
- Monitor token usage and costs
- Test with multiple models for comparison

## Integration Examples

### Using Ollama with LangChain
```python
from langchain.llms import Ollama
llm = Ollama(model="llama2")
response = llm("Hello, how are you?")
```

### Creating a CrewAI team
```python
from crewai import Agent, Task, Crew
researcher = Agent(
    role="Researcher",
    goal="Find relevant information",
    backstory="You are an expert researcher"
)
```

### Web scraping with Crawl4ai
```python
from crawl4ai import WebCrawler
crawler = WebCrawler()
result = crawler.run(url="https://example.com")
```

## Future Enhancements

### Planned AI Agents
- **AutoGPT**: Autonomous agent with memory and planning
- **BabyAGI**: Task execution and management
- **AgentGPT**: Autonomous agents in browser
- **GPT Researcher**: Automated research agent
- **SuperAGI**: Autonomous AGI development framework

### Additional Frameworks
- **Semantic Kernel**: Microsoft's AI orchestration platform
- **Haystack**: NLP framework for question answering
- **NeMo Guardrails**: Safety and controllability for LLMs
- **Guardrails AI**: Content moderation and safety framework

### Advanced Tools
- **Multi-modal models**: Vision + text combinations
- **Model fine-tuning tools**: Custom model training
- **Data annotation platforms**: For training data creation
- **MLOps tools**: Model deployment and monitoring

## Troubleshooting

### Common Issues
1. **Model loading errors**: Check available disk space and permissions
2. **Memory issues**: Adjust model size or quantization settings
3. **Connection problems**: Verify network connectivity and ports
4. **Performance issues**: Monitor resource usage and adjust allocation

### Debugging Commands
```bash
# Check Ollama status
docker exec dev-tools-container ollama list

# Test AI connection
docker exec dev-tools-container curl http://localhost:11434/api/tags

# Check model availability
docker exec dev-tools-container ollama pull llama2
```

## Resources

### Documentation
- Ollama: https://github.com/jmorganca/ollama
- LangChain: https://python.langchain.com
- CrewAI: https://crewai.readthedocs.io
- Hugging Face: https://huggingface.co/docs
- Crawl4ai: https://crawl4ai.com

### Communities
- AI Agent forums and communities
- Model sharing platforms
- Framework-specific support channels

This documentation provides a comprehensive overview of the AI agents and coding tools available in the infrastructure containers, with usage examples and best practices for implementation.