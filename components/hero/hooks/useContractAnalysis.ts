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

// Consistent status messages across all places
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
  
  // Helper to update status consistently across all places
  const updateStatus = (message: string) => {
    console.log('[Status]', message);
    onStatusUpdate?.(message, { type: 'persistent' });
  };

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
    if (update.currentChunk !== undefined) {
      setCurrentChunk(update.currentChunk);
      console.log('[State] Current chunk set to:', update.currentChunk);
    }
    if (update.totalChunks !== undefined) {
      setTotalChunks(update.totalChunks);
      console.log('[State] Total chunks set to:', update.totalChunks);
    }

    // Map server activities to our consistent messages
    if (update.activity) {
      let statusMessage = update.activity;
      switch (update.activity) {
        case 'Starting AI analysis':
          statusMessage = STATUS_MESSAGES.INITIALIZING;
          break;
        case 'Processing summaries':
          statusMessage = STATUS_MESSAGES.PROCESSING_SUMMARIES;
          break;
        case 'Consolidating key terms':
          statusMessage = STATUS_MESSAGES.CONSOLIDATING_TERMS;
          break;
        case 'Merging risk analysis':
          statusMessage = STATUS_MESSAGES.MERGING_RISKS;
          break;
        case 'Reviewing clauses':
          statusMessage = STATUS_MESSAGES.REVIEWING_CLAUSES;
          break;
        case 'Combining recommendations':
          statusMessage = STATUS_MESSAGES.COMBINING_RECOMMENDATIONS;
          break;
        case 'Finalizing output':
          statusMessage = STATUS_MESSAGES.FINALIZING;
          break;
        case 'Analysis complete':
          statusMessage = STATUS_MESSAGES.COMPLETE;
          break;
      }
      updateStatus(statusMessage);
    } else if (update.currentChunk && update.totalChunks) {
      updateStatus(STATUS_MESSAGES.PROCESSING_CHUNK(update.currentChunk, update.totalChunks));
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
    setCurrentChunk(0);
    setTotalChunks(0);
    updateStatus(STATUS_MESSAGES.READING);

    try {
      let text: string;
      if (file.type === 'application/pdf') {
        text = await readPdfText(file, (progress) => {
          setProgress(progress);
          if (progress <= 2) updateStatus(STATUS_MESSAGES.READING);
          else if (progress <= 3) updateStatus(STATUS_MESSAGES.PREPARING);
          else if (progress < 5) updateStatus(STATUS_MESSAGES.EXTRACTING);
        });
      } else {
        text = await file.text();
        setProgress(5);
      }

      updateStatus(STATUS_MESSAGES.INITIALIZING);
      setProgress(10);
      setStage('analyzing');

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
                activity: STATUS_MESSAGES.COMPLETE,
                currentChunk: data.result.metadata?.totalChunks || 1,
                totalChunks: data.result.metadata?.totalChunks || 1
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