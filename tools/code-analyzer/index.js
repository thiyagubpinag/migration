import path from 'path';
import { fileURLToPath } from 'url';
import { DependencyAnalyzer } from './src/dependency-analyzer.js';
import { PatternDetector } from './src/pattern-detector.js';
import { RuleGenerator } from './src/rule-generator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * MCP Tool: IBM Code Analyzer
 * Analyzes legacy codebases and generates modernization recommendations
 */
export const codeAnalyzerTool = {
  name: 'analyze_legacy_code',
  description: 'Analyzes legacy JavaScript code for modernization opportunities. Detects outdated dependencies, deprecated packages, legacy patterns (var, callbacks, etc.), and generates IBM-compliant modernization rules with AI prompts.',
  
  inputSchema: {
    type: 'object',
    properties: {
      projectPath: {
        type: 'string',
        description: 'Absolute or relative path to the legacy project directory to analyze'
      },
      ibmStandardsPath: {
        type: 'string',
        description: 'Path to IBM standards folder (optional, defaults to example-migration-project/ibm-standards)'
      },
      includeAIPrompts: {
        type: 'boolean',
        description: 'Whether to include AI migration prompts in the output (default: true)'
      }
    },
    required: ['projectPath']
  },

  /**
   * Execute the code analysis
   */
  async execute({ projectPath, ibmStandardsPath, includeAIPrompts = true }) {
    try {
      // Resolve paths
      const resolvedProjectPath = path.resolve(projectPath);
      const resolvedStandardsPath = ibmStandardsPath 
        ? path.resolve(ibmStandardsPath)
        : path.resolve(__dirname, '../../example-migration-project/ibm-standards');

      // Step 1: Analyze dependencies
      const dependencyAnalyzer = new DependencyAnalyzer(resolvedStandardsPath);
      const dependencyAnalysis = dependencyAnalyzer.analyzeDependencies(resolvedProjectPath);

      // Step 2: Detect legacy patterns
      const patternDetector = new PatternDetector();
      const patternAnalysis = await patternDetector.analyzeProject(resolvedProjectPath);

      // Step 3: Generate modernization rules
      const ruleGenerator = new RuleGenerator();
      const projectName = path.basename(resolvedProjectPath);
      const rules = ruleGenerator.generateRules(dependencyAnalysis, patternAnalysis, projectName);

      // Build response
      const response = {
        success: true,
        metadata: {
          analyzedAt: new Date().toISOString(),
          project: projectName,
          projectPath: resolvedProjectPath,
          analyzer: 'IBM Code Analyzer v1.0.0'
        },
        summary: {
          totalIssues: dependencyAnalysis.issues.length + patternAnalysis.patterns.length,
          dependencies: {
            total: dependencyAnalysis.totalDependencies,
            deprecated: dependencyAnalysis.summary.deprecated,
            outdated: dependencyAnalysis.summary.outdated,
            securityVulnerabilities: dependencyAnalysis.summary.securityVulnerabilities
          },
          patterns: {
            filesAnalyzed: patternAnalysis.filesAnalyzed,
            totalPatterns: patternAnalysis.patterns.length,
            byCategory: patternAnalysis.summary.byCategory,
            bySeverity: patternAnalysis.summary.bySeverity
          },
          rules: rules.summary
        },
        dependencyIssues: dependencyAnalysis.issues,
        patternIssues: patternAnalysis.patterns.map(p => ({
          id: p.id,
          category: p.category,
          severity: p.severity,
          message: p.message,
          file: p.file,
          occurrences: p.matchCount,
          legacy_pattern: p.legacy_pattern,
          modern_replacement: p.modern_replacement,
          examples: p.examples
        })),
        modernizationRules: {
          dependencyRules: rules.dependencyRules,
          patternRules: rules.patternRules
        },
        recommendations: this.generatePrioritizedRecommendations(rules)
      };

      // Include AI prompts if requested
      if (includeAIPrompts) {
        response.aiPrompts = rules.aiPrompts;
      }

      return response;

    } catch (error) {
      return {
        success: false,
        error: error.message,
        stack: error.stack
      };
    }
  },

  /**
   * Generate prioritized recommendations
   */
  generatePrioritizedRecommendations(rules) {
    const allRules = [...rules.dependencyRules, ...rules.patternRules];
    
    const sortedRules = allRules.sort((a, b) => {
      const severityOrder = { critical: 0, error: 1, warning: 2, info: 3 };
      return (severityOrder[a.severity] || 4) - (severityOrder[b.severity] || 4);
    });

    return {
      immediate: sortedRules.filter(r => r.severity === 'critical').slice(0, 5).map(r => ({
        id: r.id,
        message: r.message,
        action: r.action || 'review',
        priority: 'critical'
      })),
      highPriority: sortedRules.filter(r => r.severity === 'error').slice(0, 10).map(r => ({
        id: r.id,
        message: r.message,
        action: r.action || 'review',
        priority: 'high'
      })),
      medium: sortedRules.filter(r => r.severity === 'warning').slice(0, 10).map(r => ({
        id: r.id,
        message: r.message,
        priority: 'medium'
      })),
      low: sortedRules.filter(r => r.severity === 'info').slice(0, 10).map(r => ({
        id: r.id,
        message: r.message,
        priority: 'low'
      }))
    };
  }
};

