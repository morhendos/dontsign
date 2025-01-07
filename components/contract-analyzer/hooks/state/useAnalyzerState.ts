import { useCallback, useState } from 'react';
import { useContractAnalysis } from '../analysis';
import { useFileUpload } from '../file';
import { useAnalysisLog } from '../ui';
import { useStatusManager } from './useStatusManager';
import { useProcessingState } from './useProcessingState';
import { storage } from '../../utils/storage';
import { generateFileHash } from '../../utils/hash';
import type { StoredAnalysis } from '../../types/storage';

export const useAnalyzerState = () => {
  // Track if current file is already analyzed
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  // Keep track of last analyzed file for reopening
  const [lastAnalyzedFile, setLastAnalyzedFile] = useState<File | null>(null);

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
    updateState,
    setFile: setAnalysisFile
  } = useContractAnalysis({
    onStatusUpdate: updateStatus,
    onEntryComplete: () => {
      log.updateLastEntry('complete');
    },
    onAnalysisComplete: async () => {
      processing.setShowResults(true);
      processing.setIsProcessingNew(false);
      setIsAnalyzed(true);
      if (file) {
        setLastAnalyzedFile(file);
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
    // Reset analyzed state when selecting new file
    setIsAnalyzed(false);
    setLastAnalyzedFile(null);

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
          setIsAnalyzed(true);
          setLastAnalyzedFile(newFile);
          
          // Just update timestamp and move to top
          storage.update(fileHash);
          
          // Update UI state without triggering new analysis
          baseHandleFileSelect(newFile);
          return;
        }
      } catch (error) {
        console.error('Error checking file hash:', error);
      }
    }

    // New file or null - handle normally
    baseHandleFileSelect(newFile);
  }, [baseHandleFileSelect, processing, updateState]);

  // Handle starting analysis
  const handleStartAnalysis = useCallback(async () => {
    // If we have analyzed file but no current file (report was closed)
    // restore the last analyzed file state
    if (!file && lastAnalyzedFile) {
      baseHandleFileSelect(lastAnalyzedFile);
      processing.setShowResults(true);
      return;
    }

    if (!file) return;

    try {
      // Check if file is already analyzed
      const fileHash = await generateFileHash(file);
      const existingAnalyses = storage.get();
      const existingAnalysis = existingAnalyses.find(a => a.fileHash === fileHash);

      if (existingAnalysis || isAnalyzed) {
        // File already analyzed - just show results
        processing.setShowResults(true);
        return;
      }
      
      log.clearEntries();
      log.addEntry('Starting contract analysis...');
      processing.setIsProcessingNew(true);
      
      const result = await analyze(file);
      
      // Add to storage only after successful analysis
      if (result) {
        storage.add({
          id: Date.now().toString(),
          fileName: file.name,
          fileHash,
          analysis: result,
          analyzedAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error in analysis:', error);
      throw error;
    }
  }, [analyze, file, lastAnalyzedFile, isAnalyzed, log, processing, baseHandleFileSelect]);

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
    setIsAnalyzed(true);
    setLastAnalyzedFile(null);

    // Update timestamp and move to top
    storage.update(stored.fileHash);
  }, [processing, resetFile, updateState]);

  return {
    // State
    file: file || lastAnalyzedFile,  // Return last analyzed file if current file is null
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
    isAnalyzed,

    // Actions
    handleFileSelect,
    handleStartAnalysis,
    handleSelectStoredAnalysis,
    setShowResults: processing.setShowResults,
    updateLastEntry: log.updateLastEntry,
    addLogEntry: log.addEntry
  };
};