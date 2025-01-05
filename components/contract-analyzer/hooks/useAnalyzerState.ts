import { useState, useRef, useEffect, useCallback } from 'react';
import { useContractAnalysis } from './useContractAnalysis';
import { useFileHandler } from '../../hooks/useFileHandler';
import { useAnalysisLog } from '../../analysis-log/useAnalysisLog';
import { saveAnalysis, getStoredAnalyses, type StoredAnalysis } from '@/lib/storage';

/**
 * Hook to manage the state of the contract analyzer
 */
export const useAnalyzerState = () => {
  // UI state
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [showResults, setShowResults] = useState(false);
  const [currentStoredAnalysis, setCurrentStoredAnalysis] = useState<StoredAnalysis | null>(null);
  const [hasStoredAnalyses, setHasStoredAnalyses] = useState(false);
  const isAnalyzingNewDocument = useRef(false);

  // Analysis log handling
  const { entries, addEntry, updateLastEntry, clearEntries } = useAnalysisLog();

  // Contract analysis
  const {
    analysis,
    isAnalyzing,
    error: analysisError,
    progress: analysisProgress,
    stage,
    currentChunk,
    totalChunks,
    handleAnalyze,
    setAnalysisState,
    resetAnalysisState
  } = useContractAnalysis({
    onStatusUpdate: setProcessingStatus,
    onEntryComplete: () => updateLastEntry('complete')
  });

  // File handling
  const {
    file,
    error: fileError,
    isProcessing,
    handleFileSelect: baseHandleFileSelect,
    resetFile
  } = useFileHandler({
    onStatusUpdate: setProcessingStatus,
    onEntryComplete: () => updateLastEntry('complete')
  });

  // Initialize state from localStorage
  useEffect(() => {
    if (isAnalyzingNewDocument.current) return;

    const analyses = getStoredAnalyses();
    const hasAnalyses = analyses.length > 0;
    setHasStoredAnalyses(hasAnalyses);

    if (hasAnalyses) {
      const latestAnalysis = analyses[0];
      setCurrentStoredAnalysis(latestAnalysis);
      setAnalysisState({
        analysis: latestAnalysis.analysis,
        isAnalyzing: false,
        error: null,
        progress: 100,
        stage: 'complete',
        currentChunk: 0,
        totalChunks: 0
      });
    }
  }, [setAnalysisState]);

  // Save completed analysis
  useEffect(() => {
    if (analysis && !isAnalyzing && stage === 'complete' && file) {
      const stored = saveAnalysis(file.name, analysis);
      setCurrentStoredAnalysis(stored);
      setHasStoredAnalyses(true);
      setShowResults(true);
      setProcessingStatus('');
      isAnalyzingNewDocument.current = false;
    }
  }, [analysis, isAnalyzing, stage, file]);

  // Handle new file selection
  const handleFileSelect = useCallback((file: File | null) => {
    isAnalyzingNewDocument.current = true;
    setShowResults(false);
    setCurrentStoredAnalysis(null);
    resetAnalysisState();
    baseHandleFileSelect(file);
  }, [baseHandleFileSelect, resetAnalysisState]);

  // Handle starting analysis
  const handleStartAnalysis = useCallback(async () => {
    clearEntries();
    await handleAnalyze(file);
  }, [clearEntries, handleAnalyze, file]);

  // Handle selecting stored analysis
  const handleSelectStoredAnalysis = useCallback((stored: StoredAnalysis) => {
    isAnalyzingNewDocument.current = false;
    setCurrentStoredAnalysis(stored);
    setAnalysisState({
      analysis: stored.analysis,
      isAnalyzing: false,
      error: null,
      progress: 100,
      stage: 'complete',
      currentChunk: 0,
      totalChunks: 0
    });
    setShowResults(true);
    resetFile();
  }, [setAnalysisState, resetFile]);

  // Combined error state
  const error = fileError || analysisError;

  // Update log on error
  useEffect(() => {
    if (error) {
      updateLastEntry('error');
      setProcessingStatus('');
    }
  }, [error, updateLastEntry]);

  return {
    // State
    file,
    error,
    isProcessing,
    isAnalyzing,
    processingStatus,
    progress: analysisProgress,
    stage,
    currentChunk,
    totalChunks,
    analysis,
    showResults,
    currentStoredAnalysis,
    hasStoredAnalyses,
    entries,

    // Actions
    handleFileSelect,
    handleStartAnalysis,
    handleSelectStoredAnalysis,
    setShowResults,
    updateLastEntry
  };
};
