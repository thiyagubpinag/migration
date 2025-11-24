# Migration Tools Guide

## Overview

The migration workflow has been split into three separate, specialized tools that work sequentially to provide a comprehensive code migration solution.

## Tools

### 1. Code Analyzer Tool (`code-analyzer`)

**Purpose**: Scans the repository and identifies all legacy code, outdated patterns, and areas requiring modernization.

**Location**: `tools/code-analyzer-tool/`

**Capabilities**:
- Scan legacy code against IBM modernization rules
- Identify security vulnerabilities and outdated patterns
- Compare with IBM-approved modern code
- Generate priority scores and urgency levels
- Provide detailed issue reports with line numbers
- Estimate migration effort

**Parameters**:
```javascript
{
  legacyFile: "path/to/legacy-file.js",    // Required
  modernFile: "path/to/modern-file.js",    // Optional
  detailed: true                            // Optional, default: true
}
```

**Output**:
- `analysis`: Complete code analysis with issues and recommendations
- `summary`: Summary report with priority scores and effort estimates
- `report`: Formatted analysis report

**Example Usage**:
```javascript
import { CodeAnalyzerTool } from './tools/code-analyzer-tool/index.js';

const analyzer = new CodeAnalyzerTool();
const result = await analyzer.execute({
  legacyFile: 'legacy-code/user-service.js',
  modernFile: 'ibm-modern-code/user-service.js',
  detailed: true
});

console.log(result.report);
```

---

### 2. Code Recommendation Tool (`code-recommendation`)

**Purpose**: Uses AI prompts, the modern codebase, and IBM modernization rules to generate detailed recommendations.

**Location**: `tools/code-recommendation-tool/`

**Capabilities**:
- Generate AI-powered migration recommendations using IBM Watsonx
- Compare legacy code with IBM-approved modern patterns
- Create detailed migration plans with phases
- Identify risks and breaking changes
- Provide testing strategies and success criteria
- Generate rollback plans
- Present recommendations for user approval

**Parameters**:
```javascript
{
  legacyFile: "path/to/legacy-file.js",      // Required
  modernFile: "path/to/modern-file.js",      // Required
  analysis: analysisObject,                   // Optional (from code-analyzer)
  requireApproval: true                       // Optional, default: true
}
```

**Output**:
- `aiRecommendations`: AI-generated migration recommendations
- `migrationPlan`: Detailed migration plan with phases and steps
- `report`: Formatted recommendation report
- `approvalMessage`: Message requesting user approval

**Migration Plan Structure**:
```javascript
{
  summary: {
    totalSteps: 12,
    estimatedEffort: "2-3 days",
    complexity: "medium",
    breakingChanges: 2
  },
  phases: [
    {
      name: "preparation",
      steps: [...],
      stepCount: 1
    },
    {
      name: "critical",
      steps: [...],
      stepCount: 3
    },
    // ... more phases
  ],
  risks: ["Breaking change 1", "Breaking change 2"],
  testing: ["Test strategy 1", "Test strategy 2"],
  rollbackPlan: ["Rollback step 1", "Rollback step 2"],
  successCriteria: ["Criteria 1", "Criteria 2"]
}
```

**Example Usage**:
```javascript
import { CodeRecommendationTool } from './tools/code-recommendation-tool/index.js';

const recommender = new CodeRecommendationTool();
const result = await recommender.execute({
  legacyFile: 'legacy-code/user-service.js',
  modernFile: 'ibm-modern-code/user-service.js',
  analysis: previousAnalysisResult.analysis,  // Optional
  requireApproval: true
});

console.log(result.report);
console.log(result.approvalMessage);

// Wait for user approval before proceeding
```

---

### 3. Code Migrator Tool (`code-migrator`)

**Purpose**: Uses AI prompts to apply the approved changes and migrate the legacy code to the updated, modern version.

**Location**: `tools/code-migrator-tool/`

**Capabilities**:
- Apply approved migration plans to legacy code
- Use AI to enhance transformations with specific code examples
- Create automatic backups before migration
- Support dry-run mode for previewing changes
- Generate detailed diff reports
- Validate migrated code
- Apply pattern-based transformations
- Handle syntax, async, module, and security migrations

**Parameters**:
```javascript
{
  legacyFile: "path/to/legacy-file.js",      // Required
  migrationPlan: migrationPlanObject,         // Required (from code-recommendation)
  dryRun: false,                              // Optional, default: false
  useAI: true,                                // Optional, default: true
  modernFile: "path/to/modern-file.js"       // Required if useAI is true
}
```

**Output**:
- `migrationResult`: Complete migration results with changes applied
- `validation`: Validation results of migrated code
- `report`: Formatted migration report with diff
- `backupPath`: Path to backup file (if not dry run)

**Example Usage**:
```javascript
import { CodeMigratorTool } from './tools/code-migrator-tool/index.js';

const migrator = new CodeMigratorTool();

// First, do a dry run to preview changes
const dryRunResult = await migrator.execute({
  legacyFile: 'legacy-code/user-service.js',
  migrationPlan: approvedMigrationPlan,
  dryRun: true,
  useAI: true,
  modernFile: 'ibm-modern-code/user-service.js'
});

console.log(dryRunResult.report);

// If satisfied, apply the changes
const result = await migrator.execute({
  legacyFile: 'legacy-code/user-service.js',
  migrationPlan: approvedMigrationPlan,
  dryRun: false,
  useAI: true,
  modernFile: 'ibm-modern-code/user-service.js'
});

console.log(result.report);
```

---

## Complete Workflow

### Sequential Execution

The tools are designed to run sequentially in the following order:

1. **Code Analyzer** → Identifies issues
2. **Code Recommendation** → Generates migration plan (requires approval)
3. **Code Migrator** → Applies changes
4. **Lint** → Validates code quality
5. **Run Changes** → Applies additional fixes
6. **Validate** → Tests functionality

