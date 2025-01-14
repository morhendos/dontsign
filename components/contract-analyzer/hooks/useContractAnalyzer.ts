import { useCallback, useEffect, useRef } from 'react';
import { useAnalyzerState } from './state';
import { useAnalysisHistory } from './storage';
import { useLogVisibility, useResultsDisplay } from './ui';
import { generateFileHash, isFileMatchingHash } from '../utils/hash';
import type { StoredAnalysis } from '../types/storage';

export const useContractAnalyzer = () => {
  // Use refs to track state without causing re-renders
  const analysisHandledRef = useRef(false);
  const resultClosedByUserRef = useRef(false);

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

  // Wrapped file select handler with cleanup
  const handleFileSelect = useCallback(async (newFile: File | null) => {
    results.hide();
    analysisHandledRef.current = false;
    resultClosedByUserRef.current = false;
    await baseHandleFileSelect(newFile);
  }, [baseHandleFileSelect, results]);

  // Handle analysis completion
  const handleAnalysisComplete = useCallback(async () => {
    if (!analysisHandledRef.current && !resultClosedByUserRef.current && analysis && file) {
      analysisHandledRef.current = true;
      
      const fileHash = await generateFileHash(file);
      
      history.addAnalysis({
        id: Date.now().toString(),
        fileName: file.name,
        fileHash,
        fileSize: file.size,
        analysis,
        analyzedAt: new Date().toISOString()
      });
      
      results.show();
    }
  }, [analysis, file, history, results]);

  // Reset flags when starting new analysis
  const wrappedHandleStartAnalysis = useCallback(async () => {
    analysisHandledRef.current = false;
    resultClosedByUserRef.current = false;
    await handleStartAnalysis();
  }, [handleStartAnalysis]);

  // Verify file match before showing stored analysis
  const handleSelectStoredAnalysis = useCallback(async (stored: StoredAnalysis) => {
    if (!file || file.size !== stored.fileSize) return;

    if (await isFileMatchingHash(file, stored.fileHash)) {
      resultClosedByUserRef.current = false;
      baseHandleSelectStoredAnalysis(stored);
      results.show();
    }
  }, [baseHandleSelectStoredAnalysis, results, file]);

  // Reset state when file changes
  useEffect(() => {
    if (file) {
      analysisHandledRef.current = false;
      resultClosedByUserRef.current = false;
      
      if (analysis?.metadata.documentName !== file.name) {
        results.hide();
      }
    }
  }, [file, analysis?.metadata.documentName]);

  // Only run completion logic when all conditions are met
  useEffect(() => {
    if (!analysisHandledRef.current && 
        !resultClosedByUserRef.current && 
        analysis && 
        !isAnalyzing && 
        stage === 'complete' && 
        file) {
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