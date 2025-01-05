import { useState, useRef, useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { readPdfText } from '@/lib/pdf-utils';
import { PDFProcessingError, ContractAnalysisError } from '@/lib/errors';
import { trackAnalysisStart, trackAnalysisComplete, trackError } from '@/lib/analytics-events';
import type { AnalysisResult, ErrorDisplay } from '@/types/analysis';

/** Represents the current stage of contract analysis */
export type AnalysisStage = 'preprocessing' | 'analyzing' | 'complete';

/** Configuration options for the useContractAnalysis hook */
interface UseContractAnalysisProps {
  /** Callback function to handle status updates during analysis */
  onStatusUpdate?: (status: string) => void;
  /** Callback function called when an entry is complete */
  onEntryComplete?: () => void;
}

/** Response structure from the analysis service */
interface AnalysisStreamResponse {
  type: 'update' | 'complete' | 'error';
  progress?: number;
  stage?: AnalysisStage;
  currentChunk?: number;
  totalChunks?: number;
  result?: AnalysisResult;
  error?: string;
  activity?: string;
  description?: string; // Added to catch server descriptions
}

/**
 * A custom hook for handling contract analysis functionality.
 */
export const useContractAnalysis = ({ 
  onStatusUpdate,
  onEntryComplete
}: UseContractAnalysisProps = {}) => {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<ErrorDisplay | null>(null);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<AnalysisStage>('preprocessing');
  const [currentChunk, setCurrentChunk] = useState(0);
  const [totalChunks, setTotalChunks] = useState(0);
  
  const readerRef = useRef<ReadableStreamDefaultReader | null>(null);
  const lastMessageRef = useRef<string>('');

  useEffect(() => {
    return () => {
      if (readerRef.current) {
        readerRef.current.cancel();
      }
    };
  }, []);

  // Helper to update activity without exact duplicates
  const updateActivity = (message: string | undefined) => {
    if (message && message !== lastMessageRef.current) {
      lastMessageRef.current = message;
      onStatusUpdate?.(message);
      console.log('[Client] Activity:', message);
    }
  };

  const handleAnalyze = async (file: File | null) => {
    lastMessageRef.current = ''; // Reset message tracking
    
    if (!file) {
      setError({
        message: 'Please upload a file before analyzing.',
        type: 'warning'
      });
      return;
    }

    // Reset state
    setIsAnalyzing(true);
    setError(null);
    setAnalysis(null);
    setProgress(2);
    setStage('preprocessing');
    setCurrentChunk(0);
    setTotalChunks(0);

    const transaction = Sentry.startTransaction({
      name: 'analyze_contract',
      op: 'analyze'
    });
    
    Sentry.configureScope(scope => {
      scope.setSpan(transaction);
    });

    const startTime = Date.now();
    trackAnalysisStart(file.type);

    try {
      // Process file content
      console.log('[Client] Reading document...');
      let text: string;
      if (file.type === 'application/pdf') {
        text = await readPdfText(file);
      } else {
        text = await file.text();
      }
      setProgress(5);
      
      // Prepare analysis request
      const formData = new FormData();
      formData.append('text', text);
      formData.append('filename', file.name);

      // Initialize analysis state with required fields
      setAnalysis({
        summary: "Starting analysis...",
        keyTerms: [],
        potentialRisks: [],
        importantClauses: [],
        recommendations: [],
        metadata: {
          analyzedAt: new Date().toISOString(),
          documentName: file.name,
          modelVersion: "gpt-3.5-turbo-1106",
          stage: 'preprocessing',
          progress: 5,
          currentChunk: 0,
          totalChunks: 0,
        }
      });

      // Start analysis stream
      updateActivity('Connecting to analysis service...');
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData
      });

      if (!response.body) {
        throw new Error('No response body received from server');
      }

      // Process the stream
      const reader = response.body.getReader();
      readerRef.current = reader;
      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;
          const lines = buffer.split('\n\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data: AnalysisStreamResponse = JSON.parse(line.slice(6));
              console.log('[Client] Server update:', data);

              // Update progress and stage
              if (data.progress) setProgress(data.progress);
              if (data.stage) setStage(data.stage);
              if (data.currentChunk) setCurrentChunk(data.currentChunk);
              if (data.totalChunks) setTotalChunks(data.totalChunks);
              
              // Show most detailed message available
              const message = data.description || data.activity;
              if (message) {
                updateActivity(message);
              }

              // Update metadata
              if (data.currentChunk || data.totalChunks) {
                setAnalysis(prev => {
                  if (!prev) return null;
                  return {
                    ...prev,
                    metadata: {
                      ...prev.metadata!,
                      currentChunk: data.currentChunk || prev.metadata!.currentChunk,
                      totalChunks: data.totalChunks || prev.metadata!.totalChunks,
                      stage: data.stage || prev.metadata!.stage,
                      progress: data.progress || prev.metadata!.progress
                    }
                  };
                });
              }

              // Handle completion
              if (data.type === 'complete' && data.result) {
                updateActivity('Analysis complete!');
                onEntryComplete?.();
                setAnalysis(data.result);
                const analysisTime = (Date.now() - startTime) / 1000;
                trackAnalysisComplete(file.type, analysisTime);
                break;
              }

              // Handle errors
              if (data.type === 'error') {
                throw new Error(data.error);
              }
            }
          }
        }
      } finally {
        readerRef.current = null;
      }

    } catch (error) {
      console.error('[Client] Error analyzing contract:', error);
      Sentry.captureException(error, {
        extra: {
          fileType: file.type,
          fileName: file.name,
          analysisStage: stage,
          progress: progress
        }
      });
      handleAnalysisError(error);
    } finally {
      setIsAnalyzing(false);
      transaction.finish();
    }
  };

  const handleAnalysisError = (error: unknown) => {
    let errorMessage = 'An unexpected error occurred. Please try again.';
    let errorType: ErrorDisplay['type'] = 'error';

    if (error instanceof PDFProcessingError || error instanceof ContractAnalysisError) {
      errorMessage = error.message;
      trackError(error.code, error.message);
    } else {
      trackError('UNKNOWN_ERROR', error instanceof Error ? error.message : 'Unknown error');
    }

    setError({ message: errorMessage, type: errorType });
    setProgress(0);
    setStage('preprocessing');
    setCurrentChunk(0);
    setTotalChunks(0);
  };

  return {
    analysis,
    isAnalyzing,
    error,
    progress,
    stage,
    currentChunk,
    totalChunks,
    handleAnalyze,
  };
};