/**
 * End-to-End Migration Example
 * Demonstrates the complete migration workflow
 */

import { MigrationTool } from '../tools/migration/index.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Run complete migration example
 */
async function runMigrationExample() {
  console.log('\n' + '='.repeat(80));
  console.log('IBM-ALIGNED CODE MIGRATION - END-TO-END EXAMPLE');
  console.log('='.repeat(80) + '\n');

  const migrationTool = new MigrationTool();

  // Example files
  const legacyFile = 'legacy-code/user-service.js';
  const modernFile = 'ibm-modern-code/user-service.js';

  try {
    // ========================================================================
    // STEP 1: SCAN LEGACY CODE
    // ========================================================================
    console.log('\n📊 STEP 1: SCANNING LEGACY CODE');
    console.log('-'.repeat(80));
    
    const scanResult = await migrationTool.execute({
      action: 'scan',
      legacyFile,
      modernFile
    });

    if (scanResult.success) {
      console.log(`✅ Scan completed successfully`);
      console.log(`\nSummary:`);
      console.log(`  - File: ${scanResult.summary.filePath}`);
      console.log(`  - Total Issues: ${scanResult.summary.totalIssues}`);
      console.log(`  - Critical Issues: ${scanResult.summary.criticalIssues}`);
      console.log(`  - Error Issues: ${scanResult.summary.errorIssues}`);
      console.log(`  - Priority Score: ${scanResult.summary.priorityScore}/100`);
      console.log(`  - Migration Urgency: ${scanResult.summary.migrationUrgency}`);
      console.log(`  - Estimated Effort: ${scanResult.summary.estimatedEffort}`);

      console.log(`\nTop Issues by Severity:`);
      const { issuesBySeverity } = scanResult.analysis;
      for (const [severity, issues] of Object.entries(issuesBySeverity)) {
        console.log(`  ${severity.toUpperCase()}: ${issues.length} issues`);
        issues.slice(0, 3).forEach(issue => {
          console.log(`    - Line ${issue.line}: ${issue.description}`);
        });
        if (issues.length > 3) {
          console.log(`    ... and ${issues.length - 3} more`);
        }
      }
    } else {
      console.error('❌ Scan failed:', scanResult.error);
      return;
    }

    // ========================================================================
    // STEP 2: GENERATE AI RECOMMENDATIONS
    // ========================================================================
    console.log('\n\n🤖 STEP 2: GENERATING AI-POWERED RECOMMENDATIONS');
    console.log('-'.repeat(80));
    
    const recommendResult = await migrationTool.execute({
      action: 'recommend',
      legacyFile,
      modernFile
    });

    if (recommendResult.success) {
      console.log(`✅ Recommendations generated successfully`);
      
      const { migrationPlan } = recommendResult;
      console.log(`\nMigration Plan Summary:`);
      console.log(`  - Total Steps: ${migrationPlan.summary.totalSteps}`);
      console.log(`  - Estimated Effort: ${migrationPlan.summary.estimatedEffort}`);
      console.log(`  - Complexity: ${migrationPlan.summary.complexity}`);
      console.log(`  - Breaking Changes: ${migrationPlan.summary.breakingChanges}`);

      console.log(`\nMigration Phases:`);
      migrationPlan.phases.forEach((phase, index) => {
        console.log(`\n  Phase ${index + 1}: ${phase.name.toUpperCase()}`);
        console.log(`  Steps: ${phase.stepCount}`);
        phase.steps.slice(0, 2).forEach(step => {
          console.log(`    - ${step.title}`);
          if (step.description) {
            console.log(`      ${step.description.substring(0, 80)}...`);
          }
        });
      });

      console.log(`\nRisks & Breaking Changes:`);
      migrationPlan.risks.slice(0, 3).forEach(risk => {
        console.log(`  ⚠️  ${risk}`);
      });

      console.log(`\nTesting Strategy:`);
      migrationPlan.testing.slice(0, 3).forEach(test => {
        console.log(`  ✓ ${test}`);
      });

      console.log(`\nSuccess Criteria:`);
      migrationPlan.successCriteria.slice(0, 3).forEach(criteria => {
        console.log(`  ✓ ${criteria}`);
      });
    } else {
      console.error('❌ Recommendation generation failed:', recommendResult.error);
      return;
    }

    // ========================================================================
    // STEP 3: DRY RUN MIGRATION
    // ========================================================================
    console.log('\n\n🔍 STEP 3: DRY RUN MIGRATION (Preview Changes)');
    console.log('-'.repeat(80));
    
    const dryRunResult = await migrationTool.execute({
      action: 'migrate',
      legacyFile,
      modernFile,
      dryRun: true
    });

    if (dryRunResult.success) {
      console.log(`✅ Dry run completed successfully`);
      console.log(`\nChanges Preview:`);
      console.log(`  - Changes to Apply: ${dryRunResult.migrationResult.changesApplied}`);
      
      if (dryRunResult.migrationResult.changes.length > 0) {
        console.log(`\nDetailed Changes:`);
        dryRunResult.migrationResult.changes.forEach((change, index) => {
          console.log(`\n  ${index + 1}. [${change.phase}] ${change.step}`);
          console.log(`     Category: ${change.category}`);
          console.log(`     Lines Changed: ${change.linesChanged}`);
        });
      }

      if (dryRunResult.migrationResult.diff.length > 0) {
        console.log(`\nCode Diff Preview (first 10 changes):`);
        dryRunResult.migrationResult.diff.slice(0, 10).forEach(diff => {
          const prefix = diff.type === 'added' ? '+ ' : '- ';
          const color = diff.type === 'added' ? '\x1b[32m' : '\x1b[31m';
          console.log(`${color}${prefix}Line ${diff.line}: ${diff.content}\x1b[0m`);
        });
        if (dryRunResult.migrationResult.diff.length > 10) {
          console.log(`  ... and ${dryRunResult.migrationResult.diff.length - 10} more changes`);
        }
      }
    } else {
      console.error('❌ Dry run failed:', dryRunResult.error);
      return;
    }

    // ========================================================================
    // STEP 4: APPROVAL WORKFLOW
    // ========================================================================
    console.log('\n\n✋ STEP 4: APPROVAL WORKFLOW');
    console.log('-'.repeat(80));
    console.log('In a production environment, you would:');
    console.log('  1. Review the migration plan and changes');
    console.log('  2. Verify the dry run results');
    console.log('  3. Check for breaking changes');
    console.log('  4. Approve or reject the migration');
    console.log('\nFor this example, we\'ll simulate approval...');

    // Simulate user approval
    const userApproved = true; // In real scenario, this would be user input

    if (!userApproved) {
      console.log('\n❌ Migration rejected by user');
      return;
    }

    console.log('\n✅ Migration approved by user');

    // ========================================================================
    // STEP 5: APPLY MIGRATION (Still in dry-run for safety)
    // ========================================================================
    console.log('\n\n🚀 STEP 5: APPLYING MIGRATION');
    console.log('-'.repeat(80));
    console.log('⚠️  NOTE: Still running in DRY-RUN mode for safety');
    console.log('Set dryRun: false to actually apply changes\n');

    const applyResult = await migrationTool.execute({
      action: 'migrate',
      legacyFile,
      modernFile,
      dryRun: true, // Set to false to actually apply changes
      autoApply: true
    });

    if (applyResult.success) {
      console.log(`✅ Migration ${applyResult.dryRun ? 'would be' : 'was'} applied successfully`);
      console.log(`\nMigration Report:`);
      console.log(applyResult.report);
    } else {
      console.error('❌ Migration failed:', applyResult.error);
      return;
    }

    // ========================================================================
    // STEP 6: FULL WORKFLOW (Alternative)
    // ========================================================================
    console.log('\n\n🔄 ALTERNATIVE: FULL WORKFLOW');
    console.log('-'.repeat(80));
    console.log('You can also run the complete workflow in one command:\n');

    const fullWorkflowResult = await migrationTool.execute({
      action: 'full',
      legacyFile,
      modernFile,
      dryRun: true,
      autoApply: false
    });

    if (fullWorkflowResult.success) {
      console.log(`✅ Full workflow completed`);
      console.log(`\nWorkflow Steps Executed:`);
      fullWorkflowResult.workflow.steps.forEach((step, index) => {
        console.log(`  ${index + 1}. ${step.step.toUpperCase()} - ${step.timestamp}`);
      });

      if (fullWorkflowResult.requiresApproval) {
        console.log(`\n⏸️  Workflow paused - awaiting approval`);
        console.log(`Review the migration plan and run again with autoApply: true`);
      }
    } else {
      console.error('❌ Full workflow failed:', fullWorkflowResult.error);
    }

    // ========================================================================
    // SUMMARY
    // ========================================================================
    console.log('\n\n' + '='.repeat(80));
    console.log('MIGRATION EXAMPLE COMPLETED');
    console.log('='.repeat(80));
    console.log('\n✅ All steps executed successfully!');
    console.log('\nNext Steps:');
    console.log('  1. Review the migration plan and recommendations');
    console.log('  2. Test the dry-run results');
    console.log('  3. Set dryRun: false to apply actual changes');
    console.log('  4. Run tests on migrated code');
    console.log('  5. Commit changes to version control');
    console.log('\n💡 Tip: Always keep backups and use version control!\n');

  } catch (error) {
    console.error('\n❌ Migration example failed:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Run the example
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrationExample().catch(console.error);
}

export { runMigrationExample };

// Made with Bob
