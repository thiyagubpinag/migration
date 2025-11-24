# Roo Chat Integration Guide

## 🎯 Overview

This guide shows how to use the IBM Code Migration tool directly from Roo Chat using the MCP (Model Context Protocol) integration. You can trigger migrations, get AI recommendations, and apply changes interactively through chat.

## 🚀 Quick Setup

### 1. Ensure MCP Server is Configured

The MCP server should already be configured in `.roo/mcp.json`. Verify it exists:

```json
{
  "mcpServers": {
    "migration-tools": {
      "command": "node",
      "args": ["mcp-server.js"],
      "cwd": "/Users/thiyaguseran/Desktop/migration"
    }
  }
}
```

### 2. Start Roo Chat

The MCP server will automatically start when you use Roo Chat with the migration mode.

### 3. Use Migration Mode

Switch to migration mode in Roo Chat to access the migration tool.

## 💬 Using Migration Tool in Roo Chat

### Basic Workflow

1. **Scan Legacy Code** - Analyze and identify issues
2. **Get Recommendations** - AI-powered migration suggestions
3. **Review Changes** - Preview what will change
4. **Approve & Apply** - Apply changes after review

## 📝 Chat Commands & Examples

### Example 1: Scan Legacy Code

**You say:**
```
Scan the legacy user service file and show me what needs to be migrated
```

**Roo will use the migration tool:**
```javascript
// Behind the scenes, Roo calls:
{
  "action": "scan",
  "legacyFile": "legacy-code/user-service.js",
  "modernFile": "ibm-modern-code/user-service.js"
}
```

**You'll get:**
```
✅ Scan completed successfully

Summary:
  - File: legacy-code/user-service.js
  - Total Issues: 15
  - Critical Issues: 2
  - Error Issues: 8
  - Priority Score: 75/100
  - Migration Urgency: high
  - Estimated Effort: medium (1-2 days)

Top Issues:
  CRITICAL (2):
    - Line 10: No hardcoded credentials
    - Line 35: Use prepared statements
  
  ERROR (8):
    - Line 3: Replace 'var' with 'const' or 'let'
    - Line 8: Convert callbacks to Promises
    - Line 15: Add proper error handling
```

### Example 2: Get AI Recommendations

**You say:**
```
Generate AI-powered recommendations for migrating the user service
```

**Roo will use:**
```javascript
{
  "action": "recommend",
  "legacyFile": "legacy-code/user-service.js",
  "modernFile": "ibm-modern-code/user-service.js"
}
```

**You'll get:**
```
🤖 AI Recommendations Generated

Migration Plan:
  - Total Steps: 12
  - Estimated Effort: 1-2 days
  - Complexity: medium
  - Breaking Changes: 3

Priority Steps:
  1. [CRITICAL] Remove hardcoded credentials
     - Replace with environment variables
     - Use process.env.DB_PASSWORD
     - Effort: 30 minutes
  
  2. [HIGH] Convert to ES6 modules
     - Replace require() with import
     - Replace module.exports with export
     - Effort: 1 hour
  
  3. [HIGH] Modernize async patterns
     - Convert callbacks to async/await
     - Add proper error handling
     - Effort: 2-3 hours

Code Examples:
  Before:
    var users = [];
    function getUserById(id, callback) { ... }
  
  After:
    const users = new Map();
    async getUserById(id) { ... }

Risks:
  ⚠️  Breaking change: Function signatures will change
  ⚠️  Requires Node.js 14+ for ES6 modules
  ⚠️  Tests will need updating

Testing Strategy:
  ✓ Add unit tests for new async functions
  ✓ Test error handling paths
  ✓ Verify backward compatibility
```

### Example 3: Preview Changes (Dry Run)

**You say:**
```
Show me what changes would be made to the user service without actually applying them
```

**Roo will use:**
```javascript
{
  "action": "migrate",
  "legacyFile": "legacy-code/user-service.js",
  "modernFile": "ibm-modern-code/user-service.js",
  "dryRun": true
}
```

