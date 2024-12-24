'use client';

import { useState, useRef, useEffect } from 'react';
import { useContractAnalysis } from './hooks/useContractAnalysis';
import { useFileHandler } from './hooks/useFileHandler';
import { useLogVisibility } from './hooks/useLogVisibility';
import { useAnalysisLog } from '../analysis-log/useAnalysisLog';
import { useAnalysisHistory } from '../analysis-history/hooks/useAnalysisHistory';
import { PageHeader } from '../layout/PageHeader';
import { ContractSection } from '../contract/ContractSection';
import AnalysisLog from '../analysis-log/AnalysisLog';

export default function Hero() {
  // Status message handling
  const timeoutRef = useRef<NodeJS.Timeout>();
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [showResults, setShowResults] = useState(true);

  // Analysis history handling
  const {
    hasStoredAnalyses,
    currentStoredAnalysis,
    saveNewAnalysis,
    selectStoredAnalysis,
    clearCurrentAnalysis
  } = useAnalysisHistory();

  // Analysis log handling
  const { entries, addEntry, updateLastEntry, clearEntries } = useAnalysisLog();
  const {
    isVisible: showLog,
    onVisibilityChange: handleVisibilityChange,
    show: showLogWithAutoHide
  } = useLogVisibility({
    entries
  });

  // Enhanced status handler that updates both the temporary and persistent logs
  const setStatusWithTimeout = (status: string, duration = 2000) => {
    setProcessingStatus(status);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
    
    timeoutRef.current = setTimeout(() => {
      setProcessingStatus('');
      timeoutRef.current = undefined;
    }, duration);

    showLogWithAutoHide();
    addEntry(status);
  };

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
      saveNewAnalysis(file.name, analysis);
    }
  }, [analysis, isAnalyzing, stage, file, saveNewAnalysis]);

  // Combined error state (file error takes precedence)
  const error = fileError || analysisError;

  // Update log entry status when error occurs
  useEffect(() => {
    if (error) {
      updateLastEntry('error');
    }
  }, [error, updateLastEntry]);

  // Clear logs and show log window when starting new analysis
  const handleStartAnalysis = async (file: File | null) => {
    clearEntries();
    showLogWithAutoHide();
    setShowResults(true);
    clearCurrentAnalysis();
    await handleAnalyze(file);
  };

  // Handle selecting a stored analysis
  const handleSelectHistory = (stored: StoredAnalysis) => {
    selectStoredAnalysis(stored);
    setShowResults(true);
  };

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-5xl mx-auto">
        <PageHeader 
          hasHistory={hasStoredAnalyses}
          onSelectHistory={handleSelectHistory}
        />

        <ContractSection 
          // Upload props
          file={file}
          error={error}
          isAnalyzing={isAnalyzing}
          isProcessing={isProcessing}
          analysisProgress={analysisProgress}
          processingStatus={processingStatus}
          onFileSelect={handleFileSelect}
          onAnalyze={handleStartAnalysis}

          // Analysis props
          analysis={currentStoredAnalysis?.analysis || analysis}
          currentChunk={analysis?.metadata?.currentChunk ?? 0}
          totalChunks={analysis?.metadata?.totalChunks ?? 0}
          stage={stage}
          showResults={showResults}
          onShowResults={() => setShowResults(true)}
          onHideResults={() => setShowResults(false)}
          showLog={showLog}
        />

        {entries.length > 0 && (
          <AnalysisLog 
            entries={entries}
            isVisible={showLog}
            onVisibilityChange={handleVisibilityChange}
          />
        )}
      </div>
    </section>
  );
}
