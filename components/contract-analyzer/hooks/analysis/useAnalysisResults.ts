import { useState, useCallback } from 'react';
import { storage } from '../../utils/storage';
import type { AnalysisResult, StoredAnalysis } from '../../types';

export interface UseAnalysisResultsOptions {
  initialAnalysis?: AnalysisResult | null;
  initialStoredAnalysis?: StoredAnalysis | null;
}

export const useAnalysisResults = (options: UseAnalysisResultsOptions = {}) => {
  const [showResults, setShowResults] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult | null>(options.initialAnalysis || null);
  const [currentStoredAnalysis, setCurrentStoredAnalysis] = useState<StoredAnalysis | null>(options.initialStoredAnalysis || null);

  const storeAnalysis = useCallback((analysis: AnalysisResult, fileName: string) => {
    const stored: StoredAnalysis = {
      id: Date.now().toString(),
      fileName,
      analysis,
      analyzedAt: new Date().toISOString()
    };

    if (storage.add(stored)) {
      setCurrentStoredAnalysis(stored);
      return true;
    }
    return false;
  }, []);

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
    storeAnalysis,
    selectStoredAnalysis,
    resetResults,
    displayedAnalysis: currentStoredAnalysis?.analysis || currentAnalysis
  };
};
