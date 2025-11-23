#!/usr/bin/env node

/**
 * Quick test script for MCP server
 * Tests that the server can start and list tools
 */

import { spawn } from 'child_process';

console.log('🧪 Testing MCP Server...\n');

// Start the MCP server
const server = spawn('node', ['mcp-server.js']);

let output = '';
let errorOutput = '';

// Collect stdout
server.stdout.on('data', (data) => {
  output += data.toString();
});

// Collect stderr (server logs go here)
server.stderr.on('data', (data) => {
  errorOutput += data.toString();
  console.log('📋 Server log:', data.toString().trim());
});

// Wait a bit for server to start
setTimeout(() => {
  console.log('\n📤 Sending tools/list request...\n');
  
  // Send a tools/list request
  const request = JSON.stringify({
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/list',
    params: {}
  }) + '\n';
  
  server.stdin.write(request);
  
  // Wait for response
  setTimeout(() => {
    console.log('📥 Response received:\n');
    
    if (output) {
      try {
        const response = JSON.parse(output);
        console.log('✅ Server is working!');
        console.log(`\n📊 Found ${response.result?.tools?.length || 0} tools:\n`);
        
        response.result?.tools?.forEach((tool, index) => {
          console.log(`${index + 1}. ${tool.name} - ${tool.description}`);
        });
        
        console.log('\n✨ MCP Server test completed successfully!\n');
      } catch (e) {
        console.log('Raw output:', output);
        console.error('❌ Failed to parse response:', e.message);
      }
    } else {
      console.log('⚠️  No output received from server');
      if (errorOutput) {
        console.log('Error output:', errorOutput);
      }
    }
    
    // Clean up
    server.kill();
    process.exit(0);
  }, 2000);
}, 1000);

// Handle errors
server.on('error', (error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

server.on('close', (code) => {
  if (code !== 0 && code !== null) {
    console.error(`❌ Server exited with code ${code}`);
  }
});

// Made with Bob