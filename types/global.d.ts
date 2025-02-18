import type { StoredAnalysis } from './storage';

declare global {
  interface Window {
    handleAnalysisSelect?: (analysis: StoredAnalysis) => void;
  }
}

export {};