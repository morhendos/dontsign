import { useState, useRef, useEffect, useCallback } from 'react';
import * as Sentry from '@sentry/nextjs';
import { trackAnalysis, startAnalyticsTransaction, captureError } from '../../utils/analytics';
import { processFile } from '../../utils/text-processing';
import type { AnalysisState, AnalysisStreamResponse } from '../../types';

export interface UseContractAnalysisOptions {
  onStatusUpdate?: (status: string) => void;
  onEntryComplete?: () => void;
  onAnalysisComplete?: () => void;
}

/**
 * Hook for handling the contract analysis process
 */
export const useContractAnalysis = (options: UseContractAnalysisOptions = {}) => {
  const [analysisFile, setAnalysisFile] = useState<File | null>(null);
  const [state, setState] = useState<AnalysisState>({
    analysis: null,
    isAnalyzing: false,
    error: null,
    progress: 0,
    stage: 'preprocessing',
    sectionsAnalyzed: 0,
    totalChunks: 0
  });

  const readerRef = useRef<ReadableStreamDefaultReader | null>(null);
  const lastMessageRef = useRef<string>('');

  // Cleanup reader on unmount
  useEffect(() => {
    return () => {
      if (readerRef.current) {
        readerRef.current.cancel();
      }
    };
  }, []);

  // Helper to update activity without duplicates
  const updateActivity = useCallback((message: string | undefined) => {
    if (message && message !== lastMessageRef.current) {
      lastMessageRef.current = message;
      options.onStatusUpdate?.(message);
      console.log('[Analysis] Activity:', message);
    }
  }, [options]);

  // Process analysis stream response
  const processStreamResponse = useCallback((data: AnalysisStreamResponse) => {
    setState(prev => {
      const next = { ...prev };

      if (data.progress) next.progress = data.progress;
      if (data.stage) next.stage = data.stage;
      if (data.currentChunk) next.sectionsAnalyzed = data.currentChunk;
      if (data.totalChunks) next.totalChunks = data.totalChunks;

      // Show most detailed message available
      const message = data.description || data.activity;
      if (message) updateActivity(message);

      // Update metadata if needed
      if (next.analysis && (data.currentChunk || data.totalChunks)) {
        next.analysis = {
          ...next.analysis,
          metadata: {
            ...next.analysis.metadata!,
            sectionsAnalyzed: data.currentChunk || next.analysis.metadata!.sectionsAnalyzed,
            totalChunks: data.totalChunks || next.analysis.metadata!.totalChunks,
            stage: data.stage || next.analysis.metadata!.stage,
            progress: data.progress || next.analysis.metadata!.progress
          }
        };
      }

      // Handle completion
      if (data.type === 'complete' && data.result) {
        next.analysis = data.result;
        next.isAnalyzing = false;
        next.progress = 100;
        next.stage = 'complete';
        // Complete current entry and call complete handlers
        options.onEntryComplete?.();
        options.onAnalysisComplete?.();
      }

      return next;
    });
  }, [options, updateActivity]);

  // Main analyze function
  const analyze = async (file: File | null) => {
    if (!file) {
      setState(prev => ({
        ...prev,
        error: { message: 'Please upload a file before analyzing.', type: 'warning' }
      }));
      return;
    }

    // Reset state
    setState(prev => ({
      ...prev,
      isAnalyzing: true,
      error: null,
      analysis: null,
      progress: 2,
      stage: 'preprocessing',
      sectionsAnalyzed: 0,
      totalChunks: 0
    }));

    const transaction = startAnalyticsTransaction('analyze_contract');
    const startTime = Date.now();
    trackAnalysis.start(file.type);

    try {
      // Process file
      const { text, name } = await processFile(file);

      // Initialize analysis state
      setState(prev => ({
        ...prev,
        analysis: {
          summary: "Starting analysis...",
          potentialRisks: [],
          importantClauses: [],
          recommendations: [],
          metadata: {
            analyzedAt: new Date().toISOString(),
            documentName: name,
            modelVersion: "gpt-3.5-turbo-1106",
            stage: 'preprocessing',
            progress: 5,
            sectionsAnalyzed: 0,
            totalChunks: 0,
          }
        }
      }));

      // Start analysis stream
      updateActivity('Connecting to analysis service...');
      const formData = new FormData();
      formData.append('text', text);
      formData.append('filename', name);
      
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
              const data = JSON.parse(line.slice(6)) as AnalysisStreamResponse;
              console.log('[Analysis] Server update:', data);

              if (data.type === 'error') {
                throw new Error(data.error);
              }

              processStreamResponse(data);

              if (data.type === 'complete') {
                const analysisTime = (Date.now() - startTime) / 1000;
                trackAnalysis.complete(file.type, analysisTime);
                return data.result;
              }
            }
          }
        }
      } finally {
        readerRef.current = null;
      }

    } catch (error) {
      captureError(error, {
        fileType: file.type,
        fileName: file.name,
        analysisStage: state.stage,
        progress: state.progress
      });

      setState(prev => ({
        ...prev,
        error: { 
          message: error instanceof Error ? error.message : 'An unexpected error occurred', 
          type: 'error' 
        },
        progress: 0,
        stage: 'preprocessing',
        sectionsAnalyzed: 0,
        totalChunks: 0,
        isAnalyzing: false
      }));

      trackAnalysis.error(
        'ANALYSIS_ERROR',
        error instanceof Error ? error.message : 'Unknown error'
      );
    } finally {
      transaction.finish();
    }
  };

  // Function to update state externally
  const updateState = useCallback((updates: Partial<AnalysisState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  return {
    ...state,
    analysisFile,
    setAnalysisFile,
    analyze,
    updateState
  };
};
