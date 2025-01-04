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

  // Check for stored analyses and initialize state on mount
  useEffect(() => {
    const analyses = getStoredAnalyses();
    setHasStoredAnalyses(analyses.length > 0);
    // If there are stored analyses, set the most recent one as current
    if (analyses.length > 0) {
      setCurrentStoredAnalysis(analyses[0]);
    }
  }, []);

  // Analysis log handling
  const { entries, addEntry, updateLastEntry, clearEntries } = useAnalysisLog();

  // Status management with single message display
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

  const {
    isVisible: showLog,
    onVisibilityChange: handleVisibilityChange,
    show: showLogWithAutoHide
  } = useLogVisibility({
    entries
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
    handleAnalyze
  } = useContractAnalysis({
    onStatusUpdate: setStatusWithTimeout,
    onEntryComplete: () => updateLastEntry('complete')
  });

  // Store analysis when complete
  useEffect(() => {
    if (analysis && !isAnalyzing && stage === 'complete' && file) {
      const stored = saveAnalysis(file.name, analysis);
      setCurrentStoredAnalysis(stored);
      setHasStoredAnalyses(true);
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
    setShowResults(false);
    await handleAnalyze(file);
  };

  // Handle selecting a stored analysis
  const handleSelectStoredAnalysis = (stored: StoredAnalysis) => {
    setCurrentStoredAnalysis(stored);
    setShowResults(true);
    // Reset current file and analysis state since we're viewing a stored analysis
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
