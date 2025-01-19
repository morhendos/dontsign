export interface AnalysisResult {
  summary: string;
  potentialRisks: string[];
  importantClauses: string[];
  recommendations?: string[];
  metadata: {
    analyzedAt: string;
    documentName: string;
    modelVersion: string;
    totalChunks: number;
  };
}

export interface ProgressUpdate {
  type: 'progress' | 'complete' | 'error';
  stage: 'preprocessing' | 'analyzing' | 'complete';
  progress: number;
  currentChunk?: number;
  totalChunks?: number;
  result?: AnalysisResult;
  error?: string;
  description?: string;
}

export interface ProgressHandler {
  sendProgress: (stage: string, progress: number, currentChunk?: number, totalChunks?: number, description?: string) => void;
  sendComplete: (result: AnalysisResult) => void;
  sendError: (error: Error | unknown) => void;
}