import { createWatsonxModel } from '../../config/model-config.js';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Code Recommendation Tool
 * Generates AI-powered recommendations using Watsonx for Java code migration
 */
export class CodeRecommendation {
  constructor(customConfig = {}) {
    this.name = 'code-recommendation';
    this.model = createWatsonxModel(customConfig);
    this.guidelinesPath = path.join(__dirname, '../../guidelines/java/java-guidelines.json');
  }

  /**
   * Execute code recommendation generation
   * @param {Object} params - Parameters
   * @param {string} params.javaCode - Original Java source code
   * @param {Array} params.analysisRules - Rules from code analyzer
   * @param {Object} params.guidelines - Java guidelines
   * @param {string} params.targetVersion - Target Java version
   * @returns {Promise<Object>} AI-generated recommendations
   */
  async execute(params) {
    try {
      console.log('\n🤖 Code Recommendation: Generating AI-powered recommendations...\n');

      const { javaCode, analysisRules, guidelines, targetVersion = '21' } = params;

      if (!javaCode) {
        throw new Error('javaCode parameter is required');
      }

      if (!analysisRules || analysisRules.length === 0) {
        throw new Error('analysisRules parameter is required (run code-analyzer first)');
      }

      // Load guidelines if not provided
      const guidelineData = guidelines || await this.loadGuidelines();

      // Generate recommendations using Watsonx AI
      const recommendations = await this.generateRecommendations(
        javaCode,
        analysisRules,
        guidelineData,
        targetVersion
      );

      console.log('\n✅ Recommendations generated successfully!\n');

      return {
        success: true,
        tool: this.name,
        recommendations,
        message: 'AI-powered recommendations generated successfully'
      };
    } catch (error) {
      console.error('❌ Error generating recommendations:', error.message);
      return {
        success: false,
        tool: this.name,
        error: error.message,
        message: 'Failed to generate recommendations'
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
      console.warn('⚠️  Guidelines not found');
      return null;
    }
  }

  /**
   * Generate recommendations using Watsonx AI
   */
  async generateRecommendations(javaCode, analysisRules, guidelines, targetVersion) {
    console.log('🔄 Generating recommendations with Watsonx AI...');

    // Prepare the prompt for Watsonx
    const systemPrompt = this.buildSystemPrompt(guidelines, targetVersion);
    const userPrompt = this.buildUserPrompt(javaCode, analysisRules);

    // Call Watsonx AI
    const messages = [
      new SystemMessage(systemPrompt),
      new HumanMessage(userPrompt)
    ];

    const response = await this.model.invoke(messages);
    const aiResponse = response.content;

    // Parse AI response into structured recommendations
    const recommendations = this.parseAIResponse(aiResponse, analysisRules);

    return recommendations;
  }

  /**
   * Build system prompt for Watsonx
   */
  buildSystemPrompt(guidelines, targetVersion) {
    return `You are an expert Java migration assistant specializing in modernizing legacy Java code to Java ${targetVersion}.

Your task is to analyze Java code issues and provide:
1. **Updated Code**: Complete, modernized Java code with all fixes applied
2. **Migration Steps**: Step-by-step instructions for each change
3. **Dependency Updates**: Any required dependency changes
4. **Breaking Changes**: List of breaking changes and how to handle them
5. **Security Fixes**: Security improvements applied
6. **Performance Optimizations**: Performance enhancements made
7. **Diff/Patch**: Unified diff format showing changes

**Java Guidelines to Follow:**
${this.formatGuidelines(guidelines)}

**Target Java Version:** ${targetVersion}

**Output Format:**
Provide your response in the following JSON structure:
{
  "updated_code": "Complete modernized Java code",
  "migration_steps": [
    {
      "step": 1,
      "title": "Step title",
      "description": "What to do",
      "code_before": "Old code snippet",
      "code_after": "New code snippet",
      "effort": "time estimate",
      "breaking": false
    }
  ],
  "dependency_updates": [
    {
      "type": "maven|gradle",
      "before": "old dependency",
      "after": "new dependency",
      "reason": "why update"
    }
  ],
  "breaking_changes": [
    {
      "change": "Description",
      "impact": "What breaks",
      "mitigation": "How to fix"
    }
  ],
  "security_fixes": [
    {
      "issue": "Security issue",
      "fix": "How it was fixed",
      "severity": "critical|high|medium|low"
    }
  ],
  "performance_optimizations": [
    {
      "optimization": "What was optimized",
      "benefit": "Performance benefit",
      "impact": "high|medium|low"
    }
  ],
  "diff": "Unified diff format",
  "summary": {
    "total_changes": 0,
    "lines_modified": 0,
    "estimated_effort": "time estimate",
    "risk_level": "low|medium|high"
  }
}

Be thorough, precise, and ensure all code is production-ready.`;
  }

  /**
   * Build user prompt with code and issues
   */
  buildUserPrompt(javaCode, analysisRules) {
    const issuesSummary = this.formatIssues(analysisRules);

    return `Please analyze and modernize the following Java code:

**Original Java Code:**
\`\`\`java
${javaCode}
\`\`\`

**Issues Detected by Static Analysis:**
${issuesSummary}

**Requirements:**
1. Fix all detected issues
2. Modernize to latest Java best practices
3. Ensure code is secure, performant, and maintainable
4. Provide complete, working code (not snippets)
5. Include detailed migration steps
6. Generate unified diff for changes

Please provide your comprehensive recommendations in the JSON format specified.`;
  }

  /**
   * Format guidelines for prompt
   */
  formatGuidelines(guidelines) {
    if (!guidelines) return 'Use Java best practices';

    let formatted = '';

    if (guidelines.coding_guidelines) {
      formatted += '\n**Coding Guidelines:**\n';
      guidelines.coding_guidelines.slice(0, 5).forEach(g => {
        formatted += `- ${g.rule}: ${g.description}\n`;
      });
    }

    if (guidelines.modernization_rules) {
      formatted += '\n**Modernization Rules:**\n';
      guidelines.modernization_rules.slice(0, 5).forEach(r => {
        formatted += `- ${r.from_pattern} → ${r.to_pattern} (Java ${r.java_version})\n`;
      });
    }

    if (guidelines.security_rules) {
      formatted += '\n**Security Rules:**\n';
      guidelines.security_rules.slice(0, 3).forEach(s => {
        formatted += `- ${s.title}: ${s.remediation}\n`;
      });
    }

    return formatted;
  }

  /**
   * Format issues for prompt
   */
  formatIssues(analysisRules) {
    let formatted = '';

    for (const rule of analysisRules) {
      formatted += `\n**${rule.rule}** (${rule.count} issues):\n`;
      
      // Show first few issues as examples
      const examples = rule.issues.slice(0, 3);
      examples.forEach(issue => {
        formatted += `  Line ${issue.line}: ${issue.code}\n`;
        if (issue.message) formatted += `    → ${issue.message}\n`;
        if (issue.replacement) formatted += `    → Suggested: ${issue.replacement}\n`;
      });

      if (rule.issues.length > 3) {
        formatted += `  ... and ${rule.issues.length - 3} more\n`;
      }
    }

    return formatted;
  }

  /**
   * Parse AI response into structured recommendations
   */
  parseAIResponse(aiResponse, analysisRules) {
    try {
      // Try to extract JSON from response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return this.enrichRecommendations(parsed, analysisRules);
      }
    } catch (error) {
      console.warn('⚠️  Could not parse AI response as JSON, using fallback');
    }

    // Fallback: create structured recommendations from text
    return this.createFallbackRecommendations(aiResponse, analysisRules);
  }

