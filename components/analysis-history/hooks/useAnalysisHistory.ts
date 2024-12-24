import { useState, useEffect } from 'react';
import { saveAnalysis, getStoredAnalyses, type StoredAnalysis } from '@/lib/storage';
import type { AnalysisResult } from '@/types/analysis';

export function useAnalysisHistory() {
  const [hasStoredAnalyses, setHasStoredAnalyses] = useState(false);
  const [currentStoredAnalysis, setCurrentStoredAnalysis] = useState<StoredAnalysis | null>(null);

  // Check for stored analyses on mount
  useEffect(() => {
    const analyses = getStoredAnalyses();
    setHasStoredAnalyses(analyses.length > 0);
  }, []);

  const saveNewAnalysis = (fileName: string, analysis: AnalysisResult) => {
    const stored = saveAnalysis(fileName, analysis);
    setCurrentStoredAnalysis(stored);
    setHasStoredAnalyses(true);
    return stored;
  };

  const selectStoredAnalysis = (stored: StoredAnalysis) => {
    setCurrentStoredAnalysis(stored);
  };

  const clearCurrentAnalysis = () => {
    setCurrentStoredAnalysis(null);
  };

  return {
    hasStoredAnalyses,
    currentStoredAnalysis,
    saveNewAnalysis,
    selectStoredAnalysis,
    clearCurrentAnalysis
  };
}
