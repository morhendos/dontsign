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
  onStatusUpdate?: (status: string, duration?: number) => void;
  /** Callback for signaling when a process is complete */
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
}

/**
 * A custom hook for handling contract analysis functionality.
 *
 * This hook manages the entire contract analysis workflow including:
 * - File content extraction (PDF and DOCX)
 * - Communication with analysis service
 * - Progress tracking
 * - Error handling
 * - Analytics tracking
 * - Error monitoring with Sentry
 *
 * @param props - Configuration options for the hook
 * @returns Object containing analysis state and control functions
 */
export const useContractAnalysis = ({ onStatusUpdate, onEntryComplete }: UseContractAnalysisProps = {}) => {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<ErrorDisplay | null>(null);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<AnalysisStage>('preprocessing');
  
  const readerRef = useRef<ReadableStreamDefaultReader | null>(null);

  useEffect(() => {
    return () => {
      if (readerRef.current) {
        readerRef.current.cancel();
      }
    };
  }, []);

  const handleAnalyze = async (file: File | null) => {
    if (!file) {
      setError({
        message: 'Please upload a file before analyzing',
        type: 'warning'
      });
      return;
    }

    // Start a new Sentry transaction for the entire analysis process
    const transaction = Sentry.startTransaction({
      name: 'analyze_contract',
      op: 'analyze'
    });

    // Set the transaction as the current span for child operations
    Sentry.configureScope(scope => {
      scope.setSpan(transaction);
    });

    setIsAnalyzing(true);
    setError(null);
    setAnalysis(null);
    setProgress(2);
    setStage('preprocessing');
    onStatusUpdate?.('Starting contract analysis', 2000);

    const startTime = Date.now();
    trackAnalysisStart(file.type);
    console.log('[Client] Analysis started');

    try {
      // Add file info to Sentry scope for better error context
      Sentry.setContext("file", {
        type: file.type,
        size: file.size,
        name: file.name
      });

      // Track document reading as a separate operation
      const readSpan = transaction.startChild({
        op: 'read_document',
        description: 'Read document content'
      });

      console.log('[Client] Reading document content');
      let text: string;
      if (file.type === 'application/pdf') {
        text = await readPdfText(file);
      } else {
        text = await file.text();
      }
      setProgress(5);
      console.log('[Client] Document content read successfully');
      readSpan.finish();

      const formData = new FormData();
      formData.append('text', text);
      formData.append('filename', file.name);

      onStatusUpdate?.('Initializing AI analysis', 2000);
      console.log('[Client] Initializing analysis state');
      setAnalysis({
        summary: "Starting analysis",
        keyTerms: [],
        potentialRisks: [],
        importantClauses: [],
        recommendations: [],
        metadata: {
          analyzedAt: new Date().toISOString(),
          documentName: file.name,
          modelVersion: "gpt-3.5-turbo-1106",
          totalChunks: 0,
          currentChunk: 0,
          stage: 'preprocessing' as const,
          progress: 5
        }
      });

      // Track API request as a separate operation
      const requestSpan = transaction.startChild({
        op: 'api_request',
        description: 'Make request to analysis service'
      });

      console.log('[Client] Making request to analysis service');
      onStatusUpdate?.('Connecting to analysis service', 2000);
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData
      });

      console.log('[Client] Got response from server:', response.status);
      if (!response.body) {
        throw new Error('No response body received from server');
      }

      requestSpan.finish();

      // Track stream processing as a separate operation
      const streamSpan = transaction.startChild({
        op: 'stream_processing',
        description: 'Process analysis stream'
      });

      const reader = response.body.getReader();
      readerRef.current = reader;
      const decoder = new TextDecoder();
      let buffer = '';

      console.log('[Client] Starting to read stream');
      try {
        while (true) {
          const { done, value } = await reader.read();
          console.log('[Client] Stream read iteration:', { done, hasValue: !!value });
          
          if (done) {
            console.log('[Client] Stream ended normally');
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          console.log('[Client] Received chunk data:', chunk);
          buffer += chunk;
          const lines = buffer.split('\n\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data: AnalysisStreamResponse = JSON.parse(line.slice(6));
                console.log('[Client] Parsed update:', data);
                
                if (data.progress) setProgress(data.progress);
                if (data.stage) setStage(data.stage);

                // Add breadcrumb for each analysis update
                Sentry.addBreadcrumb({
                  category: 'analysis',
                  message: `Analysis update received`,
                  level: 'info',
                  data: {
                    type: data.type,
                    stage: data.stage,
                    progress: data.progress,
                    currentChunk: data.currentChunk,
                    totalChunks: data.totalChunks
                  }
                });

                if (data.stage === 'preprocessing') {
                  onStatusUpdate?.('Preparing document for analysis', 3000);
                } else if (data.stage === 'analyzing' && data.currentChunk && data.totalChunks) {
                  onStatusUpdate?.(
                    `Analyzing section ${data.currentChunk} of ${data.totalChunks}`,
                    5000
                  );
                }

                if (data.currentChunk && data.totalChunks) {
                  setAnalysis(prev => {
                    if (!prev) return null;
                    return {
                      ...prev,
                      metadata: {
                        analyzedAt: prev.metadata?.analyzedAt || new Date().toISOString(),
                        documentName: prev.metadata?.documentName || '',
                        modelVersion: prev.metadata?.modelVersion || "gpt-3.5-turbo-1106",
                        currentChunk: data.currentChunk,
                        totalChunks: data.totalChunks,
                        stage: data.stage || 'analyzing',
                        progress: data.progress || 0
                      }
                    };
                  });
                }

                if (data.type === 'complete' && data.result) {
                  console.log('[Client] Analysis complete, got result:', data.result);
                  onStatusUpdate?.('Analysis complete', 2000);
                  onEntryComplete?.(); // Mark the final status as complete
                  setAnalysis(data.result);
                  const analysisTime = (Date.now() - startTime) / 1000;
                  trackAnalysisComplete(file.type, analysisTime);
                  break;
                } else if (data.type === 'error') {
                  throw new Error(data.error);
                }
              } catch (e) {
                console.error('[Client] Error parsing server update:', e);
                Sentry.captureException(e, {
                  extra: {
                    rawLine: line,
                    stage: 'parsing_update'
                  }
                });
                throw e;
              }
            }
          }
        }
      } finally {
        console.log('[Client] Cleaning up reader');
        readerRef.current = null;
        streamSpan.finish();
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
  };

  return {
    analysis,
    isAnalyzing,
    error,
    progress,
    stage,
    handleAnalyze,
  };
};
