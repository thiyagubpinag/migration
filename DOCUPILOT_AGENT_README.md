# DocuPilot Agent - Java Code Migration System

## 🎯 Overview

DocuPilot Agent is an AI-powered Java code migration system that automatically modernizes legacy Java code to the latest standards. It uses IBM Watsonx AI to provide intelligent recommendations based on dynamically fetched Java guidelines.

## 🌟 Key Features

### 1. **Dynamic Guideline Loader (DocuPilot Agent)**
- Automatically detects Java version from source code
- Fetches latest Java documentation and best practices
- Normalizes guidelines to unified JSON schema
- No hardcoded rules - everything is AI-generated

### 2. **Code Analyzer**
- Static analysis of Java code
- Detects deprecated APIs
- Identifies security vulnerabilities
- Finds performance issues
- Checks code style violations
- Detects outdated patterns

### 3. **AI-Powered Recommendations (Watsonx)**
- Complete modernized code generation
- Step-by-step migration instructions
- Security fixes
- Performance optimizations
- Dependency updates
- Diff/patch file generation

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     User Input                               │
│              (Legacy Java Code)                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              DocuPilot Agent                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  1. Detect Java Version                              │  │
│  │  2. Fetch Oracle Java SE Docs                        │  │
│  │  3. Fetch Effective Java Principles                  │  │
│  │  4. Fetch JEP Changes                                │  │
│  │  5. Fetch Security Guidelines (OWASP)                │  │
│  │  6. Normalize to Unified Schema                      │  │
│  │  7. Save java-guidelines.json                        │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Code Analyzer                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  • Parse Java source code                            │  │
│  │  • Detect deprecated APIs                            │  │
│  │  • Find security issues                              │  │
│  │  • Identify performance problems                     │  │
│  │  • Check code style                                  │  │
│  │  • Generate structured ruleset                       │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│         Code Recommendation (Watsonx AI)                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  • Analyze issues + guidelines                       │  │
│  │  • Generate modernized code                          │  │
│  │  • Create migration steps                            │  │
│  │  • Suggest dependency updates                        │  │
│  │  • Provide security fixes                            │  │
│  │  • Generate diff/patch                               │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    Output                                    │
│  • Modernized Java Code                                     │
│  • Migration Report                                         │
│  • Analysis Results                                         │
│  • Recommendations                                          │
│  • Diff/Patch Files                                         │
└─────────────────────────────────────────────────────────────┘
```

## 📦 Installation

```bash
# Clone the repository
git clone <repository-url>
cd migration

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your IBM Watsonx credentials
```

### Required Environment Variables

```env
WATSONX_URL=https://us-south.ml.cloud.ibm.com
WATSONX_VERSION=2024-05-31
WATSONX_PROJECT_ID=your-project-id
WATSONX_API_KEY=your-api-key
WATSONX_MODEL_ID=mistralai/mistral-medium-2505
```

## 🚀 Usage

### Option 1: Complete Migration Example (Recommended)

```bash
node examples/complete-migration-example.js
```

This runs the full workflow:
1. Loads legacy Java code
2. Generates guidelines with DocuPilot Agent
3. Analyzes code
4. Generates AI recommendations
5. Saves all results

### Option 2: Individual Tools

#### DocuPilot Agent

```javascript
import { DocuPilotAgent } from './tools/docupilot-agent/index.js';

const docuPilot = new DocuPilotAgent();
const result = await docuPilot.execute({
  javaCode: '...your java code...',
  targetVersion: '21'
});

console.log(result.guidelines);
```

#### Code Analyzer

```javascript
import { CodeAnalyzer } from './tools/code-analyzer/index.js';

const analyzer = new CodeAnalyzer();
const result = await analyzer.execute({
  javaCode: '...your java code...',
  filePath: 'MyClass.java'
});

console.log(result.rules);
console.log(result.summary);
```

#### Code Recommendation

```javascript
import { CodeRecommendation } from './tools/code-recommendation/index.js';

const recommender = new CodeRecommendation();
const result = await recommender.execute({
  javaCode: '...your java code...',
  analysisRules: [...rules from analyzer...],
  targetVersion: '21'
});

console.log(result.recommendations);
```

### Option 3: MCP Server (for Roo Chat Integration)

```bash
# Start MCP server
npm run mcp

