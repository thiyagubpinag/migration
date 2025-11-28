import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  detectJavaVersion, 
  javaVersionPatterns 
} from '../../config/java-detection-config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Code Analyzer Tool
 * Analyzes Java code against guidelines and detects issues
 */
export class CodeAnalyzer {
  constructor() {
    this.name = 'code-analyzer';
    this.guidelinesPath = path.join(__dirname, '../../guidelines/java/java-guidelines.json');
  }

  /**
   * Execute code analysis
   * @param {Object} params - Parameters
   * @param {string} params.javaCode - Java source code to analyze
   * @param {string} params.filePath - File path (optional)
   * @param {Object} params.guidelines - Pre-loaded guidelines (optional)
   * @returns {Promise<Object>} Analysis results with detected issues
   */
  async execute(params) {
    try {
      console.log('\n🔍 Code Analyzer: Starting analysis...\n');

      const { javaCode, filePath = 'unknown.java', guidelines } = params;

      if (!javaCode) {
        throw new Error('javaCode parameter is required');
      }

      // Load guidelines if not provided
      const guidelineData = guidelines || await this.loadGuidelines();

      // Detect Java version
      const detectedVersion = detectJavaVersion(javaCode);
      console.log(`✓ Detected Java version: ${detectedVersion}`);

      // Run all analysis checks
      const issues = {
        deprecated_apis: await this.detectDeprecatedAPIs(javaCode, guidelineData),
        version_incompatibilities: await this.detectVersionIncompatibilities(javaCode, detectedVersion, guidelineData),
        security_issues: await this.detectSecurityIssues(javaCode, guidelineData),
        code_style_violations: await this.detectCodeStyleViolations(javaCode, guidelineData),
        outdated_patterns: await this.detectOutdatedPatterns(javaCode),
        missing_try_with_resources: await this.detectMissingTryWithResources(javaCode),
        raw_types: await this.detectRawTypes(javaCode),
        performance_issues: await this.detectPerformanceIssues(javaCode, guidelineData)
      };

      // Generate structured ruleset
      const rules = this.generateRuleset(issues, filePath, detectedVersion);

      // Calculate summary
      const summary = this.calculateSummary(rules);

      console.log('\n✅ Analysis completed!\n');
      console.log(`Total issues found: ${summary.total_issues}`);
      console.log(`  Critical: ${summary.by_severity.critical}`);
      console.log(`  Error: ${summary.by_severity.error}`);
      console.log(`  Warning: ${summary.by_severity.warning}`);
      console.log(`  Info: ${summary.by_severity.info}\n`);

      return {
        success: true,
        tool: this.name,
        file: filePath,
        detected_version: detectedVersion,
        recommended_version: guidelineData?.java_version?.recommended_version || '21',
        rules,
        summary,
        message: 'Code analysis completed successfully'
      };
    } catch (error) {
      console.error('❌ Error analyzing code:', error.message);
      return {
        success: false,
        tool: this.name,
        error: error.message,
        message: 'Failed to analyze code'
      };
    }
  }

