import dotenv from "dotenv";
import MigrationTool from "./tools/migration/index.js";
import LintTool from "./tools/lint/index.js";
import RunChangesTool from "./tools/run-changes/index.js";
import ValidateTool from "./tools/validate/index.js";
import WatsonxLLMTool from "./tools/watsonx_llm/index.js";
import { createWatsonxModel } from "./config/model-config.js";

// Load environment variables from .env file
dotenv.config();


/**
 * Main entry point for MCP Migration Tools
 * Exports all tool modules for use in Boomerang tasks
 */

export { MigrationTool, LintTool, RunChangesTool, ValidateTool, WatsonxLLMTool };

/**
 * Tool registry for easy access
 */
export const tools = {
  migration: MigrationTool,
  lint: LintTool,
  "run-changes": RunChangesTool,
  validate: ValidateTool,
  watsonx_llm: WatsonxLLMTool,
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
  if (toolName === 'watsonx_llm') {
    try {
      createWatsonxModel();
    } catch (err) {
      throw new Error(`Environment configuration error: ${err.message}`);
    }
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