# Or with auto-reload
npm run mcp:dev
```

Then use in Roo Chat:
```
"Analyze my Java code and provide migration recommendations"
```

## 📊 What Gets Analyzed

### 1. Deprecated APIs
- Old Date/Time APIs → java.time
- Wrapper constructors → valueOf()
- Removed Thread methods

### 2. Security Issues
- Hardcoded credentials
- SQL injection risks
- Weak cryptography (MD5, DES)
- Insecure random number generation
- Path traversal vulnerabilities

### 3. Code Style
- Naming conventions
- Raw types usage
- Missing generics
- Improper exception handling

### 4. Performance
- String concatenation in loops
- Inefficient collection operations
- Boxing/unboxing overhead
- Repeated regex compilation

### 5. Modernization Opportunities
- Anonymous classes → Lambda expressions
- For loops → Stream API
- Explicit types → var keyword
- Data classes → Records (Java 17+)
- Traditional threads → Virtual threads (Java 21)

## 📁 Project Structure

```
migration/
├── config/
│   ├── java-detection-config.js    # Java version detection
│   └── model-config.js              # Watsonx configuration
│
├── tools/
│   ├── docupilot-agent/
│   │   └── index.js                 # Guideline loader
│   ├── code-analyzer/
│   │   └── index.js                 # Code analysis
│   ├── code-recommendation/
│   │   └── index.js                 # AI recommendations
│   └── watsonx_llm/
│       └── index.js                 # Watsonx integration
│
├── guidelines/
│   └── java/
│       ├── java-guidelines-schema.json
│       └── java-guidelines.json     # Generated guidelines
│
├── examples/
│   ├── legacy-code/
│   │   └── UserService.java         # Sample legacy code
│   ├── complete-migration-example.js
│   └── output/                      # Generated results
│
├── index.js                         # Main entry point
├── mcp-server.js                    # MCP server
└── package.json
```

## 🔧 Configuration

### Java Detection Config

Located in `config/java-detection-config.js`:

- **Version Patterns**: Regex patterns to detect Java features
- **Deprecated APIs**: APIs deprecated in each version
- **Anti-patterns**: Common code smells
- **Security Patterns**: Security vulnerability patterns

### Guideline Schema

Located in `guidelines/java/java-guidelines-schema.json`:

Defines the structure for:
- Java version information
- Coding guidelines
- Deprecated patterns
- Security rules
- Performance patterns
- Modernization rules

## 📤 Output Files

After running the migration, you'll get:

### 1. `analysis-results.json`
Complete analysis with all detected issues:
```json
{
  "detected_version": "1.8",
  "recommended_version": "21",
  "rules": [...],
  "summary": {
    "total_issues": 45,
    "by_severity": {...},
    "by_category": {...}
  }
}
```

### 2. `recommendations.json`
AI-generated recommendations:
```json
{
  "updated_code": "...",
  "migration_steps": [...],
  "security_fixes": [...],
  "performance_optimizations": [...],
  "diff": "...",
  "summary": {...}
}
```

### 3. `UserService-modernized.java`
Complete modernized Java code ready to use

### 4. `migration.patch`
Unified diff format for applying changes

### 5. `migration-report.md`
Comprehensive markdown report with:
- Executive summary
- Issue breakdown
- Migration steps
- Security fixes
- Performance optimizations
- Next steps

## 🎓 Example Output

```
╔════════════════════════════════════════════════════════════╗
║   DocuPilot Agent - Complete Java Migration Example       ║
╚════════════════════════════════════════════════════════════╝

📂 Step 1: Loading legacy Java code...
✓ Loaded: examples/legacy-code/UserService.java
✓ Code size: 8543 characters

═══════════════════════════════════════════════════════════
📚 Step 2: Generating Java guidelines with DocuPilot Agent...
✓ Guidelines generated successfully
✓ Guidelines saved to: guidelines/java/java-guidelines.json

═══════════════════════════════════════════════════════════
🔍 Step 3: Analyzing code with Code Analyzer...
✓ Analysis completed
✓ Detected Java version: 1.8
✓ Recommended version: 21
✓ Total issues found: 45

📊 Issue Summary:
─────────────────────────────────────────────────────────
  Critical: 3
  Error:    12
  Warning:  25
  Info:     5
─────────────────────────────────────────────────────────

═══════════════════════════════════════════════════════════
🤖 Step 4: Generating AI recommendations with Watsonx...
✓ Recommendations generated successfully

═══════════════════════════════════════════════════════════
📝 Step 5: Migration Recommendations Summary
─────────────────────────────────────────────────────────
Total Changes:     45
Lines Modified:    120
Estimated Effort:  2-3 days
Risk Level:        medium
─────────────────────────────────────────────────────────

✅ Migration Analysis Complete!
```

## 🔒 Security

The system detects and fixes:
- **CWE-89**: SQL Injection
- **CWE-798**: Hardcoded Credentials
- **CWE-327**: Weak Cryptography
- **CWE-330**: Insecure Random
- **CWE-22**: Path Traversal

All based on OWASP Java Security guidelines.

## 🚦 Migration Risk Levels

- **Low**: Mostly style and minor improvements
- **Medium**: Some breaking changes, moderate testing needed
- **High**: Significant breaking changes, extensive testing required

## 📚 Guidelines Sources

DocuPilot Agent fetches from:
1. **Oracle Java SE Documentation**
2. **OpenJDK JEPs** (Java Enhancement Proposals)
3. **OWASP Java Security** guidelines
4. **Effective Java** principles

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Add tests
4. Submit a pull request

## 📄 License

ISC

## 🆘 Support

For issues and questions:
- Open an issue on GitHub
- Check the documentation
- Review example code

## 🎯 Roadmap

- [ ] Support for Spring Boot framework
- [ ] Support for Jakarta EE
- [ ] Maven/Gradle dependency analysis
- [ ] Multi-file project analysis
- [ ] CI/CD integration
- [ ] IDE plugins

---

**Made with ❤️ using IBM Watsonx AI**