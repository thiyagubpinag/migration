/**
 * Code Analyzer Tool - MCP Tool for scanning and analyzing legacy code
 * Identifies outdated patterns, security issues, and areas requiring modernization
 */

import { CodeAnalyzer } from '../migration/code-analyzer.js';
import fs from 'fs/promises';
import path from 'path';

export class CodeAnalyzerTool {
  constructor(customConfig = {}) {
    this.name = "code-analyzer";
    this.rulesConfig = null;
    this.analyzer = null;
    this.logger = this.createLogger();
  }

  /**
   * Initialize the analyzer tool
   */
  async initialize() {
    // Load IBM modernization rules
    const rulesPath = path.join(process.cwd(), 'config', 'ibm-modernization-rules.json');
    const rulesContent = await fs.readFile(rulesPath, 'utf-8');
    this.rulesConfig = JSON.parse(rulesContent);

    // Initialize analyzer
    this.analyzer = new CodeAnalyzer(this.rulesConfig);

    this.logger.info('Code Analyzer Tool initialized');
  }

  /**
   * Execute code analysis
   * @param {Object} params - Tool parameters
   * @param {string} params.legacyFile - Path to legacy file to analyze
   * @param {string} params.modernFile - Path to IBM-approved modern reference file (optional)
   * @param {boolean} params.detailed - Include detailed analysis
   * @returns {Promise<Object>} Analysis results
   */
  async execute(params) {
    try {
      if (!this.analyzer) {
        await this.initialize();
      }

      const { legacyFile, modernFile, detailed = true } = params;

      if (!legacyFile) {
        throw new Error('legacyFile parameter is required');
      }

      this.logger.info(`Analyzing legacy code: ${legacyFile}`);

      // Perform analysis
      const analysis = await this.analyzer.analyzeFile(legacyFile, modernFile);
      const summary = this.analyzer.generateSummary(analysis);

      // Generate detailed report
      const report = this.generateAnalysisReport(analysis, summary, detailed);

      return {
        success: true,
        tool: this.name,
        action: 'analyze',
        analysis,
        summary,
        report,
        message: `Analysis complete: Found ${analysis.totalIssues} issues in ${legacyFile}`,
        nextStep: 'Use code-recommendation-tool to generate migration recommendations'
      };
    } catch (error) {
      this.logger.error('Code analysis failed', { error: error.message });
      return {
        success: false,
        tool: this.name,
        error: error.message,
        stack: error.stack
      };
    }
  }

  /**
   * Generate detailed analysis report
   * @param {Object} analysis - Analysis results
   * @param {Object} summary - Analysis summary
   * @param {boolean} detailed - Include detailed information
   * @returns {string} Formatted report
   */
  generateAnalysisReport(analysis, summary, detailed) {
    let report = `\n${'='.repeat(80)}\n`;
    report += `CODE ANALYSIS REPORT\n`;
    report += `${'='.repeat(80)}\n\n`;

    report += `File: ${analysis.filePath}\n`;
    report += `Total Issues: ${analysis.totalIssues}\n`;
    report += `Priority Score: ${summary.priorityScore}/100\n`;
    report += `Migration Urgency: ${summary.migrationUrgency.toUpperCase()}\n`;
    report += `Estimated Effort: ${summary.estimatedEffort}\n\n`;

    // Issues by severity
    report += `ISSUES BY SEVERITY:\n`;
    for (const [severity, issues] of Object.entries(analysis.issuesBySeverity)) {
      report += `  ${severity.toUpperCase()}: ${issues.length}\n`;
    }
    report += `\n`;

    // Recommendations
    if (analysis.recommendations.length > 0) {
      report += `MODERNIZATION RECOMMENDATIONS (${analysis.recommendations.length}):\n`;
      analysis.recommendations.forEach((rec, i) => {
        report += `\n${i + 1}. [${rec.priority.toUpperCase()}] ${rec.description}\n`;
        report += `   Type: ${rec.type}\n`;
        report += `   Details: ${rec.details}\n`;
      });
      report += `\n`;
    }

    // Detailed issues
    if (detailed && analysis.totalIssues > 0) {
      report += `DETAILED ISSUES:\n`;
      for (const [severity, issues] of Object.entries(analysis.issuesBySeverity)) {
        if (issues.length > 0) {
          report += `\n${severity.toUpperCase()} Issues:\n`;
          issues.slice(0, 10).forEach((issue, i) => {
            report += `\n  ${i + 1}. Line ${issue.line}: ${issue.description}\n`;
            report += `     Code: ${issue.code}\n`;
            report += `     Suggestion: ${issue.suggestion}\n`;
            report += `     Rationale: ${issue.rationale}\n`;
          });
          if (issues.length > 10) {
            report += `\n  ... and ${issues.length - 10} more ${severity} issues\n`;
          }
        }
      }
    }

    report += `\n${'='.repeat(80)}\n`;
    report += `NEXT STEP: Run code-recommendation-tool to get AI-powered migration plan\n`;
    report += `${'='.repeat(80)}\n`;

    return report;
  }

  /**
   * Create simple logger
   * @returns {Object} Logger instance
   */
  createLogger() {
    return {
      debug: (msg, meta) => console.log(`[DEBUG] [CodeAnalyzer] ${msg}`, meta || ''),
      info: (msg, meta) => console.log(`[INFO] [CodeAnalyzer] ${msg}`, meta || ''),
      warn: (msg, meta) => console.warn(`[WARN] [CodeAnalyzer] ${msg}`, meta || ''),
      error: (msg, meta) => console.error(`[ERROR] [CodeAnalyzer] ${msg}`, meta || '')
    };
  }

  /**
   * Get tool metadata
   * @returns {Object} Tool metadata
   */
  getMetadata() {
    return {
      name: this.name,
      description: "Scans repository and identifies legacy code, outdated patterns, and areas requiring modernization",
      version: "1.0.0",
      capabilities: [
        "Scan legacy code against IBM modernization rules",
        "Identify security vulnerabilities and outdated patterns",
        "Compare with IBM-approved modern code",
        "Generate priority scores and urgency levels",
        "Provide detailed issue reports with line numbers",
        "Estimate migration effort"
      ],
      parameters: {
        legacyFile: {
          type: "string",
          required: true,
          description: "Path to the legacy file to analyze"
        },
        modernFile: {
          type: "string",
          required: false,
          description: "Path to IBM-approved modern reference file"
        },
        detailed: {
          type: "boolean",
          required: false,
          default: true,
          description: "Include detailed analysis in report"
        }
      }
    };
  }
}

export default CodeAnalyzerTool;

// Made with Bob
