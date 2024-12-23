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

export default function Hero() {
  // Status message handling
  const timeoutRef = useRef<NodeJS.Timeout>();
  const hideTimeoutRef = useRef<NodeJS.Timeout>();
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [showLog, setShowLog] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Analysis log handling
  const { entries, addEntry, updateLastEntry, clearEntries } = useAnalysisLog();

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  // Handle log visibility changes (including hover)
  const handleVisibilityChange = (visible: boolean) => {
    console.log(`[Debug] handleVisibilityChange called with visible=${visible}`);
    
    // Update hover state first
    setIsHovered(visible);
    
    if (visible) {
      // When hovering, clear any pending hide timeout and show the log
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = undefined;
        console.log('[Debug] Cleared hide timeout on hover');
      }
      setShowLog(true);
    } else {
      // When mouse leaves, immediately hide after delay
      const hasActiveEntries = entries.some(entry => entry.status === 'active');
      console.log(`[Debug] Mouse left, hasActiveEntries: ${hasActiveEntries}`);
      
      if (!hasActiveEntries) {
        // Clear any existing timeout first
        if (hideTimeoutRef.current) {
          clearTimeout(hideTimeoutRef.current);
          hideTimeoutRef.current = undefined;
        }
        
        console.log(`[Debug] Setting quick hide timeout: ${HIDE_DELAY_AFTER_HOVER}ms`);
        hideTimeoutRef.current = setTimeout(() => {
          console.log('[Debug] Quick hide timeout executed');
          setShowLog(false);
        }, HIDE_DELAY_AFTER_HOVER);
      }
    }
  };

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
    setShowLog(true);
    addEntry(status);
  };

  // Monitor entries for activity changes
  useEffect(() => {
    const hasActiveEntries = entries.some(entry => entry.status === 'active');
    console.log(`[Debug] Entries changed: active=${hasActiveEntries}, count=${entries.length}`);
    
    // Only auto-hide if no active entries and not being hovered
    if (!hasActiveEntries && entries.length > 0 && !isHovered) {
      console.log('[Debug] Setting auto-hide timeout');
      
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = undefined;
      }
      
      hideTimeoutRef.current = setTimeout(() => {
        console.log('[Debug] Auto-hide timeout executed');
        if (!isHovered) {
          setShowLog(false);
        }
      }, HIDE_DELAY_AFTER_COMPLETE);
    }
  }, [entries, isHovered]);

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