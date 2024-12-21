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
  type: "error" | "warning";
}

export type FileStatus = {
  file: File | null;
  error: ErrorDisplay | null;
  isAnalyzing: boolean;
};

export type AnalysisStatus = {
  result: AnalysisResult | null;
  error: ErrorDisplay | null;
  isAnalyzing: boolean;
};