**You'll get:**
```
🔍 Dry Run Preview

Changes to Apply: 8

Detailed Changes:
  1. [critical] Address Critical Security Issues
     Category: security
     Lines Changed: 2
  
  2. [core] Convert to ES6 modules
     Category: modules
     Lines Changed: 3

Code Diff Preview:
  - Line 1: var users = [];
  + Line 1: import { EventEmitter } from 'events';
  
  - Line 3: function getUserById(id, callback) {
  + Line 3: async getUserById(id) {
  
  - Line 10: password: 'password123'
  + Line 10: password: process.env.DB_PASSWORD

Total lines changed: 45

⚠️  This is a DRY RUN - no files were modified
```

### Example 4: Apply Migration with Approval

**You say:**
```
I've reviewed the changes. Please apply the migration to the user service file.
```

**Roo will ask for confirmation:**
```
⚠️  This will modify the file: legacy-code/user-service.js

Changes to apply:
  - 8 transformations
  - 45 lines changed
  - Backup will be created

Do you want to proceed? (yes/no)
```

**You say:** `yes`

**Roo will use:**
```javascript
{
  "action": "migrate",
  "legacyFile": "legacy-code/user-service.js",
  "modernFile": "ibm-modern-code/user-service.js",
  "dryRun": false,
  "autoApply": true
}
```

**You'll get:**
```
✅ Migration Applied Successfully

Results:
  - File: legacy-code/user-service.js
  - Changes Applied: 8
  - Lines Modified: 45
  - Backup Created: legacy-code/user-service.js.backup-2024-01-24T10-30-00

Migration Report:
  ✓ Security issues fixed
  ✓ ES6 modules implemented
  ✓ Async patterns modernized
  ✓ Error handling added

Next Steps:
  1. Review the migrated code
  2. Run tests: npm test
  3. Commit changes: git add . && git commit -m "Migrate user service to IBM standards"
```

### Example 5: Full Workflow

**You say:**
```
Run the complete migration workflow for the database connector file
```

**Roo will use:**
```javascript
{
  "action": "full",
  "legacyFile": "legacy-code/database-connector.js",
  "modernFile": "ibm-modern-code/database-connector.js",
  "dryRun": true,
  "autoApply": false
}
```

**You'll get the complete workflow:**
```
🔄 Full Migration Workflow

Step 1: SCANNING ✅
  - 18 issues found
  - Priority score: 85/100
  - Urgency: immediate

Step 2: AI RECOMMENDATIONS ✅
  - 15 migration steps generated
  - Estimated effort: 2-3 days
  - 5 breaking changes identified

Step 3: PREVIEW ✅
  - 12 transformations ready
  - 67 lines to change
  - Dry run completed

Step 4: APPROVAL ⏸️
  - Awaiting your approval
  - Review the plan above
  - Say "approve" to proceed or "reject" to cancel

Would you like to approve these changes?
```

## 🎨 Natural Language Examples

You can use natural language - Roo will understand and call the right tool:

### Scanning
- "Check what's wrong with the user service"
- "Analyze the legacy database code"
- "What issues are in the API routes file?"
- "Scan all legacy files"

### Recommendations
- "How should I modernize the user service?"
- "Give me migration suggestions for the database connector"
- "What's the best way to update this legacy code?"
- "Show me the migration plan"

### Previewing
- "What would change if I migrate this?"
- "Show me a preview of the migration"
- "Let me see the diff before applying"
- "What will be different?"

### Applying
- "Apply the migration"
- "Go ahead and make the changes"
- "Migrate the file now"
- "Update the code to modern standards"

## 🔧 Advanced Usage

### Specify Custom Files

**You say:**
```
Scan my custom file at src/services/legacy-auth.js and compare it with the modern version at src/services/modern-auth.js
```

**Roo will use:**
```javascript
{
  "action": "scan",
  "legacyFile": "src/services/legacy-auth.js",
  "modernFile": "src/services/modern-auth.js"
}
```

### Skip Approval (Use with Caution)

**You say:**
```
Migrate the user service and apply changes automatically without asking for approval
```

**Roo will use:**
```javascript
{
  "action": "full",
  "legacyFile": "legacy-code/user-service.js",
  "modernFile": "ibm-modern-code/user-service.js",
  "dryRun": false,
  "autoApply": true
}
```

### Multiple Files

**You say:**
```
Scan all three legacy files and give me a summary
```

Roo will call the tool multiple times and aggregate results.

## 📊 Understanding the Output

