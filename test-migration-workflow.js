#!/usr/bin/env node

/**
 * Test script for the new migration workflow
 * Tests the three-tool sequential workflow: analyzer → recommendation → migrator
 */

import { CodeAnalyzerTool } from './tools/code-analyzer-tool/index.js';
import { CodeRecommendationTool } from './tools/code-recommendation-tool/index.js';
import { CodeMigratorTool } from './tools/code-migrator-tool/index.js';

console.log('='.repeat(80));
console.log('MIGRATION WORKFLOW TEST');
console.log('='.repeat(80));
console.log();

async function testMigrationWorkflow() {
  const legacyFile = 'legacy-code/user-service.js';
  const modernFile = 'ibm-modern-code/user-service.js';

  try {
    // Step 1: Code Analyzer
    console.log('STEP 1: CODE ANALYZER');
    console.log('-'.repeat(80));
    const analyzer = new CodeAnalyzerTool();
    console.log('Initializing Code Analyzer...');
    
    const analysisResult = await analyzer.execute({
      legacyFile,
      modernFile,
      detailed: true
    });

    if (!analysisResult.success) {
      throw new Error(`Analysis failed: ${analysisResult.error}`);
    }

    console.log('✓ Analysis completed successfully');
    console.log(`  - Total issues found: ${analysisResult.analysis.totalIssues}`);
    console.log(`  - Priority score: ${analysisResult.summary.priorityScore}/100`);
    console.log(`  - Migration urgency: ${analysisResult.summary.migrationUrgency}`);
    console.log(`  - Estimated effort: ${analysisResult.summary.estimatedEffort}`);
    console.log();
    console.log(analysisResult.report);
    console.log();

    // Step 2: Code Recommendation
    console.log('STEP 2: CODE RECOMMENDATION');
    console.log('-'.repeat(80));
    const recommender = new CodeRecommendationTool();
    console.log('Initializing Code Recommendation Tool...');
    
    const recommendResult = await recommender.execute({
      legacyFile,
      modernFile,
      analysis: analysisResult.analysis,
      requireApproval: false  // Set to false for automated testing
    });

    if (!recommendResult.success) {
      throw new Error(`Recommendation failed: ${recommendResult.error}`);
    }

    console.log('✓ Recommendations generated successfully');
    console.log(`  - Total migration steps: ${recommendResult.migrationPlan.summary.totalSteps}`);
    console.log(`  - Estimated effort: ${recommendResult.migrationPlan.summary.estimatedEffort}`);
    console.log(`  - Complexity: ${recommendResult.migrationPlan.summary.complexity}`);
    console.log(`  - Breaking changes: ${recommendResult.migrationPlan.summary.breakingChanges}`);
    console.log(`  - AI confidence: ${(recommendResult.aiRecommendations.confidence * 100).toFixed(1)}%`);
    console.log();
    console.log(recommendResult.report);
    console.log();

    // Step 3: Code Migrator (Dry Run)
    console.log('STEP 3: CODE MIGRATOR (DRY RUN)');
    console.log('-'.repeat(80));
    const migrator = new CodeMigratorTool();
    console.log('Initializing Code Migrator Tool...');
    
    const dryRunResult = await migrator.execute({
      legacyFile,
      migrationPlan: recommendResult.migrationPlan,
      dryRun: true,
      useAI: true,
      modernFile
    });

    if (!dryRunResult.success) {
      throw new Error(`Dry run failed: ${dryRunResult.error}`);
    }

    console.log('✓ Dry run completed successfully');
    console.log(`  - Changes to be applied: ${dryRunResult.migrationResult.changesApplied}`);
    console.log(`  - Validation: ${dryRunResult.validation?.valid ? 'PASSED' : 'FAILED'}`);
    if (dryRunResult.validation && !dryRunResult.validation.valid) {
      console.log(`  - Validation issues: ${dryRunResult.validation.issues.join(', ')}`);
    }
    console.log();
    console.log(dryRunResult.report);
    console.log();

    // Summary
    console.log('='.repeat(80));
    console.log('WORKFLOW TEST SUMMARY');
    console.log('='.repeat(80));
    console.log('✓ All three tools executed successfully');
    console.log();
    console.log('Tool Results:');
    console.log(`  1. Code Analyzer: ${analysisResult.analysis.totalIssues} issues found`);
    console.log(`  2. Code Recommendation: ${recommendResult.migrationPlan.summary.totalSteps} migration steps generated`);
    console.log(`  3. Code Migrator: ${dryRunResult.migrationResult.changesApplied} changes ready to apply`);
    console.log();
    console.log('Next Steps:');
    console.log('  - Review the migration plan and recommendations');
    console.log('  - Run code-migrator with dryRun=false to apply changes');
    console.log('  - Run lint tool to verify code quality');
    console.log('  - Run validate tool to test functionality');
    console.log();
    console.log('='.repeat(80));

    return {
      success: true,
      analysis: analysisResult,
      recommendations: recommendResult,
      dryRun: dryRunResult
    };

  } catch (error) {
    console.error();
    console.error('='.repeat(80));
    console.error('WORKFLOW TEST FAILED');
    console.error('='.repeat(80));
    console.error('Error:', error.message);
    console.error();
    if (error.stack) {
      console.error('Stack trace:');
      console.error(error.stack);
    }
    console.error('='.repeat(80));
    
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the test
testMigrationWorkflow()
  .then(result => {
    if (result.success) {
      console.log('✓ Migration workflow test completed successfully');
      process.exit(0);
    } else {
      console.error('✗ Migration workflow test failed');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });

// Made with Bob
