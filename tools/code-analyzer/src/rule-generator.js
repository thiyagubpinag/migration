/**
 * Generates AI-ready modernization rules from analysis results
 */
export class RuleGenerator {
  constructor() {
    this.ruleTemplate = this.initializeRuleTemplate();
  }

  /**
   * Initialize rule template structure
   */
  initializeRuleTemplate() {
    return {
      metadata: {
        generatedAt: new Date().toISOString(),
        analyzer: 'IBM Code Analyzer v1.0.0',
        project: ''
      },
      rules: []
    };
  }

  /**
   * Generate comprehensive modernization rules
   */
  generateRules(dependencyAnalysis, patternAnalysis, projectName) {
    const rules = {
      ...this.ruleTemplate,
      metadata: {
        ...this.ruleTemplate.metadata,
        project: projectName,
        totalIssues: dependencyAnalysis.issues.length + patternAnalysis.patterns.length
      },
      dependencyRules: [],
      patternRules: [],
      aiPrompts: []
    };

    // Generate dependency rules
    rules.dependencyRules = this.generateDependencyRules(dependencyAnalysis);

    // Generate pattern rules
    rules.patternRules = this.generatePatternRules(patternAnalysis);

    // Generate AI prompts for automated migration
    rules.aiPrompts = this.generateAIPrompts(rules.dependencyRules, rules.patternRules);

    // Generate summary
    rules.summary = this.generateSummary(rules);

    return rules;
  }

  /**
   * Generate rules from dependency analysis
   */
  generateDependencyRules(analysis) {
    const rules = [];

    for (const issue of analysis.issues) {
      const rule = {
        id: this.generateRuleId('dep', issue.package, issue.type),
        category: 'dependency-modernization',
        type: issue.type,
        severity: this.mapSeverity(issue.severity),
        package: issue.package,
        legacy_pattern: `"${issue.package}": "${issue.currentVersion}"`,
        modern_replacement: this.getModernReplacement(issue),
        message: this.generateDependencyMessage(issue),
        action: this.getDependencyAction(issue),
        priority: this.calculatePriority(issue),
        estimatedEffort: this.estimateEffort(issue),
        examples: this.generateDependencyExamples(issue)
      };

      if (issue.type === 'security') {
        rule.cve = issue.cve;
        rule.securityImpact = issue.description;
      }

      rules.push(rule);
    }

    return rules;
  }

  /**
   * Generate rules from pattern analysis
   */
  generatePatternRules(analysis) {
    const rules = [];

    for (const pattern of analysis.patterns) {
      const rule = {
        id: pattern.id,
        category: pattern.category,
        severity: pattern.severity,
        legacy_pattern: pattern.legacy_pattern,
        modern_replacement: pattern.modern_replacement,
        message: pattern.message,
        occurrences: pattern.matchCount,
        affectedFiles: [pattern.file],
        priority: this.calculatePatternPriority(pattern),
        estimatedEffort: this.estimatePatternEffort(pattern),
        examples: pattern.examples,
        locations: pattern.occurrences.map(occ => ({
          file: pattern.file,
          line: occ.line,
          code: occ.code
        }))
      };

      rules.push(rule);
    }

    return rules;
  }

  /**
   * Generate AI prompts for automated migration
   */
  generateAIPrompts(dependencyRules, patternRules) {
    const prompts = [];

    // High-priority dependency migrations
    const criticalDeps = dependencyRules.filter(r => r.severity === 'critical' || r.severity === 'error');
    if (criticalDeps.length > 0) {
      prompts.push({
        id: 'migrate-critical-dependencies',
        type: 'dependency-migration',
        priority: 'critical',
        prompt: this.generateDependencyMigrationPrompt(criticalDeps),
        affectedPackages: criticalDeps.map(r => r.package)
      });
    }

    // Pattern-based migrations
    const patternGroups = this.groupPatternsByCategory(patternRules);
    for (const [category, patterns] of Object.entries(patternGroups)) {
      prompts.push({
        id: `migrate-${category}`,
        type: 'pattern-migration',
        category: category,
        priority: this.getCategoryPriority(patterns),
        prompt: this.generatePatternMigrationPrompt(category, patterns),
        affectedFiles: [...new Set(patterns.flatMap(p => p.affectedFiles))],
        totalOccurrences: patterns.reduce((sum, p) => sum + p.occurrences, 0)
      });
    }

    // Comprehensive migration prompt
    prompts.push({
      id: 'comprehensive-migration',
      type: 'full-migration',
      priority: 'high',
      prompt: this.generateComprehensiveMigrationPrompt(dependencyRules, patternRules)
    });

    return prompts;
  }

