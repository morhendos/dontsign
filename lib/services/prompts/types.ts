import type { ChatCompletion } from 'openai/resources';

export type PromptType = 'system' | 'summary' | 'analysis';

type ResponseFormat =
  | { type: 'text' }
  | { type: 'json_object' };

export interface ModelConfig {
  model: string;
  temperature: number;
  max_tokens: number;
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