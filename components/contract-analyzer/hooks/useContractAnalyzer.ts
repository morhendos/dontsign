import { useCallback, useEffect, useRef } from 'react';
import { useAnalyzerState } from './state';
import { useAnalysisHistory } from './storage';
import { useLogVisibility, useResultsDisplay } from './ui';
import { generateFileHash } from '../utils/hash';
import type { StoredAnalysis } from '@/types/storage';

export const useContractAnalyzer = () => {
  const analysisHandledRef = useRef(false);
  const resultClosedByUserRef = useRef(false);
  const lastSelectedAnalysisIdRef = useRef<string | null>(null);

  // Core state handlers
  const {
    file,
    error,
    isProcessing,
    isAnalyzing,
    status,
    progress,
    stage,
    sectionsAnalyzed,
    totalChunks,
    analysis,
    entries,
    isAnalyzed,
    handleFileSelect: baseHandleFileSelect,
    handleStartAnalysis,
    handleSelectStoredAnalysis: baseHandleSelectStoredAnalysis,
    setError
  } = useAnalyzerState();

  // Analysis history
  const history = useAnalysisHistory();

  // UI state
  const log = useLogVisibility({ entries });
  const results = useResultsDisplay({ 
    onHide: () => {
      resultClosedByUserRef.current = true;
    }
  });

  // Error handling
  const handleClearError = useCallback(() => {
    setError(null);
    results.hide();
  }, [setError, results]);

  // File selection handler
  const handleFileSelect = useCallback(async (newFile: File | null) => {
    results.hide();
    handleClearError();
    await baseHandleFileSelect(newFile);
  }, [baseHandleFileSelect, results, handleClearError]);

  // Analysis completion handler
  const handleAnalysisComplete = useCallback(async () => {
    if (analysis && file && !analysisHandledRef.current) {
      analysisHandledRef.current = true;
      
      const fileHash = await generateFileHash(file);
      const newAnalysis = {
        id: Date.now().toString(),
        fileName: file.name,
        fileHash,
        fileSize: file.size,
        analysis,
        analyzedAt: new Date().toISOString()
      };
      
      history.addAnalysis(newAnalysis);
      lastSelectedAnalysisIdRef.current = newAnalysis.id;
      resultClosedByUserRef.current = false;
      
      results.show();
    }
  }, [analysis, file, history, results]);

  // Reset handled flag when starting new analysis
  const wrappedHandleStartAnalysis = useCallback(async () => {
    analysisHandledRef.current = false;
    resultClosedByUserRef.current = false;
    handleClearError();
    await handleStartAnalysis();
  }, [handleStartAnalysis, handleClearError]);

  // Select stored analysis
  const handleSelectStoredAnalysis = useCallback(async (stored: StoredAnalysis) => {
    resultClosedByUserRef.current = false;
    lastSelectedAnalysisIdRef.current = stored.id;
    handleClearError();
    baseHandleSelectStoredAnalysis(stored);
    results.show();
  }, [baseHandleSelectStoredAnalysis, results, handleClearError]);

  // Effect for analysis completion
  useEffect(() => {
    if (!analysisHandledRef.current && 
        analysis && 
        !isAnalyzing && 
        stage === 'complete' && 
        file) {
      handleAnalysisComplete();
    }
  }, [analysis, isAnalyzing, stage, file, handleAnalysisComplete]);

  // Effect for error handling
  useEffect(() => {
    if (error) {
      results.show();
    }
  }, [error, results]);

  return {
    // State
    file,
    error,
    isProcessing,
    isAnalyzing,
    status,
    progress,
    stage,
    sectionsAnalyzed,
    totalChunks,
    analysis,
    isAnalyzed,
    
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
      handleStartAnalysis: wrappedHandleStartAnalysis,
      handleSelectStoredAnalysis,
      handleAnalysisComplete,
      handleClearError
    }
  };
};