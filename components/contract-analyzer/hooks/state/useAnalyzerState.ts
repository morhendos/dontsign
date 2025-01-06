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

  // Status update helper that also manages log entries
  const updateStatus = useCallback((message: string) => {
    status.setMessage(message);
    log.updateLastEntry('complete');  // Complete previous entry if exists
    log.addEntry(message);  // Add new entry
  }, [status, log]);

  // File handling
  const {
    file,
    error: fileError,
    isProcessing,
    handleFileSelect,
    resetFile
  } = useFileUpload({
    onStatusUpdate: updateStatus,
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
    onStatusUpdate: updateStatus,
    onEntryComplete: () => {
      log.updateLastEntry('complete');
    },
    onAnalysisComplete: () => {
      if (analysis && file) {
        processing.setShowResults(true); // Show results panel
        processing.setIsProcessingNew(false);
        storage.addAnalysis({
          id: Date.now().toString(),
          fileName: file.name,
          analysis,
          analyzedAt: new Date().toISOString()
        });
      }
    }
  });

  // Handle starting new analysis
  const handleStartAnalysis = useCallback(async () => {
    log.clearEntries();
    processing.setShowResults(false); // Hide previous results
    log.addEntry('Starting contract analysis...');
    processing.setIsProcessingNew(true);
    await analyze(file);
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
    updateLastEntry: log.updateLastEntry,
    addLogEntry: log.addEntry
  };
};
