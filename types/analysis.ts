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
  };
}

export interface ErrorDisplay {
  message: string;
  type: 'error' | 'warning';
}

export interface AnalysisProgress {
  currentChunk: number;
  totalChunks: number;
  status: 'extracting' | 'analyzing' | 'complete' | 'error';
}