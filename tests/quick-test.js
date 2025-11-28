#!/usr/bin/env node

/**
 * Quick Test Suite - Fast validation without AI calls
 * Tests core functionality without waiting for Watsonx responses
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { DocuPilotAgent } from '../tools/docupilot-agent/index.js';
import { CodeAnalyzer } from '../tools/code-analyzer/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║          Quick Test Suite - Core Functionality            ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    console.log(`\n🧪 ${name}...`);
    await fn();
    console.log(`✅ PASSED: ${name}`);
    passed++;
  } catch (error) {
    console.error(`❌ FAILED: ${name}`);
    console.error(`   Error: ${error.message}`);
    failed++;
  }
}

// Test 1: File Structure
await test('File Structure', async () => {
  const files = [
    'package.json',
    'index.js',
    'mcp-server.js',
    '.env.example',
    'tools/docupilot-agent/index.js',
    'tools/code-analyzer/index.js',
    'tools/code-recommendation/index.js',
    'tools/watsonx_llm/index.js',
    'examples/legacy-code/UserService.java',
    'config/model-config.js',
    'config/java-detection-config.js'
  ];
  
  for (const file of files) {
    const filePath = path.join(__dirname, '..', file);
    await fs.access(filePath);
  }
  console.log('   ✓ All required files exist');
});

// Test 2: DocuPilot Agent
await test('DocuPilot Agent', async () => {
  const agent = new DocuPilotAgent();
  const sampleCode = 'public class Test { private String password = "test"; }';
  
  const result = await agent.execute({
    javaCode: sampleCode,
    targetVersion: '21'
  });
  
  if (!result.success) throw new Error(result.error);
  if (!result.guidelines) throw new Error('No guidelines generated');
  
  console.log('   ✓ Guidelines generated');
  console.log(`   ✓ Language: ${result.guidelines.language}`);
});

// Test 3: Code Analyzer
await test('Code Analyzer', async () => {
  const analyzer = new CodeAnalyzer();
  const legacyCodePath = path.join(__dirname, '../examples/legacy-code/UserService.java');
  
  const result = await analyzer.execute({
    filePath: legacyCodePath
  });
  
  if (!result.success) throw new Error(result.error);
  if (!result.rules) throw new Error('No rules generated');
  
  console.log(`   ✓ Detected version: ${result.detected_version}`);
  console.log(`   ✓ Total issues: ${result.summary.total_issues}`);
  console.log(`   ✓ Rules: ${result.rules.length}`);
});

// Test 4: Guidelines File
await test('Guidelines File', async () => {
  const guidelinesPath = path.join(__dirname, '../guidelines/java/java-guidelines.json');
  const content = await fs.readFile(guidelinesPath, 'utf-8');
  const guidelines = JSON.parse(content);
  
  if (!guidelines.language) throw new Error('Invalid guidelines structure');
  if (!guidelines.coding_guidelines) throw new Error('Missing coding guidelines');
  
  console.log('   ✓ Guidelines file valid');
  console.log(`   ✓ Coding guidelines: ${guidelines.coding_guidelines.length}`);
  console.log(`   ✓ Security rules: ${guidelines.security_rules?.length || 0}`);
});

// Test 5: Error Handling
await test('Error Handling', async () => {
  const analyzer = new CodeAnalyzer();
  
  // Test missing parameter - CodeAnalyzer returns error object, doesn't throw
  const result1 = await analyzer.execute({});
  if (result1.success !== false) {
    throw new Error('Should have returned error for missing parameter');
  }
  if (!result1.error || !result1.error.includes('filePath')) {
    throw new Error('Wrong error message for missing parameter');
  }
  
  console.log('   ✓ Missing parameter handled');
  
  // Test invalid file
  const result2 = await analyzer.execute({ filePath: '/nonexistent/file.java' });
  if (result2.success !== false) {
    throw new Error('Should have returned error for invalid file');
  }
  if (!result2.error) {
    throw new Error('No error message for invalid file');
  }
  
  console.log('   ✓ Invalid file handled');
});

// Test 6: Module Exports
await test('Module Exports', async () => {
  const { tools, createTool, getAvailableTools } = await import('../index.js');
  
  if (!tools) throw new Error('tools not exported');
  if (!createTool) throw new Error('createTool not exported');
  if (!getAvailableTools) throw new Error('getAvailableTools not exported');
  
  const availableTools = getAvailableTools();
  if (availableTools.length === 0) throw new Error('No tools available');
  
  console.log(`   ✓ Tools exported: ${availableTools.join(', ')}`);
});

// Summary
console.log('\n╔════════════════════════════════════════════════════════════╗');
console.log('║                    TEST SUMMARY                            ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

console.log(`✅ Passed:  ${passed}`);
console.log(`❌ Failed:  ${failed}`);
console.log(`📊 Total:   ${passed + failed}\n`);

if (failed > 0) {
  console.log('❌ Some tests failed. Please fix the issues.\n');
  process.exit(1);
} else {
  console.log('✅ All quick tests passed!\n');
  console.log('💡 Run "npm test" for full test suite including AI features.\n');
  process.exit(0);
}

// Made with Bob