  /**
   * Generate dependency migration prompt for AI
   */
  generateDependencyMigrationPrompt(rules) {
    const packages = rules.map(r => ({
      name: r.package,
      from: r.legacy_pattern,
      to: r.modern_replacement,
      reason: r.message
    }));

    return `
# Dependency Migration Task

## Packages to Migrate:
${packages.map(p => `
### ${p.name}
- **Current:** ${p.from}
- **Target:** ${p.to}
- **Reason:** ${p.reason}
`).join('\n')}

## Instructions:
1. Update package.json with new versions/packages
2. Update all import/require statements
3. Refactor code to use new API patterns
4. Test all affected functionality
5. Update documentation

## Expected Output:
- Updated package.json
- Refactored source files
- Migration summary report
`;
  }

  /**
   * Generate pattern migration prompt for AI
   */
  generatePatternMigrationPrompt(category, patterns) {
    return `
# Code Pattern Migration: ${category}

## Patterns to Modernize:
${patterns.map(p => `
### ${p.id}
- **Legacy Pattern:** ${p.legacy_pattern}
- **Modern Replacement:** ${p.modern_replacement}
- **Occurrences:** ${p.occurrences}
- **Files Affected:** ${p.affectedFiles.length}

**Example:**
\`\`\`javascript
// Before
${p.examples.before}

// After
${p.examples.after}
\`\`\`
`).join('\n')}

## Migration Steps:
1. Identify all occurrences of legacy patterns
2. Apply modern replacements systematically
3. Ensure backward compatibility where needed
4. Run tests to verify functionality
5. Update code comments and documentation
`;
  }

  /**
   * Generate comprehensive migration prompt
   */
  generateComprehensiveMigrationPrompt(dependencyRules, patternRules) {
    const criticalIssues = [...dependencyRules, ...patternRules]
      .filter(r => r.severity === 'critical' || r.severity === 'error')
      .length;

    const warnings = [...dependencyRules, ...patternRules]
      .filter(r => r.severity === 'warning')
      .length;

    return `
# Comprehensive Codebase Modernization

## Overview
This project requires modernization to meet IBM standards and best practices.

## Statistics
- **Critical Issues:** ${criticalIssues}
- **Warnings:** ${warnings}
- **Total Issues:** ${dependencyRules.length + patternRules.length}

## Priority Order
1. **Security Vulnerabilities** (Immediate)
2. **Deprecated Dependencies** (High Priority)
3. **Async Pattern Modernization** (High Priority)
4. **Variable Declaration Updates** (Medium Priority)
5. **Module System Migration** (Medium Priority)
6. **Code Style Improvements** (Low Priority)

## Modernization Checklist
- [ ] Update all dependencies to IBM-approved versions
- [ ] Replace deprecated packages with modern alternatives
- [ ] Convert callbacks to async/await
- [ ] Replace var with const/let
- [ ] Migrate to ES6 modules (if applicable)
- [ ] Update to ES6 class syntax
- [ ] Use template literals for strings
- [ ] Apply modern array methods
- [ ] Implement proper error handling
- [ ] Run security audit and fix vulnerabilities

