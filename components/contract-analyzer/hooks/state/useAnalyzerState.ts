import { useCallback } from 'react';
import { useContractAnalysis } from '../analysis';
import { useFileUpload } from '../file';
import { useAnalysisLog } from '../ui';
import { useStatusManager } from './useStatusManager';
import { useProcessingState } from './useProcessingState';
import { storage } from '../../utils/storage';
import { generateFileHash } from '../../utils/hash';
import type { StoredAnalysis } from '../../types/storage';

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
    onAnalysisComplete: async () => {
      processing.setShowResults(true);
      processing.setIsProcessingNew(false);
      if (file && analysis) {
        const fileHash = await generateFileHash(file);
        storage.add({
          id: Date.now().toString(),
          fileName: file.name,
          fileHash,
          analysis,
          analyzedAt: new Date().toISOString()
        });
      }
    }
  });

  // File handling
  const {
    file,
    error: fileError,
    isProcessing,
    handleFileSelect: baseHandleFileSelect,
    resetFile
  } = useFileUpload({
    onStatusUpdate: updateStatus,
    onEntryComplete: () => log.updateLastEntry('complete')
  });

  // Enhanced file selection with hash check
  const handleFileSelect = useCallback(async (newFile: File | null) => {
    if (newFile) {
      try {
        // Generate hash for the new file
        const fileHash = await generateFileHash(newFile);

        // Check if we have this file already
        const existingAnalyses = storage.get();
        const existingAnalysis = existingAnalyses.find(a => a.fileHash === fileHash);

        if (existingAnalysis) {
          // File already analyzed - show existing results
          processing.setIsProcessingNew(false);
          updateState({
            analysis: existingAnalysis.analysis,
            isAnalyzing: false,
            error: null,
            progress: 100,
            stage: 'complete',
            currentChunk: 0,
            totalChunks: 0
          });
          processing.setShowResults(true);

          // Update access time and move to top of list
          const updatedAnalyses = [
            { ...existingAnalysis, analyzedAt: new Date().toISOString() },
            ...existingAnalyses.filter(a => a.id !== existingAnalysis.id)
          ];
          storage.set(updatedAnalyses);
          
          // Also need to update the file state
          baseHandleFileSelect(newFile);
          return;
        }
      } catch (error) {
        console.error('Error checking file hash:', error);
        // If there's any error in hash checking, proceed with normal file handling
      }
    }

    // New file or null - handle normally
    baseHandleFileSelect(newFile);
  }, [baseHandleFileSelect, processing, updateState]);

  // Handle starting analysis
  const handleStartAnalysis = useCallback(async () => {
    log.clearEntries();
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