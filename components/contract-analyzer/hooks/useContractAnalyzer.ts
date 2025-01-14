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
      console.log('Results hide callback triggered');
      resultIntentionallyHiddenRef.current = true;
    }
  });

  // Debug effect
  useEffect(() => {
    console.log('State changed:', {
      isAnalyzing,
      stage,
      analysisHandled: analysisHandledRef.current,
      intentionallyHidden: resultIntentionallyHiddenRef.current,
      hasFile: !!file,
      hasAnalysis: !!analysis,
      resultsVisible: results.isVisible
    });
  }, [isAnalyzing, stage, file, analysis, results.isVisible]);

  // Wrapped file select handler with cleanup
  const handleFileSelect = useCallback(async (newFile: File | null) => {
    console.log('File select handler called');
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
    console.log('Analysis complete handler called', {
      hasAnalysis: !!analysis,
      hasFile: !!file,
      analysisHandled: analysisHandledRef.current,
      intentionallyHidden: resultIntentionallyHiddenRef.current
    });

    try {
      if (!analysisHandledRef.current && !resultIntentionallyHiddenRef.current) {
        console.log('Processing analysis completion...');
        // Set flag first to prevent duplicate processing
        analysisHandledRef.current = true;
        
        if (analysis && file) {
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
          console.log('Showing results after completion');
          results.show();
        }
      } else {
        console.log('Analysis completion skipped due to flags');
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
    console.log('Starting new analysis');
    analysisHandledRef.current = false;
    resultIntentionallyHiddenRef.current = false;
    await handleStartAnalysis();
  }, [handleStartAnalysis]);

  // Wrap handleSelectStoredAnalysis to verify file match
  const handleSelectStoredAnalysis = useCallback(async (stored: StoredAnalysis) => {
    console.log('Selecting stored analysis');
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
      console.log('File changed, resetting state');
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
    if (analysis && !isAnalyzing && stage === 'complete' && file) {
      console.log('Analysis complete effect triggered');
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
      hide: () => {
        console.log('Results hide called');
        results.hide();
      },
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