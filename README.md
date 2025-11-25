# IBM Watsonx LLM MCP Tool

A Model Context Protocol (MCP) tool for direct interaction with IBM Watsonx AI models through a standardized interface.

## 🌟 Highlights

- **🤖 Direct LLM Access** - Interact with IBM Watsonx AI models
- **🔌 MCP Integration** - Standard Model Context Protocol interface
- **💬 Easy to Use** - Simple API for AI-powered text generation
- **🔒 Secure** - Environment-based credential management
- **⚡ Fast** - Optimized for performance with LangChain

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
npm install

# Configure .env with IBM Watsonx credentials
cp .env.example .env
# Edit .env with your credentials
```

### Basic Usage

```javascript
import { WatsonxLLMTool } from './index.js';

const llmTool = new WatsonxLLMTool();
const result = await llmTool.execute({
  prompt: "Explain quantum computing in simple terms"
});

console.log(result);
```

## 📦 What's Included

- **Watsonx LLM Tool** - Direct interaction with IBM Watsonx models
- **MCP Server** - Model Context Protocol server implementation
- **Configuration** - Easy setup with environment variables
- **Examples** - Sample prompts and usage patterns

## 📁 Repository Structure

```
migration/
├── tools/watsonx_llm/          # Watsonx LLM tool
│   ├── index.js                # Main tool implementation
│   ├── run-sample.js           # Sample usage script
│   └── sample-prompt.md        # Example prompts
│
├── config/
│   └── model-config.js         # Watsonx configuration
│
├── mcp-server.js               # MCP server
├── index.js                    # Tool registry
├── package.json                # Dependencies
└── README.md                   # This file
```

## 🛠️ Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd migration
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your IBM Watsonx credentials
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file with the following variables:

```env
WATSONX_URL=https://us-south.ml.cloud.ibm.com
WATSONX_VERSION=2024-05-31
WATSONX_PROJECT_ID=your-project-id-here
WATSONX_API_KEY=your-api-key-here
WATSONX_MODEL_ID=mistralai/mistral-medium-2505
```

### Model Configuration

The model is configured in `config/model-config.js` with the following settings:

```javascript
return new ChatWatsonx({
  serviceUrl: config.url,
  version: config.version,
  projectId: config.projectId,
  watsonxAIAuthType: "iam",
  watsonxAIApikey: config.apiKey,
  model: config.modelId,

  maxTokens: 128000,
  maxCompletionTokens: 32000,
  temperature: 0,
});
```

## 🎯 Usage

### As a Node.js Module

```javascript
import { createTool } from './index.js';

// Create a tool instance
const llmTool = createTool('watsonx_llm');

// Execute with a prompt
const result = await llmTool.execute({
  prompt: "What is the meaning of life?"
});

console.log(result);
```

### Using the MCP Server

Start the MCP server:

```bash
npm run mcp
```

Or for development with auto-reload:

```bash
npm run mcp:dev
```

### With MCP Clients (Roo/Claude Desktop)

Add to your MCP client configuration:

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

## 🧪 Testing

Run the sample script:

```bash
node tools/watsonx_llm/run-sample.js
```

Test the MCP server:

```bash
node test-mcp-server.js
```

## 📝 API Reference

### WatsonxLLMTool

#### Constructor
```javascript
new WatsonxLLMTool(customConfig = {})
```

#### Methods

**execute(params)**
- `params.prompt` (string) - The prompt to send to the model
- `params.useSample` (boolean) - Use the sample prompt from file
- `params.modelId` (string, optional) - Override the default model ID

Returns: Promise with the model's response

**getMetadata()**

Returns tool metadata including name, description, and version.

## 🔧 Available NPM Scripts

- `npm start` - Run the tool registry
- `npm run mcp` - Start the MCP server
- `npm run mcp:dev` - Start MCP server with auto-reload

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

ISC

## 🔗 Related Resources

- [IBM Watsonx Documentation](https://www.ibm.com/watsonx)
- [LangChain Documentation](https://js.langchain.com/)
- [Model Context Protocol](https://modelcontextprotocol.io)

## 📧 Support

For issues and questions, please open an issue in the repository.

---

**Made with Bob** 🤖