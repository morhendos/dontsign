import { create } from 'zustand';
import { getStoredAnalyses } from './storage';
import type { StoredAnalysis } from '@/types/storage';
import type { AnalysisResult } from '@/types/analysis';

interface AnalyzerState {
  currentAnalysis: AnalysisResult | null;
  setCurrentAnalysis: (analysis: AnalysisResult | null) => void;
  storedAnalyses: StoredAnalysis[];
  loadStoredAnalyses: () => void;
  onSelectStoredAnalysis: (analysis: StoredAnalysis) => void;
}

export const useAnalyzerStore = create<AnalyzerState>((set) => ({
  currentAnalysis: null,
  storedAnalyses: [],
  setCurrentAnalysis: (analysis) => set({ currentAnalysis: analysis }),
  loadStoredAnalyses: () => {
    const analyses = getStoredAnalyses();
    set({ storedAnalyses: analyses });
  },
  onSelectStoredAnalysis: (analysis) => {
    set({ currentAnalysis: analysis.analysis });
  }
}));