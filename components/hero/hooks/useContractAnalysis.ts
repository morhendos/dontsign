import { useState, useRef, useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { readPdfText } from '@/lib/pdf-utils';
import { PDFProcessingError, ContractAnalysisError } from '@/lib/errors';
import { trackAnalysisStart, trackAnalysisComplete, trackError } from '@/lib/analytics-events';
import type { AnalysisResult, ErrorDisplay } from '@/types/analysis';

interface AnalysisStreamResponse {
  type: 'update' | 'complete' | 'error';
  progress?: number;
  stage?: AnalysisStage;
  currentChunk?: number;
  totalChunks?: number;
  result?: AnalysisResult;
  error?: string;
  activity?: string;
}

export type AnalysisStage = 'preprocessing' | 'analyzing' | 'complete';

interface UseContractAnalysisProps {
  onStatusUpdate?: (status: string, duration?: number) => void;
  onEntryComplete?: () => void;
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
  const lastStatus = useRef<string>('');

  const readerRef = useRef<ReadableStreamDefaultReader | null>(null);

  useEffect(() => {
    return () => {
      if (readerRef.current) {
        readerRef.current.cancel();
      }
    };
  }, []);

  const updateStatus = (status: string, duration?: number) => {
    if (status !== lastStatus.current) {
      lastStatus.current = status;
      onStatusUpdate?.(status, duration);
    }
  };

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
    setProgress(0);
    setStage('preprocessing');
    updateStatus('Starting document processing...');

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
        text = await readPdfText(file, (progress) => {
          setProgress(progress);
          if (progress <= 2) updateStatus('Reading document...');
          else if (progress <= 3) updateStatus('Preparing document...');
          else if (progress < 5) updateStatus('Extracting text...');
        });
      } else {
        text = await file.text();
        setProgress(5);
      }
      readSpan.finish();

      const formData = new FormData();
      formData.append('text', text);
      formData.append('filename', file.name);

      updateStatus('Initializing AI analysis...');
      setProgress(10);
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
          progress: 10
        }
      });

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData
      });

      if (!response.body) {
        throw new Error('No response body received from server');
      }

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

                if (data.activity) {
                  updateStatus(data.activity);
                } else if (data.stage === 'analyzing' && data.currentChunk && data.totalChunks) {
                  updateStatus(
                    `Analyzing section ${data.currentChunk} of ${data.totalChunks}`,
                    data.currentChunk === data.totalChunks ? undefined : 5000
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
                  updateStatus('Analysis complete!');
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