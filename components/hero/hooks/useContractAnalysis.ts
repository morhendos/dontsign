import { useState, useRef } from 'react';
import * as Sentry from '@sentry/nextjs';
import { readPdfText } from '@/lib/pdf-utils';
import { PDFProcessingError, ContractAnalysisError } from '@/lib/errors';
import { trackAnalysisStart, trackAnalysisComplete, trackError } from '@/lib/analytics-events';
import type { AnalysisResult, ErrorDisplay } from '@/types/analysis';

export type AnalysisStage = 'preprocessing' | 'analyzing' | 'complete';

interface UseContractAnalysisProps {
  onStatusUpdate?: (status: string, options?: { type?: 'persistent' | 'temporary', duration?: number }) => void;
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

const STATUS_MESSAGES = {
  READING: 'Reading document...',
  EXTRACTING: 'Extracting text...',
  PREPARING: 'Preparing document for analysis...',
  INITIALIZING: 'Starting AI analysis...',
  PROCESSING_CHUNK: (current: number, total: number) => `Processing section ${current} of ${total}`,
  PROCESSING_SUMMARIES: 'Processing summaries...',
  CONSOLIDATING_TERMS: 'Consolidating key terms...',
  MERGING_RISKS: 'Merging risk analysis...',
  REVIEWING_CLAUSES: 'Reviewing clauses...',
  COMBINING_RECOMMENDATIONS: 'Combining recommendations...',
  FINALIZING: 'Finalizing analysis...',
  COMPLETE: 'Analysis complete!'
};

export const useContractAnalysis = ({ onStatusUpdate, onEntryComplete }: UseContractAnalysisProps = {}) => {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<ErrorDisplay | null>(null);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<AnalysisStage>('preprocessing');
  const [currentChunk, setCurrentChunk] = useState(0);
  const [totalChunks, setTotalChunks] = useState(0);
  const readerRef = useRef<ReadableStreamDefaultReader | null>(null);
  
  const updateStatus = (message: string) => {
    console.log('[Status Update]', message);
    onStatusUpdate?.(message, { type: 'persistent' });
  };

  const processUpdate = (data: AnalysisStreamResponse) => {
    console.log('[Processing Update]', data);
    
    if (data.progress !== undefined) {
      console.log('[Setting Progress]', data.progress);
      setProgress(data.progress);
    }
    
    if (data.stage) {
      console.log('[Setting Stage]', data.stage);
      setStage(data.stage);
    }
    
    if (data.currentChunk !== undefined) {
      console.log('[Setting Current Chunk]', data.currentChunk);
      setCurrentChunk(data.currentChunk);
    }
    if (data.totalChunks !== undefined) {
      console.log('[Setting Total Chunks]', data.totalChunks);
      setTotalChunks(data.totalChunks);
    }

    if (data.activity) {
      console.log('[Got Activity]', data.activity);
      updateStatus(data.activity);
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
    setProgress(0);
    setStage('preprocessing');
    setCurrentChunk(0);
    setTotalChunks(0);
    updateStatus('Starting document processing...');

    try {
      // Read the file
      const text = file.type === 'application/pdf' 
        ? await readPdfText(file, (progress) => {
            setProgress(progress);
            updateStatus('Reading document...');
          })
        : await file.text();

      // Prepare form data
      const formData = new FormData();
      formData.append('text', text);
      formData.append('filename', file.name);

      // Send the request
      console.log('[Sending Request]');
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData
      });

      // Check response
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      if (!response.body) {
        throw new Error('No response body');
      }

      // Read the response stream
      const reader = response.body.getReader();
      readerRef.current = reader;
      const decoder = new TextDecoder();
      let buffer = '';

      console.log('[Starting Stream Read]');
      try {
        while (true) {
          const { done, value } = await reader.read();
          console.log('[Stream Read]', { done, hasValue: !!value });
          
          if (done) break;
          
          // Decode and append to buffer
          buffer += decoder.decode(value, { stream: true });
          console.log('[Buffer]', buffer);
          
          // Split on double newline (SSE format)
          const lines = buffer.split('\n\n');
          // Keep the last partial line in the buffer
          buffer = lines.pop() || '';
          
          // Process complete lines
          console.log('[Processing Lines]', lines);
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            
            try {
              const data = JSON.parse(line.slice(6)) as AnalysisStreamResponse;
              console.log('[Parsed Data]', data);

              if (data.type === 'error') {
                throw new Error(data.error);
              } else if (data.type === 'complete' && data.result) {
                processUpdate({
                  type: 'progress',
                  progress: 100,
                  stage: 'complete',
                  activity: 'Analysis complete!'
                });
                setAnalysis(data.result);
                onEntryComplete?.();
                return;
              } else {
                processUpdate(data);
              }
            } catch (e) {
              console.error('[Parse Error]', e);
              throw e;
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      console.error('[Analysis Error]', error);
      handleAnalysisError(error);
    } finally {
      if (readerRef.current) {
        readerRef.current.releaseLock();
        readerRef.current = null;
      }
      setIsAnalyzing(false);
    }
  };

  const handleAnalysisError = (error: unknown) => {
    const message = error instanceof Error ? error.message : 'Unknown error';
    setError({ message, type: 'error' });
    setProgress(0);
    setStage('preprocessing');
    setCurrentChunk(0);
    setTotalChunks(0);
    if (error instanceof ContractAnalysisError || error instanceof PDFProcessingError) {
      trackError(error.code, error.message);
    } else {
      trackError('UNKNOWN_ERROR', message);
    }
  };

  return { 
    analysis, 
    isAnalyzing, 
    error, 
    progress, 
    stage, 
    currentChunk,
    totalChunks,
    handleAnalyze 
  };
};