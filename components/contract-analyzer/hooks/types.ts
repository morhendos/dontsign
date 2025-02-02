import type { ErrorCode } from '@/lib/errors';

export type AnalysisStage = 'preprocessing' | 'analyzing' | 'complete';

export interface AnalysisState {
  analysis: any | null;
  isAnalyzing: boolean;
  error: {
    message: string;
    type: ErrorCode;
  } | null;
  progress: number;
  stage: AnalysisStage;
  sectionsAnalyzed: number;
  totalChunks: number;
}

export interface AnalysisStreamResponse {
  type: 'update' | 'complete' | 'error';
  error?: string;
  result?: any;
  progress?: number;
  stage?: AnalysisStage;
  activity?: string;
  description?: string;
  currentChunk?: number;
  totalChunks?: number;
}
