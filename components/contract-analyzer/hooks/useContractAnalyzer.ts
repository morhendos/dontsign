import { useCallback, useEffect, useRef } from 'react';
import { useAnalyzerState } from './state';
import { useAnalysisHistory } from './storage';
import { useLogVisibility, useResultsDisplay } from './ui';
import { generateFileHash, isFileMatchingHash } from '../utils/hash';
import type { StoredAnalysis } from '../types/storage';

export const useContractAnalyzer = () => {
  const analysisHandledRef = useRef(false);
  const resultIntentionallyHiddenRef = useRef(false);

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
      resultIntentionallyHiddenRef.current = true;
    }
  });

  // Wrapped file select handler with cleanup
  const handleFileSelect = useCallback(async (newFile: File | null) => {
    // Reset flags
    resultIntentionallyHiddenRef.current = false;
    analysisHandledRef.current = false;
    
    // Hide current results before state changes
    results.hide();
    
    // Call the base handler
    await baseHandleFileSelect(newFile);
    
  }, [baseHandleFileSelect, results]);

  // Handle analysis completion
  const handleAnalysisComplete = useCallback(async () => {
    try {
      if (analysis && file && !analysisHandledRef.current && !resultIntentionallyHiddenRef.current) {
        // Set flag first to prevent duplicate processing
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
    } catch (error) {
      console.error('Error in handleAnalysisComplete:', error);
      // Reset flags on error
      analysisHandledRef.current = false;
      resultIntentionallyHiddenRef.current = false;
    }
  }, [analysis, file, history, results]);

  // Reset handled flag when starting new analysis
  const wrappedHandleStartAnalysis = useCallback(async () => {
    analysisHandledRef.current = false;
    resultIntentionallyHiddenRef.current = false;
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

    // Reset flags when selecting stored analysis
    resultIntentionallyHiddenRef.current = false;

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
      resultIntentionallyHiddenRef.current = false;
      
      // Hide results if they don't match current file
      if (analysis && (analysis.metadata.documentName !== file.name)) {
        results.hide();
      }
    }
  }, [file, analysis, results]);

  // Trigger handleAnalysisComplete when analysis is complete
  useEffect(() => {
    let mounted = true;

    const triggerAnalysisComplete = async () => {
      if (analysis && 
          !isAnalyzing && 
          stage === 'complete' && 
          file && 
          mounted && 
          !resultIntentionallyHiddenRef.current) {
        await handleAnalysisComplete();
      }
    };

    triggerAnalysisComplete();

    return () => {
      mounted = false;
    };
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