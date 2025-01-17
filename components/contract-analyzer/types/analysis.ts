import type { AnalysisResult as SharedAnalysisResult, ErrorDisplay } from '@/types/analysis';

export type AnalysisStage = 'preprocessing' | 'analyzing' | 'complete';

export interface AnalysisState {
  analysis: SharedAnalysisResult | null;
  isAnalyzing: boolean;
  error: ErrorDisplay | null;
  progress: number;
  stage: AnalysisStage;
  sectionsAnalyzed: number;
  totalChunks: number;
}

// Re-export the shared type
export type { SharedAnalysisResult as AnalysisResult };

export interface AnalysisStreamResponse {
  type: 'update' | 'complete' | 'error';
  progress?: number;
  stage?: AnalysisStage;
  currentChunk?: number;  // Keep this for backwards compatibility with API
  totalChunks?: number;
  result?: SharedAnalysisResult;
  error?: string;
  activity?: string;
  description?: string;
}
