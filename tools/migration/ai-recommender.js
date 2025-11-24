/**
 * AI-Driven Recommendation Generator
 * Uses IBM Watsonx to generate intelligent migration recommendations
 */

import { createWatsonxModel } from '../../config/model-config.js';
import fs from 'fs/promises';

export class AIRecommender {
  constructor(customConfig = {}) {
    this.model = createWatsonxModel(customConfig);
  }

  /**
   * Generate AI-powered migration recommendations
   * @param {Object} analysis - Code analysis results
   * @param {string} legacyCode - Legacy code content
   * @param {string} modernCode - Modern code reference
   * @returns {Promise<Object>} AI recommendations
   */
  async generateRecommendations(analysis, legacyCode, modernCode) {
    const prompt = this.buildPrompt(analysis, legacyCode, modernCode);
    
    try {
      console.log('[AI Recommender] Generating recommendations...');
      const startTime = Date.now();
      
      // Create timeout promise (2 minutes for AI call)
      const timeoutMs = 120000;
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error(`AI model timeout after ${timeoutMs}ms`));
        }, timeoutMs);
      });
      
      // Race between AI call and timeout
      const response = await Promise.race([
        this.model.invoke(prompt),
        timeoutPromise
      ]);
      
      const duration = Date.now() - startTime;
      console.log(`[AI Recommender] Completed in ${duration}ms`);
      
      const recommendations = this.parseAIResponse(response.content);
      
      return {
        success: true,
        recommendations,
        confidence: this.calculateConfidence(recommendations),
        timestamp: new Date().toISOString(),
        duration
      };
    } catch (error) {
      console.error('[AI Recommender] Failed:', error.message);
      
      // If timeout or AI fails, use fallback
      const fallback = this.generateFallbackRecommendations(analysis);
      
      return {
        success: false,
        error: error.message,
        usingFallback: true,
        recommendations: fallback,
        confidence: 0.6,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Build prompt for AI model
   * @param {Object} analysis - Analysis results
   * @param {string} legacyCode - Legacy code
   * @param {string} modernCode - Modern code
   * @returns {string} Formatted prompt
   */
  buildPrompt(analysis, legacyCode, modernCode) {
    return `You are an expert code migration specialist with deep knowledge of IBM modernization standards.

TASK: Analyze the legacy code and generate detailed migration recommendations to transform it into IBM-standard modern code.

LEGACY CODE:
\`\`\`javascript
${legacyCode}
\`\`\`

IBM-APPROVED MODERN CODE REFERENCE:
\`\`\`javascript
${modernCode}
\`\`\`

DETECTED ISSUES (${analysis.totalIssues} total):
${this.formatIssues(analysis.issues)}

EXISTING RECOMMENDATIONS:
${this.formatRecommendations(analysis.recommendations)}

Please provide:
1. **Priority-ordered migration steps** - List specific changes in order of importance
2. **Code transformation examples** - Show before/after code snippets for key changes
3. **Risk assessment** - Identify potential breaking changes or risks
4. **Testing recommendations** - Suggest tests to verify the migration
5. **Estimated effort** - Time estimate for each major change

Format your response as JSON with this structure:
{
  "migrationSteps": [
    {
      "priority": 1,
      "category": "security|async|syntax|architecture",
      "title": "Brief title",
      "description": "Detailed description",
      "codeExample": {
        "before": "legacy code snippet",
        "after": "modern code snippet"
      },
      "rationale": "Why this change is important",
      "effort": "time estimate",
      "risks": ["potential risk 1", "potential risk 2"]
    }
  ],
  "breakingChanges": ["list of breaking changes"],
  "testingStrategy": ["test recommendation 1", "test recommendation 2"],
  "overallComplexity": "low|medium|high",
  "estimatedTotalEffort": "time estimate"
}

Provide comprehensive, actionable recommendations that follow IBM best practices.`;
  }

  /**
   * Format issues for prompt
   * @param {Array} issues - List of issues
   * @returns {string} Formatted issues
   */
  formatIssues(issues) {
    const grouped = issues.reduce((acc, issue) => {
      if (!acc[issue.severity]) acc[issue.severity] = [];
      acc[issue.severity].push(issue);
      return acc;
    }, {});

    let formatted = '';
    for (const [severity, issueList] of Object.entries(grouped)) {
      formatted += `\n${severity.toUpperCase()} (${issueList.length}):\n`;
      issueList.slice(0, 5).forEach(issue => {
        formatted += `  - Line ${issue.line}: ${issue.description}\n`;
      });
      if (issueList.length > 5) {
        formatted += `  ... and ${issueList.length - 5} more\n`;
      }
    }
    return formatted;
  }

  /**
   * Format recommendations for prompt
   * @param {Array} recommendations - List of recommendations
   * @returns {string} Formatted recommendations
   */
  formatRecommendations(recommendations) {
    if (!recommendations || recommendations.length === 0) {
      return 'None generated yet.';
    }
    return recommendations.map((rec, i) => 
      `${i + 1}. [${rec.priority}] ${rec.description}: ${rec.details}`
    ).join('\n');
  }

  /**
   * Parse AI response
   * @param {string} response - AI response text
   * @returns {Object} Parsed recommendations
   */
  parseAIResponse(response) {
    try {
      // Try to extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback: parse structured text
      return this.parseStructuredText(response);
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      return this.parseStructuredText(response);
    }
  }

  /**
   * Parse structured text response
   * @param {string} text - Response text
   * @returns {Object} Parsed structure
   */
  parseStructuredText(text) {
    const steps = [];
    const lines = text.split('\n');
    
    let currentStep = null;
    for (const line of lines) {
      if (line.match(/^\d+\./)) {
        if (currentStep) steps.push(currentStep);
        currentStep = {
          title: line.replace(/^\d+\.\s*/, '').trim(),
          description: '',
          priority: steps.length + 1
        };
      } else if (currentStep && line.trim()) {
        currentStep.description += line.trim() + ' ';
      }
    }
    if (currentStep) steps.push(currentStep);

    return {
      migrationSteps: steps,
      breakingChanges: [],
      testingStrategy: [],
      overallComplexity: 'medium',
      estimatedTotalEffort: 'To be determined'
    };
  }

  /**
   * Calculate confidence score
   * @param {Object} recommendations - Recommendations object
   * @returns {number} Confidence score (0-1)
   */
  calculateConfidence(recommendations) {
    if (!recommendations.migrationSteps || recommendations.migrationSteps.length === 0) {
      return 0.3;
    }

    let score = 0.5;
    
    // Increase confidence based on completeness
    if (recommendations.breakingChanges && recommendations.breakingChanges.length > 0) score += 0.1;
    if (recommendations.testingStrategy && recommendations.testingStrategy.length > 0) score += 0.1;
    if (recommendations.estimatedTotalEffort) score += 0.1;
    
    // Increase confidence based on detail level
    const avgDescriptionLength = recommendations.migrationSteps.reduce(
      (sum, step) => sum + (step.description?.length || 0), 0
    ) / recommendations.migrationSteps.length;
    
    if (avgDescriptionLength > 100) score += 0.2;

    return Math.min(score, 1.0);
  }

  /**
   * Generate fallback recommendations
   * @param {Object} analysis - Analysis results
   * @returns {Object} Fallback recommendations
   */
  generateFallbackRecommendations(analysis) {
    const steps = [];
    let priority = 1;

    // Critical issues first
    if (analysis.issuesBySeverity.critical) {
      steps.push({
        priority: priority++,
        category: 'security',
        title: 'Address Critical Security Issues',
        description: `Fix ${analysis.issuesBySeverity.critical.length} critical security issues`,
        effort: '2-4 hours'
      });
    }

    // Error-level issues
    if (analysis.issuesBySeverity.error) {
      steps.push({
        priority: priority++,
        category: 'error',
        title: 'Fix Error-Level Issues',
        description: `Resolve ${analysis.issuesBySeverity.error.length} error-level issues`,
        effort: '4-8 hours'
      });
    }

    // Add recommendations
    analysis.recommendations.forEach(rec => {
      steps.push({
        priority: priority++,
        category: rec.type,
        title: rec.description,
        description: rec.details,
        effort: 'TBD'
      });
    });

    return {
      migrationSteps: steps,
      breakingChanges: ['Manual review required'],
      testingStrategy: ['Add unit tests', 'Add integration tests'],
      overallComplexity: 'medium',
      estimatedTotalEffort: analysis.estimatedEffort || 'To be determined'
    };
  }

  /**
   * Generate migration plan
   * @param {Object} recommendations - AI recommendations
   * @param {Object} analysis - Code analysis
   * @returns {Object} Detailed migration plan
   */
  generateMigrationPlan(recommendations, analysis) {
    return {
      summary: {
        totalSteps: recommendations.migrationSteps?.length || 0,
        estimatedEffort: recommendations.estimatedTotalEffort,
        complexity: recommendations.overallComplexity,
        breakingChanges: recommendations.breakingChanges?.length || 0
      },
      phases: this.organizePhasesPhases(recommendations.migrationSteps),
      risks: recommendations.breakingChanges || [],
      testing: recommendations.testingStrategy || [],
      rollbackPlan: this.generateRollbackPlan(),
      successCriteria: this.defineSuccessCriteria(analysis)
    };
  }

  /**
   * Organize steps into phases
   * @param {Array} steps - Migration steps
   * @returns {Array} Organized phases
   */
  organizePhasesPhases(steps = []) {
    const phases = {
      preparation: [],
      critical: [],
      core: [],
      enhancement: [],
      validation: []
    };

    steps.forEach(step => {
      if (step.category === 'security' || step.priority === 1) {
        phases.critical.push(step);
      } else if (step.category === 'async' || step.category === 'modules') {
        phases.core.push(step);
      } else if (step.category === 'architecture') {
        phases.enhancement.push(step);
      } else {
        phases.core.push(step);
      }
    });

    phases.preparation.push({
      title: 'Setup and Backup',
      description: 'Create backup, setup testing environment',
      effort: '30 minutes'
    });

    phases.validation.push({
      title: 'Testing and Validation',
      description: 'Run tests, validate functionality',
      effort: '1-2 hours'
    });

    return Object.entries(phases).map(([name, steps]) => ({
      name,
      steps,
      stepCount: steps.length
    }));
  }

  /**
   * Generate rollback plan
   * @returns {Array} Rollback steps
   */
  generateRollbackPlan() {
    return [
      'Keep backup of original code',
      'Use version control (git) for all changes',
      'Test rollback procedure before migration',
      'Document all configuration changes',
      'Have database backup if applicable'
    ];
  }

  /**
   * Define success criteria
   * @param {Object} analysis - Code analysis
   * @returns {Array} Success criteria
   */
  defineSuccessCriteria(analysis) {
    return [
      'All critical and error-level issues resolved',
      'Code passes linting with IBM standards',
      'All existing tests pass',
      'New tests added for changed functionality',
      'Code review approved',
      'Performance benchmarks met or improved',
      `Migration reduces technical debt score by ${Math.min(analysis.totalIssues * 10, 100)}%`
    ];
  }
}

export default AIRecommender;

// Made with Bob
