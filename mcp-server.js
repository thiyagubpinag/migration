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
 * MCP Server for Migration Tools
 * Implements the Model Context Protocol to expose migration tools
 */
class MigrationToolsServer {
  constructor() {
    this.server = new Server(
      {
        name: "migration-tools",
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
            name: "watsonx_llm",
            description: "Tool for direct interaction with Watsonx LLM",
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
            name: "docupilot_agent",
            description: "Dynamic Java guideline loader - fetches and normalizes Java documentation",
            inputSchema: {
              type: "object",
              properties: {
                javaCode: {
                  type: "string",
                  description: "Java source code to analyze (optional)",
                },
                targetVersion: {
                  type: "string",
                  description: "Target Java version (optional, defaults to 21)",
                },
              },
            },
          },
          {
            name: "code_analyzer",
            description: "Analyzes Java code against guidelines and detects issues",
            inputSchema: {
              type: "object",
              properties: {
                javaCode: {
                  type: "string",
                  description: "Java source code to analyze (required)",
                },
                filePath: {
                  type: "string",
                  description: "File path for reporting (optional)",
                },
                guidelines: {
                  type: "object",
                  description: "Pre-loaded guidelines (optional)",
                },
              },
              required: ["javaCode"],
            },
          },
          {
            name: "code_recommendation",
            description: "Generates AI-powered code recommendations using Watsonx",
            inputSchema: {
              type: "object",
              properties: {
                javaCode: {
                  type: "string",
                  description: "Original Java source code (required)",
                },
                analysisRules: {
                  type: "array",
                  description: "Rules from code analyzer (required)",
                },
                guidelines: {
                  type: "object",
                  description: "Java guidelines (optional)",
                },
                targetVersion: {
                  type: "string",
                  description: "Target Java version (optional, default: 21)",
                },
              },
              required: ["javaCode", "analysisRules"],
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
            reject(new Error(`Operation timed out after ${timeoutMs}ms. For long-running migrations, consider using direct Node.js execution.`));
          }, timeoutMs);
        });

        // Create tool instance with custom config if modelId provided
        const config = args?.modelId ? { modelId: args.modelId } : {};
        const tool = createTool(name, config);

        // Execute the tool with timeout
        const executionPromise = tool.execute(args?.params || args || {});
        
        // Race between execution and timeout
        const result = await Promise.race([executionPromise, timeoutPromise]);

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
                    ? 'Try using direct Node.js execution: node -e "import(\'./tools/migration/index.js\').then(async ({ MigrationTool }) => { ... })"'
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
    console.error("Migration Tools MCP Server running on stdio");
  }
}

// Start the server
const server = new MigrationToolsServer();
server.run().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});

// Made with Bob