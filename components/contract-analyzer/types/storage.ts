import { AnalysisResult } from './analysis';

export interface StorageOptions {
  maxItems?: number;
  storageKey?: string;
}

export interface StoredAnalysis {
  id: string;
  fileName: string;
  fileHash: string;  // For content-based comparison
  fileSize: number;  // Quick initial check before hash comparison
  analysis: AnalysisResult;
  analyzedAt: string;
}