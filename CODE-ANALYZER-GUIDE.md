# IBM Code Analyzer - Complete Guide

## Overview

The IBM Code Analyzer is a comprehensive tool that analyzes legacy JavaScript codebases and generates modernization recommendations based on IBM standards. It's integrated with the MCP (Model Context Protocol) server for seamless AI-powered code migration.

## Features

### 1. **Dependency Analysis**
- Detects outdated package versions
- Identifies deprecated packages
- Finds security vulnerabilities (CVEs)
- Compares against IBM-approved package versions
- Suggests modern alternatives

### 2. **Legacy Pattern Detection**
- Identifies legacy JavaScript patterns:
  - `var` declarations
  - Callback-based async code
  - Prototype-based OOP
  - Old-style string concatenation
  - Manual loops vs array methods
  - CommonJS modules
  - Deprecated libraries (request, async, Q, etc.)

### 3. **AI-Powered Modernization**
- Generates detailed modernization rules
- Creates AI prompts for automated migration
- Provides before/after code examples
- Estimates migration effort and time
- Prioritizes issues by severity

## Project Structure

```
migration/
├── example-migration-project/          # Example project
│   ├── legacy-codebase/               # Sample legacy code
│   │   ├── package.json               # Outdated dependencies
│   │   └── src/
│   │       ├── index.js               # Legacy patterns
│   │       └── utils.js               # More legacy code
│   │
│   └── ibm-standards/                 # IBM standards reference
│       ├── ibm-approved-packages.json # Approved package versions
│       └── ibm-coding-guidelines.md   # Coding best practices
│
├── tools/
│   └── code-analyzer/                 # Analyzer tool
│       ├── package.json
│       ├── index.js                   # MCP tool wrapper
│       └── src/
│           ├── dependency-analyzer.js # Dependency analysis
│           ├── pattern-detector.js    # Pattern detection
│           ├── rule-generator.js      # Rule generation
│           └── index.js               # CLI interface
│
├── mcp-server.js                      # MCP server (updated)
├── index.js                           # Tool registry (updated)
└── test-code-analyzer.js              # Test script
```

## Installation

### Prerequisites
- Node.js 18+ (for ES modules)
- npm or yarn

### Setup

1. **Install dependencies**:
```bash
# Install main project dependencies
npm install

# Install code analyzer dependencies
cd tools/code-analyzer
npm install
cd ../..
```

2. **Verify installation**:
```bash
node test-code-analyzer.js
```

## Usage

### Method 1: Direct CLI Usage

```bash
# Analyze a project
cd tools/code-analyzer
node src/index.js ../../example-migration-project/legacy-codebase

# With custom options
node src/index.js /path/to/project \
  --standards /path/to/standards \
  --output ./report.json
```

### Method 2: Via MCP Server

The analyzer is registered with the MCP server and can be called through the Model Context Protocol.

**Available MCP Tools:**

1. **`analyze_legacy_code`**
   - Analyzes a legacy codebase
   - Parameters:
     - `projectPath` (required): Path to project
     - `ibmStandardsPath` (optional): Path to standards
     - `includeAIPrompts` (optional): Include AI prompts (default: true)

2. **`get_modernization_rule`**
   - Gets detailed information about a specific rule
   - Parameters:
     - `ruleId` (required): Rule ID to retrieve
     - `projectPath` (required): Project path

**Example MCP Call:**
```json
{
  "method": "tools/call",
  "params": {
    "name": "analyze_legacy_code",
    "arguments": {
      "projectPath": "./example-migration-project/legacy-codebase",
      "includeAIPrompts": true
    }
  }
}
```

### Method 3: Programmatic Usage

```javascript
import { codeAnalyzerTool } from './tools/code-analyzer/index.js';

const result = await codeAnalyzerTool.execute({
  projectPath: './example-migration-project/legacy-codebase',
  includeAIPrompts: true
});

console.log(result.summary);
console.log(result.recommendations);
```

## Output Format

### Analysis Result Structure

```javascript
{
  success: true,
  metadata: {
    analyzedAt: "2024-11-25T03:20:00.000Z",
    project: "legacy-codebase",
    projectPath: "/path/to/project",
    analyzer: "IBM Code Analyzer v1.0.0"
  },
  summary: {
    totalIssues: 31,
    dependencies: {
      total: 12,
      deprecated: 8,
      outdated: 4,
      securityVulnerabilities: 3
    },
    patterns: {
      filesAnalyzed: 2,
      totalPatterns: 16,
      byCategory: { ... },
      bySeverity: { ... }
    }
  },
  dependencyIssues: [ ... ],
  patternIssues: [ ... ],
  modernizationRules: {
    dependencyRules: [ ... ],
    patternRules: [ ... ]
  },
  aiPrompts: [ ... ],
  recommendations: {
    immediate: [ ... ],
    highPriority: [ ... ],
    medium: [ ... ],
    low: [ ... ]
  }
}
```

### Modernization Rule Format

