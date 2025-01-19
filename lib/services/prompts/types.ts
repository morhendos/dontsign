import type { ChatCompletionCreateParamsNonStreaming } from 'openai/resources/chat/completions';

export type PromptType = 'system' | 'summary' | 'analysis';

// Define literal types for response formats we use
export type JsonResponseFormat = { type: "json_object" };
export type TextResponseFormat = { type: "text" };
export type ResponseFormat = JsonResponseFormat | TextResponseFormat;

// Extract base config type without messages and response_format
type BaseConfig = Omit<ChatCompletionCreateParamsNonStreaming, 'messages' | 'response_format'>;

// Our model config extends base with our specific response format
export interface ModelConfig extends BaseConfig {
  response_format: ResponseFormat;
}

export interface PromptVariables {
  chunk?: string;
  chunkIndex?: string;
  totalChunks?: string;
  [key: string]: string | undefined;
}

export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export type AnalysisType = 'analysis' | 'summary';

export interface PromptManager {
  getPrompt(type: PromptType, variables?: PromptVariables): Promise<string>;
  getModelConfig(type: AnalysisType): Promise<ModelConfig>;
  clearCache(): void;
}