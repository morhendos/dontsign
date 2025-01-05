import type { AnalysisResult } from './analysis';

export interface StoredAnalysis {
  id: string;
  fileName: string;
  analysis: AnalysisResult;
  analyzedAt: string;
}

export interface StorageOptions {
  maxItems?: number;
  storageKey?: string;
}
