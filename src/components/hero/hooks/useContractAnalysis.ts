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
}

export const useContractAnalysis = ({ 
  onStatusUpdate,
  onEntryComplete
}: UseContractAnalysisProps = {}) => {
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
        message: 'Please upload a file before analyzing.',
        type: 'warning'
      });
      return;
    }

    const transaction = Sentry.startTransaction({
      name: 'analyze_contract',
      op: 'analyze'
    });

    Sentry.configureScope(scope => {
      scope.setSpan(transaction);
    });

    setIsAnalyzing(true);
    setError(null);
    setAnalysis(null);
    setProgress(2);
    setStage('preprocessing');
    onStatusUpdate?.('Starting contract analysis...');

    const startTime = Date.now();
    trackAnalysisStart(file.type);
    
    try {
      Sentry.setContext("file", {
        type: file.type,
        size: file.size,
        name: file.name
      });

      const readSpan = transaction.startChild({
        op: 'read_document',
        description: 'Read document content'
      });

      let text: string;
      if (file.type === 'application/pdf') {
        text = await readPdfText(file);
      } else {
        text = await file.text();
      }
      setProgress(5);
      readSpan.finish();

      const formData = new FormData();
      formData.append('text', text);
      formData.append('filename', file.name);

      onStatusUpdate?.('Initializing AI analysis...');
      
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

      const requestSpan = transaction.startChild({
        op: 'api_request',
        description: 'Make request to analysis service'
      });

      onStatusUpdate?.('Connecting to analysis service...');
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData
      });

      if (!response.body) {
        throw new Error('No response body received from server');
      }

      requestSpan.finish();

      const streamSpan = transaction.startChild({
        op: 'stream_processing',
        description: 'Process analysis stream'
      });

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
              try {
                const data: AnalysisStreamResponse = JSON.parse(line.slice(6));
                
                if (data.progress) setProgress(data.progress);
                if (data.stage) setStage(data.stage);

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
                  onStatusUpdate?.('Preparing document for analysis...');
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
                  onStatusUpdate?.('Analysis complete!');
                  requestAnimationFrame(() => {
                    onEntryComplete?.();
                  });
                  setAnalysis(data.result);
                  const analysisTime = (Date.now() - startTime) / 1000;
                  trackAnalysisComplete(file.type, analysisTime);
                  break;
                } else if (data.type === 'error') {
                  throw new Error(data.error);
                }
              } catch (e) {
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
        readerRef.current = null;
        streamSpan.finish();
      }

    } catch (error) {
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