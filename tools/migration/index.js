import { createWatsonxModel } from "../../config/model-config.js";
import { CodeAnalyzer } from "./code-analyzer.js";
import { AIRecommender } from "./ai-recommender.js";
import { CodeMigrator } from "./code-migrator.js";
import fs from 'fs/promises';
import path from 'path';

/**
 * Enhanced Migration MCP Tool Module
 * AI-driven code migration with IBM standards
 */
export class MigrationTool {
  constructor(customConfig = {}) {
    this.model = createWatsonxModel(customConfig);
    this.name = "migration";
    this.rulesConfig = null;
    this.analyzer = null;
    this.recommender = null;
    this.migrator = null;
    this.logger = this.createLogger();
  }

  /**
   * Initialize the migration tool
   */
  async initialize() {
    // Load IBM modernization rules
    const rulesPath = path.join(process.cwd(), 'config', 'ibm-modernization-rules.json');
    const rulesContent = await fs.readFile(rulesPath, 'utf-8');
    this.rulesConfig = JSON.parse(rulesContent);

    // Initialize components
    this.analyzer = new CodeAnalyzer(this.rulesConfig);
    this.recommender = new AIRecommender();
    this.migrator = new CodeMigrator(this.logger);

    this.logger.info('Migration tool initialized');
  }

  /**
   * Execute migration tool
   * @param {Object} params - Tool parameters
   * @param {string} params.action - Action to perform (scan, recommend, migrate)
   * @param {string} params.legacyFile - Path to legacy file
   * @param {string} params.modernFile - Path to IBM-approved modern file
   * @param {boolean} params.dryRun - Dry run mode
   * @param {boolean} params.autoApply - Auto-apply changes after approval
   * @returns {Promise<Object>} Tool execution result
   */
  async execute(params) {
    try {
      if (!this.analyzer) {
        await this.initialize();
      }

      const { action = 'scan', legacyFile, modernFile, dryRun = true, autoApply = false } = params;

      this.logger.info(`Executing migration action: ${action}`, { legacyFile, modernFile });

      switch (action) {
        case 'scan':
          return await this.scanLegacyCode(legacyFile, modernFile);
        
        case 'recommend':
          return await this.generateRecommendations(legacyFile, modernFile);
        
        case 'migrate':
          return await this.performMigration(legacyFile, modernFile, dryRun, autoApply);
        
        case 'full':
          return await this.fullMigrationWorkflow(legacyFile, modernFile, dryRun, autoApply);
        
        default:
          throw new Error(`Unknown action: ${action}`);
      }
    } catch (error) {
      this.logger.error('Migration execution failed', { error: error.message });
      return {
        success: false,
        tool: this.name,
        error: error.message,
        stack: error.stack
      };
    }
  }

  /**
   * Scan legacy code and identify issues
   * @param {string} legacyFile - Path to legacy file
   * @param {string} modernFile - Path to modern reference file
   * @returns {Promise<Object>} Scan results
   */
  async scanLegacyCode(legacyFile, modernFile) {
    this.logger.info('Scanning legacy code', { legacyFile });

    const analysis = await this.analyzer.analyzeFile(legacyFile, modernFile);
    const summary = this.analyzer.generateSummary(analysis);

    return {
      success: true,
      tool: this.name,
      action: 'scan',
      analysis,
      summary,
      message: `Found ${analysis.totalIssues} issues in ${legacyFile}`
    };
  }

  /**
   * Generate AI-powered recommendations
   * @param {string} legacyFile - Path to legacy file
   * @param {string} modernFile - Path to modern reference file
   * @returns {Promise<Object>} Recommendations
   */
  async generateRecommendations(legacyFile, modernFile) {
    this.logger.info('Generating AI recommendations', { legacyFile });

    // First scan the code
    const analysis = await this.analyzer.analyzeFile(legacyFile, modernFile);
    
    // Load code content
    const legacyCode = await fs.readFile(legacyFile, 'utf-8');
    const modernCode = modernFile ? await fs.readFile(modernFile, 'utf-8') : '';

    // Generate AI recommendations
    const aiRecommendations = await this.recommender.generateRecommendations(
      analysis,
      legacyCode,
      modernCode
    );

    // Generate migration plan
    const migrationPlan = this.recommender.generateMigrationPlan(
      aiRecommendations.recommendations,
      analysis
    );

    return {
      success: true,
      tool: this.name,
      action: 'recommend',
      analysis,
      aiRecommendations,
      migrationPlan,
      message: `Generated ${migrationPlan.summary.totalSteps} migration steps`
    };
  }

  /**
   * Perform migration
   * @param {string} legacyFile - Path to legacy file
   * @param {string} modernFile - Path to modern reference file
   * @param {boolean} dryRun - Dry run mode
   * @param {boolean} autoApply - Auto-apply changes
   * @returns {Promise<Object>} Migration results
   */
  async performMigration(legacyFile, modernFile, dryRun = true, autoApply = false) {
    this.logger.info('Performing migration', { legacyFile, dryRun, autoApply });

    // Generate recommendations first
    const recommendations = await this.generateRecommendations(legacyFile, modernFile);

    if (!recommendations.success) {
      return recommendations;
    }

    // Apply migration
    const migrationResult = await this.migrator.applyMigration(
      legacyFile,
      recommendations.migrationPlan,
      dryRun
    );

    // Generate report
    const report = this.migrator.generateReport(migrationResult);

    return {
      success: migrationResult.success,
      tool: this.name,
      action: 'migrate',
      dryRun,
      migrationResult,
      report,
      message: dryRun
        ? `Dry run completed: ${migrationResult.changesApplied} changes would be applied`
        : `Migration completed: ${migrationResult.changesApplied} changes applied`
    };
  }