/**
 * MCP Tool: Get Modernization Rule Details
 * Retrieves detailed information about a specific modernization rule
 */
export const getRuleDetailsTool = {
  name: 'get_modernization_rule',
  description: 'Get detailed information about a specific modernization rule including examples, affected files, and migration steps.',
  
  inputSchema: {
    type: 'object',
    properties: {
      ruleId: {
        type: 'string',
        description: 'The ID of the modernization rule to retrieve'
      },
      projectPath: {
        type: 'string',
        description: 'Path to the project (required for pattern rules to show file locations)'
      }
    },
    required: ['ruleId', 'projectPath']
  },

  async execute({ ruleId, projectPath }) {
    try {
      const resolvedProjectPath = path.resolve(projectPath);
      const resolvedStandardsPath = path.resolve(__dirname, '../../example-migration-project/ibm-standards');

      // Run analysis to get rules
      const dependencyAnalyzer = new DependencyAnalyzer(resolvedStandardsPath);
      const dependencyAnalysis = dependencyAnalyzer.analyzeDependencies(resolvedProjectPath);

      const patternDetector = new PatternDetector();
      const patternAnalysis = await patternDetector.analyzeProject(resolvedProjectPath);

      const ruleGenerator = new RuleGenerator();
      const projectName = path.basename(resolvedProjectPath);
      const rules = ruleGenerator.generateRules(dependencyAnalysis, patternAnalysis, projectName);

      // Find the rule
      const allRules = [...rules.dependencyRules, ...rules.patternRules];
      const rule = allRules.find(r => r.id === ruleId);

      if (!rule) {
        return {
          success: false,
          error: `Rule with ID "${ruleId}" not found`
        };
      }

      return {
        success: true,
        rule: {
          ...rule,
          migrationSteps: this.generateMigrationSteps(rule),
          estimatedTime: this.estimateMigrationTime(rule),
          testingRequirements: this.getTestingRequirements(rule)
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  generateMigrationSteps(rule) {
    const steps = [];

    if (rule.category === 'dependency-modernization' || rule.category === 'dependency-update') {
      steps.push(
        '1. Update package.json with new version/package',
        '2. Run npm install to update dependencies',
        '3. Update import/require statements if package name changed',
        '4. Refactor code to use new API if needed',
        '5. Run tests to verify functionality',
        '6. Update documentation'
      );
    } else if (rule.category.includes('async')) {
      steps.push(
        '1. Identify all callback-based functions',
        '2. Convert to async/await syntax',
        '3. Update error handling with try/catch',
        '4. Test async flow thoroughly',
        '5. Update function signatures and documentation'
      );
    } else {
      steps.push(
        '1. Locate all occurrences of the legacy pattern',
        '2. Apply modern replacement systematically',
        '3. Verify no breaking changes',
        '4. Run tests',
        '5. Update code comments'
      );
    }

    return steps;
  },

  estimateMigrationTime(rule) {
    const effort = rule.estimatedEffort || 'medium';
    const occurrences = rule.occurrences || 1;

    const baseTime = {
      low: 15,
      medium: 30,
      high: 60
    };

    const minutes = baseTime[effort] * Math.min(occurrences, 10);
    
    if (minutes < 60) {
      return `${minutes} minutes`;
    } else {
      return `${Math.round(minutes / 60)} hours`;
    }
  },

  getTestingRequirements(rule) {
    const requirements = ['Unit tests for affected functions'];

    if (rule.category.includes('dependency')) {
      requirements.push('Integration tests for API changes');
      requirements.push('Regression tests for existing functionality');
    }

    if (rule.severity === 'critical' || rule.severity === 'error') {
      requirements.push('Full test suite execution');
      requirements.push('Manual testing of critical paths');
    }

    return requirements;
  }
};

// Export all tools
export default {
  tools: [codeAnalyzerTool, getRuleDetailsTool]
};

// Made with Bob
