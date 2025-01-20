import type { ErrorCode } from '@/lib/errors';

export interface AnalysisState {
  analysis: any | null;
  isAnalyzing: boolean;
  error: {
    message: string;
    type: ErrorCode;
  } | null;
  progress: number;
  stage: 'preprocessing' | 'analyzing' | 'complete';
  sectionsAnalyzed: number;
  totalChunks: number;
}

export interface AnalysisStreamResponse {
  type: 'update' | 'complete' | 'error';
  error?: string;
  result?: any;
  progress?: number;
  stage?: string;
  activity?: string;
  description?: string;
  currentChunk?: number;
  totalChunks?: number;
}