  /**
   * Load guidelines from file
   */
  async loadGuidelines() {
    try {
      const content = await fs.readFile(this.guidelinesPath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.warn('⚠️  Guidelines not found, using built-in patterns');
      return null;
    }
  }

  /**
   * Detect deprecated APIs
   */
  async detectDeprecatedAPIs(code, guidelines) {
    const issues = [];
    
    if (guidelines?.deprecated_patterns) {
      for (const deprecated of guidelines.deprecated_patterns) {
        try {
          const pattern = new RegExp(deprecated.pattern.replace(/^\/|\/$/g, ''), 'g');
          let match;
          let lineNumber = 1;
          const lines = code.split('\n');
          
          for (let i = 0; i < lines.length; i++) {
            if (pattern.test(lines[i])) {
              issues.push({
                line: i + 1,
                code: lines[i].trim(),
                deprecated_api: deprecated.pattern,
                replacement: deprecated.replacement,
                reason: deprecated.migration_guide
              });
            }
          }
        } catch (e) {
          // Skip invalid patterns
        }
      }
    }

    // Check built-in deprecated patterns
    const versions = ['1.8', '9', '11', '17'];
    for (const version of versions) {
      const deprecatedAPIs = javaVersionPatterns.deprecatedAPIs[version] || [];
      for (const api of deprecatedAPIs) {
        const matches = this.findPatternMatches(code, api.pattern);
        issues.push(...matches.map(match => ({
          line: match.line,
          code: match.code,
          deprecated_api: api.pattern.toString(),
          replacement: api.replacement,
          reason: api.reason
        })));
      }
    }

    return issues;
  }

  /**
   * Detect version incompatibilities
   */
  async detectVersionIncompatibilities(code, detectedVersion, guidelines) {
    const issues = [];
    const breakingChanges = guidelines?.java_version?.breaking_changes || [];

    for (const change of breakingChanges) {
      const pattern = new RegExp(change.pattern || change.api, 'g');
      const matches = this.findPatternMatches(code, pattern);
      
      issues.push(...matches.map(match => ({
        line: match.line,
        code: match.code,
        issue: `API incompatible with target version`,
        api: change.api || change.pattern,
        reason: change.reason,
        replacement: change.replacement
      })));
    }

    return issues;
  }

  /**
   * Detect security issues
   */
  async detectSecurityIssues(code, guidelines) {
    const issues = [];
    const securityPatterns = javaVersionPatterns.securityPatterns;

    for (const pattern of securityPatterns) {
      const matches = this.findPatternMatches(code, pattern.pattern);
      
      issues.push(...matches.map(match => ({
        line: match.line,
        code: match.code,
        rule_id: pattern.name,
        title: pattern.message,
        severity: pattern.severity,
        cwe_id: this.getCWEForPattern(pattern.name),
        remediation: this.getRemediationForPattern(pattern.name)
      })));
    }

    // Check guidelines security rules
    if (guidelines?.security_rules) {
      for (const rule of guidelines.security_rules) {
        // Simple keyword matching for security rules
        const lines = code.split('\n');
        for (let i = 0; i < lines.length; i++) {
          if (this.matchesSecurityRule(lines[i], rule)) {
            issues.push({
              line: i + 1,
              code: lines[i].trim(),
              rule_id: rule.rule_id,
              title: rule.title,
              severity: rule.severity,
              cwe_id: rule.cwe_id,
              remediation: rule.remediation
            });
          }
        }
      }
    }

    return issues;
  }

  /**
   * Detect code style violations
   */
  async detectCodeStyleViolations(code, guidelines) {
    const issues = [];
    const lines = code.split('\n');

    // Check naming conventions
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Class names should be PascalCase
      const classMatch = line.match(/class\s+([a-z][a-zA-Z0-9_]*)/);
      if (classMatch) {
        issues.push({
          line: i + 1,
          code: line.trim(),
          rule: 'naming-convention',
          message: `Class name '${classMatch[1]}' should start with uppercase`,
          severity: 'warning'
        });
      }

      // Constants should be UPPER_SNAKE_CASE
      const constMatch = line.match(/final\s+\w+\s+([a-z][a-zA-Z0-9]*)\s*=/);
      if (constMatch && line.includes('static')) {
        issues.push({
          line: i + 1,
          code: line.trim(),
          rule: 'naming-convention',
          message: `Constant '${constMatch[1]}' should be UPPER_SNAKE_CASE`,
          severity: 'warning'
        });
      }
    }

    return issues;
  }

  /**
   * Detect outdated patterns (pre-Java 8)
   */
  async detectOutdatedPatterns(code) {
    const issues = [];
    const antiPatterns = javaVersionPatterns.antiPatterns;

    for (const pattern of antiPatterns) {
      const matches = this.findPatternMatches(code, pattern.pattern);
      
      issues.push(...matches.map(match => ({
        line: match.line,
        code: match.code,
        pattern: pattern.name,
        message: pattern.message,
        severity: pattern.severity
      })));
    }

    return issues;
  }

  /**
   * Detect missing try-with-resources
   */
  async detectMissingTryWithResources(code) {
    const issues = [];
    const resourcePattern = /(FileInputStream|FileOutputStream|BufferedReader|BufferedWriter|FileReader|FileWriter|Socket|ServerSocket|Connection|Statement|ResultSet)/;
    const lines = code.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check if resource is created but not in try-with-resources
      if (resourcePattern.test(line) && !line.includes('try (')) {
        // Look ahead to see if there's a manual close()
        let hasManualClose = false;
        for (let j = i; j < Math.min(i + 20, lines.length); j++) {
          if (lines[j].includes('.close()')) {
            hasManualClose = true;
            break;
          }
        }

        if (hasManualClose) {
          issues.push({
            line: i + 1,
            code: line.trim(),
            issue: 'Manual resource management',
            message: 'Use try-with-resources for automatic resource management',
            severity: 'error'
          });
        }
      }
    }

