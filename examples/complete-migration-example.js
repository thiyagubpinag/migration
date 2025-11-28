#!/usr/bin/env node

/**
 * Complete Java Migration Example
 * Demonstrates the full DocuPilot Agent workflow:
 * 1. Generate guidelines with DocuPilot Agent
 * 2. Analyze code with Code Analyzer
 * 3. Generate recommendations with Code Recommendation (Watsonx AI)
 * 4. Output results
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { DocuPilotAgent } from '../tools/docupilot-agent/index.js';
import { CodeAnalyzer } from '../tools/code-analyzer/index.js';
import { CodeRecommendation } from '../tools/code-recommendation/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Main migration workflow
 */
async function runCompleteMigration() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   DocuPilot Agent - Complete Java Migration Example       ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  try {
    // Step 1: Load legacy Java code
    console.log('📂 Step 1: Loading legacy Java code...\n');
    const legacyCodePath = path.join(__dirname, 'legacy-code/UserService.java');
    const javaCode = await fs.readFile(legacyCodePath, 'utf-8');
    console.log(`✓ Loaded: ${legacyCodePath}`);
    console.log(`✓ Code size: ${javaCode.length} characters\n`);

    // Step 2: Generate guidelines with DocuPilot Agent
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log('📚 Step 2: Generating Java guidelines with DocuPilot Agent...\n');
    
    const docuPilot = new DocuPilotAgent();
    const guidelinesResult = await docuPilot.execute({
      javaCode,
      targetVersion: '21'
    });

    if (!guidelinesResult.success) {
      throw new Error(`DocuPilot Agent failed: ${guidelinesResult.error}`);
    }

    console.log('✓ Guidelines generated successfully');
    console.log(`✓ Guidelines saved to: ${guidelinesResult.guidelinesPath}\n`);

    // Step 3: Analyze code with Code Analyzer
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log('🔍 Step 3: Analyzing code with Code Analyzer...\n');

    const analyzer = new CodeAnalyzer();
    const analysisResult = await analyzer.execute({
      javaCode,
      filePath: 'UserService.java',
      guidelines: guidelinesResult.guidelines
    });

    if (!analysisResult.success) {
      throw new Error(`Code Analyzer failed: ${analysisResult.error}`);
    }

    console.log('✓ Analysis completed');
    console.log(`✓ Detected Java version: ${analysisResult.detected_version}`);
    console.log(`✓ Recommended version: ${analysisResult.recommended_version}`);
    console.log(`✓ Total issues found: ${analysisResult.summary.total_issues}\n`);

    // Display issue summary
    console.log('📊 Issue Summary:');
    console.log('─────────────────────────────────────────────────────────');
    console.log(`  Critical: ${analysisResult.summary.by_severity.critical}`);
    console.log(`  Error:    ${analysisResult.summary.by_severity.error}`);
    console.log(`  Warning:  ${analysisResult.summary.by_severity.warning}`);
    console.log(`  Info:     ${analysisResult.summary.by_severity.info}`);
    console.log('─────────────────────────────────────────────────────────\n');

    // Display issues by category
    console.log('📋 Issues by Category:');
    console.log('─────────────────────────────────────────────────────────');
    for (const [category, count] of Object.entries(analysisResult.summary.by_category)) {
      console.log(`  ${category}: ${count}`);
    }
    console.log('─────────────────────────────────────────────────────────\n');

    // Step 4: Generate recommendations with Watsonx AI
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log('🤖 Step 4: Generating AI recommendations with Watsonx...\n');
    console.log('⏳ This may take a minute...\n');

    const recommender = new CodeRecommendation();
    const recommendationResult = await recommender.execute({
      javaCode,
      analysisRules: analysisResult.rules,
      guidelines: guidelinesResult.guidelines,
      targetVersion: '21'
    });

    if (!recommendationResult.success) {
      throw new Error(`Code Recommendation failed: ${recommendationResult.error}`);
    }

    const recommendations = recommendationResult.recommendations;
    console.log('✓ Recommendations generated successfully\n');

    // Step 5: Display recommendations summary
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log('📝 Step 5: Migration Recommendations Summary\n');
    console.log('─────────────────────────────────────────────────────────');

    if (recommendations.summary) {
      console.log(`Total Changes:     ${recommendations.summary.total_changes || 'N/A'}`);
      console.log(`Lines Modified:    ${recommendations.summary.lines_modified || 'N/A'}`);
      console.log(`Estimated Effort:  ${recommendations.summary.estimated_effort || 'N/A'}`);
      console.log(`Risk Level:        ${recommendations.summary.risk_level || 'N/A'}`);
    }
    console.log('─────────────────────────────────────────────────────────\n');

    // Display migration steps
    if (recommendations.migration_steps && recommendations.migration_steps.length > 0) {
      console.log('🔧 Migration Steps:');
      console.log('─────────────────────────────────────────────────────────');
      recommendations.migration_steps.slice(0, 5).forEach(step => {
        console.log(`\n${step.step}. ${step.title}`);
        console.log(`   ${step.description}`);
        console.log(`   Effort: ${step.effort}`);
        if (step.breaking) console.log('   ⚠️  Breaking change');
      });
      if (recommendations.migration_steps.length > 5) {
        console.log(`\n   ... and ${recommendations.migration_steps.length - 5} more steps`);
      }
      console.log('─────────────────────────────────────────────────────────\n');
    }

    // Display security fixes
    if (recommendations.security_fixes && recommendations.security_fixes.length > 0) {
      console.log('🔒 Security Fixes:');
      console.log('─────────────────────────────────────────────────────────');
      recommendations.security_fixes.forEach(fix => {
        console.log(`  • ${fix.issue} (${fix.severity})`);
        console.log(`    Fix: ${fix.fix}`);
      });
      console.log('─────────────────────────────────────────────────────────\n');
    }

    // Display performance optimizations
    if (recommendations.performance_optimizations && recommendations.performance_optimizations.length > 0) {
      console.log('⚡ Performance Optimizations:');
      console.log('─────────────────────────────────────────────────────────');
      recommendations.performance_optimizations.forEach(opt => {
        console.log(`  • ${opt.optimization} (${opt.impact} impact)`);
        console.log(`    Benefit: ${opt.benefit}`);
      });
      console.log('─────────────────────────────────────────────────────────\n');
    }

    // Step 6: Save results
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log('💾 Step 6: Saving results...\n');

    const outputDir = path.join(__dirname, 'output');
    await fs.mkdir(outputDir, { recursive: true });

    // Save analysis results
    const analysisOutputPath = path.join(outputDir, 'analysis-results.json');
    await fs.writeFile(
      analysisOutputPath,
      JSON.stringify(analysisResult, null, 2),
      'utf-8'
    );
    console.log(`✓ Analysis results saved: ${analysisOutputPath}`);

    // Save recommendations
    const recommendationsOutputPath = path.join(outputDir, 'recommendations.json');
    await fs.writeFile(
      recommendationsOutputPath,
      JSON.stringify(recommendations, null, 2),
      'utf-8'
    );
    console.log(`✓ Recommendations saved: ${recommendationsOutputPath}`);

    // Save updated code if available
    if (recommendations.updated_code) {
      const updatedCodePath = path.join(outputDir, 'UserService-modernized.java');
      await fs.writeFile(updatedCodePath, recommendations.updated_code, 'utf-8');
      console.log(`✓ Modernized code saved: ${updatedCodePath}`);
    }

    // Save diff if available
    if (recommendations.diff) {
      const diffPath = path.join(outputDir, 'migration.patch');
      await fs.writeFile(diffPath, recommendations.diff, 'utf-8');
      console.log(`✓ Diff/patch saved: ${diffPath}`);
    }

    // Generate migration report
    const report = generateMigrationReport(
      analysisResult,
      recommendations,
      guidelinesResult.guidelines
    );
    const reportPath = path.join(outputDir, 'migration-report.md');
    await fs.writeFile(reportPath, report, 'utf-8');
    console.log(`✓ Migration report saved: ${reportPath}\n`);

    // Final summary
    console.log('═══════════════════════════════════════════════════════════\n');
    console.log('✅ Migration Analysis Complete!\n');
    console.log('📁 All results saved to: examples/output/\n');
    console.log('Next Steps:');
    console.log('  1. Review the migration report');
    console.log('  2. Examine the modernized code');
    console.log('  3. Apply the patch or manually implement changes');
    console.log('  4. Test thoroughly');
    console.log('  5. Deploy to production\n');
    console.log('═══════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\nStack trace:', error.stack);
    process.exit(1);
  }
}