  /**
   * Full migration workflow with approval
   * @param {string} legacyFile - Path to legacy file
   * @param {string} modernFile - Path to modern reference file
   * @param {boolean} dryRun - Dry run mode
   * @param {boolean} autoApply - Auto-apply changes
   * @returns {Promise<Object>} Complete workflow results
   */
  async fullMigrationWorkflow(legacyFile, modernFile, dryRun = true, autoApply = false) {
    this.logger.info('Starting full migration workflow', { legacyFile });

    const workflow = {
      steps: [],
      startTime: new Date().toISOString()
    };

    // Step 1: Scan
    this.logger.info('Step 1: Scanning legacy code');
    const scanResult = await this.scanLegacyCode(legacyFile, modernFile);
    workflow.steps.push({ step: 'scan', result: scanResult, timestamp: new Date().toISOString() });

    if (!scanResult.success) {
      return { success: false, workflow, error: 'Scan failed' };
    }

    // Step 2: Generate recommendations
    this.logger.info('Step 2: Generating AI recommendations');
    const recommendResult = await this.generateRecommendations(legacyFile, modernFile);
    workflow.steps.push({ step: 'recommend', result: recommendResult, timestamp: new Date().toISOString() });

    if (!recommendResult.success) {
      return { success: false, workflow, error: 'Recommendation generation failed' };
    }

    // Step 3: Request approval (simulated)
    this.logger.info('Step 3: Requesting approval');
    const approval = await this.requestApproval(recommendResult.migrationPlan, autoApply);
    workflow.steps.push({ step: 'approval', result: approval, timestamp: new Date().toISOString() });

    if (!approval.approved) {
      return {
        success: true,
        workflow,
        message: 'Migration workflow completed. Awaiting user approval.',
        requiresApproval: true,
        migrationPlan: recommendResult.migrationPlan
      };
    }

    // Step 4: Apply migration
    this.logger.info('Step 4: Applying migration');
    const migrateResult = await this.performMigration(legacyFile, modernFile, dryRun, true);
    workflow.steps.push({ step: 'migrate', result: migrateResult, timestamp: new Date().toISOString() });

    workflow.endTime = new Date().toISOString();

    return {
      success: true,
      tool: this.name,
      action: 'full',
      workflow,
      message: dryRun
        ? 'Full workflow completed in dry-run mode'
        : 'Full migration workflow completed successfully'
    };
  }

  /**
   * Request approval for migration
   * @param {Object} migrationPlan - Migration plan
   * @param {boolean} autoApply - Auto-approve
   * @returns {Promise<Object>} Approval result
   */
  async requestApproval(migrationPlan, autoApply = false) {
    if (autoApply) {
      this.logger.info('Auto-approval enabled');
      return {
        approved: true,
        method: 'auto',
        timestamp: new Date().toISOString()
      };
    }

    // In a real implementation, this would prompt the user
    this.logger.info('Manual approval required');
    return {
      approved: false,
      method: 'manual',
      message: 'Please review the migration plan and approve to proceed',
      migrationPlan: {
        totalSteps: migrationPlan.summary.totalSteps,
        estimatedEffort: migrationPlan.summary.estimatedEffort,
        breakingChanges: migrationPlan.summary.breakingChanges
      }
    };
  }

  /**
   * Create simple logger
   * @returns {Object} Logger instance
   */
  createLogger() {
    return {
      debug: (msg, meta) => console.log(`[DEBUG] ${msg}`, meta || ''),
      info: (msg, meta) => console.log(`[INFO] ${msg}`, meta || ''),
      warn: (msg, meta) => console.warn(`[WARN] ${msg}`, meta || ''),
      error: (msg, meta) => console.error(`[ERROR] ${msg}`, meta || '')
    };
  }

  /**
   * Get tool metadata
   * @returns {Object} Tool metadata
   */
  getMetadata() {
    return {
      name: this.name,
      description: "AI-driven code migration tool with IBM standards integration",
      version: "2.0.0",
      capabilities: [
        "Scan legacy code against IBM modernization rules",
        "Generate AI-powered migration recommendations",
        "Compare with IBM-approved modern code",
        "Apply automated code transformations",
        "Generate detailed migration reports",
        "Support approval workflow"
      ],
      actions: [
        { name: 'scan', description: 'Scan legacy code and identify issues' },
        { name: 'recommend', description: 'Generate AI-powered recommendations' },
        { name: 'migrate', description: 'Apply migration changes' },
        { name: 'full', description: 'Complete migration workflow with approval' }
      ]
    };
  }
}

export default MigrationTool;