## Expected Outcome
A fully modernized codebase that:
- Meets IBM coding standards
- Has no security vulnerabilities
- Uses modern JavaScript patterns
- Is maintainable and scalable
- Has improved performance
`;
  }

  /**
   * Helper methods
   */
  generateRuleId(prefix, name, type) {
    return `${prefix}-${name.replace(/[^a-z0-9]/gi, '-')}-${type}`.toLowerCase();
  }

  mapSeverity(severity) {
    const severityMap = {
      'high': 'error',
      'medium': 'warning',
      'low': 'info'
    };
    return severityMap[severity] || severity;
  }

  getModernReplacement(issue) {
    if (issue.type === 'deprecated') {
      return issue.alternative;
    } else if (issue.type === 'outdated') {
      return `"${issue.package}": "^${issue.recommendedVersion}"`;
    } else if (issue.type === 'security') {
      return 'Update to latest secure version';
    }
    return 'Review and update';
  }

  generateDependencyMessage(issue) {
    if (issue.type === 'deprecated') {
      return `Package "${issue.package}" is ${issue.status}. ${issue.reason} Replace with ${issue.alternative}.`;
    } else if (issue.type === 'outdated') {
      return `Package "${issue.package}" version ${issue.currentVersion} is outdated. Update to ${issue.recommendedVersion}.`;
    } else if (issue.type === 'security') {
      return `Security vulnerability ${issue.cve} in ${issue.package}. ${issue.description}`;
    }
    return `Package "${issue.package}" requires review.`;
  }

  getDependencyAction(issue) {
    if (issue.type === 'deprecated') {
      return 'replace';
    } else if (issue.type === 'outdated' || issue.type === 'security') {
      return 'update';
    }
    return 'review';
  }

  calculatePriority(issue) {
    if (issue.type === 'security') return 1;
    if (issue.type === 'deprecated') return 2;
    if (issue.type === 'outdated') return 3;
    return 4;
  }

  calculatePatternPriority(pattern) {
    const severityPriority = {
      'error': 1,
      'warning': 2,
      'info': 3
    };
    return severityPriority[pattern.severity] || 4;
  }

  estimateEffort(issue) {
    if (issue.type === 'security' || issue.type === 'deprecated') {
      return 'high';
    } else if (issue.type === 'outdated') {
      return 'medium';
    }
    return 'low';
  }

  estimatePatternEffort(pattern) {
    if (pattern.matchCount > 50) return 'high';
    if (pattern.matchCount > 20) return 'medium';
    return 'low';
  }

  generateDependencyExamples(issue) {
    const examples = {
      before: `const ${issue.package} = require('${issue.package}');`,
      after: ''
    };

    if (issue.type === 'deprecated' && issue.alternative) {
      examples.after = `const ${issue.alternative} = require('${issue.alternative}');`;
    } else if (issue.type === 'outdated') {
      examples.after = `// Update package.json:\n"${issue.package}": "^${issue.recommendedVersion}"`;
    }

    return examples;
  }

  groupPatternsByCategory(patterns) {
    const groups = {};
    for (const pattern of patterns) {
      if (!groups[pattern.category]) {
        groups[pattern.category] = [];
      }
      groups[pattern.category].push(pattern);
    }
    return groups;
  }

  getCategoryPriority(patterns) {
    const priorities = patterns.map(p => p.priority);
    return Math.min(...priorities);
  }

  generateSummary(rules) {
    return {
      totalRules: rules.dependencyRules.length + rules.patternRules.length,
      dependencyIssues: rules.dependencyRules.length,
      patternIssues: rules.patternRules.length,
      aiPrompts: rules.aiPrompts.length,
      bySeverity: {
        critical: [...rules.dependencyRules, ...rules.patternRules].filter(r => r.severity === 'critical').length,
        error: [...rules.dependencyRules, ...rules.patternRules].filter(r => r.severity === 'error').length,
        warning: [...rules.dependencyRules, ...rules.patternRules].filter(r => r.severity === 'warning').length,
        info: [...rules.dependencyRules, ...rules.patternRules].filter(r => r.severity === 'info').length
      },
      estimatedEffort: this.calculateTotalEffort(rules)
    };
  }

  calculateTotalEffort(rules) {
    const allRules = [...rules.dependencyRules, ...rules.patternRules];
    const high = allRules.filter(r => r.estimatedEffort === 'high').length;
    const medium = allRules.filter(r => r.estimatedEffort === 'medium').length;
    const low = allRules.filter(r => r.estimatedEffort === 'low').length;

    if (high > 10) return 'very-high';
    if (high > 5 || medium > 20) return 'high';
    if (medium > 10 || low > 30) return 'medium';
    return 'low';
  }
}

// Made with Bob