  /**
   * Enrich recommendations with additional metadata
   */
  enrichRecommendations(recommendations, analysisRules) {
    // Add metadata
    recommendations.generated_at = new Date().toISOString();
    recommendations.analysis_rules_count = analysisRules.length;
    recommendations.total_issues = analysisRules.reduce((sum, r) => sum + r.count, 0);

    // Ensure all required fields exist
    recommendations.updated_code = recommendations.updated_code || '';
    recommendations.migration_steps = recommendations.migration_steps || [];
    recommendations.dependency_updates = recommendations.dependency_updates || [];
    recommendations.breaking_changes = recommendations.breaking_changes || [];
    recommendations.security_fixes = recommendations.security_fixes || [];
    recommendations.performance_optimizations = recommendations.performance_optimizations || [];
    recommendations.diff = recommendations.diff || '';
    recommendations.summary = recommendations.summary || {
      total_changes: 0,
      lines_modified: 0,
      estimated_effort: 'Unknown',
      risk_level: 'medium'
    };

    return recommendations;
  }

  /**
   * Create fallback recommendations from text response
   */
  createFallbackRecommendations(aiResponse, analysisRules) {
    return {
      updated_code: this.extractCodeFromResponse(aiResponse),
      migration_steps: this.extractMigrationSteps(aiResponse, analysisRules),
      dependency_updates: [],
      breaking_changes: [],
      security_fixes: this.extractSecurityFixes(analysisRules),
      performance_optimizations: [],
      diff: '',
      summary: {
        total_changes: analysisRules.reduce((sum, r) => sum + r.count, 0),
        lines_modified: 0,
        estimated_effort: this.estimateEffort(analysisRules),
        risk_level: this.assessRiskLevel(analysisRules)
      },
      generated_at: new Date().toISOString(),
      ai_response: aiResponse
    };
  }

