import { useCallback, useEffect } from 'react';
import { useAnalyzerState } from './state';
import { useAnalysisHistory } from './storage';
import { useLogVisibility, useResultsDisplay } from './ui';

/**
 * Main hook that combines all functionality for the contract analyzer
 */
export const useContractAnalyzer = () => {
  // Core state and functionality
  const {
    file,
    error,
    isProcessing,
    isAnalyzing,
    status,
    progress,
    stage,
    currentChunk,
    totalChunks,
    analysis,
    entries,
    handleFileSelect,
    handleStartAnalysis,
    handleSelectStoredAnalysis: baseHandleSelectStoredAnalysis,
    setAnalysis,
  } = useAnalyzerState();

  // Analysis history
  const history = useAnalysisHistory();

  // UI state
  const log = useLogVisibility({ entries });
  const results = useResultsDisplay();

  // Handle analysis completion
  const handleAnalysisComplete = useCallback(() => {
    if (analysis && file) {
      // Store in history
      history.addAnalysis({
        id: Date.now().toString(),
        fileName: file.name,
        analysis,
        analyzedAt: new Date().toISOString()
      });
      // Show results
      results.show();
    }
  }, [analysis, file, history, results]);

  // Wrap handleSelectStoredAnalysis to also show results
  const handleSelectStoredAnalysis = useCallback((stored) => {
    baseHandleSelectStoredAnalysis(stored);
    results.show();
  }, [baseHandleSelectStoredAnalysis, results]);

  // Handle state updates
  useEffect(() => {
    if (analysis && !isAnalyzing && progress === 100) {
      handleAnalysisComplete();
    }
  }, [analysis, isAnalyzing, progress, handleAnalysisComplete]);

  return {
    // State
    file,
    error,
    isProcessing,
    isAnalyzing,
    status,
    progress,
    stage,
    currentChunk,
    totalChunks,
    analysis,
    
    // History
    history: {
      analyses: history.analyses,
      selectedAnalysis: history.selectedAnalysis,
      hasAnalyses: history.hasAnalyses,
      addAnalysis: history.addAnalysis,
      removeAnalysis: history.removeAnalysis,
      clearHistory: history.clearHistory
    },

    // UI State
    log: {
      entries,
      isVisible: log.isVisible,
      show: log.show,
      onVisibilityChange: log.onVisibilityChange
    },

    results: {
      isVisible: results.isVisible,
      activeTab: results.activeTab,
      show: results.show,
      hide: results.hide,
      setActiveTab: results.setActiveTab
    },

    // Actions
    actions: {
      handleFileSelect,
      handleStartAnalysis,
      handleSelectStoredAnalysis,
      handleAnalysisComplete
    }
  };
};