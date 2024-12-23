'use client';

import { useState, useRef, useEffect } from 'react';
import { useContractAnalysis } from './hooks/useContractAnalysis';
import { useFileHandler } from './hooks/useFileHandler';
import { FileUploadArea } from '../contract-upload/FileUploadArea';
import { AnalysisButton } from '../contract-analysis/AnalysisButton';
import { AnalysisProgress } from '../contract-analysis/AnalysisProgress';
import { ErrorDisplay } from '../error/ErrorDisplay';
import { AnalysisResults } from '../analysis-results/AnalysisResults';
import AnalysisLog from '../analysis-log/AnalysisLog';
import { useAnalysisLog } from '../analysis-log/useAnalysisLog';

// Timing constants for log visibility
const HIDE_DELAY_AFTER_COMPLETE = 2000; // 2s delay after completion
const HIDE_DELAY_AFTER_HOVER = 150;     // 150ms quick fade after mouse leave

type HideReason = 'hover' | 'auto' | null;

export default function Hero() {
  // Status message handling
  const timeoutRef = useRef<NodeJS.Timeout>();
  const hideTimeoutRef = useRef<NodeJS.Timeout>();
  const hideReasonRef = useRef<HideReason>(null);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [showLog, setShowLog] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const isHoveredRef = useRef(false);

  // Analysis log handling
  const { entries, addEntry, updateLastEntry, clearEntries } = useAnalysisLog();

  // Keep isHoveredRef in sync with isHovered state
  useEffect(() => {
    isHoveredRef.current = isHovered;
  }, [isHovered]);

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  const clearHideTimeout = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = undefined;
      hideReasonRef.current = null;
    }
  };

  const setHideTimeout = (delay: number, reason: HideReason) => {
    // Don't set a new timeout if we already have one with higher priority
    if (hideReasonRef.current === 'hover' && reason === 'auto') {
      return;
    }

    clearHideTimeout();
    console.log(`[Debug] Setting ${reason} hide timeout: ${delay}ms`);
    
    hideReasonRef.current = reason;
    hideTimeoutRef.current = setTimeout(() => {
      console.log(`[Debug] ${reason} hide timeout executed. isHovered=${isHoveredRef.current}`);
      if (!isHoveredRef.current) {
        setShowLog(false);
        hideReasonRef.current = null;
      }
    }, delay);
  };

  // Handle log visibility changes (including hover)
  const handleVisibilityChange = (visible: boolean) => {
    console.log(`[Debug] handleVisibilityChange called with visible=${visible}`);
    setIsHovered(visible);
    
    if (visible) {
      clearHideTimeout();
      setShowLog(true);
    } else {
      const hasActiveEntries = entries.some(entry => entry.status === 'active');
      console.log(`[Debug] Mouse left, hasActiveEntries: ${hasActiveEntries}`);
      
      if (!hasActiveEntries) {
        setHideTimeout(HIDE_DELAY_AFTER_HOVER, 'hover');
      }
    }
  };

  // Monitor entries for activity changes
  useEffect(() => {
    const hasActiveEntries = entries.some(entry => entry.status === 'active');
    console.log(`[Debug] Entries changed: active=${hasActiveEntries}, count=${entries.length}`);
    
    // Only set up auto-hide if:
    // 1. No active entries
    // 2. We have some entries
    // 3. Not being hovered
    // 4. No hover hide in progress
    if (!hasActiveEntries && entries.length > 0 && !isHovered) {
      setHideTimeout(HIDE_DELAY_AFTER_COMPLETE, 'auto');
    }
  }, [entries, isHovered]);

  // Rest of the component remains the same...
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

    setShowLog(true);
    addEntry(status);
  };

  // File handling
  const {
    file,
    error: fileError,
    isProcessing,
    progress: fileProgress,
    handleFileSelect
  } = useFileHandler({
    onStatusUpdate: setStatusWithTimeout,
    onEntryComplete: () => updateLastEntry('complete')
  });

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

  const error = fileError || analysisError;

  useEffect(() => {
    if (error) {
      updateLastEntry('error');
    }
  }, [error, updateLastEntry]);

  const handleAnalyzeWithLogReset = async (file: File | null) => {
    clearEntries();
    setShowLog(true);
    await handleAnalyze(file);
  };

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-5xl font-bold mb-6 tracking-tight text-gray-900 dark:text-white text-center">
          Don't Sign Until<br />You're Sure
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto text-center">
          Upload your contract, let AI highlight the risks and key terms.
        </p>

        <FileUploadArea 
          file={file}
          error={error}
          onFileSelect={handleFileSelect}
          isUploading={isProcessing || (isAnalyzing && analysisProgress <= 2)}
          processingStatus={processingStatus}
          progress={isProcessing ? fileProgress : analysisProgress}
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
        {analysis && <AnalysisResults analysis={analysis} />}

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