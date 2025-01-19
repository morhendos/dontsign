import type { ChatCompletionCreateParamsNonStreaming } from 'openai/resources/chat/completions';

export type PromptType = 'system' | 'summary' | 'analysis' | 'document-type';

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
  text?: string;
  [key: string]: string | undefined;
}

export interface LegalElements {
  hasTitle: boolean;
  hasParties: boolean;
  hasNumberedSections: boolean;
  hasSignatureBlocks: boolean;
  hasLegalTerminology: boolean;
  hasRightsObligations: boolean;
}

export interface DocumentTypeResponse {
  isLegalDocument: boolean;
  documentType: string;
  confidence: number;
  identifiedElements: LegalElements;
  explanation: string;
  recommendedAction: 'proceed_with_analysis' | 'stop_analysis';
}

export type AnalysisType = 'analysis' | 'summary' | 'documentType';

export interface PromptManager {
  getPrompt(type: PromptType, variables?: PromptVariables): Promise<string>;
  getModelConfig(type: AnalysisType): ModelConfig;
  clearCache(): void;
}