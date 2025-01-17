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
    sectionsAnalyzed,
    totalChunks,
    analyze,
    updateState,
    analysisFile,
    setAnalysisFile
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

  // Handle file selection - ONLY handles file selection, nothing else
  const handleFileSelect = useCallback(async (newFile: File | null) => {
    // Reset state
    setIsAnalyzed(false);
    processing.setShowResults(false);
    processing.setIsProcessingNew(false);
    
    // Update file
    setAnalysisFile(newFile);
    baseHandleFileSelect(newFile);
  }, [baseHandleFileSelect, processing, setAnalysisFile]);

  // Handle starting analysis
  const handleStartAnalysis = useCallback(async () => {
    if (!file) {
      return;
    }

    try {
      // Check if file is already analyzed
      const fileHash = await generateFileHash(file);
      const existingAnalyses = storage.get();
      const existingAnalysis = existingAnalyses.find(a => a.fileHash === fileHash);

      if (existingAnalysis) {
        // File already analyzed - show results and update timestamp
        updateState({
          analysis: existingAnalysis.analysis,
          isAnalyzing: false,
          error: null,
          progress: 100,
          stage: 'complete',
          sectionsAnalyzed: 0,
          totalChunks: 0
        });
        processing.setShowResults(true);
        storage.update(fileHash);
        return;
      }
      
      // Start new analysis
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
          fileSize: file.size,
          analysis: result,
          analyzedAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error in analysis:', error);
      throw error;
    }
  }, [analyze, file, log, processing, updateState]);

  // Handle selecting stored analysis
  const handleSelectStoredAnalysis = useCallback((stored: StoredAnalysis) => {
    processing.setIsProcessingNew(false);
    updateState({
      analysis: stored.analysis,
      isAnalyzing: false,
      error: null,
      progress: 100,
      stage: 'complete',
      sectionsAnalyzed: 0,
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
    sectionsAnalyzed,
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