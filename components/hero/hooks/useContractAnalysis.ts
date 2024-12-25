import { useState, useRef, useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { readPdfText } from '@/lib/pdf-utils';
import { PDFProcessingError, ContractAnalysisError } from '@/lib/errors';
import { trackAnalysisStart, trackAnalysisComplete, trackError } from '@/lib/analytics-events';
import type { AnalysisResult, ErrorDisplay } from '@/types/analysis';

export type AnalysisStage = 'preprocessing' | 'analyzing' | 'complete';

interface UseContractAnalysisProps {
  onStatusUpdate?: (status: string, duration?: number) => void;
  onEntryComplete?: () => void;
}

interface AnalysisStreamResponse {
  type: 'progress' | 'complete' | 'error';
  progress?: number;
  stage?: AnalysisStage;
  currentChunk?: number;
  totalChunks?: number;
  activity?: string;
  result?: AnalysisResult;
  error?: string;
}

export const useContractAnalysis = ({ onStatusUpdate, onEntryComplete }: UseContractAnalysisProps = {}) => {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<ErrorDisplay | null>(null);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<AnalysisStage>('preprocessing');
  const readerRef = useRef<ReadableStreamDefaultReader | null>(null);

  // Debug logging for state changes
  useEffect(() => {
    console.log('[State] Progress:', progress);
  }, [progress]);

  useEffect(() => {
    console.log('[State] Stage:', stage);
  }, [stage]);

  const processStreamUpdate = (data: AnalysisStreamResponse) => {
    console.log('[Stream] Received update:', data);

    if (data.progress !== undefined) {
      console.log('[Stream] Setting progress:', data.progress);
      setProgress(data.progress);
    }

    if (data.stage) {
      console.log('[Stream] Setting stage:', data.stage);
      setStage(data.stage);
    }

    if (data.activity) {
      console.log('[Stream] Setting activity:', data.activity);
      onStatusUpdate?.(data.activity);
    }
  };

  const handleAnalyze = async (file: File | null) => {
    if (!file) {
      setError({ message: 'Please upload a file before analyzing.', type: 'warning' });
      return;
    }

    console.log('[Analysis] Starting analysis...');
    setIsAnalyzing(true);
    setError(null);
    setAnalysis(null);
    setProgress(1);
    setStage('preprocessing');
    onStatusUpdate?.('Starting document processing...');

    const startTime = Date.now();
    trackAnalysisStart(file.type);

    try {
      let text: string;
      if (file.type === 'application/pdf') {
        text = await readPdfText(file, (progress) => {
          console.log('[PDF] Setting progress:', progress);
          setProgress(progress);
          if (progress <= 2) onStatusUpdate?.('Reading document...');
          else if (progress <= 3) onStatusUpdate?.('Preparing document...');
          else if (progress < 5) onStatusUpdate?.('Extracting text...');
        });
      } else {
        text = await file.text();
        setProgress(5);
      }

      onStatusUpdate?.('Initializing AI analysis...');
      setProgress(10);
      
      const formData = new FormData();
      formData.append('text', text);
      formData.append('filename', file.name);

      console.log('[Analysis] Making API request...');
      const response = await fetch('/api/analyze', { method: 'POST', body: formData });
      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      readerRef.current = reader;
      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            
            try {
              const data: AnalysisStreamResponse = JSON.parse(line.slice(6));
              console.log('[Stream] Parsed data:', data);

              if (data.type === 'complete' && data.result) {
                processStreamUpdate({ 
                  type: 'progress', 
                  progress: 100, 
                  stage: 'complete',
                  activity: 'Analysis complete!' 
                });
                onEntryComplete?.();
                setAnalysis(data.result);
                trackAnalysisComplete(file.type, (Date.now() - startTime) / 1000);
                break;
              } else if (data.type === 'error') {
                throw new Error(data.error);
              } else {
                processStreamUpdate(data);
              }

              // Force React state updates
              await new Promise(resolve => requestAnimationFrame(resolve));
            } catch (e) {
              console.error('[Stream] Error processing update:', e);
              throw e;
            }
          }
        }
      } finally {
        readerRef.current = null;
      }
    } catch (error) {
      console.error('[Analysis] Error:', error);
      handleAnalysisError(error);
    } finally {
      setIsAnalyzing(false);
      console.log('[Analysis] Complete');
    }
  };

  const handleAnalysisError = (error: unknown) => {
    const message = error instanceof Error ? error.message : 'Unknown error';
    setError({ message, type: 'error' });
    setProgress(0);
    setStage('preprocessing');
    if (error instanceof ContractAnalysisError || error instanceof PDFProcessingError) {
      trackError(error.code, error.message);
    } else {
      trackError('UNKNOWN_ERROR', message);
    }
  };

  return { analysis, isAnalyzing, error, progress, stage, handleAnalyze };
};