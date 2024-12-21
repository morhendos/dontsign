'use client';

import { useState, useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { analyzeContract } from '@/app/actions';
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
  const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null);
  
  const currentChunk = analysis?.metadata?.currentChunk ?? 0;
  const totalChunks = analysis?.metadata?.totalChunks ?? 0;

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [pollInterval]);

  const handleFileSelect = (selectedFile: File | null) => {
    if (!selectedFile) {
      setError({
        message: 'Please select a valid PDF or DOCX file.',
        type: 'warning'
      });
      return;
    }

    setFile(selectedFile);
    setAnalysis(null);
    setError(null);

    // Clear any existing polling
    if (pollInterval) {
      clearInterval(pollInterval);
      setPollInterval(null);
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

    setIsAnalyzing(true);
    setError(null);
    setAnalysis(null);

    const startTime = Date.now();
    trackAnalysisStart(file.type);

    try {
      let text: string;
      if (file.type === 'application/pdf') {
        text = await readPdfText(file);
      } else {
        text = await file.text();
      }

      const formData = new FormData();
      formData.append('text', text);
      formData.append('filename', file.name);

      // Get initial analysis state
      const initialResult = await analyzeContract(formData);
      if (initialResult) {
        setAnalysis(initialResult);

        // Set up polling for updates
        const interval = setInterval(async () => {
          try {
            const update = await analyzeContract(formData);
            if (update) {
              setAnalysis(update);
              
              // If analysis is complete, stop polling
              if (update.metadata?.currentChunk === update.metadata?.totalChunks) {
                clearInterval(interval);
                setPollInterval(null);
                const analysisTime = (Date.now() - startTime) / 1000;
                trackAnalysisComplete(file.type, analysisTime);
                setIsAnalyzing(false);
              }
            }
          } catch (error) {
            console.error('Error polling for updates:', error);
            clearInterval(interval);
            setPollInterval(null);
            handleAnalysisError(error);
            setIsAnalyzing(false);
          }
        }, 500);

        setPollInterval(interval);
      }
    } catch (error) {
      console.error('Error analyzing contract:', error);
      handleAnalysisError(error);
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
        />

        <div className="flex justify-center mt-6">
          <AnalysisButton
            isDisabled={!file || isAnalyzing}
            isAnalyzing={isAnalyzing}
            onClick={handleAnalyze}
          />
        </div>

        <AnalysisProgress 
          currentChunk={currentChunk}
          totalChunks={totalChunks}
          isAnalyzing={isAnalyzing}
        />

        {error && <ErrorDisplay error={error} />}
        {analysis && <AnalysisResults analysis={analysis} />}
      </div>
    </section>
  );
}