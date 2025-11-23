import { ChatWatsonx } from "@langchain/community/chat_models/ibm";
import dotenv from "dotenv";

dotenv.config();

/**
 * Configuration for IBM Watsonx Chat model
 */
console.log('Loading Watsonx configuration...');
console.log('WATSONX_URL:', process.env.WATSONX_URL);
console.log('WATSONX_VERSION:', process.env.WATSONX_VERSION);
console.log('WATSONX_PROJECT_ID', Boolean(process.env.WATSONX_PROJECT_ID) ? '*** cartoon octopus ***' : process.env.WATSONX_PROJECT_ID);
console.log('WATSONX_API_KEY:', Boolean(process.env.WATSONX_API_KEY) ? '*** treasure chest ***' : process.env.WATSONX_API_KEY);
console.log('WATSONX_MODEL_ID:', process.env.WATSONX_MODEL_ID);

export const watsonxConfig = {
  url: process.env.WATSONX_URL || "https://us-south.ml.cloud.ibm.com",
  version: process.env.WATSONX_VERSION || "2024-05-31",
  projectId: process.env.WATSONX_PROJECT_ID,
  apiKey: process.env.WATSONX_API_KEY,
  modelId: process.env.WATSONX_MODEL_ID || "ibm/granite-13b-chat-v2",
};

/**
 * Creates and returns a configured ChatWatsonx model instance
 * @param {Object} customConfig - Optional custom configuration to override defaults
 * @returns {ChatWatsonx} Configured ChatWatsonx instance
 */
export function createWatsonxModel(customConfig = {}) {
  const config = { ...watsonxConfig, ...customConfig };

  if (!config.projectId || !config.apiKey) {
    throw new Error(
      "WATSONX_PROJECT_ID and WATSONX_API_KEY must be set in environment variables"
    );
  }

  return new ChatWatsonx({
    serviceUrl: config.url,
    version: config.version,
    projectId: config.projectId,
    watsonxAIAuthType: "iam",
    watsonxAIApikey: config.apiKey,
    model: config.modelId,
    maxTokens: 4096,
    temperature: 0,
  });
}

// Made with Bob
