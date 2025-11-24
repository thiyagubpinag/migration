# Roo Chat Quick Start - IBM Code Migration

## 🚀 Get Started in 3 Steps

### Step 1: Open Roo Chat
Open Roo Chat in your IDE (VSCode/Cursor)

### Step 2: Switch to Migration Mode
Type: `/mode migration` or select "🔄 Migration" mode

### Step 3: Start Migrating!
Just chat naturally:

```
You: "Scan my legacy user service and show me what needs to be fixed"
```

That's it! Roo will handle the rest. 🎉

---

## 💬 Common Chat Commands

### 🔍 Scan Code
```
"Scan the legacy user service"
"Check what's wrong with database-connector.js"
"Analyze all legacy files"
```

### 🤖 Get Recommendations
```
"Show me AI recommendations for the user service"
"How should I modernize this code?"
"Give me a migration plan"
```

### 👀 Preview Changes
```
"Show me what will change"
"Preview the migration"
"Let me see the diff"
```

### ✅ Apply Changes
```
"Apply the migration"
"Go ahead and update the code"
"Migrate the file now"
```

---

## 📋 Example Conversation

**You:** "Hi, I need help modernizing my legacy code"

**Roo:** "I can help! Let me scan your legacy code first. Which file would you like to start with?"

**You:** "The user service file"

**Roo:** *[Scans legacy-code/user-service.js]*

"Found 15 issues:
- 2 critical (security)
- 8 errors (functionality)
- 5 warnings (quality)

Priority score: 75/100 (high urgency)

Would you like AI recommendations?"

**You:** "Yes please"

**Roo:** *[Generates AI recommendations]*

"Here's the migration plan:
1. Remove hardcoded credentials (30 min)
2. Convert to ES6 modules (1 hour)
3. Modernize async patterns (2-3 hours)
...

Total effort: 1-2 days
Breaking changes: 3

Want to see a preview?"

**You:** "Yes, show me the preview"

**Roo:** *[Runs dry-run]*

"Preview of changes:
- 8 transformations
- 45 lines changed

Key changes:
  var → const
  callbacks → async/await
  hardcoded passwords → env vars

Ready to apply?"

**You:** "Yes, apply the changes"

**Roo:** "✅ Migration complete!
- Backup created
- 8 changes applied
- Tests recommended

Next: Run tests?"

**You:** "Yes, run tests"

---

## 🎯 What You Can Do

### ✅ Scan & Analyze
- Identify anti-patterns
- Find security issues
- Get priority scores
- Estimate effort

### 🤖 AI Recommendations
- Get migration steps
- See code examples
- Understand risks
- Plan timeline

### 🔄 Apply Changes
- Preview first (dry-run)
- Automatic backups
- Apply with approval
- Validate results

### 📊 Reports
- Detailed analysis
- Before/after diffs
- Migration summaries
- Success metrics

---

## 🛡️ Safety First

### Automatic Backups ✅
Every change creates a backup automatically

### Dry Run by Default ✅
Always previews changes first

### Approval Required ✅
Asks before modifying files

### Easy Rollback ✅
Can restore from backups anytime

---

## 💡 Pro Tips

1. **Start with Scan** - Always scan first to understand scope
2. **Review Recommendations** - Check AI suggestions before applying
3. **Use Preview** - See changes before committing
4. **Test After** - Run tests after each migration
5. **Commit Often** - Save progress with git

---

## 🎨 Natural Language

Just talk naturally! Roo understands:

✅ "What's wrong with my code?"
✅ "How do I fix this?"
✅ "Show me the changes"
✅ "Apply the migration"
✅ "Run the tests"

---

## 📁 Files You Can Migrate

### Included Examples
- `legacy-code/user-service.js`
- `legacy-code/database-connector.js`
- `legacy-code/api-routes.js`

### Your Own Files
Just specify the path:
```
"Scan src/services/my-service.js"
```

---

## 🔧 Behind the Scenes

When you chat, Roo:
1. Understands your intent
2. Calls the migration tool via MCP
3. Processes the results
4. Shows you formatted output
5. Waits for your approval
6. Applies changes safely

---

## 📚 Need More Help?

- **ROO_CHAT_INTEGRATION.md** - Detailed integration guide
- **MIGRATION_GUIDE.md** - Complete migration guide
- **QUICK_REFERENCE.md** - Command reference

---

## 🚀 Ready to Start?

Open Roo Chat and say:

```
"Scan my legacy code and show me what needs to be updated"
```

Roo will take care of the rest! 🎉

---

## 🎯 Quick Reference Card

| What You Want | What to Say |
|---------------|-------------|
| Scan code | "Scan the user service" |
| Get recommendations | "Show me AI recommendations" |
| Preview changes | "Let me see what will change" |
| Apply migration | "Apply the changes" |
| Run tests | "Run the tests" |
| Create backup | "Make a backup first" |
| Rollback | "Restore from backup" |
| Check status | "What's the migration status?" |

---

**That's it! You're ready to modernize your code with Roo Chat! 🚀**