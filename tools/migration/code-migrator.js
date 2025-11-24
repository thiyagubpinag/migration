/**
 * Code Migrator - Applies migration changes to legacy code
 */

import fs from 'fs/promises';
import path from 'path';

export class CodeMigrator {
  constructor(logger) {
    this.logger = logger;
    this.appliedChanges = [];
  }

  /**
   * Apply migration recommendations to code
   * @param {string} filePath - Path to file to migrate
   * @param {Object} migrationPlan - Migration plan with steps
   * @param {boolean} dryRun - If true, don't actually write changes
   * @returns {Promise<Object>} Migration results
   */
  async applyMigration(filePath, migrationPlan, dryRun = false) {
    this.logger.info(`Starting migration for ${filePath}`, { dryRun });

    try {
      const originalCode = await fs.readFile(filePath, 'utf-8');
      let migratedCode = originalCode;
      const changes = [];

      // Apply each migration step
      for (const phase of migrationPlan.phases) {
        for (const step of phase.steps) {
          if (step.codeExample) {
            const result = this.applyCodeTransformation(
              migratedCode,
              step.codeExample.before,
              step.codeExample.after,
              step
            );
            
            if (result.applied) {
              migratedCode = result.code;
              changes.push({
                phase: phase.name,
                step: step.title,
                category: step.category,
                description: step.description,
                linesChanged: result.linesChanged
              });
            }
          }
        }
      }

      // Create backup if not dry run
      if (!dryRun && changes.length > 0) {
        await this.createBackup(filePath, originalCode);
        await fs.writeFile(filePath, migratedCode, 'utf-8');
        this.logger.info(`Migration applied to ${filePath}`, { changesCount: changes.length });
      }

      return {
        success: true,
        filePath,
        dryRun,
        changesApplied: changes.length,
        changes,
        originalCode,
        migratedCode,
        diff: this.generateDiff(originalCode, migratedCode)
      };
    } catch (error) {
      this.logger.error(`Migration failed for ${filePath}`, { error: error.message });
      return {
        success: false,
        filePath,
        error: error.message
      };
    }
  }

  /**
   * Apply a specific code transformation
   * @param {string} code - Current code
   * @param {string} before - Pattern to find
   * @param {string} after - Replacement code
   * @param {Object} step - Migration step details
   * @returns {Object} Transformation result
   */
  applyCodeTransformation(code, before, after, step) {
    const lines = code.split('\n');
    let linesChanged = 0;
    let applied = false;

    // Try exact match first
    if (code.includes(before)) {
      code = code.replace(before, after);
      applied = true;
      linesChanged = before.split('\n').length;
    } else {
      // Try pattern-based transformation
      const result = this.applyPatternTransformation(code, step);
      if (result.applied) {
        code = result.code;
        applied = true;
        linesChanged = result.linesChanged;
      }
    }

    return { code, applied, linesChanged };
  }

  /**
   * Apply pattern-based transformation
   * @param {string} code - Code to transform
   * @param {Object} step - Migration step
   * @returns {Object} Transformation result
   */
  applyPatternTransformation(code, step) {
    let transformedCode = code;
    let applied = false;
    let linesChanged = 0;

    // Apply common transformations based on category
    switch (step.category) {
      case 'syntax':
        const syntaxResult = this.applySyntaxTransformations(transformedCode);
        transformedCode = syntaxResult.code;
        applied = syntaxResult.applied;
        linesChanged = syntaxResult.linesChanged;
        break;

      case 'async':
        const asyncResult = this.applyAsyncTransformations(transformedCode);
        transformedCode = asyncResult.code;
        applied = asyncResult.applied;
        linesChanged = asyncResult.linesChanged;
        break;

      case 'modules':
        const moduleResult = this.applyModuleTransformations(transformedCode);
        transformedCode = moduleResult.code;
        applied = moduleResult.applied;
        linesChanged = moduleResult.linesChanged;
        break;

      case 'security':
        const securityResult = this.applySecurityTransformations(transformedCode);
        transformedCode = securityResult.code;
        applied = securityResult.applied;
        linesChanged = securityResult.linesChanged;
        break;
    }

    return { code: transformedCode, applied, linesChanged };
  }

  /**
   * Apply syntax transformations
   * @param {string} code - Code to transform
   * @returns {Object} Transformation result
   */
  applySyntaxTransformations(code) {
    let transformedCode = code;
    let linesChanged = 0;

    // var to const/let
    const varMatches = code.match(/\bvar\s+/g);
    if (varMatches) {
      transformedCode = transformedCode.replace(/\bvar\s+/g, 'const ');
      linesChanged += varMatches.length;
    }

    return {
      code: transformedCode,
      applied: linesChanged > 0,
      linesChanged
    };
  }

  /**
   * Apply async transformations
   * @param {string} code - Code to transform
   * @returns {Object} Transformation result
   */
  applyAsyncTransformations(code) {
    let transformedCode = code;
    let linesChanged = 0;

    // This is a simplified example - real implementation would be more sophisticated
    // Convert callback patterns to async/await
    const callbackPattern = /function\s+(\w+)\s*\([^)]*,\s*callback\s*\)/g;
    const matches = code.match(callbackPattern);
    
    if (matches) {
      transformedCode = transformedCode.replace(
        callbackPattern,
        'async function $1'
      );
      linesChanged += matches.length;
    }

