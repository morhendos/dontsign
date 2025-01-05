'use client';

import { useState, useEffect } from 'react';
import { useContractAnalysis } from './hooks/useContractAnalysis';
import { useFileHandler } from './hooks/useFileHandler';
import { useLogVisibility } from './hooks/useLogVisibility';
import { AnalysisSection } from './AnalysisSection';
import { useStatusManager } from './StatusManager';
import { useAnalysisLog } from '../analysis-log/useAnalysisLog';
import AnalysisLog from '../analysis-log/AnalysisLog';
import { saveAnalysis, getStoredAnalyses, type StoredAnalysis } from '@/lib/storage';

/**
 * Main hero component that handles the contract analysis workflow
 */
export default function Hero() {
  // UI state
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [showResults, setShowResults] = useState(false);
  const [currentStoredAnalysis, setCurrentStoredAnalysis] = useState<StoredAnalysis | null>(null);
  const [hasStoredAnalyses, setHasStoredAnalyses] = useState(false);

  // Analysis log handling
  const { entries, addEntry, updateLastEntry, clearEntries } = useAnalysisLog();

  // Status management
  const { setStatusWithTimeout } = useStatusManager({
    onStatusUpdate: (status: string) => {
      setProcessingStatus(status);
      // Only add new entry if status is non-empty
      if (status) {
        // First complete any active entries
        updateLastEntry('complete');
        // Then add the new entry
        addEntry(status);
      }
    }
  });

  // File handling
  const {
    file,
    error: fileError,
    isProcessing,
    handleFileSelect,
    resetFile
  } = useFileHandler({
    onStatusUpdate: setStatusWithTimeout,
    onEntryComplete: () => updateLastEntry('complete')
  });

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
    setAnalysisState  // Get the setter function from the hook
  } = useContractAnalysis({
    onStatusUpdate: setStatusWithTimeout,
    onEntryComplete: () => updateLastEntry('complete')
  });

  // Check for stored analyses and initialize state on mount
  useEffect(() => {
    const analyses = getStoredAnalyses();
    setHasStoredAnalyses(analyses.length > 0);
    if (analyses.length > 0) {
      const latestAnalysis = analyses[0];
      setCurrentStoredAnalysis(latestAnalysis);
      // Also set the analysis state and show results
      setAnalysisState({
        analysis: latestAnalysis.analysis,
        isAnalyzing: false,
        error: null,
        progress: 100,
        stage: 'complete',
        currentChunk: null,
        totalChunks: null
      });
      setShowResults(true);
    }
  }, [setAnalysisState]);

  const {
    isVisible: showLog,
    onVisibilityChange: handleVisibilityChange,
    show: showLogWithAutoHide
  } = useLogVisibility({
    entries
  });

  // Store analysis when complete and show results
  useEffect(() => {
    if (analysis && !isAnalyzing && stage === 'complete' && file) {
      const stored = saveAnalysis(file.name, analysis);
      setCurrentStoredAnalysis(stored);
      setHasStoredAnalyses(true);
      // Show the results when analysis completes
      setShowResults(true);
      // Clear status when complete
      setProcessingStatus('');
    }
  }, [analysis, isAnalyzing, stage, file]);

  // Combined error state
  const error = fileError || analysisError;

  // Update log entry status when error occurs
  useEffect(() => {
    if (error) {
      updateLastEntry('error');
      // Clear status on error
      setProcessingStatus('');
    }
  }, [error, updateLastEntry]);

  // Clear logs and show log window when starting new analysis
  const handleAnalyzeWithLogReset = async () => {
    clearEntries();
    showLogWithAutoHide();
    setShowResults(false);  // Hide results when starting new analysis
    await handleAnalyze(file);
  };

  // Handle selecting a stored analysis
  const handleSelectStoredAnalysis = (stored: StoredAnalysis) => {
    setCurrentStoredAnalysis(stored);
    // Set the analysis state when selecting a stored analysis
    setAnalysisState({
      analysis: stored.analysis,
      isAnalyzing: false,
      error: null,
      progress: 100,
      stage: 'complete',
      currentChunk: null,
      totalChunks: null
    });
    setShowResults(true);
    // Reset current file state since we're viewing a stored analysis
    resetFile();
  };

  return (
    <>
      <AnalysisSection
        file={file}
        error={error}
        isProcessing={isProcessing}
        isAnalyzing={isAnalyzing}
        processingStatus={processingStatus}
        progress={analysisProgress}
        stage={stage}
        currentChunk={currentChunk}
        totalChunks={totalChunks}
        analysis={analysis}
        showResults={showResults}
        currentStoredAnalysis={currentStoredAnalysis}
        hasStoredAnalyses={hasStoredAnalyses}
        showAnalysisButton={Boolean(analysis || currentStoredAnalysis)}
        onFileSelect={handleFileSelect}
        onAnalyze={handleAnalyzeWithLogReset}
        onShowResults={setShowResults}
        onSelectStoredAnalysis={handleSelectStoredAnalysis}
      />

      {entries.length > 0 && (
        <AnalysisLog 
          entries={entries}
          isVisible={showLog}
          onVisibilityChange={handleVisibilityChange}
        />
      )}
    </>
  );
}
