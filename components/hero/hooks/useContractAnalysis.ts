import { useState, useRef } from 'react';
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

  // Process updates synchronously to ensure state consistency
  const processUpdate = (update: AnalysisStreamResponse) => {
    if (update.progress !== undefined) {
      setProgress(update.progress);
      console.log('[State] Progress set to:', update.progress);
    }
    if (update.stage) {
      setStage(update.stage);
      console.log('[State] Stage set to:', update.stage);
    }
    if (update.activity) {
      onStatusUpdate?.(update.activity);
      console.log('[State] Activity set to:', update.activity);
    }
  };

  const handleAnalyze = async (file: File | null) => {
    if (!file) {
      setError({ message: 'Please upload a file before analyzing.', type: 'warning' });
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysis(null);
    setProgress(1);
    setStage('preprocessing');
    onStatusUpdate?.('Starting document processing...');

    try {
      let text: string;
      if (file.type === 'application/pdf') {
        text = await readPdfText(file, (progress) => {
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

      const response = await fetch('/api/analyze', { method: 'POST', body: formData });
      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      readerRef.current = reader;
      const decoder = new TextDecoder();
      let buffer = '';

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
              // Process final state update synchronously
              processUpdate({ 
                type: 'progress', 
                progress: 100, 
                stage: 'complete',
                activity: 'Analysis complete!' 
              });
              
              // Set the final analysis result
              setAnalysis(data.result);
              onEntryComplete?.();
              break;
            } else if (data.type === 'error') {
              throw new Error(data.error);
            } else {
              // Process regular updates synchronously
              processUpdate(data);
            }
          } catch (e) {
            console.error('[Stream] Parse error:', e);
            throw e;
          }
        }
      }
    } catch (error) {
      console.error('[Analysis] Error:', error);
      handleAnalysisError(error);
    } finally {
      readerRef.current = null;
      setIsAnalyzing(false);
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