import { useState, useCallback } from 'react';
import type { AnalysisResult, StoredAnalysis } from '../../types';

export interface UseAnalysisResultsOptions {
  initialAnalysis?: AnalysisResult | null;
  initialStoredAnalysis?: StoredAnalysis | null;
}

export const useAnalysisResults = (options: UseAnalysisResultsOptions = {}) => {
  const [showResults, setShowResults] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult | null>(options.initialAnalysis || null);
  const [currentStoredAnalysis, setCurrentStoredAnalysis] = useState<StoredAnalysis | null>(options.initialStoredAnalysis || null);

  const selectStoredAnalysis = useCallback((stored: StoredAnalysis) => {
    setCurrentStoredAnalysis(stored);
    setCurrentAnalysis(null);
    setShowResults(true);
  }, []);

  const resetResults = useCallback(() => {
    setCurrentAnalysis(null);
    setCurrentStoredAnalysis(null);
    setShowResults(false);
  }, []);

  return {
    showResults,
    setShowResults,
    currentAnalysis,
    setCurrentAnalysis,
    currentStoredAnalysis,
    setCurrentStoredAnalysis,
    selectStoredAnalysis,
    resetResults,
    displayedAnalysis: currentStoredAnalysis?.analysis || currentAnalysis
  };
};
