import { useCallback, useEffect, useRef } from 'react';
import { useAnalyzerState } from './state';
import { useAnalysisHistory } from './storage';
import { useLogVisibility, useResultsDisplay } from './ui';
import { generateFileHash, isFileMatchingHash } from '../utils/hash';
import type { StoredAnalysis } from '../types/storage';

export const useContractAnalyzer = () => {
  const analysisHandledRef = useRef(false);

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
      // Don't reset isAnalyzed when hiding results
      // Only new file selection should reset it
    }
  });

  // Wrapped file select handler with cleanup
  const handleFileSelect = useCallback(async (newFile: File | null) => {
    // Hide current results before state changes
    results.hide();
    
    // Reset analysis state
    analysisHandledRef.current = false;
    
    // Call the base handler
    await baseHandleFileSelect(newFile);
    
  }, [baseHandleFileSelect, results]);

  // Handle analysis completion
  const handleAnalysisComplete = useCallback(async () => {
    if (analysis && file && !analysisHandledRef.current) {
      analysisHandledRef.current = true;
      
      // Generate file hash for storage
      const fileHash = await generateFileHash(file);
      
      // Store in history with file identifiers
      history.addAnalysis({
        id: Date.now().toString(),
        fileName: file.name,
        fileHash,
        fileSize: file.size,
        analysis,
        analyzedAt: new Date().toISOString()
      });
      
      // Show results
      results.show();
    }
  }, [analysis, file, history, results]);

  // Reset handled flag when starting new analysis
  const wrappedHandleStartAnalysis = useCallback(async () => {
    analysisHandledRef.current = false;
    await handleStartAnalysis();
  }, [handleStartAnalysis]);

  // Wrap handleSelectStoredAnalysis to verify file match
  const handleSelectStoredAnalysis = useCallback(async (stored: StoredAnalysis) => {
    if (!file) {
      return; // No file selected, don't show results
    }
    
    // Quick check with file size first
    if (file.size !== stored.fileSize) {
      return;
    }

    // Then verify hash using existing utility
    if (await isFileMatchingHash(file, stored.fileHash)) {
      baseHandleSelectStoredAnalysis(stored);
      results.show();
    }
  }, [baseHandleSelectStoredAnalysis, results, file]);

  // Cleanup effect when file changes
  useEffect(() => {
    if (file) {
      // Reset state for new file
      analysisHandledRef.current = false;
      
      // Hide results if they don't match current file
      if (analysis && (analysis.metadata.documentName !== file.name)) {
        results.hide();
      }
    }
  }, [file, analysis, results]);

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