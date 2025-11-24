/**
 * Code Migrator Tool - MCP Tool for applying approved migration changes
 * Uses AI prompts to migrate legacy code to modern version
 */

import { CodeMigrator } from '../migration/code-migrator.js';
import { createWatsonxModel } from '../../config/model-config.js';
import fs from 'fs/promises';
import path from 'path';

export class CodeMigratorTool {
  constructor(customConfig = {}) {
    this.name = "code-migrator";
    this.model = createWatsonxModel(customConfig);
    this.migrator = null;
    this.logger = this.createLogger();
  }

  /**
   * Initialize the migrator tool
   */
  async initialize() {
    this.migrator = new CodeMigrator(this.logger);
    this.logger.info('Code Migrator Tool initialized');
  }

  /**
   * Execute code migration
   * @param {Object} params - Tool parameters
   * @param {string} params.legacyFile - Path to legacy file to migrate
   * @param {Object} params.migrationPlan - Approved migration plan from code-recommendation-tool
   * @param {boolean} params.dryRun - If true, preview changes without applying
   * @param {boolean} params.useAI - Use AI to enhance migration (default: true)
   * @param {string} params.modernFile - Path to modern reference file (for AI context)
   * @returns {Promise<Object>} Migration results
   */
  async execute(params) {
    try {
      if (!this.migrator) {
        await this.initialize();
      }

      const { 
        legacyFile, 
        migrationPlan, 
        dryRun = false, 
        useAI = true,
        modernFile 
      } = params;

      if (!legacyFile) {
        throw new Error('legacyFile parameter is required');
      }

      if (!migrationPlan) {
        throw new Error('migrationPlan parameter is required. Run code-recommendation-tool first.');
      }

      this.logger.info(`Starting migration for: ${legacyFile}`, { dryRun, useAI });

      // Load legacy code
      const legacyCode = await fs.readFile(legacyFile, 'utf-8');

      // Enhance migration plan with AI if requested
      let enhancedPlan = migrationPlan;
      if (useAI && modernFile) {
        this.logger.info('Enhancing migration with AI...');
        enhancedPlan = await this.enhanceMigrationWithAI(
          legacyCode,
          migrationPlan,
          modernFile
        );
      }

      // Apply migration
      this.logger.info('Applying migration changes...');
      const migrationResult = await this.migrator.applyMigration(
        legacyFile,
        enhancedPlan,
        dryRun
      );

      // Generate comprehensive report
      const report = this.migrator.generateReport(migrationResult);

      // Validate migrated code
      let validation = null;
      if (migrationResult.success && migrationResult.migratedCode) {
        validation = this.migrator.validateMigratedCode(migrationResult.migratedCode);
      }

      const result = {
        success: migrationResult.success,
        tool: this.name,
        action: 'migrate',
        legacyFile,
        dryRun,
        migrationResult,
        validation,
        report,
        message: dryRun
          ? `Dry run completed: ${migrationResult.changesApplied} changes would be applied`
          : `Migration completed: ${migrationResult.changesApplied} changes applied`
      };

      if (dryRun) {
        result.nextStep = 'Review the changes and run again with dryRun=false to apply';
      } else if (migrationResult.success) {
        result.nextStep = 'Run lint tool to verify code quality, then validate tool to test functionality';
        result.backupCreated = true;
      }

      return result;
    } catch (error) {
      this.logger.error('Migration failed', { error: error.message });
      return {
        success: false,
        tool: this.name,
        error: error.message,
        stack: error.stack
      };
    }
  }

