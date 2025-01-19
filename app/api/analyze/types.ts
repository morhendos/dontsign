export interface AnalysisResult {
  summary: string;
  potentialRisks: string[];
  importantClauses: string[];
  recommendations?: string[];
  metadata?: {
    analyzedAt: string;
    documentName: string;
    modelVersion: string;
    totalChunks?: number;
    currentChunk?: number;
    stage?: string;
    progress?: number;
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
  description?: string;  // Added for detailed progress messages
}

export type StreamController = ReadableStreamDefaultController<any>;

export interface ProgressHandler {
  sendProgress: (stage: string, progress: number, currentChunk?: number, totalChunks?: number, description?: string) => void;
  sendComplete: (result: AnalysisResult) => void;
  sendError: (error: Error | unknown) => void;
}