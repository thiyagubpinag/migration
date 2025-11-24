/**
 * Code Analyzer - Analyzes legacy code against IBM standards
 */

import fs from 'fs/promises';
import path from 'path';

export class CodeAnalyzer {
  constructor(rulesConfig) {
    this.rules = rulesConfig;
  }

  /**
   * Analyze a file against IBM modernization rules
   * @param {string} filePath - Path to the file
   * @param {string} modernFilePath - Path to IBM-approved version
   * @returns {Promise<Object>} Analysis results
   */
  async analyzeFile(filePath, modernFilePath) {
    const legacyCode = await fs.readFile(filePath, 'utf-8');
    const modernCode = modernFilePath ? await fs.readFile(modernFilePath, 'utf-8') : null;

    const issues = [];
    const recommendations = [];

    // Analyze against each rule category
    for (const [categoryKey, category] of Object.entries(this.rules.categories)) {
      for (const rule of category.rules) {
        const ruleIssues = this.checkRule(legacyCode, rule, categoryKey);
        issues.push(...ruleIssues);
      }
    }

    // Generate recommendations based on modern code
    if (modernCode) {
      const comparison = this.compareWithModern(legacyCode, modernCode);
      recommendations.push(...comparison);
    }

    return {
      filePath,
      totalIssues: issues.length,
      issuesBySeverity: this.groupBySeverity(issues),
      issues,
      recommendations,
      modernReference: modernFilePath
    };
  }

  /**
   * Check code against a specific rule
   * @param {string} code - Code to check
   * @param {Object} rule - Rule definition
   * @param {string} category - Rule category
   * @returns {Array} Found issues
   */
  checkRule(code, rule, category) {
    const issues = [];
    const lines = code.split('\n');

    lines.forEach((line, index) => {
      const regex = new RegExp(rule.pattern, 'g');
      if (regex.test(line)) {
        issues.push({
          ruleId: rule.id,
          category,
          severity: rule.severity,
          line: index + 1,
          description: rule.description,
          rationale: rule.rationale,
          suggestion: rule.replacement,
          code: line.trim()
        });
      }
    });

    return issues;
  }

  /**
   * Compare legacy code with modern version
   * @param {string} legacyCode - Legacy code
   * @param {string} modernCode - Modern code
   * @returns {Array} Comparison recommendations
   */
  compareWithModern(legacyCode, modernCode) {
    const recommendations = [];

    // Check for modern patterns present in modern code but not in legacy
    const modernPatterns = this.extractPatterns(modernCode);
    const legacyPatterns = this.extractPatterns(legacyCode);

    // ES6 imports
    if (modernPatterns.hasImports && !legacyPatterns.hasImports) {
      recommendations.push({
        type: 'module-system',
        priority: 'high',
        description: 'Convert to ES6 module system',
        details: 'Modern version uses ES6 imports/exports. Convert require() to import statements.'
      });
    }

    // Async/await
    if (modernPatterns.hasAsyncAwait && !legacyPatterns.hasAsyncAwait) {
      recommendations.push({
        type: 'async-pattern',
        priority: 'high',
        description: 'Convert to async/await pattern',
        details: 'Modern version uses async/await. Convert callback-based code to Promises and async/await.'
      });
    }

    // Classes
    if (modernPatterns.hasClasses && !legacyPatterns.hasClasses) {
      recommendations.push({
        type: 'architecture',
        priority: 'medium',
        description: 'Use ES6 classes',
        details: 'Modern version uses ES6 classes. Consider refactoring to class-based architecture.'
      });
    }

    // Error handling
    if (modernPatterns.hasTryCatch && !legacyPatterns.hasTryCatch) {
      recommendations.push({
        type: 'error-handling',
        priority: 'high',
        description: 'Add proper error handling',
        details: 'Modern version has comprehensive try-catch blocks. Add error handling to all async operations.'
      });
    }

    // Input validation
    if (modernPatterns.hasValidation && !legacyPatterns.hasValidation) {
      recommendations.push({
        type: 'security',
        priority: 'critical',
        description: 'Add input validation',
        details: 'Modern version includes input validation. Add validation middleware to all endpoints.'
      });
    }

    return recommendations;
  }

  /**
   * Extract patterns from code
   * @param {string} code - Code to analyze
   * @returns {Object} Detected patterns
   */
  extractPatterns(code) {
    return {
      hasImports: /^import\s+/m.test(code),
      hasExports: /^export\s+/m.test(code),
      hasAsyncAwait: /async\s+function|async\s+\(|await\s+/m.test(code),
      hasClasses: /^class\s+\w+/m.test(code),
      hasTryCatch: /try\s*{[\s\S]*?}\s*catch/m.test(code),
      hasValidation: /validate|validator|check\(/m.test(code),
      hasVar: /\bvar\s+/m.test(code),
      hasCallbacks: /callback\s*\)/m.test(code),
      hasConnectionPool: /createPool|pool\./m.test(code),
      hasRateLimit: /rateLimit|limiter/m.test(code),
      hasHelmet: /helmet\(\)/m.test(code),
      hasLogger: /logger\./m.test(code)
    };
  }

  /**
   * Group issues by severity
   * @param {Array} issues - List of issues
   * @returns {Object} Grouped issues
   */
  groupBySeverity(issues) {
    return issues.reduce((acc, issue) => {
      if (!acc[issue.severity]) {
        acc[issue.severity] = [];
      }
      acc[issue.severity].push(issue);
      return acc;
    }, {});
  }

  /**
   * Generate migration priority score
   * @param {Object} analysis - Analysis results
   * @returns {number} Priority score (0-100)
   */
  calculatePriorityScore(analysis) {
    const weights = {
      critical: 25,
      error: 15,
      warning: 5,
      info: 1
    };

    let score = 0;
    for (const [severity, issues] of Object.entries(analysis.issuesBySeverity)) {
      score += issues.length * (weights[severity] || 0);
    }

    return Math.min(score, 100);
  }

  /**
   * Generate summary report
   * @param {Object} analysis - Analysis results
   * @returns {Object} Summary report
   */
  generateSummary(analysis) {
    const priorityScore = this.calculatePriorityScore(analysis);
    const criticalCount = (analysis.issuesBySeverity.critical || []).length;
    const errorCount = (analysis.issuesBySeverity.error || []).length;

    return {
      filePath: analysis.filePath,
      priorityScore,
      totalIssues: analysis.totalIssues,
      criticalIssues: criticalCount,
      errorIssues: errorCount,
      recommendationCount: analysis.recommendations.length,
      migrationUrgency: this.getMigrationUrgency(priorityScore, criticalCount),
      estimatedEffort: this.estimateEffort(analysis)
    };
  }

  /**
   * Determine migration urgency
   * @param {number} score - Priority score
   * @param {number} criticalCount - Number of critical issues
   * @returns {string} Urgency level
   */
  getMigrationUrgency(score, criticalCount) {
    if (criticalCount > 0 || score >= 75) return 'immediate';
    if (score >= 50) return 'high';
    if (score >= 25) return 'medium';
    return 'low';
  }

  /**
   * Estimate migration effort
   * @param {Object} analysis - Analysis results
   * @returns {string} Effort estimate
   */
  estimateEffort(analysis) {
    const totalIssues = analysis.totalIssues;
    const recommendations = analysis.recommendations.length;
    const complexity = totalIssues + (recommendations * 2);

    if (complexity > 50) return 'large (3-5 days)';
    if (complexity > 25) return 'medium (1-2 days)';
    if (complexity > 10) return 'small (4-8 hours)';
    return 'minimal (1-2 hours)';
  }
}

export default CodeAnalyzer;

// Made with Bob