  /**
   * Enhance migration plan with AI
   * @param {string} legacyCode - Legacy code content
   * @param {Object} migrationPlan - Original migration plan
   * @param {string} modernFile - Path to modern reference file
   * @returns {Promise<Object>} Enhanced migration plan
   */
  async enhanceMigrationWithAI(legacyCode, migrationPlan, modernFile) {
    try {
      const modernCode = await fs.readFile(modernFile, 'utf-8');
      
      const prompt = this.buildEnhancementPrompt(legacyCode, modernCode, migrationPlan);
      
      this.logger.info('Requesting AI enhancement...');
      const startTime = Date.now();
      
      // Create timeout promise (2 minutes)
      const timeoutMs = 120000;
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error(`AI enhancement timeout after ${timeoutMs}ms`));
        }, timeoutMs);
      });
      
      // Race between AI call and timeout
      const response = await Promise.race([
        this.model.invoke(prompt),
        timeoutPromise
      ]);
      
      const duration = Date.now() - startTime;
      this.logger.info(`AI enhancement completed in ${duration}ms`);
      
      // Parse AI response and merge with original plan
      const aiEnhancements = this.parseAIEnhancements(response.content);
      return this.mergeMigrationPlans(migrationPlan, aiEnhancements);
      
    } catch (error) {
      this.logger.warn('AI enhancement failed, using original plan', { error: error.message });
      return migrationPlan;
    }
  }

  /**
   * Build AI enhancement prompt
   * @param {string} legacyCode - Legacy code
   * @param {string} modernCode - Modern code
   * @param {Object} migrationPlan - Migration plan
   * @returns {string} Formatted prompt
   */
  buildEnhancementPrompt(legacyCode, modernCode, migrationPlan) {
    return `You are an expert code migration specialist. Enhance the migration plan with specific code transformations.

LEGACY CODE:
\`\`\`javascript
${legacyCode}
\`\`\`

MODERN CODE TARGET:
\`\`\`javascript
${modernCode}
\`\`\`

CURRENT MIGRATION PLAN:
${JSON.stringify(migrationPlan.summary, null, 2)}

TASK: Provide specific code transformation examples for each migration phase. For each step, provide:
1. Exact code snippets to find (before)
2. Exact replacement code (after)
3. Line-by-line transformation instructions

Format as JSON:
{
  "enhancements": [
    {
      "phase": "phase name",
      "step": "step title",
      "transformations": [
        {
          "before": "exact code to find",
          "after": "exact replacement code",
          "description": "what this changes"
        }
      ]
    }
  ]
}

Focus on practical, executable transformations that can be applied automatically.`;
  }

  /**
   * Parse AI enhancements
   * @param {string} response - AI response
   * @returns {Object} Parsed enhancements
   */
  parseAIEnhancements(response) {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return { enhancements: [] };
    } catch (error) {
      this.logger.warn('Failed to parse AI enhancements', { error: error.message });
      return { enhancements: [] };
    }
  }

  /**
   * Merge migration plans
   * @param {Object} originalPlan - Original plan
   * @param {Object} aiEnhancements - AI enhancements
   * @returns {Object} Merged plan
   */
  mergeMigrationPlans(originalPlan, aiEnhancements) {
    const mergedPlan = JSON.parse(JSON.stringify(originalPlan)); // Deep clone
    
    if (aiEnhancements.enhancements && aiEnhancements.enhancements.length > 0) {
      // Add AI transformations to corresponding phases
      aiEnhancements.enhancements.forEach(enhancement => {
        const phase = mergedPlan.phases.find(p => p.name === enhancement.phase);
        if (phase) {
          const step = phase.steps.find(s => s.title === enhancement.step);
          if (step && enhancement.transformations) {
            step.aiTransformations = enhancement.transformations;
          }
        }
      });
    }
    
    return mergedPlan;
  }

  /**
   * Create simple logger
   * @returns {Object} Logger instance
   */
  createLogger() {
    return {
      debug: (msg, meta) => console.log(`[DEBUG] [CodeMigrator] ${msg}`, meta || ''),
      info: (msg, meta) => console.log(`[INFO] [CodeMigrator] ${msg}`, meta || ''),
      warn: (msg, meta) => console.warn(`[WARN] [CodeMigrator] ${msg}`, meta || ''),
      error: (msg, meta) => console.error(`[ERROR] [CodeMigrator] ${msg}`, meta || '')
    };
  }

  /**
   * Get tool metadata
   * @returns {Object} Tool metadata
   */
  getMetadata() {
    return {
      name: this.name,
      description: "Uses AI prompts to apply approved migration changes and migrate legacy code to modern version",
      version: "1.0.0",
      capabilities: [
        "Apply approved migration plans to legacy code",
        "Use AI to enhance transformations with specific code examples",
        "Create automatic backups before migration",
        "Support dry-run mode for previewing changes",
        "Generate detailed diff reports",
        "Validate migrated code",
        "Apply pattern-based transformations",
        "Handle syntax, async, module, and security migrations"
      ],
      parameters: {
        legacyFile: {
          type: "string",
          required: true,
          description: "Path to the legacy file to migrate"
        },
        migrationPlan: {
          type: "object",
          required: true,
          description: "Approved migration plan from code-recommendation-tool"
        },
        dryRun: {
          type: "boolean",
          required: false,
          default: false,
          description: "Preview changes without applying them"
        },
        useAI: {
          type: "boolean",
          required: false,
          default: true,
          description: "Use AI to enhance migration with specific transformations"
        },
        modernFile: {
          type: "string",
          required: false,
          description: "Path to modern reference file (required if useAI is true)"
        }
      }
    };
  }
}

export default CodeMigratorTool;

// Made with Bob
