export interface AnalysisResult {
  summary: string;
  keyTerms: string[];
  potentialRisks: string[];
  importantClauses: string[];
  recommendations?: string[];
}

export interface ProgressUpdate {
  type: 'progress' | 'complete' | 'error';
  stage: 'preprocessing' | 'analyzing' | 'complete';
  progress: number;
  currentChunk?: number;
  totalChunks?: number;
  result?: AnalysisResult;
  error?: string;
}

export type StreamController = ReadableStreamDefaultController<any>;

export interface ProgressHandler {
  sendProgress: (stage: string, progress: number, currentChunk?: number, totalChunks?: number) => void;
}
