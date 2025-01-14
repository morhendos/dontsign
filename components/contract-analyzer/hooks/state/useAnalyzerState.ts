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

  // Core state handlers
  const processing = useProcessingState();
  const status = useStatusManager();
  const log = useAnalysisLog();

  // Status update helper that also manages log entries
  const updateStatus = useCallback((message: string) => {
    status.setMessage(message);
    log.updateLastEntry('complete');
    log.addEntry(message);
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
      console.log('Analysis complete');
      processing.setShowResults(true);
      processing.setIsProcessingNew(false);
      setIsAnalyzed(true);
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
    console.log('File selected:', newFile?.name);
    // Reset analyzed state when selecting new file
    setIsAnalyzed(false);
    processing.setShowResults(false); // Always hide results on file select

    if (newFile) {
      try {
        // Generate hash for the new file
        const fileHash = await generateFileHash(newFile);
        console.log('File hash:', fileHash);

        // Check if we have this file already
        const existingAnalyses = storage.get();
        const existingAnalysis = existingAnalyses.find(a => a.fileHash === fileHash);

        if (existingAnalysis) {
          console.log('Found existing analysis');
          // File already analyzed - but don't show results yet
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
          setIsAnalyzed(true);
          
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
    console.log('handleStartAnalysis called, isAnalyzed:', isAnalyzed);
    console.log('Current processing state:', {
      file: file?.name,
      isAnalyzed,
      isAnalyzing,
      showResults: processing.showResults
    });

    // If already analyzed, just show results
    if (isAnalyzed) {
      console.log('File is already analyzed, showing results');
      processing.setShowResults(true);
      return;
    }

    if (!file) {
      console.log('No file selected');
      return;
    }

    try {
      // Check if file is already analyzed
      const fileHash = await generateFileHash(file);
      console.log('Generated hash for analysis:', fileHash);
      const existingAnalyses = storage.get();
      const existingAnalysis = existingAnalyses.find(a => a.fileHash === fileHash);

      if (existingAnalysis) {
        console.log('Found existing analysis, showing results');
        // File already analyzed - show results and update timestamp
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
        storage.update(fileHash);
        return;
      }
      
      console.log('Starting new analysis');
      log.clearEntries();
      log.addEntry('Starting contract analysis...');
      processing.setIsProcessingNew(true);
      
      const result = await analyze(file);
      console.log('Analysis completed, result:', result ? 'success' : 'failed');
      
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
  }, [analyze, file, isAnalyzed, log, processing, isAnalyzing, updateState]);

  // Handle selecting stored analysis
  const handleSelectStoredAnalysis = useCallback((stored: StoredAnalysis) => {
    console.log('Selecting stored analysis');
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

    // Update timestamp and move to top
    storage.update(stored.fileHash);
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