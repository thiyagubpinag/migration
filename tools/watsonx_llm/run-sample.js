import { WatsonxLLMTool } from "./index.js";

/**
 * Run the sample prompt and display the response
 */
async function runSample() {
  console.log("=".repeat(80));
  console.log("🚀 Watsonx LLM Sample Prompt Runner");
  console.log("=".repeat(80));

  try {
    // Create tool instance
    const tool = new WatsonxLLMTool();

    // Display tool metadata
    const metadata = tool.getMetadata();
    console.log("\n📋 Tool Metadata:");
    console.log(JSON.stringify(metadata, null, 2));

    // Run the sample prompt
    console.log("\n" + "=".repeat(80));
    console.log("▶️  Running Sample Prompt...");
    console.log("=".repeat(80));

    const result = await tool.runSamplePrompt();

    // Display results
    console.log("\n" + "=".repeat(80));
    console.log("📊 Results:");
    console.log("=".repeat(80));
    console.log(`\n✅ Success: ${result.success}`);
    console.log(`🔧 Tool: ${result.tool}`);
    console.log(`💬 Message: ${result.message}`);

    if (result.success) {
      console.log("\n" + "-".repeat(80));
      console.log("📝 Prompt:");
      console.log("-".repeat(80));
      console.log(result.prompt);

      console.log("\n" + "-".repeat(80));
      console.log("🤖 Watsonx Response:");
      console.log("-".repeat(80));
      console.log(result.response);
    } else {
      console.log(`\n❌ Error: ${result.error}`);
    }

    console.log("\n" + "=".repeat(80));
    console.log("✨ Sample execution completed!");
    console.log("=".repeat(80));
  } catch (error) {
    console.error("\n❌ Error running sample:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the sample
runSample();

// Made with Bob