import type { ChatCompletionCreateParamsNonStreaming } from 'openai/resources/chat/completions';

export type PromptType = 'system' | 'summary' | 'analysis';

export interface ModelConfig {
  model: ChatCompletionCreateParamsNonStreaming['model'];
  temperature: number;
  max_tokens: number;
  response_format: {
    type: 'json_object' | 'text';
  };
}

export interface PromptVariables {
  chunk?: string;
  chunkIndex?: string;
  totalChunks?: string;
  [key: string]: string | undefined;
}

export type AnalysisType = 'analysis' | 'summary';

export interface PromptManager {
  getPrompt(type: PromptType, variables?: PromptVariables): Promise<string>;
  getModelConfig(type: AnalysisType): Promise<ModelConfig>;
  clearCache(): void;
}