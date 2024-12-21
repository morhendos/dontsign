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
 *
 * @param props - Configuration options for the hook
 * @returns Object containing analysis state and control functions
 *
 * @example
 * ```tsx
 * const {
 *   analysis,
 *   isAnalyzing,
 *   error,
 *   progress,
 *   stage,
 *   handleAnalyze
 * } = useContractAnalysis({
 *   onStatusUpdate: (status) => console.log(status)
 * });
 * ```
 */
export const useContractAnalysis = ({ onStatusUpdate }: UseContractAnalysisProps = {}) => {
  // Analysis result state
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  // Analysis progress states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<AnalysisStage>('preprocessing');
  // Error handling state
  const [error, setError] = useState<ErrorDisplay | null>(null);
  
  // Reference to stream reader for cleanup
  const readerRef = useRef<ReadableStreamDefaultReader | null>(null);

  // Cleanup function to cancel any ongoing streams
  useEffect(() => {
    return () => {
      if (readerRef.current) {
        readerRef.current.cancel();
      }
    };
  }, []);

  /**
   * Handles errors that occur during analysis.
   * Maps different error types to appropriate user messages and tracks them.
   */
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

  /**
   * Initiates and manages the contract analysis process.
   * 
   * @param file - The file to analyze (PDF or DOCX)
   */
  const handleAnalyze = async (file: File | null) => {
    if (!file) {
      setError({
        message: 'Please upload a file before analyzing.',
        type: 'warning'
      });
      return;
    }

    // Reset states and start analysis
    setIsAnalyzing(true);
    setError(null);
    setAnalysis(null);
    setProgress(2);
    setStage('preprocessing');
    onStatusUpdate?.('Starting contract analysis...');

    const startTime = Date.now();
    trackAnalysisStart(file.type);
    console.log('[Client] Analysis started');

    try {
      // Extract text content based on file type
      console.log('[Client] Reading document content...');
      let text: string;
      if (file.type === 'application/pdf') {
        text = await readPdfText(file);
      } else {
        text = await file.text();
      }
      setProgress(5);
      console.log('[Client] Document content read successfully');

      // Prepare form data for analysis request
      const formData = new FormData();
      formData.append('text', text);
      formData.append('filename', file.name);

      // Initialize analysis state
      onStatusUpdate?.('Initializing AI analysis...');
      console.log('[Client] Initializing analysis state');
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
          totalChunks: 0,
          currentChunk: 0,
          stage: 'preprocessing' as const,
          progress: 5
        }
      });

      // Make request to analysis service
      console.log('[Client] Making request to analysis service...');
      onStatusUpdate?.('Connecting to analysis service...');
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData
      });

      console.log('[Client] Got response from server:', response.status);
      if (!response.body) {
        throw new Error('No response body received from server');
      }

      // Set up stream reading
      const reader = response.body.getReader();
      readerRef.current = reader;
      const decoder = new TextDecoder();
      let buffer = '';

      // Process the stream
      console.log('[Client] Starting to read stream...');
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            console.log('[Client] Stream ended');
            break;
          }

          // Process chunks and handle server-sent events
          const chunk = decoder.decode(value, { stream: true });
          console.log('[Client] Received chunk:', chunk);
          buffer += chunk;
          const lines = buffer.split('\n\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data: AnalysisStreamResponse = JSON.parse(line.slice(6));
                console.log('[Client] Parsed update:', data);
                
                // Update progress and stage
                if (data.progress) setProgress(data.progress);
                if (data.stage) setStage(data.stage);

                // Handle status updates based on stage
                if (data.stage === 'preprocessing') {
                  onStatusUpdate?.('Preparing document for analysis...');
                } else if (data.stage === 'analyzing' && data.currentChunk && data.totalChunks) {
                  onStatusUpdate?.(
                    `Analyzing section ${data.currentChunk} of ${data.totalChunks}`
                  );
                }

                // Update analysis metadata
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

                // Handle completion or error
                if (data.type === 'complete' && data.result) {
                  console.log('[Client] Analysis complete, got result:', data.result);
                  onStatusUpdate?.('Analysis complete!');
                  setAnalysis(data.result);
                  const analysisTime = (Date.now() - startTime) / 1000;
                  trackAnalysisComplete(file.type, analysisTime);
                  break;
                } else if (data.type === 'error') {
                  throw new Error(data.error);
                }
              } catch (e) {
                console.error('[Client] Error parsing server update:', e);
                throw e;
              }
            }
          }
        }
      } finally {
        console.log('[Client] Cleaning up reader');
        readerRef.current = null;
      }

    } catch (error) {
      console.error('[Client] Error analyzing contract:', error);
      handleAnalysisError(error);
    } finally {
      setIsAnalyzing(false);
    }
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
