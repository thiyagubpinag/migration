# MCP Server Setup Guide

## Overview

This project includes a fully functional MCP (Model Context Protocol) server that exposes the Watsonx LLM tool through a standardized interface. The server can be used with any MCP-compatible client.

## What's Been Set Up

### 1. **Roomode Configuration** (`roomode.config.json`)
- Defines the MCP server configuration
- Watsonx LLM tool with input schema
- Specifies environment variables needed

### 2. **Boomerang Task Configuration** (`boomerang.config.json`)
- Configured for Boomerang task execution
- Watsonx LLM tool parameters

### 3. **MCP Server** (`mcp-server.js`)
- Implements the Model Context Protocol
- Exposes Watsonx LLM tool via stdio transport
- Handles tool listing and execution

### 4. **Tool Registry** (`index.js`)
- Watsonx LLM tool registered and exported
- Factory function for creating tool instances
- Easy tool discovery

## Available Tool

### Watsonx LLM Call
```json
{
  "name": "watsonx_llm_call",
  "description": "Direct interaction with IBM Watsonx LLM for AI-powered text generation and analysis",
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
   - List available tools
   - Test tool calls with different parameters
   - See responses in real-time

### With Claude Desktop or Other MCP Clients

Add to your MCP client configuration (e.g., Claude Desktop's config):

```json
{
  "mcpServers": {
    "watsonx-llm": {
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
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"watsonx_llm_call","arguments":{"useSample":true}}}' | npm run mcp
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
    └── watsonx_llm/           # Watsonx LLM tool
        ├── index.js           # Tool implementation
        ├── run-sample.js      # Sample usage
        └── sample-prompt.md   # Example prompts
```

## Available NPM Scripts

- `npm start` - Run the basic tool registry
- `npm run mcp` - Start the MCP server
- `npm run mcp:dev` - Start MCP server with auto-reload

## Next Steps

1. **Configure your environment** - Add your Watsonx credentials to `.env`
2. **Test the server** - Use MCP Inspector to verify the tool works
3. **Integrate with clients** - Add to Claude Desktop or other MCP clients
4. **Start using** - Send prompts to the Watsonx LLM through MCP

## Troubleshooting

### Server won't start
- Check that all dependencies are installed: `npm install`
- Verify your `.env` file has all required variables
- Check Node.js version (requires Node 18+)

### Tool not appearing
- Verify the server is running: `npm run mcp`
- Check the tool registry in `index.js`
- Ensure tool class is properly exported

### Watsonx errors
- Verify your API key and project ID are correct
- Check that the Watsonx service is accessible
- Ensure the model ID is valid

## Resources

- [Model Context Protocol Documentation](https://modelcontextprotocol.io)
- [IBM Watsonx Documentation](https://www.ibm.com/docs/en/watsonx)
- [LangChain Documentation](https://js.langchain.com)

## Made with Bob 🤖