### Severity Levels
- **CRITICAL** 🔴 - Security issues, must fix immediately
- **ERROR** 🟠 - Functionality issues, fix soon
- **WARNING** 🟡 - Quality issues, fix when possible
- **INFO** 🔵 - Improvements, consider implementing

### Priority Score
- **0-25**: Low priority, minor improvements
- **26-50**: Medium priority, quality improvements
- **51-75**: High priority, significant issues
- **76-100**: Critical priority, immediate action needed

### Migration Urgency
- **immediate**: Critical issues, migrate now
- **high**: Important issues, migrate soon
- **medium**: Moderate issues, plan migration
- **low**: Minor issues, migrate when convenient

## 🛡️ Safety Features

### Automatic Backups
Every migration creates a backup:
```
original-file.js → original-file.js.backup-2024-01-24T10-30-00
```

### Dry Run by Default
All migrations preview changes first unless you explicitly approve.

### Approval Workflow
Roo will always ask for confirmation before modifying files.

### Rollback
If something goes wrong:
```
You: "Restore the backup for user-service.js"
```

## 🎯 Best Practices

### 1. Always Scan First
```
You: "Scan the legacy code first"
```

### 2. Review Recommendations
```
You: "Show me the AI recommendations before making changes"
```

### 3. Preview Changes
```
You: "Let me see what will change in dry-run mode"
```

### 4. Test After Migration
```
You: "The migration is done. Now run the tests to verify everything works"
```

### 5. Commit Changes
```
You: "Create a git commit with the migration changes"
```

## 🔄 Complete Example Conversation

```
You: Hi, I need to modernize my legacy user service code.

Roo: I can help you with that! Let me scan the legacy code first to see what needs to be updated.

[Roo scans the code]

Roo: I found 15 issues in your user service:
- 2 critical security issues
- 8 errors that need fixing
- 5 warnings for code quality

The priority score is 75/100, indicating high urgency. Would you like me to generate AI-powered recommendations?

You: Yes, please show me the recommendations.

Roo: [Generates AI recommendations]

Here's the migration plan:
- 12 steps to modernize the code
- Estimated effort: 1-2 days
- 3 breaking changes to be aware of

The main changes include:
1. Remove hardcoded credentials
2. Convert to ES6 modules
3. Modernize async patterns
4. Add error handling
5. Implement logging

Would you like to see a preview of the changes?

You: Yes, show me the preview.

Roo: [Runs dry-run migration]

Here's what will change:
- 8 transformations
- 45 lines modified
- Key changes: var→const, callbacks→async/await, added security

This is a preview only - no files were modified. Would you like me to apply these changes?

You: Yes, please apply the migration.

Roo: ⚠️  This will modify legacy-code/user-service.js. A backup will be created. Proceed?

You: Yes, go ahead.

Roo: ✅ Migration completed successfully!
- Backup created
- 8 changes applied
- 45 lines modified

Next steps:
1. Review the migrated code
2. Run tests
3. Commit changes

Would you like me to run the tests now?

You: Yes, run the tests.

Roo: [Runs tests and shows results]
```

## 📚 Additional Resources

- **MIGRATION_GUIDE.md** - Detailed migration guide
- **QUICK_REFERENCE.md** - Quick command reference
- **ARCHITECTURE.md** - System architecture
- **examples/migration-example.js** - Working code example

## 🐛 Troubleshooting

### Tool Not Found
If Roo says the migration tool isn't available:
1. Check `.roo/mcp.json` configuration
2. Restart Roo Chat
3. Verify MCP server is running: `npm run mcp`

### Permission Errors
If you get permission errors:
1. Check file permissions
2. Ensure you have write access
3. Try running with appropriate permissions

### AI Not Responding
If AI recommendations fail:
1. Check `.env` has valid Watsonx credentials
2. Verify network connectivity
3. Check Watsonx API status

## 💡 Tips

1. **Be Specific**: "Scan user-service.js" is better than "scan the code"
2. **Review First**: Always review recommendations before applying
3. **Use Dry Run**: Preview changes before committing
4. **Test After**: Always run tests after migration
5. **Commit Often**: Commit after each successful migration

---

**Ready to migrate?** Just say: "Scan my legacy code and show me what needs to be updated!" 🚀