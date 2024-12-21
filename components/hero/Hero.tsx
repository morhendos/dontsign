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
  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<ErrorDisplayType | null>(null);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<'preprocessing' | 'analyzing' | 'complete'>('preprocessing');
  
  // Keep track of the EventSource instance
  const eventSourceRef = useRef<EventSource | null>(null);
  
  // Cleanup function for the EventSource
  const cleanupEventSource = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  };

  // Cleanup on component unmount
  useEffect(() => {
    return () => cleanupEventSource();
  }, []);
  
  const handleFileSelect = async (selectedFile: File | null) => {
    if (!selectedFile) {
      setError({
        message: 'Please select a valid PDF or DOCX file.',
        type: 'warning'
      });
      return;
    }

    // Start tracking upload progress
    setIsAnalyzing(true);
    setProgress(1);
    setStage('preprocessing');

    try {
      // For PDFs, we validate and preload the document
      if (selectedFile.type === 'application/pdf') {
        await readPdfText(selectedFile, true);
      }
      
      setProgress(2);
      setFile(selectedFile);
      setAnalysis(null);
      setError(null);
    } catch (error) {
      console.error('Error processing uploaded file:', error);
      handleAnalysisError(error);
    } finally {
      setIsAnalyzing(false);
      setProgress(0);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError({
        message: 'Please upload a file before analyzing.',
        type: 'warning'
      });
      return;
    }

    // Reset states
    setIsAnalyzing(true);
    setError(null);
    setAnalysis(null);
    setProgress(2);
    setStage('preprocessing');

    // Cleanup any existing EventSource
    cleanupEventSource();

    const startTime = Date.now();
    trackAnalysisStart(file.type);

    try {
      let text: string;
      if (file.type === 'application/pdf') {
        text = await readPdfText(file);
      } else {
        text = await file.text();
      }
      setProgress(5);

      // Create FormData
      const formData = new FormData();
      formData.append('text', text);
      formData.append('filename', file.name);

      // Initial analysis state
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

      // Make initial POST request
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData
      });

      if (!response.body) {
        throw new Error('No response body');
      }

      // Setup streaming response handling
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || ''; // Keep the incomplete chunk in the buffer

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            
            setProgress(data.progress);
            setStage(data.stage);

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

            if (data.type === 'complete') {
              setAnalysis(data.result);
              const analysisTime = (Date.now() - startTime) / 1000;
              trackAnalysisComplete(file.type, analysisTime);
              break;
            } else if (data.type === 'error') {
              throw new Error(data.error);
            }
          }
        }
      }

    } catch (error) {
      console.error('Error analyzing contract:', error);
      handleAnalysisError(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalysisError = (error: unknown) => {
    let errorMessage = 'An unexpected error occurred. Please try again.';
    let errorType: ErrorDisplayType['type'] = 'error';

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

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-5xl font-bold mb-6 tracking-tight text-gray-900 text-center">
          Don't Sign Until<br />You're Sure
        </h1>
        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto text-center">
          Upload your contract, let AI highlight the risks and key terms.
        </p>

        <FileUploadArea 
          file={file}
          error={error}
          onFileSelect={handleFileSelect}
          isUploading={isAnalyzing && progress <= 2}
        />

        <div className="flex justify-center mt-6">
          <AnalysisButton
            isDisabled={!file || isAnalyzing}
            isAnalyzing={isAnalyzing}
            onClick={handleAnalyze}
          />
        </div>

        <AnalysisProgress 
          currentChunk={analysis?.metadata?.currentChunk ?? 0}
          totalChunks={analysis?.metadata?.totalChunks ?? 0}
          isAnalyzing={isAnalyzing}
          stage={stage}
          progress={progress}
        />

        {error && <ErrorDisplay error={error} />}
        {analysis && <AnalysisResults analysis={analysis} />}
      </div>
    </section>
  );
}