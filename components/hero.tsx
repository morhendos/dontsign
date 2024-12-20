'use client'

import { useState, useRef } from 'react'
import * as Sentry from '@sentry/nextjs';
import { Button } from '@/components/ui/button'
import { FileText, ArrowRight, Loader2, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { analyzeContract } from '@/app/actions'
import { readPdfText } from '@/lib/pdf-utils'
import { PDFProcessingError, ContractAnalysisError } from '@/lib/errors'
import { 
  trackFileUploadStart,
  trackFileUploadSuccess,
  trackFileValidationError,
  trackAnalysisStart,
  trackAnalysisError,
  trackTextExtraction
} from '@/lib/analytics-events';

// ... (existing interfaces)

export default function Hero() {
  // ... (existing state declarations)
  const analysisStartTime = useRef<number>(0);

  // ... (existing file upload handlers)

  const handleAnalyze = async () => {
    if (!file) {
      const error = {
        message: 'Please upload a file before analyzing.',
        type: 'warning' as const
      };
      setError(error);
      trackAnalysisError('NO_FILE', 'No file selected', 'unknown');
      Sentry.addBreadcrumb({
        category: 'analysis',
        message: 'Analysis attempted without file',
        level: 'warning'
      });
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    analysisStartTime.current = Date.now();

    // Track analysis start
    trackAnalysisStart(
      file.type === 'application/pdf' ? 'pdf' : 'docx',
      file.size
    );

    Sentry.addBreadcrumb({
      category: 'analysis',
      message: 'Starting contract analysis',
      level: 'info',
      data: {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size
      }
    });

    try {
      // Extract text based on file type
      let text: string;
      trackTextExtraction('start', file.type);
      const extractionStartTime = Date.now();
      
      if (file.type === 'application/pdf') {
        text = await readPdfText(file);
      } else {
        text = await file.text();
      }

      trackTextExtraction(
        'complete', 
        file.type, 
        Date.now() - extractionStartTime
      );

      Sentry.addBreadcrumb({
        category: 'analysis',
        message: 'Text extracted successfully',
        level: 'info',
        data: {
          textLength: text.length
        }
      });

      // Create FormData with text content
      const formData = new FormData();
      formData.append('text', text);
      formData.append('filename', file.name);

      // Send for analysis
      const result = await analyzeContract(formData);
      
      if (result) {
        setAnalysis(result);
        Sentry.addBreadcrumb({
          category: 'analysis',
          message: 'Analysis completed successfully',
          level: 'info',
          data: {
            chunkCount: result.metadata?.totalChunks
          }
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
            errorMessage = 'The PDF file appears to be corrupted. Please check the file and try again.';
            break;
          case 'NO_TEXT_CONTENT':
            errorMessage = 'No readable text found in the PDF. The file might be scanned or image-based.';
            break;
          default:
            errorMessage = 'Could not read the PDF file. Please ensure it\'s not encrypted or corrupted.';
        }
        setError({ message: errorMessage, type: 'error' });
        trackAnalysisError('PDF_PROCESSING', error.code, 'pdf');

      } else if (error instanceof ContractAnalysisError) {
        let errorMessage: string;
        switch (error.code) {
          case 'API_ERROR':
            errorMessage = 'The AI service is currently unavailable. Please try again later.';
            break;
          case 'INVALID_INPUT':
            errorMessage = 'The document format is not supported. Please try a different file.';
            break;
          case 'TEXT_PROCESSING_ERROR':
            errorMessage = 'Error processing the document text. Please try a simpler document.';
            break;
          default:
            errorMessage = `An error occurred: ${error.message}. Please try again.`;
        }
        setError({ message: errorMessage, type: 'error' });
        trackAnalysisError('CONTRACT_ANALYSIS', error.code, file.type);

      } else {
        setError({
          message: 'An unexpected error occurred. Please try again.',
          type: 'error'
        });

        trackAnalysisError(
          'UNKNOWN', 
          error instanceof Error ? error.message : 'Unknown error',
          file.type
        );

        Sentry.captureException(error, {
          extra: {
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size
          }
        });
      }
    } finally {
      setIsAnalyzing(false);
    }
  }

  // ... (rest of the component)
}