# Roomode Migration Tools Modes

This directory contains custom mode configurations for the migration tools MCP server with IBM Watsonx integration.

## Available Modes

### 🔄 Migration (`migration.json`)
Specialized mode for code migration from legacy systems to modern frameworks.
- **Slug**: `migration`
- **Purpose**: Analyze and migrate legacy code
- **Capabilities**: Legacy code analysis, framework migration, code modernization

### 🔍 Lint (`lint.json`)
Specialized mode for code quality analysis and linting.
- **Slug**: `lint`
- **Purpose**: Check code quality and identify issues
- **Capabilities**: Code quality analysis, style checking, best practice validation

### ⚡ Run Changes (`run-changes.json`)
Specialized mode for applying code transformations and updates.
- **Slug**: `run-changes`
- **Purpose**: Apply code changes and refactorings
- **Capabilities**: Code transformation, automated refactoring, dependency updates

### ✅ Validate (`validate.json`)
Specialized mode for code validation and verification.
- **Slug**: `validate`
- **Purpose**: Verify code correctness and compliance
- **Capabilities**: Code verification, requirements compliance, security checks

### 🔄 Migration Workflow (`migration-workflow.json`)
Comprehensive mode that executes the complete migration workflow.
- **Slug**: `migration-workflow`
- **Purpose**: Execute full migration pipeline
- **Workflow Steps**:
  1. Migration - Analyze and migrate code
  2. Lint - Check code quality
  3. Run Changes - Apply transformations
  4. Validate - Verify correctness

### 🤖 Watsonx LLM (`watsonx-llm.json`)
Direct interaction mode with IBM Watsonx language models.
- **Slug**: `watsonx-llm`
- **Purpose**: Custom prompts and AI-powered tasks
- **Capabilities**: Direct LLM interaction, custom prompt processing

## Mode Structure

Each mode file follows this structure:

```json
{
  "slug": "mode-identifier",
  "name": "Display Name",
  "description": "Brief description",
  "instructions": "Detailed instructions for the AI assistant",
  "model": "premium",
  "tools": {
    "mcp": {
      "servers": ["migration-tools"]
    }
  },
  "capabilities": [
    "List of capabilities"
  ]
}
```

## Usage

These modes are automatically loaded by the Roomode extension and can be activated through the mode selector in your IDE.

## MCP Integration

All modes use the `migration-tools` MCP server which provides:
- Integration with IBM Watsonx LLM
- Access to migration, lint, run-changes, and validate tools
- Configurable model selection (default: mistralai/mistral-medium-2505)

## Configuration

Mode behavior can be customized through:
- `roomode.config.json` - Tool definitions and schemas
- `.roomode/tasks.json` - Task configurations and workflows
- Environment variables for Watsonx credentials

## Related Files

- `roomode.config.json` - MCP server and tool configuration
- `.roomode/tasks.json` - Task and workflow definitions
- `mcp-server.js` - MCP server implementation