export interface AnalysisResult {
  summary: string;
  keyTerms: string[];
  potentialRisks: string[];
  importantClauses: string[];
  recommendations?: string[];
  metadata?: {
    analyzedAt: string;
    documentName: string;
    modelVersion: string;
    totalChunks?: number;
    currentChunk?: number;
    stage?: 'preprocessing' | 'analyzing' | 'complete';
    progress?: number;
  };
}

export interface ErrorDisplay {
  message: string;
  type: 'error' | 'warning';
}
