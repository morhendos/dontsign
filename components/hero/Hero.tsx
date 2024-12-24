'use client';

import { useState, useRef, useEffect } from 'react';
import { useContractAnalysis } from './hooks/useContractAnalysis';
import { useFileHandler } from './hooks/useFileHandler';
import { useLogVisibility } from './hooks/useLogVisibility';
import { FileUploadArea } from '../contract-upload/FileUploadArea';
import { AnalysisButton } from '../contract-analysis/AnalysisButton';
import { AnalysisProgress } from '../contract-analysis/AnalysisProgress';
import { ErrorDisplay } from '../error/ErrorDisplay';
import { AnalysisResults } from '../analysis-results/AnalysisResults';
import { AnalysisHistory } from '../analysis-history/AnalysisHistory';
import AnalysisLog from '../analysis-log/AnalysisLog';
import { useAnalysisLog } from '../analysis-log/useAnalysisLog';
import { FileText } from 'lucide-react';
import { saveAnalysis, getStoredAnalyses, type StoredAnalysis } from '@/lib/storage';

export default function Hero() {
  // Status message handling
  const timeoutRef = useRef<NodeJS.Timeout>();
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [showResults, setShowResults] = useState(true);
  const [currentStoredAnalysis, setCurrentStoredAnalysis] = useState<StoredAnalysis | null>(null);
  const [hasStoredAnalyses, setHasStoredAnalyses] = useState(false);

  // Check for stored analyses on mount
  useEffect(() => {
    const analyses = getStoredAnalyses();
    setHasStoredAnalyses(analyses.length > 0);
  }, []);

  // Analysis log handling
  const { entries, addEntry, updateLastEntry, clearEntries } = useAnalysisLog();
  const {
    isVisible: showLog,
    onVisibilityChange: handleVisibilityChange,
    show: showLogWithAutoHide
  } = useLogVisibility({
    entries // Pass entries to track loading states
  });

  // Enhanced status handler that updates both the temporary and persistent logs
  const setStatusWithTimeout = (status: string, duration = 2000) => {
    // Update the temporary status (for upload area)
    setProcessingStatus(status);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
    
    timeoutRef.current = setTimeout(() => {
      setProcessingStatus('');
      timeoutRef.current = undefined;
    }, duration);

    // Show log and add entry
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
      const stored = saveAnalysis(file.name, analysis);
      setCurrentStoredAnalysis(stored);
      setHasStoredAnalyses(true);
    }
  }, [analysis, isAnalyzing, stage, file]);

  // Combined error state (file error takes precedence)
  const error = fileError || analysisError;

  // Update log entry status when error occurs
  useEffect(() => {
    if (error) {
      updateLastEntry('error');
    }
  }, [error, updateLastEntry]);

  // Clear logs and show log window when starting new analysis
  const handleAnalyzeWithLogReset = async (file: File | null) => {
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

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col items-center mb-12 relative">
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white text-center mb-4">
            Don't Sign Until<br />You're Sure
          </h1>

          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl text-center">
            Upload your contract, let AI highlight the risks and key terms.
          </p>

          {hasStoredAnalyses && (
            <div className="absolute right-0 top-0">
              <AnalysisHistory onSelect={handleSelectStoredAnalysis} />
            </div>
          )}
        </div>

        <FileUploadArea 
          file={file}
          error={error}
          onFileSelect={handleFileSelect}
          isUploading={isProcessing || (isAnalyzing && analysisProgress <= 2)}
          processingStatus={processingStatus}
        />

        <div className="flex justify-center mt-6">
          <AnalysisButton
            isDisabled={!file || isAnalyzing || isProcessing}
            isAnalyzing={isAnalyzing}
            onClick={() => handleAnalyzeWithLogReset(file)}
          />
        </div>

        {isAnalyzing && (
          <AnalysisProgress 
            currentChunk={analysis?.metadata?.currentChunk ?? 0}
            totalChunks={analysis?.metadata?.totalChunks ?? 0}
            isAnalyzing={isAnalyzing}
            stage={stage}
            progress={analysisProgress}
          />
        )}

        {error && <ErrorDisplay error={error} />}
        
        {/* Show floating button when analysis is ready but hidden */}
        {(analysis || currentStoredAnalysis) && !showResults && stage === 'complete' && !isAnalyzing && (
          <button
            onClick={() => setShowResults(true)}
            className={`
              fixed bottom-4 right-4 z-40
              bg-white dark:bg-gray-800
              shadow-lg rounded-full p-3
              text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white
              border border-gray-200 dark:border-gray-700
              transition-all duration-200
              flex items-center gap-2
              hover:shadow-xl
            `}
          >
            <FileText className="w-5 h-5" />
            <span>Show Analysis</span>
          </button>
        )}
        
        {((analysis && showResults) || (currentStoredAnalysis && showResults)) && (
          <AnalysisResults 
            analysis={currentStoredAnalysis?.analysis || analysis!} 
            isAnalyzing={isAnalyzing}
            stage={stage}
            onClose={() => setShowResults(false)}
          />
        )}

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