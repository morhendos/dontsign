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
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<'preprocessing' | 'analyzing' | 'complete'>('preprocessing');
  
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
    setProgress(1); // Show initial progress for upload
    setStage('preprocessing');

    try {
      // For PDFs, we validate and preload the document
      if (selectedFile.type === 'application/pdf') {
        // Validate PDF structure (this will also cache the PDF for later use)
        await readPdfText(selectedFile, true); // Added validateOnly parameter
      }
      
      setProgress(2); // Upload complete
      setFile(selectedFile);
      setAnalysis(null);
      setError(null);
    } catch (error) {
      console.error('Error processing uploaded file:', error);
      handleAnalysisError(error);
    } finally {
      setIsAnalyzing(false);
      setProgress(0); // Reset progress until analysis starts
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
    setProgress(2); // Start from 2% as upload is already done
    setStage('preprocessing');

    const startTime = Date.now();
    trackAnalysisStart(file.type);

    try {
      let text: string;
      if (file.type === 'application/pdf') {
        text = await readPdfText(file);
        setProgress(5); // PDF processing complete
      } else {
        text = await file.text();
        setProgress(5); // Text extraction complete
      }

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

      // Start analysis and handle progress updates
      const result = await analyzeContract(formData);
      
      // Look for progress updates in the console output
      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          const node = mutation.target as HTMLElement;
          const text = node.textContent || '';
          if (text.includes('"type":"progress"')) {
            try {
              const progressData = JSON.parse(text);
              if (progressData.type === 'progress') {
                setProgress(progressData.progress);
                setStage(progressData.stage);
                if (progressData.current && progressData.total) {
                  setAnalysis(prev => prev ? {
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      currentChunk: progressData.current,
                      totalChunks: progressData.total
                    }
                  } : prev);
                }
              }
            } catch (e) {
              console.error('Error parsing progress data:', e);
            }
          }
        }
      });

      // Start observing console output
      const consoleOutput = document.querySelector('#console-output');
      if (consoleOutput) {
        observer.observe(consoleOutput, { childList: true, subtree: true });
      }

      if (result) {
        setAnalysis(result);
        const analysisTime = (Date.now() - startTime) / 1000;
        trackAnalysisComplete(file.type, analysisTime);
        setProgress(100);
        setStage('complete');
      }

      // Cleanup observer
      observer.disconnect();

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