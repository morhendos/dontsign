import { useState, useCallback } from 'react';
import * as Sentry from '@sentry/nextjs';
import { analyzeContract } from '@/app/actions';
import { readPdfText } from '@/lib/pdf-utils';
import { PDFProcessingError, ContractAnalysisError } from '@/lib/errors';
import {
  trackAnalysisStart,
  trackAnalysisComplete,
  trackError,
  trackUserInteraction,
} from '@/lib/analytics-events';
import { AnalysisResult, ErrorDisplay } from '@/types/analysis';

export const useContractAnalysis = () => {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<ErrorDisplay | null>(null);

  const handleAnalyze = useCallback(async (file: File | null) => {
    if (!file) {
      const error = {
        message: 'Please upload a file before analyzing.',
        type: 'warning' as const,
      };
      setError(error);
      Sentry.addBreadcrumb({
        category: 'analysis',
        message: 'Analysis attempted without file',
        level: 'warning',
      });
      trackError('NO_FILE', 'Analysis attempted without file');
      return;
    }

    trackUserInteraction('analyze_click', file.type);
    setIsAnalyzing(true);
    setError(null);

    const startTime = Date.now();
    trackAnalysisStart(file.type);

    Sentry.addBreadcrumb({
      category: 'analysis',
      message: 'Starting contract analysis',
      level: 'info',
      data: {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      },
    });

    try {
      // Extract text based on file type
      let text: string;
      if (file.type === 'application/pdf') {
        text = await readPdfText(file);
      } else {
        text = await file.text();
      }

      Sentry.addBreadcrumb({
        category: 'analysis',
        message: 'Text extracted successfully',
        level: 'info',
        data: {
          textLength: text.length,
        },
      });

      // Create FormData with text content
      const formData = new FormData();
      formData.append('text', text);
      formData.append('filename', file.name);

      // Send for analysis
      const result = await analyzeContract(formData);

      if (result) {
        setAnalysis(result);
        const analysisTime = (Date.now() - startTime) / 1000; // Convert to seconds
        trackAnalysisComplete(file.type, analysisTime);

        Sentry.addBreadcrumb({
          category: 'analysis',
          message: 'Analysis completed successfully',
          level: 'info',
          data: {
            chunkCount: result.metadata?.totalChunks,
          },
        });
      } else {
        throw new ContractAnalysisError(
          'No analysis result received',
          'INVALID_INPUT'
        );
      }
    } catch (error) {
      console.error('Error analyzing contract:', error);

      if (error instanceof PDFProcessingError) {
        let errorMessage: string;
        switch (error.code) {
          case 'EMPTY_FILE':
            errorMessage = 'The PDF file appears to be empty.';
            break;
          case 'CORRUPT_FILE':
            errorMessage =
              'The PDF file appears to be corrupted. Please check the file and try again.';
            break;
          case 'NO_TEXT_CONTENT':
            errorMessage =
              'No readable text found in the PDF. The file might be scanned or image-based.';
            break;
          default:
            errorMessage =
              'Could not read the PDF file. Please ensure it\'s not encrypted or corrupted.';
        }
        setError({ message: errorMessage, type: 'error' });
        trackError('PDF_ERROR', error.code);
      } else if (error instanceof ContractAnalysisError) {
        let errorMessage: string;
        switch (error.code) {
          case 'API_ERROR':
            errorMessage =
              'The AI service is currently unavailable. Please try again later.';
            break;
          case 'INVALID_INPUT':
            errorMessage =
              'The document format is not supported. Please try a different file.';
            break;
          case 'TEXT_PROCESSING_ERROR':
            errorMessage =
              'Error processing the document text. Please try a simpler document.';
            break;
          default:
            errorMessage = `An error occurred: ${error.message}. Please try again.`;
        }
        setError({ message: errorMessage, type: 'error' });
        trackError('ANALYSIS_ERROR', error.code);
      } else {
        setError({
          message: 'An unexpected error occurred. Please try again.',
          type: 'error',
        });

        Sentry.captureException(error, {
          extra: {
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
          },
        });
        trackError(
          'UNKNOWN_ERROR',
          error instanceof Error ? error.message : 'Unknown error'
        );
      }
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const resetAnalysis = useCallback(() => {
    setAnalysis(null);
    setError(null);
    setIsAnalyzing(false);
  }, []);

  return {
    analysis,
    isAnalyzing,
    error,
    handleAnalyze,
    resetAnalysis,
  };
};
