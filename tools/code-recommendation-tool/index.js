/**
 * Code Recommendation Tool - MCP Tool for generating AI-powered migration recommendations
 * Uses IBM Watsonx AI, modern codebase, and IBM modernization rules
 */

import { CodeAnalyzer } from '../migration/code-analyzer.js';
import { AIRecommender } from '../migration/ai-recommender.js';
import fs from 'fs/promises';
import path from 'path';

export class CodeRecommendationTool {
  constructor(customConfig = {}) {
    this.name = "code-recommendation";
    this.rulesConfig = null;
    this.analyzer = null;
    this.recommender = null;
    this.logger = this.createLogger();
  }

  /**
   * Initialize the recommendation tool
   */
  async initialize() {
    // Load IBM modernization rules
    const rulesPath = path.join(process.cwd(), 'config', 'ibm-modernization-rules.json');
    const rulesContent = await fs.readFile(rulesPath, 'utf-8');
    this.rulesConfig = JSON.parse(rulesContent);

    // Initialize components
    this.analyzer = new CodeAnalyzer(this.rulesConfig);
    this.recommender = new AIRecommender();

    this.logger.info('Code Recommendation Tool initialized');
  }

  /**
   * Execute recommendation generation
   * @param {Object} params - Tool parameters
   * @param {string} params.legacyFile - Path to legacy file
   * @param {string} params.modernFile - Path to IBM-approved modern reference file
   * @param {Object} params.analysis - Pre-computed analysis (optional, will analyze if not provided)
   * @param {boolean} params.requireApproval - Wait for user approval before proceeding
   * @returns {Promise<Object>} Recommendations and migration plan
   */
  async execute(params) {
    try {
      if (!this.analyzer) {
        await this.initialize();
      }

      const { legacyFile, modernFile, analysis: preAnalysis, requireApproval = true } = params;

      if (!legacyFile) {
        throw new Error('legacyFile parameter is required');
      }

      if (!modernFile) {
        throw new Error('modernFile parameter is required for generating recommendations');
      }

      this.logger.info(`Generating recommendations for: ${legacyFile}`);

      // Use provided analysis or perform new analysis
      let analysis;
      if (preAnalysis) {
        analysis = preAnalysis;
        this.logger.info('Using pre-computed analysis');
      } else {
        this.logger.info('Performing code analysis...');
        analysis = await this.analyzer.analyzeFile(legacyFile, modernFile);
      }

      // Load code content
      const legacyCode = await fs.readFile(legacyFile, 'utf-8');
      const modernCode = await fs.readFile(modernFile, 'utf-8');

      // Generate AI recommendations
      this.logger.info('Generating AI-powered recommendations...');
      const aiRecommendations = await this.recommender.generateRecommendations(
        analysis,
        legacyCode,
        modernCode
      );

      // Generate migration plan
      this.logger.info('Creating migration plan...');
      const migrationPlan = this.recommender.generateMigrationPlan(
        aiRecommendations.recommendations,
        analysis
      );

      // Generate detailed report
      const report = this.generateRecommendationReport(
        analysis,
        aiRecommendations,
        migrationPlan
      );

      const result = {
        success: true,
        tool: this.name,
        action: 'recommend',
        legacyFile,
        modernFile,
        analysis,
        aiRecommendations,
        migrationPlan,
        report,
        message: `Generated ${migrationPlan.summary.totalSteps} migration steps`,
        requiresApproval: requireApproval
      };

      if (requireApproval) {
        result.approvalMessage = this.generateApprovalMessage(migrationPlan);
        result.nextStep = 'Review the recommendations and approve to proceed with code-migrator-tool';
      } else {
        result.nextStep = 'Use code-migrator-tool to apply the migration';
      }

      return result;
    } catch (error) {
      this.logger.error('Recommendation generation failed', { error: error.message });
      return {
        success: false,
        tool: this.name,
        error: error.message,
        stack: error.stack
      };
    }
  }

