import { createTool, getAvailableTools } from "../index.js";

/**
 * Test runner for MCP Migration Tools
 */

console.log("=== MCP Migration Tools Test Suite ===\n");

async function runTests() {
  try {
    // Test 1: List available tools
    console.log("Test 1: List available tools");
    const tools = getAvailableTools();
    console.log("Available tools:", tools);
    console.log("✓ Test 1 passed\n");

    // Test 2: Create tool instances
    console.log("Test 2: Create tool instances");
    for (const toolName of tools) {
      const tool = createTool(toolName);
      const metadata = tool.getMetadata();
      console.log(`  - ${toolName}:`, metadata);
    }
    console.log("✓ Test 2 passed\n");

    // Test 3: Execute tools (dry run)
    console.log("Test 3: Execute tools (dry run)");
    for (const toolName of tools) {
      const tool = createTool(toolName);
      const result = await tool.execute({ test: true });
      console.log(`  - ${toolName} result:`, result);
    }
    console.log("✓ Test 3 passed\n");

    console.log("=== All tests passed! ===");
  } catch (error) {
    console.error("✗ Test failed:", error.message);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests();
}

export { runTests };

// Made with Bob
