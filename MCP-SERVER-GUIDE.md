# MCP Server Setup Guide

## Overview

This project now includes a fully functional MCP (Model Context Protocol) server that exposes all migration tools through a standardized interface. The server can be used with any MCP-compatible client.

## What's Been Set Up

### 1. **Roomode Configuration** (`roomode.config.json`)
- Defines the MCP server configuration
- Lists all 5 tools with their schemas
- Specifies environment variables needed

### 2. **Boomerang Task Configuration** (`boomerang.config.json`)
- Updated to include all 5 tools (migration, lint, run-changes, validate, watsonx_llm)
- Configured for Boomerang task execution

### 3. **MCP Server** (`mcp-server.js`)
- Implements the Model Context Protocol
- Exposes all tools via stdio transport
- Handles tool listing and execution

### 4. **Tool Registry** (`index.js`)
- All 5 tools registered:
  - `migration` - Migration operations
  - `lint` - Code linting and quality checks
  - `run-changes` - Apply changes and transformations
  - `validate` - Validation operations
  - `watsonx_llm` - Direct LLM interaction

## Available Tools

### 1. Migration Tool
```json
{
  "name": "migration",
  "description": "Tool for handling migration operations",
  "params": {
    "params": "object - Migration-specific parameters",
    "modelId": "string - IBM Watsonx model ID"
  }
}
```

### 2. Lint Tool
```json
{
  "name": "lint",
  "description": "Tool for linting and code quality checks",
  "params": {
    "params": "object - Lint-specific parameters",
    "modelId": "string - IBM Watsonx model ID"
  }
}
```

### 3. Run Changes Tool
```json
{
  "name": "run-changes",
  "description": "Tool for running and applying changes",
  "params": {
    "params": "object - Run-changes specific parameters",
    "modelId": "string - IBM Watsonx model ID"
  }
}
```

### 4. Validate Tool
```json
{
  "name": "validate",
  "description": "Tool for validation operations",
  "params": {
    "params": "object - Validation-specific parameters",
    "modelId": "string - IBM Watsonx model ID"
  }
}
```

### 5. Watsonx LLM Tool
```json
{
  "name": "watsonx_llm",
  "description": "Tool for direct interaction with Watsonx LLM",
  "params": {
    "prompt": "string - The prompt to send to the model",
    "useSample": "boolean - Use the sample prompt from file",
    "modelId": "string - IBM Watsonx model ID"
  }
}
```

## Setup Instructions

### 1. Environment Variables

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Edit `.env` and add your IBM Watsonx credentials:

```env
WATSONX_URL=https://us-south.ml.cloud.ibm.com
WATSONX_VERSION=2024-05-31
WATSONX_PROJECT_ID=your-project-id-here
WATSONX_API_KEY=your-api-key-here
WATSONX_MODEL_ID=mistralai/mistral-medium-2505
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the MCP Server

```bash
npm run mcp
```

Or for development with auto-reload:

```bash
npm run mcp:dev
```

## Using the MCP Server

### With MCP Inspector (Recommended for Testing)

1. Install MCP Inspector:
```bash
npx @modelcontextprotocol/inspector node mcp-server.js
```

2. This will open a web interface where you can:
   - List all available tools
   - Test tool calls with different parameters
   - See responses in real-time

### With Claude Desktop or Other MCP Clients

Add to your MCP client configuration (e.g., Claude Desktop's config):

```json
{
  "mcpServers": {
    "migration-tools": {
      "command": "node",
      "args": ["/path/to/migration/mcp-server.js"],
      "env": {
        "WATSONX_PROJECT_ID": "your-project-id",
        "WATSONX_API_KEY": "your-api-key"
      }
    }
  }
}
```

### Programmatic Usage

```javascript
import { createTool } from './index.js';

// Create a tool instance
const llmTool = createTool('watsonx_llm');

// Execute with a prompt
const result = await llmTool.execute({
  prompt: "Explain what MCP is in simple terms"
});

console.log(result);
```

## Testing the Server

### Test with watsonx_llm tool:

```bash
# Using the sample prompt
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"watsonx_llm","arguments":{"useSample":true}}}' | npm run mcp
```

### Test listing tools:

```bash
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | npm run mcp
```

## Project Structure

```
migration/
├── mcp-server.js              # MCP server implementation
├── roomode.config.json        # Roomode configuration
├── boomerang.config.json      # Boomerang task configuration
├── index.js                   # Tool registry and exports
├── package.json               # Dependencies and scripts
├── config/
│   └── model-config.js        # Watsonx model configuration
└── tools/
    ├── migration/             # Migration tool
    ├── lint/                  # Lint tool
    ├── run-changes/           # Run changes tool
    ├── validate/              # Validate tool
    └── watsonx_llm/           # Watsonx LLM tool
```

## Available NPM Scripts

- `npm start` - Run the basic tool registry
- `npm run mcp` - Start the MCP server
- `npm run mcp:dev` - Start MCP server with auto-reload
- `npm test` - Run tests

## Next Steps

1. **Configure your environment** - Add your Watsonx credentials to `.env`
2. **Test the server** - Use MCP Inspector to verify all tools work
3. **Integrate with clients** - Add to Claude Desktop or other MCP clients
4. **Implement tool logic** - Each tool currently has placeholder implementations
5. **Add more tools** - Extend the registry with additional tools as needed

## Troubleshooting

### Server won't start
- Check that all dependencies are installed: `npm install`
- Verify your `.env` file has all required variables
- Check Node.js version (requires Node 18+)

### Tools not appearing
- Verify the server is running: `npm run mcp`
- Check the tool registry in `index.js`
- Ensure tool classes are properly exported

### Watsonx errors
- Verify your API key and project ID are correct
- Check that the Watsonx service is accessible
- Ensure the model ID is valid

## Resources

- [Model Context Protocol Documentation](https://modelcontextprotocol.io)
- [IBM Watsonx Documentation](https://www.ibm.com/docs/en/watsonx)
- [LangChain Documentation](https://js.langchain.com)

## Made with Bob 🤖