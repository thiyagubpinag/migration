#!/usr/bin/env node

/**
 * Comprehensive Test Suite for Migration Tools
 * Tests all tools individually and validates functionality
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { DocuPilotAgent } from '../tools/docupilot-agent/index.js';
import { CodeAnalyzer } from '../tools/code-analyzer/index.js';
import { CodeRecommendation } from '../tools/code-recommendation/index.js';
import { WatsonxLLMTool } from '../tools/watsonx_llm/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  skipped: 0,
  tests: []
};

/**
 * Test runner utility
 */
async function runTest(name, testFn, skipIfNoEnv = false) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🧪 TEST: ${name}`);
  console.log('='.repeat(60));
  
  try {
    // Check if we should skip due to missing env vars
    if (skipIfNoEnv && (!process.env.WATSONX_API_KEY || !process.env.WATSONX_PROJECT_ID)) {
      console.log('⏭️  SKIPPED: Missing Watsonx credentials');
      testResults.skipped++;
      testResults.tests.push({ name, status: 'skipped', reason: 'Missing credentials' });
      return;
    }

    await testFn();
    console.log(`✅ PASSED: ${name}`);
    testResults.passed++;
    testResults.tests.push({ name, status: 'passed' });
  } catch (error) {
    console.error(`❌ FAILED: ${name}`);
    console.error(`Error: ${error.message}`);
    console.error(`Stack: ${error.stack}`);
    testResults.failed++;
    testResults.tests.push({ name, status: 'failed', error: error.message });
  }
}

/**
 * Test 1: DocuPilot Agent - Guideline Generation
 */
async function testDocuPilotAgent() {
  const agent = new DocuPilotAgent();
  
  // Test with sample Java code
  const sampleCode = `
    public class TestClass {
      private String password = "admin123";
      
      public void processData() {
        List list = new ArrayList();
        for (int i = 0; i < 100; i++) {
          String result = "";
          result += i;
        }
      }
    }
  `;
  
  const result = await agent.execute({
    javaCode: sampleCode,
    targetVersion: '21'
  });
  
  if (!result.success) {
    throw new Error(`DocuPilot Agent failed: ${result.error}`);
  }
  
  if (!result.guidelines) {
    throw new Error('No guidelines generated');
  }
  
  console.log('✓ Guidelines generated successfully');
  console.log(`✓ Guidelines file: ${result.guidelinesPath}`);
  
  // Verify guidelines structure
  const guidelines = result.guidelines;
  if (!guidelines.language || guidelines.language !== 'Java') {
    throw new Error('Invalid guidelines structure');
  }
  
  console.log('✓ Guidelines structure validated');
}

/**
 * Test 2: Code Analyzer - Static Analysis
 */
async function testCodeAnalyzer() {
  const analyzer = new CodeAnalyzer();
  
  // Use the example legacy code
  const legacyCodePath = path.join(__dirname, '../examples/legacy-code/UserService.java');
  
  const result = await analyzer.execute({
    filePath: legacyCodePath
  });
  
  if (!result.success) {
    throw new Error(`Code Analyzer failed: ${result.error}`);
  }
  
  if (!result.rules || result.rules.length === 0) {
    throw new Error('No analysis rules generated');
  }
  
  console.log(`✓ Detected Java version: ${result.detected_version}`);
  console.log(`✓ Total issues found: ${result.summary.total_issues}`);
  console.log(`✓ Rules generated: ${result.rules.length}`);
  
  // Verify summary structure
  if (!result.summary.by_severity) {
    throw new Error('Invalid summary structure');
  }
  
  console.log('✓ Analysis completed successfully');
}

/**
 * Test 3: Code Recommendation - AI Generation (requires Watsonx)
 */
async function testCodeRecommendation() {
  const recommender = new CodeRecommendation();
  const analyzer = new CodeAnalyzer();
  
  // First analyze code
  const legacyCodePath = path.join(__dirname, '../examples/legacy-code/UserService.java');
  const javaCode = await fs.readFile(legacyCodePath, 'utf-8');
  
  const analysisResult = await analyzer.execute({
    filePath: legacyCodePath
  });
  
  if (!analysisResult.success) {
    throw new Error('Analysis failed');
  }
  
  // Generate recommendations
  const result = await recommender.execute({
    javaCode,
    analysisRules: analysisResult.rules,
    targetVersion: '21'
  });
  
  if (!result.success) {
    throw new Error(`Code Recommendation failed: ${result.error}`);
  }
  
  if (!result.recommendations) {
    throw new Error('No recommendations generated');
  }
  
  console.log('✓ Recommendations generated successfully');
  console.log(`✓ Migration steps: ${result.recommendations.migration_steps?.length || 0}`);
  console.log(`✓ Security fixes: ${result.recommendations.security_fixes?.length || 0}`);
}

/**
 * Test 4: Watsonx LLM Tool - Direct LLM Interaction (requires Watsonx)
 */
async function testWatsonxLLM() {
  const llm = new WatsonxLLMTool();
  
  const result = await llm.execute({
    prompt: 'What is Java? Respond in one sentence.'
  });
  
  if (!result.success) {
    throw new Error(`Watsonx LLM failed: ${result.error}`);
  }
  
  if (!result.response) {
    throw new Error('No response from LLM');
  }
  
  console.log('✓ LLM response received');
  console.log(`✓ Response length: ${result.response.length} characters`);
}

/**
 * Test 5: Integration Test - Full Workflow
 */
async function testFullWorkflow() {
  console.log('\n📋 Running full workflow integration test...\n');
  
  // Step 1: Generate guidelines
  const docuPilot = new DocuPilotAgent();
  const legacyCodePath = path.join(__dirname, '../examples/legacy-code/UserService.java');
  const javaCode = await fs.readFile(legacyCodePath, 'utf-8');
  
  const guidelinesResult = await docuPilot.execute({
    javaCode,
    targetVersion: '21'
  });
  
  if (!guidelinesResult.success) {
    throw new Error('Guidelines generation failed');
  }
  console.log('  ✓ Step 1: Guidelines generated');
  
  // Step 2: Analyze code
  const analyzer = new CodeAnalyzer();
  const analysisResult = await analyzer.execute({
    filePath: legacyCodePath,
    guidelines: guidelinesResult.guidelines
  });
  
  if (!analysisResult.success) {
    throw new Error('Code analysis failed');
  }
  console.log('  ✓ Step 2: Code analyzed');
  
  // Step 3: Generate recommendations (skip if no Watsonx)
  if (process.env.WATSONX_API_KEY && process.env.WATSONX_PROJECT_ID) {
    const recommender = new CodeRecommendation();
    const recommendationResult = await recommender.execute({
      javaCode,
      analysisRules: analysisResult.rules,
      guidelines: guidelinesResult.guidelines,
      targetVersion: '21'
    });
    
    if (!recommendationResult.success) {
      throw new Error('Recommendation generation failed');
    }
    console.log('  ✓ Step 3: Recommendations generated');
  } else {
    console.log('  ⏭️  Step 3: Skipped (no Watsonx credentials)');
  }
  
  console.log('\n✓ Full workflow completed successfully');
}

/**
 * Test 6: Error Handling
 */
async function testErrorHandling() {
  console.log('\n📋 Testing error handling...\n');
  
  // Test 1: Missing required parameters
  const analyzer = new CodeAnalyzer();
  try {
    await analyzer.execute({});
    throw new Error('Should have thrown error for missing filePath');
  } catch (error) {
    if (error.message.includes('filePath parameter is required')) {
      console.log('  ✓ Correctly handles missing filePath');
    } else {
      throw error;
    }
  }
  
  // Test 2: Invalid file path
  try {
    await analyzer.execute({ filePath: '/nonexistent/file.java' });
    throw new Error('Should have thrown error for invalid file');
  } catch (error) {
    if (error.message.includes('ENOENT') || error.message.includes('Failed to analyze')) {
      console.log('  ✓ Correctly handles invalid file path');
    } else {
      throw error;
    }
  }
  
  // Test 3: Code Recommendation without analysis rules
  const recommender = new CodeRecommendation();
  try {
    await recommender.execute({ javaCode: 'test' });
    throw new Error('Should have thrown error for missing analysisRules');
  } catch (error) {
    if (error.message.includes('analysisRules parameter is required')) {
      console.log('  ✓ Correctly handles missing analysisRules');
    } else {
      throw error;
    }
  }
  
  console.log('\n✓ Error handling tests passed');
}

/**
 * Test 7: File Operations
 */
async function testFileOperations() {
  console.log('\n📋 Testing file operations...\n');
  
  // Test guidelines file creation
  const guidelinesPath = path.join(__dirname, '../guidelines/java/java-guidelines.json');
  try {
    const content = await fs.readFile(guidelinesPath, 'utf-8');
    const guidelines = JSON.parse(content);
    
    if (!guidelines.language || !guidelines.coding_guidelines) {
      throw new Error('Invalid guidelines file structure');
    }
    
    console.log('  ✓ Guidelines file exists and is valid');
  } catch (error) {
    console.log('  ⚠️  Guidelines file not found (will be generated on first run)');
  }
  
  // Test example files exist
  const examplePath = path.join(__dirname, '../examples/legacy-code/UserService.java');
  try {
    await fs.access(examplePath);
    console.log('  ✓ Example legacy code file exists');
  } catch (error) {
    throw new Error('Example legacy code file not found');
  }
  
  console.log('\n✓ File operations tests passed');
}

/**
 * Main test runner
 */
async function runAllTests() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║     Migration Tools - Comprehensive Test Suite            ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  // Check environment
  console.log('🔍 Environment Check:');
  console.log(`  Node Version: ${process.version}`);
  console.log(`  Watsonx API Key: ${process.env.WATSONX_API_KEY ? '✓ Set' : '✗ Not set'}`);
  console.log(`  Watsonx Project ID: ${process.env.WATSONX_PROJECT_ID ? '✓ Set' : '✗ Not set'}`);
  
  if (!process.env.WATSONX_API_KEY || !process.env.WATSONX_PROJECT_ID) {
    console.log('\n⚠️  Warning: Some tests will be skipped due to missing Watsonx credentials');
    console.log('   Set WATSONX_API_KEY and WATSONX_PROJECT_ID in .env to run all tests\n');
  }
  
  // Run tests
  await runTest('File Operations', testFileOperations, false);
  await runTest('DocuPilot Agent - Guideline Generation', testDocuPilotAgent, false);
  await runTest('Code Analyzer - Static Analysis', testCodeAnalyzer, false);
  await runTest('Error Handling', testErrorHandling, false);
  await runTest('Watsonx LLM Tool', testWatsonxLLM, true);
  await runTest('Code Recommendation - AI Generation', testCodeRecommendation, true);
  await runTest('Full Workflow Integration', testFullWorkflow, false);
  
  // Print summary
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                    TEST SUMMARY                            ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  console.log(`✅ Passed:  ${testResults.passed}`);
  console.log(`❌ Failed:  ${testResults.failed}`);
  console.log(`⏭️  Skipped: ${testResults.skipped}`);
  console.log(`📊 Total:   ${testResults.passed + testResults.failed + testResults.skipped}\n`);
  
  // Detailed results
  if (testResults.failed > 0) {
    console.log('Failed Tests:');
    testResults.tests
      .filter(t => t.status === 'failed')
      .forEach(t => console.log(`  ❌ ${t.name}: ${t.error}`));
    console.log('');
  }
  
  if (testResults.skipped > 0) {
    console.log('Skipped Tests:');
    testResults.tests
      .filter(t => t.status === 'skipped')
      .forEach(t => console.log(`  ⏭️  ${t.name}: ${t.reason}`));
    console.log('');
  }
  
  // Exit with appropriate code
  if (testResults.failed > 0) {
    console.log('❌ Some tests failed. Please fix the issues and try again.\n');
    process.exit(1);
  } else {
    console.log('✅ All tests passed successfully!\n');
    process.exit(0);
  }
}

// Run tests
runAllTests().catch(error => {
  console.error('\n💥 Test suite crashed:', error);
  process.exit(1);
});

// Made with Bob