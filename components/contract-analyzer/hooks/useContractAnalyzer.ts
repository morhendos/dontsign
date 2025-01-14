import { useCallback, useEffect, useRef } from 'react';
import { useAnalyzerState } from './state';
import { useAnalysisHistory } from './storage';
import { useLogVisibility, useResultsDisplay } from './ui';
import { generateFileHash, isFileMatchingHash } from '../utils/hash';
import type { StoredAnalysis } from '../types/storage';

export const useContractAnalyzer = () => {
  const analysisHandledRef = useRef(false);
  const resultClosedByUserRef = useRef(false);
  const lastSelectedAnalysisIdRef = useRef<string | null>(null);
  const currentAnalysisIdRef = useRef<string | null>(null);
  const currentFileRef = useRef<string | null>(null);

  // Core state handlers
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
    isAnalyzed,
    handleFileSelect: baseHandleFileSelect,
    handleStartAnalysis,
    handleSelectStoredAnalysis: baseHandleSelectStoredAnalysis,
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

  // Reset all analysis state
  const resetAnalysisState = useCallback(() => {
    analysisHandledRef.current = false;
    resultClosedByUserRef.current = false;
    lastSelectedAnalysisIdRef.current = null;
    currentAnalysisIdRef.current = null;
    results.hide();
  }, [results]);

  // Wrapped file select handler with cleanup
  const handleFileSelect = useCallback(async (newFile: File | null) => {
    // Reset all state when selecting a new file
    resetAnalysisState();
    
    // Track new file name
    currentFileRef.current = newFile?.name || null;
    
    // Call the base handler
    await baseHandleFileSelect(newFile);
  }, [baseHandleFileSelect, resetAnalysisState]);

  // Handle analysis completion
  const handleAnalysisComplete = useCallback(async () => {
    if (!analysisHandledRef.current && analysis && file) {
      // Verify we're still working with the same file
      if (file.name !== currentFileRef.current) {
        return;
      }

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
      currentAnalysisIdRef.current = newAnalysis.id;
      resultClosedByUserRef.current = false;
      
      results.show();
    }
  }, [analysis, file, history, results]);

  // Reset handled flag when starting new analysis
  const wrappedHandleStartAnalysis = useCallback(async () => {
    resetAnalysisState();
    await handleStartAnalysis();
  }, [handleStartAnalysis, resetAnalysisState]);

  // Verify file match before showing stored analysis
  const handleSelectStoredAnalysis = useCallback(async (stored: StoredAnalysis) => {
    // Reset flags for viewing stored analysis
    resultClosedByUserRef.current = false;
    lastSelectedAnalysisIdRef.current = stored.id;
    currentAnalysisIdRef.current = stored.id;
    
    // No need to check file if we're viewing history
    if (!file) {
      baseHandleSelectStoredAnalysis(stored);
      results.show();
      return;
    }

    // If we have a file, verify it matches
    if (file.size === stored.fileSize && await isFileMatchingHash(file, stored.fileHash)) {
      baseHandleSelectStoredAnalysis(stored);
      results.show();
    }
  }, [baseHandleSelectStoredAnalysis, results, file]);

  // Reset state when file changes
  useEffect(() => {
    if (file && file.name !== currentFileRef.current) {
      resetAnalysisState();
      currentFileRef.current = file.name;
    }
  }, [file, resetAnalysisState]);

  // Only run completion logic when all conditions are met
  useEffect(() => {
    if (!analysisHandledRef.current && 
        analysis && 
        !isAnalyzing && 
        stage === 'complete' && 
        file && 
        file.name === currentFileRef.current) {
      handleAnalysisComplete();
    }
  }, [analysis, isAnalyzing, stage, file, handleAnalysisComplete]);

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
      handleAnalysisComplete
    }
  };
};