  /**
   * Generate detailed recommendation report
   * @param {Object} analysis - Code analysis
   * @param {Object} aiRecommendations - AI recommendations
   * @param {Object} migrationPlan - Migration plan
   * @returns {string} Formatted report
   */
  generateRecommendationReport(analysis, aiRecommendations, migrationPlan) {
    let report = `\n${'='.repeat(80)}\n`;
    report += `AI-POWERED MIGRATION RECOMMENDATIONS\n`;
    report += `${'='.repeat(80)}\n\n`;

    // Summary
    report += `MIGRATION SUMMARY:\n`;
    report += `  Total Steps: ${migrationPlan.summary.totalSteps}\n`;
    report += `  Estimated Effort: ${migrationPlan.summary.estimatedEffort}\n`;
    report += `  Complexity: ${migrationPlan.summary.complexity}\n`;
    report += `  Breaking Changes: ${migrationPlan.summary.breakingChanges}\n`;
    report += `  AI Confidence: ${(aiRecommendations.confidence * 100).toFixed(1)}%\n\n`;

    // Migration Phases
    report += `MIGRATION PHASES:\n`;
    migrationPlan.phases.forEach((phase, i) => {
      report += `\n${i + 1}. ${phase.name.toUpperCase()} (${phase.stepCount} steps)\n`;
      phase.steps.forEach((step, j) => {
        report += `   ${j + 1}. ${step.title}\n`;
        if (step.description) {
          report += `      ${step.description.substring(0, 100)}${step.description.length > 100 ? '...' : ''}\n`;
        }
        if (step.effort) {
          report += `      Effort: ${step.effort}\n`;
        }
      });
    });
    report += `\n`;

    // Risks and Breaking Changes
    if (migrationPlan.risks.length > 0) {
      report += `RISKS & BREAKING CHANGES:\n`;
      migrationPlan.risks.forEach((risk, i) => {
        report += `  ${i + 1}. ${risk}\n`;
      });
      report += `\n`;
    }

    // Testing Strategy
    if (migrationPlan.testing.length > 0) {
      report += `TESTING STRATEGY:\n`;
      migrationPlan.testing.forEach((test, i) => {
        report += `  ${i + 1}. ${test}\n`;
      });
      report += `\n`;
    }

    // Success Criteria
    if (migrationPlan.successCriteria.length > 0) {
      report += `SUCCESS CRITERIA:\n`;
      migrationPlan.successCriteria.forEach((criteria, i) => {
        report += `  ${i + 1}. ${criteria}\n`;
      });
      report += `\n`;
    }

    // Rollback Plan
    if (migrationPlan.rollbackPlan.length > 0) {
      report += `ROLLBACK PLAN:\n`;
      migrationPlan.rollbackPlan.forEach((step, i) => {
        report += `  ${i + 1}. ${step}\n`;
      });
      report += `\n`;
    }

    report += `${'='.repeat(80)}\n`;
    return report;
  }

  /**
   * Generate approval message
   * @param {Object} migrationPlan - Migration plan
   * @returns {string} Approval message
   */
  generateApprovalMessage(migrationPlan) {
    let message = `\n${'*'.repeat(80)}\n`;
    message += `APPROVAL REQUIRED\n`;
    message += `${'*'.repeat(80)}\n\n`;
    message += `Please review the migration plan above.\n\n`;
    message += `Summary:\n`;
    message += `  - ${migrationPlan.summary.totalSteps} migration steps\n`;
    message += `  - Estimated effort: ${migrationPlan.summary.estimatedEffort}\n`;
    message += `  - Complexity: ${migrationPlan.summary.complexity}\n`;
    message += `  - Breaking changes: ${migrationPlan.summary.breakingChanges}\n\n`;
    
    if (migrationPlan.summary.breakingChanges > 0) {
      message += `⚠️  WARNING: This migration includes ${migrationPlan.summary.breakingChanges} breaking changes.\n`;
      message += `Please review the risks section carefully.\n\n`;
    }
    
    message += `To proceed with migration:\n`;
    message += `  1. Review all recommendations and risks\n`;
    message += `  2. Ensure you have backups of the code\n`;
    message += `  3. Approve and run code-migrator-tool\n\n`;
    message += `${'*'.repeat(80)}\n`;
    
    return message;
  }

  /**
   * Create simple logger
   * @returns {Object} Logger instance
   */
  createLogger() {
    return {
      debug: (msg, meta) => console.log(`[DEBUG] [CodeRecommendation] ${msg}`, meta || ''),
      info: (msg, meta) => console.log(`[INFO] [CodeRecommendation] ${msg}`, meta || ''),
      warn: (msg, meta) => console.warn(`[WARN] [CodeRecommendation] ${msg}`, meta || ''),
      error: (msg, meta) => console.error(`[ERROR] [CodeRecommendation] ${msg}`, meta || '')
    };
  }

  /**
   * Get tool metadata
   * @returns {Object} Tool metadata
   */
  getMetadata() {
    return {
      name: this.name,
      description: "Uses AI prompts, modern codebase, and IBM modernization rules to generate detailed migration recommendations",
      version: "1.0.0",
      capabilities: [
        "Generate AI-powered migration recommendations using IBM Watsonx",
        "Compare legacy code with IBM-approved modern patterns",
        "Create detailed migration plans with phases",
        "Identify risks and breaking changes",
        "Provide testing strategies and success criteria",
        "Generate rollback plans",
        "Present recommendations for user approval"
      ],
      parameters: {
        legacyFile: {
          type: "string",
          required: true,
          description: "Path to the legacy file to migrate"
        },
        modernFile: {
          type: "string",
          required: true,
          description: "Path to IBM-approved modern reference file"
        },
        analysis: {
          type: "object",
          required: false,
          description: "Pre-computed analysis from code-analyzer-tool"
        },
        requireApproval: {
          type: "boolean",
          required: false,
          default: true,
          description: "Wait for user approval before proceeding to migration"
        }
      }
    };
  }
}

export default CodeRecommendationTool;

// Made with Bob
