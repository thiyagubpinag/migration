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

### Getting Started with Chat

The easiest way to use this tool is through Roo Chat's natural language interface:

1. **Open Roo Chat** in your IDE (VSCode/Cursor)
2. **Switch to Migration Mode**: Type `/mode migration`
3. **Start asking questions naturally** - no special syntax required!

### 📋 How to Ask Questions in Chat

#### **Basic Question Patterns**

You can ask questions in natural language. Here are effective patterns:

**Scanning & Analysis:**
```
✅ "Scan my legacy user service"
✅ "Analyze the code in examples/legacy-code/"
✅ "What issues are in UserService.java?"
✅ "Check my database connector for problems"
✅ "Show me all security issues in the codebase"
```

**Getting Recommendations:**
```
✅ "What should I fix first?"
✅ "Give me AI recommendations for user-service.js"
✅ "How do I modernize this code?"
✅ "What's the migration plan?"
✅ "Show me IBM-approved patterns for this"
```

**Previewing Changes:**
```
✅ "What will change if I migrate?"
✅ "Show me a preview of the transformations"
✅ "Can I see the diff before applying?"
✅ "What's the impact of these changes?"
```

**Applying Migrations:**
```
✅ "Apply the migration"
✅ "Migrate user-service.js to modern code"
✅ "Transform this file using IBM standards"
✅ "Fix all the issues you found"
```

**Specific Requests:**
```
✅ "Convert callbacks to async/await"
✅ "Remove hardcoded credentials"
✅ "Add error handling"
✅ "Implement connection pooling"
✅ "Add input validation"
```

#### **💡 Tips for Better Results**

1. **Be Specific About Files:**
   - ✅ "Scan examples/legacy-code/UserService.java"
   - ❌ "Scan the code" (too vague)

2. **Ask One Thing at a Time:**
   - ✅ "Scan the code" → wait for results → "Show recommendations"
   - ❌ "Scan the code and show recommendations and apply changes" (too much at once)

3. **Use Context from Previous Responses:**
   - ✅ "Yes, apply those changes" (after seeing preview)
   - ✅ "Show me more details about issue #3"

4. **Ask for Clarification:**
   - ✅ "What does 'callback hell' mean?"
   - ✅ "Why is this a security issue?"
   - ✅ "What's the benefit of connection pooling?"

5. **Request Different Formats:**
   - ✅ "Show me a summary"
   - ✅ "Give me detailed explanations"
   - ✅ "List the changes as bullet points"

### 🎯 Complete Chat Workflow Example

Here's a typical conversation flow:

```
You: "Scan examples/legacy-code/UserService.java"

Roo: [Analyzes code using migration tool]
✅ Scan completed successfully

Summary:
  - File: examples/legacy-code/UserService.java
  - Total Issues: 15
  - Critical Issues: 2 (security)
  - Error Issues: 8 (functionality)
  - Priority Score: 75/100 (high urgency)

Top Issues:
  1. Hardcoded database credentials (CRITICAL)
  2. SQL injection vulnerability (CRITICAL)
  3. No connection pooling (ERROR)

Would you like AI-powered recommendations?

---

You: "Yes, what should I do about the security issues?"

Roo: [Generates AI recommendations using Watsonx]
🤖 Security Recommendations:

1. **Remove Hardcoded Credentials** (30 min, HIGH priority)
   - Move to environment variables
   - Use IBM Secrets Manager
   - Example: System.getenv("DB_PASSWORD")

2. **Fix SQL Injection** (1 hour, CRITICAL priority)
   - Use PreparedStatement instead of Statement
   - Parameterize all queries
   - Example: "SELECT * FROM users WHERE id = ?"

Would you like to see the full migration plan?

---

You: "Show me what will change in the code"

Roo: [Runs dry-run migration]
🔍 Preview of Changes:

File: UserService.java
Lines to modify: 45

Key transformations:
  ✓ Line 12: String password = "admin123"
    → String password = System.getenv("DB_PASSWORD")
  
  ✓ Line 28: Statement stmt = conn.createStatement()
    → PreparedStatement stmt = conn.prepareStatement(sql)
  
  ✓ Line 35: Add connection pooling with HikariCP

Breaking changes: 1 (constructor signature)
Estimated effort: 2-3 hours

Ready to apply these changes?

---

You: "Yes, apply the migration"

Roo: ✅ Migration complete!
  - Backup created: UserService.java.backup
  - 8 transformations applied
  - 45 lines modified
  - 0 errors

Next steps:
  1. Update .env with DB_PASSWORD
  2. Add HikariCP dependency to pom.xml
  3. Run tests to verify changes

Would you like me to help with the next steps?

---

You: "What do I need to add to pom.xml?"

Roo: 📦 Add these dependencies to pom.xml:

<dependency>
    <groupId>com.zaxxer</groupId>
    <artifactId>HikariCP</artifactId>
    <version>5.0.1</version>
</dependency>

Would you like me to update pom.xml for you?
```

### 🗣️ Common Chat Commands

| What You Want | What to Say |
|---------------|-------------|
| Start analysis | "Scan [filename]" or "Analyze my code" |
| Get recommendations | "Show recommendations" or "What should I fix?" |
| Preview changes | "Show me the preview" or "What will change?" |
| Apply migration | "Apply the changes" or "Migrate the code" |
| Get help | "How do I fix [issue]?" or "Explain [concept]" |
| Check status | "What's the status?" or "Show me the summary" |
| Undo changes | "Restore the backup" or "Undo the migration" |

### 🎨 Advanced Chat Features

**Multi-file Operations:**
```
"Scan all files in examples/legacy-code/"
"Migrate all Java files to modern standards"
"Compare legacy-code/ with ibm-modern-code/"
```

**Conditional Requests:**
```
"Only fix critical security issues"
"Apply changes that don't break the API"
"Show me issues that take less than 1 hour to fix"
```

**Explanatory Requests:**
```
"Explain why this is a problem"
"Show me the IBM standard for this pattern"
"What are the benefits of this change?"
"Walk me through the migration step by step"
```

### 📚 Additional Resources

- **[ROO_CHAT_QUICKSTART.md](ROO_CHAT_QUICKSTART.md)** - Quick start guide with examples
- **[ROO_CHAT_INTEGRATION.md](ROO_CHAT_INTEGRATION.md)** - Detailed integration guide
- **[MIGRATION_GUIDE.md](MIGRATION_GUIDE.md)** - Complete migration documentation

### 💡 Pro Tips

1. **Start Small**: Begin with one file to understand the process
2. **Review Previews**: Always check the preview before applying changes
3. **Use Backups**: Automatic backups are created, but commit to git first
4. **Ask Questions**: Don't hesitate to ask "why" or request explanations
5. **Iterate**: You can refine requests based on results


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