/**
 * Generate a comprehensive migration report
 */
function generateMigrationReport(analysisResult, recommendations, guidelines) {
  const report = `# Java Migration Report

**Generated:** ${new Date().toISOString()}

## Executive Summary

- **Current Java Version:** ${analysisResult.detected_version}
- **Target Java Version:** ${analysisResult.recommended_version}
- **Total Issues Found:** ${analysisResult.summary.total_issues}
- **Estimated Migration Effort:** ${recommendations.summary?.estimated_effort || 'Unknown'}
- **Risk Level:** ${recommendations.summary?.risk_level || 'Medium'}

## Issue Breakdown

### By Severity
- **Critical:** ${analysisResult.summary.by_severity.critical}
- **Error:** ${analysisResult.summary.by_severity.error}
- **Warning:** ${analysisResult.summary.by_severity.warning}
- **Info:** ${analysisResult.summary.by_severity.info}

### By Category
${Object.entries(analysisResult.summary.by_category)
  .map(([category, count]) => `- **${category}:** ${count}`)
  .join('\n')}

## Migration Steps

${recommendations.migration_steps?.map((step, index) => `
### ${step.step}. ${step.title}

**Description:** ${step.description}

**Effort:** ${step.effort}

${step.breaking ? '⚠️ **Breaking Change**' : ''}

**Before:**
\`\`\`java
${step.code_before || 'N/A'}
\`\`\`

**After:**
\`\`\`java
${step.code_after || 'N/A'}
\`\`\`
`).join('\n') || 'No specific steps provided'}