```javascript
{
  id: "no-var",
  category: "javascript-modernization",
  severity: "warning",
  legacy_pattern: "var",
  modern_replacement: "let or const",
  message: "Avoid using var. Use let or const instead.",
  examples: {
    before: "var x = 1;",
    after: "const x = 1; // or let x = 1; if reassignment is needed"
  },
  occurrences: 21,
  affectedFiles: ["src/utils.js"],
  priority: 2,
  estimatedEffort: "high"
}
```

### AI Prompt Format

```javascript
{
  id: "migrate-critical-dependencies",
  type: "dependency-migration",
  priority: "critical",
  prompt: "# Dependency Migration Task\n\n...",
  affectedPackages: ["request", "async", "q"]
}
```

## Example Analysis Results

Running the analyzer on the example legacy codebase detects:

### Dependency Issues (12 total)
- **8 Deprecated packages**: request, async, q, bluebird, jquery, underscore, gulp, grunt
- **4 Outdated packages**: express, lodash, moment, body-parser
- **3 Security vulnerabilities**: CVEs in express, lodash, and moment

### Pattern Issues (16 total)
- **21 occurrences** of `var` declarations
- **Multiple callback patterns** needing async/await conversion
- **Prototype-based code** needing ES6 class conversion
- **String concatenation** needing template literals
- **Manual loops** needing array methods
- **CommonJS modules** that could use ES6 imports

### AI Prompts Generated (9 total)
1. Critical dependency migration
2. JavaScript modernization patterns
3. Async/await conversion
4. Module system migration
5. Function syntax updates
6. OOP modernization
7. Array operations
8. Deprecated API replacements
9. Comprehensive migration guide

## IBM Standards Reference

### Approved Packages
The `ibm-approved-packages.json` file contains:
- Minimum and recommended versions
- Approval status
- Security alerts
- Modern alternatives for deprecated packages

### Coding Guidelines
The `ibm-coding-guidelines.md` document includes:
- Variable declaration best practices
- Async programming patterns
- Function syntax recommendations
- Module system guidelines
- Security best practices
- Migration checklists

## Testing

### Run Tests
```bash
# Test the analyzer directly
node test-code-analyzer.js

# Test via MCP server
node test-mcp-server.js
```

### Test Output
The test script will:
1. Analyze the example legacy codebase
2. Display summary statistics
3. Show sample issues and recommendations
4. Retrieve detailed rule information
5. Save full results to `test-analyzer-output.json`

## Integration with MCP Server

The analyzer is fully integrated with the MCP server:

1. **Server Configuration**: Updated `mcp-server.js` to expose analyzer tools
2. **Tool Registry**: Updated `index.js` to register analyzer tools
3. **Tool Definitions**: Created MCP-compatible tool wrappers in `tools/code-analyzer/index.js`

### Starting the MCP Server

```bash
# Start the server
node mcp-server.js

# The server will expose:
# - watsonx_llm_call
# - analyze_legacy_code
# - get_modernization_rule
```

## Customization

### Adding Custom Patterns

Edit `tools/code-analyzer/src/pattern-detector.js`:

```javascript
{
  id: 'custom-pattern',
  category: 'custom-category',
  severity: 'warning',
  regex: /your-pattern-regex/g,
  legacy_pattern: 'old pattern',
  modern_replacement: 'new pattern',
  message: 'Your custom message',
  examples: {
    before: 'old code',
    after: 'new code'
  }
}
```

### Adding Custom Package Standards

Edit `example-migration-project/ibm-standards/ibm-approved-packages.json`:

```json
{
  "approvedPackages": {
    "your-package": {
      "minVersion": "1.0.0",
      "recommendedVersion": "1.2.0",
      "status": "approved",
      "notes": "Your notes"
    }
  }
}
```

## Troubleshooting

### Common Issues

1. **Module not found errors**
   - Ensure all dependencies are installed: `npm install`
   - Check that you're using Node.js 18+

2. **Path resolution issues**
   - Use absolute paths or paths relative to the working directory
   - The analyzer resolves paths using `path.resolve()`

3. **Analysis timeout**
   - Increase the MCP timeout: `export MCP_TIMEOUT=600000`
   - For large codebases, consider analyzing in chunks

4. **Missing IBM standards**
   - Ensure `example-migration-project/ibm-standards/` exists
   - Or provide custom standards path via `ibmStandardsPath` parameter

## Best Practices

1. **Start with critical issues**: Address security vulnerabilities first
2. **Test incrementally**: Migrate and test one pattern at a time
3. **Use AI prompts**: Leverage generated prompts for automated migration
4. **Review recommendations**: Not all suggestions may apply to your context
5. **Update standards**: Keep IBM standards files current with latest versions

## Support

For issues or questions:
- Check the test output: `test-analyzer-output.json`
- Review the IBM coding guidelines
- Examine the generated AI prompts for migration guidance

## License

ISC

---

**Made with Bob** 🤖