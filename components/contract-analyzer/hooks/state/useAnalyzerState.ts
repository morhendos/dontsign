import { useCallback } from 'react';
import { useContractAnalysis } from '../analysis';
import { useFileUpload } from '../file';
import { useAnalysisLog } from '../ui';
import { useStatusManager } from './useStatusManager';
import { useProcessingState } from './useProcessingState';
import { storage } from '../../utils';

export const useAnalyzerState = () => {
  // Core state handlers
  const processing = useProcessingState();
  const status = useStatusManager();
  const log = useAnalysisLog();

  // File handling
  const {
    file,
    error: fileError,
    isProcessing,
    handleFileSelect,
    resetFile
  } = useFileUpload({
    onStatusUpdate: status.setMessage,
    onEntryComplete: () => log.updateLastEntry('complete')
  });

  // Contract analysis
  const {
    analysis,
    isAnalyzing,
    error: analysisError,
    progress,
    stage,
    currentChunk,
    totalChunks,
    analyze,
    updateState
  } = useContractAnalysis({
    onStatusUpdate: status.setMessage,
    onEntryComplete: () => log.updateLastEntry('complete')
  });

  // Handle starting new analysis
  const handleStartAnalysis = useCallback(async () => {
    log.clearEntries();
    processing.setIsProcessingNew(true);
    await analyze(file);
    processing.setIsProcessingNew(false);
  }, [analyze, file, log, processing]);

  // Handle selecting stored analysis
  const handleSelectStoredAnalysis = useCallback((stored: StoredAnalysis) => {
    processing.setIsProcessingNew(false);
    updateState({
      analysis: stored.analysis,
      isAnalyzing: false,
      error: null,
      progress: 100,
      stage: 'complete',
      currentChunk: 0,
      totalChunks: 0
    });
    processing.setShowResults(true);
    resetFile();
  }, [processing, resetFile, updateState]);

  return {
    // State
    file,
    error: fileError || analysisError,
    isProcessing,
    isAnalyzing,
    status: status.message,
    progress,
    stage,
    currentChunk,
    totalChunks,
    analysis,
    showResults: processing.showResults,
    hasStoredAnalyses: storage.get().length > 0,
    entries: log.entries,

    // Actions
    handleFileSelect,
    handleStartAnalysis,
    handleSelectStoredAnalysis,
    setShowResults: processing.setShowResults,
    updateLastEntry: log.updateLastEntry
  };
};
