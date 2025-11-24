# IBM Code Migration - Quick Reference

## 🚀 Quick Commands

```bash
# Run complete example
npm run example:migration

# Scan legacy code
npm run migrate:scan

# Generate recommendations
npm run migrate:recommend

# Run all tests
npm test
```

## 📁 Key Files

| File | Purpose |
|------|---------|
| `legacy-code/` | Example legacy code with anti-patterns |
| `ibm-modern-code/` | IBM-approved modern code (source of truth) |
| `config/ibm-modernization-rules.json` | IBM modernization rules |
| `tools/migration/index.js` | Main migration tool |
| `examples/migration-example.js` | Working example |

## 🔧 Programmatic Usage

```javascript
import { MigrationTool } from './tools/migration/index.js';

const tool = new MigrationTool();

// Scan only
await tool.execute({
  action: 'scan',
  legacyFile: 'legacy-code/user-service.js',
  modernFile: 'ibm-modern-code/user-service.js'
});

// Generate recommendations
await tool.execute({
  action: 'recommend',
  legacyFile: 'legacy-code/user-service.js',
  modernFile: 'ibm-modern-code/user-service.js'
});

// Migrate (dry-run)
await tool.execute({
  action: 'migrate',
  legacyFile: 'legacy-code/user-service.js',
  modernFile: 'ibm-modern-code/user-service.js',
  dryRun: true
});

// Full workflow
await tool.execute({
  action: 'full',
  legacyFile: 'legacy-code/user-service.js',
  modernFile: 'ibm-modern-code/user-service.js',
  dryRun: true,
  autoApply: false
});
```

## 🎯 Migration Actions

| Action | Description | Output |
|--------|-------------|--------|
| `scan` | Analyze code against IBM rules | Issues, priority score, effort estimate |
| `recommend` | Generate AI recommendations | Migration plan, steps, risks |
| `migrate` | Apply transformations | Changed code, diff, report |
| `full` | Complete workflow | All of the above + approval |

## 📊 Output Structure

### Scan Result
```javascript
{
  success: true,
  analysis: {
    filePath: "...",
    totalIssues: 15,
    issuesBySeverity: {
      critical: [...],
      error: [...],
      warning: [...],
      info: [...]
    },
    recommendations: [...]
  },
  summary: {
    priorityScore: 75,
    migrationUrgency: "high",
    estimatedEffort: "medium (1-2 days)"
  }
}
```

### Recommendation Result
```javascript
{
  success: true,
  aiRecommendations: {
    recommendations: {
      migrationSteps: [...],
      breakingChanges: [...],
      testingStrategy: [...],
      overallComplexity: "medium"
    }
  },
  migrationPlan: {
    summary: {...},
    phases: [...],
    risks: [...],
    testing: [...],
    successCriteria: [...]
  }
}
```

### Migration Result
```javascript
{
  success: true,
  dryRun: true,
  migrationResult: {
    changesApplied: 8,
    changes: [...],
    diff: [...],
    originalCode: "...",
    migratedCode: "..."
  },
  report: "..."
}
```

## 🔐 Environment Variables

```env
WATSONX_URL=https://us-south.ml.cloud.ibm.com
WATSONX_VERSION=2024-05-31
WATSONX_PROJECT_ID=your-project-id
WATSONX_API_KEY=your-api-key
WATSONX_MODEL_ID=mistralai/mistral-medium-2505
```

## 📋 IBM Rule Categories

1. **Syntax** - Modern JavaScript (const/let, arrows, templates)
2. **Async** - Promises, async/await, error handling
3. **Modules** - ES6 imports/exports
4. **Security** - Credentials, SQL injection, validation
5. **Architecture** - Classes, DI, events
6. **Database** - Pooling, transactions, shutdown
7. **API** - Rate limiting, auth, responses
8. **Logging** - Structured logging, levels
9. **Testing** - Unit and integration tests

## 🎯 Severity Levels

| Level | Priority | Action |
|-------|----------|--------|
| `critical` | Immediate | Fix now (security issues) |
| `error` | High | Fix soon (functionality issues) |
| `warning` | Medium | Fix when possible (quality issues) |
| `info` | Low | Consider (improvements) |

## 🛡️ Safety Features

- ✅ Automatic backups (`.backup-timestamp` files)
- ✅ Dry-run mode (default)
- ✅ Manual approval workflow
- ✅ Code validation
- ✅ Rollback capability

## 📖 Documentation

| File | Content |
|------|---------|
| `MIGRATION_GUIDE.md` | Complete usage guide (449 lines) |
| `PROJECT_OVERVIEW.md` | Architecture & features (476 lines) |
| `IMPLEMENTATION_SUMMARY.md` | Completion status (434 lines) |
| `QUICK_REFERENCE.md` | This file |

## 🐛 Troubleshooting

### AI not generating recommendations
- Check `.env` credentials
- Verify network connectivity
- Check Watsonx API status

### Migration not applying
- Ensure `dryRun: false`
- Check file permissions
- Verify file paths

### Syntax errors after migration
- Review diff carefully
- Run linter
- Restore from backup

## 💡 Best Practices

1. ✅ Always scan first
2. ✅ Review AI recommendations
3. ✅ Use dry-run mode
4. ✅ Test after migration
5. ✅ Use version control
6. ✅ Keep backups

## 🎓 Example Workflow

```bash
# 1. Scan
npm run migrate:scan

# 2. Review output, then generate recommendations
npm run migrate:recommend

# 3. Run full example to see everything
npm run example:migration

# 4. Apply to your code
node -e "import('./tools/migration/index.js').then(m => 
  new m.MigrationTool().execute({
    action: 'full',
    legacyFile: 'your-file.js',
    modernFile: 'reference-file.js',
    dryRun: true
  }).then(console.log)
)"
```

## 📞 Support

- 📖 Read `MIGRATION_GUIDE.md` for detailed help
- 🔍 Check `PROJECT_OVERVIEW.md` for architecture
- 💻 Run `npm run example:migration` to see it in action
- 🐛 Open an issue for bugs

---

**Ready to migrate?** Run `npm run example:migration` to get started! 🚀