## Security Fixes

${recommendations.security_fixes?.map(fix => `
- **${fix.issue}** (${fix.severity})
  - Fix: ${fix.fix}
`).join('\n') || 'No security fixes required'}

## Performance Optimizations

${recommendations.performance_optimizations?.map(opt => `
- **${opt.optimization}** (${opt.impact} impact)
  - Benefit: ${opt.benefit}
`).join('\n') || 'No performance optimizations identified'}

## Breaking Changes

${recommendations.breaking_changes?.map(change => `
- **${change.change}**
  - Impact: ${change.impact}
  - Mitigation: ${change.mitigation}
`).join('\n') || 'No breaking changes identified'}

## Dependency Updates

${recommendations.dependency_updates?.map(dep => `
- **${dep.type}**
  - Before: \`${dep.before}\`
  - After: \`${dep.after}\`
  - Reason: ${dep.reason}
`).join('\n') || 'No dependency updates required'}

## Guidelines Applied

This migration follows:
- Oracle Java SE ${analysisResult.recommended_version} guidelines
- Effective Java principles
- OWASP Java security best practices
- Modern Java coding conventions

## Next Steps

1. **Review** this report and the generated recommendations
2. **Test** the modernized code in a development environment
3. **Update** dependencies as recommended
4. **Apply** security fixes immediately
5. **Implement** performance optimizations
6. **Deploy** to staging for integration testing
7. **Monitor** for any issues after production deployment

---

*Generated by DocuPilot Agent - AI-Powered Java Migration System*
`;

  return report;
}

// Run the migration
runCompleteMigration();

// Made with Bob