### Example: Complete Migration Workflow

```javascript
import { CodeAnalyzerTool } from './tools/code-analyzer-tool/index.js';
import { CodeRecommendationTool } from './tools/code-recommendation-tool/index.js';
import { CodeMigratorTool } from './tools/code-migrator-tool/index.js';

async function migrateCode(legacyFile, modernFile) {
  // Step 1: Analyze
  console.log('Step 1: Analyzing code...');
  const analyzer = new CodeAnalyzerTool();
  const analysisResult = await analyzer.execute({
    legacyFile,
    modernFile,
    detailed: true
  });
  
  if (!analysisResult.success) {
    throw new Error('Analysis failed: ' + analysisResult.error);
  }
  
  console.log(analysisResult.report);
  console.log(`Found ${analysisResult.analysis.totalIssues} issues`);
  
  // Step 2: Generate Recommendations
  console.log('\nStep 2: Generating recommendations...');
  const recommender = new CodeRecommendationTool();
  const recommendResult = await recommender.execute({
    legacyFile,
    modernFile,
    analysis: analysisResult.analysis,
    requireApproval: true
  });
  
  if (!recommendResult.success) {
    throw new Error('Recommendation failed: ' + recommendResult.error);
  }
  
  console.log(recommendResult.report);
  console.log(recommendResult.approvalMessage);
  
  // Wait for user approval
  const approved = await getUserApproval();
  if (!approved) {
    console.log('Migration cancelled by user');
    return;
  }
  
  // Step 3: Apply Migration (Dry Run First)
  console.log('\nStep 3a: Dry run migration...');
  const migrator = new CodeMigratorTool();
  const dryRunResult = await migrator.execute({
    legacyFile,
    migrationPlan: recommendResult.migrationPlan,
    dryRun: true,
    useAI: true,
    modernFile
  });
  
  console.log(dryRunResult.report);
  
  // Confirm before applying
  const confirmApply = await getUserConfirmation();
  if (!confirmApply) {
    console.log('Migration cancelled by user');
    return;
  }
  
  // Step 3b: Apply Migration
  console.log('\nStep 3b: Applying migration...');
  const migrateResult = await migrator.execute({
    legacyFile,
    migrationPlan: recommendResult.migrationPlan,
    dryRun: false,
    useAI: true,
    modernFile
  });
  
  if (!migrateResult.success) {
    throw new Error('Migration failed: ' + migrateResult.error);
  }
  
  console.log(migrateResult.report);
  console.log(`\nMigration complete! Backup created at: ${migrateResult.backupPath}`);
  
  // Continue with lint, run-changes, and validate...
}

// Helper functions
async function getUserApproval() {
  // Implement user approval logic
  return true;
}

async function getUserConfirmation() {
  // Implement user confirmation logic
  return true;
}

// Run the migration
migrateCode(
  'legacy-code/user-service.js',
  'ibm-modern-code/user-service.js'
).catch(console.error);
```

---

## Using with Roo Cline (Migration Workflow Mode)

The `.roomodes` file has been updated with a comprehensive migration workflow mode that orchestrates all tools sequentially.

### Activation

Use the `migration-workflow` mode in Roo Cline to execute the complete workflow automatically.

### Workflow Steps

The mode will:
1. Run code-analyzer on your legacy file
2. Generate recommendations using code-recommendation
3. Present recommendations and wait for your approval
4. Apply migration using code-migrator (with dry-run first)
5. Run lint to check code quality
6. Apply fixes with run-changes
7. Validate the final result

### Example Prompt

```
Using migration-workflow mode, migrate legacy-code/user-service.js to modern standards using ibm-modern-code/user-service.js as reference.
```

---

## Configuration Files

Each tool has its own configuration file in `.roomode/`:

- `.roomode/code-analyzer.json` - Code Analyzer configuration
- `.roomode/code-recommendation.json` - Code Recommendation configuration
- `.roomode/code-migrator.json` - Code Migrator configuration

---

## MCP Server Integration

All three tools are registered in the MCP server (`mcp-server.js`) and can be accessed through the Model Context Protocol.

### Available MCP Tools

- `code-analyzer` - Analyze legacy code
- `code-recommendation` - Generate migration recommendations
- `code-migrator` - Apply migration changes
- `migration` - [LEGACY] Original combined tool (kept for backward compatibility)
- `lint` - Code quality checks
- `run-changes` - Apply code changes
- `validate` - Validate functionality
- `watsonx_llm` - Direct LLM interaction

---

## Best Practices

1. **Always start with code-analyzer** to understand the scope of changes
2. **Review recommendations carefully** before approving migration
3. **Use dry-run mode** in code-migrator to preview changes
4. **Create backups** before applying changes (automatic with code-migrator)
5. **Run lint and validate** after migration to ensure quality
6. **Test thoroughly** after migration is complete

---

## Troubleshooting

### Tool Not Found Error
- Ensure all tools are properly imported in `index.js`
- Check that tool folders exist in `tools/` directory

### AI Timeout
- AI calls have a 2-minute timeout
- For large files, consider breaking them into smaller chunks
- Fallback recommendations are provided if AI times out

### Migration Fails
- Check the backup file created before migration
- Review the error message in the migration report
- Use dry-run mode to identify issues before applying

---

## Legacy Tool

The original `migration` tool is still available for backward compatibility but is deprecated. Use the new three-tool workflow for better control and transparency.

---

## Support

For issues or questions:
1. Check the tool's metadata using `getMetadata()` method
2. Review the detailed reports generated by each tool
3. Consult the IBM modernization rules in `config/ibm-modernization-rules.json`

---

**Made with Bob** 🤖