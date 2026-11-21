# Claude Commands

This directory contains custom Claude commands for the project.

## Available Commands

### analyze
- **Description**: Perform comprehensive multi-agent analysis on any topic with Notion integration
- **Version**: 1.0.0
- **Usage**:
  ```bash
  analyze --topic "Bitcoin"
  analyze --topic "Ethereum" --no-whatsapp
  analyze --topic "AI Market Trends" --verbose
  ```
- **Options**:
  - `--topic, -t` (required): The topic to analyze
  - `--no-whatsapp, -w`: Disable WhatsApp notifications
  - `--verbose, -v`: Enable verbose output

## Command Structure

Each command is defined in a JSON file with:
- `name`: Command name
- `description`: What the command does
- `version`: Semantic version
- `command`: Executable details and options
- `examples`: Usage examples
- `capabilities`: What the command can do
- `requirements`: Prerequisites
- `tags`: Categories for discovery

## Creating New Commands

1. Create a new JSON file: `command-name.json`
2. Define the command structure
3. Link to the appropriate executable
4. Test the command thoroughly
5. Document in this README

## Integration

These commands integrate with:
- Enterprise Workflow Analyzer
- TheBaby_Agents system
- Notion API
- WhatsApp MCP server
- Multi-agent orchestration