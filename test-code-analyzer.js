#!/usr/bin/env node

/**
 * Test script for Code Analyzer Tool
 * Tests the analyzer directly without MCP
 */

import { codeAnalyzerTool, getRuleDetailsTool } from './tools/code-analyzer/index.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testCodeAnalyzer() {
  console.log('🧪 Testing IBM Code Analyzer Tool\n');
  console.log('═══════════════════════════════════════\n');

  try {
    // Test 1: Analyze legacy codebase
    console.log('📋 Test 1: Analyzing legacy codebase...\n');
    
    const projectPath = path.join(__dirname, 'example-migration-project/legacy-codebase');
    const result = await codeAnalyzerTool.execute({
      projectPath,
      includeAIPrompts: true
    });

    if (result.success) {
      console.log('✅ Analysis completed successfully!\n');
      
      console.log('📊 Summary:');
      console.log(`   Total Issues: ${result.summary.totalIssues}`);
      console.log(`   Dependencies: ${result.summary.dependencies.total}`);
      console.log(`   - Deprecated: ${result.summary.dependencies.deprecated}`);
      console.log(`   - Outdated: ${result.summary.dependencies.outdated}`);
      console.log(`   - Security Issues: ${result.summary.dependencies.securityVulnerabilities}`);
      console.log(`   Files Analyzed: ${result.summary.patterns.filesAnalyzed}`);
      console.log(`   Pattern Issues: ${result.summary.patterns.totalPatterns}\n`);

      console.log('🔴 Critical Issues:');
      result.recommendations.immediate.forEach((rec, i) => {
        console.log(`   ${i + 1}. ${rec.message}`);
      });
      console.log('');

      console.log('📝 Sample Dependency Issues:');
      result.dependencyIssues.slice(0, 3).forEach((issue, i) => {
        console.log(`   ${i + 1}. ${issue.package} (${issue.type})`);
        console.log(`      ${issue.reason || issue.message || 'Needs update'}`);
      });
      console.log('');

      console.log('🔍 Sample Pattern Issues:');
      result.patternIssues.slice(0, 3).forEach((issue, i) => {
        console.log(`   ${i + 1}. ${issue.id} - ${issue.message}`);
        console.log(`      File: ${issue.file}`);
        console.log(`      Occurrences: ${issue.occurrences}`);
      });
      console.log('');

      console.log('🤖 AI Prompts Generated:');
      result.aiPrompts.forEach((prompt, i) => {
        console.log(`   ${i + 1}. ${prompt.id} (${prompt.type}) - Priority: ${prompt.priority}`);
      });
      console.log('');

      // Test 2: Get specific rule details
      if (result.modernizationRules.patternRules.length > 0) {
        console.log('═══════════════════════════════════════\n');
        console.log('📋 Test 2: Getting rule details...\n');
        
        const ruleId = result.modernizationRules.patternRules[0].id;
        console.log(`   Fetching details for rule: ${ruleId}\n`);
        
        const ruleResult = await getRuleDetailsTool.execute({
          ruleId,
          projectPath
        });

        if (ruleResult.success) {
          console.log('✅ Rule details retrieved successfully!\n');
          console.log(`   Rule ID: ${ruleResult.rule.id}`);
          console.log(`   Category: ${ruleResult.rule.category}`);
          console.log(`   Severity: ${ruleResult.rule.severity}`);
          console.log(`   Message: ${ruleResult.rule.message}`);
          console.log(`   Estimated Time: ${ruleResult.rule.estimatedTime}\n`);
          
          console.log('   Migration Steps:');
          ruleResult.rule.migrationSteps.forEach((step, i) => {
            console.log(`      ${step}`);
          });
          console.log('');
        } else {
          console.log('❌ Failed to get rule details:', ruleResult.error);
        }
      }

      console.log('═══════════════════════════════════════\n');
      console.log('✅ All tests completed successfully!\n');
      
      // Save full result to file for inspection
      const fs = await import('fs');
      const outputPath = path.join(__dirname, 'test-analyzer-output.json');
      fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
      console.log(`📄 Full analysis saved to: ${outputPath}\n`);

    } else {
      console.log('❌ Analysis failed:', result.error);
      if (result.stack) {
        console.log('\nStack trace:', result.stack);
      }
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.error('\nStack trace:', error.stack);
    process.exit(1);
  }
}

// Run tests
testCodeAnalyzer().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

// Made with Bob
