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
  const [showResults, setShowResults] = useState(true);
  const [currentStoredAnalysis, setCurrentStoredAnalysis] = useState<StoredAnalysis | null>(null);
  const [hasStoredAnalyses, setHasStoredAnalyses] = useState(false);

  // Check for stored analyses on mount
  useEffect(() => {
    const analyses = getStoredAnalyses();
    setHasStoredAnalyses(analyses.length > 0);
  }, []);

  // Status management
  const { setStatusWithTimeout } = useStatusManager({
    onStatusUpdate: (status: string) => {
      setProcessingStatus(status);
      if (status) {
        addEntry({
          id: String(Date.now()),
          message: status,
          status: 'active',
          timestamp: new Date()
        });
      }
    }
  });

  // Analysis log handling
  const { entries, addEntry, updateLastEntry, clearEntries } = useAnalysisLog();
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
    handleFileSelect
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
    }
  }, [analysis, isAnalyzing, stage, file]);

  // Combined error state
  const error = fileError || analysisError;

  // Update log entry status when error occurs
  useEffect(() => {
    if (error) {
      updateLastEntry('error');
    }
  }, [error, updateLastEntry]);

  // Clear logs and show log window when starting new analysis
  const handleAnalyzeWithLogReset = async () => {
    clearEntries();
    showLogWithAutoHide();
    setShowResults(true);
    setCurrentStoredAnalysis(null);
    await handleAnalyze(file);
  };

  // Handle selecting a stored analysis
  const handleSelectStoredAnalysis = (stored: StoredAnalysis) => {
    setCurrentStoredAnalysis(stored);
    setShowResults(true);
  };

  // Show Analysis button conditions
  const shouldShowAnalysisButton = Boolean(
    (analysis || currentStoredAnalysis) && 
    !showResults && 
    stage === 'complete' && 
    !isAnalyzing && 
    !showLog &&
    !error
  );

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <AnalysisSection
        file={file}
        error={error}
        isProcessing={isProcessing}
        isAnalyzing={isAnalyzing}
        processingStatus={processingStatus}
        progress={analysisProgress}
        stage={stage}
        analysis={analysis}
        showResults={showResults}
        currentStoredAnalysis={currentStoredAnalysis}
        hasStoredAnalyses={hasStoredAnalyses}
        showAnalysisButton={shouldShowAnalysisButton}
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
    </section>
  );
}