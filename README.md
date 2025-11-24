# IBM-Aligned Code Migration System

An AI-driven code migration tool that modernizes legacy codebases to IBM-approved standards using IBM Watsonx AI and MCP (Model Context Protocol) integration.

## 🌟 Highlights

- **🤖 AI-Powered Migration** - Uses IBM Watsonx for intelligent recommendations
- **📊 IBM Standards Compliance** - Compares against IBM-approved modern code
- **💬 Roo Chat Integration** - Use naturally through chat interface
- **🔒 Production-Ready** - Automatic backups, dry-run mode, approval workflow
- **📝 Comprehensive** - Covers syntax, security, architecture, and more
- **✅ Complete Examples** - Working legacy and modern code samples

## 🚀 Quick Start

### For Roo Chat Users (Recommended)

1. **Open Roo Chat** in your IDE
2. **Switch to Migration Mode**: `/mode migration`
3. **Start chatting**:
   ```
   "Scan my legacy user service and show me what needs to be fixed"
   ```

That's it! See **[ROO_CHAT_QUICKSTART.md](ROO_CHAT_QUICKSTART.md)** for details.

### For Command Line Users

```bash
# Install dependencies
npm install

# Configure .env with IBM Watsonx credentials
cp .env.example .env

# Run example migration
npm run example:migration
```

## 🎯 What It Does

1. **Scans** legacy code against IBM modernization rules
2. **Compares** with IBM-approved modern implementations
3. **Generates** AI-powered recommendations using Watsonx
4. **Previews** changes in dry-run mode
5. **Requests** approval before applying
6. **Applies** transformations automatically
7. **Creates** backups and detailed reports

## 📦 What's Included

- **Legacy Code Examples** - 3 files with common anti-patterns
- **IBM Modern Code** - 3 IBM-approved reference implementations
- **Migration Tool** - AI-driven migration engine (1,300+ lines)
- **IBM Rules** - 30+ modernization rules across 9 categories
- **Documentation** - 3,600+ lines of guides and examples
- **Working Example** - Complete end-to-end demonstration

## 📁 Repository Structure

```
migration/
├── legacy-code/                 # Legacy code examples
│   ├── user-service.js         # Callback-based service
│   ├── database-connector.js   # Hardcoded credentials
│   └── api-routes.js           # No security/validation
│
├── ibm-modern-code/            # IBM-approved modern code
│   ├── user-service.js         # ES6 classes, async/await
│   ├── database-connector.js   # Connection pooling, security
│   └── api-routes.js           # Rate limiting, auth, validation
│
├── config/
│   ├── ibm-modernization-rules.json  # IBM modernization rules
│   └── model-config.js               # Watsonx configuration
│
├── tools/migration/
│   ├── index.js                # Main migration orchestrator
│   ├── code-analyzer.js        # Code analysis engine
│   ├── ai-recommender.js       # AI recommendation generator
│   └── code-migrator.js        # Code transformation engine
│
├── examples/
│   └── migration-example.js    # End-to-end example
│
├── Documentation/
│   ├── ROO_CHAT_QUICKSTART.md  # Quick start for Roo Chat
│   ├── ROO_CHAT_INTEGRATION.md # Detailed Roo integration
│   ├── MIGRATION_GUIDE.md      # Complete migration guide
│   ├── PROJECT_OVERVIEW.md     # Architecture overview
│   ├── QUICK_REFERENCE.md      # Command reference
│   └── ARCHITECTURE.md         # System architecture
│
├── mcp-server.js               # MCP server for Roo Chat
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
## 💬 Using with Roo Chat

### Interactive Migration via Chat

The easiest way to use this tool is through Roo Chat:

1. **Open Roo Chat** in your IDE (VSCode/Cursor)
2. **Switch to Migration Mode**: Type `/mode migration`
3. **Start chatting naturally**:

```
You: "Scan my legacy user service and show me what needs to be fixed"

Roo: [Analyzes code using migration tool]
✅ Scan completed successfully

Summary:
  - File: legacy-code/user-service.js
  - Total Issues: 15
  - Critical Issues: 2 (security)
  - Error Issues: 8 (functionality)
  - Priority Score: 75/100 (high urgency)

Would you like AI-powered recommendations?

You: "Yes, show me the recommendations"

Roo: [Generates AI recommendations using Watsonx]
🤖 Migration Plan Generated

Priority Steps:
  1. Remove hardcoded credentials (30 min)
  2. Convert to ES6 modules (1 hour)
  3. Modernize async patterns (2-3 hours)
  ...

Total effort: 1-2 days
Breaking changes: 3

Would you like to preview the changes?

You: "Yes, show me the preview"

Roo: [Runs dry-run migration]
🔍 Preview of Changes:
  - 8 transformations
  - 45 lines to change
  
Key changes:
  var → const
  callbacks → async/await
  hardcoded passwords → env vars

Ready to apply?

You: "Yes, apply the migration"

Roo: ✅ Migration complete!
  - Backup created
  - 8 changes applied
  - 45 lines modified

Next: Run tests?
```

### Natural Language Commands

Just talk naturally - Roo understands:
- "Scan the legacy code"
- "Show me AI recommendations"
- "What will change?"
- "Apply the migration"
- "Run the tests"

See **[ROO_CHAT_QUICKSTART.md](ROO_CHAT_QUICKSTART.md)** for more examples and **[ROO_CHAT_INTEGRATION.md](ROO_CHAT_INTEGRATION.md)** for detailed integration guide.


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
  "modelId": "mistralai/mistral-medium-2505",
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