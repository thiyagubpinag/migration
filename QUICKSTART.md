# DocuPilot Agent - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites

- Node.js 18+ installed
- IBM Watsonx account with API credentials
- Basic understanding of Java

### Step 1: Installation

```bash
# Clone the repository
git clone <repository-url>
cd migration

# Install dependencies
npm install
```

### Step 2: Configure Watsonx

Create a `.env` file in the project root:

```env
WATSONX_URL=https://us-south.ml.cloud.ibm.com
WATSONX_VERSION=2024-05-31
WATSONX_PROJECT_ID=your-project-id-here
WATSONX_API_KEY=your-api-key-here
WATSONX_MODEL_ID=mistralai/mistral-medium-2505
```

### Step 3: Run the Example

```bash
npm run example
```

This will:
1. ✅ Load the sample legacy Java code
2. ✅ Generate Java guidelines dynamically
3. ✅ Analyze the code for issues
4. ✅ Generate AI-powered recommendations
5. ✅ Save all results to `examples/output/`

### Step 4: Review Results

Check the `examples/output/` directory for:

- **`analysis-results.json`** - Detailed code analysis
- **`recommendations.json`** - AI recommendations
- **`UserService-modernized.java`** - Modernized code
- **`migration.patch`** - Diff file
- **`migration-report.md`** - Comprehensive report

## 📊 What You'll See

```
╔════════════════════════════════════════════════════════════╗
║   DocuPilot Agent - Complete Java Migration Example       ║
╚════════════════════════════════════════════════════════════╝

📂 Step 1: Loading legacy Java code...
✓ Loaded: examples/legacy-code/UserService.java

📚 Step 2: Generating Java guidelines with DocuPilot Agent...
✓ Guidelines generated successfully

🔍 Step 3: Analyzing code with Code Analyzer...
✓ Total issues found: 45

🤖 Step 4: Generating AI recommendations with Watsonx...
✓ Recommendations generated successfully

💾 Step 5: Saving results...
✓ All results saved

✅ Migration Analysis Complete!
```

## 🎯 Use Your Own Code

### Option 1: Replace the Sample File

Replace `examples/legacy-code/UserService.java` with your Java file and run:

```bash
npm run example
```

### Option 2: Use Programmatically

```javascript
import { DocuPilotAgent } from './tools/docupilot-agent/index.js';
import { CodeAnalyzer } from './tools/code-analyzer/index.js';
import { CodeRecommendation } from './tools/code-recommendation/index.js';
import fs from 'fs/promises';

// Load your Java code
const javaCode = await fs.readFile('path/to/your/file.java', 'utf-8');

// Step 1: Generate guidelines
const docuPilot = new DocuPilotAgent();
const guidelines = await docuPilot.execute({ javaCode, targetVersion: '21' });

// Step 2: Analyze code
const analyzer = new CodeAnalyzer();
const analysis = await analyzer.execute({ 
  javaCode, 
  guidelines: guidelines.guidelines 
});

// Step 3: Get recommendations
const recommender = new CodeRecommendation();
const recommendations = await recommender.execute({
  javaCode,
  analysisRules: analysis.rules,
  guidelines: guidelines.guidelines
});

console.log(recommendations);
```

### Option 3: Use with MCP Server (Roo Chat)

```bash
# Start MCP server
npm run mcp

# Then in Roo Chat:
"Analyze my Java code and provide migration recommendations"
```

## 🔧 Available Commands

```bash
# Run complete migration example
npm run example

# Start MCP server
npm run mcp

# Start MCP server with auto-reload
npm run mcp:dev

# Test DocuPilot Agent
npm run test:docupilot

# Test Code Analyzer
npm run test:analyzer

# Test Code Recommendation
npm run test:recommendation
```

## 📝 Common Issues

### Issue: "WATSONX_PROJECT_ID must be set"

**Solution:** Make sure your `.env` file exists and contains valid credentials.

### Issue: "Guidelines not found"

**Solution:** Run DocuPilot Agent first to generate guidelines:
```bash
npm run test:docupilot
```

### Issue: "Module not found"

**Solution:** Install dependencies:
```bash
npm install
```

## 🎓 Next Steps

1. **Read the full documentation**: `DOCUPILOT_AGENT_README.md`
2. **Explore the code**: Check out the `tools/` directory
3. **Customize**: Modify `config/java-detection-config.js` for your needs
4. **Integrate**: Use the MCP server with your IDE

## 💡 Tips

- Start with small files to understand the output
- Review the migration report before applying changes
- Test thoroughly after migration
- Use version control before applying patches

## 🆘 Need Help?

- Check `DOCUPILOT_AGENT_README.md` for detailed documentation
- Review example code in `examples/`
- Open an issue on GitHub

## 🎉 Success!

You've successfully set up DocuPilot Agent! Now you can:

✅ Analyze Java code automatically  
✅ Get AI-powered migration recommendations  
✅ Modernize legacy code to Java 21  
✅ Fix security vulnerabilities  
✅ Improve code performance  

Happy coding! 🚀