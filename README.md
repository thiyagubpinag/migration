# MCP Migration Tools

A repository containing four MCP (Model Context Protocol) tool modules for migration, linting, running changes, and validation, integrated with IBM Watsonx via LangChain.

## 🚀 Features

- **Four MCP Tool Modules:**
  - `migration/` - Handle migration operations
  - `lint/` - Code quality and linting checks
  - `run-changes/` - Execute and apply code transformations
  - `validate/` - Validation operations

- **IBM Watsonx Integration:** Configured with LangChain for AI-powered operations
- **Boomerang Task Support:** Executable as a Boomerang task within the ROO environment
- **Flexible Model Allocation:** Support for specifying different Watsonx models
- **Test Suite:** Sample prompts and test runner included

## 📁 Repository Structure

```
migration/
├── config/
│   └── model-config.js          # Watsonx model configuration
├── tools/
│   ├── migration/
│   │   └── index.js             # Migration tool module
│   ├── lint/
│   │   └── index.js             # Lint tool module
│   ├── run-changes/
│   │   └── index.js             # Run changes tool module
│   └── validate/
│       └── index.js             # Validate tool module
├── tests/
│   ├── run-tests.js             # Test runner
│   └── prompts/                 # Sample test prompts
│       ├── migration-prompt.md
│       ├── lint-prompt.md
│       ├── run-changes-prompt.md
│       └── validate-prompt.md
├── index.js                     # Main entry point
├── package.json                 # Dependencies
├── boomerang.config.json        # Boomerang task configuration
├── .env.example                 # Environment variables template
└── README.md                    # This file
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
WATSONX_MODEL_ID=ibm/granite-13b-chat-v2
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
import { createTool, getAvailableTools } from './index.js';

// List available tools
const tools = getAvailableTools();
console.log(tools); // ['migration', 'lint', 'run-changes', 'validate']

// Create a tool instance
const migrationTool = createTool('migration');

// Execute the tool
const result = await migrationTool.execute({
  // your parameters here
});
```

### As a Boomerang Task

The repository is configured to run as a Boomerang task in the ROO environment. Use the `boomerang.config.json` configuration:

**Parameters:**
- `tool` (required): Tool to execute (migration, lint, run-changes, validate)
- `modelId` (optional): IBM Watsonx model ID to use
- `projectId` (optional): IBM Watsonx project ID (overrides env var)
- `params` (optional): Tool-specific parameters

**Example Boomerang execution:**
```json
{
  "tool": "migration",
  "modelId": "ibm/granite-13b-chat-v2",
  "params": {
    "source": "legacy-code.js",
    "target": "modern-code.js"
  }
}
```

## 🧪 Testing

Run the test suite:

```bash
npm test
```

The test suite will:
1. List all available tools
2. Create instances of each tool
3. Execute dry-run tests for each tool

### Sample Prompts

Test prompts are available in `tests/prompts/`:
- `migration-prompt.md` - Test migration operations
- `lint-prompt.md` - Test linting functionality
- `run-changes-prompt.md` - Test code transformations
- `validate-prompt.md` - Test validation operations

## 🔧 Tool Modules

### Migration Tool
Handles migration-related operations for code modernization and transformation.

### Lint Tool
Performs code quality checks and linting operations.

### Run Changes Tool
Executes and applies code transformations and changes.

### Validate Tool
Validates configurations, code structure, and dependencies.

## 📝 Development

Each tool module follows this structure:

```javascript
export class ToolName {
  constructor(customConfig = {}) {
    this.model = createWatsonxModel(customConfig);
    this.name = "tool-name";
  }

  async execute(params) {
    // Implementation here
  }

  getMetadata() {
    return {
      name: this.name,
      description: "Tool description",
      version: "1.0.0",
    };
  }
}
```

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
- [Boomerang Documentation](https://www.useboomerang.io/)

## 📧 Support

For issues and questions, please open an issue in the repository.