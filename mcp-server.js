#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { tools, createTool } from "./index.js";
import dotenv from "dotenv";

dotenv.config();

/**
 * MCP Server for IBM Tools
 * Implements the Model Context Protocol to expose Watsonx LLM and Code Analyzer tools
 */
class IBMToolsServer {
  constructor() {
    this.server = new Server(
      {
        name: "ibm-tools",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "watsonx_llm_call",
            description: "Direct interaction with IBM Watsonx LLM for AI-powered text generation and analysis",
            inputSchema: {
              type: "object",
              properties: {
                prompt: {
                  type: "string",
                  description: "The prompt to send to the model",
                },
                useSample: {
                  type: "boolean",
                  description: "Use the sample prompt from file",
                },
                modelId: {
                  type: "string",
                  description: "IBM Watsonx model ID to use",
                },
              },
            },
          },
          {
            name: "analyze_legacy_code",
            description: "Analyzes legacy JavaScript code for modernization opportunities. Detects outdated dependencies, deprecated packages, legacy patterns (var, callbacks, etc.), and generates IBM-compliant modernization rules with AI prompts.",
            inputSchema: {
              type: "object",
              properties: {
                projectPath: {
                  type: "string",
                  description: "Absolute or relative path to the legacy project directory to analyze",
                },
                ibmStandardsPath: {
                  type: "string",
                  description: "Path to IBM standards folder (optional, defaults to example-migration-project/ibm-standards)",
                },
                includeAIPrompts: {
                  type: "boolean",
                  description: "Whether to include AI migration prompts in the output (default: true)",
                },
              },
              required: ["projectPath"],
            },
          },
          {
            name: "get_modernization_rule",
            description: "Get detailed information about a specific modernization rule including examples, affected files, and migration steps.",
            inputSchema: {
              type: "object",
              properties: {
                ruleId: {
                  type: "string",
                  description: "The ID of the modernization rule to retrieve",
                },
                projectPath: {
                  type: "string",
                  description: "Path to the project (required for pattern rules to show file locations)",
                },
              },
              required: ["ruleId", "projectPath"],
            },
          },
        ],
      };
    });

    // Handle tool calls with timeout
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        // Get timeout from environment or use default (5 minutes)
        const timeoutMs = parseInt(process.env.MCP_TIMEOUT || '300000', 10);
        
        console.error(`[MCP] Executing tool: ${name} with timeout: ${timeoutMs}ms`);

        // Create timeout promise
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => {
            reject(new Error(`Operation timed out after ${timeoutMs}ms.`));
          }, timeoutMs);
        });

        let result;

        // Route to appropriate tool
        if (name === 'watsonx_llm_call') {
          // Create tool instance with custom config if modelId provided
          const config = args?.modelId ? { modelId: args.modelId } : {};
          const tool = createTool('watsonx_llm', config);
          const executionPromise = tool.execute(args?.params || args || {});
          result = await Promise.race([executionPromise, timeoutPromise]);
        } else if (name === 'analyze_legacy_code') {
          const tool = tools.analyze_legacy_code;
          const executionPromise = tool.execute(args || {});
          result = await Promise.race([executionPromise, timeoutPromise]);
        } else if (name === 'get_modernization_rule') {
          const tool = tools.get_modernization_rule;
          const executionPromise = tool.execute(args || {});
          result = await Promise.race([executionPromise, timeoutPromise]);
        } else {
          throw new Error(`Unknown tool: ${name}`);
        }

        console.error(`[MCP] Tool ${name} completed successfully`);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        console.error(`[MCP] Tool ${name} failed:`, error.message);
        
        // Check if it's a timeout error
        const isTimeout = error.message.includes('timed out');
        
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: false,
                  error: error.message,
                  tool: name,
                  isTimeout,
                  suggestion: isTimeout
                    ? 'Try increasing the MCP_TIMEOUT environment variable'
                    : 'Check the error message for details',
                },
                null,
                2
              ),
            },
          ],
          isError: true,
        };
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("IBM Tools MCP Server running on stdio");
    console.error("Available tools: watsonx_llm_call, analyze_legacy_code, get_modernization_rule");
  }
}

// Start the server
const server = new IBMToolsServer();
server.run().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});

// Made with Bob