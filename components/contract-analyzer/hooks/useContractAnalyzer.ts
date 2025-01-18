import { useCallback, useEffect, useRef } from 'react';
import { useAnalyzerState } from './state';
import { useAnalysisHistory } from './storage';
import { useLogVisibility, useResultsDisplay } from './ui';
import { generateFileHash } from '../utils/hash';
import type { StoredAnalysis } from '@/types/storage';

// Version for the new summary format
const CURRENT_SUMMARY_VERSION = 'v2';

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

  // File selection handler
  const handleFileSelect = useCallback(async (newFile: File | null) => {
    results.hide();
    await baseHandleFileSelect(newFile);
  }, [baseHandleFileSelect, results]);

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
        analyzedAt: new Date().toISOString(),
        version: CURRENT_SUMMARY_VERSION  // Add version to new analyses
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
    await handleStartAnalysis();
  }, [handleStartAnalysis]);

  // Select stored analysis with version check
  const handleSelectStoredAnalysis = useCallback(async (stored: StoredAnalysis) => {
    // If it's an old version analysis, force a new analysis
    if (stored.version !== CURRENT_SUMMARY_VERSION) {
      if (stored.fileName && stored.fileHash) {
        // Trigger a new analysis with the same file
        resultClosedByUserRef.current = false;
        await wrappedHandleStartAnalysis();
        return;
      }
    }

    resultClosedByUserRef.current = false;
    lastSelectedAnalysisIdRef.current = stored.id;
    baseHandleSelectStoredAnalysis(stored);
    results.show();
  }, [baseHandleSelectStoredAnalysis, results, wrappedHandleStartAnalysis]);

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
      handleAnalysisComplete
    }
  };
};