  /**
   * Extract code blocks from AI response
   */
  extractCodeFromResponse(response) {
    const codeMatch = response.match(/```java\n([\s\S]*?)\n```/);
    return codeMatch ? codeMatch[1] : '';
  }

  /**
   * Extract migration steps from analysis rules
   */
  extractMigrationSteps(aiResponse, analysisRules) {
    const steps = [];
    let stepNumber = 1;

    for (const rule of analysisRules) {
      if (rule.issues.length > 0) {
        const issue = rule.issues[0]; // Use first issue as example
        
        steps.push({
          step: stepNumber++,
          title: `Fix ${rule.rule}`,
          description: issue.message || issue.reason || `Address ${rule.rule} issues`,
          code_before: issue.code || '',
          code_after: issue.replacement || issue.suggestion || '',
          effort: this.estimateStepEffort(rule),
          breaking: this.isBreakingChange(rule)
        });
      }
    }

    return steps;
  }

  /**
   * Extract security fixes from analysis rules
   */
  extractSecurityFixes(analysisRules) {
    const securityFixes = [];
    
    for (const rule of analysisRules) {
      if (rule.rule.includes('security')) {
        for (const issue of rule.issues) {
          securityFixes.push({
            issue: issue.title || issue.message || 'Security issue',
            fix: issue.remediation || 'Apply security best practices',
            severity: issue.severity || 'medium'
          });
        }
      }
    }

    return securityFixes;
  }

  /**
   * Estimate effort for migration
   */
  estimateEffort(analysisRules) {
    const totalIssues = analysisRules.reduce((sum, r) => sum + r.count, 0);
    
    if (totalIssues < 5) return '1-2 hours';
    if (totalIssues < 15) return '4-8 hours';
    if (totalIssues < 30) return '1-2 days';
    return '3-5 days';
  }

  /**
   * Estimate effort for a single step
   */
  estimateStepEffort(rule) {
    if (rule.count < 3) return '15-30 minutes';
    if (rule.count < 10) return '1-2 hours';
    return '2-4 hours';
  }

  /**
   * Assess risk level
   */
  assessRiskLevel(analysisRules) {
    const hasCritical = analysisRules.some(r => 
      r.issues.some(i => i.severity === 'critical')
    );
    const hasBreaking = analysisRules.some(r => 
      r.rule.includes('deprecated') || r.rule.includes('incompatibility')
    );

    if (hasCritical) return 'high';
    if (hasBreaking) return 'medium';
    return 'low';
  }

  /**
   * Check if rule represents breaking change
   */
  isBreakingChange(rule) {
    return rule.rule.includes('deprecated') || 
           rule.rule.includes('incompatibility') ||
           rule.rule.includes('version');
  }

  /**
   * Generate diff/patch file
   */
  async generateDiff(originalCode, updatedCode, filePath = 'file.java') {
    const originalLines = originalCode.split('\n');
    const updatedLines = updatedCode.split('\n');

    let diff = `--- a/${filePath}\n+++ b/${filePath}\n`;
    diff += `@@ -1,${originalLines.length} +1,${updatedLines.length} @@\n`;

    for (let i = 0; i < Math.max(originalLines.length, updatedLines.length); i++) {
      const origLine = originalLines[i] || '';
      const updLine = updatedLines[i] || '';

      if (origLine !== updLine) {
        if (origLine) diff += `-${origLine}\n`;
        if (updLine) diff += `+${updLine}\n`;
      } else {
        diff += ` ${origLine}\n`;
      }
    }

    return diff;
  }

  /**
   * Save recommendations to file
   */
  async saveRecommendations(recommendations, outputPath) {
    await fs.writeFile(
      outputPath,
      JSON.stringify(recommendations, null, 2),
      'utf-8'
    );
    console.log(`✓ Recommendations saved to: ${outputPath}`);
  }

  /**
   * Get tool metadata
   */
  getMetadata() {
    return {
      name: this.name,
      description: 'Generates AI-powered code recommendations using Watsonx',
      version: '1.0.0',
      parameters: {
        javaCode: 'String - Original Java source code (required)',
        analysisRules: 'Array - Rules from code analyzer (required)',
        guidelines: 'Object - Java guidelines (optional)',
        targetVersion: 'String - Target Java version (optional, default: 21)'
      }
    };
  }
}

export default CodeRecommendation;

// Made with Bob
