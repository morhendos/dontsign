import { useCallback, useEffect, useRef } from 'react';
import { useAnalyzerState } from './state';
import { useAnalysisHistory } from './storage';
import { useLogVisibility, useResultsDisplay } from './ui';
import { generateFileHash, isFileMatchingHash } from '../utils/hash';
import type { StoredAnalysis } from '../types/storage';

export const useContractAnalyzer = () => {
  // Refs to track state
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
      console.log('🏁 Results HIDE callback triggered');
      resultClosedByUserRef.current = true;
    }
  });

  // File selection handler
  const handleFileSelect = useCallback(async (newFile: File | null) => {
    console.log('🏁 handleFileSelect:', {
      newFileName: newFile?.name,
      wasAnalysisHandled: analysisHandledRef.current,
      wasResultClosed: resultClosedByUserRef.current,
      lastAnalysisId: lastSelectedAnalysisIdRef.current
    });

    results.hide();
    await baseHandleFileSelect(newFile);
  }, [baseHandleFileSelect, results]);

  // Analysis completion handler
  const handleAnalysisComplete = useCallback(async () => {
    console.log('🏁 handleAnalysisComplete:', {
      hasAnalysis: !!analysis,
      hasFile: !!file,
      wasAnalysisHandled: analysisHandledRef.current,
      wasResultClosed: resultClosedByUserRef.current
    });

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
      
      console.log('🏁 Showing results after analysis completion');
      results.show();
    }
  }, [analysis, file, history, results]);

  // Handle starting analysis
  const wrappedHandleStartAnalysis = useCallback(async () => {
    console.log('🏁 wrappedHandleStartAnalysis:', {
      wasAnalysisHandled: analysisHandledRef.current,
      wasResultClosed: resultClosedByUserRef.current
    });
    
    analysisHandledRef.current = false;
    resultClosedByUserRef.current = false;
    await handleStartAnalysis();
  }, [handleStartAnalysis]);

  // Select stored analysis
  const handleSelectStoredAnalysis = useCallback(async (stored: StoredAnalysis) => {
    console.log('🏁 handleSelectStoredAnalysis:', {
      storedFileName: stored.fileName,
      currentFileName: file?.name,
      wasResultClosed: resultClosedByUserRef.current
    });

    if (!file || (file.size === stored.fileSize && await isFileMatchingHash(file, stored.fileHash))) {
      resultClosedByUserRef.current = false;
      lastSelectedAnalysisIdRef.current = stored.id;
      baseHandleSelectStoredAnalysis(stored);
      results.show();
    }
  }, [baseHandleSelectStoredAnalysis, results, file]);

  // Effect for analysis completion
  useEffect(() => {
    console.log('🏁 Analysis completion effect:', {
      hasAnalysis: !!analysis,
      isAnalyzing,
      stage,
      wasAnalysisHandled: analysisHandledRef.current,
      wasResultClosed: resultClosedByUserRef.current
    });

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