    return issues;
  }

  /**
   * Detect raw types
   */
  async detectRawTypes(code) {
    const issues = [];
    const rawTypePattern = /\b(List|Set|Map|Collection|ArrayList|HashSet|HashMap)\s+\w+\s*=\s*new\s+(ArrayList|HashSet|HashMap|LinkedList|TreeSet|TreeMap)\s*\(\)/;
    const lines = code.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const match = line.match(rawTypePattern);
      
      if (match) {
        issues.push({
          line: i + 1,
          code: line.trim(),
          issue: 'Raw type usage',
          message: 'Use generic types instead of raw types',
          severity: 'warning',
          suggestion: `Use ${match[1]}<Type> instead of ${match[1]}`
        });
      }
    }

    return issues;
  }

  /**
   * Detect performance issues
   */
  async detectPerformanceIssues(code, guidelines) {
    const issues = [];
    const lines = code.split('\n');

    // String concatenation in loops
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.includes('for') || line.includes('while')) {
        // Check next few lines for string concatenation
        for (let j = i; j < Math.min(i + 10, lines.length); j++) {
          if (lines[j].includes('+=') && lines[j].match(/String|""/)) {
            issues.push({
              line: j + 1,
              code: lines[j].trim(),
              issue: 'String concatenation in loop',
              message: 'Use StringBuilder for string concatenation in loops',
              severity: 'warning',
              impact: 'high'
            });
            break;
          }
        }
      }
    }

    return issues;
  }

  /**
   * Generate structured ruleset from issues
   */
  generateRuleset(issues, filePath, detectedVersion) {
    const rules = [];

    // Process each issue category
    for (const [category, categoryIssues] of Object.entries(issues)) {
      if (categoryIssues.length > 0) {
        rules.push({
          rule: category,
          locations: [filePath],
          issues: categoryIssues,
          count: categoryIssues.length
        });
      }
    }

    return rules;
  }

  /**
   * Calculate summary statistics
   */
  calculateSummary(rules) {
    const summary = {
      total_issues: 0,
      by_severity: {
        critical: 0,
        error: 0,
        warning: 0,
        info: 0
      },
      by_category: {}
    };

    for (const rule of rules) {
      summary.total_issues += rule.count;
      summary.by_category[rule.rule] = rule.count;

      // Count by severity
      for (const issue of rule.issues) {
        const severity = issue.severity || 'warning';
        if (summary.by_severity[severity] !== undefined) {
          summary.by_severity[severity]++;
        }
      }
    }

    return summary;
  }

  /**
   * Find pattern matches in code
   */
  findPatternMatches(code, pattern) {
    const matches = [];
    const lines = code.split('\n');

    for (let i = 0; i < lines.length; i++) {
      if (pattern.test(lines[i])) {
        matches.push({
          line: i + 1,
          code: lines[i].trim()
        });
      }
    }

    return matches;
  }

  /**
   * Check if line matches security rule
   */
  matchesSecurityRule(line, rule) {
    const keywords = {
      'SEC-001': ['Statement', 'executeQuery', 'executeUpdate'],
      'SEC-002': ['password', 'apiKey', 'secret'],
      'SEC-003': ['DES', 'MD5', 'SHA1'],
      'SEC-004': ['new Random()'],
      'SEC-005': ['File', 'Path', '../']
    };

    const ruleKeywords = keywords[rule.rule_id] || [];
    return ruleKeywords.some(keyword => line.includes(keyword));
  }

  /**
   * Get CWE ID for pattern
   */
  getCWEForPattern(patternName) {
    const cweMap = {
      'hardcoded-password': 'CWE-798',
      'sql-injection-risk': 'CWE-89',
      'insecure-random': 'CWE-330',
      'weak-crypto': 'CWE-327'
    };
    return cweMap[patternName] || 'CWE-000';
  }

  /**
   * Get remediation for pattern
   */
  getRemediationForPattern(patternName) {
    const remediationMap = {
      'hardcoded-password': 'Use environment variables or secure vault',
      'sql-injection-risk': 'Use PreparedStatement with parameterized queries',
      'insecure-random': 'Use SecureRandom for security-sensitive operations',
      'weak-crypto': 'Use AES-256, SHA-256 or stronger algorithms'
    };
    return remediationMap[patternName] || 'Follow security best practices';
  }

  /**
   * Get tool metadata
   */
  getMetadata() {
    return {
      name: this.name,
      description: 'Analyzes Java code against guidelines and detects issues',
      version: '1.0.0',
      parameters: {
        javaCode: 'String - Java source code to analyze (required)',
        filePath: 'String - File path for reporting (optional)',
        guidelines: 'Object - Pre-loaded guidelines (optional)'
      }
    };
  }
}

export default CodeAnalyzer;

// Made with Bob
