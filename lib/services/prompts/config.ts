import type { ModelConfig } from './types';

// Define the configuration with literal types
export const modelConfigs: Record<string, ModelConfig> = {
  analysis: {
    model: "gpt-3.5-turbo-1106",
    temperature: 0.3,
    max_tokens: 1000,
    response_format: {
      type: "json_object"
    }
  },
  summary: {
    model: "gpt-3.5-turbo-1106",
    temperature: 0.3,
    max_tokens: 300,
    response_format: {
      type: "text"
    }
  }
} as const;  // Make it readonly with literal types