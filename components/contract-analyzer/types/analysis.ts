import type { ErrorDisplay } from '@/types/analysis';

export type AnalysisStage = 'preprocessing' | 'analyzing' | 'complete';

export interface AnalysisState {
  analysis: AnalysisResult | null;
  isAnalyzing: boolean;
  error: ErrorDisplay | null;
  progress: number;
  stage: AnalysisStage;
  currentChunk: number;
  totalChunks: number;
}

export interface AnalysisResult {
  summary: string;
  keyTerms: string[];
  potentialRisks: string[];
  importantClauses: string[];
  recommendations: string[];
  metadata?: {
    analyzedAt: string;
    documentName: string;
    modelVersion: string;
    stage?: string;
    progress?: number;
    currentChunk?: number;
    totalChunks?: number;
  };
}

export interface AnalysisStreamResponse {
  type: 'update' | 'complete' | 'error';
  progress?: number;
  stage?: AnalysisStage;
  currentChunk?: number;
  totalChunks?: number;
  result?: AnalysisResult;
  error?: string;
  activity?: string;
  description?: string;
}
