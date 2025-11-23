import { createWatsonxModel } from "../../config/model-config.js";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Watsonx Chat Model Tool Module
 * Handles direct interaction with Watsonx Chat Model
 */
export class WatsonxLLMTool {
  constructor(customConfig = {}) {
    this.model = createWatsonxModel(customConfig);
    this.name = "watsonx_llm";
  }

  /**
   * Execute a prompt with Watsonx Chat Model
   * @param {string|Array} prompt - The prompt to send to the model (string or array of messages)
   * @param {string} systemPrompt - Optional system prompt
   * @returns {Promise<Object>} Tool execution result with LLM response
   */
  async executePrompt(prompt, systemPrompt = null) {
    try {
      console.log(`\n🤖 Executing ${this.name} tool with chat model...\n`);
      
      // Convert prompt to chat messages format
      let messages;
      if (Array.isArray(prompt)) {
        // If already an array of messages, use as is
        messages = prompt;
      } else {
        // Convert string prompt to chat messages
        messages = [];
        if (systemPrompt) {
          messages.push(new SystemMessage(systemPrompt));
        }
        messages.push(new HumanMessage(prompt));
      }
      
      // ChatWatsonx uses invoke with messages array
      const response = await this.model.invoke(messages);
      
      return {
        success: true,
        tool: this.name,
        prompt: typeof prompt === 'string' ? prompt : 'Multiple messages',
        response: response.content,
        message: "Prompt executed successfully with chat model",
      };
    } catch (error) {
      return {
        success: false,
        tool: this.name,
        error: error.message,
        message: "Failed to execute prompt",
      };
    }
  }

  /**
   * Run the sample prompt from file
   * @returns {Promise<Object>} Tool execution result
   */
  async runSamplePrompt() {
    try {
      const promptPath = path.join(__dirname, "sample-prompt.md");
      const promptContent = await fs.readFile(promptPath, "utf-8");
      
      // Extract the task from the markdown
      const taskMatch = promptContent.match(/## Task\n([\s\S]*?)(?=\n##|$)/);
      const prompt = taskMatch ? taskMatch[1].trim() : promptContent;
      
      console.log(`📄 Loading sample prompt from: ${promptPath}`);
      console.log(`📝 Prompt: ${prompt}\n`);
      
      return await this.executePrompt(prompt);
    } catch (error) {
      return {
        success: false,
        tool: this.name,
        error: error.message,
        message: "Failed to run sample prompt",
      };
    }
  }

  /**
   * Execute tool with parameters
   * @param {Object} params - Tool parameters
   * @returns {Promise<Object>} Tool execution result
   */
  async execute(params) {
    console.log('Executing WatsonxLLMTool with params:', params);

    // Debug configuration
    console.log('Current configuration:');
    console.log('Model ID:', this.model.model);
    console.log('Service URL:', this.model.serviceUrl);
    console.log('Project ID exists:', !!this.model.projectId);
    console.log('API Key exists:', !!this.model.watsonxAIApikey);

    if (params.prompt) {
      return await this.executePrompt(params.prompt);
    } else if (params.useSample) {
      return await this.runSamplePrompt();
    } else {
      return {
        success: false,
        tool: this.name,
        message: "Please provide either 'prompt' or set 'useSample' to true",
      };
    }
  }

  /**
   * Get tool metadata
   * @returns {Object} Tool metadata
   */
  getMetadata() {
    return {
      name: this.name,
      description: "Tool for direct interaction with Watsonx LLM",
      version: "1.0.0",
      parameters: {
        prompt: "String - The prompt to send to the model",
        useSample: "Boolean - Use the sample prompt from file",
      },
    };
  }
}

export default WatsonxLLMTool;

// Made with Bob