    return {
      code: transformedCode,
      applied: linesChanged > 0,
      linesChanged
    };
  }

  /**
   * Apply module transformations
   * @param {string} code - Code to transform
   * @returns {Object} Transformation result
   */
  applyModuleTransformations(code) {
    let transformedCode = code;
    let linesChanged = 0;

    // require to import
    const requirePattern = /(?:const|var|let)\s+(\w+)\s*=\s*require\(['"]([^'"]+)['"]\)/g;
    const matches = [...code.matchAll(requirePattern)];
    
    if (matches.length > 0) {
      matches.forEach(match => {
        const [fullMatch, varName, modulePath] = match;
        transformedCode = transformedCode.replace(
          fullMatch,
          `import ${varName} from '${modulePath}'`
        );
      });
      linesChanged += matches.length;
    }

    // module.exports to export
    if (code.includes('module.exports')) {
      transformedCode = transformedCode.replace(
        /module\.exports\s*=\s*{([^}]+)}/g,
        'export { $1 }'
      );
      linesChanged++;
    }

    return {
      code: transformedCode,
      applied: linesChanged > 0,
      linesChanged
    };
  }

  /**
   * Apply security transformations
   * @param {string} code - Code to transform
   * @returns {Object} Transformation result
   */
  applySecurityTransformations(code) {
    let transformedCode = code;
    let linesChanged = 0;

    // Replace hardcoded credentials with env vars
    const credentialPatterns = [
      { pattern: /password\s*:\s*['"]([^'"]+)['"]/, replacement: "password: process.env.DB_PASSWORD" },
      { pattern: /apiKey\s*:\s*['"]([^'"]+)['"]/, replacement: "apiKey: process.env.API_KEY" }
    ];

    credentialPatterns.forEach(({ pattern, replacement }) => {
      if (pattern.test(code)) {
        transformedCode = transformedCode.replace(pattern, replacement);
        linesChanged++;
      }
    });

    return {
      code: transformedCode,
      applied: linesChanged > 0,
      linesChanged
    };
  }

  /**
   * Create backup of original file
   * @param {string} filePath - Original file path
   * @param {string} content - File content
   * @returns {Promise<string>} Backup file path
   */
  async createBackup(filePath, content) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = `${filePath}.backup-${timestamp}`;
    await fs.writeFile(backupPath, content, 'utf-8');
    this.logger.info(`Backup created: ${backupPath}`);
    return backupPath;
  }

  /**
   * Generate diff between original and migrated code
   * @param {string} original - Original code
   * @param {string} migrated - Migrated code
   * @returns {Array} Diff lines
   */
  generateDiff(original, migrated) {
    const originalLines = original.split('\n');
    const migratedLines = migrated.split('\n');
    const diff = [];

    const maxLines = Math.max(originalLines.length, migratedLines.length);
    for (let i = 0; i < maxLines; i++) {
      const origLine = originalLines[i] || '';
      const migrLine = migratedLines[i] || '';

      if (origLine !== migrLine) {
        if (origLine) {
          diff.push({ line: i + 1, type: 'removed', content: origLine });
        }
        if (migrLine) {
          diff.push({ line: i + 1, type: 'added', content: migrLine });
        }
      }
    }

    return diff;
  }

  /**
   * Generate migration report
   * @param {Object} result - Migration result
   * @returns {string} Formatted report
   */
  generateReport(result) {
    let report = `\n${'='.repeat(80)}\n`;
    report += `MIGRATION REPORT: ${result.filePath}\n`;
    report += `${'='.repeat(80)}\n\n`;

    if (result.success) {
      report += `Status: ${result.dryRun ? 'DRY RUN' : 'COMPLETED'}\n`;
      report += `Changes Applied: ${result.changesApplied}\n\n`;

      if (result.changes.length > 0) {
        report += `CHANGES:\n`;
        result.changes.forEach((change, i) => {
          report += `\n${i + 1}. [${change.phase}] ${change.step}\n`;
          report += `   Category: ${change.category}\n`;
          report += `   Description: ${change.description}\n`;
          report += `   Lines Changed: ${change.linesChanged}\n`;
        });
      }

      if (result.diff.length > 0) {
        report += `\n\nDIFF SUMMARY:\n`;
        report += `Total lines changed: ${result.diff.length}\n`;
        report += `\nFirst 10 changes:\n`;
        result.diff.slice(0, 10).forEach(d => {
          const prefix = d.type === 'added' ? '+' : '-';
          report += `${prefix} Line ${d.line}: ${d.content}\n`;
        });
        if (result.diff.length > 10) {
          report += `... and ${result.diff.length - 10} more changes\n`;
        }
      }
    } else {
      report += `Status: FAILED\n`;
      report += `Error: ${result.error}\n`;
    }

    report += `\n${'='.repeat(80)}\n`;
    return report;
  }

  /**
   * Validate migrated code
   * @param {string} code - Migrated code
   * @returns {Object} Validation result
   */
  validateMigratedCode(code) {
    const issues = [];

    // Check for syntax errors (basic check)
    try {
      // This is a simplified check - real implementation would use a parser
      if (code.includes('var ')) {
        issues.push('Still contains var declarations');
      }
      if (code.includes('callback)') && !code.includes('async')) {
        issues.push('Still contains callback patterns without async/await');
      }
      if (/password\s*:\s*['"][^'"]+['"]/.test(code)) {
        issues.push('Still contains hardcoded credentials');
      }
    } catch (error) {
      issues.push(`Validation error: ${error.message}`);
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }
}

export default CodeMigrator;

// Made with Bob
