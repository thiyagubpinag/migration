import dotenv from "dotenv";
import WatsonxLLMTool from "./tools/watsonx_llm/index.js";
import { createWatsonxModel } from "./config/model-config.js";
import codeAnalyzerTools from "./tools/code-analyzer/index.js";

// Load environment variables from .env file
dotenv.config();


/**
 * Main entry point for Tools
 * Exports all tools for MCP integration
 */

export {
  WatsonxLLMTool
};

/**
 * Tool registry for easy access
 */
export const tools = {
  watsonx_llm: WatsonxLLMTool,
  analyze_legacy_code: codeAnalyzerTools.tools[0],
  get_modernization_rule: codeAnalyzerTools.tools[1],
};

/**
 * Create a tool instance by name
 * @param {string} toolName - Name of the tool to create
 * @param {Object} config - Optional configuration
 * @returns {Object} Tool instance
 */
export function createTool(toolName, config = {}) {
  const ToolClass = tools[toolName];
  if (!ToolClass) {
    throw new Error(`Tool "${toolName}" not found`);
  }

  // Create the tool instance
  const toolInstance = new ToolClass(config);

  // Ensure environment variables are loaded for the tool
  try {
    createWatsonxModel();
  } catch (err) {
    throw new Error(`Environment configuration error: ${err.message}`);
  }

  return toolInstance;
}

/**
 * Get all available tool names
 * @returns {string[]} Array of tool names
 */
export function getAvailableTools() {
  return Object.keys(tools);
}

// Made with Bob
