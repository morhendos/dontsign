import { useState, useCallback, useEffect } from 'react';
import { storage } from '../../utils';
import type { StoredAnalysis } from '../../types';

export const useAnalysisHistory = () => {
  const [analyses, setAnalyses] = useState<StoredAnalysis[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<StoredAnalysis | null>(null);

  // Load analyses on mount
  useEffect(() => {
    const stored = storage.get();
    setAnalyses(stored);
    if (stored.length > 0) {
      setSelectedAnalysis(stored[0]);
    }
  }, []);

  const addAnalysis = useCallback((analysis: StoredAnalysis) => {
    if (storage.add(analysis)) {
      setAnalyses(prev => [analysis, ...prev]);
      setSelectedAnalysis(analysis);
      return true;
    }
    return false;
  }, []);

  const removeAnalysis = useCallback((id: string) => {
    setAnalyses(prev => {
      const updated = prev.filter(a => a.id !== id);
      storage.set(updated);
      if (selectedAnalysis?.id === id) {
        setSelectedAnalysis(updated[0] || null);
      }
      return updated;
    });
  }, [selectedAnalysis]);

  const clearHistory = useCallback(() => {
    storage.clear();
    setAnalyses([]);
    setSelectedAnalysis(null);
  }, []);

  return {
    analyses,
    selectedAnalysis,
    setSelectedAnalysis,
    addAnalysis,
    removeAnalysis,
    clearHistory,
    hasAnalyses: analyses.length > 0
  };
};