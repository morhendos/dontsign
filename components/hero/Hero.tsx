'use client';

import { useState, useEffect, useRef } from 'react';
import * as Sentry from '@sentry/nextjs';
import { readPdfText } from '@/lib/pdf-utils';
import { PDFProcessingError, ContractAnalysisError } from '@/lib/errors';
import { trackAnalysisStart, trackAnalysisComplete, trackError } from '@/lib/analytics-events';
import { FileUploadArea } from '../contract-upload/FileUploadArea';
import { AnalysisButton } from '../contract-analysis/AnalysisButton';
import { AnalysisProgress } from '../contract-analysis/AnalysisProgress';
import { ErrorDisplay } from '../error/ErrorDisplay';
import { AnalysisResults } from '../analysis-results/AnalysisResults';
import type { AnalysisResult, ErrorDisplay as ErrorDisplayType } from '@/types/analysis';

export default function Hero() {
  // ... state and refs remain the same ...

  const handleAnalyze = async () => {
    if (!file) {
      setError({
        message: 'Please upload a file before analyzing.',
        type: 'warning'
      });
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysis(null);
    setProgress(2);
    setStage('preprocessing');
    setStatusWithTimeout('Starting contract analysis...');

    const startTime = Date.now();
    trackAnalysisStart(file.type);
    console.log('[Client] Analysis started');

    try {
      console.log('[Client] Reading document content...');
      let text: string;
      if (file.type === 'application/pdf') {
        text = await readPdfText(file);
      } else {
        text = await file.text();
      }
      setProgress(5);
      console.log('[Client] Document content read successfully');

      const formData = new FormData();
      formData.append('text', text);
      formData.append('filename', file.name);

      setStatusWithTimeout('Initializing AI analysis...');
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
          stage: 'preprocessing',
          progress: 5
        }
      });

      console.log('[Client] Making request to analysis service...');
      setStatusWithTimeout('Connecting to analysis service...');
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData
      });

      console.log('[Client] Got response from server:', response.status);
      if (!response.body) {
        throw new Error('No response body received from server');
      }

      const reader = response.body.getReader();
      readerRef.current = reader;
      const decoder = new TextDecoder();
      let buffer = '';

      console.log('[Client] Starting to read stream...');
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            console.log('[Client] Stream ended');
            break;
          }

          const chunk = decoder.decode(value, { stream: true });
          console.log('[Client] Received chunk:', chunk);
          buffer += chunk;
          const lines = buffer.split('\n\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                console.log('[Client] Parsed update:', data);
                
                setProgress(data.progress);
                setStage(data.stage);

                if (data.stage === 'preprocessing') {
                  setStatusWithTimeout('Preparing document for analysis...');
                } else if (data.stage === 'analyzing') {
                  if (data.currentChunk && data.totalChunks) {
                    setStatusWithTimeout(
                      `Analyzing section ${data.currentChunk} of ${data.totalChunks}`,
                      5000
                    );
                  }
                }

                if (data.currentChunk && data.totalChunks) {
                  setAnalysis(prev => prev ? {
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      currentChunk: data.currentChunk,
                      totalChunks: data.totalChunks
                    }
                  } : prev);
                }

                if (data.type === 'complete' && data.result) {
                  console.log('[Client] Analysis complete, got result:', data.result);
                  setStatusWithTimeout('Analysis complete!');
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

  // ... rest of the component remains the same ...
}