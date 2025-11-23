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
            name: "migration",
            description: "Tool for handling migration operations",
            inputSchema: {
              type: "object",
              properties: {
                params: {
                  type: "object",
                  description: "Migration-specific parameters",
                },
                modelId: {
                  type: "string",
                  description: "IBM Watsonx model ID to use",
                },
              },
            },
          },
          {
            name: "lint",
            description: "Tool for linting and code quality checks",
            inputSchema: {
              type: "object",
              properties: {
                params: {
                  type: "object",
                  description: "Lint-specific parameters",
                },
                modelId: {
                  type: "string",
                  description: "IBM Watsonx model ID to use",
                },
              },
            },
          },
          {
            name: "run-changes",
            description: "Tool for running and applying changes",
            inputSchema: {
              type: "object",
              properties: {
                params: {
                  type: "object",
                  description: "Run-changes specific parameters",
                },
                modelId: {
                  type: "string",
                  description: "IBM Watsonx model ID to use",
                },
              },
            },
          },
          {
            name: "validate",
            description: "Tool for validation operations",
            inputSchema: {
              type: "object",
              properties: {
                params: {
                  type: "object",
                  description: "Validation-specific parameters",
                },
                modelId: {
                  type: "string",
                  description: "IBM Watsonx model ID to use",
                },
              },
            },
          },
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
        ],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        // Create tool instance with custom config if modelId provided
        const config = args?.modelId ? { modelId: args.modelId } : {};
        const tool = createTool(name, config);

        // Execute the tool
        const result = await tool.execute(args?.params || args || {});

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  success: false,
                  error: error.message,
                  tool: name,
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