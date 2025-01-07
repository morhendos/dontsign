import { AnalysisResult } from './analysis';

export interface StorageOptions {
  maxItems?: number;
  storageKey?: string;
}

export interface StoredAnalysis {
  id: string;
  fileName: string;
  fileHash: string;  // Added for file content comparison
  analysis: AnalysisResult;
  analyzedAt: string;
}