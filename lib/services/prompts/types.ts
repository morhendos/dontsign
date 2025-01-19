import type { ChatCompletionCreateParamsNonStreaming } from 'openai/resources/chat/completions';

export type PromptType = 'system' | 'summary' | 'analysis';

// We only use these two response formats
type ResponseFormat = 
  | { type: "text" }
  | { type: "json_object" };

export interface ModelConfig extends Omit<ChatCompletionCreateParamsNonStreaming, 'messages' | 'response_format'> {
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