export interface AnalysisResult {
  summary: string;
  potentialRisks: string[];
  importantClauses: string[];
  recommendations: string[];
  metadata?: {
    analyzedAt: string;
    documentName: string;
    modelVersion: string;
    totalChunks?: number;
    sectionsAnalyzed?: number;
    stage?: 'preprocessing' | 'analyzing' | 'complete';
    progress?: number;
  };
}

export interface ErrorDisplay {
  message: string;
  type: 'error' | 'warning';
}
