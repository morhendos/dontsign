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
  const [processingStatus, setProcessingStatus] = useState<string>('');
  
  const timeoutRef = useRef<NodeJS.Timeout>();
  const readerRef = useRef<ReadableStreamDefaultReader | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (readerRef.current) {
        readerRef.current.cancel();
      }
    };
  }, []);

  const setStatusWithTimeout = (status: string, duration = 2000) => {
    setProcessingStatus(status);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => setProcessingStatus(''), duration);
  };

  const handleFileSelect = async (selectedFile: File | null) => {
    if (!selectedFile) {
      setError({
        message: 'Please select a valid PDF or DOCX file.',
        type: 'warning'
      });
      return;
    }

    setIsAnalyzing(true);
    setProgress(1);
    setStage('preprocessing');
    setStatusWithTimeout('Starting file processing...');

    try {
      if (selectedFile.type === 'application/pdf') {
        setStatusWithTimeout('Validating PDF document...');
        await readPdfText(selectedFile, true);
      }
      
      setProgress(2);
      setFile(selectedFile);
      setAnalysis(null);
      setError(null);
      setStatusWithTimeout('File processed successfully');
    } catch (error) {
      console.error('Error processing uploaded file:', error);
      handleAnalysisError(error);
    } finally {
      setIsAnalyzing(false);
      setProgress(0);
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